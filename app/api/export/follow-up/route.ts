import { NextResponse } from "next/server";
import { z } from "zod";
import { listPatientsForFollowUpExport } from "@/lib/data/patients";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildExcelHtml(rows: Awaited<ReturnType<typeof listPatientsForFollowUpExport>>) {
  const bodyRows = rows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.full_name)}</td><td style="mso-number-format:'\\@';">${escapeHtml(row.phone)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/export?error=Invalid%20date%20range", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const rows = await listPatientsForFollowUpExport(parsed.data.from, parsed.data.to);
  const html = buildExcelHtml(rows);
  const filename = `follow-up-export-${parsed.data.from}-to-${parsed.data.to}.xls`;

  return new NextResponse(`\ufeff${html}`, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
