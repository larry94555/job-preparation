# Caching — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
prompt-vs-semantic caching from someone who *runs* it at the frontier: where the research edge actually
is, and the operational signals you watch once it's live.

## The prompt-vs-semantic-caching frontier

Start from the split the whole topic turns on: one cache is **lossless**, the other is **risky**, and the
frontier lives almost entirely on the risky side.

- **Prefix/prompt caching is lossless — so its frontier is small.** A provider prefix cache (Anthropic,
  OpenAI) reuses prefill for byte-identical leading tokens, so a hit returns the *same* computation it
  would have produced anyway. The only failure mode is a **miss**, never a wrong answer. There is real
  engineering here — prefix minimums, cache-write vs. cache-read pricing, and cache **lifetimes** (a
  short default TTL on the provider's stored prefix) — but nothing here can *corrupt* a result. That is
  why the frontier attention is elsewhere.

- **Semantic caching is where correctness is at stake.** **GPTCache** (Zilliz, 2023) established the
  pattern: embed the request, and if a stored entry is similar enough, return its response instead of
  calling the model. This skips the *whole* generation — the bigger saving — but every hit is an
  *approximate* match, so a loose threshold serves a stored answer to a genuinely different question: a
  **false-positive hit**, i.e. a confident wrong answer. The frontier is the work to make that safe.

- **Cache-correctness as a measured quantity.** The load-bearing frontier idea is to stop *assuming* a
  hit was right and start **measuring** it: run a cache-correctness eval over a realistic query mix that
  answers "how often was a served hit actually the right response?" and gate any threshold change behind
  it. A false-positive semantic hit is a **silent regression** — invisible until a user complains — so
  the discipline is to treat cache correctness like any other eval: a gate, not a vibe. A spot check on a
  handful of prompts is exactly where the wrong-but-close matches slip through.

- **Invalidation beyond TTL.** A **TTL** is the crude lever — expiry just turns a hit into a miss — but
  "how long is this answer still true?" is a per-query property, not one global constant. The open
  problem is invalidation that keys on **meaning changing** rather than time passing: **embedding drift**
  (the embedding model or index shifts under stored entries), content that changed under a *still-similar*
  query, and provider prefix-cache lifetimes you don't control. Crude time-based expiry does not solve
  any of these, which is why the layered "exact prefix in front of a guarded semantic layer" shape
  endures — the semantic layer is the one that still needs scoping and verification.

The reason to track this line: both open problems attack the *same* weakness — a semantic hit can be
wrong and you won't know — from two angles: **measure the wrongness** (cache-correctness eval) and
**shorten the window it can persist** (invalidation beyond TTL). An expert can say which one a given
workload needs first.

## Operating caching in production

When it's live, you don't watch "the cache" — you watch a handful of signals that tell you whether each
layer is paying off and whether the risky layer is quietly serving wrong answers.

- **Cache hit rate, broken out by type.** Never one blended number. **Prefix hit rate** tells you whether
  prompt structure is actually stable (a near-zero prefix rate on a shared system prompt means per-request
  variability leaked to the top). **Semantic hit rate** tells you how much whole-generation saving you're
  capturing — and it moves with the threshold, so it only means something *next to* the false-hit rate.
- **False-hit / incorrect-serve rate.** The signal that only the semantic layer has, and the one that
  matters most: the fraction of served semantic hits that were actually *wrong* for the request. This is
  the output of the cache-correctness eval turned into a live metric; it is the number that a loosened
  threshold silently inflates, and the one a demo will never show you.
- **Staleness / TTL-miss rate.** How often served content was out of date, and how often a TTL expiry
  turned a would-be hit into a miss. A high TTL-miss rate says your expiry is too aggressive (you're
  paying for regeneration you didn't need); rising staleness complaints at a long TTL say the opposite —
  the answers are going out of date faster than expiry bounds them.
- **Cost / latency saved (net of the cache's own overhead).** The reason the layer exists, and it must be
  **net**: subtract the embedding + vector-search cost the semantic layer adds on every request (hit or
  miss) from the generation it saves. A low-hit-rate semantic cache can cost more than it saves once you
  count the per-request embed-and-search tax.

The operational discipline: **alert on false-hit / incorrect-serve rate** (a rising number there is a
correctness incident, not a cost one), **watch hit rate by type** to know which layer is working, and
**report savings net** of the cache's own overhead — never the gross number a hit-rate dashboard shows.
