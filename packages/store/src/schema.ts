import { integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Drizzle Postgres schema for the hosted store. A trimmed Phase-1 slice of the
 * full data model in DESIGN.md §11 — just enough to persist per-user, per-topic
 * lesson progress behind the ProgressStore interface. Later phases extend this
 * (sessions, attempts, grading_jobs, section_mastery, review_schedule, …).
 */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  role: text("role").notNull().default("user"),
});

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id").notNull(),
    topicId: text("topic_id").notNull(),
    data: jsonb("data"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.topicId] }),
  }),
);

/**
 * Content projection (Phase 2a): the git-tracked `topics/` configs projected
 * into read-only rows so the hosted app can read content from the DB while the
 * content still lives, diffable and eval-gated, in git.
 *
 * This is a pragmatic JSONB slice — the whole serialized `LoadedTopic` is stored
 * in `data`, keyed by topic id and fingerprinted by `contentHash` so the importer
 * can upsert idempotently (skip rows whose content is unchanged). Full
 * normalization into `topics` / `sections` / `lessons` / `questions` tables
 * (DESIGN.md §11) is a later refinement.
 */
export const contentTopics = pgTable("content_topics", {
  id: text("id").primaryKey(),
  contentHash: text("content_hash").notNull(),
  data: jsonb("data").notNull(),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
});

/**
 * Async grading queue (DESIGN §8 + §11 `grading_jobs`). Open-ended grading
 * (essay/code) is enqueued rather than run inline — the single-slot model can't
 * grade synchronously in a multi-user app. A worker pool claims `queued` jobs,
 * grades them (with confidence escalation), and moves them to a terminal state
 * (`done` | `flagged` for human review | `failed`). Deterministic MC/text checks
 * never touch this table.
 */
export const gradingJobs = pgTable("grading_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topicId: text("topic_id").notNull(),
  questionId: text("question_id").notNull(),
  kind: text("kind").notNull(), // "essay" | "code"
  payload: jsonb("payload").notNull(), // the submission + what the worker needs to grade
  status: text("status").notNull().default("queued"), // queued|running|done|flagged|failed
  result: jsonb("result"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
