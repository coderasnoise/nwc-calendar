import { z } from "zod";

export const leadSourceSchema = z.enum(["meta", "whatsapp", "email", "referral", "walk_in", "other"]);
export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "awaiting_review",
  "review_ready",
  "quoted",
  "follow_up",
  "booked",
  "lost"
]);
export const leadContactChannelSchema = z.enum(["whatsapp", "phone", "email", "other"]);
export const bossReviewStatusSchema = z.enum([
  "not_requested",
  "pending",
  "approved",
  "needs_info",
  "declined"
]);
export const quoteStatusSchema = z.enum(["not_prepared", "drafted", "sent", "accepted", "declined"]);
export const quoteCurrencySchema = z.enum(["GBP", "EUR", "USD", "TRY"]);
export const followUpStatusSchema = z.enum(["none", "scheduled", "overdue", "completed"]);
export const leadFollowupEntryStatusSchema = z.enum(["scheduled", "completed", "canceled"]);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const nullableDateSchema = z
  .string()
  .regex(dateRegex, "Date must be in YYYY-MM-DD format")
  .nullable();

const nullableDateTimeSchema = z
  .string()
  .regex(isoDateTimeRegex, "Date/time must be in YYYY-MM-DDTHH:mm format")
  .nullable();

const nullableString = (max: number) => z.string().max(max).nullable();

export const leadSchema = z
  .object({
    full_name: z.string().min(1).max(255),
    phone: z.string().min(1).max(50),
    email: z.string().email("Email must be valid").max(255).nullable(),
    source: leadSourceSchema,
    country: nullableString(100),
    procedure_interest: nullableString(255),
    status: leadStatusSchema,
    owner_name: nullableString(255),
    first_contact_at: nullableDateTimeSchema,
    first_contact_channel: leadContactChannelSchema.nullable(),
    first_contact_summary: nullableString(5000),
    boss_review_status: bossReviewStatusSchema,
    boss_review_requested_at: nullableDateTimeSchema,
    boss_review_completed_at: nullableDateTimeSchema,
    consultation_summary: nullableString(5000),
    medical_summary: nullableString(5000),
    quote_status: quoteStatusSchema,
    quote_amount: z.number().min(0).max(9999999.99).nullable(),
    quote_currency: quoteCurrencySchema.nullable(),
    quote_summary: nullableString(5000),
    follow_up_due_date: nullableDateSchema,
    follow_up_owner_name: nullableString(255),
    follow_up_status: followUpStatusSchema,
    lost_reason: nullableString(1000),
    notes: nullableString(5000)
  })
  .superRefine((data, ctx) => {
    if (data.boss_review_status === "pending" && !data.boss_review_requested_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["boss_review_requested_at"],
        message: "boss_review_requested_at is required when review is pending."
      });
    }

    if (data.quote_status !== "not_prepared" && data.quote_amount === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quote_amount"],
        message: "quote_amount is required once a quote exists."
      });
    }

    if (data.quote_status !== "not_prepared" && !data.quote_currency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quote_currency"],
        message: "quote_currency is required once a quote exists."
      });
    }

    if (data.follow_up_status === "scheduled" && !data.follow_up_due_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["follow_up_due_date"],
        message: "follow_up_due_date is required when follow_up_status is scheduled."
      });
    }

    if (data.status === "lost" && !data.lost_reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lost_reason"],
        message: "lost_reason is required when a lead is marked lost."
      });
    }
  });

export const leadFollowupSchema = z.object({
  lead_id: z.string().uuid(),
  follow_up_date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  channel: leadContactChannelSchema,
  status: leadFollowupEntryStatusSchema,
  summary: z.string().min(1).max(5000),
  next_due_date: nullableDateSchema
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadFollowupInput = z.infer<typeof leadFollowupSchema>;
