import { InsertSubscriptionPlan } from '@/db/types';

export const SUBSCRIPTION_PLANS: InsertSubscriptionPlan[] = [
	{
		id: 1,
		name: 'bronze',
		description: 'Bronze plan',
		price: '20.00',
		washes_per_month: 4,
	},
	{
		id: 2,
		name: 'silver',
		description: 'Silver plan',
		price: '30.00',
		washes_per_month: 8,
	},
	{
		id: 3,
		name: 'gold',
		description: 'Gold plan',
		price: '40.00',
		washes_per_month: 12,
	},
	{
		id: 4,
		name: 'platinum',
		description: 'Platinum plan',
		price: '50.00',
		washes_per_month: 16,
	},
];

export const VEHICLE_COLORS = [
	{ value: 'black', label: 'Black' },
	{ value: 'blue', label: 'Blue' },
	{ value: 'bronze', label: 'Bronze' },
	{ value: 'gold', label: 'Gold' },
	{ value: 'gray', label: 'Gray' },
	{ value: 'green', label: 'Green' },
	{ value: 'red', label: 'Red' },
	{ value: 'silver', label: 'Silver' },
	{ value: 'white', label: 'White' },
	{ value: 'yellow', label: 'Yellow' },
];
