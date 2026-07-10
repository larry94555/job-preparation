/**
 * A semantic cache keyed by embedding vectors.
 *
 * TODO:
 *   - store entries as { embedding, value, storedAt } on set()
 *   - on get(), compute COSINE similarity to every NON-expired entry
 *     (an entry is expired when now - storedAt > ttlMs),
 *     take the most similar, and return its value only if similarity >= threshold; else null.
 */
export class SemanticCache {
  constructor(threshold: number, ttlMs: number) {
    throw new Error("not implemented");
  }

  set(embedding: number[], value: string, now: number): void {
    throw new Error("not implemented");
  }

  get(embedding: number[], now: number): string | null {
    throw new Error("not implemented");
  }
}
