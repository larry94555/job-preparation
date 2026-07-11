/**
 * KV admission with LRU eviction under memory pressure.
 *
 * A paged KV pool has `capacity` blocks. `live` are the sequences currently
 * holding blocks, each with a `lastUsed` timestamp. A new request needs `need`
 * blocks. Decide whether to admit it, evicting least-recently-used sequences to
 * make room only if necessary.
 *
 * Rules:
 *   - If `need > capacity`, it can never fit → { admit: false, evict: [] }.
 *   - If there is already enough free room (capacity - used >= need), admit with
 *     no eviction → { admit: true, evict: [] }.
 *   - Otherwise evict sequences **least-recently-used first** (smallest lastUsed)
 *     until enough is free, and return the evicted ids in the order evicted.
 *     Stop as soon as there is room (evict the minimum necessary).
 */
export interface Seq {
  id: string;
  blocks: number;
  lastUsed: number;
}

export function planAdmission(capacity: number, live: Seq[], need: number): { admit: boolean; evict: string[] } {
  throw new Error("not implemented");
}
