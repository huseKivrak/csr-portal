'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { userFormSchema } from '@/db/validation';
import { revalidatePath } from 'next/cache';
import { ServerAction } from './types';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { csrNoteSchema } from '@/components/forms/csr-user-note-form';

export async function updateUserAction(
  inputs: z.infer<typeof userFormSchema> & { id: number; }
): Promise<ServerAction> {
  let result: ServerAction;
  try {
    //todo: remove after updating userFormSchema
    const updateUserSchema = userFormSchema.extend({
      id: z.number().positive(),
    });


    const parsedInputs = updateUserSchema.safeParse(inputs);

    if (!parsedInputs.success) {
      return {
        success: false,
        errors: parsedInputs.error.flatten().fieldErrors,
      };
    }

    // Extract validated data
    const { id, ...userData } = parsedInputs.data;

    // Update the user
    const data = await db
      .update(users)
      .set({
        ...userData,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    result = {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to update user:', error);
    return {
      success: false,
      errors: {
        form: [ 'Failed to update user. Please try again.' ],
      },
    };
  }

  revalidatePath(`/users/${inputs.id}`);
  return result;
}


export async function addCSRNoteAction(
  inputs: z.infer<typeof csrNoteSchema> & { userId: number; }
): Promise<ServerAction> {
  let result: ServerAction;
  try {
    const { userId, csr_notes } = inputs;

    const data = await db
      .update(users)
      .set({
        csr_notes: csr_notes,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    result = {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to add CSR note:', error);
    return {
      success: false,
      errors: {
        form: [ 'Failed to add CSR note. Please try again.' ],
      },
    };
  }

  revalidatePath(`/users/${inputs.userId}`);
  return result;
}
