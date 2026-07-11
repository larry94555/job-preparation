import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { Db } from "./db-ops.js";
import {
  getProgress,
  listProgress,
  loadContentRows,
  setProgress,
  updateProgress,
} from "./db-ops.js";
import { importContentWithDb } from "./content-import.js";

// Resolve the repo's topics/ dir relative to this test file so it works from any cwd.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const topicsDir = resolve(repoRoot, "topics");

/**
 * Build an in-memory pglite-backed drizzle db and create the tables by running
 * DDL that mirrors `schema.ts`. pglite is Postgres compiled to WASM, so the SAME
 * production db-ops (typed against drizzle's base `PgDatabase`) run end-to-end
 * with no external database and no Docker. pglite and the node-postgres drizzle
 * adapter share the same query API, so the `as unknown as Db` cast is safe.
 */
async function makeDb(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  await client.exec(`
    CREATE TABLE users (
      id text PRIMARY KEY,
      email text,
      role text NOT NULL DEFAULT 'user'
    );
    CREATE TABLE lesson_progress (
      user_id text NOT NULL,
      topic_id text NOT NULL,
      data jsonb,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, topic_id)
    );
    CREATE TABLE content_topics (
      id text PRIMARY KEY,
      content_hash text NOT NULL,
      data jsonb NOT NULL,
      imported_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  return drizzle(client) as unknown as Db;
}

test("pglite: progress round-trips through the production db-ops", async () => {
  const db = await makeDb();

  const p1 = { index: 5, seed: 1 };
  await setProgress(db, "u1", "kv-cache-management", p1);
  assert.deepEqual(await getProgress(db, "u1", "kv-cache-management"), p1);

  // A second topic for the same user.
  const p2 = { index: 2, seed: 7 };
  await setProgress(db, "u1", "speculative-decoding", p2);

  const rows = await listProgress(db, "u1");
  assert.equal(rows.length, 2);

  // Missing key → null.
  assert.equal(await getProgress(db, "u1", "does-not-exist"), null);
});

test("pglite: content projection imports idempotently and reads back", async () => {
  const db = await makeDb();

  const r1 = await importContentWithDb(db, topicsDir);
  assert.equal(r1.imported, 23);
  assert.equal(r1.unchanged, 0);

  // Re-importing unchanged content is a no-op: everything reports unchanged.
  const r2 = await importContentWithDb(db, topicsDir);
  assert.equal(r2.imported, 0);
  assert.equal(r2.unchanged, 23);

  const topics = await loadContentRows(db);
  assert.equal(topics.length, 23);
  const known = topics.find((t) => t.topic?.id === "kv-cache-management");
  assert.ok(known, "kv-cache-management topic present in projected rows");
  assert.equal(known!.topic?.id, "kv-cache-management");
});

test("pglite: updateProgress does transactional read-modify-write with FOR UPDATE", async () => {
  const db = await makeDb();

  // First write: row absent → mutator sees null, row is created, value returned.
  const first = await updateProgress(db, "u1", "kv-cache-management", (prev) => {
    assert.equal(prev, null);
    return { items: [0] };
  });
  assert.deepEqual(first, { items: [0] });
  assert.deepEqual(await getProgress(db, "u1", "kv-cache-management"), { items: [0] });

  // Subsequent updates accumulate off the freshest stored value (the FOR UPDATE
  // path reads, mutates, and writes within one transaction). pglite is a single
  // in-process connection, so this validates the read-modify-write query path;
  // the row lock provides the same guarantee across instances on real Postgres.
  for (let i = 1; i < 10; i++) {
    await updateProgress(db, "u1", "kv-cache-management", (prev) => {
      const cur = (prev as { items: number[] }).items;
      return { items: [...cur, i] };
    });
  }
  const saved = (await getProgress(db, "u1", "kv-cache-management")) as { items: number[] };
  assert.deepEqual(saved.items, Array.from({ length: 10 }, (_, i) => i));

  // A different user's row is untouched.
  assert.equal(await getProgress(db, "u2", "kv-cache-management"), null);
});
