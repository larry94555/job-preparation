# Reading list & staying current — model-routing-fallback

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **FrugalGPT — Chen et al. (Stanford, 2023).** The origin of the LLM *cascade*: call a cheap model first,
  escalate to a stronger one only when needed to cut cost. Notice the quality gate is the whole design —
  it decides *when* to escalate, and tuning it trades cost against quality on held-out traffic.
- **RouteLLM — LMSYS (2024).** Learned, difficulty-based *routing*: predict how hard a request is and send
  it to the cheapest capable model. Notice this reframes routing as a prediction problem, and that its hard
  part — accurate difficulty prediction — is exactly the open frontier.

## Go deeper (routing as a decision, resilience as a system)
- **Routing vs. fallback as distinct decisions.** Routing picks the cheapest *capable* model up front;
  fallback reroutes when the chosen provider *fails*. Notice they answer different questions (cost/quality
  vs. availability) and are often conflated — keep them separate when you reason about a design.
- **Circuit breakers + backoff-with-jitter.** The resilience core: a breaker stops hammering a failing
  provider (skip it while open), and jittered backoff prevents synchronized retry storms. Notice the
  failure mode each one targets — the breaker is for sustained outages, backoff is for transient blips.
- **Hedged requests.** Fire a second request to another provider when the first is slow, take the first to
  answer. Notice this buys *tail-latency* insurance at the cost of extra spend — it is not a fix for outages.

## Frontier — what to watch
- **Accurate difficulty prediction.** The load-bearing unknown for routing: misjudge difficulty and you
  either overpay (route easy work to the strong model) or degrade quality (route hard work to the weak one).
- **Quality-preserving routing & consistency under model swaps.** The open problem is routing that does not
  silently change answer quality — and keeping outputs consistent when the underlying models are swapped.
  Watch for eval-gated claims, not "cheaper with no quality loss" assertions.

## Tools & implementations worth reading
- **LiteLLM / OpenRouter / gateway proxies.** The multi-model routing layer in practice — one interface over
  many providers, with fallback chains and per-provider config. Reading a gateway's fallback and breaker
  logic is the fastest way to turn the cascade idea into a mental model of real code.
- **Local + frontier model mixes.** The common production shape: a cheap local model fronting a frontier API.
  Notice this is FrugalGPT's cascade made concrete, and where the quality gate earns its keep.

## How to stay current on this topic
- Track **LMSYS** work (RouteLLM and successors) for the state of learned routing and difficulty prediction.
- Follow the **LiteLLM / OpenRouter** repos and release notes — routing, fallback, and breaker features land
  in gateway code first.
- When a new routing or fallback technique appears, ask the three canon questions: *what does it trade
  (cost/quality/latency), what regime does it win in, and what eval proves it?* — the same lens the deep-dive
  lesson uses. Be especially wary of silent model substitution dressed up as a free win.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
