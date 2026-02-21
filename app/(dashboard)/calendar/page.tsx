import { PatientCalendarModule } from "@/components/calendar/patient-calendar-module";
import { listPatients } from "@/lib/data/patients";

export default async function CalendarPage() {
  const patients = await listPatients();

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Calendar</h2>
        <p className="mt-1 text-sm text-slate-500">Monthly names-only view and weekly logistics cards.</p>
      </div>
      <PatientCalendarModule patients={patients} />
    </section>
  );
}
