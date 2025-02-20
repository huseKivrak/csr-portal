import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import {
	users,
	vehicles,
	subscriptions,
	washes,
	payments,
	coupons,
	subscriptionPlans,
} from './schema';

// Users
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);

export type UserDetail = {
	id: number;
	name: string;
	email: string;
	phone: string;
	address: string;
	updated_at: Date | null;
	next_payment_date: Date | null;
	washes?: SelectWash[];
	last_wash?: Date | null;
	vehicles: SelectVehicle[];
	subscriptions?: SelectSubscription[];
	payments?: SelectPayment[];
	is_overdue: boolean;
};

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
