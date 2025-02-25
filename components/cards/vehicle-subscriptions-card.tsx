'use client';

import { useState } from 'react';
import { UserDetail } from '@/db/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, makeVehicleTitle } from '@/lib/utils';
import { Car, CreditCard, AlertCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { TransferSubscriptionForm } from '@/components/forms/transfer-subscription-form';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cancelSubscriptionAction } from '@/lib/db/actions/subscriptions';
import { ServerAction } from '@/lib/db/actions/types';
export function VehicleSubscriptionsCard({ userDetail }: { userDetail: UserDetail; }) {
  const { subscriptions, vehicles, is_overdue } = userDetail;
  const [ showAddSubscription, setShowAddSubscription ] = useState(false);
  const [ showTransferSubscription, setShowTransferSubscription ] = useState(false);
  const [ showCancelSubscription, setShowCancelSubscription ] = useState(false);
  const [ selectedSubscription, setSelectedSubscription ] = useState<number | null>(null);
  const [ isProcessing, setIsProcessing ] = useState(false);
  // Track selected subscription details for transfer
  const [ transferDetails, setTransferDetails ] = useState<{
    subscription_id: number;
    from_vehicle_id: number;
  } | null>(null);

  const getVehicleTitle = (vehicleId: number) => {
    if (!vehicleId) return 'No vehicle';
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle ? makeVehicleTitle(vehicle) : 'Unknown Vehicle';
  };

  const getDaysRemaining = (subscription: any) => {
    const now = new Date();
    const renewalDate = new Date(subscription.payment_due_date);
    const diffTime = Math.abs(renewalDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    setIsProcessing(true);

    try {
      const result: ServerAction = await cancelSubscriptionAction(selectedSubscription);
      if (!result.success) {
        toast.error('Failed to cancel subscription');
        console.error(result.errors);
      }

      toast.success('Subscription cancelled successfully');
      setShowCancelSubscription(false);
      setSelectedSubscription(null);
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferClick = (subscription: any) => {
    setTransferDetails({
      subscription_id: subscription.id,
      from_vehicle_id: subscription.vehicle_id,
    });
    setShowTransferSubscription(true);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Vehicle Subscriptions</CardTitle>
            <Button
              onClick={() => setShowAddSubscription(true)}
              size="sm"
            >
              Add Subscription
            </Button>
          </div>
          <CardDescription>
            Manage customer vehicle subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className={`border rounded-lg p-4 ${is_overdue ? 'border-red-300' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">
                          {getVehicleTitle(subscription.vehicle_id)}
                        </h3>
                        {is_overdue && (
                          <Badge variant="destructive" className="ml-2">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleTransferClick(subscription)}
                          >
                            <Car className="mr-2 h-4 w-4" />
                            <span>Transfer Subscription</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              toast.success('Subscription renewal processed');
                            }}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Process Renewal</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => {
                              setSelectedSubscription(subscription.id);
                              setShowCancelSubscription(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Cancel Subscription</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Plan:</span>{' '}
                        <Badge variant="outline" className="ml-1 font-medium">
                          {subscription.plan.name}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Status:</span>{' '}
                        <span className={`ml-1 ${subscription.status === 'active' ? 'text-green-500' : 'text-amber-500'}`}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Started:</span>{' '}
                        <span className="ml-1">
                          {formatDateTime(subscription.created_at, false)}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Next Renewal:</span>{' '}
                        <span className="ml-1">
                          {subscription.payment_due_date
                            ? formatDateTime(subscription.payment_due_date, false)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Washes Used</span>
                        <span>
                          {subscription.remaining_washes} of {subscription.plan.washes_per_month} remaining
                        </span>
                      </div>
                      <Progress
                        value={((subscription.plan.washes_per_month - subscription.remaining_washes) / subscription.plan.washes_per_month) * 100}
                        className="h-2"
                      />
                    </div>

                    {subscription.payment_due_date && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Billing Period</span>
                          <span>{getDaysRemaining(subscription)} days remaining</span>
                        </div>
                        <Progress
                          value={(getDaysRemaining(subscription) / 30) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {is_overdue && (
                      <div className="mt-3 text-sm text-red-500 bg-red-50 p-2 rounded flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          Payment is overdue. Customer may be unable to use this subscription
                          until payment issues are resolved.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <Car className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No Active Subscriptions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This customer doesn't have any active vehicle subscriptions.
              </p>
              <Button
                onClick={() => setShowAddSubscription(true)}
                className="mt-4"
              >
                Add Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={showAddSubscription}
        onOpenChange={setShowAddSubscription}
      >
        <SubscriptionForm
          userDetail={userDetail}
          onSuccess={() => setShowAddSubscription(false)}
        />
      </ResponsiveDialog>

      <ResponsiveDialog
        open={showTransferSubscription}
        onOpenChange={setShowTransferSubscription}
      >
        {transferDetails && (
          <TransferSubscriptionForm
            userDetail={userDetail}
            onSuccess={() => {
              setShowTransferSubscription(false);
              setTransferDetails(null);
            }}
          />
        )}
      </ResponsiveDialog>

      <Dialog open={showCancelSubscription} onOpenChange={setShowCancelSubscription}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedSubscription && (
              <div className="border rounded p-3 mb-4">
                <div className="font-medium">
                  {getVehicleTitle(
                    subscriptions.find(s => s.id === selectedSubscription)?.vehicle_id || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Plan: {subscriptions.find(s => s.id === selectedSubscription)?.plan.name}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 text-amber-500">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Cancelling this subscription will immediately end service for this vehicle.
                Any unused washes for the current billing period will be forfeited.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelSubscription(false)}
              disabled={isProcessing}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}