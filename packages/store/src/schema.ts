import { jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

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
