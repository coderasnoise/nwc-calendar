import { IcsImporter } from "@/components/import/ics-importer";

export default function ImportPage() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Import .ics</h2>
        <p className="mt-1 text-sm text-slate-500">Import Google Calendar export data into patient surgery entries.</p>
      </div>
      <IcsImporter />
    </section>
  );
}
