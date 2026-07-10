# Building the retrieval metrics

## Recall precision and MRR precisely

Before you can trust a retrieval eval, you have to compute the metrics *exactly* — and the two
rank-agnostic ones differ only in their **denominator**, which is where most bugs hide.

Work a single example the whole way through. Let the **relevant** set be `{a, b, c}` and the ranked
**retrieved** list be `[x, a, y, b, z]`, with `k = 3`.

- **Top-k** is the first `k` retrieved items: `[x, a, y]`. The number of relevant items in the top-k
  (the "hits") is **1** (just `a`).
- **recall@k** = hits / **(total relevant)** = `1 / 3`. Recall asks *"of everything that mattered,
  how much did we surface in the top k?"* — so the denominator is the size of the relevant set.
- **precision@k** = hits / **k** = `1 / 3`. Precision asks *"of the k we showed, how many mattered?"*
  — so the denominator is `k`. Same numerator, different denominator: never share one variable for both.
- **MRR (Mean Reciprocal Rank)** looks only at the **first** relevant result. Here the first relevant
  item is `a` at 1-based rank `2`, so the reciprocal rank is `1 / 2`. Over many queries you average
  these; for one query it is just that reciprocal.

So for this example: recall@3 = 0.333…, precision@3 = 0.333…, MRR = 0.5.

## Edge cases and pitfalls

The formulas are easy; the edge cases are what separate a toy from a correct implementation.

- **No relevant items** (`relevant` is empty): recall's denominator is `0`. Do **not** divide by zero
  — return `0` (or define it as N/A) rather than `NaN`/crash.
- **No relevant item appears in `retrieved`**: MRR is `0` (there is no first relevant rank).
- **k larger than the retrieved list**: the top-k is simply the whole list; don't index past the end.
- **precision@k denominator**: the standard convention divides by `k` even when fewer than `k` items
  were retrieved. (Some teams divide by `min(k, retrieved.length)` — pick one and be consistent.)
- **Membership, not position, for hits**: recall/precision only care whether a relevant id is in the
  top-k, so use a `Set` for O(1) membership; MRR is the one that cares about **position**.

Get these right and the metric is trustworthy; get the denominator or the zero-guard wrong and every
downstream eval number is quietly off.
