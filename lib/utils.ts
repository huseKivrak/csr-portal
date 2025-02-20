import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SelectVehicle } from '@/db/types';
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
