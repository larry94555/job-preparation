/**
 * The single persistence interface behind which both the file store (local,
 * zero-dependency) and the Postgres store (hosted) live. The runner and future
 * hosted app talk only to this interface.
 */
export interface ProgressStore {
  /** Fetch a user's progress for one topic, or null if none saved. */
  get(userId: string, topicId: string): Promise<unknown | null>;
  /** Persist a user's progress for one topic (upsert). */
  set(userId: string, topicId: string, data: unknown): Promise<void>;
  /** List all saved topic progress for a user. */
  list(userId: string): Promise<{ topicId: string; data: unknown }[]>;
}
