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

type UserFormData = z.infer<typeof userFormSchema>;

export function UserForm({
  userDetail,
  onSuccess,
}: {
  userDetail: UserDetail;
  onSuccess?: () => void;
}) {
  const { name, email, phone, id } = userDetail.user;
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues: {
      name,
      email,
      phone,
    },
  });

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
        Object.entries(result.errors).forEach(([ field, messages ]) => {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`);
          });
        });
      }
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Failed to update user:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >

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
        <div className='flex justify-end'>
          <Button
            type="submit"
            className='w-full my-4'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </div>

      </form >
    </Form >
  );
}
