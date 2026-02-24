import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildIcsPreview } from "@/lib/import/preview";

export const runtime = "nodejs";

const maxFileSizeBytes = 5 * 1024 * 1024;

function isIcsFile(file: File) {
  return (
    file.name.toLowerCase().endsWith(".ics") ||
    file.name.toLowerCase().endsWith(".ical") ||
    file.type === "text/calendar"
  );
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

    const text = await fileValue.text();
    const preview = await buildIcsPreview(text);

    return NextResponse.json({
      mode: "preview",
      totals: {
        eventsFound: preview.eventsFound,
        validRows: preview.rows.length,
        existsRows: preview.rows.filter((row) => row.status === "EXISTS").length
      },
      rows: preview.rows
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse import file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
