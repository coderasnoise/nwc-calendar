import { z } from "zod";

export const airportSchema = z.enum(["IST", "SAW"]);

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
    return_flight_code: z.string().max(50).nullable(),
    transfer_arranged: z.boolean().default(false),
    transfer_driver_name: z.string().max(255).nullable(),
    hotel_arranged: z.boolean().default(false),
    hotel_room_type: z.string().max(255).nullable(),
    booked_with_assistant: z.boolean().default(false),
    patient_passport_number: z.string().max(50).nullable(),
    patient_passport_photo_path: z.string().max(1024).nullable(),
    companion_full_name: z.string().max(255).nullable(),
    companion_passport_number: z.string().max(50).nullable()
  })
  .superRefine((data, ctx) => {
    if (!data.transfer_arranged) {
      return;
    }

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
  });

export type PatientInput = z.infer<typeof patientSchema>;
