'use server';

import { revalidatePath } from 'next/cache';
import { SUBSCRIPTION_PLANS } from '@/lib/db/constants';
import { subscriptions, payments, subscriptionTransfers } from '@/db/schema';
import { db } from '@/db';
import { subscriptionFormSchema, subscriptionTransferFormSchema } from '@/db/validation';
import { ServerAction } from './types';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

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
					remaining_washes: parsedInputs.data.remaining_washes,
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

export const transferSubscriptionAction = async (
	inputs: z.infer<typeof subscriptionTransferFormSchema>
): Promise<ServerAction> => {
	let result: ServerAction;

	try {
		const parsedInputs = subscriptionTransferFormSchema.safeParse(inputs);

		if (!parsedInputs.success) {
			result = {
				success: false,
				errors: parsedInputs.error.flatten().fieldErrors,
			};
			return result;
		}

		const [transfer] = await db.transaction(async (tx) => {
			// Create transfer record
			const [transfer] = await tx
				.insert(subscriptionTransfers)
				.values({
					subscription_id: parsedInputs.data.subscription_id,
					from_vehicle_id: parsedInputs.data.from_vehicle_id,
					to_vehicle_id: parsedInputs.data.to_vehicle_id,
					transfer_reason: parsedInputs.data.transfer_reason,
					transferred_by: 'CSR',
				})
				.returning();

			// Update old subscription status to transferred
			await tx
				.update(subscriptions)
				.set({
					status: 'transferred',
					updated_at: new Date(),
				})
				.where(eq(subscriptions.id, parsedInputs.data.subscription_id));

			// Create new subscription for the target vehicle
			const [oldSubscription] = await tx
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.id, parsedInputs.data.subscription_id));

			// Create new subscription with same details but new vehicle
			const [newSubscription] = await tx
				.insert(subscriptions)
				.values({
					user_id: oldSubscription.user_id,
					vehicle_id: parsedInputs.data.to_vehicle_id,
					plan_id: oldSubscription.plan_id,
					remaining_washes: oldSubscription.remaining_washes,
					billing_period_start: oldSubscription.billing_period_start,
					payment_due_date: oldSubscription.payment_due_date,
					status: 'active',
				})
				.returning();

			return [transfer, newSubscription];
		});

		result = {
			success: true,
			data: [transfer],
		};
	} catch (error) {
		console.error('Subscription transfer failed:', error);
		result = {
			success: false,
			errors: {
				form: ['Failed to transfer subscription. Please try again.'],
			},
		};
	}

	revalidatePath('/');
	return result;
};

export const cancelSubscriptionAction = async (
	subscription_id: string | number
): Promise<ServerAction> => {
	let result: ServerAction;

	const subscriptionId =
		typeof subscription_id === 'string' ? parseInt(subscription_id) : subscription_id;
	const subscription = await db.query.subscriptions.findFirst({
		where: eq(subscriptions.id, subscriptionId),
	});

	if (!subscription) {
		result = {
			success: false,
			errors: { subscription_id: ['Subscription not found'] },
		};
		return result;
	}

	await db
		.update(subscriptions)
		.set({
			status: 'inactive',
		})
		.where(eq(subscriptions.id, subscriptionId));

	result = {
		success: true,
		data: subscription,
	};

	revalidatePath('/');
	return result;
};
