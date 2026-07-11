import { loadAllTopics } from "@job-prep/engine";
import type { Db } from "./db-ops.js";
import { projectTopics } from "./db-ops.js";

/**
 * The injectable core of the importer: project the git-tracked `topics/` content
 * into the `content_topics` table of the GIVEN drizzle db. This is `pg`-free and
 * driver-agnostic, so it can run against either a node-postgres db (hosted) or an
 * in-process pglite db (tests) over the exact same production upsert logic.
 *
 * Idempotent: each topic is fingerprinted with `contentHash`; a row is inserted
 * or updated only when its hash differs from what is already stored. Rows whose
 * content is unchanged are skipped and counted separately, so re-running the
 * import after no content change reports every topic as `unchanged`.
 */
export async function importContentWithDb(
  db: Db,
  topicsDir = "topics",
): Promise<{ imported: number; unchanged: number }> {
  const { topics } = loadAllTopics(topicsDir);
  return projectTopics(db, topics);
}

/**
 * Project the git-tracked `topics/` content into the `content_topics` table.
 *
 * `pg` and the drizzle adapter are loaded via dynamic import() so this module
 * never pulls in Postgres unless the importer actually runs; it then delegates
 * to `importContentWithDb` so the same upsert logic backs both this hosted path
 * and the in-process pglite tests.
 */
export async function importContent(
  connectionString: string,
  topicsDir = "topics",
): Promise<{ imported: number; unchanged: number }> {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new Pool({ connectionString });
  try {
    const db = drizzle(pool) as unknown as Db;
    return await importContentWithDb(db, topicsDir);
  } finally {
    await pool.end();
  }
}
