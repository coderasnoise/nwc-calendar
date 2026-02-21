import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(dashboard)/actions";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  noStore();

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Clinic Ops</p>
            <h1 className="text-xl font-semibold text-slate-900">Medical Calendar MVP</h1>
            <p className="text-xs text-slate-500">Signed in as {user.email}</p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="secondary">
              Logout
            </Button>
          </form>
        </div>
        <DashboardNav />
      </Card>
      {children}
    </div>
  );
}
