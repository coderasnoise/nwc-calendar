import { type Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type LeadFormProps = {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  error?: string;
  lead?: Lead;
};

function SectionTitle({ title, helper }: { title: string; helper?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function formatDateTimeLocalInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 16);
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function LeadForm({ action, mode, error, lead }: LeadFormProps) {
  return (
    <form action={action} className="space-y-4">
      {mode === "edit" ? <input type="hidden" name="id" value={lead?.id ?? ""} /> : null}

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <Card className="p-4">
        <SectionTitle title="Lead Intake" helper="Manual entry from Meta, WhatsApp, email, or referral." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Full Name*
            <Input name="full_name" required defaultValue={lead?.full_name ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone*
            <Input name="phone" required defaultValue={lead?.phone ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <Input name="email" type="email" defaultValue={lead?.email ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Source*
            <Select name="source" defaultValue={lead?.source ?? "meta"} className="mt-1">
              <option value="meta">Meta lead center</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="walk_in">Walk-in</option>
              <option value="other">Other</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Country
            <Input name="country" defaultValue={lead?.country ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Procedure Interest
            <Input name="procedure_interest" defaultValue={lead?.procedure_interest ?? ""} className="mt-1" />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Workflow" helper="Current owner, status, and first-contact handling." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Lead Status*
            <Select name="status" defaultValue={lead?.status ?? "new"} className="mt-1">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="awaiting_review">Awaiting review</option>
              <option value="review_ready">Review ready</option>
              <option value="quoted">Quoted</option>
              <option value="follow_up">Follow up</option>
              <option value="booked">Booked</option>
              <option value="lost">Lost</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Owner
            <Input name="owner_name" defaultValue={lead?.owner_name ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            First Contact At
            <Input
              type="datetime-local"
              name="first_contact_at"
              defaultValue={formatDateTimeLocalInputValue(lead?.first_contact_at)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            First Contact Channel
            <Select name="first_contact_channel" defaultValue={lead?.first_contact_channel ?? ""} className="mt-1">
              <option value="">Select</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-2">
            First Contact Summary
            <textarea
              name="first_contact_summary"
              defaultValue={lead?.first_contact_summary ?? ""}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Boss Review" helper="Keep the surgeon/boss queue visible and structured." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Review Status*
            <Select name="boss_review_status" defaultValue={lead?.boss_review_status ?? "not_requested"} className="mt-1">
              <option value="not_requested">Not requested</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="needs_info">Needs info</option>
              <option value="declined">Declined</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Requested At
            <Input
              type="datetime-local"
              name="boss_review_requested_at"
              defaultValue={formatDateTimeLocalInputValue(lead?.boss_review_requested_at)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Completed At
            <Input
              type="datetime-local"
              name="boss_review_completed_at"
              defaultValue={formatDateTimeLocalInputValue(lead?.boss_review_completed_at)}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">
            Consultation Summary
            <textarea
              name="consultation_summary"
              defaultValue={lead?.consultation_summary ?? ""}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">
            Medical Summary
            <textarea
              name="medical_summary"
              defaultValue={lead?.medical_summary ?? ""}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Quote & Follow-up" helper="Store decision, next step, and accountability in one place." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Quote Status*
            <Select name="quote_status" defaultValue={lead?.quote_status ?? "not_prepared"} className="mt-1">
              <option value="not_prepared">Not prepared</option>
              <option value="drafted">Drafted</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Quote Amount
            <Input
              type="number"
              min="0"
              step="0.01"
              name="quote_amount"
              defaultValue={lead?.quote_amount ?? ""}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Currency
            <Select name="quote_currency" defaultValue={lead?.quote_currency ?? ""} className="mt-1">
              <option value="">Select</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="TRY">TRY</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Follow-up Status*
            <Select name="follow_up_status" defaultValue={lead?.follow_up_status ?? "none"} className="mt-1">
              <option value="none">None</option>
              <option value="scheduled">Scheduled</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Follow-up Due Date
            <Input type="date" name="follow_up_due_date" defaultValue={lead?.follow_up_due_date ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Follow-up Owner
            <Input
              name="follow_up_owner_name"
              defaultValue={lead?.follow_up_owner_name ?? ""}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-2">
            Lost Reason
            <Input name="lost_reason" defaultValue={lead?.lost_reason ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-4">
            Quote Summary
            <textarea
              name="quote_summary"
              defaultValue={lead?.quote_summary ?? ""}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-4">
            Internal Notes
            <textarea
              name="notes"
              defaultValue={lead?.notes ?? ""}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">{mode === "create" ? "Create Lead" : "Save Changes"}</Button>
      </div>
    </form>
  );
}
