import { InsertSubscriptionPlan } from '@/db/types';

interface SubscriptionPlan {
	id: number;
	name: string;
	label: string;
	description: string;
	price: string;
	washes_per_month: number;
}
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
	{
		id: 1,
		name: 'bronze',
		label: 'Bronze',
		description: 'Our most popular option. A wash a week for just $20 a month.',
		price: '20.00',
		washes_per_month: 4,
	},
	{
		id: 2,
		name: 'silver',
		label: 'Silver',
		description: 'A popular upsell -- double the washes for only $10 more a month.',
		price: '30.00',
		washes_per_month: 8,
	},
	{
		id: 3,
		name: 'gold',
		label: 'Gold',
		description: 'Truly a golden deal at only $40 a month. ',
		price: '40.00',
		washes_per_month: 12,
	},
	{
		id: 4,
		name: 'platinum',
		label: 'Platinum',
		description: 'Our best deal -- a wash every other day for only $50 a month!',
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
