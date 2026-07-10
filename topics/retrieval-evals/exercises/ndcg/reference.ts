export function ndcgAtK(gains: number[], k: number): number {
  const dcg = (g: number[]): number => {
    let sum = 0;
    const lim = Math.min(k, g.length);
    for (let i = 0; i < lim; i++) sum += g[i] / Math.log2(i + 2);
    return sum;
  };
  const idcg = dcg([...gains].sort((a, b) => b - a));
  if (idcg === 0) return 0;
  return dcg(gains) / idcg;
}
