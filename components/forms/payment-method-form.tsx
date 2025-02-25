'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { paymentMethodFormSchema } from '@/db/validation';
import { createPaymentMethodAction } from '@/lib/db/actions/purchaseMethods';
import { CSRFormProps, ServerAction } from '@/lib/db/actions/types';


type PaymentMethodFormData = z.infer<typeof paymentMethodFormSchema>;

export function PaymentMethodForm({
  userDetail,
  onSuccess,
}: CSRFormProps) {
  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodFormSchema),
    mode: 'onChange',
    defaultValues: {
      user_id: userDetail.user.id,
      card_last4: 1000,
      card_exp_month: 1,
      card_exp_year: 2025,
      is_default: false,
    },
  });

  async function onSubmit(data: PaymentMethodFormData) {
    try {
      const result: ServerAction = await createPaymentMethodAction(data);
      if (result.success) {
        toast.success('Payment method added successfully');
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
      toast.error('Failed to add payment method');
      console.error('Failed to add payment method:', error);
    }
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={(e) => {
        e.stopPropagation();
        form.handleSubmit(onSubmit)(e);
      }}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">New Payment Method</h2>
          <FormDescription>
            {`Enter your card details to add a payment method to ${userDetail.user.name.split(' ')[ 0 ]}'s account.`}
          </FormDescription>
        </div>

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
            name="card_last4"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Card Number (last 4 digits)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={4}
                    placeholder="1234"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="card_exp_month"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Expiration Month</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="MM"
                      maxLength={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="card_exp_year"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Expiration Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="YYYY"
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="is_default"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="default-payment"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="default-payment" className="text-sm font-medium leading-none">
                    Set as default payment method
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full my-4"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Adding..." : "Add Payment Method"}
          </Button>
        </div>
      </form>
    </Form>
  );
}