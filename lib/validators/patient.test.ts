import { describe, expect, it } from "vitest";
import { patientSchema } from "./patient";

describe("patientSchema", () => {
  it("accepts a minimal valid patient", () => {
    const result = patientSchema.safeParse({
      full_name: "John Doe",
      phone: "+905551112233",
      arrival_date: null,
      arrival_time: null,
      arrival_airport: null,
      arrival_flight_code: null,
      consultation_date: null,
      surgery_date: null,
      surgeries_text: null,
      return_date: null,
      return_time: null,
      return_flight_code: null,
      transfer_arranged: false,
      transfer_driver_name: null,
      hotel_arranged: false,
      hotel_room_type: null,
      booked_with_assistant: false,
      patient_passport_number: null,
      patient_passport_photo_path: null,
      companion_full_name: null,
      companion_passport_number: null
    });

    expect(result.success).toBe(true);
  });
});
