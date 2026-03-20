import { type LeadFollowupInput, type LeadInput } from "@/lib/validators/lead";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getNullableDateString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getNullableDateTimeString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getNullableNumber(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function leadInputFromFormData(formData: FormData): LeadInput {
  return {
    full_name: getTrimmedString(formData, "full_name"),
    phone: getTrimmedString(formData, "phone"),
    email: getNullableString(formData, "email"),
    source: getTrimmedString(formData, "source") as LeadInput["source"],
    country: getNullableString(formData, "country"),
    procedure_interest: getNullableString(formData, "procedure_interest"),
    status: getTrimmedString(formData, "status") as LeadInput["status"],
    owner_name: getNullableString(formData, "owner_name"),
    first_contact_at: getNullableDateTimeString(formData, "first_contact_at"),
    first_contact_channel: getNullableString(formData, "first_contact_channel") as LeadInput["first_contact_channel"],
    first_contact_summary: getNullableString(formData, "first_contact_summary"),
    boss_review_status: getTrimmedString(formData, "boss_review_status") as LeadInput["boss_review_status"],
    boss_review_requested_at: getNullableDateTimeString(formData, "boss_review_requested_at"),
    boss_review_completed_at: getNullableDateTimeString(formData, "boss_review_completed_at"),
    consultation_summary: getNullableString(formData, "consultation_summary"),
    medical_summary: getNullableString(formData, "medical_summary"),
    quote_status: getTrimmedString(formData, "quote_status") as LeadInput["quote_status"],
    quote_amount: getNullableNumber(formData, "quote_amount"),
    quote_currency: getNullableString(formData, "quote_currency") as LeadInput["quote_currency"],
    quote_summary: getNullableString(formData, "quote_summary"),
    follow_up_due_date: getNullableDateString(formData, "follow_up_due_date"),
    follow_up_owner_name: getNullableString(formData, "follow_up_owner_name"),
    follow_up_status: getTrimmedString(formData, "follow_up_status") as LeadInput["follow_up_status"],
    lost_reason: getNullableString(formData, "lost_reason"),
    notes: getNullableString(formData, "notes")
  };
}

export function leadFollowupInputFromFormData(formData: FormData): LeadFollowupInput {
  return {
    lead_id: getTrimmedString(formData, "lead_id"),
    follow_up_date: getTrimmedString(formData, "follow_up_date"),
    channel: getTrimmedString(formData, "channel") as LeadFollowupInput["channel"],
    status: getTrimmedString(formData, "status") as LeadFollowupInput["status"],
    summary: getTrimmedString(formData, "summary"),
    next_due_date: getNullableDateString(formData, "next_due_date")
  };
}
