import "server-only";

import { createClient } from "@/lib/supabase/server";
import { type Patient, type SurgeryOption } from "@/lib/types";
import { type PatientInput } from "@/lib/validators/patient";

function normalizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getPatientSortDate(patient: Patient) {
  const dates = [
    patient.arrival_date,
    patient.consultation_date,
    patient.surgery_date,
    patient.return_date
  ].filter((value): value is string => Boolean(value));

  if (dates.length === 0) {
    return null;
  }

  return [...dates].sort((a, b) => a.localeCompare(b))[0];
}

function sortPatientsByNearestDate(patients: Patient[]) {
  return [...patients].sort((a, b) => {
    const aDate = getPatientSortDate(a);
    const bDate = getPatientSortDate(b);

    if (!aDate && !bDate) {
      return a.full_name.localeCompare(b.full_name);
    }

    if (!aDate) {
      return 1;
    }

    if (!bDate) {
      return -1;
    }

    if (aDate === bDate) {
      return a.full_name.localeCompare(b.full_name);
    }

    return aDate.localeCompare(bDate);
  });
}

export async function listPatients(searchQuery?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchQuery && searchQuery.trim().length > 0) {
    const term = searchQuery.trim().replaceAll(",", " ");
    query = query.or(
      [
        `full_name.ilike.%${term}%`,
        `phone.ilike.%${term}%`,
        `patient_passport_number.ilike.%${term}%`,
        `companion_full_name.ilike.%${term}%`,
        `arrival_flight_code.ilike.%${term}%`,
        `arrival_airport.ilike.%${term}%`,
        `surgeries_text.ilike.%${term}%`
      ].join(",")
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return sortPatientsByNearestDate((data ?? []) as Patient[]);
}

export async function listSurgeryOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("surgery_options")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SurgeryOption[];
}

export async function listPatientsForTimeline() {
  const patients = await listPatients();
  return sortPatientsByNearestDate(patients);
}

export async function getPatientById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Patient | null;
}

export async function createPatientRecord(id: string, input: PatientInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("patients").insert({ id, ...input }).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePatientRecord(id: string, input: PatientInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .update(input)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deletePatientRecord(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("patients").delete().eq("id", id).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Patient not found");
  }

  return data;
}

export async function updatePatientToggleField(
  id: string,
  field: "transfer_arranged" | "hotel_arranged" | "booked_with_assistant",
  value: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase.from("patients").update({ [field]: value }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadPassportPhoto(patientId: string, file: File) {
  const supabase = await createClient();
  const filename = normalizeFilename(file.name || "passport-file");
  const path = `patients/${patientId}/passport/${Date.now()}-${filename}`;

  const { error } = await supabase.storage.from("passport-photos").upload(path, file, {
    contentType: file.type || undefined,
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function getPassportPhotoLinks(path: string) {
  const supabase = await createClient();

  const { data: viewData, error: viewError } = await supabase.storage
    .from("passport-photos")
    .createSignedUrl(path, 3600);

  if (viewError) {
    throw new Error(viewError.message);
  }
  if (!viewData?.signedUrl) {
    throw new Error("Could not generate view URL");
  }

  const { data: downloadData, error: downloadError } = await supabase.storage
    .from("passport-photos")
    .createSignedUrl(path, 3600, { download: true });

  if (downloadError) {
    throw new Error(downloadError.message);
  }
  if (!downloadData?.signedUrl) {
    throw new Error("Could not generate download URL");
  }

  return {
    viewUrl: viewData.signedUrl,
    downloadUrl: downloadData.signedUrl
  };
}
