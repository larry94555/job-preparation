// Reference fix — check that the item fits BEFORE admitting it, and `continue`
// (skip) rather than stop so a smaller lower-score item later can still fit.
// (Kept out of the repo's starter; used only to sandbox-verify the exercise.)
export interface RankItem {
  text: string;
  score: number;
  tokens: number;
}

export function rankThenFit(items: RankItem[], budget: number): RankItem[] {
  const ranked = [...items].sort((a, b) => b.score - a.score);
  const chosen: RankItem[] = [];
  let running = 0;
  for (const item of ranked) {
    // Only admit the item when it genuinely still fits; otherwise skip it and
    // keep going so a smaller later item can still be admitted.
    if (running + item.tokens <= budget) {
      chosen.push(item);
      running += item.tokens;
    }
  }
  return chosen;
}
