"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subscriptionTransferFormSchema } from '@/db/validation';
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, makeVehicleTitle } from "@/lib/utils";
import { transferSubscriptionAction } from "@/lib/db/actions/subscriptions";
import { CSRFormProps, ServerAction } from '@/lib/db/actions/types';

type TransferFormData = z.infer<typeof subscriptionTransferFormSchema>;


export function TransferSubscriptionForm({
  userDetail,
  onSuccess
}: CSRFormProps) {
  const activeSubscriptions = userDetail.subscriptions.filter(sub => sub.status === 'active');

  const [ subscriptionPopoverOpen, setSubscriptionPopoverOpen ] = useState(false);
  const [ vehiclePopoverOpen, setVehiclePopoverOpen ] = useState(false);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(subscriptionTransferFormSchema),
    mode: "onChange",
    defaultValues: {
      subscription_id: 0,
      from_vehicle_id: 0,
      to_vehicle_id: 0,
      transfer_reason: "",
    },
  });

  const watchedFromVehicleId = form.watch('from_vehicle_id');

  async function onSubmit(data: TransferFormData) {
    try {
      const result: ServerAction = await transferSubscriptionAction(data);

      if (result.success) {
        toast.success("Subscription transferred successfully");
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        Object.entries(result.errors).forEach(([ field, messages ]) => {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`);
          });
        });
      }
    } catch (error) {
      toast.error("Failed to transfer subscription");
      console.error("Failed to transfer subscription:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Transfer Subscription</h2>
          <FormDescription>
            Transfer an active subscription to another vehicle
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="subscription_id"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Active Subscription</FormLabel>
              <Popover open={subscriptionPopoverOpen} onOpenChange={setSubscriptionPopoverOpen}>
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
                      {field.value ? (
                        (() => {
                          const subscription = activeSubscriptions.find(s => s.id === field.value);
                          const vehicle = userDetail.vehicles.find(v => v.id === subscription?.vehicle_id);
                          return vehicle ? makeVehicleTitle(vehicle) : "Select subscription";
                        })()
                      ) : (
                        "Select subscription"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search subscriptions..." />
                    <CommandList>
                      <CommandEmpty>No active subscriptions found.</CommandEmpty>
                      <CommandGroup>
                        {activeSubscriptions.map(sub => {
                          const vehicle = userDetail.vehicles.find(v => v.id === sub.vehicle_id);
                          return (
                            <CommandItem
                              key={sub.id}
                              value={sub.id.toString()}
                              onSelect={() => {
                                form.setValue("subscription_id", sub.id);
                                form.setValue("from_vehicle_id", sub.vehicle_id);
                                setSubscriptionPopoverOpen(false);
                              }}
                            >
                              {vehicle && makeVehicleTitle(vehicle)}
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4",
                                  sub.id === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
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

        <FormField
          control={form.control}
          name="to_vehicle_id"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Transfer To Vehicle</FormLabel>
              <Popover open={vehiclePopoverOpen} onOpenChange={setVehiclePopoverOpen}>
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
                      {field.value
                        ? makeVehicleTitle(userDetail.vehicles.find(v => v.id === field.value)!)
                        : "Select vehicle"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search vehicles..." />
                    <CommandList>
                      <CommandEmpty>No available vehicles found.</CommandEmpty>
                      <CommandGroup>
                        {userDetail.vehicles
                          .filter(v => v.id !== watchedFromVehicleId)
                          .map(vehicle => (
                            <CommandItem
                              key={vehicle.id}
                              value={vehicle.id.toString()}
                              onSelect={() => {
                                form.setValue("to_vehicle_id", vehicle.id);
                                setVehiclePopoverOpen(false);
                              }}
                            >
                              {makeVehicleTitle(vehicle)}
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4",
                                  vehicle.id === field.value ? "opacity-100" : "opacity-0"
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

        <FormField
          control={form.control}
          name="transfer_reason"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Transfer Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter reason for transfer"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className='w-full my-4'
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Transferring..." : "Transfer Subscription"}
        </Button>
      </form>
    </Form>
  );
}

