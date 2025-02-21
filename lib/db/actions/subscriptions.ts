'use server';

import { revalidatePath } from 'next/cache';
import { SUBSCRIPTION_PLANS } from '@/lib/db/constants';
import { subscriptions, payments } from '@/db/schema';
import { db } from '@/db';
import { subscriptionFormSchema } from '@/db/validation';
import { ServerAction } from './types';
import { z } from 'zod';

export const createSubscriptionAction = async (
	inputs: z.infer<typeof subscriptionFormSchema>
): Promise<ServerAction> => {
	let result: ServerAction;

	try {
		const parsedInputs = subscriptionFormSchema.safeParse(inputs);

		if (!parsedInputs.success) {
			result = {
				success: false,
				errors: parsedInputs.error.flatten().fieldErrors,
			};
			return result;
		}

		const plan = SUBSCRIPTION_PLANS.find((p) => p.id === parsedInputs.data.plan_id);

		if (!plan) {
			result = {
				success: false,
				errors: { plan_id: ['Invalid plan selected'] },
			};
			return result;
		}

		const [newSubscription] = await db.transaction(async (tx) => {
			// Create subscription
			const [subscription] = await tx
				.insert(subscriptions)
				.values({
					user_id: parsedInputs.data.user_id!,
					vehicle_id: parsedInputs.data.vehicle_id,
					plan_id: parsedInputs.data.plan_id,
					remaining_washes: plan.washes_per_month,
					billing_period_start: new Date(),
					payment_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
					status: 'active',
				})
				.returning();

			// Create payment
			await tx.insert(payments).values({
				user_id: parsedInputs.data.user_id!,
				payment_method_id: parsedInputs.data.payment_method_id,
				base_amount: plan.price,
				discount_amount: '0.00',
				final_amount: plan.price,
				status: 'paid',
				item_type: 'subscription',
				subscription_id: subscription.id,
			});

			return [subscription];
		});

		result = {
			success: true,
			data: newSubscription,
		};
	} catch (error) {
		console.error('Subscription creation failed:', error);
		result = {
			success: false,
			errors: {
				form: ['Failed to create subscription. Please try again.'],
			},
		};
	}

	// Revalidate paths after action completes
	revalidatePath('/subscriptions');
	revalidatePath('/dashboard');

	return result;
};
