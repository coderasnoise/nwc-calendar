import { PatientTimeline } from "@/components/timeline/patient-timeline";
import { listPatientsForTimeline } from "@/lib/data/patients";

export default async function TimelinePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const patients = await listPatientsForTimeline();

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Timeline</h2>
        <p className="mt-1 text-sm text-slate-500">Scan key dates and update operational toggles quickly.</p>
      </div>
      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <PatientTimeline patients={patients} />
    </section>
  );
}
