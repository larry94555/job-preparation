/**
 * Compaction / summarize-overflow fit under a token budget.
 *
 * You are assembling context. Each item is `{ text, tokens, pinned }`. Some items
 * are `pinned` (a stable prefix / must-keep detail) and MUST always survive, even
 * if the pinned items alone already exceed `budget`. The rest are droppable overflow.
 *
 * Rules:
 *   - ALWAYS keep every `pinned` item, in original order.
 *   - Then walk the items in original order and add each non-pinned item only if the
 *     running total of kept tokens stays `<= budget`.
 *   - If a non-pinned item does not fit, SKIP it (do not stop) — a smaller later item
 *     may still fit.
 *   - Return the kept items in ORIGINAL order.
 */
export interface Item {
  text: string;
  tokens: number;
  pinned: boolean;
}

export function compactToFit(items: Item[], budget: number): Item[] {
  throw new Error("not implemented");
}
