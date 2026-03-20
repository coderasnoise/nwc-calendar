export type EventTypeFilter = "arrival" | "consultation" | "surgery" | "return";

export type LeadSource = "meta" | "whatsapp" | "email" | "referral" | "walk_in" | "other";
export type LeadStatus =
  | "new"
  | "contacted"
  | "awaiting_review"
  | "review_ready"
  | "quoted"
  | "follow_up"
  | "booked"
  | "lost";
export type LeadContactChannel = "whatsapp" | "phone" | "email" | "other";
export type BossReviewStatus = "not_requested" | "pending" | "approved" | "needs_info" | "declined";
export type QuoteStatus = "not_prepared" | "drafted" | "sent" | "accepted" | "declined";
export type QuoteCurrency = "GBP" | "EUR" | "USD" | "TRY";
export type FollowUpStatus = "none" | "scheduled" | "overdue" | "completed";
export type LeadFollowupEntryStatus = "scheduled" | "completed" | "canceled";

export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  arrival_date: string | null;
  arrival_time: string | null;
  arrival_airport: "IST" | "SAW" | null;
  arrival_flight_code: string | null;
  consultation_date: string | null;
  surgery_date: string | null;
  surgeries_text: string | null;
  return_date: string | null;
  return_time: string | null;
  return_flight_code: string | null;
  transfer_arranged: boolean;
  transfer_driver_name: string | null;
  hotel_arranged: boolean;
  hotel_room_type: string | null;
  booked_with_assistant: boolean;
  patient_passport_number: string | null;
  patient_passport_photo_path: string | null;
  companion_full_name: string | null;
  companion_passport_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  actor_user_id: string | null;
  changed_columns: string[] | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  country: string | null;
  procedure_interest: string | null;
  status: LeadStatus;
  owner_name: string | null;
  first_contact_at: string | null;
  first_contact_channel: LeadContactChannel | null;
  first_contact_summary: string | null;
  boss_review_status: BossReviewStatus;
  boss_review_requested_at: string | null;
  boss_review_completed_at: string | null;
  consultation_summary: string | null;
  medical_summary: string | null;
  quote_status: QuoteStatus;
  quote_amount: number | null;
  quote_currency: QuoteCurrency | null;
  quote_summary: string | null;
  follow_up_due_date: string | null;
  follow_up_owner_name: string | null;
  follow_up_status: FollowUpStatus;
  lost_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface LeadFollowup {
  id: string;
  lead_id: string;
  follow_up_date: string;
  channel: LeadContactChannel;
  status: LeadFollowupEntryStatus;
  summary: string;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
