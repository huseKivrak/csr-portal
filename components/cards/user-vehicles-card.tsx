import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserDetail } from '@/db/types';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/lib/db/constants';




export function UserVehiclesCard({ userDetail }: { userDetail: UserDetail; }) {
  const { vehicles, subscriptions } = userDetail;

  const vehicleSubscription = (vehicleId: number) => {
    return subscriptions.find((subscription) => subscription.vehicle_id === vehicleId);
  };

  const vehicleWashes = (vehicleId: number) => {
    return userDetail.washes.filter((wash) => wash.vehicle_id === vehicleId);
  };

  return (
    <Card className="bg-background-light dark:bg-background-dark">
      <CardHeader>
        <CardTitle>Vehicles</CardTitle>
        <CardDescription>Registered vehicles and their details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">

          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {`${vehicle.make.charAt(0)}${vehicle.model.charAt(0)}`}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    License: {vehicle.license_plate}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {vehicleSubscription(vehicle.id) && (
                  <Badge variant="outline">
                    {SUBSCRIPTION_PLANS.find((plan) => plan.id === vehicleSubscription(vehicle.id)?.plan_id)?.name}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground">
                  Washes: {vehicleWashes(vehicle.id).length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}