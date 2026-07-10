# Reading list & staying current — speculative-decoding-quant-distillation

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Speculative decoding — Leviathan et al. (Google) and Chen et al. (DeepMind), 2023.** The two papers
  that established draft → verify → accept. Notice the *lossless* guarantee: a cheap drafter proposes
  tokens, the target model verifies them in one pass, and the accepted prefix is exactly what the target
  would have produced alone. This is the single most important read for the topic.
- **Knowledge distillation — Hinton et al. (2015).** The teacher → student idea underneath the "smaller
  model" lever. Notice it is a *lossy*, train-time transfer aimed at a cheaper deployable model — a
  different goal (size) from speculative decoding's latency win.

## Go deeper (mechanism & the three levers)
- **Self-speculative heads: Medusa — Cai et al. (2024).** Folds the drafter *into* the target as extra
  prediction heads, removing the separate draft model. Notice how this reframes "where does the draft come
  from" — no second model to serve.
- **EAGLE (self-speculative).** Another self-speculative approach that predicts future tokens from the
  target's own features. Notice the shared theme with Medusa: the drafter is part of the target, not a
  standalone model, which changes the acceptance-vs-cost math.

## Frontier — what to watch
- **High acceptance across domains.** Speedup is acceptance-bound, and acceptance is domain-dependent.
  Watch for drafters/heads that hold acceptance up on code, reasoning, and long tail — not just the easy
  cases. This is the open problem that decides whether speculative decoding pays off in a given workload.
- **Combining levers without quality loss (distill → quantize → speculate).** The frontier is stacking the
  three levers — smaller (distill), cheaper memory (quantize), faster (speculate) — without compounding
  degradation. Watch for eval-gated stacking, where each lossy stage is proven behind a task eval, not
  blanket claims.

## Tools & implementations worth reading
- **vLLM / TensorRT-LLM speculative support, plus Medusa/EAGLE implementations** — the serving stacks and
  reference code that turn the papers into deployed decoding loops. Reading a real draft/verify loop is the
  fastest way to internalize what "acceptance rate" costs and buys.

## How to stay current on this topic
- Follow the **vLLM / TensorRT-LLM** repos and release notes, plus the **Medusa / EAGLE** implementations —
  speculative and self-speculative features land in code first.
- When a new inference-optimization technique appears, ask the three canon questions: *which lever is it
  (latency / memory-cost / size), is it lossless or lossy, and what eval proves it doesn't cost quality?* —
  the same lens the deep-dive and when-wrong lessons use.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **Speculative decoding got adopted as a lossless default.** The Leviathan (Google) and Chen (DeepMind)
  draft-verify approach moved from 2022–23 research to native, production-ready support in vLLM,
  TensorRT-LLM, and SGLang. The *lossless* guarantee held up under scrutiny — it is still correctly
  described as producing exactly the target model's distribution — so the canon's "name which lever is
  lossless" framing aged perfectly.
- **Self-speculative heads won the "where does the draft come from" argument.** Medusa (Cai et al., 2024)
  and especially the EAGLE line (EAGLE-2/EAGLE-3) became the strong default, pushing acceptance rates toward
  ~80% and removing the need to serve a separate draft model. The canon's Medusa/EAGLE framing (drafter
  folded into the target) aged well.
- **Acceptance rate proved to be the real, durable bottleneck.** The frontier bullet — speedup is
  acceptance-bound and domain-dependent — is exactly where the field concentrated: a stream of 2025–2026
  work (margin-aware verification, acceptance-rate-optimized losses, randomized drafting) targets holding
  acceptance up on code/reasoning/long-tail. This aged as the *central* problem, not a footnote.
- **The lossless-vs-lossy line is the live debate.** A notable shift the canon didn't call: newer work
  deliberately relaxes exact-match verification for negligible-quality lossy speculation to cut latency
  further in low-margin regimes. So "which levers are lossless" is now a spectrum, not a binary — worth
  flagging in interviews.
- **Distillation's data-vs-logits debate stayed unsettled.** Hinton et al. (2015) soft-target distillation
  remains the reference, but whether to transfer via logits/features vs. synthetic data is still contested
  — validating the canon's "distillation is a lossy, train-time size lever" caution and its red flag against
  distilling for volatile facts.
