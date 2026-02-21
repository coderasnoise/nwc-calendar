import { describe, expect, it } from "vitest";
import { patientSchema } from "./patient";

function basePatient() {
  return {
    full_name: "Jane Doe",
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
  };
}

describe("patientSchema transfer_arranged validation", () => {
  it("passes when transfer_arranged=true and required transfer fields are present", () => {
    const result = patientSchema.safeParse({
      ...basePatient(),
      transfer_arranged: true,
      arrival_date: "2026-02-01",
      arrival_flight_code: "TK100",
      transfer_driver_name: "Driver Name"
    });

    expect(result.success).toBe(true);
  });

  it("fails when transfer_arranged=true and arrival_date is missing", () => {
    const result = patientSchema.safeParse({
      ...basePatient(),
      transfer_arranged: true,
      arrival_date: null,
      arrival_flight_code: "TK100",
      transfer_driver_name: "Driver Name"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("arrival_date is required when transfer_arranged is enabled.");
    }
  });

  it("passes when transfer_arranged=false and transfer fields are missing", () => {
    const result = patientSchema.safeParse({
      ...basePatient(),
      transfer_arranged: false,
      arrival_date: null,
      arrival_flight_code: null,
      transfer_driver_name: null
    });

    expect(result.success).toBe(true);
  });
});
