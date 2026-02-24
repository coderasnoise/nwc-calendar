import Link from "next/link";
import { listPatients } from "@/lib/data/patients";
import { type Patient } from "@/lib/types";
import { PatientSearchForm } from "@/components/patients/patient-search-form";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function PatientsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>;
}) {
  const { q, error, success } = await searchParams;

  let patientsError: string | null = null;
  let patients: Patient[] = [];

  try {
    patients = await listPatients(q);
  } catch (e) {
    patientsError = e instanceof Error ? e.message : "Failed to load patients";
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Patients</h2>
          <p className="mt-1 text-sm text-slate-500">Manage patient records and logistics in one place.</p>
        </div>
        <Link href="/patients/new" className={buttonStyles({ variant: "primary" })}>
          New Patient
        </Link>
      </div>

      <PatientSearchForm initialQuery={q ?? ""} />

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      {patientsError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{patientsError}</p>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Arrival</th>
                <th className="px-4 py-3 font-semibold">Surgery</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={6}>
                    {q?.trim()
                      ? "No patients matched your search."
                      : "No patients found."}
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={patient.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3 font-medium text-slate-800">{patient.full_name}</td>
                    <td className="px-4 py-3 text-slate-700">{patient.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{patient.arrival_date ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{patient.surgery_date ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={patient.transfer_arranged ? "positive" : "neutral"}>Transfer {patient.transfer_arranged ? "Y" : "N"}</Badge>
                        <Badge tone={patient.hotel_arranged ? "positive" : "neutral"}>Hotel {patient.hotel_arranged ? "Y" : "N"}</Badge>
                        <Badge tone={patient.booked_with_assistant ? "positive" : "neutral"}>Booked {patient.booked_with_assistant ? "Y" : "N"}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${patient.id}`} className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline">
                        View
                      </Link>
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
