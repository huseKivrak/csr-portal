import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';
import * as relations from './relations';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error('No DATABASE_URL provided');
	process.exit(1);
}

let client: Sql<{}>;

//Fixes max connection error in development
//https://github.com/drizzle-team/drizzle-orm/discussions/688

if (process.env.NODE_ENV === 'production') {
	client = postgres(connectionString, { prepare: false });
} else {
	let globalClient = global as typeof globalThis & { client?: Sql<{}> };
	if (!globalClient.client) {
		globalClient.client = postgres(connectionString, { prepare: false });
	}
	client = globalClient.client;
}

export const db = drizzle(client, {
	schema: { ...schema, ...relations },
	logger: process.env.NODE_ENV !== 'production',
});
