'use client';

import { createSubscriptionAction } from '@/lib/db/actions/subscriptions';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { UserDetail, SelectPaymentMethod } from "@/db/types";
import { subscriptionFormSchema } from "@/db/validation";
import { cn, makeVehicleTitle } from '@/lib/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/db/constants';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card } from "@/components/ui/card";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { VehicleForm } from './vehicle-form';
import { Input } from '../ui/input';
import { useState } from 'react';

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

export function SubscriptionForm({ userDetail,
  onSuccess
}: {
  userDetail: UserDetail;
  onSuccess?: () => void;
}) {

  const [ openVehicleForm, setOpenVehicleForm ] = useState(false);

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    mode: "onBlur",
    defaultValues: {
      user_id: userDetail.user.id,
      vehicle_id: userDetail.vehicles[ 0 ]?.id || 0,
      plan_id: 1,
      payment_method_id: userDetail.payment_methods[ 0 ]?.id || 0,
    },
  });

  //Watch the plan to update the description
  const selectedPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.id === form.watch('plan_id')
  );

  //Watch the vehicle for subscription check below
  const selectedVehicleId = form.watch('vehicle_id');
  const selectedVehicle = userDetail.vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId
  );


  // Helper function for disabling vehicles with active subscriptions
  const isVehicleSubscribed = (vehicleId: number) => {
    return userDetail.subscriptions.some(
      (subscription) =>
        subscription.vehicle_id === vehicleId &&
        subscription.status === 'active'
    );
  };

  // Helper function to format payment method display
  const formatPaymentMethod = (method: SelectPaymentMethod) => {
    return `•••• ${method.card_last4} (expires ${method.card_exp_month}/${method.card_exp_year})`;
  };


  async function onSubmit(data: SubscriptionFormData) {
    try {
      data.user_id = userDetail.user.id;
      const result = await createSubscriptionAction(data);

      if (result.success) {
        toast.success('Subscription created successfully');
        form.reset();

        //callback if form is in dialog
        onSuccess && onSuccess();
      } else {
        // Handle validation/server errors
        Object.entries(result.errors).forEach(([ field, messages ]) => {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`);
          });
        });
      }
    } catch (error) {
      toast.error('Failed to create subscription');
      console.error('Failed to create subscription:', error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">New Subscription</h2>
              <p className="text-sm text-muted-foreground">
                Choose your vehicle, plan, and payment method
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">

                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Vehicle</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-[200px] justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedVehicle
                                ? makeVehicleTitle(selectedVehicle)
                                : "Select vehicle"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search vehicles..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No vehicles found.</CommandEmpty>
                              <CommandGroup>
                                {userDetail.vehicles
                                  .map((vehicle) => {
                                    const subscribed = isVehicleSubscribed(vehicle.id);
                                    return (
                                      <CommandItem
                                        key={vehicle.id}
                                        value={makeVehicleTitle(vehicle)}
                                        onSelect={() => {
                                          if (!subscribed) {
                                            form.setValue("vehicle_id", vehicle.id);
                                          }
                                        }}
                                        disabled={subscribed}
                                        className={cn(
                                          "flex items-center gap-2",
                                          subscribed && "cursor-not-allowed opacity-50"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {makeVehicleTitle(vehicle)}
                                          </span>
                                          {subscribed && (
                                            <span className="text-xs text-muted-foreground">
                                              Subscribed
                                            </span>
                                          )}
                                        </div>
                                        {!subscribed && (
                                          <Check
                                            className={cn(
                                              "h-4 w-4 shrink-0",
                                              vehicle.id === field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                        )}
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Sheet open={openVehicleForm} onOpenChange={setOpenVehicleForm}>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      Add New Vehicle
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xl">
                    <SheetHeader>
                      <SheetTitle>Add New Vehicle</SheetTitle>
                      <SheetDescription>
                        Enter the customer's vehicle details below
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <VehicleForm userDetail={userDetail} onSuccess={() => setOpenVehicleForm(false)} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Plan</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? SUBSCRIPTION_PLANS.find(
                                (plan) => plan.id === field.value
                              )?.name
                              : "Select plan"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search plans..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No plans found.</CommandEmpty>
                            <CommandGroup>
                              {SUBSCRIPTION_PLANS.map((plan) => (
                                <CommandItem
                                  value={plan.name}
                                  key={plan.id}
                                  onSelect={() => {
                                    form.setValue("plan_id", plan.id!);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{plan.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      ${plan.price}/mo • {plan.washes_per_month} washes
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      plan.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {selectedPlan && (
                        <div className="flex items-center gap-2  whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {selectedPlan.washes_per_month} washes
                          </span>
                          <Separator orientation='vertical' className='h-4' />
                          <span className="text-sm text-muted-foreground">
                            ${selectedPlan.price}/mo
                          </span>
                        </div>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_method_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Method</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[300px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? formatPaymentMethod(
                              userDetail.payment_methods.find(m => m.id === field.value)!
                            )
                            : "Select payment method"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search payment methods..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No payment methods found.</CommandEmpty>
                          <CommandGroup>
                            {userDetail.payment_methods.map((method) => (
                              <CommandItem
                                key={method.id}
                                value={String(method.id)}
                                onSelect={() => {
                                  form.setValue("payment_method_id", method.id);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {formatPaymentMethod(method)}
                                  {method.is_default && (
                                    <span className="text-xs text-muted-foreground">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    method.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-[200px]"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Complete Subscription"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
