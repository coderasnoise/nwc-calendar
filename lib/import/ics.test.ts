import { describe, expect, it } from "vitest";
import { normalizePhone, parseIcsContent } from "./ics";

describe("normalizePhone", () => {
  it("normalizes common TR formats", () => {
    expect(normalizePhone("0532 123 45 67")).toBe("+905321234567");
    expect(normalizePhone("+90 532 123 45 67")).toBe("+905321234567");
    expect(normalizePhone("5321234567")).toBe("+905321234567");
  });
});

describe("parseIcsContent", () => {
  it("maps google calendar events to surgery rows and ignores cancelled events", async () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:evt-1
DTSTART;VALUE=DATE:20260310
SUMMARY:John Doe
DESCRIPTION:+90 532 123 45 67 Follow-up notes
END:VEVENT
BEGIN:VEVENT
UID:evt-2
DTSTART:20260312T093000Z
SUMMARY:Jane Roe
DESCRIPTION:No phone\nSecond line note
END:VEVENT
BEGIN:VEVENT
UID:evt-3
DTSTART;VALUE=DATE:20260315
SUMMARY:Cancelled Person
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`;

    const parsed = await parseIcsContent(ics);

    expect(parsed.rows.length).toBe(2);
    expect(parsed.rows[0]).toMatchObject({
      full_name: "John Doe",
      surgery_date: "2026-03-10",
      phone: "+905321234567"
    });
    expect(parsed.rows[0].notes).toContain("Follow-up notes");

    expect(parsed.rows[1]).toMatchObject({
      full_name: "Jane Roe",
      surgery_date: "2026-03-12",
      phone: null
    });
  });
});
