"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import { type EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { mapPatientsToCalendarEvents, type CalendarFilter } from "@/lib/mappers/calendar";
import { type Patient } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Props = {
  patients: Patient[];
};

type FilterState = Record<CalendarFilter, boolean>;

const defaultFilters: FilterState = {
  arrival: true,
  consultation: true,
  surgery: true,
  return: true
};

function boolToYN(value: boolean) {
  return value ? "Y" : "N";
}

function FilterPill({
  label,
  checked,
  onClick
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

export function PatientCalendarModule({ patients }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const events = useMemo(() => {
    return mapPatientsToCalendarEvents(patients, filters).map((event) => ({
      id: event.id,
      title: event.fullName,
      start: event.date,
      allDay: true,
      extendedProps: {
        patientId: event.patientId,
        redFlag: event.redFlag,
        patient: event.patient
      }
    }));
  }, [patients, filters]);

  function toggleFilter(filter: CalendarFilter) {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  }

  function renderEventContent(arg: EventContentArg) {
    const isMonth = arg.view.type === "dayGridMonth";
    const redFlag = Boolean(arg.event.extendedProps.redFlag);

    if (isMonth) {
      return (
        <div className={`truncate text-xs leading-4 ${redFlag ? "text-red-700" : "text-slate-800"}`}>
          {arg.event.title}
        </div>
      );
    }

    const patient = arg.event.extendedProps.patient as Patient;

    return (
      <article
        className={`space-y-1 rounded-md border p-2 text-[11px] leading-4 ${
          redFlag ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
        }`}
      >
        <p className="truncate font-semibold text-slate-900">{patient.full_name}</p>
        <p className="text-slate-600">Phone: {patient.phone}</p>
        <div className="flex flex-wrap gap-1">
          <Badge tone={patient.transfer_arranged ? "positive" : "neutral"}>Transfer {boolToYN(patient.transfer_arranged)}</Badge>
          <Badge tone={patient.hotel_arranged ? "positive" : "neutral"}>Hotel {boolToYN(patient.hotel_arranged)}</Badge>
          <Badge tone={patient.booked_with_assistant ? "positive" : "neutral"}>Booked {boolToYN(patient.booked_with_assistant)}</Badge>
        </div>
        <p className="text-slate-600">Arrival date: {patient.arrival_date ?? "-"}</p>
        <p className="text-slate-600">Surgeries: {patient.surgeries_text ?? "-"}</p>
        <p className="text-slate-600">
          Arrival: {patient.arrival_airport ?? "-"} {patient.arrival_time ?? "-"} {patient.arrival_flight_code ?? "-"}
        </p>
        <p className="text-slate-600">
          Return: {patient.return_time ?? "-"} {patient.return_flight_code ?? "-"}
        </p>
      </article>
    );
  }

  return (
    <section className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Filters</p>
        <div className="flex flex-wrap gap-2">
          <FilterPill label="Arrivals" checked={filters.arrival} onClick={() => toggleFilter("arrival")} />
          <FilterPill
            label="Consultations"
            checked={filters.consultation}
            onClick={() => toggleFilter("consultation")}
          />
          <FilterPill label="Surgeries" checked={filters.surgery} onClick={() => toggleFilter("surgery")} />
          <FilterPill label="Returns" checked={filters.return} onClick={() => toggleFilter("return")} />
        </div>
      </Card>

      <Card className="overflow-hidden p-3 sm:p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek"
          }}
          events={events}
          eventContent={renderEventContent}
          dayMaxEvents={3}
          moreLinkContent={(args) => `+${args.num} more`}
          eventClick={(arg) => {
            arg.jsEvent.preventDefault();
            router.push(`/patients/${arg.event.extendedProps.patientId}`);
          }}
          eventClassNames={() => ["cursor-pointer"]}
          moreLinkClassNames="text-xs text-blue-700 hover:underline"
          height="auto"
        />
      </Card>
    </section>
  );
}
