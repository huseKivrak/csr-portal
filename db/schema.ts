import { sql } from 'drizzle-orm';
import {
	pgEnum,
	pgTable,
	timestamp,
	text,
	serial,
	integer,
	numeric,
	boolean,
	check,
} from 'drizzle-orm/pg-core';

// Common timestamps for all tables
const timestamps = {
	updated_at: timestamp('updated_at'),
	created_at: timestamp('created_at').notNull().defaultNow(),
	deleted_at: timestamp('deleted_at'),
};

// Enums
export const accountStatusEnum = pgEnum('account_status', ['active', 'cancelled']);

export const vehicleColorEnum = pgEnum('vehicle_color', [
	'black',
	'blue',
	'bronze',
	'gold',
	'gray',
	'green',
	'red',
	'silver',
	'white',
	'yellow',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'inactive',
	'overdue',
	'transferred',
]);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
	'bronze',
	'silver',
	'gold',
	'platinum',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
	'paid',
	'failed',
	'pending',
	'refunded',
]);
export const paymentStatusReasonEnum = pgEnum('payment_status_reason', [
	'payment_failed',
	'insufficient_funds',
	'card_expired',
	'user_cancelled',
	'system_error',
]);

export const itemTypeEnum = pgEnum('item_type', ['subscription', 'wash']);

/**
 * Tables
 */

// Users table
export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	phone: text('phone').notNull(),
	address: text('address').notNull(),
	account_status: accountStatusEnum('account_status').notNull().default('active'),
	cancelled_at: timestamp('cancelled_at'),
	cancelled_by: text('cancelled_by').notNull().default('system'),
	cancelled_reason: text('cancelled_reason'),
	...timestamps,
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
	id: serial('id').primaryKey(),
	user_id: integer('user_id')
		.notNull()
		.references(() => users.id),
	make: text('make').notNull(),
	model: text('model').notNull(),
	color: vehicleColorEnum('color').notNull(),
	year: integer('year').notNull(),
	license_plate: text('license_plate').notNull(),
	...timestamps,
});

// Subscription Plans table

export const subscriptionPlans = pgTable('subscription_plans', {
	id: serial('id').primaryKey(),
	name: subscriptionPlanEnum('name').notNull(),
	description: text('description').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	washes_per_month: integer('washes_per_month').notNull(),
	is_active: boolean('is_active').notNull().default(true),
	...timestamps,
});

// Subscriptions

export const subscriptions = pgTable(
	'subscriptions',
	{
		id: serial('id').primaryKey(),
		user_id: integer('user_id')
			.notNull()
			.references(() => users.id),
		vehicle_id: integer('vehicle_id')
			.notNull()
			.references(() => vehicles.id)
			.unique(),
		plan_id: integer('plan_id')
			.notNull()
			.references(() => subscriptionPlans.id),
		remaining_washes: integer('remaining_washes').notNull(),
		subscription_status: subscriptionStatusEnum('subscription_status').notNull().default('active'),

		start_date: timestamp('start_date').notNull(),
		current_period_end: timestamp('current_period_end').notNull(),
		next_payment_date: timestamp('next_payment_date').notNull(),
		cancellation_date: timestamp('cancellation_date'),
		last_payment_date: timestamp('last_payment_date'),
		last_payment_status: paymentStatusEnum('last_payment_status'),

		...timestamps,
	},
	(table) => ({
		// Ensure only one active subscription per vehicle
		uniqueActiveSubscription: sql`UNIQUE NULLS NOT DISTINCT (${table.vehicle_id}) WHERE ${table.subscription_status} = 'active'`,
	})
);

// Subscription Transfers
export const subscriptionTransfers = pgTable('subscription_transfers', {
	id: serial('id').primaryKey(),
	subscription_id: integer('subscription_id')
		.notNull()
		.references(() => subscriptions.id),
	from_vehicle_id: integer('from_vehicle_id')
		.notNull()
		.references(() => vehicles.id),
	to_vehicle_id: integer('to_vehicle_id')
		.notNull()
		.references(() => vehicles.id),
	transferred_at: timestamp('transferred_at').notNull().defaultNow(),
	transferred_by: text('transferred_by').notNull().default('system'),
	transfer_reason: text('transfer_reason'),
	...timestamps,
});

// Washes table
export const washes = pgTable('washes', {
	id: serial('id').primaryKey(),
	user_id: integer('user_id')
		.notNull()
		.references(() => users.id),
	vehicle_id: integer('vehicle_id')
		.notNull()
		.references(() => vehicles.id),
	subscription_id: integer('subscription_id').references(() => subscriptions.id),
	...timestamps,
});

/**
 * Payments
 */

// Payment Methods Table
export const paymentMethods = pgTable(
	'payment_methods',
	{
		id: serial('id').primaryKey(),
		user_id: integer('user_id')
			.notNull()
			.references(() => users.id),
		card_last4: text('card_last4').notNull(),
		card_exp_month: integer('card_exp_month').notNull(),
		card_exp_year: integer('card_exp_year').notNull(),
		is_default: boolean('is_default').notNull().default(false),

		...timestamps,
	},
	(table) => [
		check('card_exp_date_check', sql`card_exp_month >= 1 AND card_exp_month <= 12`),
		check('card_exp_year_check', sql`card_exp_year >= 2025`),
	]
);

// Payments Table

export const payments = pgTable(
	'payments',
	{
		id: serial('id').primaryKey(),
		user_id: integer('user_id')
			.notNull()
			.references(() => users.id),
		payment_method_id: integer('payment_method_id')
			.notNull()
			.references(() => paymentMethods.id),
		base_amount: numeric('base_amount', { precision: 10, scale: 2 }).notNull(), // amount in dollars
		discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull(),
		final_amount: numeric('final_amount', { precision: 10, scale: 2 }).notNull(),
		coupon_id: integer('coupon_id').references(() => coupons.id),
		status: paymentStatusEnum('status').notNull().default('pending'),
		status_reason: paymentStatusReasonEnum('status_reason'),
		item_type: itemTypeEnum('item_type').notNull(),
		subscription_id: integer('subscription_id').references(() => subscriptions.id),
		wash_id: integer('wash_id').references(() => washes.id),
		...timestamps,
	},
	(table) => [
		// check constraint to ensure payment is only associated with either a subscription or a wash
		check(
			'item_reference_check',
			sql`(item_type = 'subscription' AND subscription_id IS NOT NULL) OR
        (item_type = 'wash' AND wash_id IS NOT NULL)`
		),
	]
);

// Coupons table
//todo
export const coupons = pgTable('coupons', {
	id: serial('id').primaryKey(),
	code: text('code').notNull(),
	discount_amount: numeric('discount_amount').notNull(),
	is_active: boolean('is_active').notNull().default(true),
	valid_from: timestamp('valid_from').notNull(),
	valid_to: timestamp('valid_to').notNull(),

	...timestamps,
});
