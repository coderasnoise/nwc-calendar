import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AuditActionFilter = "insert" | "update" | "delete" | "all";

export type AuditFilters = {
  from?: string;
  to?: string;
  action?: AuditActionFilter;
  patient?: string;
};

type AuditLogRow = {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  actor_user_id: string | null;
  timestamp: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
};

type PatientLookupRow = {
  id: string;
  full_name: string;
};

export type AuditListItem = {
  id: string;
  timestamp: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  actorUserId: string | null;
  actorEmail: string | null;
  patientName: string;
  changedFields: string[];
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
};

function changedFieldsSummary(entry: AuditLogRow) {
  if (entry.action === "INSERT") {
    return ["created record"];
  }
  if (entry.action === "DELETE") {
    return ["deleted record"];
  }

  const oldData: Record<string, unknown> = entry.old_data ?? {};
  const newData: Record<string, unknown> = entry.new_data ?? {};
  const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  const changed = Array.from(keys).filter((key) => {
    const before = oldData[key];
    const after = newData[key];
    return JSON.stringify(before) !== JSON.stringify(after);
  });

  return changed.length > 0 ? changed : ["no field changes"];
}

function getPatientName(entry: AuditLogRow, patientNameMap: Map<string, string>) {
  const fromTable = patientNameMap.get(entry.record_id);
  if (fromTable) {
    return fromTable;
  }

  const fromNew = entry.new_data?.full_name;
  if (typeof fromNew === "string" && fromNew.length > 0) {
    return fromNew;
  }

  const fromOld = entry.old_data?.full_name;
  if (typeof fromOld === "string" && fromOld.length > 0) {
    return fromOld;
  }

  return "Unknown patient";
}

export async function listAuditLogs(filters: AuditFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select("id, table_name, record_id, action, actor_user_id, timestamp, old_data, new_data")
    .eq("table_name", "patients")
    .order("timestamp", { ascending: false })
    .limit(300);

  if (filters.action && filters.action !== "all") {
    query = query.eq("action", filters.action.toUpperCase());
  }

  if (filters.from) {
    query = query.gte("timestamp", `${filters.from}T00:00:00.000Z`);
  }

  if (filters.to) {
    query = query.lte("timestamp", `${filters.to}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AuditLogRow[];

  const patientIds = Array.from(new Set(rows.map((r) => r.record_id)));
  const patientNameMap = new Map<string, string>();

  if (patientIds.length > 0) {
    const { data: patientsData } = await supabase
      .from("patients")
      .select("id, full_name")
      .in("id", patientIds);

    (patientsData as PatientLookupRow[] | null)?.forEach((patient) => {
      patientNameMap.set(patient.id, patient.full_name);
    });
  }

  let items: AuditListItem[] = rows.map((entry) => ({
    id: entry.id,
    timestamp: entry.timestamp,
    action: entry.action,
    actorUserId: entry.actor_user_id,
    actorEmail:
      (typeof entry.new_data?.actor_email === "string" ? entry.new_data.actor_email : null) ??
      (typeof entry.old_data?.actor_email === "string" ? entry.old_data.actor_email : null),
    patientName: getPatientName(entry, patientNameMap),
    changedFields: changedFieldsSummary(entry),
    oldData: entry.old_data,
    newData: entry.new_data
  }));

  if (filters.patient && filters.patient.trim().length > 0) {
    const queryText = filters.patient.toLowerCase();
    items = items.filter((item) => item.patientName.toLowerCase().includes(queryText));
  }

  return items;
}
