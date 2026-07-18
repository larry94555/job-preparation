# Canon — verified reference facts per topic (source of truth for WS1/WS2)

Curated high-confidence canon used to author the "Papers, people & the frontier" and "Interviewing"
lessons. Facts are stated at the robust **idea ↔ system/paper ↔ lab** level. Approximate years are
given for context but should **not** be tested as exact-date questions. Anything uncertain is omitted
rather than guessed. (Web-verify before treating a year as authoritative.)

Authoring rule for lessons built from this file: **do not add any paper/person not listed here**, and
test **idea↔method↔system/people** attribution, not exact years.

---

## harness-engineering
- **Papers/people:** reason-then-act agent loop → **ReAct** (Yao et al., 2022); self-reflection/retry
  → **Reflexion** (Shinn et al., 2023); models calling tools → **Toolformer** (Schick et al., Meta,
  2023); practitioner guidance → Anthropic **"Building Effective Agents"** (2024).
- **Tools/OSS:** Claude Agent SDK, OpenAI Agents SDK, LangChain/LlamaIndex, smolagents; AutoGPT (cautionary).
- **SOTA now:** structured agent loops with verification + budgets; SWE-bench-style agentic coding harnesses.
- **Open problems:** reliable long-horizon autonomy; verifying open-ended tasks; robust error recovery.
- **Interview signals:** can you split model vs. harness responsibilities; how you bound/verify an agent.
- **Red flags:** "just improve the prompt" for structural failures; trusting model output unverified; unbounded loops.

## loop-engineering
- **Papers/people:** reason-then-act loop → **ReAct** (Yao et al., 2022); reflect-and-retry → **Reflexion**
  (Shinn et al., 2023); learned tool use → **Toolformer** (Schick et al., Meta, 2023); deliberate search →
  **Tree of Thoughts** (Yao et al., 2023); most-constrained-shape guidance → Anthropic **"Building Effective
  Agents"** (2024).
- **Tools/OSS:** Claude Agent SDK, LangGraph, OpenAI Agents SDK; SWE-agent (agentic-coding harness); AutoGPT (unbounded-loop cautionary).
- **SOTA now:** single bounded edit → run → observe loops with per-step verification and named termination; plan-then-execute and reflect-retry for long-horizon work; SWE-bench-style harnesses.
- **Open problems:** reliable long-horizon autonomy; verifying open-ended tasks (no crisp gate); robust error recovery and context compaction over length.
- **Interview signals:** design the loop not the prompt; pick the most-constrained shape; bound and verify; classify-then-recover.
- **Red flags:** unbounded loop whose only exit is the model saying "done"; trusting unverified progress; blind-retrying permanent failures; reaching for multi-agent/search when one loop would do.

## context-engineering
- **Papers/people:** mid-context under-use → **"Lost in the Middle"** (Liu et al., Stanford, 2023);
  long-context stress tests → **Needle-in-a-Haystack**, **RULER** (NVIDIA, 2024).
- **Tools/OSS:** tokenizers (tiktoken), LangChain/LlamaIndex context builders, memory libraries.
- **SOTA now:** retrieval + compaction pipelines; the "effective vs. advertised context" gap is a live concern.
- **Open problems:** principled compaction without info loss; making long context actually usable.
- **Interview signals:** do you treat the window as a ranked budget; can you reason about position/dilution.
- **Red flags:** dump-everything prompts; ignoring context rot; "more context is always better".

## structured-output-reliability
- **Papers/people:** grammar/finite-state constrained decoding → **Outlines** (Willard & Louf, 2023);
  structured-output libraries → **Instructor** (Jason Liu), jsonformer; provider "JSON mode"/structured outputs.
- **Tools/OSS:** Zod / Pydantic, Outlines, Instructor, llama.cpp GBNF grammars.
- **SOTA now:** constrained decoding + schema validation + bounded repair + fallback chains.
- **Open problems:** semantic (not just syntactic) validity; quality effects of aggressive constraints.
- **Interview signals:** do you validate even with constrained decoding; can you design a repair/fallback chain.
- **Red flags:** regex-scraping JSON; "the model usually returns valid JSON"; unbounded repair.

## function-calling-reliability
- **Papers/people:** models learning to call tools/APIs → **Toolformer** (Schick et al., 2023),
  **Gorilla** (Patil et al., Berkeley, 2023); tool-use evaluation → **Berkeley Function-Calling
  Leaderboard**; open tool boundary → **Model Context Protocol (MCP)** (Anthropic, 2024).
- **Tools/OSS:** MCP, provider tool/function APIs, Pydantic/Zod validators.
- **SOTA now:** typed contracts + argument validation + idempotency; MCP as the tool interface standard.
- **Open problems:** reliable multi-tool orchestration; robust argument grounding; exactly-once at scale.
- **Interview signals:** idempotency for tools; handling unknown/hallucinated tool calls.
- **Red flags:** executing unvalidated args; non-idempotent mutations; trusting tool names blindly.

## agent-guardrails-budgets
- **Papers/people:** agent loops → **ReAct/Reflexion**; Anthropic **"Building Effective Agents"**;
  guardrail frameworks → **NeMo Guardrails** (NVIDIA), **Guardrails AI**.
- **Tools/OSS:** Guardrails AI, NeMo Guardrails, agent-SDK budget features.
- **SOTA now:** budgets (steps/tools/tokens/cost/time) + no-progress detection + HITL escalation.
- **Open problems:** reliably detecting "stuck"; safe long-horizon autonomy; principled budgets.
- **Interview signals:** enumerate termination conditions; why budgets matter even for a "correct" agent.
- **Red flags:** open-ended loops; no cost ceiling; success-only exit conditions.

## model-routing-fallback
- **Papers/people:** LLM cascades to cut cost → **FrugalGPT** (Chen et al., Stanford, 2023); learned
  request routing → **RouteLLM** (LMSYS, 2024).
- **Tools/OSS:** LiteLLM, OpenRouter, gateway proxies; mixes of local + frontier models.
- **SOTA now:** difficulty-based routing + fallback cascade + circuit breakers + hedged requests.
- **Open problems:** accurate difficulty prediction; quality-preserving routing; consistency under swaps.
- **Interview signals:** design a fallback chain with breakers and an honest degraded-mode UX.
- **Red flags:** silent model substitution; no circuit breaker; retry storms.

## rag-architecture
- **Papers/people:** retrieval-augmented generation → **RAG** (Lewis et al., FAIR, 2020); late-interaction
  retrieval → **ColBERT** (Khattab & Zaharia, 2020); rank fusion → **Reciprocal Rank Fusion** (Cormack
  et al., 2009); chunk-context enrichment → Anthropic **"Contextual Retrieval"** (2024).
- **Tools/OSS:** FAISS, pgvector, Elastic/OpenSearch, Qdrant/Weaviate; rerankers (bge, Cohere Rerank).
- **SOTA now:** hybrid (dense + BM25) + fusion + cross-encoder rerank; contextual/agentic retrieval.
- **Open problems:** optimal chunking; retrieval for reasoning; freshness at scale; eval fidelity.
- **Interview signals:** justify chunking; when hybrid beats dense; the reranker's role.
- **Red flags:** fixed-size naive chunking; dense-only; no reranker; stale index.

## retrieval-evals
- **Papers/people:** RAG-specific metrics → **RAGAS** (Exploding Gradients, 2023); retrieval benchmark →
  **BEIR** (Thakur et al., 2021); embedding benchmark → **MTEB** (Muennighoff et al., 2022); classic IR
  relevance methodology → **TREC**.
- **Tools/OSS:** RAGAS, TruLens, promptfoo, custom harnesses.
- **SOTA now:** component-isolated evals (retrieval vs. generation) + grounding/faithfulness + attribution.
- **Open problems:** faithful grounding metrics; cheap reliable labels; attribution correctness at scale.
- **Interview signals:** separate a retrieval miss from a grounding failure; pick the right metric.
- **Red flags:** end-to-end-only evals; conflating retrieval and generation errors; unlabeled "vibes".

## eval-methodology
- **Papers/people:** LLM-as-judge + **MT-Bench** + **Chatbot Arena** (Zheng et al., LMSYS, 2023);
  holistic benchmark → **HELM** (Liang et al., Stanford CRFM, 2022); practitioner writing → Hamel Husain,
  Eugene Yan.
- **Tools/OSS:** promptfoo, OpenAI Evals, LangSmith, Braintrust, Inspect.
- **SOTA now:** curated golden sets + CI regression gates + adversarial suites + calibrated LLM-as-judge.
- **Open problems:** trustworthy cheap judges; contamination; benchmark construct validity.
- **Interview signals:** when LLM-as-judge is appropriate, its biases, how you gate regressions.
- **Red flags:** vibes-only; teaching to the test; uncalibrated judge; static stale sets.

## llm-observability
- **Papers/people:** (tooling/standards-led rather than paper-led) **OpenTelemetry GenAI semantic
  conventions**; drift/monitoring practitioner writing.
- **Tools/OSS:** Langfuse, LangSmith, Arize/Phoenix, Helicone, OpenLLMetry.
- **SOTA now:** OTel-based tracing with token/latency/cost rollups + drift/canary detection.
- **Open problems:** standardized semantics; quality-drift detection; privacy-preserving traces.
- **Interview signals:** why request metrics are insufficient for agents; what to trace/sample/redact/alert.
- **Red flags:** request-only metrics for agents; logging raw PII; no version tagging.

## cost-attribution
- **Papers/people:** cost-cutting via cascades → **FrugalGPT** (Chen et al., 2023); FinOps-for-LLM practice.
- **Tools/OSS:** Helicone, LiteLLM cost tracking, Langfuse cost; custom aggregators.
- **SOTA now:** tagged attribution (feature/workflow/tenant) + cost-per-successful-task unit economics.
- **Open problems:** attributing shared/cached/async cost; predicting per-feature cost; fair tenant billing.
- **Interview signals:** why per-model cost is the wrong granularity; attribute across features/tenants.
- **Red flags:** cost-per-model only; ignoring failed/abandoned runs; over-retrieval/oversized context.

## prompt-vs-semantic-caching
- **Papers/people:** semantic caching for LLMs → **GPTCache** (Zilliz, 2023); provider **prompt/prefix
  caching** (Anthropic, OpenAI).
- **Tools/OSS:** GPTCache, Redis/vector stores; provider prefix caching.
- **SOTA now:** layered prefix (exact leading-token) + semantic (embedding-similarity) caching with safety.
- **Open problems:** safe similarity thresholds; invalidation for semantic caches; eval of cache correctness.
- **Interview signals:** tell the two caches apart; reason about their risks and savings.
- **Red flags:** semantic cache on high-stakes answers; reordering that breaks prefix hits; tenant-blind keys.

## kv-cache-management
- **Papers/people:** paged KV memory → **PagedAttention / vLLM** (Kwon et al., 2023); prefix-tree KV
  reuse → **RadixAttention / SGLang**; IO-aware attention kernel → **FlashAttention** (Tri Dao, 2022).
- **Tools/OSS:** vLLM, SGLang, TensorRT-LLM, TGI.
- **SOTA now:** paged blocks + block tables + prefix sharing; KV quantization.
- **Open problems:** optimal eviction under mixed SLOs; lossless KV compression; safe cross-request reuse.
- **Interview signals:** compute KV memory; explain why long contexts throttle concurrency.
- **Red flags:** contiguous KV allocation (fragmentation); ignoring KV in capacity planning.

## prefill-vs-decode-latency
- **Papers/people:** chunked prefill → **Sarathi** (Agrawal et al., MSR); prefill/decode disaggregation →
  **DistServe**, **Splitwise** (2024).
- **Tools/OSS:** vLLM, TensorRT-LLM; benchmarking (GenAI-Perf).
- **SOTA now:** chunked prefill and P/D disaggregation to hit separate TTFT/TPOT SLOs.
- **Open problems:** SLO-optimal P/D scheduling; interference between phases.
- **Interview signals:** say which phase a change affects; why the two optimize differently.
- **Red flags:** a single latency number; optimizing decode to fix a prefill-bound workload.

## batching-paged-attention-throughput
- **Papers/people:** iteration-level (continuous) batching → **Orca** (Yu et al., OSDI, 2022); paged KV →
  **vLLM / PagedAttention** (Kwon et al., 2023); attention kernel → **FlashAttention** (Dao, 2022).
- **Tools/OSS:** vLLM, TGI, TensorRT-LLM, SGLang, LMDeploy.
- **SOTA now:** continuous batching + paged attention; SLO-aware/goodput scheduling.
- **Open problems:** SLO-fair scheduling; multi-tenant throughput isolation; interference.
- **Interview signals:** what continuous batching solves over static, and its latency cost.
- **Red flags:** static batching under variable output lengths; batch-blind SLOs.

## speculative-decoding-quant-distillation
- **Papers/people:** speculative decoding (draft+verify, lossless) → **Leviathan et al.** (Google) and
  **Chen et al.** (DeepMind), 2023; self-speculative heads → **Medusa** (Cai et al., 2024), **EAGLE**;
  knowledge distillation → **Hinton et al.** (2015).
- **Tools/OSS:** vLLM/TensorRT-LLM speculative support; Medusa/EAGLE implementations.
- **SOTA now:** speculative decoding widely deployed; stacking distill→quantize→speculate.
- **Open problems:** high acceptance across domains; combining levers without quality loss.
- **Interview signals:** match each lever to its goal; name which is lossless.
- **Red flags:** speculative with poor acceptance; distilling for volatile facts; quantizing to "fix" latency.

## quantization-formats-quality
- **Papers/people:** calibration-based weight quantization → **GPTQ** (Frantar et al., 2022); activation-
  aware weight quantization → **AWQ** (Lin et al., 2023); outlier migration → **SmoothQuant** (Xiao et al.);
  outlier-aware int8 → **LLM.int8()** (Dettmers et al., 2022).
- **Tools/OSS:** AutoGPTQ, AutoAWQ, bitsandbytes, llama.cpp/GGUF (k-quants), TensorRT-LLM.
- **SOTA now:** AWQ/GPTQ 4-bit weight quant; FP8 on new hardware; per-channel/group scales.
- **Open problems:** reliable low-bit quality prediction; activation quant at INT4; long-context degradation.
- **Interview signals:** AWQ vs. GPTQ; why perplexity can hide task-quality loss.
- **Red flags:** INT4 for reasoning-heavy tasks unchecked; trusting perplexity alone; quantizing sensitive layers.

## safety-engineering
- **Papers/people:** indirect prompt injection → **Greshake et al.** (2023); "prompt injection" coined →
  **Simon Willison** (2022, blog); the field checklist → **OWASP LLM Top 10**; the underlying pattern →
  the **confused-deputy** problem.
- **Tools/OSS:** guardrails frameworks, injection detectors (Rebuff/LLM-Guard), policy engines.
- **SOTA now:** provenance/trust boundaries + least privilege + egress control; defense-in-depth (no single fix).
- **Open problems:** no robust general injection defense; provenance at scale; agent egress control.
- **Interview signals:** direct vs. indirect injection; the confused-deputy risk; why filtering alone fails.
- **Red flags:** trusting retrieved/tool content; single-filter defense; over-privileged agents.

## multi-tenant-isolation
- **Papers/people:** (SaaS/security tradition rather than a single LLM paper) multi-tenant isolation
  patterns; **row-level security**; semantic-cache leakage discussions.
- **Tools/OSS:** vector-DB namespaces, Postgres RLS, cache-key conventions.
- **SOTA now:** tenant-scoped cache keys + authz-filtered retrieval + per-tenant partitions.
- **Open problems:** safe cross-user reuse; provable isolation; embedding-space leakage.
- **Interview signals:** how a semantic cache leaks across tenants; correct retrieval scoping.
- **Red flags:** tenant-blind cache keys; shared semantic cache; unscoped vector search; reused sessions.

## adaptation-strategy-selection
- **Papers/people:** retrieval-augmented generation → **RAG** (Lewis et al., 2020); parameter-efficient
  fine-tuning → **LoRA** (Hu et al., Microsoft, 2021); knowledge distillation → **Hinton et al.** (2015).
- **Tools/OSS:** PEFT/LoRA libraries, RAG frameworks, distillation tooling; open vs. frontier models.
- **SOTA now:** RAG for volatile facts + PEFT for behavior + distillation for cheap deploy; hybrids.
- **Open problems:** principled selection; combining methods; continual/online adaptation.
- **Interview signals:** name the *wrong* tool for a scenario; defend a combination.
- **Red flags:** fine-tuning for changing facts; RAG to fix formatting; premature fine-tuning/distillation.

## inference-stack-tradeoffs
- **Papers/people:** cost/quality cascades → **FrugalGPT** (Chen et al., 2023); roofline/serving analyses;
  the serving systems above (**vLLM**, **Orca**, **Sarathi**) as the levers.
- **Tools/OSS:** vLLM/TensorRT-LLM/SGLang; load-testing harnesses; combined eval+cost+obs stacks.
- **SOTA now:** SLO-anchored stack design; joint latency/cost/quality/reliability optimization.
- **Open problems:** joint multi-objective optimization; predictable SLOs under load; interaction effects.
- **Interview signals:** reason about a change's effect on all four axes; anchor on SLOs.
- **Red flags:** single-metric optimization; "free lunch" claims; premature optimization; ignoring reliability cost.

## production-failure-modes
- **Papers/people:** reliability engineering tradition → **Google SRE book** (postmortems, error budgets);
  the field checklist → **OWASP LLM Top 10**; the guard patterns from structured-output/agent/eval topics.
- **Tools/OSS:** eval gates, guardrails, observability + alerting stacks.
- **SOTA now:** validate-repair-fallback + freshness/TTL + budgets/loop-detection + CI eval-gates + canaries.
- **Open problems:** catching silent regressions early; end-to-end failure prediction; graceful multi-failure recovery.
- **Interview signals:** why silent regressions are worse than loud errors; a detect→mitigate→prevent playbook.
- **Red flags:** loud-error focus while ignoring silent regressions; no guardrails; no postmortems.
