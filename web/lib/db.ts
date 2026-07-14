import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let cached: NodePgDatabase | undefined;

/**
 * The shared node-postgres drizzle db used by the Auth.js adapter — built once
 * and cached. Returns null when no `DATABASE_URL` is configured (local file-store
 * dev), in which case auth.ts skips the adapter and falls back to the dev
 * credentials provider. This module is `server-only`, so it never reaches the
 * edge middleware bundle (which uses auth.config.ts, not the adapter).
 */
export function authDb(): NodePgDatabase | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) cached = drizzle(new Pool({ connectionString: url }));
  return cached;
}
