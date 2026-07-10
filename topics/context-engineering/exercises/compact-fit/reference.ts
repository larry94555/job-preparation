export interface Item {
  text: string;
  tokens: number;
  pinned: boolean;
}

export function compactToFit(items: Item[], budget: number): Item[] {
  // Pinned items are always kept, even if they alone exceed the budget.
  let total = items.reduce((a, it) => (it.pinned ? a + it.tokens : a), 0);
  const keep = new Set<Item>(items.filter((it) => it.pinned));
  for (const it of items) {
    if (it.pinned) continue;
    if (total + it.tokens <= budget) {
      keep.add(it);
      total += it.tokens;
    }
    // else: skip this one but keep scanning — a smaller later item may still fit.
  }
  // Return kept items in original order.
  return items.filter((it) => keep.has(it));
}
