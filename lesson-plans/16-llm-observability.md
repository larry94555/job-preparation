# 16. LLM observability: traces, spans, tokens, latency, errors, drift — Lesson-Plan Breakdown

**Slug:** `llm-observability` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Observability as a first-class discipline for LLM systems: structured traces of
multi-step calls, token/latency/error telemetry, and drift detection.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** traces/spans over call graphs; core signals (tokens/latency/errors/cost); prompt/tool capture & replay; drift detection; SLOs/alerting; sampling/redaction/PII.
- **Key terms:** trace, span, correlation ID, TTFT/TPOT, drift, canary, sampling, redaction, OpenTelemetry/OTel-GenAI.
- **Tradeoffs:** capture depth vs. cost/PII; sampling vs. coverage; alert sensitivity vs. noise.
- **Patterns:** nested spans + correlation IDs; token/cost rollups; canary comparison; drift alerts. **Antipatterns:** request-only metrics for agents; logging raw PII; no version tagging.
- **Architectures:** OTel-based tracing; LLM-observability platforms; replay/debug pipelines.
- **Papers/posts:** OpenTelemetry GenAI semantic conventions; drift/monitoring writing; platform docs. *(verify)*
- **People/canon:** OTel-GenAI contributors; observability practitioners.
- **Benchmarks/metrics:** latency percentiles, error/retry rate, tokens/cost per step, eval-score trend, drift stats.
- **Tools/OSS/models:** Langfuse, LangSmith, Arize/Phoenix, Helicone, OpenLLMetry.
- **Open problems:** standardized semantics; quality drift detection; privacy-preserving traces.
- **Interview signals:** why request metrics are insufficient for agents; what you trace, sample, redact, alert on.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Traces & spans for multi-step LLM calls | T1 | L2→L3 | C1.1, C1.3 | MC, Cloze, FE |
| LP2 | The core signals: tokens, latency, errors, cost | T1 | L3 | C6.2, C3.1 | MC, FE |
| LP3 | Capture, replay & privacy/redaction | T2 | L3 | C3.3, C4.2 | Essay |
| LP4 | Drift detection & canaries | T2 | L3 | C3.2, C2.1 | Essay |
| LP5 | Build a nested tracer with token rollups | T2 | L3 | C5.1, C5.2 | Code |
| LP6 | SLOs & alerting for agents (frontier) | T3 | L3→L4 | C4.4, C6.5 | Essay |

**Prereqs:** links to topics 15 (drift↔evals), 17 (cost), 22 (silent regressions).
