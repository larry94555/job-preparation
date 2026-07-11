// Reference fix — the correction is to count rank from 1 and divide by (k + rank),
// i.e. 1/(k + rank) instead of 1/rank. This restores the k damping and removes the
// divide-by-zero on the top-ranked item. (Kept out of the repo's starter; used only
// to sandbox-verify the exercise.)
export function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  const scores = new Map<string, number>();

  for (const list of rankings) {
    for (let i = 0; i < list.length; i++) {
      const id = list[i];
      const rank = i + 1; // 1-based rank
      const contribution = 1 / (k + rank);
      scores.set(id, (scores.get(id) ?? 0) + contribution);
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}
