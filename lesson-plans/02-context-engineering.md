# 2. Context engineering, not just long prompts — Lesson-Plan Breakdown

**Slug:** `context-engineering` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Get the *right* tokens into a bounded window at the right time — selection, ordering,
compression, eviction — rather than stuffing everything into one long prompt.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** window as ranked token budget; retrieval/selection; position effects; compression/summarization; memory; context hygiene/isolation.
- **Key terms:** context budget, lost-in-the-middle, primacy/recency, context rot/dilution, scratchpad, working memory, token accounting.
- **Tradeoffs:** more context (recall) vs. dilution/cost/latency; recency vs. relevance; compress vs. drop.
- **Patterns:** rank-then-fit-to-budget; structured scratchpad; rolling summary; stable-prefix/variable-suffix. **Antipatterns:** dump-everything; unranked concatenation; unbounded history.
- **Architectures:** retrieval-augmented context assembly; memory-tiered agents; compaction pipelines.
- **Papers/posts:** "Lost in the Middle" (Liu 2023); long-context evals (RULER, Needle-in-a-Haystack); Anthropic context/prompt-caching guidance. *(verify)*
- **People/canon:** Nelson Liu et al.; long-context eval authors; practitioner writing on context management.
- **Benchmarks/metrics:** needle-in-haystack, RULER, retrieval accuracy vs. position; tokens-in-window vs. task score.
- **Tools/OSS/models:** LlamaIndex/LangChain context builders; tokenizers (tiktoken); memory libs.
- **Open problems:** effective-context vs. advertised-context gap; principled compaction without info loss.
- **Interview signals:** do you treat context as a managed budget; can you reason about position and dilution.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Context as a ranked token budget | T1 | L2→L3 | C1.1, C1.3, C3.3 | MC, Cloze, FE |
| LP2 | Position effects: lost-in-the-middle | T1 | L2→L3 | C2.1, C3.3 | MC, Essay |
| LP3 | Selection & retrieval into the window | T1 | L3 | C3.1, C5.1 | MC, Code |
| LP4 | Compression: summaries, scratchpads, memory | T2 | L3 | C3.3, C5.2 | Essay, Code |
| LP5 | Context rot & the cost of padding | T2 | L3 | C3.3, C6.2 | Essay |
| LP6 | Building a budget-aware context assembler | T2 | L3 | C5.2, C5.4 | Code |
| LP7 | Long-context evals & the effective-context gap | T3 | L3→L4 | C2.4, C6.3 | Essay |

**Prereqs:** LP1 gates all; LP3 links to topic 13 (RAG); hygiene links to topics 18–19.
