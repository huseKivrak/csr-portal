'use server';

import { db } from '@/db';
import { and, count, desc, eq, gte, lte, or, sum } from 'drizzle-orm';
import { payments, subscriptionPlans, subscriptions, users } from './schema';

export async function generateUsersTableData() {
	const usersData = await db.query.users.findMany({
		columns: {
			id: true,
			name: true,
			email: true,
			phone: true,
			address: true,
			updated_at: true,
		},
		with: {
			vehicles: true,
			subscriptions: {
				where: (subscriptions, { eq }) => eq(subscriptions.subscription_status, 'active'),
			},
			washes: {
				orderBy: (washes, { desc }) => [desc(washes.created_at)],
				limit: 1,
			},
			payments: {
				orderBy: (payments, { desc }) => [desc(payments.created_at)],
				limit: 1,
			},
		},
	});

	return usersData.map((user) => ({
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phone,
		address: user.address,
		updated_at: user.updated_at,
		next_payment_date: user.subscriptions?.[0]?.next_payment_date ?? new Date(),
		washes: user.washes,
		last_wash: user.washes?.[0]?.created_at,
		vehicles: user.vehicles,
		subscriptions: user.subscriptions,
		payments: user.payments,
		is_overdue: user.subscriptions?.[0]?.next_payment_date
			? user.subscriptions[0].next_payment_date < new Date()
			: false,
	}));
}

/**
 * Database Metric Queries
 * - dashboard header metrics: active users, active subscriptions, and overdue subscriptions
 * - graph metrics: subscription plans count, monthly revenue,
 */

//todo: define types

export async function getTotalActiveUsers() {
	return db.select({ count: count() }).from(users).where(eq(users.account_status, 'active'));
}

export async function getUsersWithOverdueSubscriptions() {
	return db
		.select()
		.from(users)
		.innerJoin(subscriptions, eq(users.id, subscriptions.user_id))
		.where(
			or(
				eq(subscriptions.subscription_status, 'overdue'),

				//calculate missed payments dynamically, in case status wasn't updated
				and(
					eq(subscriptions.subscription_status, 'active'),
					lte(subscriptions.next_payment_date, new Date())
				)
			)
		);
}

export async function getSubscriptionStatusCount() {
	return db
		.select({
			status: subscriptions.subscription_status,
			count: count(subscriptions.id),
		})
		.from(subscriptions)
		.groupBy(subscriptions.subscription_status);
}

//Returns the data for the dashboard header
export async function getDashboardHeaderMetrics() {
	const [totalActiveUsers, usersWithOverdueSubscriptions, subscriptionStatusCount] =
		await Promise.all([
			getTotalActiveUsers(),
			getUsersWithOverdueSubscriptions(),
			getSubscriptionStatusCount(),
		]);

	return {
		totalActiveUsers: totalActiveUsers[0]?.count || 0,
		usersWithOverdueSubscriptions: usersWithOverdueSubscriptions.length,
		subscriptionStatusCount,
	};
}

/**
 *
 * Graph Metrics
 *
 */

export async function getSubscriptionPlanCount() {
	return db
		.select({
			plan: subscriptionPlans.name,
			count: count(subscriptions.id),
		})
		.from(subscriptions)
		.innerJoin(subscriptionPlans, eq(subscriptions.plan_id, subscriptionPlans.id))
		.where(eq(subscriptions.subscription_status, 'active'))
		.groupBy(subscriptionPlans.name)
		.orderBy(desc(count(subscriptions.id)));
}

export async function getMonthlyRevenue() {
	return db
		.select({ total: sum(payments.final_amount) })
		.from(payments)
		.where(
			and(
				eq(payments.status, 'paid'),
				gte(payments.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
			)
		);
}
