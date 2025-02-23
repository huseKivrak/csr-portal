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
import { AlertCircle, Car, Check, ChevronsUpDown } from 'lucide-react';
import { Separator } from '../ui/separator';


import { VehicleForm } from './vehicle-form';
import { Input } from '../ui/input';
import { useState } from 'react';
import { PaymentMethodForm } from './payment-method-form';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTitle } from '../ui/alert';
import { ServerAction } from '@/lib/db/actions/types';

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

export function SubscriptionForm({ userDetail,
  onSuccess
}: {
  userDetail: UserDetail;
  onSuccess?: () => void;
}) {

  const [ openVehicleForm, setOpenVehicleForm ] = useState(false);
  const [ openPaymentMethodForm, setOpenPaymentMethodForm ] = useState(false);
  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    mode: 'onChange',
    defaultValues: {
      user_id: userDetail.user.id,
      vehicle_id: 0,
      plan_id: 0,
      payment_method_id: 0,
    },
  });

  //Watchers for selected plan and vehicle
  const selectedPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.id === form.watch('plan_id')
  );
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

      const result: ServerAction = await createSubscriptionAction(data);

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
        onSubmit={form.handleSubmit(onSubmit)
        }
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">New Subscription</h2>
          <FormDescription>
            {`Add a new subscription by selecting ${userDetail.user.name.split(' ')[ 0 ]}'s vehicle, plan, and payment method.`}
          </FormDescription>
        </div>

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
                        "w-full justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? (
                          <span className="font-semibold tracking-wider">
                            {SUBSCRIPTION_PLANS.find(
                              (plan) => plan.id === field.value
                            )?.label} Plan
                          </span>
                        ) : "Select plan"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-100">
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
                            value={String(plan.id)}
                            key={plan.id}
                            onSelect={() => {
                              form.setValue("plan_id", plan.id, {
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                              form.setValue("remaining_washes", plan.washes_per_month);
                            }}

                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{plan.label}</span>
                              <span className="text-sm text-muted-foreground">
                                {plan.description}
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
                  <div className="flex  items-center gap-2 whitespace-nowrap ml-2">
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

        <FormField
          control={form.control}
          name="vehicle_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Vehicle</FormLabel>
              <div className="flex items-center gap-2">
                {userDetail.vehicles.every(vehicle => isVehicleSubscribed(vehicle.id)) ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled
                  >
                    <AlertCircle className='h-4 w-4 text-destructive' />
                    None available
                  </Button>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
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
                                    value={String(vehicle.id)}
                                    onSelect={() => {
                                      if (!subscribed) {
                                        form.setValue("vehicle_id", Number(vehicle.id), {
                                          shouldTouch: true,
                                          shouldValidate: true,
                                        });
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
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert variant='default' className='bg-muted w-full my-4 '>
          <div className='flex gap-2'>
            <AlertCircle className='h-6 w-6 text-destructive' />
            <AlertTitle className='text-base lg:text-lg font-medium italic tracking-wide text-start'>No available vehicles?</AlertTitle>
          </div>

          <AlertDescription className=' mb-1'>
            If no unsubscribed vehicles are available, register a new one to start a subscription.
          </AlertDescription>

          <Popover open={openVehicleForm} onOpenChange={setOpenVehicleForm}>
            <PopoverTrigger asChild >
              <Button
                type="button"
                variant="outline"
                className='w-full bg-background border-chart-2 hover:bg-chart-2/50 hover:text-background dark:hover:text-foreground '
              >
                <Car className='h-10 w-10 text-chart-2' />
                <span className='text-base'>
                  Add Vehicle
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <VehicleForm userDetail={userDetail} onSuccess={() => setOpenVehicleForm(false)} />
            </PopoverContent>
          </Popover>

        </Alert>

        <FormField
          control={form.control}
          name="payment_method_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Payment Method</FormLabel>
              <div className="flex items-center gap-2">
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
                                form.setValue("payment_method_id", method.id, {
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
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

                <Popover open={openPaymentMethodForm} onOpenChange={setOpenPaymentMethodForm}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-3"
                    >
                      Add
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px]">
                    <PaymentMethodForm userDetail={userDetail} onSuccess={() => setOpenPaymentMethodForm(false)} />
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button
          type="submit"
          className='w-full my-4'
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Adding..."
            : "Add Subscription"}
        </Button>

      </form>
    </Form>
  );
};
