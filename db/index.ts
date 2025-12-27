import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/vib3_idea_sales';

// Disable prefetch for migrations and connection pooling
const client = postgres(connectionString, { max: 1 });

export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };
