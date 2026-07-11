import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool as PgPool } from "pg";
import type { Db } from "./db-ops.js";
import { claimJob, finishJob, getJob, insertJob } from "./db-ops.js";

/**
 * Async grading job queue (DESIGN §8). Open-ended (essay/code) grading is
 * enqueued rather than run inline — the single-slot model can't grade
 * synchronously in a multi-user app. A worker pool claims `queued` jobs, grades
 * them (with confidence escalation), and moves each to a terminal state.
 *
 * Two implementations share one interface:
 *   - `InMemoryJobQueue`: an array — the local file-path / test default (no deps).
 *   - `DbJobQueue`: over a drizzle Postgres db; `pg` is dynamically imported so
 *     importing this module never pulls in the driver. The actual SQL lives in
 *     `db-ops.ts` (pglite-testable), including the `FOR UPDATE SKIP LOCKED`
 *     atomic `claim()` that lets many workers pull disjoint jobs safely.
 */

export type JobKind = "essay" | "code";
export type JobStatus = "queued" | "running" | "done" | "flagged" | "failed";

/** The fields a caller supplies when enqueuing. */
export interface NewJob {
  userId: string;
  topicId: string;
  questionId: string;
  kind: JobKind;
  /** The submission + whatever the worker needs to grade it. */
  payload: unknown;
}

/** A persisted grading job. */
export interface Job extends NewJob {
  id: string;
  status: JobStatus;
  result: unknown;
  attempts: number;
}

export interface JobQueue {
  enqueue(job: NewJob): Promise<string>;
  /** Atomically claim ONE queued job, moving it to `running`. Null if none. */
  claim(): Promise<Job | null>;
  complete(id: string, result: unknown): Promise<void>;
  flag(id: string, result: unknown): Promise<void>;
  fail(id: string, error: unknown): Promise<void>;
  get(id: string): Promise<Job | null>;
}

/** Crypto-free monotonic id: timestamp + counter, so ordering is stable. */
let __counter = 0;
export function nextJobId(): string {
  __counter = (__counter + 1) % 1_000_000;
  return `job_${Date.now().toString(36)}_${__counter.toString(36).padStart(4, "0")}`;
}

/**
 * In-memory queue backed by a plain array. Used for the local file-path store
 * (STORE=file / QUEUE=memory) and by tests. `claim()` pulls the oldest queued
 * job; single-process, so no locking is needed.
 */
export class InMemoryJobQueue implements JobQueue {
  private jobs: Job[] = [];

  async enqueue(job: NewJob): Promise<string> {
    const id = nextJobId();
    this.jobs.push({ ...job, id, status: "queued", result: null, attempts: 0 });
    return id;
  }

  async claim(): Promise<Job | null> {
    const job = this.jobs.find((j) => j.status === "queued");
    if (!job) return null;
    job.status = "running";
    job.attempts += 1;
    return { ...job };
  }

  private finish(id: string, status: JobStatus, result: unknown): void {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      job.status = status;
      job.result = result;
    }
  }

  async complete(id: string, result: unknown): Promise<void> {
    this.finish(id, "done", result);
  }
  async flag(id: string, result: unknown): Promise<void> {
    this.finish(id, "flagged", result);
  }
  async fail(id: string, error: unknown): Promise<void> {
    this.finish(id, "failed", { error: String((error as Error)?.message ?? error) });
  }
  async get(id: string): Promise<Job | null> {
    const job = this.jobs.find((j) => j.id === id);
    return job ? { ...job } : null;
  }
}

/**
 * Postgres-backed queue over the injectable db-ops. The `pg` driver + drizzle
 * node-postgres adapter are loaded lazily on first use, so importing this module
 * never touches `pg`. A drizzle db may be injected directly (tests / shared
 * connection); otherwise a connection string builds one on demand.
 */
export class DbJobQueue implements JobQueue {
  private readonly connectionString?: string;
  private pool?: PgPool;
  private injected?: Db;
  private db?: NodePgDatabase;
  private initialized?: Promise<void>;

  constructor(source: string | Db) {
    if (typeof source === "string") this.connectionString = source;
    else this.injected = source;
  }

  private async database(): Promise<Db> {
    if (this.injected) return this.injected;
    if (!this.initialized) {
      this.initialized = (async () => {
        const { Pool } = await import("pg");
        const { drizzle } = await import("drizzle-orm/node-postgres");
        this.pool = new Pool({ connectionString: this.connectionString });
        this.db = drizzle(this.pool);
      })();
    }
    await this.initialized;
    return this.db! as unknown as Db;
  }

  async enqueue(job: NewJob): Promise<string> {
    return insertJob(await this.database(), { ...job, id: nextJobId() });
  }
  async claim(): Promise<Job | null> {
    return claimJob(await this.database());
  }
  async complete(id: string, result: unknown): Promise<void> {
    await finishJob(await this.database(), id, "done", result);
  }
  async flag(id: string, result: unknown): Promise<void> {
    await finishJob(await this.database(), id, "flagged", result);
  }
  async fail(id: string, error: unknown): Promise<void> {
    await finishJob(await this.database(), id, "failed", {
      error: String((error as Error)?.message ?? error),
    });
  }
  async get(id: string): Promise<Job | null> {
    return getJob(await this.database(), id);
  }
}

/**
 * Build the JobQueue selected by the environment.
 *
 * - QUEUE=memory (default): InMemoryJobQueue — the local, zero-setup path.
 * - QUEUE=db: DbJobQueue over DATABASE_URL (required). Only this branch ever
 *   constructs the pg-backed queue, which dynamically imports `pg`.
 *
 * A single process-wide InMemoryJobQueue is reused so the local dev worker tick
 * (run from the polling route) sees the jobs the apply route enqueued.
 */
let sharedMemoryQueue: InMemoryJobQueue | undefined;

export function createJobQueue(): JobQueue {
  const kind = process.env.QUEUE ?? "memory";
  if (kind === "db") {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("QUEUE=db requires DATABASE_URL to be set (e.g. postgres://user:pass@host:5432/db).");
    }
    return new DbJobQueue(url);
  }
  if (kind !== "memory") {
    throw new Error(`Unknown QUEUE="${kind}" (expected "memory" or "db").`);
  }
  if (!sharedMemoryQueue) sharedMemoryQueue = new InMemoryJobQueue();
  return sharedMemoryQueue;
}
