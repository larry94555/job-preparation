import { loadAllTopics, type LoadedTopic } from "@job-prep/engine";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool as PgPool } from "pg";
import type { Db } from "./db-ops.js";
import { loadContentRows } from "./db-ops.js";

/**
 * A source of lesson content. Two implementations back it:
 *
 * - `FileContentSource` (local default) reads the git-tracked `topics/` configs
 *   synchronously via the engine's `loadAllTopics`. Zero runtime dependencies
 *   beyond the engine — no database, no Docker.
 * - `DbContentSource` (hosted) reads the projected `content_topics` rows from
 *   Postgres, dynamically importing `pg` so the file path never touches it.
 *
 * The local server keeps calling `loadAllTopics` directly; this abstraction is
 * for the hosted path and the content importer.
 */
export interface ContentSource {
  loadTopics(): Promise<LoadedTopic[]>;
}

/** Reads content from the git-tracked `topics/` configs (local-first default). */
export class FileContentSource implements ContentSource {
  private readonly dir: string;

  constructor(dir = "topics") {
    this.dir = dir;
  }

  async loadTopics(): Promise<LoadedTopic[]> {
    return loadAllTopics(this.dir).topics;
  }
}

/**
 * Reads content from the projected `content_topics` table in Postgres. `pg` and
 * the drizzle adapter are loaded via dynamic import() the first time the source
 * is used, so importing this module never pulls in Postgres.
 */
export class DbContentSource implements ContentSource {
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

  async loadTopics(): Promise<LoadedTopic[]> {
    return loadContentRows(await this.database());
  }
}

/**
 * Build the ContentSource selected by the environment.
 *
 * - CONTENT=file (default): FileContentSource over TOPICS_DIR (default "topics").
 *   Zero database dependency — the local, zero-setup path.
 * - CONTENT=db: DbContentSource over DATABASE_URL (required). Only this branch
 *   ever constructs the pg-backed source, which dynamically imports `pg`.
 */
export function createContentSource(): ContentSource {
  const kind = process.env.CONTENT ?? "file";
  if (kind === "db") {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("CONTENT=db requires DATABASE_URL to be set (e.g. postgres://user:pass@host:5432/db).");
    }
    return new DbContentSource(url);
  }
  if (kind !== "file") {
    throw new Error(`Unknown CONTENT="${kind}" (expected "file" or "db").`);
  }
  return new FileContentSource(process.env.TOPICS_DIR ?? "topics");
}
