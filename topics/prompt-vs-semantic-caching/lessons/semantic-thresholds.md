# Prompt vs. semantic caching — thresholds, false positives & the tradeoff

## Semantic thresholds and false positives

A semantic cache embeds each request and returns a stored response when the embedding similarity
clears a **threshold**. That single knob controls both how much you save and how often you are wrong:

- **Too permissive (threshold too low):** loosely related requests match, so the cache serves a stored
  answer to a genuinely different question — a **false-positive hit**, i.e. a wrong response shipped
  with full confidence.
- **Too strict (threshold too high):** almost nothing matches, the hit rate collapses, and you lose
  the savings the cache was supposed to buy.

Unlike a prefix cache — which can only ever reuse work for *identical* leading tokens and so is
correctness-safe — a semantic cache trades on *approximate* matches, so its errors are silent and land
in the user's answer.

## The savings-vs-correctness tradeoff

Semantic caching saves the **full generation**, which is the biggest possible win — and precisely why
it carries the biggest risk. Deciding where to use it is a **savings-vs-correctness** judgment:

- **Safe:** repeated, stable, low-personalization queries — FAQ-style questions whose answer is the
  same for everyone and rarely changes.
- **Risky:** high-stakes or highly **personalized** answers, where a near-miss match returns a
  plausible-but-wrong response tailored to the wrong context.

Practical safeguards make the tradeoff manageable:

- A **conservative threshold** plus a lightweight **verification** step before trusting a hit.
- **Per-tenant / per-user cache keys** so one user's cached answer can never be served to another.
- A **TTL** (time-to-live) on entries to bound how **stale** a cached response can get.
