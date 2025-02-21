import { z } from 'zod';
import { zfd } from 'zod-form-data';
import {
	vehicleInsertSchema,
	paymentMethodInsertSchema,
	userInsertSchema,
	washInsertSchema,
	couponInsertSchema,
	subscriptionPlanInsertSchema,
} from '@/db/types';
import { vehicleColorEnum } from './schema';

export const vehicleFormSchema = vehicleInsertSchema.extend({
	user_id: z.number(),
	make: z.string().min(1, 'Make is required'),
	model: z.string().min(1, 'Model is required'),
	color: z.enum(vehicleColorEnum.enumValues),
	year: z
		.number()
		.min(1900, 'Year must be 1900 or later')
		.max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
	license_plate: z.string().min(1, 'License plate is required'),
});

export const subscriptionFormSchema = z.object({
	user_id: z.number(),
	vehicle_id: z.number().min(1, 'Please select a vehicle'),
	plan_id: z.number().min(1, 'Please select a plan'),
	payment_method_id: z.number().min(1, 'Please select a payment method'),
});

export const paymentMethodFormSchema = zfd.formData(paymentMethodInsertSchema);

export const userFormSchema = zfd.formData(
	userInsertSchema.extend({
		email: zfd.text(z.string().email()),
		phone: zfd.text(z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')),
		account_status: zfd.text(z.enum(['active', 'cancelled'])),
		cancelled_reason: zfd.text(z.string().optional()),
		csr_notes: zfd.text(z.string().optional()),
	})
);

export const washFormSchema = zfd.formData(washInsertSchema);

export const couponFormSchema = zfd.formData(couponInsertSchema);

export const subscriptionPlanFormSchema = zfd.formData(subscriptionPlanInsertSchema);

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;
export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodFormSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type WashFormData = z.infer<typeof washFormSchema>;
export type CouponFormData = z.infer<typeof couponFormSchema>;
export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanFormSchema>;
