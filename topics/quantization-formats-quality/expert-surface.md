# Expert Surface — quantization-formats-quality

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain what quantization is and why footprint/bandwidth (not accuracy) is the point — `lessons/formats.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: bit-width, scale, zero-point, granularity, per-tensor/per-channel, outlier features — `lessons/formats.md`, `questions/missing-term.yaml`, `questions/free-entry.yaml`.
- ✅ **[L2]** Distinguish the numeric formats (FP16/BF16/FP8/INT8/INT4) and how each spends its bits — `lessons/formats.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** GPTQ (Frantar et al. 2022) as calibration-based Hessian-guided layerwise weight quant — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** AWQ (Lin et al. 2023) — protecting salient channels tied to large activations — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** SmoothQuant (Xiao et al.) and LLM.int8() (Dettmers et al. 2022) as the activation-outlier prior art — `lessons/expert-context.md`, `lessons/methods-and-quality.md`.
- ✅ **[L4]** The sub-4-bit / FP8 frontier and reliable low-bit quality prediction as open problems (FP8 float range for activations, SmoothQuant activation migration, AWQ/GPTQ as the settled 4-bit floor) — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five quantization levers (bit-width, what-you-quantize, method, granularity, verification) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a quantization design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a quantization plan and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Weights vs. activations vs. KV cache: which is static/dynamic and why each tolerates a different bit-width — `lessons/what-to-quantize.md`, `questions/essay.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Derive footprint/bandwidth savings from bit-width (FP16→INT8 ~2x, →INT4 ~4x) — `lessons/formats.md`, `questions/free-entry.yaml`.
- ✅ **[L3]** Diagnose a quality regression to low-bit damage and pick a mitigation (bit-width, per-group scales, protect layers, weight-only) — `lessons/methods-and-quality.md`, `lessons/deep-dive.md`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement per-tensor asymmetric uint8 quantize/dequantize (scale, zero-point, clamp, constant-tensor guard) — `exercises/int8-quant`, `questions/code.yaml`.
- ✅ **[L3]** Reason about the reconstruction-error/half-a-step tradeoff and the clamp/divide-by-zero pitfalls — `lessons/build-int8-quant.md`, `questions/build.yaml`.
- ✅ **[L4]** Implement per-channel/per-group scales (the granularity that rescues outlier channels) — `exercises/per-channel-quant`, `questions/frontier-ops.yaml`; taught in `lessons/formats.md` and `lessons/build-int8-quant.md`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** AutoGPTQ / AutoAWQ / bitsandbytes / llama.cpp GGUF k-quants / TensorRT-LLM as the quant toolchain — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- ✅ **[L3]** Verification-as-operations: eval-gating on real task evals (MMLU/GSM8K, code, long-context) vs. perplexity against an FP16 baseline, and reading the throughput/memory win against the per-task delta — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the quantization frontier moves (FP8, activation-INT4, long-context degradation) and how to track it — `reading-list.md` (curated sources + a staying-current workflow), pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (AWQ vs. GPTQ attribution, why perplexity hides task loss, INT4-unchecked) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a quantization plan under questioning (lead weight-only 4-bit, name the eval) — `questions/deep-dive.yaml` design-review essay, `questions/essay.yaml`.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) ≈ **100%**.
The sub-4-bit/FP8 frontier drill and the eval-gating operational drill are covered by `lessons/frontier-ops.md`,
and the per-channel/per-group quantization coding exercise (`exercises/per-channel-quant`) closes the last D5 partial.

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
