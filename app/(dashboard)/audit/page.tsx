import { AuditList } from "@/components/audit/audit-list";
import { listAuditLogs, type AuditActionFilter } from "@/lib/data/audit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default async function AuditPage({
  searchParams
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    action?: AuditActionFilter;
    patient?: string;
  }>;
}) {
  const { from, to, action, patient } = await searchParams;

  const items = await listAuditLogs({
    from,
    to,
    action: action ?? "all",
    patient
  });

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Audit Log</h2>
        <p className="mt-1 text-sm text-slate-500">Track insert/update/delete changes for patient records.</p>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            From
            <Input type="date" name="from" defaultValue={from ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            To
            <Input type="date" name="to" defaultValue={to ?? ""} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Action
            <Select name="action" defaultValue={action ?? "all"} className="mt-1">
              <option value="all">All</option>
              <option value="insert">Insert</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Patient name
            <Input name="patient" defaultValue={patient ?? ""} placeholder="Search by name" className="mt-1" />
          </label>
          <Button type="submit" variant="secondary" className="md:col-span-4 md:w-24">
            Apply
          </Button>
        </form>
      </Card>

      <AuditList items={items} />
    </section>
  );
}
