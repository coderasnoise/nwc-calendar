export type EventTypeFilter = "arrival" | "consultation" | "surgery" | "return";

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
