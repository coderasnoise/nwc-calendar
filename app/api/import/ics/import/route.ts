import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildIcsPreview } from "@/lib/import/preview";

export const runtime = "nodejs";

const maxFileSizeBytes = 5 * 1024 * 1024;

const importOptionsSchema = z.object({
  skipDuplicates: z.boolean().default(true)
});

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

    const parsedOptions = importOptionsSchema.safeParse({
      skipDuplicates: toBoolean(formData.get("skipDuplicates"))
    });

    if (!parsedOptions.success) {
      return NextResponse.json({ error: "Invalid import options." }, { status: 400 });
    }

    const text = await fileValue.text();
    const preview = await buildIcsPreview(text);

    let imported = 0;
    let skipped = 0;
    let duplicateSkipped = 0;

    const { data: batchData, error: batchError } = await supabase
      .from("import_batches")
      .insert({
        source: "google_ics",
        filename: fileValue.name,
        imported_by: user.id
      })
      .select("id")
      .single();

    if (batchError) {
      throw new Error(batchError.message);
    }

    const batchId = batchData.id as string;

    for (const row of preview.rows) {
      if (parsedOptions.data.skipDuplicates && row.status === "EXISTS") {
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
        transfer_arranged: false,
        transfer_driver_name: null,
        hotel_arranged: false,
        hotel_room_type: null,
        booked_with_assistant: false,
        patient_passport_number: null,
        patient_passport_photo_path: null,
        companion_full_name: null,
        companion_passport_number: null,
        import_source: "google_ics",
        import_batch_id: batchId,
        import_event_uid: row.event_uid,
        imported_at: new Date().toISOString()
      });

      if (error) {
        skipped += 1;
        continue;
      }

      imported += 1;
    }

    await supabase
      .from("import_batches")
      .update({
        counts: {
          eventsFound: preview.eventsFound,
          validRows: preview.rows.length,
          imported,
          skipped,
          duplicateSkipped
        }
      })
      .eq("id", batchId);

    return NextResponse.json({
      mode: "import",
      totals: {
        eventsFound: preview.eventsFound,
        validRows: preview.rows.length,
        imported,
        skipped,
        duplicateSkipped
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
