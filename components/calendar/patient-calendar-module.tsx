"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import { type DatesSetArg, type EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { mapPatientsToCalendarEvents, type CalendarFilter } from "@/lib/mappers/calendar";
import { type Patient } from "@/lib/types";
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

const monthRowStyles: Record<CalendarFilter, string> = {
  arrival: "bg-red-500 text-white hover:bg-red-600",
  consultation: "bg-blue-500 text-white hover:bg-blue-600",
  surgery: "bg-green-500 text-white hover:bg-green-600",
  return: "bg-yellow-400 text-black hover:bg-yellow-500"
};

const monthRowLabels: Record<CalendarFilter, string> = {
  arrival: "Arrival",
  consultation: "Consultation",
  surgery: "Surgery",
  return: "Return"
};

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
  const [currentView, setCurrentView] = useState("dayGridMonth");

  const events = useMemo(() => {
    return mapPatientsToCalendarEvents(patients, filters).map((event) => ({
      id: event.id,
      title: event.fullName,
      start: event.date,
      allDay: true,
      extendedProps: {
        patientId: event.patientId,
        redFlag: event.redFlag,
        patient: event.patient,
        matchedTypes: event.matchedTypes
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
      const matchedTypes = (arg.event.extendedProps.matchedTypes as CalendarFilter[] | undefined) ?? [];

      return (
        <div className="space-y-0.5">
          {matchedTypes.map((type) => (
            <span
              key={`${arg.event.id}-${type}`}
              title={monthRowLabels[type]}
              className={`block truncate rounded-md px-2 py-1 text-xs font-medium leading-4 transition-colors ${monthRowStyles[type]}`}
            >
              {arg.event.title}
            </span>
          ))}
        </div>
      );
    }

    const patient = arg.event.extendedProps.patient as Patient;
    const arrivalLineParts = [patient.arrival_airport, patient.arrival_time, patient.arrival_flight_code].filter(
      Boolean
    ) as string[];
    const returnLineParts = [patient.return_time].filter(Boolean) as string[];

    return (
      <article
        className={`box-border min-w-0 w-full overflow-hidden whitespace-normal break-words rounded-md border bg-white p-2.5 shadow-sm ${
          redFlag ? "border-red-200 bg-red-50/70" : "border-slate-200"
        }`}
      >
        <div className="min-w-0 w-full space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold whitespace-normal break-words text-slate-900">{patient.full_name}</p>
            <p className="text-xs leading-5 text-slate-700 whitespace-normal break-words">{patient.phone}</p>
          </div>

          <div className="flex min-w-0 w-full flex-wrap gap-2">
            <div className="flex min-w-0 w-full flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  patient.transfer_arranged ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                T:{boolToYN(patient.transfer_arranged)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  patient.hotel_arranged ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                H:{boolToYN(patient.hotel_arranged)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  patient.booked_with_assistant
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                B:{boolToYN(patient.booked_with_assistant)}
              </span>
            </div>
          </div>

          <div className="min-w-0 w-full space-y-1 text-xs leading-5 text-slate-700 whitespace-normal break-words">
            {arrivalLineParts.length > 0 ? (
              <p>
                <span className="text-slate-400">Arr:</span> {arrivalLineParts.join(" ")}
              </p>
            ) : null}
            {returnLineParts.length > 0 ? (
              <p>
                <span className="text-slate-400">Ret:</span> {returnLineParts.join(" ")}
              </p>
            ) : null}
            {patient.arrival_date ? (
              <p>
                <span className="text-slate-400">Arr Date:</span> {patient.arrival_date}
              </p>
            ) : null}
            {patient.surgeries_text ? (
              <p>
                <span className="text-slate-400">Surg:</span> {patient.surgeries_text}
              </p>
            ) : null}
          </div>
        </div>
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
        {currentView === "dayGridWeek" ? (
          <p className="mt-3 text-xs text-slate-500">T=Transfer, H=Hotel, B=Booked</p>
        ) : null}
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
          eventClassNames={(arg) =>
            arg.view.type === "dayGridWeek"
              ? ["cursor-pointer", "fc-weekly-patient-event"]
              : ["cursor-pointer"]
          }
          moreLinkClassNames="text-xs text-blue-700 hover:underline"
          height="auto"
          contentHeight="auto"
          datesSet={(arg: DatesSetArg) => {
            setCurrentView(arg.view.type);
          }}
        />
      </Card>
    </section>
  );
}
