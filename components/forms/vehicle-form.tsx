'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserDetail } from "@/db/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { vehicleColorEnum } from '@/db/schema';
import { VEHICLE_COLORS } from '@/lib/db/constants';
import { createVehicleAction } from '@/lib/db/actions/vehicles';
import { vehicleFormSchema } from "@/db/validation";
import { ServerAction } from '@/lib/db/actions/types';

type VehicleColor = typeof vehicleColorEnum.enumValues[ number ];
type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export function VehicleForm({
  userDetail,
  onSuccess
}: {
  userDetail: UserDetail;
  onSuccess?: () => void;
}) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    mode: "onChange",
    defaultValues: {
      user_id: userDetail.user.id,
      make: "",
      model: "",
      color: vehicleColorEnum.enumValues[ 0 ],
      year: 1900,
      license_plate: "",
    },
  });

  async function onSubmit(data: VehicleFormData) {
    try {
      const result: ServerAction = await createVehicleAction(data);

      if (result.success) {
        toast.success("Vehicle added successfully");
        form.reset();

        //callback if form is in dialog
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Handle validation/server errors
        Object.entries(result.errors).forEach(([ field, messages ]) => {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`);
          });
        });
      }
    } catch (error) {
      toast.error("Failed to add vehicle");
      console.error("Failed to add vehicle:", error);
    }
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={(e) => {
        e.stopPropagation();
        form.handleSubmit(onSubmit)(e);
      }}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">New Vehicle</h2>
          <FormDescription>
            {`Enter the details below to add a vehicle to ${userDetail.user.name.split(' ')[ 0 ]}'s account.`}
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
          name="make"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Make</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Toyota" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Camry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Color</FormLabel>
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
                      {field.value
                        ? VEHICLE_COLORS.find(
                          (color) => color.value === field.value
                        )?.label
                        : "Select color"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search colors..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No color found.</CommandEmpty>
                      <CommandGroup>
                        {VEHICLE_COLORS.map((color) => (
                          <CommandItem
                            key={color.value}
                            value={color.value}
                            onSelect={(currentValue: string) => {
                              form.setValue("color", currentValue as VehicleColor);
                            }}
                          >
                            {color.label}
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                color.value === field.value
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

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 2024"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_plate"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ABC123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full my-4"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Adding..." : "Add Vehicle"}
        </Button>

      </form>
    </Form>
  );
}

