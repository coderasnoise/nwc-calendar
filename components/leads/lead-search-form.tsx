"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type LeadStatus } from "@/lib/types";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  initialQuery: string;
  initialStatus: LeadStatus | "all";
};

const statusOptions: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "awaiting_review", label: "Awaiting review" },
  { value: "review_ready", label: "Review ready" },
  { value: "quoted", label: "Quoted" },
  { value: "follow_up", label: "Follow up" },
  { value: "booked", label: "Booked" },
  { value: "lost", label: "Lost" }
];

export function LeadSearchForm({ initialQuery, initialStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<LeadStatus | "all">(initialStatus);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();

    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }

    if (status !== "all") {
      next.set("status", status);
    } else {
      next.delete("status");
    }

    startTransition(() => {
      router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
    });
  }

  function onClear() {
    setQuery("");
    setStatus("all");

    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <Card className="p-4">
      <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Search
          <Input
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, phone, email, procedure, owner…"
            className="mt-1"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Status
          <Select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus | "all")}
            className="mt-1"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex gap-2 lg:self-end">
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Searching..." : "Search"}
          </Button>
          <button type="button" className={buttonStyles({ variant: "ghost" })} onClick={onClear}>
            Clear
          </button>
        </div>
      </form>
    </Card>
  );
}
