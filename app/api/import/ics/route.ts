import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Deprecated endpoint. Use /api/import/ics/preview, /api/import/ics/import, or /api/import/ics/delete."
    },
    { status: 410 }
  );
}
