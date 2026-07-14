import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

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
  // Auth.js adapter columns (magic-link sign-in). `id` stays the lowercased
  // email — the stable key `lesson_progress` is scoped by — so auth identity and
  // progress identity are the same value (see the DrizzleAdapter `createUser`
  // override in web/auth.ts and `ensureUser` below).
  name: text("name"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  premium: boolean("premium").notNull().default(false),
});

/**
 * Auth.js (Drizzle adapter) tables. Sessions are JWT (`strategy: "jwt"`), so the
 * `sessions` table stays empty in practice; `accounts` is written for OAuth
 * sign-ins, and `verification_token` backs the email magic-link flow. They are
 * defined here so drizzle-kit creates them and the adapter can reference them.
 */
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  }),
);

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
 * Voluntary "pay what you can" donations, recorded by the Stripe webhook on a
 * completed Checkout Session. No card data is stored — only Stripe's session id
 * (also the primary key, so a re-delivered webhook is idempotent), the amount,
 * currency, and the payer's email if Stripe captured one.
 */
export const donations = pgTable("donations", {
  id: text("id").primaryKey(), // Stripe Checkout Session id
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
