import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SelectPaymentMethod, SelectVehicle } from '@/db/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function makeVehicleTitle(vehicle: SelectVehicle) {
	const { year, make, model } = vehicle;
	return `${year} ${make} ${model}`.toUpperCase();
}

export function formatDateTime(date: Date, includeTime: boolean = true) {
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		year: '2-digit',
		month: 'numeric',
		day: 'numeric',
	};

	if (includeTime) {
		options.hour = '2-digit';
		options.minute = '2-digit';
	}

	const dateTimeFormatter = new Intl.DateTimeFormat('en-US', options);
	return dateTimeFormatter.format(date);
}

export function capitalize(str: string) {
	return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

export function formatCurrency(amount: number | string): string {
	// Ensure the amount is a number
	const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

	// Handle invalid amounts
	if (isNaN(numericAmount)) {
		return '$0.00';
	}

	// Format with currency symbol and 2 decimal places
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numericAmount);
}

  // Helper function to format payment method display
export function formatPaymentMethod(method: SelectPaymentMethod) {
	return `•••• ${method.card_last4} (expires ${method.card_exp_month}/${method.card_exp_year})`;
}
