"use client";

import { useState } from "react";
import { type AuditListItem } from "@/lib/data/audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  items: AuditListItem[];
};

function actionTone(action: AuditListItem["action"]) {
  if (action === "INSERT") {
    return "positive" as const;
  }
  if (action === "DELETE") {
    return "alert" as const;
  }
  return "neutral" as const;
}

export function AuditList({ items }: Props) {
  const [selected, setSelected] = useState<AuditListItem | null>(null);

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Changed Fields</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={6}>
                    No audit entries found.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge tone={actionTone(item.action)}>{item.action}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.patientName}</td>
                    <td className="px-4 py-3 text-slate-700">{item.actorEmail ?? item.actorUserId ?? "-"}</td>
                    <td className="max-w-xs px-4 py-3 text-slate-700">{item.changedFields.join(", ")}</td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="ghost" onClick={() => setSelected(item)}>
                        View details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 p-2 sm:p-4">
          <Card className="h-full w-full max-w-3xl overflow-auto p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Audit Details</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.action} for {selected.patientName} at {new Date(selected.timestamp).toLocaleString()}
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">old_data</p>
                <pre className="max-h-[60vh] overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  {JSON.stringify(selected.oldData, null, 2)}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">new_data</p>
                <pre className="max-h-[60vh] overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  {JSON.stringify(selected.newData, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
