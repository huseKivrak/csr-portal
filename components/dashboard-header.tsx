'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BadgeDollarSign, ExternalLink, IdCard, Users2 } from 'lucide-react';
import { UsersAutocomplete } from './user-autocomplete';
import { UserDetail } from '@/db/types';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface DashboardHeader {
  data: {
    usersData: UserDetail[];
    totalActiveUsers: number;
    usersWithOverdueSubscriptions: number;
    subscriptionStatusCount: { status: string; count: number; }[];
    subscriptionPlanCount: { plan: string; count: number; }[];
  };
}

export default function DashboardHeader({ data }: DashboardHeader) {
  const {
    totalActiveUsers,
    usersWithOverdueSubscriptions,
    subscriptionStatusCount,
  } = data;
  const router = useRouter();
  const activeSubscriptions = subscriptionStatusCount.find(
    (s) => s.status === 'active'
  )?.count || 0;

  const users = data.usersData.map((user) => ({
    name: user.user.name,
    id: user.user.id,
  }));

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold tracking-widest font-mono my-4">AMP Customer Service Portal</h1>
      <div className="bg-card rounded-lg p-4 mb-6 border shadow-sm">
        <div className="flex flex-col gap-3 mb-4">
          <UsersAutocomplete users={users} />
          <Button
            onClick={() => router.push('/users')}
            variant="secondary"
          >
            View all Users
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Users
              </CardTitle>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Users2 className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalActiveUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active user accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <IdCard className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Current active subscriptions</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Subscriptions
              </CardTitle>
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <BadgeDollarSign className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usersWithOverdueSubscriptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Subscriptions requiring attention</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}