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
  duplicate: boolean;
};

type PreviewResponse = {
  mode: "preview";
  totals: {
    eventsFound: number;
    validRows: number;
    duplicateRows: number;
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

async function postImportForm(file: File, mode: "preview" | "import", skipDuplicates: boolean) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("mode", mode);
  formData.set("skipDuplicates", String(skipDuplicates));

  const response = await fetch("/api/import/ics", {
    method: "POST",
    body: formData
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Import request failed.");
  }

  return body as PreviewResponse | ImportResponse;
}

export function IcsImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [totals, setTotals] = useState<PreviewResponse["totals"] | null>(null);

  const validRows = useMemo(() => rows.filter((row) => row.full_name && row.surgery_date), [rows]);

  async function handlePreview() {
    if (!file) {
      setError("Please choose an .ics file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await postImportForm(file, "preview", skipDuplicates);
      if (result.mode !== "preview") {
        throw new Error("Unexpected preview response.");
      }

      setRows(result.rows);
      setTotals(result.totals);
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
      const result = await postImportForm(file, "import", skipDuplicates);
      if (result.mode !== "import") {
        throw new Error("Unexpected import response.");
      }

      setSuccess(
        `Imported ${result.totals.imported} row(s). Skipped ${result.totals.skipped} row(s) (${result.totals.duplicateSkipped} duplicate).`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
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
        </div>

        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
        ) : null}
      </Card>

      {totals ? (
        <Card className="p-4">
          <p className="text-sm text-slate-700">
            Found <strong>{totals.eventsFound}</strong> event(s), valid rows <strong>{totals.validRows}</strong>, duplicates <strong>{totals.duplicateRows}</strong>.
          </p>
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
                <th className="px-4 py-3 font-semibold">Duplicate</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={5}>
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
                    <td className="px-4 py-3">{row.duplicate ? "Yes" : "No"}</td>
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
