"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updatePatientToggleField } from "@/lib/data/patients";

const toggleSchema = z.object({
  patient_id: z.string().uuid(),
  field: z.enum(["transfer_arranged", "hotel_arranged", "booked_with_assistant"]),
  value: z.enum(["true", "false"]).transform((v) => v === "true")
});

export async function updateTimelineToggleAction(formData: FormData) {
  const parsed = toggleSchema.safeParse({
    patient_id: String(formData.get("patient_id") ?? ""),
    field: String(formData.get("field") ?? ""),
    value: String(formData.get("value") ?? "")
  });

  if (!parsed.success) {
    redirect("/timeline?error=Invalid%20toggle%20payload");
  }

  try {
    await updatePatientToggleField(parsed.data.patient_id, parsed.data.field, parsed.data.value);
    revalidatePath("/timeline");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update toggle";
    redirect(`/timeline?error=${encodeURIComponent(message)}`);
  }
}
