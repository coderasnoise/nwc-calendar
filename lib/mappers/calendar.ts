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

export type MonthCellEvent = {
  id: string;
  patientId: string;
  name: string;
  date: string;
  kind: CalendarFilter;
};

type Filters = Record<CalendarFilter, boolean>;
const kindOrder: CalendarFilter[] = ["arrival", "consultation", "surgery", "return"];

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

export function mapPatientsToMonthCellEvents(patients: Patient[], filters: Filters) {
  const events: MonthCellEvent[] = [];

  patients.forEach((patient) => {
    if (filters.arrival && patient.arrival_date) {
      events.push({
        id: `${patient.id}-${patient.arrival_date}-arrival`,
        patientId: patient.id,
        name: patient.full_name,
        date: patient.arrival_date,
        kind: "arrival"
      });
    }

    if (filters.consultation && patient.consultation_date) {
      events.push({
        id: `${patient.id}-${patient.consultation_date}-consultation`,
        patientId: patient.id,
        name: patient.full_name,
        date: patient.consultation_date,
        kind: "consultation"
      });
    }

    if (filters.surgery && patient.surgery_date) {
      events.push({
        id: `${patient.id}-${patient.surgery_date}-surgery`,
        patientId: patient.id,
        name: patient.full_name,
        date: patient.surgery_date,
        kind: "surgery"
      });
    }

    if (filters.return && patient.return_date) {
      events.push({
        id: `${patient.id}-${patient.return_date}-return`,
        patientId: patient.id,
        name: patient.full_name,
        date: patient.return_date,
        kind: "return"
      });
    }
  });

  return events.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    const kindDiff = kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind);
    if (kindDiff !== 0) {
      return kindDiff;
    }

    return a.name.localeCompare(b.name);
  });
}
