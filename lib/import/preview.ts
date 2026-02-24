import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  normalizeName,
  normalizePhone,
  parseIcsContent,
  type ParsedImportRow
} from "@/lib/import/ics";

export type ImportPreviewRow = {
  sourceKey: string;
  surgery_date: string;
  full_name: string;
  phone: string | null;
  notes: string | null;
  event_uid: string | null;
  status: "NEW" | "EXISTS";
  matched_patient_id: string | null;
};

type ExistingImportedPatientRow = {
  id: string;
  full_name: string;
  surgery_date: string | null;
  phone: string;
  import_event_uid: string | null;
  import_source: string | null;
};

function matchExistingImportedPatient(row: ParsedImportRow, existing: ExistingImportedPatientRow[]) {
  if (row.event_uid) {
    const byUid = existing.find(
      (patient) => patient.import_source === "google_ics" && patient.import_event_uid === row.event_uid
    );
    if (byUid) {
      return byUid;
    }
  }

  const normalizedName = normalizeName(row.full_name);
  const normalizedImportPhone = normalizePhone(row.phone);

  return (
    existing.find((patient) => {
      if (patient.import_source !== "google_ics") {
        return false;
      }

      if (!patient.surgery_date || patient.surgery_date !== row.surgery_date) {
        return false;
      }

      if (normalizeName(patient.full_name) !== normalizedName) {
        return false;
      }

      if (!normalizedImportPhone) {
        return true;
      }

      return normalizePhone(patient.phone) === normalizedImportPhone;
    }) ?? null
  );
}

async function fetchExistingImportedPatients(rows: ParsedImportRow[]) {
  const dates = Array.from(new Set(rows.map((row) => row.surgery_date)));
  const uids = Array.from(
    new Set(rows.map((row) => row.event_uid).filter((uid): uid is string => Boolean(uid)))
  );

  if (dates.length === 0 && uids.length === 0) {
    return [] as ExistingImportedPatientRow[];
  }

  const supabase = await createClient();
  const merged = new Map<string, ExistingImportedPatientRow>();

  if (dates.length > 0) {
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name, surgery_date, phone, import_event_uid, import_source")
      .eq("import_source", "google_ics")
      .in("surgery_date", dates);

    if (error) {
      throw new Error(error.message);
    }

    (data ?? []).forEach((row) => {
      const typed = row as ExistingImportedPatientRow;
      merged.set(typed.id, typed);
    });
  }

  if (uids.length > 0) {
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name, surgery_date, phone, import_event_uid, import_source")
      .eq("import_source", "google_ics")
      .in("import_event_uid", uids);

    if (error) {
      throw new Error(error.message);
    }

    (data ?? []).forEach((row) => {
      const typed = row as ExistingImportedPatientRow;
      merged.set(typed.id, typed);
    });
  }

  return Array.from(merged.values());
}

export async function buildIcsPreview(icsText: string) {
  const parsed = await parseIcsContent(icsText);
  const validRows = parsed.rows.filter((row) => row.full_name && row.surgery_date);
  const existingPatients = await fetchExistingImportedPatients(validRows);

  const rows: ImportPreviewRow[] = validRows.map((row) => {
    const existingMatch = matchExistingImportedPatient(row, existingPatients);

    return {
      sourceKey: row.sourceKey,
      surgery_date: row.surgery_date,
      full_name: row.full_name,
      phone: row.phone,
      notes: row.notes,
      event_uid: row.event_uid,
      status: existingMatch ? "EXISTS" : "NEW",
      matched_patient_id: existingMatch?.id ?? null
    };
  });

  return {
    eventsFound: parsed.eventsFound,
    rows
  };
}
