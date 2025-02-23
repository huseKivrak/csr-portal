import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import {
	users,
	vehicles,
	subscriptionPlans,
	subscriptions,
	subscriptionTransfers,
	paymentMethods,
	washes,
} from './schema';
import { accountStatusEnum, vehicleColorEnum } from './schema';

export const userFormSchema = createInsertSchema(users, {
	email: (schema) => schema.email('Invalid email address'),
	phone: (schema) => schema.min(10, 'Phone number must be at least 10 digits'),
	account_status: z.enum(accountStatusEnum.enumValues),
});

export const vehicleFormSchema = createInsertSchema(vehicles, {
	make: z.string().min(1, 'Make is required'),
	model: z.string().min(1, 'Model is required'),
	year: z.coerce
		.number()
		.min(1975)
		.max(new Date().getFullYear() + 1, 'Year must be less than or equal to the current year'),
	color: z.enum(vehicleColorEnum.enumValues),
	license_plate: z.string().min(7, 'License plate must be at least 7 characters'),
});

export const subscriptionFormSchema = createInsertSchema(subscriptions, {
	plan_id: z.coerce.number().min(1, 'Please select a plan'),
	vehicle_id: z.coerce.number().min(1, 'Please select a vehicle'),
	user_id: z.coerce.number(),
	remaining_washes: z.coerce.number().min(4, 'Remaining washes must be at least 0'),
}).extend({
	payment_method_id: z.coerce.number().min(1, 'Please select a payment method'),
});

export const paymentMethodFormSchema = createInsertSchema(paymentMethods, {
	card_last4: z.coerce.number().min(1001).max(9999),
	card_exp_month: z.coerce.number().min(1).max(12),
	card_exp_year: z.coerce.number().min(new Date().getFullYear(), 'Card is expired'),
});

export const subscriptionTransferFormSchema = createInsertSchema(subscriptionTransfers, {
	from_vehicle_id: z.coerce.number().min(1, 'Please select a vehicle'),
	to_vehicle_id: z.coerce.number().min(1, 'Please select a vehicle'),
});

export const washFormSchema = createInsertSchema(washes);
