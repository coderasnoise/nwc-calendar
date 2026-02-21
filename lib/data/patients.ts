import "server-only";

import { createClient } from "@/lib/supabase/server";
import { type Patient } from "@/lib/types";
import { type PatientInput } from "@/lib/validators/patient";

function normalizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function listPatients(phoneQuery?: string) {
  const supabase = await createClient();

  let query = supabase.from("patients").select("*").order("created_at", { ascending: false });

  if (phoneQuery && phoneQuery.trim().length > 0) {
    query = query.ilike("phone", `%${phoneQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Patient[];
}

export async function listPatientsForTimeline() {
  const patients = await listPatients();

  return [...patients].sort((a, b) => {
    if (!a.arrival_date && !b.arrival_date) {
      return a.full_name.localeCompare(b.full_name);
    }
    if (!a.arrival_date) {
      return 1;
    }
    if (!b.arrival_date) {
      return -1;
    }
    if (a.arrival_date === b.arrival_date) {
      return a.full_name.localeCompare(b.full_name);
    }
    return a.arrival_date.localeCompare(b.arrival_date);
  });
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
