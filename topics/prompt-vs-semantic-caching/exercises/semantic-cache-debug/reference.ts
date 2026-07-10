// Reference fix — the hit test was inverted. A hit is served only when the
// best cosine similarity is AT LEAST the threshold (>=), so near-duplicates
// match and dissimilar entries miss. (Kept out of the repo's starter; used
// only to sandbox-verify the exercise.)
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
    // Serve a hit only when the best candidate is at least as similar as the
    // threshold requires.
    return bestScore >= this.threshold ? best.value : null;
  }
}
