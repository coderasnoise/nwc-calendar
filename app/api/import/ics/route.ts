import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeName,
  normalizePhone,
  parseIcsContent,
  type ParsedImportRow
} from "@/lib/import/ics";

export const runtime = "nodejs";

const maxFileSizeBytes = 5 * 1024 * 1024;

const modeSchema = z.object({
  mode: z.enum(["preview", "import"]).default("preview"),
  skipDuplicates: z.boolean().default(true)
});

type ExistingPatientRow = {
  id: string;
  full_name: string;
  surgery_date: string | null;
  phone: string;
};

function isIcsFile(file: File) {
  return (
    file.name.toLowerCase().endsWith(".ics") ||
    file.name.toLowerCase().endsWith(".ical") ||
    file.type === "text/calendar"
  );
}

function toBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return true;
  }

  const normalized = value.toLowerCase();
  if (normalized === "false" || normalized === "0" || normalized === "off") {
    return false;
  }
  return true;
}

function isDuplicate(row: ParsedImportRow, existingPatients: ExistingPatientRow[]) {
  const normalizedName = normalizeName(row.full_name);
  const normalizedImportPhone = normalizePhone(row.phone);

  return existingPatients.some((patient) => {
    if (!patient.surgery_date || patient.surgery_date !== row.surgery_date) {
      return false;
    }

    if (normalizeName(patient.full_name) !== normalizedName) {
      return false;
    }

    if (!normalizedImportPhone) {
      return true;
    }

    return normalizePhone(patient.phone) === normalizedImportPhone;
  });
}

async function fetchExistingPatientsForDates(dates: string[]) {
  if (dates.length === 0) {
    return [] as ExistingPatientRow[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name, surgery_date, phone")
    .in("surgery_date", dates);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ExistingPatientRow[];
}

function buildPreviewRows(rows: ParsedImportRow[], existingPatients: ExistingPatientRow[]) {
  return rows.map((row) => ({
    sourceKey: row.sourceKey,
    surgery_date: row.surgery_date,
    full_name: row.full_name,
    phone: row.phone,
    notes: row.notes,
    duplicate: isDuplicate(row, existingPatients)
  }));
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const fileValue = formData.get("file");
    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "Please upload an .ics file." }, { status: 400 });
    }

    if (!isIcsFile(fileValue)) {
      return NextResponse.json({ error: "Only .ics/.ical files are supported." }, { status: 400 });
    }

    if (fileValue.size > maxFileSizeBytes) {
      return NextResponse.json({ error: "File too large. Max size is 5MB." }, { status: 400 });
    }

    const parsedMode = modeSchema.safeParse({
      mode: formData.get("mode") ?? "preview",
      skipDuplicates: toBoolean(formData.get("skipDuplicates"))
    });

    if (!parsedMode.success) {
      return NextResponse.json({ error: "Invalid import options." }, { status: 400 });
    }

    const text = await fileValue.text();
    const parsed = await parseIcsContent(text);

    const validRows = parsed.rows.filter((row) => row.full_name && row.surgery_date);
    const dates = Array.from(new Set(validRows.map((row) => row.surgery_date)));
    const existingPatients = await fetchExistingPatientsForDates(dates);
    const previewRows = buildPreviewRows(validRows, existingPatients);

    if (parsedMode.data.mode === "preview") {
      return NextResponse.json({
        mode: "preview",
        totals: {
          eventsFound: parsed.eventsFound,
          validRows: previewRows.length,
          duplicateRows: previewRows.filter((row) => row.duplicate).length
        },
        rows: previewRows
      });
    }

    let imported = 0;
    let skipped = 0;
    let duplicateSkipped = 0;

    for (const row of previewRows) {
      if (parsedMode.data.skipDuplicates && row.duplicate) {
        skipped += 1;
        duplicateSkipped += 1;
        continue;
      }

      const { error } = await supabase.from("patients").insert({
        full_name: row.full_name,
        phone: row.phone ?? "",
        surgery_date: row.surgery_date,
        surgeries_text: row.notes,
        consultation_date: null,
        arrival_date: null,
        arrival_time: null,
        arrival_airport: null,
        arrival_flight_code: null,
        return_date: null,
        return_time: null,
        return_flight_code: null,
        transfer_arranged: false,
        transfer_driver_name: null,
        hotel_arranged: false,
        hotel_room_type: null,
        booked_with_assistant: false,
        patient_passport_number: null,
        patient_passport_photo_path: null,
        companion_full_name: null,
        companion_passport_number: null
      });

      if (error) {
        skipped += 1;
        continue;
      }

      imported += 1;
    }

    return NextResponse.json({
      mode: "import",
      totals: {
        eventsFound: parsed.eventsFound,
        validRows: previewRows.length,
        imported,
        skipped,
        duplicateSkipped
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse import file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
