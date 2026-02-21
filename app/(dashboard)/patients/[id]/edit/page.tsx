import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePatientAction } from "@/app/(dashboard)/patients/actions";
import { PatientForm } from "@/components/patients/patient-form";
import { buttonStyles } from "@/components/ui/button";
import { getPatientById } from "@/lib/data/patients";

export default async function EditPatientPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Edit Patient</h2>
          <p className="mt-1 text-sm text-slate-500">Update patient and logistics details.</p>
        </div>
        <Link href={`/patients/${id}`} className={buttonStyles({ variant: "ghost" })}>
          Back to detail
        </Link>
      </div>
      <PatientForm action={updatePatientAction} mode="edit" patient={patient} error={error} />
    </section>
  );
}
