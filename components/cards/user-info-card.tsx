import { User, Receipt, Circle, IdCard } from "lucide-react";
import { UserDetail } from "@/db/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, makeVehicleTitle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserInfoCard({ userDetail }: { userDetail: UserDetail; }) {
  const { subscriptions, is_overdue, vehicles } = userDetail;
  // Get last 5 payments and washes
  const recentPayments = userDetail.payments?.slice(0, 5) || [];

  const getVehicleTitle = (vehicleId: number) => {
    if (!vehicleId) return 'No vehicle';
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle ? makeVehicleTitle(vehicle) : 'Unknown Vehicle';
  };

  return (
    <Card className="w-full px-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">
            {userDetail.user.name}
          </CardTitle>
          <CardDescription>
            Member since {formatDateTime(userDetail.user.created_at, false)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-3">
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              <h3 className="font-medium">Active Subscriptions</h3>
            </div>
            {subscriptions.length > 0 ? (
              <div className="space-y-2">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between text-sm border-b pb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`h-3 w-3 fill-current ${is_overdue ? 'text-destructive' : 'text-green-600'
                          }`}
                      />
                      <span className="text-muted-foreground">
                        {getVehicleTitle(subscription.vehicle_id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-xs">
                        {subscription.plan.name}
                      </span>
                      <span className="text-xs">
                        {subscription.remaining_washes}/{subscription.plan.washes_per_month}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscriptions</p>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <h3 className="font-medium">Recent Payments</h3>
            </div>
            {recentPayments.length > 0 ? (
              <div className="space-y-2">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <div className="text-muted-foreground">
                      {formatDateTime(payment.created_at, false)}
                    </div>
                    <div className={payment.status === 'failed' ? 'text-red-500' : ''}>
                      {`$ ${payment.final_amount} `}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent payments</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};