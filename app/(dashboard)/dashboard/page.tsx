import { OpsPanel } from "@/components/dashboard/ops-panel";
import { getDashboardWindow, listDashboardPatients } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const { start, end } = getDashboardWindow();
  const patients = await listDashboardPatients(start, end);

  return <OpsPanel patients={patients} startDate={start} endDate={end} />;
}
