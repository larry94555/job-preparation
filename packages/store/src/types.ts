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
  /**
   * Atomically read-modify-write a user's progress for one topic. `mutator`
   * receives the CURRENT stored value (or null) and returns the next value; the
   * store guarantees no concurrent writer for the same (userId, topicId) runs
   * between the read and the write, so mergeable accumulations (seen/correct
   * checks, review schedules, snapshots) can't be lost to a racing update.
   *
   * The concurrency guarantee is per-store: the Postgres store serializes with a
   * `SELECT … FOR UPDATE` row lock (safe across app instances / nodes); the file
   * store serializes with an in-process lock (safe on its single node). Returns
   * the value written.
   */
  update(
    userId: string,
    topicId: string,
    mutator: (prev: unknown | null) => unknown,
  ): Promise<unknown>;
}
