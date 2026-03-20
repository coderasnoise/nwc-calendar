import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  action: (formData: FormData) => Promise<void>;
  leadId: string;
  defaultDate: string;
};

export function LeadFollowupForm({ action, leadId, defaultDate }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Add Follow-up</h3>
        <p className="mt-1 text-xs text-slate-500">Log a completed contact or schedule the next one.</p>
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="lead_id" value={leadId} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Follow-up Date
            <Input type="date" name="follow_up_date" defaultValue={defaultDate} className="mt-1" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Channel
            <Select name="channel" defaultValue="whatsapp" className="mt-1">
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Entry Status
            <Select name="status" defaultValue="completed" className="mt-1">
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="canceled">Canceled</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Next Due Date
            <Input type="date" name="next_due_date" className="mt-1" />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Summary
          <textarea
            name="summary"
            rows={3}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </label>

        <div className="flex justify-end">
          <Button type="submit" variant="secondary">
            Save Follow-up
          </Button>
        </div>
      </form>
    </Card>
  );
}
