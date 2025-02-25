'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { updateUserAction } from '@/lib/db/actions/users';
import { UserDetail } from '@/db/types';
import { userFormSchema } from '@/db/validation';
import { ServerAction } from '@/lib/db/actions/types';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserFormData = z.infer<typeof userFormSchema>;

export function UserForm({
  userDetail,
  onSuccess,
}: {
  userDetail: UserDetail;
  onSuccess?: () => void;
}) {
  const { name, email, phone, address, id, account_status } = userDetail.user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: name || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      account_status: account_status || 'active',
    },
  });

  // Force validation on mount
  useEffect(() => {
    form.trigger();
  }, [ form ]);

  async function onSubmit(data: UserFormData) {
    try {
      const result: ServerAction = await updateUserAction({
        id,
        ...data,
      });

      if (result.success) {
        toast.success('User updated successfully');
        onSuccess && onSuccess();
      } else {
        // Handle validation/server errors
        if (result.errors && Object.keys(result.errors).length > 0) {
          Object.entries(result.errors).forEach(([ field, messages ]) => {
            messages.forEach(message => {
              toast.error(`${field}: ${message}`);
            });
          });
        } else {
          toast.error('Unknown error occurred');
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <FormDescription>
            {`Edit ${name}'s details.`}
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormDescription>Edit customer&apos;s name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='john@doe.com' {...field} />
              </FormControl>
              <FormDescription>Edit customer&apos;s email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='123-456-7890' {...field} />
              </FormControl>
              <FormDescription>Edit customer&apos;s phone number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder='123 Main St' {...field} />
              </FormControl>
              <FormDescription>Edit customer&apos;s address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='account_status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Set the user's account status</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button
            type="submit"
            className='w-full my-4'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
