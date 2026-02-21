import { type PatientInput } from "@/lib/validators/patient";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeDateString(value: string) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeTimeString(value: string) {
  if (!value) {
    return null;
  }

  const hhmm = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (hhmm) {
    return value;
  }

  const hhmmss = value.match(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/);
  if (hhmmss) {
    return value.slice(0, 5);
  }

  return value;
}

function getNullableString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getNullableDateString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return normalizeDateString(value);
}

function getNullableTimeString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return normalizeTimeString(value);
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function patientInputFromFormData(
  formData: FormData,
  existingPassportPath: string | null
): PatientInput {
  return {
    full_name: getTrimmedString(formData, "full_name"),
    phone: getTrimmedString(formData, "phone"),
    arrival_date: getNullableDateString(formData, "arrival_date"),
    arrival_time: getNullableTimeString(formData, "arrival_time"),
    arrival_airport: (getNullableString(formData, "arrival_airport") as "IST" | "SAW" | null) ?? null,
    arrival_flight_code: getNullableString(formData, "arrival_flight_code"),
    consultation_date: getNullableDateString(formData, "consultation_date"),
    surgery_date: getNullableDateString(formData, "surgery_date"),
    surgeries_text: getNullableString(formData, "surgeries_text"),
    return_date: getNullableDateString(formData, "return_date"),
    return_time: getNullableTimeString(formData, "return_time"),
    return_flight_code: getNullableString(formData, "return_flight_code"),
    transfer_arranged: getBoolean(formData, "transfer_arranged"),
    transfer_driver_name: getNullableString(formData, "transfer_driver_name"),
    hotel_arranged: getBoolean(formData, "hotel_arranged"),
    hotel_room_type: getNullableString(formData, "hotel_room_type"),
    booked_with_assistant: getBoolean(formData, "booked_with_assistant"),
    patient_passport_number: getNullableString(formData, "patient_passport_number"),
    patient_passport_photo_path: existingPassportPath,
    companion_full_name: getNullableString(formData, "companion_full_name"),
    companion_passport_number: getNullableString(formData, "companion_passport_number")
  };
}
