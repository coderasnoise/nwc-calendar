import { z } from "zod";

export const airportSchema = z.enum(["IST", "SAW"]);
export const paymentMethodSchema = z.enum(["cash", "bank_transfer", "card"]);
export const paymentCurrencySchema = z.enum(["GBP", "AUD", "USD", "EUR"]);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const nullableDateSchema = z
  .string()
  .regex(dateRegex, "Date must be in YYYY-MM-DD format")
  .nullable();

const nullableTimeSchema = z
  .string()
  .regex(timeRegex, "Time must be in HH:mm format")
  .nullable();

export const patientSchema = z
  .object({
    full_name: z.string().min(1).max(255),
    phone: z.string().min(1).max(30),
    arrival_date: nullableDateSchema,
    arrival_time: nullableTimeSchema,
    arrival_airport: airportSchema.nullable(),
    arrival_flight_code: z.string().max(50).nullable(),
    consultation_date: nullableDateSchema,
    surgery_date: nullableDateSchema,
    surgeries_text: z.string().max(5000).nullable(),
    return_date: nullableDateSchema,
    return_time: nullableTimeSchema,
    transfer_arranged: z.boolean().default(false),
    transfer_driver_name: z.string().max(255).nullable(),
    hotel_arranged: z.boolean().default(false),
    hotel_room_type: z.string().max(255).nullable(),
    booked_with_assistant: z.boolean().default(false),
    patient_passport_number: z.string().max(50).nullable(),
    patient_passport_photo_path: z.string().max(1024).nullable().optional(),
    companion_full_name: z.string().max(255).nullable(),
    companion_passport_number: z.string().max(50).nullable().optional(),
    payment_method: paymentMethodSchema.nullable(),
    payment_currency: paymentCurrencySchema.nullable(),
    payment_amount: z.number().nonnegative().max(1000000000).nullable()
  })
  .superRefine((data, ctx) => {
    if (data.transfer_arranged) {
      if (!data.arrival_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["arrival_date"],
          message: "arrival_date is required when transfer_arranged is enabled."
        });
      }

      if (!data.arrival_flight_code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["arrival_flight_code"],
          message: "arrival_flight_code is required when transfer_arranged is enabled."
        });
      }

      if (!data.transfer_driver_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transfer_driver_name"],
          message: "transfer_driver_name is required when transfer_arranged is enabled."
        });
      }
    }

    const hasAnyPayment = Boolean(data.payment_method || data.payment_currency || data.payment_amount !== null);
    if (!hasAnyPayment) {
      return;
    }

    if (!data.payment_method) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_method"],
        message: "payment_method is required when adding payment details."
      });
    }

    if (!data.payment_currency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_currency"],
        message: "payment_currency is required when adding payment details."
      });
    }

    if (data.payment_amount === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_amount"],
        message: "payment_amount is required when adding payment details."
      });
    }
  });

export type PatientInput = z.infer<typeof patientSchema>;
