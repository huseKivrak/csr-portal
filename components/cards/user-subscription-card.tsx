import { Circle } from "lucide-react";
import { UserDetail } from "@/db/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { makeVehicleTitle } from "@/lib/utils";

interface UserSubscriptionCardProps {
  userDetail: UserDetail;
}

export function UserSubscriptionCard({ userDetail }: UserSubscriptionCardProps) {
  const { subscriptions, is_overdue, vehicles } = userDetail;

  const getVehicleTitle = (vehicleId: number) => {
    if (!vehicleId) return 'No vehicle';
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle ? makeVehicleTitle(vehicle) : 'Unknown Vehicle';
  };

  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="h-6 py-1 text-sm">Status</TableHead>
          <TableHead className="h-6 py-1 text-sm">Vehicle</TableHead>
          <TableHead className="h-6 py-1 text-sm">Plan</TableHead>
          <TableHead className="h-6 py-1 text-sm">Washes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow key={subscription.id}>
            <TableCell className="py-1">
              <div className="flex items-center justify-center">
                <Circle className={`h-3 w-3 fill-current ${is_overdue ? 'text-destructive' : 'text-green-600'}`} />
              </div>
            </TableCell>
            <TableCell className="py-1 text-[10px] tracking-tight text-center">
              {getVehicleTitle(subscription.vehicle_id)}
            </TableCell>
            <TableCell className="py-1 text-[10px] uppercase text-center">
              {subscription.plan.name}
            </TableCell>
            <TableCell className="py-1 text-center">
              {subscription.remaining_washes}/{subscription.plan.washes_per_month}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}