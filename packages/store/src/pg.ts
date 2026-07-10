import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool as PgPool } from "pg";
import { lessonProgress, users } from "./schema.js";
import type { ProgressStore } from "./types.js";

/**
 * Postgres-backed ProgressStore. The heavy runtime dependencies (`pg` and
 * drizzle's node-postgres adapter) are loaded via dynamic import() the first
 * time the store is used — so importing this module (or the store package)
 * never pulls in `pg`. Only instantiating and calling this store does.
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

  private async database(): Promise<NodePgDatabase> {
    await this.init();
    return this.db!;
  }

  /** Ensure a users row exists so lesson_progress writes never dangle. */
  private async ensureUser(userId: string): Promise<void> {
    const db = await this.database();
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
  }

  async get(userId: string, topicId: string): Promise<unknown | null> {
    const db = await this.database();
    const rows = await db
      .select({ data: lessonProgress.data })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.topicId, topicId)))
      .limit(1);
    return rows.length ? (rows[0].data ?? null) : null;
  }

  async set(userId: string, topicId: string, data: unknown): Promise<void> {
    const db = await this.database();
    await this.ensureUser(userId);
    await db
      .insert(lessonProgress)
      .values({ userId, topicId, data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.topicId],
        set: { data, updatedAt: new Date() },
      });
  }

  async list(userId: string): Promise<{ topicId: string; data: unknown }[]> {
    const db = await this.database();
    const rows = await db
      .select({ topicId: lessonProgress.topicId, data: lessonProgress.data })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));
    return rows.map((r) => ({ topicId: r.topicId, data: r.data ?? null }));
  }
}
