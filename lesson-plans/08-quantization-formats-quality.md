# 8. INT8, INT4, FP8, AWQ, GPTQ, and when quantization hurts quality — Lesson-Plan Breakdown

**Slug:** `quantization-formats-quality` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** The concrete quantization formats and methods, what they cost in quality, and the failure
signatures of over-aggressive quantization.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** numeric formats (FP16/BF16/FP8/INT8/INT4); weight-only vs. weight+activation vs. KV quant; calibration; outliers; sensitive layers; quality-loss signatures.
- **Key terms:** scale/zero-point, per-tensor vs. per-channel, symmetric/asymmetric, GPTQ, AWQ, SmoothQuant, GGUF/k-quants, outlier features.
- **Tradeoffs:** bits vs. quality; activations harder than weights; perplexity vs. task-eval as proxy.
- **Patterns:** activation-aware protection (AWQ); calibration (GPTQ); outlier handling (SmoothQuant). **Antipatterns:** INT4 for reasoning-heavy tasks unchecked; trusting perplexity alone; quantizing sensitive layers.
- **Architectures:** PTQ pipelines; mixed-precision serving.
- **Papers/posts:** GPTQ (Frantar 2022); AWQ (Lin 2023); SmoothQuant (Xiao 2022); LLM.int8() (Dettmers 2022); FP8 formats. *(verify)*
- **People/canon:** Frantar, Lin, Xiao, Dettmers.
- **Benchmarks/metrics:** perplexity, task evals (MMLU/GSM8K etc.), reconstruction error, throughput/footprint.
- **Tools/OSS/models:** AutoGPTQ, AutoAWQ, bitsandbytes, llama.cpp/GGUF, TensorRT-LLM.
- **Open problems:** reliable low-bit quality prediction; activation quant at INT4; long-context degradation.
- **Interview signals:** can you explain AWQ vs. GPTQ and why perplexity can hide task-quality loss.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | Numeric formats & footprint | T1 | L2→L3 | C1.3, C4.2 | MC, Cloze, FE |
| LP2 | Weight vs. activation vs. KV quant | T1 | L3 | C3.1, C3.3 | MC, Essay |
| LP3 | GPTQ vs. AWQ (and SmoothQuant) | T1 | L3 | C2.1, C3.3 | MC, Essay |
| LP4 | Implement int8 quantize/dequantize + error | T2 | L3 | C5.1, C5.2 | Code |
| LP5 | When quantization hurts: quality evals | T2 | L3 | C6.2, C6.3 | Essay |
| LP6 | Production-safety decision for a build (frontier) | T3 | L3→L4 | C4.4, C6.5 | Essay |

**Prereqs:** LP1 gates; links to topics 7 and 15 (evals).

---

## Lesson flow & sections

Delivered per the standard **present → check → apply → section assessment** loop
([`README.md`](README.md), [`../Goals.md`](../Goals.md) §6.1). The value tiers above map to sections:

- **Section 1 (T1 lessons)** — fundamentals; ends in a section assessment (mastery → light green).
- **Section 2 (T2 lessons)** — practitioner depth; section assessment.
- **Section 3 (T3 lessons)** — expert/frontier; section assessment.
- **Cumulative assessment** — spans the sections once each reaches light green.

Each lesson: present material → formative checks (MC / short-answer / flashcards) → the application
task in its **Modes** column → contributes to its section assessment. Present-before-test is enforced;
the dashboard shows mastery color only (no attempts, no red).
