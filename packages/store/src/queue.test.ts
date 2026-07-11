import assert from "node:assert/strict";
import { test } from "node:test";
import type { Db } from "./db-ops.js";
import { DbJobQueue, InMemoryJobQueue, type JobQueue, type NewJob } from "./queue.js";

/**
 * Build an in-memory pglite-backed drizzle db with the grading_jobs table so the
 * SAME production queue db-ops (claim() with FOR UPDATE SKIP LOCKED, etc.) run
 * end-to-end with no external Postgres and no Docker. pglite is Postgres in WASM,
 * so it shares the node-postgres drizzle query API — the `as unknown as Db` cast
 * is safe.
 */
async function makeDb(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  await client.exec(`
    CREATE TABLE grading_jobs (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      topic_id text NOT NULL,
      question_id text NOT NULL,
      kind text NOT NULL,
      payload jsonb NOT NULL,
      status text NOT NULL DEFAULT 'queued',
      result jsonb,
      attempts integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  return drizzle(client) as unknown as Db;
}

const sampleJob = (n: number): NewJob => ({
  userId: "u1",
  topicId: "kv-cache-management",
  questionId: `q${n}`,
  kind: "essay",
  payload: { answer: `answer ${n}` },
});

/**
 * The shared round-trip contract, run against both queue implementations:
 * enqueue 2 → claim() returns them one at a time (status→running) → complete/flag
 * set the terminal status → get reflects it → a second claim() after both are
 * terminal returns null.
 */
async function roundTrip(queue: JobQueue): Promise<void> {
  const id1 = await queue.enqueue(sampleJob(1));
  const id2 = await queue.enqueue(sampleJob(2));
  assert.notEqual(id1, id2, "each enqueue gets a distinct id");

  // First claim yields one queued job, now running.
  const c1 = await queue.claim();
  assert.ok(c1, "first claim returns a job");
  assert.equal(c1!.status, "running");
  assert.equal((await queue.get(c1!.id))!.status, "running");

  // Second claim yields the OTHER job (not the same one again).
  const c2 = await queue.claim();
  assert.ok(c2, "second claim returns the second job");
  assert.notEqual(c1!.id, c2!.id, "claim() never hands out the same job twice");

  // Both are now running → a third claim finds nothing queued.
  assert.equal(await queue.claim(), null, "no queued jobs left to claim");

  // Terminal transitions: one done, one flagged.
  await queue.complete(c1!.id, { verdict: "pass" });
  await queue.flag(c2!.id, { verdict: "borderline", needsReview: true });

  const g1 = await queue.get(c1!.id);
  const g2 = await queue.get(c2!.id);
  assert.equal(g1!.status, "done");
  assert.deepEqual(g1!.result, { verdict: "pass" });
  assert.equal(g2!.status, "flagged");
  assert.deepEqual(g2!.result, { verdict: "borderline", needsReview: true });

  // After both terminal, claim() still returns null.
  assert.equal(await queue.claim(), null, "no queued jobs after both terminal");
}

test("queue round-trip: InMemoryJobQueue", async () => {
  await roundTrip(new InMemoryJobQueue());
});

test("queue round-trip: DbJobQueue over pglite (production SQL)", async () => {
  const db = await makeDb();
  await roundTrip(new DbJobQueue(db));
});
