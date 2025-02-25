import { faker } from '@faker-js/faker';
import { db } from './index';
import {
	users,
	vehicles,
	subscriptions,
	washes,
	payments,
	subscriptionPlans,
	paymentMethods,
	subscriptionTransfers,
	coupons,
} from './schema';
import {
	InsertUser,
	InsertVehicle,
	InsertSubscription,
	InsertWash,
	InsertPayment,
	InsertPaymentMethod,
	InsertSubscriptionTransfer,
} from './types';
import {
	userInsertSchema,
	vehicleInsertSchema,
	subscriptionInsertSchema,
	washInsertSchema,
	paymentInsertSchema,
	paymentMethodInsertSchema,
	subscriptionTransferInsertSchema,
} from './types';
import { sql } from 'drizzle-orm';
import { SUBSCRIPTION_PLANS } from '@/lib/db/constants';

/**
 * Note: This seed file is mostly AI-generated to create a realistic dataset for the CSR Portal,
 * updated alongside the schema as needed. The seed data is not perfect and should not be used
 * as a source of truth for the database.
 */

// Configuration for seed data
const USER_COUNT = 50;
const SUBSCRIPTION_RATE = 0.65; // 65% of vehicles get subscriptions
const OVERDUE_ACCOUNT_RATE = 0.15; // 15% of subscriptions are overdue
const CANCELLED_ACCOUNT_RATE = 0.08; // 8% of users have cancelled accounts
const SUBSCRIPTION_TRANSFER_RATE = 0.12; // 12% of subscriptions have been transferred

// Helper function to get random number between min and max
function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRandomUser(): InsertUser {
	const isCancelled = faker.datatype.boolean({ probability: CANCELLED_ACCOUNT_RATE });
	const cancelledAt = isCancelled ? faker.date.past({ years: 1 }) : null;
	const cancelReasons = [
		'Moving to a different area',
		'Financial reasons',
		'Dissatisfied with service',
		'Purchased own car wash equipment',
		'Vehicle sold',
		'No longer needed',
	];

	return userInsertSchema.parse({
		name: faker.person.fullName(),
		email: faker.internet.email(),
		phone: faker.phone.number(),
		address: faker.location.streetAddress(),
		account_status: isCancelled ? 'cancelled' : 'active',
		cancelled_at: cancelledAt,
		cancelled_by: isCancelled ? faker.helpers.arrayElement(['system', 'user', 'csr']) : 'system',
		cancelled_reason: isCancelled ? faker.helpers.arrayElement(cancelReasons) : null,
		csr_notes: isCancelled
			? faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 })
			: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
	});
}

function createVehicleForUser(userId: number): InsertVehicle {
	const validColors = [
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
	];
	const color = validColors[Math.floor(Math.random() * validColors.length)];

	return vehicleInsertSchema.parse({
		user_id: userId,
		make: faker.vehicle.manufacturer(),
		model: faker.vehicle.model(),
		color: color,
		license_plate: faker.vehicle.vrm().toUpperCase(),
		year: faker.date.past({ years: 15 }).getFullYear(),
	});
}

function createSubscription(userId: number, vehicleId: number, planId: number): InsertSubscription {
	const now = new Date();
	const startDate = faker.date.recent({ days: 30, refDate: now });
	const paymentDueDate = new Date(startDate.getTime() + 27 * 24 * 60 * 60 * 1000);

	// Determine payment status and date
	const isPaymentFailed = faker.datatype.boolean({ probability: OVERDUE_ACCOUNT_RATE });
	const lastPaymentDate = isPaymentFailed
		? new Date(startDate.getTime() - 35 * 24 * 60 * 60 * 1000) // Last payment was over a month ago
		: faker.date.between({ from: startDate, to: paymentDueDate }); // Payment within current period

	// Determine subscription status based on payment history
	let status: 'active' | 'inactive' | 'overdue' | 'transferred';
	if (isPaymentFailed) {
		status = 'overdue';
	} else {
		status = faker.helpers.weightedArrayElement([
			{ weight: 0.8, value: 'active' },
			{ weight: 0.1, value: 'inactive' },
			{ weight: 0.1, value: 'transferred' },
		]);
	}

	const maxWashes = SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.washes_per_month || 4;
	const usedWashes = faker.number.int({ min: 0, max: maxWashes });

	return subscriptionInsertSchema.parse({
		user_id: userId,
		vehicle_id: vehicleId,
		plan_id: planId,
		remaining_washes: maxWashes - usedWashes,
		status: status,
		billing_period_start: startDate,
		payment_due_date: paymentDueDate,
		last_payment_date: lastPaymentDate,
		last_payment_status: isPaymentFailed ? 'failed' : 'paid',
		cancellation_date: status === 'inactive' ? faker.date.recent({ days: 15 }) : null,
		created_at: startDate,
		updated_at: null,
		deleted_at: null,
	});
}

function createWashesForSubscription(subscription: InsertSubscription): InsertWash[] {
	const maxWashes =
		SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id)?.washes_per_month || 4;
	const usedWashes = maxWashes - (subscription.remaining_washes || 0);

	// Ensure billing_period_start exists before using it
	if (!subscription.billing_period_start) {
		return [];
	}

	return Array.from({ length: usedWashes }, () => ({
		user_id: subscription.user_id,
		vehicle_id: subscription.vehicle_id,
		subscription_id: subscription.id,
		created_at: faker.date.between({
			from: subscription.billing_period_start as Date,
			to: new Date(),
		}),
		updated_at: null,
		deleted_at: null,
	}));
}

function createPaymentForSubscription(
	subscription: InsertSubscription,
	paymentMethodId: number
): InsertPayment {
	const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id);
	const status = subscription.last_payment_status || 'paid';
	const baseAmount = plan?.price || '49.99';

	// Sometimes apply a discount
	const hasDiscount = faker.datatype.boolean({ probability: 0.2 });
	const discountAmount = hasDiscount ? (parseFloat(baseAmount) * 0.1).toFixed(2) : '0.00';
	const finalAmount = (parseFloat(baseAmount) - parseFloat(discountAmount)).toFixed(2);

	return paymentInsertSchema.parse({
		user_id: subscription.user_id,
		payment_method_id: paymentMethodId,
		base_amount: baseAmount,
		discount_amount: discountAmount,
		final_amount: finalAmount,
		coupon_id: hasDiscount ? getRandomInt(1, 5) : null, // Assuming we have some coupons
		status: status,
		status_reason:
			status === 'failed'
				? faker.helpers.arrayElement(['payment_failed', 'insufficient_funds', 'card_expired'])
				: null,
		item_type: 'subscription',
		subscription_id: subscription.id,
		wash_id: null,
		created_at: subscription.last_payment_date || new Date(),
	});
}

// Function to create payment method for a user
function createPaymentMethod(userId: number, isDefault: boolean): InsertPaymentMethod {
	return paymentMethodInsertSchema.parse({
		user_id: userId,
		card_last4: parseInt(faker.finance.creditCardNumber().slice(-4)),
		card_exp_month: getRandomInt(1, 12),
		card_exp_year: getRandomInt(2024, 2030),
		is_default: isDefault,
	});
}

// Create a subscription transfer
function createSubscriptionTransfer(
	subscriptionId: number,
	fromVehicleId: number,
	toVehicleId: number
): InsertSubscriptionTransfer {
	const transferReasons = [
		'Vehicle sold',
		'New vehicle purchased',
		'Vehicle damaged',
		'Family member vehicle change',
		'Temporary vehicle swap',
	];

	return subscriptionTransferInsertSchema.parse({
		subscription_id: subscriptionId,
		from_vehicle_id: fromVehicleId,
		to_vehicle_id: toVehicleId,
		transferred_at: faker.date.recent({ days: 60 }),
		transferred_by: faker.helpers.arrayElement(['system', 'csr']),
		transfer_reason: faker.helpers.arrayElement(transferReasons),
	});
}

// Add historical payments for subscriptions
async function createHistoricalPayments(subscription: InsertSubscription, paymentMethodId: number) {
	// Ensure billing_period_start exists
	if (!subscription.billing_period_start) {
		return;
	}

	const currentPeriodStart = subscription.billing_period_start;
	const monthsActive = faker.number.int({ min: 1, max: 12 });
	const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id);
	const baseAmount = plan?.price || '49.99';

	const paymentsData = [];
	const washesData = [];

	// Historical payments (mostly successful, some failed)
	for (let i = 1; i <= monthsActive; i++) {
		const periodStart = new Date(currentPeriodStart.getTime() - i * 30 * 24 * 60 * 60 * 1000);
		const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
		const paymentDueDate = new Date(periodStart.getTime() + 27 * 24 * 60 * 60 * 1000);

		// Occasionally have a failed payment in history
		const isHistoricalPaymentFailed = faker.datatype.boolean({ probability: 0.08 });

		// Sometimes apply a discount
		const hasDiscount = faker.datatype.boolean({ probability: 0.15 });
		const discountAmount = hasDiscount ? (parseFloat(baseAmount) * 0.1).toFixed(2) : '0.00';
		const finalAmount = (parseFloat(baseAmount) - parseFloat(discountAmount)).toFixed(2);

		// Historical payment
		const payment = paymentInsertSchema.parse({
			user_id: subscription.user_id,
			payment_method_id: paymentMethodId,
			base_amount: baseAmount,
			discount_amount: discountAmount,
			final_amount: finalAmount,
			coupon_id: hasDiscount ? getRandomInt(1, 5) : null,
			status: isHistoricalPaymentFailed ? 'failed' : 'paid',
			status_reason: isHistoricalPaymentFailed
				? faker.helpers.arrayElement(['payment_failed', 'insufficient_funds', 'card_expired'])
				: null,
			item_type: 'subscription',
			subscription_id: subscription.id,
			wash_id: null,
			created_at: faker.date.between({ from: periodStart, to: paymentDueDate }),
		});
		paymentsData.push(payment);

		// Create washes for this period
		const maxWashes =
			SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id)?.washes_per_month || 4;
		const actualWashes = faker.number.int({ min: 0, max: maxWashes });

		const periodWashes = Array.from({ length: actualWashes }, () =>
			washInsertSchema.parse({
				user_id: subscription.user_id,
				vehicle_id: subscription.vehicle_id,
				subscription_id: subscription.id,
				created_at: faker.date.between({ from: periodStart, to: periodEnd }),
				updated_at: null,
				deleted_at: null,
			})
		);
		washesData.push(...periodWashes);
	}

	// Insert historical data
	if (paymentsData.length > 0) {
		await db.insert(payments).values(paymentsData);
	}
	if (washesData.length > 0) {
		await db.insert(washes).values(washesData);
	}
}

// Create one-off wash purchases (not part of subscription)
async function createOneOffWashes(userId: number, vehicleId: number, paymentMethodId: number) {
	const hasOneOffWashes = faker.datatype.boolean({ probability: 0.3 });
	if (!hasOneOffWashes) return;

	const washCount = faker.number.int({ min: 1, max: 3 });

	for (let i = 0; i < washCount; i++) {
		const washDate = faker.date.past({ years: 1 });

		// Create the wash
		const wash = await db
			.insert(washes)
			.values({
				user_id: userId,
				vehicle_id: vehicleId,
				subscription_id: null, // Not part of a subscription
				created_at: washDate,
			})
			.returning();

		// Create the payment for the wash
		const washPrice = faker.helpers.arrayElement(['14.99', '19.99', '24.99']);

		await db.insert(payments).values({
			user_id: userId,
			payment_method_id: paymentMethodId,
			base_amount: washPrice,
			discount_amount: '0.00',
			final_amount: washPrice,
			coupon_id: null,
			status: 'paid',
			status_reason: null,
			item_type: 'wash',
			subscription_id: null,
			wash_id: wash[0].id,
			created_at: washDate,
		});
	}
}

async function seedDatabase() {
	// Reset all tables and restart serial IDs
	await db.transaction(async (tx) => {
		await tx.execute(sql`TRUNCATE TABLE subscription_transfers RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE payments RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE payment_methods RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE washes RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE subscriptions RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE subscription_plans RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE coupons RESTART IDENTITY CASCADE`);
	});

	// Create some basic coupons
	await db.insert(coupons).values([
		{
			code: 'WELCOME10',
			discount_amount: '10.00',
			is_active: true,
			valid_from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
			valid_to: new Date(new Date().setMonth(new Date().getMonth() + 6)),
		},
		{
			code: 'SUMMER2023',
			discount_amount: '15.00',
			is_active: true,
			valid_from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
			valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)),
		},
		{
			code: 'LOYALTY25',
			discount_amount: '25.00',
			is_active: true,
			valid_from: new Date(new Date().setMonth(new Date().getMonth() - 2)),
			valid_to: new Date(new Date().setMonth(new Date().getMonth() + 10)),
		},
		{
			code: 'EXPIRED20',
			discount_amount: '20.00',
			is_active: false,
			valid_from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
			valid_to: new Date(new Date().setMonth(new Date().getMonth() - 1)),
		},
		{
			code: 'HOLIDAY5',
			discount_amount: '5.00',
			is_active: true,
			valid_from: new Date(new Date().setDate(new Date().getDate() - 15)),
			valid_to: new Date(new Date().setDate(new Date().getDate() + 15)),
		},
	]);

	// Generate subscription plans
	for (const plan of SUBSCRIPTION_PLANS) {
		await db.insert(subscriptionPlans).values({
			name: plan.name as 'bronze' | 'silver' | 'gold' | 'platinum',
			description: plan.description,
			price: plan.price,
			washes_per_month: plan.washes_per_month,
			is_active: true,
		});
	}

	const plans = await db.select().from(subscriptionPlans);

	// Generate users
	const usersData = Array.from({ length: USER_COUNT }).map(() => createRandomUser());
	const insertedUsers = await db.insert(users).values(usersData).returning();

	// Generate vehicles and subscriptions
	const allVehicles: InsertVehicle[] = [];
	const allSubscriptions: InsertSubscription[] = [];
	const allWashes: InsertWash[] = [];
	const allPaymentMethods = [];
	const allPayments = [];
	const allTransfers = [];

	for (const user of insertedUsers) {
		// Create payment methods first
		const paymentMethodCount = faker.number.int({ min: 1, max: 3 });
		const userPaymentMethods = [];

		for (let i = 0; i < paymentMethodCount; i++) {
			const paymentMethod = await db
				.insert(paymentMethods)
				.values(createPaymentMethod(user.id, i === 0))
				.returning();

			userPaymentMethods.push(...paymentMethod);
			allPaymentMethods.push(...paymentMethod);
		}

		// Create vehicles and subscriptions
		const vehicleCount = faker.number.int({ min: 1, max: 3 });
		const vehiclesData = Array.from({ length: vehicleCount }, () => createVehicleForUser(user.id));
		const insertedVehicles = await db.insert(vehicles).values(vehiclesData).returning();
		allVehicles.push(...insertedVehicles);

		// Create one-off washes for some vehicles (not part of subscription)
		for (const vehicle of insertedVehicles) {
			await createOneOffWashes(user.id, vehicle.id, userPaymentMethods[0].id);
		}

		// Create subscriptions for some vehicles
		for (const vehicle of insertedVehicles) {
			if (Math.random() < SUBSCRIPTION_RATE) {
				const plan = faker.helpers.arrayElement(plans);
				const subscription = await db
					.insert(subscriptions)
					.values(createSubscription(user.id, vehicle.id, plan.id))
					.returning();
				allSubscriptions.push(...subscription);

				// Create current period payment and washes
				const payment = await db
					.insert(payments)
					.values(createPaymentForSubscription(subscription[0], userPaymentMethods[0].id))
					.returning();
				allPayments.push(...payment);

				// Create washes for current period
				const washesData = createWashesForSubscription(subscription[0]);
				if (washesData.length > 0) {
					const insertedWashes = await db.insert(washes).values(washesData).returning();
					allWashes.push(...insertedWashes);
				}

				// Create historical payments and washes
				await createHistoricalPayments(subscription[0], userPaymentMethods[0].id);

				// Create subscription transfers for some subscriptions
				if (
					subscription[0].status === 'transferred' ||
					(insertedVehicles.length > 1 && Math.random() < SUBSCRIPTION_TRANSFER_RATE)
				) {
					// Find another vehicle to transfer to/from
					const otherVehicles = insertedVehicles.filter((v) => v.id !== vehicle.id);
					if (otherVehicles.length > 0) {
						const otherVehicle = faker.helpers.arrayElement(otherVehicles);
						const transfer = await db
							.insert(subscriptionTransfers)
							.values(createSubscriptionTransfer(subscription[0].id, vehicle.id, otherVehicle.id))
							.returning();
						allTransfers.push(...transfer);

						// Update the subscription to reflect the transfer
						if (subscription[0].status === 'transferred') {
							await db
								.update(subscriptions)
								.set({ vehicle_id: otherVehicle.id })
								.where(sql`id = ${subscription[0].id}`);
						}
					}
				}
			}
		}
	}

	console.log('Seeding complete:');
	console.log(`- Users: ${insertedUsers.length}`);
	console.log(`- Vehicles: ${allVehicles.length}`);
	console.log(`- Subscriptions: ${allSubscriptions.length}`);
	console.log(`- Washes: ${allWashes.length}`);
	console.log(`- Payment Methods: ${allPaymentMethods.length}`);
	console.log(`- Payments: ${allPayments.length}`);
	console.log(`- Subscription Transfers: ${allTransfers.length}`);
}

seedDatabase()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seeding failed:', err);
		process.exit(1);
	});
