import Link from "next/link";
import { notFound } from "next/navigation";
import { getPassportPhotoLinks, getPatientById } from "@/lib/data/patients";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function displayValue(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "—";
  }
  return value;
}

function displayBool(value: boolean) {
  return value ? "Yes" : "No";
}

function displayPaymentMethod(value: "cash" | "bank_transfer" | "card" | null | undefined) {
  if (!value) {
    return "—";
  }

  if (value === "bank_transfer") {
    return "Bank Transfer";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

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
  const selectedSurgeries = patient.surgeries_selected ?? [];

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
          <Badge tone={patient.return_transfer_arranged ? "positive" : "neutral"}>
            Return Transfer {patient.return_transfer_arranged ? "Y" : "N"}
          </Badge>
          <Badge tone={patient.hotel_arranged ? "positive" : "neutral"}>Hotel {patient.hotel_arranged ? "Y" : "N"}</Badge>
          <Badge tone={patient.booked_with_assistant ? "positive" : "neutral"}>Booked {patient.booked_with_assistant ? "Y" : "N"}</Badge>
          {redFlag ? <Badge tone="alert">Red Flag</Badge> : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Core</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Full Name</dt>
              <dd>{displayValue(patient.full_name)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd>{displayValue(patient.phone)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Travel</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Arrival Date</dt>
              <dd>{displayValue(patient.arrival_date)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival Time</dt>
              <dd>{displayValue(patient.arrival_time)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival Airport</dt>
              <dd>{displayValue(patient.arrival_airport)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival Flight</dt>
              <dd>{displayValue(patient.arrival_flight_code)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Return Date</dt>
              <dd>{displayValue(patient.return_date)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Return Time</dt>
              <dd>{displayValue(patient.return_time)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Return Transfer Arranged</dt>
              <dd>{displayBool(patient.return_transfer_arranged)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Medical</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Consultation Date</dt>
              <dd>{displayValue(patient.consultation_date)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Surgery Date</dt>
              <dd>{displayValue(patient.surgery_date)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Surgeries</dt>
              <dd>{selectedSurgeries.length > 0 ? selectedSurgeries.join(", ") : "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Additional Notes</dt>
              <dd>{displayValue(patient.surgeries_text)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Logistics</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Transfer Arranged</dt>
              <dd>{displayBool(patient.transfer_arranged)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Transfer Driver Name</dt>
              <dd>{displayValue(patient.transfer_driver_name)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Hotel Arranged</dt>
              <dd>{displayBool(patient.hotel_arranged)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Hotel Room Type</dt>
              <dd>{displayValue(patient.hotel_room_type)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Booked with Assistant</dt>
              <dd>{displayBool(patient.booked_with_assistant)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Companion</h3>
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-slate-500">Companion Name and Number</dt>
              <dd>{displayValue(patient.companion_full_name)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Passport</h3>
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-slate-500">Patient P Number</dt>
              <dd>{displayValue(patient.patient_passport_number)}</dd>
            </div>
            {patient.patient_passport_photo_path ? (
              <div>
                <dt className="text-slate-500">Passport Photo Path</dt>
                <dd className="break-all text-slate-700">{patient.patient_passport_photo_path}</dd>
              </div>
            ) : null}
          </dl>
          {patient.patient_passport_photo_path ? (
            photoLinks ? (
              <div className="flex gap-2">
                <a href={photoLinks.viewUrl} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "secondary" })}>
                  View
                </a>
                <a href={photoLinks.downloadUrl} className={buttonStyles({ variant: "ghost" })}>
                  Download
                </a>
              </div>
            ) : (
              <p className="text-sm text-red-700">{photoError ?? "Photo not available"}</p>
            )
          ) : null}
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Payment</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Method</dt>
              <dd>{displayPaymentMethod(patient.payment_method)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Currency</dt>
              <dd>{displayValue(patient.payment_currency)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount</dt>
              <dd>
                {patient.payment_amount === null || patient.payment_amount === undefined
                  ? "—"
                  : String(patient.payment_amount)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </section>
  );
}
