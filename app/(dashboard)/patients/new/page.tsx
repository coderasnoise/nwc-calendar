import Link from "next/link";
import { PatientForm } from "@/components/patients/patient-form";
import { createPatientAction } from "@/app/(dashboard)/patients/actions";
import { buttonStyles } from "@/components/ui/button";

export default async function NewPatientPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">New Patient</h2>
          <p className="mt-1 text-sm text-slate-500">Create a new patient record.</p>
        </div>
        <Link href="/patients" className={buttonStyles({ variant: "ghost" })}>
          Back to list
        </Link>
      </div>
      <PatientForm action={createPatientAction} mode="create" error={error} />
    </section>
  );
}
