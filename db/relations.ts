import { relations } from 'drizzle-orm';
import {
	users,
	vehicles,
	subscriptions,
	subscriptionTransfers,
	washes,
	paymentMethods,
	payments,
	subscriptionPlans,
	coupons,
} from './schema';

export const usersRelations = relations(users, ({ many }) => ({
	subscriptions: many(subscriptions),
	vehicles: many(vehicles),
	washes: many(washes),
	paymentMethods: many(paymentMethods),
	payments: many(payments),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
	user: one(users, {
		fields: [vehicles.user_id],
		references: [users.id],
	}),
	subscriptions: many(subscriptions),
	washes: many(washes),
	fromTransfers: many(subscriptionTransfers, { relationName: 'fromVehicle' }),
	toTransfers: many(subscriptionTransfers, { relationName: 'toVehicle' }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
	user: one(users, {
		fields: [subscriptions.user_id],
		references: [users.id],
	}),
	vehicle: one(vehicles, {
		fields: [subscriptions.vehicle_id],
		references: [vehicles.id],
	}),
	plan: one(subscriptionPlans, {
		fields: [subscriptions.plan_id],
		references: [subscriptionPlans.id],
	}),
	transfers: many(subscriptionTransfers),
	washes: many(washes),
	payments: many(payments),
}));

export const subscriptionTransfersRelations = relations(subscriptionTransfers, ({ one }) => ({
	subscription: one(subscriptions, {
		fields: [subscriptionTransfers.subscription_id],
		references: [subscriptions.id],
	}),
	fromVehicle: one(vehicles, {
		fields: [subscriptionTransfers.from_vehicle_id],
		references: [vehicles.id],
		relationName: 'fromVehicle',
	}),
	toVehicle: one(vehicles, {
		fields: [subscriptionTransfers.to_vehicle_id],
		references: [vehicles.id],
		relationName: 'toVehicle',
	}),
}));

export const washesRelations = relations(washes, ({ one }) => ({
	user: one(users, {
		fields: [washes.user_id],
		references: [users.id],
	}),
	vehicle: one(vehicles, {
		fields: [washes.vehicle_id],
		references: [vehicles.id],
	}),
	subscription: one(subscriptions, {
		fields: [washes.subscription_id],
		references: [subscriptions.id],
	}),
	payment: one(payments, {
		fields: [washes.id],
		references: [payments.wash_id],
	}),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
	user: one(users, {
		fields: [paymentMethods.user_id],
		references: [users.id],
	}),
	payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	user: one(users, {
		fields: [payments.user_id],
		references: [users.id],
	}),
	paymentMethod: one(paymentMethods, {
		fields: [payments.payment_method_id],
		references: [paymentMethods.id],
	}),
	subscription: one(subscriptions, {
		fields: [payments.subscription_id],
		references: [subscriptions.id],
	}),
	wash: one(washes, {
		fields: [payments.wash_id],
		references: [washes.id],
	}),
	coupon: one(coupons, {
		fields: [payments.coupon_id],
		references: [coupons.id],
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
	subscriptions: many(subscriptions),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
	payments: many(payments),
}));
