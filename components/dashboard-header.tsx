
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BadgeDollarSign, IdCard, Users2 } from 'lucide-react';




interface DashboardHeader {
  data: {
    totalActiveUsers: number;
    usersWithOverdueSubscriptions: number;
    subscriptionStatusCount: { status: string; count: number; }[];

  };
}

export default function DashboardHeader({ data }: DashboardHeader) {
  const {
    totalActiveUsers,
    usersWithOverdueSubscriptions,
    subscriptionStatusCount,
  } = data;

  const activeSubscriptions = subscriptionStatusCount.find(
    (s) => s.status === 'active'
  )?.count || 0;

  return (
    <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium whitespace-nowrap mr-2'>
            Total Active Users
          </CardTitle>
          <Users2 className='text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalActiveUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium whitespace-nowrap mr-2'>
            Active Subscriptions
          </CardTitle>
          <IdCard className='text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{activeSubscriptions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium whitespace-nowrap mr-2'>
            Overdue Subscriptions
          </CardTitle>
          <BadgeDollarSign className='text-red-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{usersWithOverdueSubscriptions}</div>
        </CardContent>
      </Card>
    </div>
  );
}