'use server';

import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { vehicleInsertSchema } from '@/db/types';
import { revalidatePath } from 'next/cache';
import { ServerAction } from './types';
import { z } from 'zod';

export async function createVehicleAction(
	inputs: z.infer<typeof vehicleInsertSchema>
): Promise<ServerAction> {
	let result: ServerAction;
	try {
		const parsedInputs = vehicleInsertSchema.safeParse(inputs);

		if (!parsedInputs.success) {
			return {
				success: false,
				errors: parsedInputs.error.flatten().fieldErrors,
			};
		}

		// Insert the vehicle
		const data = await db
			.insert(vehicles)
			.values({
				...parsedInputs.data,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		result = {
			success: true,
			data,
		};
	} catch (error) {
		console.error('Failed to create vehicle:', error);
		return {
			success: false,
			errors: {
				form: ['Failed to create vehicle. Please try again.'],
			},
		};
	}
	// Revalidate the vehicles page
	revalidatePath('/vehicles');
	revalidatePath('/subscriptions');

	return result;
}
