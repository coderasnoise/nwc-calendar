import Link from "next/link";
import { notFound } from "next/navigation";
import { getPassportPhotoLinks, getPatientById } from "@/lib/data/patients";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function PatientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  let photoLinks: { viewUrl: string; downloadUrl: string } | null = null;
  let photoError: string | null = null;

  if (patient.patient_passport_photo_path) {
    try {
      photoLinks = await getPassportPhotoLinks(patient.patient_passport_photo_path);
    } catch (e) {
      photoError = e instanceof Error ? e.message : "Failed to load photo links";
    }
  }

  const redFlag = Boolean(patient.arrival_date && (!patient.transfer_arranged || !patient.hotel_arranged));

  return (
    <section className="space-y-5">
      <Card className={`space-y-4 ${redFlag ? "border-red-200" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{patient.full_name}</h2>
            <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/patients" className={buttonStyles({ variant: "ghost" })}>
              Back
            </Link>
            <Link href={`/patients/${patient.id}/edit`} className={buttonStyles({ variant: "secondary" })}>
              Edit
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone={patient.transfer_arranged ? "positive" : "neutral"}>Transfer {patient.transfer_arranged ? "Y" : "N"}</Badge>
          <Badge tone={patient.hotel_arranged ? "positive" : "neutral"}>Hotel {patient.hotel_arranged ? "Y" : "N"}</Badge>
          <Badge tone={patient.booked_with_assistant ? "positive" : "neutral"}>Booked {patient.booked_with_assistant ? "Y" : "N"}</Badge>
          {redFlag ? <Badge tone="alert">Red Flag</Badge> : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Travel</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Arrival Date</dt>
              <dd>{patient.arrival_date ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival Time</dt>
              <dd>{patient.arrival_time ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival Airport</dt>
              <dd>{patient.arrival_airport ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival Flight</dt>
              <dd>{patient.arrival_flight_code ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Return Date</dt>
              <dd>{patient.return_date ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Return Flight</dt>
              <dd>{patient.return_flight_code ?? "-"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Medical & Passport</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Consultation</dt>
              <dd>{patient.consultation_date ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Surgery</dt>
              <dd>{patient.surgery_date ?? "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Surgeries Text</dt>
              <dd>{patient.surgeries_text ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Passport Number</dt>
              <dd>{patient.patient_passport_number ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Companion</dt>
              <dd>{patient.companion_full_name ?? "-"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Passport Photo</h3>
        {photoLinks ? (
          <div className="flex gap-2">
            <a href={photoLinks.viewUrl} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "secondary" })}>
              View
            </a>
            <a href={photoLinks.downloadUrl} className={buttonStyles({ variant: "ghost" })}>
              Download
            </a>
          </div>
        ) : patient.patient_passport_photo_path ? (
          <p className="text-sm text-red-700">{photoError ?? "Photo not available"}</p>
        ) : (
          <p className="text-sm text-slate-500">No photo uploaded.</p>
        )}
      </Card>
    </section>
  );
}
