'use server';

import { db } from '@/db';
import { paymentMethods } from '@/db/schema';
import { paymentMethodFormSchema } from '@/db/validation';
import { revalidatePath } from 'next/cache';
import { ServerAction } from './types';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';

export async function createPaymentMethodAction(
  inputs: z.infer<typeof paymentMethodFormSchema>
): Promise<ServerAction> {
  let result: ServerAction;

  try {
    const parsedInputs = paymentMethodFormSchema.safeParse(inputs);

    if (!parsedInputs.success) {
      return {
        success: false,
        errors: parsedInputs.error.flatten().fieldErrors,
      };
    }

    const data = await db
      .insert(paymentMethods)
      .values({
        ...parsedInputs.data,
      })
      .returning();

    //If set as default, update previous default method to false
    if (parsedInputs.data.is_default) {
      await db
        .update(paymentMethods)
        .set({ is_default: false })
        .where(
          and(
            eq(paymentMethods.user_id, parsedInputs.data.user_id),
            eq(paymentMethods.is_default, true)
          )
        );
    }

    result = {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to create payment method:', error);
    return {
      success: false,
      errors: {
        form: [ 'Failed to create payment method. Please try again.' ],
      },
    };
  }

  revalidatePath('/');
  return result;
}