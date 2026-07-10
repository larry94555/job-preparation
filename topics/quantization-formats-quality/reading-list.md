# Reading list & staying current — quantization-formats-quality

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **GPTQ — Frantar et al. (2022).** The calibration-based, Hessian-guided layerwise weight quantizer that
  made 4-bit LLM weights practical. Notice that it uses a small calibration set to quantize column-by-column
  while correcting the error into the remaining weights — quantization as an *optimization*, not a rounding.
- **LLM.int8() — Dettmers et al. (2022).** The paper that named the real enemy: a handful of *outlier
  activation features* that blow up naive int8. Notice the mixed-precision fix (keep outlier channels in
  fp16, the rest in int8) — this is the prior that every later method reacts to.

## Go deeper (mechanism & where the error hides)
- **AWQ — Lin et al. (2023).** Activation-*aware* weight quantization: the few weight channels tied to large
  activations are the ones worth protecting. Notice it protects *salient channels* by scaling rather than by
  keeping them in high precision — a cheaper answer to the same outlier problem.
- **SmoothQuant — Xiao et al.** Migrates the quantization difficulty from activations into weights by a
  per-channel smoothing transform, so *both* can go int8. Notice the framing: outliers aren't destroyed, they
  are *moved* to the tensor that tolerates them better.
- **Perplexity hides task-quality loss.** The single most important evaluation caveat: a quantized model can
  match FP16 perplexity yet regress on MMLU/GSM8K, code, or long-context. Notice why — perplexity averages
  over easy tokens, so it dilutes exactly the reasoning tokens quantization damages.

## Frontier — what to watch
- **Sub-4-bit and FP8.** The live question is *reliable low-bit quality prediction*: when does INT3/INT2 or
  FP8 hold, and can you know before you ship? Watch for eval-gated adoption, not blanket "N-bit is fine" claims.
- **Activation quantization at INT4.** Weight-only 4-bit is routine; pushing *activations* to INT4 is where
  the outlier problem bites hardest. Watch this as the next hard boundary, alongside long-context degradation.

## Tools & implementations worth reading
- **AutoGPTQ / AutoAWQ / bitsandbytes** — the reference implementations of the three canon methods. Reading
  AutoAWQ's scale-search is the fastest way to turn the AWQ paper into a mental model of real code.
- **llama.cpp / GGUF (k-quants) and TensorRT-LLM** — the deployment-side of the story: k-quant mixed-bit
  schemes and per-channel/group scales in the format the local-inference world actually ships.

## How to stay current on this topic
- Follow the **AutoGPTQ / AutoAWQ / llama.cpp / TensorRT-LLM** repos and release notes — new bit-widths and
  k-quant schemes land in code before they land in papers.
- Track **NeurIPS/ICML/MLSys** for the next low-bit method; read new results through the outlier lens the
  canon papers set up (GPTQ → LLM.int8() → SmoothQuant → AWQ).
- When a new quantization technique appears, ask the three canon questions: *what does it trade (quality vs.
  footprint/bandwidth), what regime does it win in, and what eval — not just perplexity — proves it?*
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
