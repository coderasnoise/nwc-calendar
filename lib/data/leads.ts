import "server-only";

import { createClient } from "@/lib/supabase/server";
import { type Lead, type LeadFollowup, type LeadStatus } from "@/lib/types";
import { type LeadFollowupInput, type LeadInput } from "@/lib/validators/lead";

export type LeadListSummary = {
  total: number;
  pendingReview: number;
  overdueFollowUps: number;
  quoted: number;
};

export async function listLeads(searchQuery?: string, status?: LeadStatus | "all") {
  const supabase = await createClient();

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);

  if (searchQuery && searchQuery.trim().length > 0) {
    const term = searchQuery.trim().replaceAll(",", " ");
    query = query.or(
      [
        `full_name.ilike.%${term}%`,
        `phone.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `country.ilike.%${term}%`,
        `procedure_interest.ilike.%${term}%`,
        `owner_name.ilike.%${term}%`,
        `notes.ilike.%${term}%`
      ].join(",")
    );
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Lead[];
}

export async function getLeadById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Lead | null;
}

export async function listLeadFollowups(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_followups")
    .select("*")
    .eq("lead_id", leadId)
    .order("follow_up_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LeadFollowup[];
}

export async function getLeadListSummary() {
  const leads = await listLeads();
  const today = new Date().toISOString().slice(0, 10);

  return leads.reduce<LeadListSummary>(
    (summary, lead) => {
      summary.total += 1;

      if (lead.boss_review_status === "pending") {
        summary.pendingReview += 1;
      }

      if (
        lead.follow_up_due_date &&
        lead.follow_up_due_date < today &&
        lead.follow_up_status !== "completed"
      ) {
        summary.overdueFollowUps += 1;
      }

      if (lead.quote_status === "sent" || lead.quote_status === "accepted") {
        summary.quoted += 1;
      }

      return summary;
    },
    {
      total: 0,
      pendingReview: 0,
      overdueFollowUps: 0,
      quoted: 0
    }
  );
}

export async function createLeadRecord(id: string, input: LeadInput) {
  const supabase = await createClient();
  const payload = {
    id,
    ...input,
    quote_amount: input.quote_amount === null ? null : input.quote_amount.toFixed(2)
  };

  const { data, error } = await supabase.from("leads").insert(payload).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateLeadRecord(id: string, input: LeadInput) {
  const supabase = await createClient();
  const payload = {
    ...input,
    quote_amount: input.quote_amount === null ? null : input.quote_amount.toFixed(2)
  };

  const { data, error } = await supabase.from("leads").update(payload).eq("id", id).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createLeadFollowup(input: LeadFollowupInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lead_followups").insert(input).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  const followUpStatus =
    input.status === "completed" && !input.next_due_date
      ? "completed"
      : input.next_due_date
        ? "scheduled"
        : "none";

  const { error: leadError } = await supabase
    .from("leads")
    .update({
      follow_up_due_date: input.next_due_date,
      follow_up_status: followUpStatus
    })
    .eq("id", input.lead_id);

  if (leadError) {
    throw new Error(leadError.message);
  }

  return data;
}
