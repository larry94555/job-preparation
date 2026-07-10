# Reading list & staying current — prompt-vs-semantic-caching

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Provider prompt/prefix caching (Anthropic, OpenAI).** The exact-leading-token cache: identical prefix
  tokens skip prefill and are billed cheaper. Notice it is *lossless* — a hit returns the same computation,
  so the only failure mode is a miss, not a wrong answer. This is the safe baseline every design starts from.
- **GPTCache — Zilliz (2023).** The origin of semantic caching for LLMs: embed the request, and if a stored
  entry is similar enough, return its response instead of calling the model. Notice this saves the *whole*
  generation, not just prefill — the bigger saving that carries the bigger risk.

## Go deeper (mechanism & risk)
- **Prefix-hit mechanics.** A prefix cache hits only on identical *leading* tokens, so per-request variability
  at the top (timestamps, user IDs, reordered system content) collapses the hit rate. Notice the fix is
  structural: stable prefix, variable suffix — reordering that breaks prefix hits is a named red flag.
- **Similarity thresholds & the false-positive hit.** Semantic caching turns on a cosine-similarity gate.
  Notice the operating point is a tradeoff: too low and you serve an answer to a *different* question (a
  false-positive hit); too high and you lose the savings. Pick it with an eval, not a guess.
- **TTL & staleness.** Semantic (and provider prefix) caches serve stored content that can go stale. Notice
  TTL is the crude lever — expiry turns a hit into a miss — and that "how long is this answer still true?"
  is a per-query property, not a global constant.
- **Layered caching with safety.** The SOTA shape: an exact-prefix cache in front of an embedding-similarity
  semantic cache, with guards. Notice each layer catches a different reuse pattern, and the semantic layer
  needs verification and scoping the prefix layer does not.

## Frontier — what to watch
- **Eval of cache correctness.** Measuring how often a "hit" was actually the right answer, as a tracked
  quantity rather than an assumption. Watch for cache-correctness treated like any other eval — a gate,
  not a vibe — because a false-positive semantic hit is a silent regression.
- **Invalidation for semantic caches beyond TTL.** The open problem past crude expiry: embedding drift,
  content that changed under a still-similar query, and provider prefix-cache lifetimes. Watch for
  invalidation that keys on *meaning changing*, not just on time passing.
- **Safe similarity thresholds.** Still open: how to set (or adapt) the threshold so savings rise without
  false hits. Watch for per-domain or high-stakes-aware thresholds rather than one global number.

## Tools & implementations worth reading
- **GPTCache + Redis / vector stores** — the reference semantic layer. Reading how it embeds, stores, and
  gates on similarity is the fastest way to turn the idea into a mental model of real code.
- **Provider prefix caching (Anthropic, OpenAI)** — the exact-leading-token layer. Reading the cache-write
  vs. cache-read pricing and the prefix rules shows why prompt *structure* is the lever that makes it pay off.

## How to stay current on this topic
- Track the **provider caching docs (Anthropic, OpenAI)** — prefix rules, minimums, and lifetimes change and
  land in the docs first; they set what the exact layer can do.
- Follow **GPTCache and the vector-store ecosystem** for the semantic layer — thresholds, backends, and
  invalidation are where the moving parts are.
- When a new caching idea appears, ask the three canon questions: *what does it trade (savings vs. a wrong
  hit), what regime does it win in (low- vs. high-stakes), and what eval proves the hits were right?*
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items — measured cache
  correctness and invalidation beyond TTL — are your next reads.
