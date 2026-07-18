import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool as PgPool } from "pg";
import type { Db } from "./db-ops.js";
import { getProgress, listProgress, setProgress, updateProgress } from "./db-ops.js";
import type { ProgressStore } from "./types.js";

/**
 * Postgres-backed ProgressStore. The heavy runtime dependencies (`pg` and
 * drizzle's node-postgres adapter) are loaded via dynamic import() the first
 * time the store is used — so importing this module (or the store package)
 * never pulls in `pg`. Only instantiating and calling this store does.
 *
 * The actual queries live in `db-ops.ts` as pure, dependency-injected functions;
 * this class just builds the node-postgres drizzle db and delegates to them, so
 * the same query code is exercised by the in-process pglite tests.
 *
 * This preserves the hard requirement: the file path has ZERO required runtime
 * deps; `pg` is only touched when STORE=pg is explicitly selected.
 */
/**
 * ONE connection pool per connection string, shared PROCESS-WIDE. A new
 * `PgProgressStore` is built on every request (the web app calls `createStore()`
 * per request, several times per request), so a per-instance pool would open a
 * fresh `pg.Pool` each time and never release it — under rapid navigation those
 * pools accumulate and exhaust Postgres's connection slots, surfacing as
 * intermittent server errors. Caching the pool by connection string means every
 * store instance reuses the same bounded pool. `pg`/drizzle are still loaded
 * lazily, so importing this module never pulls in `pg`.
 */
const pools = new Map<string, Promise<{ pool: PgPool; db: NodePgDatabase }>>();

function getPooled(connectionString: string): Promise<{ pool: PgPool; db: NodePgDatabase }> {
  let entry = pools.get(connectionString);
  if (!entry) {
    entry = (async () => {
      const { Pool } = await import("pg");
      const { drizzle } = await import("drizzle-orm/node-postgres");
      const pool = new Pool({ connectionString });
      return { pool, db: drizzle(pool) };
    })();
    pools.set(connectionString, entry);
  }
  return entry;
}

export class PgProgressStore implements ProgressStore {
  private readonly connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  private async database(): Promise<Db> {
    const { db } = await getPooled(this.connectionString);
    return db as unknown as Db;
  }

  async get(userId: string, topicId: string): Promise<unknown | null> {
    return getProgress(await this.database(), userId, topicId);
  }

  async set(userId: string, topicId: string, data: unknown): Promise<void> {
    await setProgress(await this.database(), userId, topicId, data);
  }

  async list(userId: string): Promise<{ topicId: string; data: unknown }[]> {
    return listProgress(await this.database(), userId);
  }

  async update(
    userId: string,
    topicId: string,
    mutator: (prev: unknown | null) => unknown,
  ): Promise<unknown> {
    return updateProgress(await this.database(), userId, topicId, mutator);
  }
}
