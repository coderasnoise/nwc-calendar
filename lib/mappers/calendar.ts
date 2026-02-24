import { type Patient } from "@/lib/types";

export type CalendarFilter = "arrival" | "consultation" | "surgery" | "return";

export type PatientCalendarEvent = {
  id: string;
  patientId: string;
  fullName: string;
  date: string;
  allDay: true;
  redFlag: boolean;
  matchedTypes: CalendarFilter[];
  patient: Patient;
};

type Filters = Record<CalendarFilter, boolean>;

function collectMatchedTypes(patient: Patient, filters: Filters) {
  const matched: Array<{ type: CalendarFilter; date: string }> = [];

  if (filters.arrival && patient.arrival_date) {
    matched.push({ type: "arrival", date: patient.arrival_date });
  }
  if (filters.consultation && patient.consultation_date) {
    matched.push({ type: "consultation", date: patient.consultation_date });
  }
  if (filters.surgery && patient.surgery_date) {
    matched.push({ type: "surgery", date: patient.surgery_date });
  }
  if (filters.return && patient.return_date) {
    matched.push({ type: "return", date: patient.return_date });
  }

  return matched;
}

export function mapPatientsToCalendarEvents(patients: Patient[], filters: Filters) {
  const deduped = new Map<string, PatientCalendarEvent>();

  patients.forEach((patient) => {
    const redFlag = Boolean(
      patient.arrival_date && (!patient.transfer_arranged || !patient.hotel_arranged)
    );

    const matched = collectMatchedTypes(patient, filters);
    matched.forEach(({ type, date }) => {
      const key = `${patient.id}-${date}`;
      const existing = deduped.get(key);

      if (existing) {
        if (!existing.matchedTypes.includes(type)) {
          existing.matchedTypes.push(type);
        }
        return;
      }

      deduped.set(key, {
        id: key,
        patientId: patient.id,
        fullName: patient.full_name,
        date,
        allDay: true,
        redFlag,
        matchedTypes: [type],
        patient
      });
    });
  });

  return Array.from(deduped.values()).sort((a, b) => {
    if (a.date === b.date) {
      return a.fullName.localeCompare(b.fullName);
    }
    return a.date.localeCompare(b.date);
  });
}
