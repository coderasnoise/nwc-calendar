import Link from "next/link";
import { createLeadAction } from "@/app/(dashboard)/leads/actions";
import { LeadForm } from "@/components/leads/lead-form";
import { buttonStyles } from "@/components/ui/button";

export default async function NewLeadPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">New Lead</h2>
          <p className="mt-1 text-sm text-slate-500">Create a lead manually from inbound messages or lead center.</p>
        </div>
        <Link href="/leads" className={buttonStyles({ variant: "ghost" })}>
          Back
        </Link>
      </div>

      <LeadForm action={createLeadAction} mode="create" error={error} />
    </section>
  );
}
