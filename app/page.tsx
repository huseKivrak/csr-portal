
import { generateDetailedUsersData, getDashboardMetrics } from '@/lib/db/actions/queries';
import DashboardHeader from '@/components/dashboard-header';


export default async function Home() {
  const usersData = await generateDetailedUsersData();
  const { subscriptionPlanCount, ...metrics } = await getDashboardMetrics();

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader data={{ ...metrics, usersData, subscriptionPlanCount }} />
    </div>

  );
}
