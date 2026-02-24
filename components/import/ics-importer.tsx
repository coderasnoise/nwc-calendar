"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type PreviewRow = {
  sourceKey: string;
  surgery_date: string;
  full_name: string;
  phone: string | null;
  notes: string | null;
  event_uid: string | null;
  status: "NEW" | "EXISTS";
  matched_patient_id: string | null;
};

type PreviewResponse = {
  mode: "preview";
  totals: {
    eventsFound: number;
    validRows: number;
    existsRows: number;
  };
  rows: PreviewRow[];
};

type ImportResponse = {
  mode: "import";
  totals: {
    eventsFound: number;
    validRows: number;
    imported: number;
    skipped: number;
    duplicateSkipped: number;
  };
};

type DeleteResponse = {
  deleted: number;
};

async function postPreview(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/import/ics/preview", {
    method: "POST",
    body: formData
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Import request failed.");
  }

  return body as PreviewResponse;
}

async function postImport(file: File, skipDuplicates: boolean) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("skipDuplicates", String(skipDuplicates));

  const response = await fetch("/api/import/ics/import", {
    method: "POST",
    body: formData
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Import request failed.");
  }

  return body as ImportResponse;
}

async function postDelete(payload: { mode: "selected" | "all"; patientIds?: string[] }) {
  const response = await fetch("/api/import/ics/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Delete request failed.");
  }

  return body as DeleteResponse;
}

export function IcsImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [totals, setTotals] = useState<PreviewResponse["totals"] | null>(null);

  const validRows = useMemo(() => rows.filter((row) => row.full_name && row.surgery_date), [rows]);
  const existsRows = useMemo(() => rows.filter((row) => row.status === "EXISTS"), [rows]);

  function toggleSelectedDelete(patientId: string, checked: boolean) {
    setSelectedDeleteIds((prev) => {
      if (checked) {
        return prev.includes(patientId) ? prev : [...prev, patientId];
      }
      return prev.filter((id) => id !== patientId);
    });
  }

  async function refreshPreview() {
    if (!file) {
      return;
    }
    const result = await postPreview(file);
    setRows(result.rows);
    setTotals(result.totals);
    const allowedIds = new Set(
      result.rows
        .filter((row) => row.status === "EXISTS" && row.matched_patient_id)
        .map((row) => row.matched_patient_id as string)
    );
    setSelectedDeleteIds((prev) => prev.filter((id) => allowedIds.has(id)));
  }

  async function handlePreview() {
    if (!file) {
      setError("Please choose an .ics file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedDeleteIds([]);

    try {
      await refreshPreview();
    } catch (e) {
      setRows([]);
      setTotals(null);
      setError(e instanceof Error ? e.message : "Failed to parse file.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file) {
      setError("Please choose an .ics file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await postImport(file, skipDuplicates);

      setSuccess(
        `Imported ${result.totals.imported} row(s). Skipped ${result.totals.skipped} row(s) (${result.totals.duplicateSkipped} duplicate).`
      );
      await refreshPreview();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSelected() {
    if (selectedDeleteIds.length === 0) {
      return;
    }

    const confirmation = window.prompt("Type DELETE to confirm deleting selected imported rows.");
    if (confirmation !== "DELETE") {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await postDelete({ mode: "selected", patientIds: selectedDeleteIds });
      setSuccess(`Deleted ${result.deleted} imported patient row(s).`);
      await refreshPreview();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAllImported() {
    const confirmation = window.prompt("Type DELETE to remove all previously imported Google ICS patients.");
    if (confirmation !== "DELETE") {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await postDelete({ mode: "all" });
      setSuccess(`Deleted ${result.deleted} imported patient row(s) from source google_ics.`);
      await refreshPreview();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <Card className="space-y-4 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Upload Google Calendar .ics file</h3>
          <p className="mt-1 text-xs text-slate-500">
            Title maps to patient name. Description maps to phone + notes. Event date maps to surgery date.
          </p>
        </div>

        <Input
          type="file"
          accept=".ics,.ical,text/calendar"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <Checkbox checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} />
          Skip duplicates (recommended)
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handlePreview} disabled={loading}>
            Parse & Preview
          </Button>
          <Button type="button" onClick={handleImport} disabled={loading || validRows.length === 0}>
            Import
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleDeleteSelected}
            disabled={loading || selectedDeleteIds.length === 0}
          >
            Delete selected existing
          </Button>
        </div>

        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
        ) : null}
      </Card>

      {totals ? (
        <Card className="p-4">
          <p className="text-sm text-slate-700">
            Found <strong>{totals.eventsFound}</strong> event(s), valid rows <strong>{totals.validRows}</strong>, existing matches <strong>{totals.existsRows}</strong>.
          </p>
        </Card>
      ) : null}

      {existsRows.length > 0 ? (
        <Card className="space-y-3 border-red-200 bg-red-50/40 p-4">
          <div>
            <h3 className="text-sm font-semibold text-red-700">Danger zone</h3>
            <p className="mt-1 text-xs text-red-600">
              Deletes only rows imported from Google ICS (`import_source = google_ics`).
            </p>
          </div>
          <Button type="button" onClick={handleDeleteAllImported} disabled={loading}>
            Delete ALL previously imported Google ICS patients
          </Button>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Delete existing</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={6}>
                    Parse a file to preview rows.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.sourceKey} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3">{row.surgery_date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.full_name}</td>
                    <td className="px-4 py-3">{row.phone ?? "-"}</td>
                    <td className="max-w-md truncate px-4 py-3" title={row.notes ?? ""}>
                      {row.notes ?? "-"}
                    </td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">
                      {row.status === "EXISTS" && row.matched_patient_id ? (
                        <Checkbox
                          checked={selectedDeleteIds.includes(row.matched_patient_id)}
                          onChange={(event) => toggleSelectedDelete(row.matched_patient_id as string, event.target.checked)}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
