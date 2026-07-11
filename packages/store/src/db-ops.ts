import { basename } from "node:path";
import type { LoadedTopic } from "@job-prep/engine";
import { and, asc, eq, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { contentHash } from "./content-hash.js";
import { contentTopics, gradingJobs, lessonProgress, users } from "./schema.js";
import type { Job, JobKind, JobStatus, NewJob } from "./queue.js";

/**
 * Pure, dependency-injected database operations shared by every Postgres-backed
 * path in this package (`PgProgressStore`, `DbContentSource`, the content
 * importer). Each function takes an already-built drizzle db so the SAME
 * production query code can run against either the node-postgres adapter (the
 * hosted path) or an in-process pglite adapter (tests) — they share drizzle's
 * `PgDatabase` query API.
 *
 * This module is deliberately `pg`-free: it types the injected db against
 * drizzle's base `PgDatabase` from `drizzle-orm/pg-core` and never imports the
 * node-postgres driver, so it stays driver-agnostic.
 */

/** A drizzle Postgres database over any driver (node-postgres, pglite, …). */
export type Db = PgDatabase<PgQueryResultHKT>;

/** The stable id for a projected topic: its declared id, else its directory name. */
function topicId(topic: LoadedTopic): string {
  return topic.topic?.id ?? basename(topic.dir);
}

/** Ensure a users row exists so lesson_progress writes never dangle. */
export async function ensureUser(db: Db, userId: string): Promise<void> {
  await db.insert(users).values({ id: userId }).onConflictDoNothing();
}

/** Fetch a user's progress for one topic, or null if none saved. */
export async function getProgress(
  db: Db,
  userId: string,
  topicId: string,
): Promise<unknown | null> {
  const rows = await db
    .select({ data: lessonProgress.data })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.topicId, topicId)))
    .limit(1);
  return rows.length ? (rows[0].data ?? null) : null;
}

/** Persist a user's progress for one topic (upsert), ensuring the user exists first. */
export async function setProgress(
  db: Db,
  userId: string,
  topicId: string,
  data: unknown,
): Promise<void> {
  await ensureUser(db, userId);
  await db
    .insert(lessonProgress)
    .values({ userId, topicId, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.topicId],
      set: { data, updatedAt: new Date() },
    });
}

/** List all saved topic progress for a user. */
export async function listProgress(
  db: Db,
  userId: string,
): Promise<{ topicId: string; data: unknown }[]> {
  const rows = await db
    .select({ topicId: lessonProgress.topicId, data: lessonProgress.data })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  return rows.map((r) => ({ topicId: r.topicId, data: r.data ?? null }));
}

/**
 * Idempotently upsert one projected topic row. Returns `true` if a row was
 * inserted/updated (content changed or absent) and `false` if the stored hash
 * already matches and the row was left untouched.
 */
export async function projectTopic(
  db: Db,
  id: string,
  hash: string,
  data: unknown,
): Promise<boolean> {
  const existing = await db
    .select({ contentHash: contentTopics.contentHash })
    .from(contentTopics)
    .where(eq(contentTopics.id, id))
    .limit(1);

  if (existing.length && existing[0].contentHash === hash) {
    return false;
  }

  await db
    .insert(contentTopics)
    .values({ id, contentHash: hash, data, importedAt: new Date() })
    .onConflictDoUpdate({
      target: contentTopics.id,
      set: { contentHash: hash, data, importedAt: new Date() },
    });
  return true;
}

/** Read all projected content rows back as `LoadedTopic`s. */
export async function loadContentRows(db: Db): Promise<LoadedTopic[]> {
  const rows = await db.select({ data: contentTopics.data }).from(contentTopics);
  return rows.map((r) => r.data as LoadedTopic);
}

/**
 * The injectable core of the content importer: project every loaded topic into
 * `content_topics` against the given db, returning imported/unchanged counts.
 * The `topics` are pre-loaded so this stays engine-loading-agnostic and works
 * over any drizzle db.
 */
export async function projectTopics(
  db: Db,
  topics: LoadedTopic[],
): Promise<{ imported: number; unchanged: number }> {
  let imported = 0;
  let unchanged = 0;
  for (const topic of topics) {
    const id = topicId(topic);
    const hash = contentHash(topic);
    if (await projectTopic(db, id, hash, topic)) {
      imported++;
    } else {
      unchanged++;
    }
  }
  return { imported, unchanged };
}

// ---- grading job queue (DESIGN §8) ---------------------------------------
//
// Injectable, driver-agnostic queue ops shared by the DbJobQueue (node-postgres)
// and exercised in-process by the pglite queue round-trip test. `claim()` uses
// `FOR UPDATE SKIP LOCKED` so a worker pool can pull disjoint jobs concurrently
// without double-processing; the pglite adapter honours the same SQL.

/** Map a raw grading_jobs row (snake_case columns) into a typed `Job`. */
function rowToJob(r: Record<string, unknown>): Job {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    topicId: String(r.topic_id),
    questionId: String(r.question_id),
    kind: r.kind as JobKind,
    payload: r.payload,
    status: r.status as JobStatus,
    result: r.result ?? null,
    attempts: Number(r.attempts ?? 0),
  };
}

/** Insert a queued job; returns its id. */
export async function insertJob(db: Db, job: NewJob & { id: string }): Promise<string> {
  await db.insert(gradingJobs).values({
    id: job.id,
    userId: job.userId,
    topicId: job.topicId,
    questionId: job.questionId,
    kind: job.kind,
    payload: job.payload,
    status: "queued",
    attempts: 0,
  });
  return job.id;
}

/**
 * Atomically move ONE oldest `queued` job to `running` and return it, or null.
 * `FOR UPDATE SKIP LOCKED` lets multiple workers claim disjoint jobs safely.
 */
export async function claimJob(db: Db): Promise<Job | null> {
  const res = await db.execute(sql`
    UPDATE grading_jobs SET status = 'running', attempts = attempts + 1, updated_at = now()
    WHERE id = (
      SELECT id FROM grading_jobs
      WHERE status = 'queued'
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `);
  const rows = (res as unknown as { rows?: Record<string, unknown>[] }).rows ??
    (res as unknown as Record<string, unknown>[]);
  const list = Array.isArray(rows) ? rows : [];
  return list.length ? rowToJob(list[0]) : null;
}

/** Set a terminal status + result on a job. */
export async function finishJob(
  db: Db,
  id: string,
  status: Extract<JobStatus, "done" | "flagged" | "failed">,
  result: unknown,
): Promise<void> {
  await db
    .update(gradingJobs)
    .set({ status, result, updatedAt: new Date() })
    .where(eq(gradingJobs.id, id));
}

/** Fetch a single job by id, or null. */
export async function getJob(db: Db, id: string): Promise<Job | null> {
  const rows = await db.select().from(gradingJobs).where(eq(gradingJobs.id, id)).limit(1);
  return rows.length ? rowToJob(rows[0] as unknown as Record<string, unknown>) : null;
}

/** List a user's jobs, newest first (owner-scoped). */
export async function listJobs(db: Db, userId: string): Promise<Job[]> {
  const rows = await db
    .select()
    .from(gradingJobs)
    .where(eq(gradingJobs.userId, userId))
    .orderBy(asc(gradingJobs.createdAt));
  return rows.map((r) => rowToJob(r as unknown as Record<string, unknown>));
}
