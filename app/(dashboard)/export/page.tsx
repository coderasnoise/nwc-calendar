import Link from "next/link";
import { listPatientsForFollowUpExport } from "@/lib/data/patients";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function isValidDate(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function ExportPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string; to?: string; error?: string }>;
}) {
  const { from, to, error } = await searchParams;
  const canQuery = isValidDate(from) && isValidDate(to);

  let rows: Awaited<ReturnType<typeof listPatientsForFollowUpExport>> = [];
  let loadError: string | null = null;

  if (canQuery && from && to) {
    try {
      rows = await listPatientsForFollowUpExport(from, to);
    } catch (cause) {
      loadError = cause instanceof Error ? cause.message : "Failed to load export preview.";
    }
  }

  const downloadHref = canQuery && from && to ? `/api/export/follow-up?from=${from}&to=${to}` : null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Follow-up Export</h2>
          <p className="mt-1 text-sm text-slate-500">
            Download patient names and phone numbers for surgeries in a selected date range.
          </p>
        </div>
        {downloadHref ? (
          <Link href={downloadHref} className={buttonStyles({ variant: "primary" })}>
            Download Excel
          </Link>
        ) : null}
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="text-sm font-medium text-slate-700">
            From
            <Input type="date" name="from" defaultValue={from ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            To
            <Input type="date" name="to" defaultValue={to ?? ""} className="mt-1" />
          </label>
          <button type="submit" className={buttonStyles({ variant: "secondary" })}>
            Preview
          </button>
        </form>
      </Card>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loadError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
      ) : null}

      {canQuery ? (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
            {rows.length} patient{rows.length === 1 ? "" : "s"} found between {from} and {to}.
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Surgery Date</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={3}>
                      No surgeries found in this date range.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="px-4 py-3">{row.surgery_date}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{row.full_name}</td>
                      <td className="px-4 py-3">{row.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-4 text-sm text-slate-500">
          Select a date range to preview the exportable patient list.
        </Card>
      )}
    </section>
  );
}
