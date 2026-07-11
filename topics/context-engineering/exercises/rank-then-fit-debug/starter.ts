/**
 * DEBUGGING EXERCISE — this context selector is BROKEN.
 *
 * Symptom reported in production: the assembled context occasionally exceeds the
 * token budget by one item, overflowing the model's window and getting the tail
 * of the prompt silently truncated by the API. It only misbehaves when a
 * high-scoring item is nearly as large as the remaining budget.
 *
 * `rankThenFit` is supposed to select items in descending score order, keeping
 * each only if it still fits, and the total tokens of the returned items must
 * NEVER exceed `budget`.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - the total tokens of the returned items never exceed `budget`,
 *   - an item is admitted only when it genuinely still fits,
 *   - a too-big item is skipped (not a hard stop) so a smaller later item can
 *     still be admitted,
 *   - items are considered in descending score order.
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
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
    // BUG: the item is admitted and its tokens added to the running total
    // BEFORE checking whether it fits, so the last accepted item can push the
    // total past `budget` (an off-by-one-item overflow).
    chosen.push(item);
    running += item.tokens;
    if (running > budget) {
      // too late — the overflowing item is already in `chosen`.
    }
  }
  return chosen;
}
