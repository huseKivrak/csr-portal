import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Config for Drizzle-Kit only
export default defineConfig({
	out: './drizzle',
	schema: './db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	verbose: true,
	strict: true,
});
