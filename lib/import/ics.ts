import ical from "node-ical";

export type ParsedImportRow = {
  sourceKey: string;
  full_name: string;
  surgery_date: string;
  phone: string | null;
  notes: string | null;
};

const phoneRegex = /(?:\+?\d[\d\s().-]{8,}\d)/;

function toDateString(date: Date, useLocalDate: boolean) {
  const year = useLocalDate ? date.getFullYear() : date.getUTCFullYear();
  const month = String((useLocalDate ? date.getMonth() : date.getUTCMonth()) + 1).padStart(2, "0");
  const day = String(useLocalDate ? date.getDate() : date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizePhone(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return null;
  }

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (hasPlus) {
    return `+${digits}`;
  }

  if (digits.startsWith("00") && digits.length > 2) {
    return `+${digits.slice(2)}`;
  }

  if (digits.startsWith("90") && digits.length >= 10) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length >= 10) {
    return `+90${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }

  return `+${digits}`;
}

function parseDescription(description: string | undefined) {
  const text = (description ?? "").replace(/\r/g, "").trim();
  if (!text) {
    return { phone: null, notes: null };
  }

  const phoneMatch = text.match(phoneRegex);
  const phone = normalizePhone(phoneMatch?.[0] ?? null);

  let notes = text;
  if (phoneMatch?.[0]) {
    notes = notes.replace(phoneMatch[0], "").replace(/^[\s,;.-]+|[\s,;.-]+$/g, "");
  }

  return {
    phone,
    notes: notes.length > 0 ? notes : null
  };
}

function uniqueBySource(rows: ParsedImportRow[]) {
  const map = new Map<string, ParsedImportRow>();
  rows.forEach((row) => {
    map.set(row.sourceKey, row);
  });
  return Array.from(map.values());
}

function extractRowsFromEvent(event: ical.VEvent) {
  if (!event.start || !event.summary) {
    return [] as ParsedImportRow[];
  }

  if (String(event.status ?? "").toUpperCase() === "CANCELLED") {
    return [] as ParsedImportRow[];
  }

  const fullName = String(event.summary).trim();
  if (!fullName) {
    return [] as ParsedImportRow[];
  }

  const { phone, notes } = parseDescription(typeof event.description === "string" ? event.description : undefined);
  const rows: ParsedImportRow[] = [];
  const isDateOnly = String(event.datetype ?? "").toLowerCase() === "date";

  const occurrences: Date[] = [];
  if (event.rrule) {
    const startBoundary = event.start;
    const until = event.rrule.options.until;
    const defaultEnd = new Date(event.start.getTime() + 1000 * 60 * 60 * 24 * 365 * 3);
    const endBoundary = until instanceof Date ? until : defaultEnd;

    occurrences.push(...event.rrule.between(startBoundary, endBoundary, true));
  }

  if (occurrences.length === 0) {
    occurrences.push(event.start);
  }

  const exdate = event.exdate ?? {};

  occurrences.forEach((occurrence, index) => {
    const dateKey = toDateString(occurrence, isDateOnly);

    const excluded = Object.values(exdate).some((excludedDate) => {
      if (!(excludedDate instanceof Date)) {
        return false;
      }
      return toDateString(excludedDate, isDateOnly) === dateKey;
    });

    if (excluded) {
      return;
    }

    rows.push({
      sourceKey: `${event.uid ?? fullName}-${dateKey}-${index}`,
      full_name: fullName,
      surgery_date: dateKey,
      phone,
      notes
    });
  });

  return rows;
}

export async function parseIcsContent(icsText: string) {
  const parsed = ical.sync.parseICS(icsText);
  const rows: ParsedImportRow[] = [];

  Object.values(parsed).forEach((entry) => {
    if (entry.type !== "VEVENT") {
      return;
    }

    rows.push(...extractRowsFromEvent(entry));
  });

  const uniqueRows = uniqueBySource(rows).sort((a, b) => {
    if (a.surgery_date === b.surgery_date) {
      return a.full_name.localeCompare(b.full_name);
    }
    return a.surgery_date.localeCompare(b.surgery_date);
  });

  return {
    eventsFound: rows.length,
    rows: uniqueRows
  };
}

export function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
