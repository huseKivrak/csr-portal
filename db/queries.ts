'use server';

import { db } from '@/db';
import { and, count, desc, eq, gte, lte, or, sum } from 'drizzle-orm';
import { payments, subscriptionPlans, subscriptions, users } from './schema';
import { UserDetail, UserDetailBase, UserDetailInfo } from './types';

export async function generateDetailedUsersData() {
	const usersData = await db.query.users.findMany({
		where: (users, { eq }) => eq(users.account_status, 'active'),
		with: {
			vehicles: true,
			subscriptions: {
				with: {
					plan: true,
				},
				where: (subscriptions, { eq, or }) =>
					or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'overdue')),
				orderBy: (subscriptions, { desc }) => [desc(subscriptions.payment_due_date)],
			},
			payments: true,
			paymentMethods: true,
			washes: {
				orderBy: (washes, { desc }) => [desc(washes.created_at)],
			},
		},
	});

	const detailedUsers = usersData.map((userData): UserDetail => {
		// Base user detail with related entities
		const baseDetail: UserDetailBase = {
			user: userData,
			vehicles: userData.vehicles,
			subscriptions: userData.subscriptions,
			payments: userData.payments,
			payment_methods: userData.paymentMethods,
			washes: userData.washes,
		};

		// Computed/derived information
		const computedInfo: UserDetailInfo = {
			next_payment_date: userData.subscriptions?.[0]?.payment_due_date || null,
			last_wash_date: userData.washes?.[0]?.created_at || null,
			is_overdue: userData.subscriptions?.some((sub) => sub.status === 'overdue') || false,
		};

		return {
			...baseDetail,
			...computedInfo,
		};
	});

	return detailedUsers;
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
				eq(subscriptions.status, 'overdue'),

				//calculate missed payments dynamically, in case status wasn't updated
				and(eq(subscriptions.status, 'active'), lte(subscriptions.last_payment_date, new Date()))
			)
		);
}

export async function getSubscriptionStatusCount() {
	return db
		.select({
			status: subscriptions.status,
			count: count(subscriptions.id),
		})
		.from(subscriptions)
		.groupBy(subscriptions.status);
}

export async function getSubscriptionPlanCount() {
	return db
		.select({
			plan: subscriptionPlans.name,
			count: count(subscriptions.id),
		})
		.from(subscriptions)
		.innerJoin(subscriptionPlans, eq(subscriptions.plan_id, subscriptionPlans.id))
		.where(eq(subscriptions.status, 'active'))
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

//Returns the data for the dashboard header
export async function getDashboardMetrics() {
	const [
		totalActiveUsers,
		usersWithOverdueSubscriptions,
		subscriptionStatusCount,
		subscriptionPlanCount,
		monthlyRevenue,
	] = await Promise.all([
		getTotalActiveUsers(),
		getUsersWithOverdueSubscriptions(),
		getSubscriptionStatusCount(),
		getSubscriptionPlanCount(),
		getMonthlyRevenue(),
	]);

	return {
		totalActiveUsers: totalActiveUsers[0]?.count || 0,
		usersWithOverdueSubscriptions: usersWithOverdueSubscriptions.length,
		subscriptionStatusCount,
		subscriptionPlanCount,
		monthlyRevenue,
	};
}

/**
 *
 * Graph Metrics
 *
 */
