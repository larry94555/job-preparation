import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool as PgPool } from "pg";
import type { Db } from "./db-ops.js";
import { getProgress, listProgress, setProgress } from "./db-ops.js";
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
export class PgProgressStore implements ProgressStore {
  private readonly connectionString: string;
  private pool?: PgPool;
  private db?: NodePgDatabase;
  private initialized?: Promise<void>;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  private async init(): Promise<void> {
    if (!this.initialized) {
      this.initialized = (async () => {
        const { Pool } = await import("pg");
        const { drizzle } = await import("drizzle-orm/node-postgres");
        this.pool = new Pool({ connectionString: this.connectionString });
        this.db = drizzle(this.pool);
      })();
    }
    await this.initialized;
  }

  private async database(): Promise<Db> {
    await this.init();
    return this.db! as unknown as Db;
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
}
