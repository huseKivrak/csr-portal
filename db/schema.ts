import {
	pgEnum,
	pgTable,
	timestamp,
	text,
	serial,
	integer,
	date,
	numeric,
	jsonb,
} from 'drizzle-orm/pg-core';

// Common timestamps for all tables
const timestamps = {
	updated_at: timestamp(),
	created_at: timestamp().notNull().defaultNow(),
	deleted_at: timestamp(),
};

// Enums
const membershipStatusEnum = pgEnum('membership_status', ['active', 'cancelled', 'overdue']);
const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'overdue']);
const purchaseStatusEnum = pgEnum('purchase_status', [
	'pending',
	'completed',
	'failed',
	'refunded',
]);
const purchaseItemEnum = pgEnum('purchase_item', [
	'membership',
	'single_wash',
	'subscription',
	'coupon',
]);

/**
 * Tables
 */

// Users table
export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	phone: text('phone'),
	membership_status: membershipStatusEnum('membership_status').default('active'),
	...timestamps,
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
	id: serial('id').primaryKey(),
	user_id: serial('user_id').references(() => users.id),
	make: text('make').notNull(),
	model: text('model').notNull(),
	year: integer('year').notNull(),
	license_plate: text('license_plate').notNull(),
	...timestamps,
});

// Vehicle Subscriptions table
export const vehicleSubscriptions = pgTable('vehicle_subscriptions', {
	id: serial('id').primaryKey(),
	user_id: serial('user_id').references(() => users.id),
	vehicle_id: serial('vehicle_id').references(() => vehicles.id),
	status: subscriptionStatusEnum('subscription_status').notNull(),
	start_date: date('start_date').notNull(),
	end_date: date('end_date').notNull(),
	...timestamps,
});

// Subscription Transfers table
export const subscriptionTransfers = pgTable('subscription_transfers', {
	id: serial('id').primaryKey(),
	subscription_id: serial('subscription_id').references(() => vehicleSubscriptions.id),
	from_vehicle_id: serial('from_vehicle_id').references(() => vehicles.id),
	to_vehicle_id: serial('to_vehicle_id').references(() => vehicles.id),
	transferred_at: timestamp('transferred_at').notNull(),
	transferred_by: text('transferred_by').notNull().default('system'), // CSR ID
	...timestamps,
});

// Washes table
export const washes = pgTable('washes', {
	id: serial('id').primaryKey(),
	user_id: serial('user_id').references(() => users.id),
	vehicle_id: serial('vehicle_id').references(() => vehicles.id),
	purchase_id: serial('purchase_id').references(() => purchases.id),
	wash_date: date('wash_date').notNull(),
	...timestamps,
});

// Purchases table
export const purchases = pgTable('purchases', {
	id: serial('id').primaryKey(),
	user_id: serial('user_id').references(() => users.id),
	purchase_item: purchaseItemEnum('purchase_item').notNull(),
	original_amount: numeric('original_amount', { precision: 10, scale: 2 }).notNull(),
	discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
	total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
	details: jsonb('details').notNull(), // flexible field for notes, etc.
	status: purchaseStatusEnum('purchase_status').notNull(),
	coupon_id: serial('coupon_id').references(() => coupons.id),
	...timestamps,
});

// Coupons table
export const coupons = pgTable('coupons', {
	id: serial('id').primaryKey(),
	code: text('code').notNull(),
	discount_amount: numeric('discount_amount').notNull(), // amount in dollars
});

// Coupon Redemptions table
export const couponRedemptions = pgTable('coupon_redemptions', {
	id: serial('id').primaryKey(),
	coupon_id: serial('coupon_id').references(() => coupons.id),
	redemption_date: date('redemption_date').notNull(),
	...timestamps,
});
