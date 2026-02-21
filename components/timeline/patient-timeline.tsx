import Link from "next/link";
import { updateTimelineToggleAction } from "@/app/(dashboard)/timeline/actions";
import { type Patient } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Props = {
  patients: Patient[];
};

function toggleButton(
  patientId: string,
  field: "transfer_arranged" | "hotel_arranged" | "booked_with_assistant",
  current: boolean,
  label: string
) {
  return (
    <form action={updateTimelineToggleAction}>
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!current)} />
      <button
        type="submit"
        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
          current
            ? "border-emerald-200 bg-emerald-100 text-emerald-700"
            : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {label}: {current ? "Y" : "N"}
      </button>
    </form>
  );
}

function dateMarker(label: string, value: string | null) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
      <span className="font-medium text-slate-600">{label}:</span> {value ?? "-"}
    </div>
  );
}

export function PatientTimeline({ patients }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          {patients.map((patient, index) => {
            const redFlag = Boolean(patient.arrival_date && (!patient.transfer_arranged || !patient.hotel_arranged));

            return (
              <div
                key={patient.id}
                className={`grid grid-cols-[220px,1fr] border-b border-slate-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                }`}
              >
                <div
                  className={`sticky left-0 z-10 border-r border-slate-200 px-4 py-4 ${
                    redFlag ? "bg-red-50" : index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  }`}
                >
                  <Link href={`/patients/${patient.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
                    {patient.full_name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{patient.phone}</p>
                  {redFlag ? <Badge tone="alert" className="mt-2">Red Flag</Badge> : null}
                </div>

                <div className={`space-y-3 px-4 py-4 ${redFlag ? "border-l-2 border-l-red-300" : ""}`}>
                  <div className="flex flex-wrap gap-2">
                    {dateMarker("Arrival", patient.arrival_date)}
                    {dateMarker("Consultation", patient.consultation_date)}
                    {dateMarker("Surgery", patient.surgery_date)}
                    {dateMarker("Return", patient.return_date)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {toggleButton(patient.id, "transfer_arranged", patient.transfer_arranged, "Transfer")}
                    {toggleButton(patient.id, "hotel_arranged", patient.hotel_arranged, "Hotel")}
                    {toggleButton(patient.id, "booked_with_assistant", patient.booked_with_assistant, "Booked")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
