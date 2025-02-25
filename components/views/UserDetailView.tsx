"use client";

import { UserDetail } from '@/db/types';
import { UserInfoCard } from '../cards/user-info-card';
import { VehicleSubscriptionsCard } from '../cards/vehicle-subscriptions-card';
import { PaymentHistoryCard } from '../cards/payment-history-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function UserDetailView({ userDetail }: { userDetail: UserDetail; }) {
  return (
    <div className="space-y-6 p-6">
      <UserInfoCard userDetail={userDetail} />

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4">
          <VehicleSubscriptionsCard userDetail={userDetail} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <PaymentHistoryCard userDetail={userDetail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
