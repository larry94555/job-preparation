function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function layeredGet(
  key: string,
  vec: number[],
  exact: Map<string, string>,
  semantic: { vec: number[]; value: string }[],
  threshold: number,
): { value: string; source: "exact" | "semantic" } | null {
  // Lossless path wins: an exact hit short-circuits before the semantic layer.
  const hit = exact.get(key);
  if (hit !== undefined) return { value: hit, source: "exact" };

  // Guarded semantic path: best cosine match, gated by threshold.
  let best: { value: string; sim: number } | null = null;
  for (const entry of semantic) {
    const sim = cosine(vec, entry.vec);
    if (best === null || sim > best.sim) best = { value: entry.value, sim };
  }
  if (best !== null && best.sim >= threshold) {
    return { value: best.value, source: "semantic" };
  }
  return null;
}
