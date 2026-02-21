import "server-only";

import { createClient } from "@/lib/supabase/server";

export type DashboardPatient = {
  id: string;
  full_name: string;
  phone: string;
  arrival_date: string | null;
  arrival_time: string | null;
  arrival_airport: "IST" | "SAW" | null;
  arrival_flight_code: string | null;
  consultation_date: string | null;
  surgery_date: string | null;
  return_date: string | null;
  return_time: string | null;
  return_flight_code: string | null;
  transfer_arranged: boolean;
  hotel_arranged: boolean;
  booked_with_assistant: boolean;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDashboardWindow() {
  const today = new Date();
  const start = toLocalDateString(today);
  const end = toLocalDateString(addDays(today, 7));
  return { start, end };
}

export async function listDashboardPatients(start: string, end: string) {
  const supabase = await createClient();

  const dateWindowFilter = [
    `and(arrival_date.gte.${start},arrival_date.lte.${end})`,
    `and(consultation_date.gte.${start},consultation_date.lte.${end})`,
    `and(surgery_date.gte.${start},surgery_date.lte.${end})`,
    `and(return_date.gte.${start},return_date.lte.${end})`
  ].join(",");

  const { data, error } = await supabase
    .from("patients")
    .select(
      "id,full_name,phone,arrival_date,arrival_time,arrival_airport,arrival_flight_code,consultation_date,surgery_date,return_date,return_time,return_flight_code,transfer_arranged,hotel_arranged,booked_with_assistant"
    )
    .or(dateWindowFilter)
    .order("arrival_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DashboardPatient[];
}
