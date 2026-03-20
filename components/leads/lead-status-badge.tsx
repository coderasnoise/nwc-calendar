import {
  type Lead,
  type BossReviewStatus,
  type FollowUpStatus,
  type LeadStatus,
  type QuoteStatus
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const tone =
    status === "booked" ? "positive" : status === "lost" ? "alert" : "neutral";

  return <Badge tone={tone}>{formatLabel(status)}</Badge>;
}

export function BossReviewBadge({ status }: { status: BossReviewStatus }) {
  const tone =
    status === "approved" ? "positive" : status === "declined" ? "alert" : "neutral";

  return <Badge tone={tone}>Review {formatLabel(status)}</Badge>;
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const tone =
    status === "accepted" ? "positive" : status === "declined" ? "alert" : "neutral";

  return <Badge tone={tone}>Quote {formatLabel(status)}</Badge>;
}

export function FollowUpBadge({ status }: { status: FollowUpStatus }) {
  const tone =
    status === "completed" ? "positive" : status === "overdue" ? "alert" : "neutral";

  return <Badge tone={tone}>Follow-up {formatLabel(status)}</Badge>;
}

export function getEffectiveFollowUpStatus(lead: Pick<Lead, "follow_up_due_date" | "follow_up_status">) {
  if (
    lead.follow_up_due_date &&
    lead.follow_up_due_date < new Date().toISOString().slice(0, 10) &&
    lead.follow_up_status !== "completed"
  ) {
    return "overdue" satisfies FollowUpStatus;
  }

  return lead.follow_up_status;
}
