import DashboardHeader from '@/components/dashboard-header';
import { getDashboardHeaderMetrics } from '@/db/queries';

export default async function DashboardPage() {

  const headerMetrics = await getDashboardHeaderMetrics();

  return (
    <DashboardHeader data={headerMetrics} />
  );
}