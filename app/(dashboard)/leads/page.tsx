import Link from "next/link";
import { getLeadListSummary, listLeads } from "@/lib/data/leads";
import { type Lead, type LeadStatus } from "@/lib/types";
import { LeadSearchForm } from "@/components/leads/lead-search-form";
import {
  BossReviewBadge,
  FollowUpBadge,
  getEffectiveFollowUpStatus,
  LeadStatusBadge,
  QuoteStatusBadge
} from "@/components/leads/lead-status-badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: LeadStatus | "all"; error?: string }>;
}) {
  const { q, status, error } = await searchParams;

  let leadsError: string | null = null;
  let leads: Lead[] = [];
  let summary = {
    total: 0,
    pendingReview: 0,
    overdueFollowUps: 0,
    quoted: 0
  };

  try {
    const [leadRows, leadSummary] = await Promise.all([
      listLeads(q, status ?? "all"),
      getLeadListSummary()
    ]);
    leads = leadRows;
    summary = leadSummary;
  } catch (e) {
    leadsError = e instanceof Error ? e.message : "Failed to load leads";
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Leads</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manual intake, review queue, quote tracking, and follow-up workflow.
          </p>
        </div>
        <Link href="/leads/new" className={buttonStyles({ variant: "primary" })}>
          New Lead
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Leads</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Review</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.pendingReview}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overdue Follow-ups</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.overdueFollowUps}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quoted</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.quoted}</p>
        </Card>
      </div>

      <LeadSearchForm initialQuery={q ?? ""} initialStatus={status ?? "all"} />

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {leadsError ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{leadsError}</p> : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Procedure</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Follow-up</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={6}>
                    {q?.trim() || status ? "No leads matched your filters." : "No leads found."}
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <tr key={lead.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{lead.full_name}</p>
                        <p className="text-slate-500">{lead.phone}</p>
                        <p className="text-xs text-slate-500">
                          {lead.source} {lead.country ? `• ${lead.country}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{lead.procedure_interest ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{lead.owner_name ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <LeadStatusBadge status={lead.status} />
                        <BossReviewBadge status={lead.boss_review_status} />
                        <QuoteStatusBadge status={lead.quote_status} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <FollowUpBadge status={getEffectiveFollowUpStatus(lead)} />
                        <p className="text-xs text-slate-500">{lead.follow_up_due_date ?? "No due date"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
