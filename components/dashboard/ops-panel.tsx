"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type DashboardPatient } from "@/lib/data/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  patients: DashboardPatient[];
  startDate: string;
  endDate: string;
};

type AttentionFilter = "all" | "transfer" | "hotel" | "booking";
type ScheduleFilter = "all" | "arrivals" | "surgeries";

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

function inRange(dateValue: string | null, start: string, end: string) {
  if (!dateValue) {
    return false;
  }
  return dateValue >= start && dateValue <= end;
}

function isAttentionItem(patient: DashboardPatient, start: string, end: string) {
  if (!inRange(patient.arrival_date, start, end)) {
    return false;
  }
  return !patient.transfer_arranged || !patient.hotel_arranged || !patient.booked_with_assistant;
}

function severity(patient: DashboardPatient) {
  if (!patient.transfer_arranged || !patient.hotel_arranged) {
    return "red" as const;
  }
  return "amber" as const;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function OpsPanel({ patients, startDate, endDate }: Props) {
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilter>("all");
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("all");

  const attentionItems = useMemo(() => {
    const items = patients
      .filter((patient) => isAttentionItem(patient, startDate, endDate))
      .sort((a, b) => {
        const ad = a.arrival_date ?? "9999-12-31";
        const bd = b.arrival_date ?? "9999-12-31";
        if (ad === bd) {
          return a.full_name.localeCompare(b.full_name);
        }
        return ad.localeCompare(bd);
      });

    if (attentionFilter === "all") {
      return items;
    }

    if (attentionFilter === "transfer") {
      return items.filter((patient) => !patient.transfer_arranged);
    }

    if (attentionFilter === "hotel") {
      return items.filter((patient) => !patient.hotel_arranged);
    }

    return items.filter(
      (patient) => patient.transfer_arranged && patient.hotel_arranged && !patient.booked_with_assistant
    );
  }, [patients, startDate, endDate, attentionFilter]);

  const counts = useMemo(() => {
    const upcomingArrivals = patients.filter((p) => inRange(p.arrival_date, startDate, endDate)).length;
    const upcomingSurgeries = patients.filter((p) => inRange(p.surgery_date, startDate, endDate)).length;
    const missingTransfer = patients.filter(
      (p) => inRange(p.arrival_date, startDate, endDate) && !p.transfer_arranged
    ).length;
    const missingHotel = patients.filter(
      (p) => inRange(p.arrival_date, startDate, endDate) && !p.hotel_arranged
    ).length;

    return { upcomingArrivals, upcomingSurgeries, missingTransfer, missingHotel };
  }, [patients, startDate, endDate]);

  const dayBuckets = useMemo(() => {
    const start = new Date(startDate);
    const days = Array.from({ length: 8 }).map((_, index) => {
      const date = addDays(start, index);
      const dateKey = toLocalDateString(date);

      const arrivals = patients.filter((p) => p.arrival_date === dateKey);
      const consultations = patients.filter((p) => p.consultation_date === dateKey);
      const surgeries = patients.filter((p) => p.surgery_date === dateKey);
      const returns = patients.filter((p) => p.return_date === dateKey);

      return {
        key: dateKey,
        label: formatDayLabel(date),
        arrivals,
        consultations,
        surgeries,
        returns
      };
    });

    return days;
  }, [patients, startDate]);

  function jumpTo(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleKpiClick(target: "arrivals" | "surgeries" | "transfer" | "hotel") {
    if (target === "arrivals") {
      setScheduleFilter("arrivals");
      jumpTo("next-7-days");
      return;
    }

    if (target === "surgeries") {
      setScheduleFilter("surgeries");
      jumpTo("next-7-days");
      return;
    }

    setAttentionFilter(target);
    jumpTo("needs-attention");
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Next 7 days operations</p>
        </div>
        <Link href="/patients/new" className={buttonStyles({ variant: "primary" })}>
          + New Patient
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => handleKpiClick("arrivals")} className="text-left">
          <Card className="p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming Arrivals</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{counts.upcomingArrivals}</p>
          </Card>
        </button>

        <button type="button" onClick={() => handleKpiClick("surgeries")} className="text-left">
          <Card className="p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming Surgeries</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{counts.upcomingSurgeries}</p>
          </Card>
        </button>

        <button type="button" onClick={() => handleKpiClick("transfer")} className="text-left">
          <Card className="p-4 transition hover:border-red-200 hover:bg-red-50/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Missing Transfer</p>
            <p className="mt-2 text-3xl font-semibold text-red-700">{counts.missingTransfer}</p>
          </Card>
        </button>

        <button type="button" onClick={() => handleKpiClick("hotel")} className="text-left">
          <Card className="p-4 transition hover:border-red-200 hover:bg-red-50/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Missing Hotel</p>
            <p className="mt-2 text-3xl font-semibold text-red-700">{counts.missingHotel}</p>
          </Card>
        </button>
      </div>

      <Card id="needs-attention" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Needs Attention (next 7 days)</h3>
          <div className="flex gap-2">
            <Button type="button" variant={attentionFilter === "all" ? "secondary" : "ghost"} onClick={() => setAttentionFilter("all")}>All</Button>
            <Button type="button" variant={attentionFilter === "transfer" ? "secondary" : "ghost"} onClick={() => setAttentionFilter("transfer")}>Transfer</Button>
            <Button type="button" variant={attentionFilter === "hotel" ? "secondary" : "ghost"} onClick={() => setAttentionFilter("hotel")}>Hotel</Button>
            <Button type="button" variant={attentionFilter === "booking" ? "secondary" : "ghost"} onClick={() => setAttentionFilter("booking")}>Booking</Button>
          </div>
        </div>

        {attentionItems.length === 0 ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            No urgent issues in the next 7 days.
          </p>
        ) : (
          <div className="space-y-2">
            {attentionItems.map((patient) => {
              const rowSeverity = severity(patient);
              return (
                <div
                  key={patient.id}
                  className={`rounded-md border p-3 ${
                    rowSeverity === "red"
                      ? "border-red-200 bg-red-50/40"
                      : "border-amber-200 bg-amber-50/40"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{patient.full_name}</p>
                      <p className="text-sm text-slate-600">{patient.phone || "-"}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Arrival: {patient.arrival_date ?? "-"} {patient.arrival_time ?? "-"} {patient.arrival_airport ?? "-"} {patient.arrival_flight_code ?? "-"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {!patient.transfer_arranged ? <Badge tone="alert">Transfer</Badge> : null}
                        {!patient.hotel_arranged ? <Badge tone="alert">Hotel</Badge> : null}
                        {patient.transfer_arranged && patient.hotel_arranged && !patient.booked_with_assistant ? (
                          <Badge tone="neutral" className="bg-amber-100 text-amber-700">Booking</Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/patients/${patient.id}/edit`} className={buttonStyles({ variant: "secondary" })}>
                        Edit
                      </Link>
                      <Link href={`/patients/${patient.id}`} className={buttonStyles({ variant: "ghost" })}>
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card id="next-7-days" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Next 7 Days</h3>
          <div className="flex gap-2">
            <Button type="button" variant={scheduleFilter === "all" ? "secondary" : "ghost"} onClick={() => setScheduleFilter("all")}>All</Button>
            <Button type="button" variant={scheduleFilter === "arrivals" ? "secondary" : "ghost"} onClick={() => setScheduleFilter("arrivals")}>Arrivals</Button>
            <Button type="button" variant={scheduleFilter === "surgeries" ? "secondary" : "ghost"} onClick={() => setScheduleFilter("surgeries")}>Surgeries</Button>
          </div>
        </div>

        <div className="space-y-4">
          {dayBuckets.map((day) => {
            const showArrivals = scheduleFilter === "all" || scheduleFilter === "arrivals";
            const showSurgeries = scheduleFilter === "all" || scheduleFilter === "surgeries";
            const showConsultations = scheduleFilter === "all";
            const showReturns = scheduleFilter === "all";

            const emptyDay =
              (!showArrivals || day.arrivals.length === 0) &&
              (!showConsultations || day.consultations.length === 0) &&
              (!showSurgeries || day.surgeries.length === 0) &&
              (!showReturns || day.returns.length === 0);

            return (
              <div key={day.key} className="rounded-md border border-slate-200 p-3">
                <p className="mb-2 text-sm font-semibold text-slate-800">{day.label}</p>

                {emptyDay ? (
                  <p className="text-xs text-slate-500">No events.</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {showArrivals && day.arrivals.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Arrivals</p>
                        <ul className="mt-1 space-y-1">
                          {day.arrivals.map((patient) => (
                            <li key={`a-${patient.id}`}>
                              <Link href={`/patients/${patient.id}`} className="text-blue-700 hover:underline">
                                {patient.full_name}
                              </Link>
                              <span className="ml-2 text-xs text-slate-600">
                                {patient.arrival_time ?? "-"} {patient.arrival_airport ?? "-"} {patient.arrival_flight_code ?? "-"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {showConsultations && day.consultations.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Consultations</p>
                        <ul className="mt-1 space-y-1">
                          {day.consultations.map((patient) => (
                            <li key={`c-${patient.id}`}>
                              <Link href={`/patients/${patient.id}`} className="text-blue-700 hover:underline">
                                {patient.full_name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {showSurgeries && day.surgeries.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Surgeries</p>
                        <ul className="mt-1 space-y-1">
                          {day.surgeries.map((patient) => (
                            <li key={`s-${patient.id}`}>
                              <Link href={`/patients/${patient.id}`} className="text-blue-700 hover:underline">
                                {patient.full_name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {showReturns && day.returns.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Returns</p>
                        <ul className="mt-1 space-y-1">
                          {day.returns.map((patient) => (
                            <li key={`r-${patient.id}`}>
                              <Link href={`/patients/${patient.id}`} className="text-blue-700 hover:underline">
                                {patient.full_name}
                              </Link>
                              <span className="ml-2 text-xs text-slate-600">
                                {patient.return_time ?? "-"} {patient.return_flight_code ?? "-"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <p className="text-xs text-slate-500">Window: {startDate} to {endDate} (inclusive)</p>
    </section>
  );
}
