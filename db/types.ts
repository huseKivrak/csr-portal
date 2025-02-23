import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import {
	users,
	vehicles,
	subscriptions,
	washes,
	payments,
	coupons,
	subscriptionPlans,
	paymentMethods,
	subscriptionTransfers,
} from './schema';

// Users
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);

// Base user detail with related entities
export interface UserDetailBase {
	user: SelectUser;
	vehicles: SelectVehicle[];
	subscriptions: (SelectSubscription & { plan: SelectSubscriptionPlan })[];
	payments: SelectPayment[];
	payment_methods: SelectPaymentMethod[];
	washes: SelectWash[];
}

// Computed/derived information
export interface UserDetailInfo {
	next_payment_date: Date | null;
	last_wash_date: Date | null;
	is_overdue: boolean;
}

// Combined type
export interface UserDetail extends UserDetailBase, UserDetailInfo {}

// Vehicles
export type SelectVehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export const vehicleInsertSchema = createInsertSchema(vehicles);
export const vehicleSelectSchema = createSelectSchema(vehicles);

// Subscriptions
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export const subscriptionInsertSchema = createInsertSchema(subscriptions);
export const subscriptionSelectSchema = createSelectSchema(subscriptions);

// Washes
export type SelectWash = typeof washes.$inferSelect;
export type InsertWash = typeof washes.$inferInsert;
export const washInsertSchema = createInsertSchema(washes);
export const washSelectSchema = createSelectSchema(washes);

// Payments
export type SelectPayment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export const paymentInsertSchema = createInsertSchema(payments);
export const paymentSelectSchema = createSelectSchema(payments);

// Coupons
export type SelectCoupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;
export const couponInsertSchema = createInsertSchema(coupons);
export const couponSelectSchema = createSelectSchema(coupons);

// Subscription Plans
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export const subscriptionPlanInsertSchema = createInsertSchema(subscriptionPlans);
export const subscriptionPlanSelectSchema = createSelectSchema(subscriptionPlans);

// Payment Methods
export type SelectPaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
export const paymentMethodInsertSchema = createInsertSchema(paymentMethods);
export const paymentMethodSelectSchema = createSelectSchema(paymentMethods);

// Subscription Transfers
export type SelectSubscriptionTransfer = typeof subscriptionTransfers.$inferSelect;
export type InsertSubscriptionTransfer = typeof subscriptionTransfers.$inferInsert;
export const subscriptionTransferInsertSchema = createInsertSchema(subscriptionTransfers);
export const subscriptionTransferSelectSchema = createSelectSchema(subscriptionTransfers);
