import Link from "next/link";
import { notFound } from "next/navigation";
import { addLeadFollowupAction } from "@/app/(dashboard)/leads/actions";
import { getLeadById, listLeadFollowups } from "@/lib/data/leads";
import { LeadFollowupForm } from "@/components/leads/lead-followup-form";
import {
  BossReviewBadge,
  FollowUpBadge,
  getEffectiveFollowUpStatus,
  LeadStatusBadge,
  QuoteStatusBadge
} from "@/components/leads/lead-status-badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function LeadDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [lead, followups] = await Promise.all([getLeadById(id), listLeadFollowups(id)]);

  if (!lead) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{lead.full_name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {lead.phone}
              {lead.email ? ` • ${lead.email}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/leads" className={buttonStyles({ variant: "ghost" })}>
              Back
            </Link>
            <Link href={`/leads/${lead.id}/edit`} className={buttonStyles({ variant: "secondary" })}>
              Edit
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <LeadStatusBadge status={lead.status} />
          <BossReviewBadge status={lead.boss_review_status} />
          <QuoteStatusBadge status={lead.quote_status} />
          <FollowUpBadge status={getEffectiveFollowUpStatus(lead)} />
        </div>
      </Card>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Intake</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Source</dt>
              <dd>{lead.source}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Country</dt>
              <dd>{lead.country ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Procedure</dt>
              <dd>{lead.procedure_interest ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Owner</dt>
              <dd>{lead.owner_name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">First Contact At</dt>
              <dd>{formatDateTime(lead.first_contact_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Channel</dt>
              <dd>{lead.first_contact_channel ?? "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">First Contact Summary</dt>
              <dd className="whitespace-pre-wrap">{lead.first_contact_summary ?? "-"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Review & Quote</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Review Requested</dt>
              <dd>{formatDateTime(lead.boss_review_requested_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Review Completed</dt>
              <dd>{formatDateTime(lead.boss_review_completed_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Quote</dt>
              <dd>
                {lead.quote_amount !== null && lead.quote_currency
                  ? `${lead.quote_amount} ${lead.quote_currency}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Follow-up Due</dt>
              <dd>{lead.follow_up_due_date ?? "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Consultation Summary</dt>
              <dd className="whitespace-pre-wrap">{lead.consultation_summary ?? "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Medical Summary</dt>
              <dd className="whitespace-pre-wrap">{lead.medical_summary ?? "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Quote Summary</dt>
              <dd className="whitespace-pre-wrap">{lead.quote_summary ?? "-"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Internal Notes</h3>
        <dl className="grid gap-2 text-sm md:grid-cols-3">
          <div>
            <dt className="text-slate-500">Follow-up Owner</dt>
            <dd>{lead.follow_up_owner_name ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Lost Reason</dt>
            <dd>{lead.lost_reason ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd>{formatDateTime(lead.created_at)}</dd>
          </div>
          <div className="md:col-span-3">
            <dt className="text-slate-500">Notes</dt>
            <dd className="whitespace-pre-wrap">{lead.notes ?? "-"}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Follow-up History</h3>
            <p className="text-xs text-slate-500">{followups.length} entries</p>
          </div>

          {followups.length === 0 ? (
            <p className="text-sm text-slate-500">No follow-ups logged yet.</p>
          ) : (
            <div className="space-y-3">
              {followups.map((followup) => (
                <div key={followup.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {followup.follow_up_date} • {followup.channel}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{followup.status}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{followup.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Next due: {followup.next_due_date ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <LeadFollowupForm action={addLeadFollowupAction} leadId={lead.id} defaultDate={todayDate()} />
      </div>
    </section>
  );
}
