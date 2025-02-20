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
} from './schema';
import {
	InsertUser,
	InsertVehicle,
	InsertSubscriptionPlan,
	InsertSubscription,
	InsertWash,
} from './types';
import {
	userInsertSchema,
	vehicleInsertSchema,
	subscriptionInsertSchema,
	washInsertSchema,
	paymentInsertSchema,
} from './types';
import { sql } from 'drizzle-orm';

const USER_COUNT = 50;
const SUBSCRIPTION_PLANS: InsertSubscriptionPlan[] = [
	{
		name: 'bronze',
		description: 'Bronze plan',
		price: '20.00',
		washes_per_month: 4,
	},
	{
		name: 'silver',
		description: 'Silver plan',
		price: '30.00',
		washes_per_month: 8,
	},
	{
		name: 'gold',
		description: 'Gold plan',
		price: '40.00',
		washes_per_month: 12,
	},
	{
		name: 'platinum',
		description: 'Platinum plan',
		price: '50.00',
		washes_per_month: 16,
	},
];

const SUBSCRIPTION_RATE = 0.65; // 65% of vehicles get subscriptions

function createRandomUser(): InsertUser {
	return userInsertSchema.parse({
		name: faker.person.fullName(),
		email: faker.internet.email(),
		phone: faker.phone.number(),
		address: faker.location.streetAddress(),
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
		license_plate: faker.vehicle.vrm(),
		year: faker.date.past({ years: 10 }).getFullYear(),
	});
}

// Helper function to get random number between min and max
function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getWashesPerMonth(planId: number): number {
	const planLimits: Record<number, number> = {
		1: 4, // Bronze
		2: 8, // Silver
		3: 12, // Gold
		4: 16, // Platinum
	};
	return planLimits[planId] || 4;
}

function createSubscription(userId: number, vehicleId: number, planId: number): InsertSubscription {
	const statusDistribution = {
		active: 0.7, // 70% active
		inactive: 0.1, // 10% inactive
		overdue: 0.1, // 10% overdue
		transferred: 0.1, // 10% transferred
	};

	const status = faker.helpers.weightedArrayElement([
		{ weight: 0.7, value: 'active' },
		{ weight: 0.1, value: 'inactive' },
		{ weight: 0.1, value: 'overdue' },
		{ weight: 0.1, value: 'transferred' },
	]);

	const now = new Date();
	const startDate = faker.date.recent({ days: 30, refDate: now });
	const isOverdue = faker.datatype.boolean({ probability: 0.1 }); // 10% chance

	// For overdue subscriptions, set last payment to over a month ago
	const lastPaymentDate = isOverdue
		? new Date(startDate.getTime() - 35 * 24 * 60 * 60 * 1000)
		: startDate;

	const maxWashes = getWashesPerMonth(planId);
	const usedWashes = faker.number.int({ min: 0, max: maxWashes });

	return {
		user_id: userId,
		vehicle_id: vehicleId,
		plan_id: planId,
		remaining_washes: maxWashes - usedWashes,
		subscription_status: status,
		start_date: startDate,
		current_period_end: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
		next_payment_date: new Date(startDate.getTime() + 27 * 24 * 60 * 60 * 1000),
		last_payment_date: lastPaymentDate,
		last_payment_status: isOverdue ? 'failed' : 'paid',
		cancellation_date: null,
		created_at: startDate,
		updated_at: null,
		deleted_at: null,
	};
}

function createWashesForSubscription(subscription: InsertSubscription): InsertWash[] {
	const usedWashes = getWashesPerMonth(subscription.plan_id) - subscription.remaining_washes;

	return Array.from({ length: usedWashes }, (_, i) => ({
		user_id: subscription.user_id,
		vehicle_id: subscription.vehicle_id,
		subscription_id: subscription.id,
		created_at: faker.date.between({
			from: subscription.start_date,
			to: new Date(),
		}),
		updated_at: null,
		deleted_at: null,
	}));
}

function createPaymentForSubscription(
	subscription: InsertSubscription,
	paymentMethodId: number,
	status: string
) {
	const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id);
	return paymentInsertSchema.parse({
		user_id: subscription.user_id,
		payment_method_id: paymentMethodId,
		base_amount: plan?.price || '0.00',
		discount_amount: '0.00',
		final_amount: plan?.price || '0.00',
		status: status,
		item_type: 'subscription',
		subscription_id: subscription.id,
		created_at: subscription.start_date,
	});
}

// Function to create payment method for a user
function createPaymentMethod(userId: number, isDefault: boolean) {
	return {
		user_id: userId,
		card_last4: faker.finance.creditCardNumber().slice(-4),
		card_exp_month: getRandomInt(1, 12),
		card_exp_year: getRandomInt(2025, 2030),
		is_default: isDefault,
	};
}

// Add historical payments for subscriptions
async function createHistoricalPayments(subscription: InsertSubscription, paymentMethodId: number) {
	const monthsActive = faker.number.int({ min: 1, max: 12 });
	const paymentsData = Array.from({ length: monthsActive }, (_, i) => ({
		...createPaymentForSubscription(subscription, paymentMethodId, 'paid'),
		created_at: new Date(subscription.start_date.getTime() - i * 30 * 24 * 60 * 60 * 1000),
	}));
	return db.insert(payments).values(paymentsData);
}

async function seedDatabase() {
	// Reset all tables and restart serial IDs
	await db.transaction(async (tx) => {
		await tx.execute(sql`TRUNCATE TABLE payments RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE payment_methods RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE washes RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE subscriptions RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
		await tx.execute(sql`TRUNCATE TABLE subscription_plans RESTART IDENTITY CASCADE`);
	});

	// Generate subscription plans
	const plans = await db.insert(subscriptionPlans).values(SUBSCRIPTION_PLANS).returning();

	// Generate users
	const usersData = Array.from({ length: USER_COUNT }).map(() => createRandomUser());
	const insertedUsers = await db.insert(users).values(usersData).returning();

	// Generate vehicles and subscriptions
	const allVehicles: InsertVehicle[] = [];
	const allSubscriptions: InsertSubscription[] = [];
	const allWashes: InsertWash[] = [];
	const allPaymentMethods = [];
	const allPayments = [];

	for (const user of insertedUsers) {
		// Create 1-3 vehicles per user
		const vehicleCount = faker.number.int({ min: 1, max: 3 });
		const vehiclesData = Array.from({ length: vehicleCount }, () => createVehicleForUser(user.id));
		const insertedVehicles = await db.insert(vehicles).values(vehiclesData).returning();
		allVehicles.push(...insertedVehicles);

		// Create 1-2 payment methods per user
		const paymentMethodCount = faker.number.int({ min: 1, max: 2 });
		for (let i = 0; i < paymentMethodCount; i++) {
			const paymentMethod = await db
				.insert(paymentMethods)
				.values(createPaymentMethod(user.id, i === 0)) // First one is default
				.returning();
			allPaymentMethods.push(...paymentMethod);
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

				// Create washes based on used washes
				const washesData = createWashesForSubscription(subscription[0]);
				if (washesData.length > 0) {
					const insertedWashes = await db.insert(washes).values(washesData).returning();
					allWashes.push(...insertedWashes);
				}

				// Create payment for subscription (10% chance of failed payment)
				const paymentStatus = Math.random() < 0.9 ? 'paid' : 'failed';
				const payment = await db
					.insert(payments)
					.values(
						createPaymentForSubscription(subscription[0], allPaymentMethods[0].id, paymentStatus)
					)
					.returning();
				allPayments.push(...payment);
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
}

seedDatabase()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seeding failed:', err);
		process.exit(1);
	});
