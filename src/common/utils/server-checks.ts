// utils/server-checks.ts

import crypto from 'crypto';

interface ValidatedData {
	[key: string]: string;
}

interface User {
	id?: string;
	username?: string;
	first_name?: string;
}

interface ValidationResult {
	validatedData: ValidatedData | null;
	user: User;
	message: string;
}

export function validateTelegramWebAppData(telegramInitData: string): ValidationResult {
	const BOT_TOKEN = process.env.BOT_TOKEN;
	let validatedData: ValidatedData | null = null;
	let user: User = {};
	let message = '';

	console.log('telegramInitData', telegramInitData);

	if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH) {
		validatedData = { temp: '' };
		user = { id: 'undefined', username: 'Unknown User' };
		message = 'Authentication bypassed for development';
	} else {
		if (!BOT_TOKEN) {
			console.error('BOT_TOKEN is not set');
			return { message: 'BOT_TOKEN is not set', validatedData: null, user: {} };
		}

		const initData = new URLSearchParams(telegramInitData);
		const hash = initData.get('hash');

		if (!hash) {
			console.error('Hash is missing from initData');
			return { message: 'Hash is missing from initData', validatedData: null, user: {} };
		}

		initData.delete('hash');

		const dataCheckString = Array.from(initData.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, value]) => `${ key }=${ value }`)
			.join('\n');

		console.log('Data Check String:', dataCheckString);

		const isMiniApp = telegramInitData.includes('signature=');
		const secretKey = isMiniApp
			? crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()
			: BOT_TOKEN;
		const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

		console.log('Calculated Hash:', calculatedHash);
		console.log('Received Hash:', hash);

		if (calculatedHash === hash) {
			validatedData = Object.fromEntries(initData.entries());
			message = 'Validation successful';
			const userString = validatedData['user'];
			if (userString) {
				try {
					user = JSON.parse(userString);
				} catch (error) {
					console.error('Error parsing user data:', error);
					message = 'Error parsing user data';
					validatedData = null;
				}
			} else {
				console.error('User data is missing');
				message = 'User data is missing';
				validatedData = null;
			}
		} else {
			console.error('Hash validation failed');
			message = 'Hash validation failed';
			validatedData = null;
		}
	}

	return { validatedData, user, message };
}
