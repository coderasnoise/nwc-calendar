"use server";

import { redirect } from "next/navigation";
import {
  createPatientRecord,
  getPatientById,
  updatePatientRecord,
  uploadPassportPhoto
} from "@/lib/data/patients";
import { patientInputFromFormData } from "@/lib/patients/form-data";
import { patientSchema } from "@/lib/validators/patient";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  const messages = Array.from(new Set(error.issues.map((issue) => issue.message)));
  return messages.join(" ");
}

export async function createPatientAction(formData: FormData) {
  const patientId = crypto.randomUUID();

  const parsed = patientSchema.safeParse(patientInputFromFormData(formData, null));
  if (!parsed.success) {
    redirect(`/patients/new?error=${encodeURIComponent(formatZodError(parsed.error))}`);
  }

  try {
    const passportFile = formData.get("patient_passport_photo");
    let passportPath: string | null = null;

    if (passportFile instanceof File && passportFile.size > 0) {
      passportPath = await uploadPassportPhoto(patientId, passportFile);
    }

    await createPatientRecord(patientId, {
      ...parsed.data,
      patient_passport_photo_path: passportPath
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create patient";
    redirect(`/patients/new?error=${encodeURIComponent(message)}`);
  }

  redirect(`/patients/${patientId}`);
}

export async function updatePatientAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/patients?error=Invalid%20patient%20id");
  }

  const existingPassportPath =
    String(formData.get("existing_passport_photo_path") ?? "").trim() || null;

  const parsed = patientSchema.safeParse(patientInputFromFormData(formData, existingPassportPath));
  if (!parsed.success) {
    redirect(`/patients/${id}/edit?error=${encodeURIComponent(formatZodError(parsed.error))}`);
  }

  try {
    let passportPath = parsed.data.patient_passport_photo_path;
    const passportFile = formData.get("patient_passport_photo");

    if (passportFile instanceof File && passportFile.size > 0) {
      passportPath = await uploadPassportPhoto(id, passportFile);
    }

    await updatePatientRecord(id, {
      ...parsed.data,
      patient_passport_photo_path: passportPath
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update patient";
    redirect(`/patients/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  redirect(`/patients/${id}`);
}

export async function ensurePatientExists(id: string) {
  const patient = await getPatientById(id);
  if (!patient) {
    redirect("/patients?error=Patient%20not%20found");
  }
  return patient;
}
