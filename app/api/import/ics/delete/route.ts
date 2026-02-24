import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const deleteSchema = z.object({
  mode: z.enum(["selected", "all"]),
  patientIds: z.array(z.string().uuid()).default([])
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = deleteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid delete payload." }, { status: 400 });
    }

    let query = supabase.from("patients").delete().eq("import_source", "google_ics");

    if (parsed.data.mode === "selected") {
      if (parsed.data.patientIds.length === 0) {
        return NextResponse.json({ deleted: 0 });
      }
      query = query.in("id", parsed.data.patientIds);
    }

    const { data, error } = await query.select("id");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ deleted: Array.isArray(data) ? data.length : 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
