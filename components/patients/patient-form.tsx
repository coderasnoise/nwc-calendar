import { type Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type PatientFormProps = {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  error?: string;
  patient?: Patient;
};

function formatDateInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function formatTimeInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const hhmm = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (hhmm) {
    return value;
  }

  const hhmmss = value.match(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/);
  if (hhmmss) {
    return value.slice(0, 5);
  }

  return "";
}

function SectionTitle({ title, helper }: { title: string; helper?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

export function PatientForm({ action, mode, error, patient }: PatientFormProps) {
  return (
    <form action={action} encType="multipart/form-data" className="space-y-4">
      {mode === "edit" ? <input type="hidden" name="id" value={patient?.id ?? ""} /> : null}
      <input
        type="hidden"
        name="existing_passport_photo_path"
        value={mode === "edit" ? patient?.patient_passport_photo_path ?? "" : ""}
      />

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <Card className="p-4">
        <SectionTitle title="Patient" helper="Basic profile fields." />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Full Name*
            <Input name="full_name" required defaultValue={patient?.full_name ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone*
            <Input name="phone" required defaultValue={patient?.phone ?? ""} className="mt-1" />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Travel" helper="Arrival and return planning details." />
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Arrival Date
            <Input
              type="date"
              name="arrival_date"
              defaultValue={formatDateInputValue(patient?.arrival_date)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Arrival Time
            <Input
              type="time"
              name="arrival_time"
              defaultValue={formatTimeInputValue(patient?.arrival_time)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Arrival Airport
            <Select name="arrival_airport" defaultValue={patient?.arrival_airport ?? ""} className="mt-1">
              <option value="">Select</option>
              <option value="IST">IST</option>
              <option value="SAW">SAW</option>
            </Select>
          </label>

          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Arrival Flight Code
            <Input name="arrival_flight_code" defaultValue={patient?.arrival_flight_code ?? ""} className="mt-1" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Return Date
            <Input
              type="date"
              name="return_date"
              defaultValue={formatDateInputValue(patient?.return_date)}
              className="mt-1"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Return Time
            <Input
              type="time"
              name="return_time"
              defaultValue={formatTimeInputValue(patient?.return_time)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Return Flight Code
            <Input name="return_flight_code" defaultValue={patient?.return_flight_code ?? ""} className="mt-1" />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Medical" helper="Consultation and surgery information." />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Consultation Date
            <Input
              type="date"
              name="consultation_date"
              defaultValue={formatDateInputValue(patient?.consultation_date)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Surgery Date
            <Input
              type="date"
              name="surgery_date"
              defaultValue={formatDateInputValue(patient?.surgery_date)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Surgeries Text
            <textarea
              name="surgeries_text"
              defaultValue={patient?.surgeries_text ?? ""}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Logistics" helper="Operational checkboxes and assignments." />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Transfer Driver Name
            <Input name="transfer_driver_name" defaultValue={patient?.transfer_driver_name ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Hotel Room Type
            <Input name="hotel_room_type" defaultValue={patient?.hotel_room_type ?? ""} className="mt-1" />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-700">
            <Checkbox name="transfer_arranged" defaultChecked={patient?.transfer_arranged ?? false} />
            Transfer arranged
          </label>
          <label className="inline-flex items-center gap-2 text-slate-700">
            <Checkbox name="hotel_arranged" defaultChecked={patient?.hotel_arranged ?? false} />
            Hotel arranged
          </label>
          <label className="inline-flex items-center gap-2 text-slate-700">
            <Checkbox
              name="booked_with_assistant"
              defaultChecked={patient?.booked_with_assistant ?? false}
            />
            Booked with assistant
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Passport & Companion" helper="Identity and storage files." />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Patient Passport Number
            <Input
              name="patient_passport_number"
              defaultValue={patient?.patient_passport_number ?? ""}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Companion Full Name
            <Input name="companion_full_name" defaultValue={patient?.companion_full_name ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Companion Passport Number
            <Input
              name="companion_passport_number"
              defaultValue={patient?.companion_passport_number ?? ""}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Passport Photo
            <Input type="file" name="patient_passport_photo" accept="image/*,.pdf" className="mt-1" />
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">{mode === "create" ? "Create Patient" : "Save Changes"}</Button>
      </div>
    </form>
  );
}
