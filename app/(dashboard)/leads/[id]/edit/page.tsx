import Link from "next/link";
import { ensureLeadExists, updateLeadAction } from "@/app/(dashboard)/leads/actions";
import { LeadForm } from "@/components/leads/lead-form";
import { buttonStyles } from "@/components/ui/button";

export default async function EditLeadPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const lead = await ensureLeadExists(id);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Edit Lead</h2>
          <p className="mt-1 text-sm text-slate-500">{lead.full_name}</p>
        </div>
        <Link href={`/leads/${lead.id}`} className={buttonStyles({ variant: "ghost" })}>
          Back
        </Link>
      </div>

      <LeadForm action={updateLeadAction} mode="edit" lead={lead} error={error} />
    </section>
  );
}
