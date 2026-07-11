/**
 * DEBUGGING EXERCISE — this semantic cache is BROKEN.
 *
 * Symptom reported in production: the cache serves UNRELATED answers. A query
 * that is nothing like anything stored comes back as a "hit" with a stored
 * value, while a near-duplicate of a stored key is reported as a MISS. Users
 * see confident answers to questions they never asked, and repeat questions
 * that should be cached keep calling the model.
 *
 * The cache stores entries with put(vec, value) and looks them up with
 * get(vec): it should return a stored value only when the cosine similarity
 * between the query and a stored key is at least `threshold`, picking the
 * best-scoring candidate.
 *
 * There is exactly ONE bug in the hit test. Find it and fix it so that:
 *   - a near-identical vector HITS (similarity >= threshold),
 *   - an orthogonal / dissimilar vector MISSES,
 *   - the best-scoring candidate wins.
 *
 * Do NOT rewrite the class — make the minimal correct fix.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

interface Entry {
  vec: number[];
  value: string;
}

export class SemanticCache {
  private threshold: number;
  private entries: Entry[] = [];

  constructor(threshold: number) {
    this.threshold = threshold;
  }

  put(vec: number[], value: string): void {
    this.entries.push({ vec, value });
  }

  get(vec: number[]): string | null {
    let best: Entry | null = null;
    let bestScore = -Infinity;
    for (const entry of this.entries) {
      const score = cosineSimilarity(vec, entry.vec);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    if (best === null) return null;
    // BUG: the hit test is inverted — this serves an entry when the best score
    // is at or below the threshold, so DISSIMILAR entries match and truly
    // similar ones are rejected.
    return bestScore <= this.threshold ? best.value : null;
  }
}
