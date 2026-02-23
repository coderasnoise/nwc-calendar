"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  initialQuery: string;
};

export function PatientSearchForm({ initialQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();

    if (trimmed.length > 0) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }

    startTransition(() => {
      router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
    });
  }

  function onClear() {
    setQuery("");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <Card className="p-4">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onSubmit}>
        <label className="block flex-1 text-sm font-medium text-slate-700">
          Search
          <Input
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, phone, passport, flight code…"
            className="mt-1"
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Searching..." : "Search"}
          </Button>
          <button
            type="button"
            className={buttonStyles({ variant: "ghost" })}
            onClick={onClear}
            disabled={isPending && query.length === 0}
          >
            Clear
          </button>
        </div>
      </form>
    </Card>
  );
}
