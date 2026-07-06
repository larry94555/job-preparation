# 10. Function calling reliability, tool contracts, argument validation, idempotency — Lesson-Plan Breakdown

**Slug:** `function-calling-reliability` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Treat tools as APIs with contracts: validated arguments, typed schemas, and idempotent
execution so a retried or hallucinated call can't corrupt state.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** tool contracts; argument validation/coercion; hallucinated tool/args; idempotency; read/write separation; model-facing error design; permissioning.
- **Key terms:** tool schema, idempotency key, exactly-once, side-effect class, confirmation gate, argument validation, MCP.
- **Tradeoffs:** strict validation vs. flexibility; auto-execute vs. confirm; retry vs. duplicate effect.
- **Patterns:** typed contracts; idempotency keys; dedupe on retry; read-before-write. **Antipatterns:** executing unvalidated args; non-idempotent mutations; trusting tool names blindly.
- **Architectures:** tool dispatcher w/ validation + idempotency; MCP tool boundary.
- **Papers/posts:** function-calling/tool-use docs (Anthropic/OpenAI); Toolformer (Schick 2023); Gorilla (Patil 2023); MCP spec. *(verify)*
- **People/canon:** Gorilla authors; MCP maintainers; provider tool-use guidance.
- **Benchmarks/metrics:** tool-call validity, argument-error rate, task success, duplicate-effect rate; Berkeley Function-Calling Leaderboard.
- **Tools/OSS/models:** MCP, provider tool APIs, Pydantic/Zod validators.
- **Open problems:** reliable multi-tool orchestration; robust arg grounding; exactly-once at scale.
- **Interview signals:** can you explain idempotency for tools and how you handle an unknown tool call.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Tools are APIs: the contract | T1 | L2→L3 | C1.3, C3.1 | MC, Cloze, FE |
| LP2 | Argument validation & hallucinated calls | T1 | L3 | C3.2, C5.1 | MC, Code |
| LP3 | Idempotency & safe retries | T1 | L3 | C3.3, C5.2 | Essay, Code |
| LP4 | Model-facing error design | T2 | L3 | C3.4, C1.2 | Essay |
| LP5 | Build a validating, idempotent dispatcher | T2 | L3 | C5.2, C5.4 | Code |
| LP6 | Permissioning & confirmation gates | T2 | L3 | C3.3, C4.3 | Essay |

**Prereqs:** topic 9 recommended first; LP6 links to topics 11 and 18.
