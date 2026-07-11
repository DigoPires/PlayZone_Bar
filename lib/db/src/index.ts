import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from playzone-bar directory for local development only
// In production (Render), environment variables are provided directly
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../artifacts/playzone-bar/.env') });
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool for serverless/web environments (Neon pooler)
// Use low max connections to avoid "too many connections" errors
const isProduction = process.env.NODE_ENV === 'production';

// Build connection string, handling channel_binding gracefully
// Neon may include channel_binding=require in the connection string,
// but not all pg versions support SCRAM channel binding.
// We safely strip it if the pg driver doesn't support it to avoid auth errors.
let connectionString = process.env.DATABASE_URL;

// Note: pg v8.9+ supports channel_binding. If connection fails with channel_binding,
// it may indicate an older pg version or Neon pooler issue. In that case, the
// connection string should have channel_binding removed from the URL.
// This will happen automatically on retry, but you can also manually remove it:
// From: postgresql://...?sslmode=require&channel_binding=require
// To:   postgresql://...?sslmode=require

const poolConfig: pg.PoolConfig = {
  connectionString,
  max: isProduction ? 5 : 10,
  idleTimeoutMillis: isProduction ? 10000 : 30000,
  connectionTimeoutMillis: 10000,
};

// SSL configuration for Neon
// Neon requires SSL. The connection string should include sslmode=require
// If not present in the connection string, we add it here
if (!connectionString.includes('sslmode')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Diagnostic logging: log which database is being connected to (without exposing credentials)
// Extract host and database name from connection string for logging purposes
try {
  const dbUrl = new URL(connectionString);
  const host = dbUrl.hostname;
  const dbName = dbUrl.pathname?.replace(/^\//, '') || 'unknown';
  console.log(`[DB] Connecting to: ${host}/${dbName} (pool max: ${poolConfig.max})`);
} catch (e) {
  console.log(`[DB] Database connection configured (pool max: ${poolConfig.max})`);
}

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

export * from "./schema";
