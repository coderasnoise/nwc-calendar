"use server";

import { redirect } from "next/navigation";
import {
  createLeadFollowup,
  createLeadRecord,
  getLeadById,
  updateLeadRecord
} from "@/lib/data/leads";
import { leadFollowupInputFromFormData, leadInputFromFormData } from "@/lib/leads/form-data";
import { leadFollowupSchema, leadSchema } from "@/lib/validators/lead";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  const messages = Array.from(new Set(error.issues.map((issue) => issue.message)));
  return messages.join(" ");
}

export async function createLeadAction(formData: FormData) {
  const leadId = crypto.randomUUID();
  const parsed = leadSchema.safeParse(leadInputFromFormData(formData));

  if (!parsed.success) {
    redirect(`/leads/new?error=${encodeURIComponent(formatZodError(parsed.error))}`);
  }

  try {
    await createLeadRecord(leadId, parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create lead";
    redirect(`/leads/new?error=${encodeURIComponent(message)}`);
  }

  redirect(`/leads/${leadId}`);
}

export async function updateLeadAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/leads?error=Invalid%20lead%20id");
  }

  const parsed = leadSchema.safeParse(leadInputFromFormData(formData));

  if (!parsed.success) {
    redirect(`/leads/${id}/edit?error=${encodeURIComponent(formatZodError(parsed.error))}`);
  }

  try {
    await updateLeadRecord(id, parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update lead";
    redirect(`/leads/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  redirect(`/leads/${id}`);
}

export async function addLeadFollowupAction(formData: FormData) {
  const leadId = String(formData.get("lead_id") ?? "").trim();
  if (!leadId) {
    redirect("/leads?error=Invalid%20lead%20id");
  }

  const parsed = leadFollowupSchema.safeParse(leadFollowupInputFromFormData(formData));

  if (!parsed.success) {
    redirect(`/leads/${leadId}?error=${encodeURIComponent(formatZodError(parsed.error))}`);
  }

  try {
    await createLeadFollowup(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save follow-up";
    redirect(`/leads/${leadId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/leads/${leadId}`);
}

export async function ensureLeadExists(id: string) {
  const lead = await getLeadById(id);
  if (!lead) {
    redirect("/leads?error=Lead%20not%20found");
  }

  return lead;
}
