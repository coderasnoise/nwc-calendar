import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

type LoginLogRow = {
  id: string;
  user_email: string | null;
  logged_in_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

function displayValue(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "—";
  }
  return value;
}

export default async function LoginLogsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: viewer } = await supabase
    .from("login_log_viewers")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!viewer) {
    notFound();
  }

  const { data, error } = await supabase
    .from("login_logs")
    .select("id, user_email, logged_in_at, ip_address, user_agent")
    .order("logged_in_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error(error.message);
  }

  const logs = (data ?? []) as LoginLogRow[];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Login Logs</h2>
        <p className="mt-1 text-sm text-slate-500">Private login access log (separate from audit).</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">IP</th>
                <th className="px-4 py-3 font-semibold">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={4}>
                    No login logs yet.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-4 py-3">{new Date(log.logged_in_at).toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3">{displayValue(log.user_email)}</td>
                    <td className="px-4 py-3">{displayValue(log.ip_address)}</td>
                    <td className="px-4 py-3">{displayValue(log.user_agent)}</td>
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
