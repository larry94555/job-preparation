# Topic Plans — Production LLM Engineering

Outlines for the testing topics. Each **Topic Plan** below is *not* the lesson itself — it is the
blueprint a complete lesson is built from: the major subtopics a full lesson must cover, plus an
**assessment blueprint** describing what each question mode should probe. Lessons (actual questions
+ eval skills + calibration) are authored later, one `topics/<slug>/` folder per topic, validated
by `npm run validate`.

## How to read a plan

Each topic has:

- **Slug** — the eventual `topics/<slug>/` folder id.
- **Scope** — what the topic is and why it matters in production.
- **Core subtopics** — the lesson outline; the concepts a complete lesson must teach.
- **Assessment blueprint** — angles to test per mode. These are *coverage targets*, not final
  question wording.

## Assessment mode → engine type mapping

| Plan mode | Engine `type` | Notes |
|---|---|---|
| Multiple choice | `multiple_choice` | Facts, distinctions, "which is true / false", best-choice tradeoffs |
| Missing term (cloze) | `text_input` | Fill the exact term/number; `equals` / `regex`, often parameterized |
| Free entry (short answer) | `text_input` | One-line precise answer; `regex` / normalized match |
| Essay | `essay` (`short` \| `long`) | Reasoning, tradeoffs, design; graded by an eval skill |
| Coding exercise | `code` | Implement / debug / harden; graded by tests + a concept eval skill |

## Authoring conventions (per lesson, target)

- **Difficulty spread:** ~30% foundational (1–2), ~50% applied (3), ~20% expert (4–5).
- **Suggested volume per lesson:** 8–12 MC, 4–6 missing-term, 4–6 free-entry, 3–5 essay
  (mix short/long), 1–3 coding. Adjust to the topic.
- **Tag every question** so the adaptive scheduler (Phase 4) can weight weak areas.
- **Every essay/coding question needs an eval skill + calibration set** (see `DESIGN.md` §7).

---

# 1. Harness engineering, not just prompt engineering

**Slug:** `harness-engineering`
**Scope:** The reliability of an LLM feature lives mostly in the *harness* — the code around the
model that owns tools, state, retries, verification, permissions, and control flow — not in the
prompt string. This topic establishes that boundary as the central mental model.

**Core subtopics:**
1. The model/harness boundary: what the model owns (reasoning, token/tool emission) vs. what the
   harness owns (tools, state, safety, verification, UX, persistence).
2. The agent loop: think → act → observe, with deadlines, duplicate-call guards, interrupts.
3. Determinism the harness enforces around a nondeterministic model (validation, retries, idempotency).
4. Verification as a harness responsibility (run tests / diff / checks, not "trust the model").
5. Why "just improve the prompt" plateaus, and which failures are structurally unfixable by prompting.
6. Harness-level observability, permission gates, and plan-then-execute orchestration.

**Assessment blueprint:**
- **Multiple choice:** classify a responsibility as model vs. harness; identify which failure a
  prompt tweak cannot fix; pick the correct loop-control mechanism for a scenario.
- **Missing term:** name the loop phases (think/act/observe); the term for repeated identical tool
  calls the harness should guard against; "____-then-execute" orchestration.
- **Free entry:** in one line, state the harness's job when a model returns invalid tool JSON.
- **Essay:** *short* — "A teammate says 'we just need better prompts.' Argue where that fails and
  what harness work is actually required." *long* — design the harness responsibilities for a
  code-editing agent (tools, verification, permissions, recovery).
- **Coding exercise:** implement a minimal `think→act→observe` loop with a max-step budget, a
  duplicate-tool-call guard, and an observation-truncation step; tests assert termination and guard
  behavior.

---

# 2. Loop engineering: designing the agent loop that finishes real tasks

**Slug:** `loop-engineering`
**Scope:** Getting an agent to reliably *finish* a real task is loop engineering — designing the
observe → decide → act → verify cycle, keeping it making measurable progress toward a goal, verifying
each step, recovering from failure, and bounding it. This is the discipline behind coding agents and
long-horizon autonomy. It builds on `harness-engineering` (the primitive loop and its guards) and goes
deeper on the loop as a system.

**Core subtopics:**
1. Anatomy of a loop: observe → decide → act → verify; the loop as the unit of design; loop vs.
   pipeline; loop state; termination as a first-class output (done / budget / no-progress).
2. Loop shapes and when to use each: single bounded loop (ReAct), plan-then-execute, reflect-and-retry
   (Reflexion), the edit → run → observe coding loop, tree/graph search; the most-constrained-shape rule.
3. Progress, convergence & recovery: measurable progress; no-progress and oscillation detection;
   step-verification gating; recovery (classify → retry / re-plan / escalate); context compaction.
4. Design review, frontier & operations: the five-lever review checklist; canon (ReAct, Reflexion,
   Tree of Thoughts, "Building Effective Agents"); long-horizon autonomy and open-ended verification;
   operating signals (steps/task, stop-reason distribution, no-progress rate, verification-failure rate).

**Assessment blueprint:**
- **Multiple choice:** distinguish loop vs. pipeline; identify which loop phase the model owns; pick the
  right shape for a scenario; read a stop-reason distribution.
- **Missing term / free entry:** name the loop phases and stop reasons; the term for a stuck loop
  (no-progress / oscillation); the signal that gates the next step (verification).
- **Essay (design review):** review a "loop until the model says done" design and name the fixes.
- **Essay (project / interview):** design the loop for a coding agent that fixes a failing test; mock
  interview on loop design.
- **Coding:** implement a bounded loop with no-progress detection (unchanged state), named termination,
  and correct precedence (done > no-progress > budget).

**Relationship to neighbors:** see also `harness-engineering` (primitive loop + guards),
`agentic-react-loop` (ReAct as one shape), `agent-guardrails-budgets` (bounding mechanics),
`agentic-tool-calling` (the tool-use loop), `production-failure-modes` (what goes wrong live).

---

# 3. Context engineering, not just long prompts

**Slug:** `context-engineering`
**Scope:** Getting the *right* tokens into a bounded window at the right time — selection,
ordering, compression, and eviction — rather than stuffing everything into one long prompt. Long
context is a budget to manage, not a dumping ground.

**Core subtopics:**
1. The context window as a scarce, ranked budget; token accounting per section.
2. Retrieval/selection: what to include, relevance ranking, recency vs. relevance.
3. Position effects: lost-in-the-middle, primacy/recency, instruction placement.
4. Compression: summarization, distillation, structured scratchpads, memory.
5. Context rot / dilution: how irrelevant tokens degrade accuracy and raise cost/latency.
6. Isolation and hygiene: keeping untrusted or cross-user content fenced (links to safety topics).

**Assessment blueprint:**
- **Multiple choice:** predict the effect of placing key instructions at the end vs. middle;
  choose what to evict first under budget pressure; identify "lost in the middle."
- **Missing term:** the phenomenon where mid-context facts are under-used ("lost in the ____");
  "context ____" for degradation by irrelevant tokens.
- **Free entry:** given a token budget and section sizes, state which section to compress first.
- **Essay:** *short* — "More context is not free." Explain the cost/latency/quality effects of
  padding a window. *long* — design a context-assembly policy for a long-running agent with tools,
  memory, and retrieved docs.
- **Coding exercise:** implement `assembleContext(sections, tokenBudget)` that ranks, includes to
  budget, and compresses/drops the lowest-priority sections; tests assert budget adherence and
  priority ordering.

---

# 4. Prompt caching vs. semantic caching tradeoffs

**Slug:** `prompt-vs-semantic-caching`
**Scope:** Two different caches often confused. **Prompt (prefix) caching** reuses computed
attention state for identical leading tokens; **semantic caching** returns a stored *response* for
a semantically similar *request*. Different hit conditions, correctness risks, and savings.

**Core subtopics:**
1. Prompt/prefix caching: exact-prefix reuse, cache-key = token prefix, TTL, provider mechanics.
2. Semantic caching: embed request → similarity threshold → return cached answer.
3. What each saves (prefill compute vs. a full generation) and where each hits/misses.
4. Correctness risk of semantic cache false positives; threshold tuning and staleness.
5. Structuring prompts to maximize prefix-cache hits (stable prefix, variable suffix).
6. Multi-tenant cache-safety pitfalls (links to isolation topic).

**Assessment blueprint:**
- **Multiple choice:** given a scenario, choose which cache applies; identify why reordering a
  prompt kills prefix-cache hits; pick the bigger correctness risk of semantic caching.
- **Missing term:** prefix caching requires an identical leading token ____; semantic caching
  compares embeddings against a similarity ____.
- **Free entry:** name the failure mode when a semantic cache returns a near-miss answer.
- **Essay:** *short* — compare savings and risks of the two caches for a support chatbot. *long* —
  design a layered caching strategy (prefix + semantic) with safety controls and invalidation.
- **Coding exercise:** implement a semantic cache with cosine-similarity lookup, a tunable
  threshold, and TTL; tests cover hit/miss/expiry and a false-positive guard.

---

# 5. KV cache management, eviction, reuse, and memory pressure at scale

**Slug:** `kv-cache-management`
**Scope:** The per-request key/value tensors dominate serving memory and cap concurrency. Managing
their allocation, reuse, and eviction is what lets a server hold many sequences without OOM or
fragmentation.

**Core subtopics:**
1. What the KV cache is; why size scales with (layers × heads × seq_len × batch × dtype).
2. Memory pressure: KV cache vs. weights vs. activations; the concurrency ceiling.
3. Fragmentation and the paged-attention block model (fixed-size blocks, block tables).
4. Reuse: shared prefixes across requests (prefix/prompt caching connection).
5. Eviction/preemption policies: recompute vs. swap-to-host, priority, and their latency costs.
6. Quantized KV cache and its quality/throughput tradeoffs.

**Assessment blueprint:**
- **Multiple choice:** identify which factor grows KV memory; choose the eviction policy for a
  latency-SLO scenario; recognize what paging solves.
- **Missing term:** paged attention stores KV in fixed-size ____; the table mapping logical to
  physical blocks is the block ____.
- **Free entry (parameterized):** estimate KV bytes given layers/heads/dim/seq/dtype (numeric).
- **Essay:** *short* — explain why long contexts throttle concurrency. *long* — design an eviction
  + swap policy for a mixed-SLO multi-tenant server and justify the tradeoffs.
- **Coding exercise:** implement a paged KV allocator with block table, allocate/free, and an
  eviction policy (LRU or priority); tests assert no fragmentation leak and correct eviction order.

---

# 6. Prefill vs. decode latency and why they optimize differently

**Slug:** `prefill-vs-decode-latency`
**Scope:** Inference has two phases with opposite performance profiles: **prefill** (process the
whole prompt, compute-bound, parallel over tokens) and **decode** (one token at a time,
memory-bandwidth-bound). They set TTFT vs. TPOT and demand different optimizations.

**Core subtopics:**
1. Prefill: parallel over prompt tokens, compute-bound, drives time-to-first-token (TTFT).
2. Decode: sequential, memory-bandwidth-bound, drives time-per-output-token (TPOT).
3. Why batching helps decode throughput but prefill saturates compute quickly.
4. Chunked prefill and prefill/decode disaggregation.
5. Metric mapping: TTFT, TPOT, end-to-end latency, and what users feel.
6. How prompt length, output length, and batch size move each phase.

**Assessment blueprint:**
- **Multiple choice:** label a phase compute- vs. memory-bound; predict which metric a longer
  prompt worsens; choose the optimization that helps decode but not prefill.
- **Missing term:** prefill drives ____-to-first-token; decode drives time-____-output-token.
- **Free entry:** name the phase that is memory-bandwidth-bound.
- **Essay:** *short* — why do prefill and decode call for different optimizations? *long* — a
  product needs low TTFT for chat and high throughput for batch summarization; design the serving
  configuration and justify per-phase choices.
- **Coding exercise:** implement a latency model `estimate(promptTokens, outputTokens, batch)` that
  returns TTFT/TPOT/total from given prefill/decode rates; tests check phase scaling behavior.

---

# 7. Continuous batching, paged attention, and throughput optimization

**Slug:** `batching-paged-attention-throughput`
**Scope:** The serving techniques that turn a GPU into a high-throughput multi-request engine:
continuous (in-flight) batching to keep the GPU full, and paged attention to pack KV memory.

**Core subtopics:**
1. Static vs. dynamic vs. continuous batching; head-of-line blocking from static batches.
2. Iteration-level scheduling: adding/removing sequences mid-flight.
3. Paged attention as the memory substrate that makes continuous batching practical.
4. Throughput vs. latency tension; how batch size trades TPOT for tokens/sec.
5. Fairness, starvation, and SLO-aware scheduling.
6. Metrics: tokens/sec, goodput, GPU utilization, queue depth.

**Assessment blueprint:**
- **Multiple choice:** identify the problem continuous batching solves over static; choose the
  effect of larger batches on latency vs. throughput; spot what enables mid-flight scheduling.
- **Missing term:** continuous batching schedules at the ____ level (per iteration); static
  batching suffers head-of-____ blocking.
- **Free entry:** name the metric distinguishing "useful" throughput under SLO from raw throughput.
- **Essay:** *short* — why does static batching waste GPU under variable output lengths? *long* —
  design an SLO-aware scheduler balancing latency-sensitive and batch traffic on one server.
- **Coding exercise:** simulate a continuous-batching scheduler over a stream of requests with
  varying output lengths; report utilization and p95 latency; tests compare against static batching.

---

# 8. Speculative decoding vs. quantization vs. distillation tradeoffs

**Slug:** `speculative-decoding-quant-distillation`
**Scope:** Three distinct levers to make inference faster/cheaper, often conflated. Speculative
decoding speeds *latency losslessly*; quantization shrinks *memory/compute* with quality risk;
distillation trains a *smaller model*. When to reach for which.

**Core subtopics:**
1. Speculative decoding: draft + verify, acceptance rate, lossless output, latency-only win.
2. Quantization: fewer bits for weights/activations/KV; memory & throughput win, quality risk.
3. Distillation: teacher→student training; smaller/cheaper model, upfront training cost.
4. What each changes vs. preserves (output distribution, model identity, hardware footprint).
5. Composition: quantize a distilled model and serve with speculative decoding.
6. Decision criteria: latency vs. cost vs. quality vs. engineering effort.

**Assessment blueprint:**
- **Multiple choice:** match a goal (cut latency without quality change / cut memory / cut cost
  permanently) to the right lever; identify which is lossless in output.
- **Missing term:** speculative decoding uses a small ____ model verified by the target; its speedup
  depends on the ____ rate.
- **Free entry:** name the only one of the three that changes which model you ship.
- **Essay:** *short* — contrast speculative decoding and quantization on the quality axis. *long* —
  pick a strategy (or stack) for a cost-constrained, latency-sensitive product and defend it.
- **Coding exercise:** implement a speculative-decoding acceptance simulation
  (draft tokens, accept/reject by match) and compute expected speedup vs. acceptance rate; tests
  verify the speedup curve.

---

# 9. INT8, INT4, FP8, AWQ, GPTQ, and when quantization hurts quality

**Slug:** `quantization-formats-quality`
**Scope:** The concrete quantization formats and methods, what they cost in quality, and the
failure signatures that tell you a model was quantized too aggressively.

**Core subtopics:**
1. Numeric formats: FP16/BF16 baseline, FP8, INT8, INT4; bits vs. range/precision.
2. Weight-only vs. weight+activation quantization; KV-cache quantization.
3. Methods: GPTQ (calibration, layerwise), AWQ (activation-aware), and how they differ.
4. Outliers/sensitive layers; why activations are harder than weights.
5. Quality-loss signatures: degraded reasoning, long-context drift, format-following breakdown.
6. Choosing a format for a hardware/quality/throughput target; measuring loss with evals.
7. Perplexity vs. task evals as quality proxies (and their blind spots).

**Assessment blueprint:**
- **Multiple choice:** order formats by memory footprint; identify AWQ's key idea vs. GPTQ; pick
  which component is riskier to quantize (activations vs. weights).
- **Missing term:** ____-aware weight quantization (AWQ) protects salient weights; GPTQ relies on a
  ____ set to minimize layerwise error.
- **Free entry:** name a task class where INT4 quality loss shows up first.
- **Essay:** *short* — why can perplexity look fine while task quality drops? *long* — design an
  evaluation plan to decide whether a given INT4/AWQ build is production-safe.
- **Coding exercise:** implement per-tensor and per-channel int8 quantize/dequantize with
  scale/zero-point and report reconstruction error; tests check clamping, symmetric vs. asymmetric,
  and per-channel improvement.

---

# 10. Structured output failures, schema validation, repair loops, and fallback chains

**Slug:** `structured-output-reliability`
**Scope:** Making models emit valid, schema-conformant data reliably — and recovering when they
don't — via validation, targeted repair, and layered fallbacks.

**Core subtopics:**
1. Failure taxonomy: malformed JSON, wrong types, missing/extra fields, hallucinated enums, truncation.
2. Prevention: constrained decoding / grammar / `response_format`, and its limits.
3. Validation: schema (e.g. JSON Schema/Zod) as the contract; parse-then-validate.
4. Repair loops: feed the validator error back for a bounded number of retries.
5. Fallback chains: stricter decode → repair → simpler schema → deterministic default → human.
6. Idempotency and bounding: cost/latency of repair, when to give up.

**Assessment blueprint:**
- **Multiple choice:** pick the right first response to a validation failure; identify what
  constrained decoding cannot guarantee (e.g. semantic correctness); choose a safe fallback order.
- **Missing term:** a bounded retry that returns the error to the model is a ____ loop; the schema is
  the output ____.
- **Free entry:** name one failure constrained decoding still allows.
- **Essay:** *short* — why validate even when using constrained decoding? *long* — design a
  full reliability chain (prevent → validate → repair → fallback) with budgets and observability.
- **Coding exercise:** implement `getStructured(callModel, schema, maxRepairs)` that validates,
  repairs with error feedback up to a bound, then falls back; tests cover valid, repairable, and
  unrepairable inputs and assert the repair cap.

---

# 11. Function calling reliability, tool contracts, argument validation, and idempotency

**Slug:** `function-calling-reliability`
**Scope:** Treating tools as APIs with contracts: validated arguments, well-typed schemas, and
idempotent execution so a retried or hallucinated call can't corrupt state.

**Core subtopics:**
1. Tool contracts: name, typed args schema, description, side-effect classification.
2. Argument validation and coercion before execution; rejecting hallucinated args/tools.
3. Idempotency: keys, safe-retry semantics, exactly-once effects for mutating tools.
4. Hallucinated tool calls and nonexistent-tool handling.
5. Error surfaces the model can act on vs. errors the harness must absorb.
6. Read vs. write tools, permissioning, and confirmation gates (links to safety/guardrails).

**Assessment blueprint:**
- **Multiple choice:** identify which tools need idempotency keys; choose correct handling of an
  unknown tool name; pick the safe response to invalid arguments.
- **Missing term:** a mutating tool should be safe to retry, i.e. ____; the machine-readable arg
  spec is the tool ____.
- **Free entry:** name what the harness should do with a call to a tool that doesn't exist.
- **Essay:** *short* — why is idempotency essential once tools have side effects? *long* — design a
  tool-execution layer with validation, idempotency, permissioning, and model-facing error design.
- **Coding exercise:** implement a tool dispatcher that validates args against a schema, enforces an
  idempotency key for mutations (dedupe replays), and returns structured errors; tests cover invalid
  args, unknown tool, and duplicate-call dedupe.

---

# 12. Agent guardrails, loop budgets, tool budgets, and termination conditions

**Slug:** `agent-guardrails-budgets`
**Scope:** Keeping autonomous agents bounded and safe: step/tool/token budgets, explicit
termination, and guardrails that prevent runaway loops and unsafe actions.

**Core subtopics:**
1. Termination conditions: goal-met, budget-exhausted, no-progress, error thresholds.
2. Budgets: max steps, max tool calls, token/cost ceilings, wall-clock deadlines.
3. Progress detection: loop/oscillation detection, repeated-state guards.
4. Guardrails: allowed-tool sets, confirmation for high-risk actions, output filters.
5. Graceful termination and partial-result reporting vs. hard stops.
6. Human-in-the-loop escalation and interrupts.

**Assessment blueprint:**
- **Multiple choice:** pick a termination condition for a described stuck agent; identify what a
  tool budget prevents; choose the right guardrail for a high-risk action.
- **Missing term:** an agent stuck repeating actions is in a ____; the cap on total actions is the
  ____ budget.
- **Free entry:** name one signal that an agent is making no progress.
- **Essay:** *short* — why are budgets necessary even for a "correct" agent? *long* — design the full
  guardrail + termination policy for a customer-facing task agent with mutating tools.
- **Coding exercise:** implement an agent runner enforcing max-steps, max-tool-calls, a no-progress
  detector (repeated action/state), and graceful partial-result return; tests trigger each stop.

---

# 13. Model routing, graceful fallback logic, and degraded-mode UX

**Slug:** `model-routing-fallback`
**Scope:** Choosing the right model per request and degrading gracefully when a provider is slow,
down, rate-limited, or over budget — without a hard failure for the user.

**Core subtopics:**
1. Routing signals: task difficulty, latency/cost budget, quality need, context length.
2. Fallback triggers: timeout, error, rate limit, overload, cost cap, quality gate.
3. Fallback direction: cheaper/faster/smaller model, cached answer, reduced feature.
4. Degraded-mode UX: honest messaging, partial functionality, retry/queue.
5. Health checks, circuit breakers, hedged requests, retries with backoff.
6. Avoiding correctness/consistency surprises when the model silently changes.

**Assessment blueprint:**
- **Multiple choice:** choose a routing decision from signals; identify a good fallback trigger;
  pick the right degraded-mode behavior for an outage.
- **Missing term:** a ____ breaker stops calling a failing provider; sending duplicate requests to
  cut tail latency is ____ requests.
- **Free entry:** name one user-facing signal of degraded mode done honestly.
- **Essay:** *short* — why is silent model substitution risky? *long* — design a routing + fallback
  policy with circuit breakers and a degraded-mode UX for a production assistant.
- **Coding exercise:** implement a router with per-model timeout, ordered fallback chain, circuit
  breaker, and a final cached/deterministic response; tests cover timeout, error, and breaker-open.

---

# 14. RAG architecture: chunking, embeddings, hybrid search, reranking, and freshness

**Slug:** `rag-architecture`
**Scope:** The end-to-end retrieval pipeline that grounds generation: how documents are split,
embedded, searched (dense + sparse), reranked, and kept fresh.

**Core subtopics:**
1. Chunking: size/overlap, structure-aware splitting, chunk metadata.
2. Embeddings: model choice, dimensionality, domain fit, normalization.
3. Search: dense (vector) vs. sparse (BM25) vs. hybrid; fusion (e.g. RRF).
4. Reranking: cross-encoder rerank over top-k candidates; latency/quality tradeoff.
5. Freshness/indexing: incremental updates, invalidation, TTL, versioning.
6. Grounding assembly: passing retrieved context and citing sources (links to retrieval evals).

**Assessment blueprint:**
- **Multiple choice:** choose a chunking strategy for a doc type; identify when hybrid beats pure
  dense; pick the role of a cross-encoder reranker.
- **Missing term:** combining dense and sparse results with reciprocal rank ____; a ____-encoder
  reranks query–passage pairs.
- **Free entry:** name the retrieval component that most improves precision on the top results.
- **Essay:** *short* — why is naive fixed-size chunking often a quality bug? *long* — design a RAG
  pipeline for frequently-updated docs balancing recall, precision, latency, and freshness.
- **Coding exercise:** implement hybrid retrieval: BM25 + cosine dense scores fused via RRF, then a
  simple rerank; tests check fusion ordering and that hybrid recovers a doc each method alone misses.

---

# 15. Retrieval evals: recall, precision, grounding, attribution, and citation quality

**Slug:** `retrieval-evals`
**Scope:** Measuring whether retrieval actually helps: did we fetch the right context (recall/
precision), did the answer *use* it (grounding), and are citations correct (attribution)?

**Core subtopics:**
1. Retrieval metrics: recall@k, precision@k, MRR, nDCG.
2. Grounding/faithfulness: is the answer supported by retrieved context?
3. Attribution/citation quality: correct source, correct span, no fabricated citations.
4. Building labeled retrieval sets; query/document relevance judgments.
5. Separating retrieval failures from generation failures.
6. Online vs. offline retrieval evals; guarding against regressions.

**Assessment blueprint:**
- **Multiple choice:** compute/compare recall@k vs. precision@k for a scenario; distinguish a
  grounding failure from a retrieval miss; identify a fabricated citation.
- **Missing term (parameterized):** given relevant/retrieved sets, recall@k = ____ (numeric);
  faithfulness measures whether the answer is ____ by context.
- **Free entry:** name the metric that penalizes correct docs ranked low.
- **Essay:** *short* — why measure grounding separately from retrieval recall? *long* — design a
  retrieval eval suite that isolates chunking, ranking, and generation regressions.
- **Coding exercise:** implement `recallAtK`, `precisionAtK`, and `mrr` over labeled results, plus a
  grounding check (answer-claim ⊆ retrieved spans); tests use known fixtures.

---

# 16. Evals: golden sets, regression tests, adversarial tests, LLM-as-judge, and human evals

**Slug:** `eval-methodology`
**Scope:** The discipline of measuring LLM system quality: curated golden sets, regression gates,
adversarial coverage, judge models, and human review — and the failure modes of each.

**Core subtopics:**
1. Golden sets: curation, labeling, coverage, drift/maintenance.
2. Regression testing and CI gates on quality (pass-rate thresholds).
3. Adversarial/edge-case tests: injection, jailbreaks, malformed input, long tail.
4. LLM-as-judge: rubric design, position/verbosity/self bias, calibration against humans.
5. Human evals: when required, inter-rater agreement, cost.
6. Metric selection and the "teaching to the test" / overfitting-to-eval trap.

**Assessment blueprint:**
- **Multiple choice:** pick the eval type for a described risk; identify an LLM-as-judge bias;
  choose what makes a golden set trustworthy.
- **Missing term:** returning known answers to catch regressions uses a ____ set; a judge model
  scoring outputs is LLM-as-____.
- **Free entry:** name one systematic bias of LLM-as-judge.
- **Essay:** *short* — when is LLM-as-judge appropriate vs. misleading? *long* — design an eval
  program (golden + regression + adversarial + judge + human) with CI gating for a production feature.
- **Coding exercise:** implement an eval harness that runs cases with `equals`/`regex`/judge-stub
  matchers, computes pass-rate, and fails below a threshold; tests cover pass/fail gating.
  *(Mirrors this project's own meta-eval gate — see `DESIGN.md` §7.)*

---

# 17. LLM observability: traces, spans, tokens, latency, errors, and drift

**Slug:** `llm-observability`
**Scope:** Treating observability as a first-class discipline for LLM systems: structured traces of
multi-step calls, token/latency/error telemetry, and drift detection over time.

**Core subtopics:**
1. Traces and spans across a multi-step / multi-agent call graph; correlation IDs.
2. Core signals: input/output tokens, TTFT/TPOT/latency, error/retry counts, cost.
3. Capturing prompts, tool calls, and model versions for replay/debugging (with privacy limits).
4. Quality/behavior drift: distribution shift, eval-score decay, canary comparisons.
5. Alerting/SLOs on latency, error rate, and quality regressions.
6. Sampling, redaction, and PII handling in traces (links to safety/multi-tenancy).

**Assessment blueprint:**
- **Multiple choice:** map a debugging need to trace vs. span vs. metric; identify a leading
  indicator of drift; choose what to redact before logging.
- **Missing term:** a single unit of work in a trace is a ____; the same prompt scoring lower over
  time is quality ____.
- **Free entry:** name one signal you'd alert on for a silent quality regression.
- **Essay:** *short* — why are request-level metrics insufficient for agent systems? *long* — design
  observability for a multi-step agent: what to trace, measure, sample, redact, and alert on.
- **Coding exercise:** implement a lightweight tracer (nested spans with timing, token counts,
  status) that emits a structured trace tree; tests assert parent/child timing and token rollups.

---

# 18. Cost attribution per feature, workflow, tenant, and user journey

**Slug:** `cost-attribution`
**Scope:** Attributing LLM spend to the dimensions the business cares about — feature, workflow,
tenant, user journey — not just "per model," so cost can be optimized where it actually accrues.

**Core subtopics:**
1. Cost drivers: input vs. output tokens, model tier, retries/repairs, tool calls, caching.
2. Attribution dimensions: feature, workflow/step, tenant, user, request path.
3. Tagging/propagation: carrying cost labels through multi-step and async pipelines.
4. Unit economics: cost per successful task, per tenant, per journey; margin analysis.
5. Hidden costs: failed/abandoned runs, retries, over-retrieval, oversized context.
6. Budgets, quotas, and cost-based routing/guardrails.

**Assessment blueprint:**
- **Multiple choice:** identify the biggest cost driver in a scenario; choose the right attribution
  dimension for a decision; spot a hidden cost.
- **Missing term:** cost per ____ task is a better unit than cost per request; retries and repairs
  inflate ____ cost.
- **Free entry:** name a cost that per-model reporting hides.
- **Essay:** *short* — why is "cost per model" the wrong granularity? *long* — design a cost
  attribution system that tags spend across features, workflows, and tenants and drives optimization.
- **Coding exercise:** implement a cost aggregator that consumes tagged call records
  (tokens, model, tenant, feature) and reports cost rollups per dimension + cost-per-success; tests
  verify rollups and unit-economics math.

---

# 19. Safety engineering: prompt injection defense, data leakage prevention, permission boundaries

**Slug:** `safety-engineering`
**Scope:** Defending LLM systems against prompt injection and data exfiltration, and enforcing
permission boundaries so tools and context can't be abused via crafted input.

**Core subtopics:**
1. Prompt injection: direct and indirect (via retrieved/tool content); trust boundaries.
2. Defenses: input fencing/quoting, provenance/trust tags, allow-listing, output filtering.
3. Data leakage: system-prompt/secret exfiltration, cross-context bleed, PII in outputs.
4. Permission boundaries: least privilege for tools, per-user authorization on actions.
5. The confused-deputy problem: model acting on untrusted instructions with trusted privileges.
6. Defense-in-depth: no single mitigation is sufficient; layered controls + monitoring.

**Assessment blueprint:**
- **Multiple choice:** classify direct vs. indirect injection; pick the effective mitigation for a
  described attack; identify a confused-deputy scenario.
- **Missing term:** injection arriving through retrieved documents is ____ injection; giving a tool
  only the privileges it needs is least ____.
- **Free entry:** name why input filtering alone can't stop injection.
- **Essay:** *short* — explain the confused-deputy risk when an agent has powerful tools. *long* —
  design defense-in-depth for an agent that reads untrusted web content and can send email.
- **Coding exercise:** implement a tool-authorization layer that tags content provenance and blocks
  actions requested by untrusted content unless independently authorized; tests cover an indirect
  injection attempt and a legitimate call.

---

# 20. Multi-tenant isolation, cache safety, and cross-user context contamination prevention

**Slug:** `multi-tenant-isolation`
**Scope:** Keeping tenants and users cryptographically and logically separated across caches,
context, embeddings, and retrieval — so one user's data never surfaces in another's session.

**Core subtopics:**
1. Isolation dimensions: prompt/semantic cache keys, vector indexes, memory, logs.
2. Cache-key safety: including tenant/user/authz scope in keys; poisoning risks.
3. Cross-user context contamination: shared state, reused sessions, embedding leakage.
4. Retrieval scoping: per-tenant partitions and authorization filters on search.
5. Noisy-neighbor and fairness under shared infrastructure.
6. Testing isolation: adversarial cross-tenant probes; auditing.

**Assessment blueprint:**
- **Multiple choice:** spot the missing key component causing a cross-tenant cache hit; choose the
  correct retrieval-scoping approach; identify a contamination vector.
- **Missing term:** a cache key must include the ____ scope to prevent cross-tenant hits; retrieval
  must apply an authorization ____.
- **Free entry:** name one place cross-user contamination commonly leaks.
- **Essay:** *short* — how can a semantic cache leak across tenants? *long* — design multi-tenant
  isolation across caching, retrieval, and memory, with tests that prove no cross-tenant bleed.
- **Coding exercise:** implement tenant-scoped cache keys and a retrieval filter; add a test that a
  second tenant with an identical query gets a miss and cannot retrieve tenant-1 documents.

---

# 21. Fine-tuning vs. in-context learning vs. RAG vs. distillation — and when each is the wrong tool

**Slug:** `adaptation-strategy-selection`
**Scope:** Choosing how to adapt a model to a task/domain. Each approach fits different problems;
the skill is recognizing when a popular choice is the *wrong* one.

**Core subtopics:**
1. In-context learning: fast, no training, bounded by context and examples; when it's enough.
2. RAG: for changing/large knowledge and attribution; not for changing *behavior/format*.
3. Fine-tuning: for style/format/behavior and latency; poor for volatile facts.
4. Distillation: for cheaper/smaller deployment of a known-good behavior.
5. Decision axes: knowledge freshness, behavior change, data volume, cost, latency, attribution.
6. Anti-patterns: fine-tuning for facts that change; RAG to fix formatting; over-adapting.

**Assessment blueprint:**
- **Multiple choice:** match a problem to the right approach; identify the wrong tool for a scenario
  (e.g. fine-tuning volatile facts); pick what RAG does *not* fix.
- **Missing term:** for frequently-changing knowledge with citations, prefer ____; to change output
  format/behavior, prefer ____.
- **Free entry:** name a case where fine-tuning is the wrong tool.
- **Essay:** *short* — why is RAG a poor fix for formatting problems? *long* — given a domain
  assistant needing fresh facts, a strict format, and low latency, recommend a combination and
  justify what you'd *not* use.
- **Coding exercise:** implement a decision function `chooseStrategy(requirements)` over axes
  (freshness, behavior-change, attribution, latency, data volume) returning a ranked recommendation;
  tests assert correct picks and flag anti-patterns.

---

# 22. Latency, quality, cost, and reliability tradeoffs across the full inference stack

**Slug:** `inference-stack-tradeoffs`
**Scope:** The system-level view: every layer (routing, caching, batching, quantization, retrieval,
decoding) trades among latency, quality, cost, and reliability. This topic integrates the others.

**Core subtopics:**
1. The four-way tradeoff space and why you can't max all simultaneously.
2. Per-layer levers and their dominant axis (e.g. batching↑throughput/↑latency; quant↓cost/↓quality).
3. SLOs as the anchor: define targets, then choose levers that fit.
4. End-to-end budgets: latency and cost budgets decomposed across the pipeline.
5. Reliability as a first-class axis: fallbacks, redundancy, and their cost/latency price.
6. Reasoning about second-order effects and interactions between layers.

**Assessment blueprint:**
- **Multiple choice:** given a lever, identify which axes it helps/hurts; choose the change that
  meets an SLO without breaking another; spot a false "free lunch."
- **Missing term:** you optimize against defined ____ (service-level objectives); larger batches
  raise throughput at the cost of ____.
- **Free entry:** name the axis most often sacrificed for cost.
- **Essay:** *short* — why is there no single "best" inference configuration? *long* — given SLOs
  for latency, cost, and quality, architect the full stack and justify each layer's tradeoff.
- **Coding exercise:** implement a config scorer that, given per-lever effects and weighted SLO
  targets, ranks candidate stack configurations; tests verify SLO-violating configs are rejected.

---

# 23. Production failure modes: hallucinated tool calls, malformed JSON, stale retrieval, runaway agents, and silent eval regressions

**Slug:** `production-failure-modes`
**Scope:** A capstone catalog of how LLM systems fail in production, how to detect each, and how to
mitigate — synthesizing the harness, structured-output, RAG, agent, and eval topics.

**Core subtopics:**
1. Hallucinated/invalid tool calls: detection (validation) and mitigation (contracts, guards).
2. Malformed JSON / schema violations: validate-repair-fallback chains.
3. Stale retrieval: freshness/TTL, index lag detection, invalidation.
4. Runaway agents: budgets, loop detection, termination.
5. Silent eval regressions: CI eval gates, canaries, drift alerts.
6. Detection vs. mitigation vs. prevention for each; incident response and postmortems.

**Assessment blueprint:**
- **Multiple choice:** match a failure to its detection signal and its mitigation; identify the
  *silent* failure in a list; choose the control that would have caught it.
- **Missing term:** a quality drop no one notices because nothing errors is a ____ regression; an
  agent that never stops is a ____ agent.
- **Free entry:** name the control that catches silent eval regressions before release.
- **Essay:** *short* — why are silent regressions more dangerous than loud errors? *long* — build a
  failure-mode playbook (detect → mitigate → prevent) for a production agent with tools and RAG.
- **Coding exercise:** implement a guard suite: a JSON validator+repair, a retrieval-staleness check
  (timestamp/TTL), and an agent step-budget stop, wired into one `runSafely` wrapper; tests trigger
  each failure and assert the guard fires.

---

## Next step

Turn each plan into a `topics/<slug>/` lesson: author `topic.yaml`, the question files per the
assessment blueprint, eval skills for the essay/coding questions, and calibration sets — then
`npm run validate`. Recommend building **one topic end-to-end first** (e.g.
`structured-output-reliability`, which is concrete and code-friendly) to validate the plan → lesson
pipeline before scaling to all 22.
