# Quantization — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
quantization from someone who *ships* it at the frontier: the current research edge, and the operational
signals you watch when a quantized model is live.

## The quantization-formats-quality frontier

The settled core is worth stating plainly so the frontier is legible against it: **AWQ and GPTQ are the
default 4-bit weight-only methods**, shipped as AutoAWQ and AutoGPTQ, and they are the practical baseline
for INT4 serving. GPTQ is calibration-based layerwise reconstruction using approximate Hessian
information; AWQ is its activation-aware successor, protecting the salient weight channels tied to large
activations. When someone says "we quantized to 4-bit," this is what they mean, and it is not the
frontier — it is the floor.

The frontier is what is *not* yet settled, and three lines are where the work is actually moving.

- **Sub-4-bit and FP8.** Weight-only INT4 is routine, so the race is to go lower (INT3/INT2) and to
  exploit **FP8** on new hardware, which gives *weights and activations* an 8-bit float dynamic range
  rather than integer levels. FP8 matters because floating-point spends its bits on range, which is
  exactly what activation outliers stress. The open question is not "can you make the bytes smaller" —
  you always can — but *when does the smaller format still hold quality*, which the next bullet names.

- **Activation quantization and SmoothQuant.** Weights are **static** and tolerate low bits well;
  **activations are dynamic and carry outlier features** (LLM.int8() named this enemy), so pushing
  activations to INT8 — let alone INT4 — is where quality collapses without care. **SmoothQuant** is the
  load-bearing idea: it *migrates* the quantization difficulty from activations into the weights via a
  per-channel smoothing transform, so both can go INT8. The mental model to carry: outliers are not
  destroyed, they are *moved* to the tensor that tolerates them better. Activation-INT4 is the next hard
  boundary precisely because there is no free tensor left to move the difficulty onto.

- **Reliable low-bit quality prediction.** The deepest open problem is not any single method but the
  inability to *predict* whether a given model at a given bit-width will hold quality before you spend the
  compute to quantize and evaluate it. Today the honest answer is empirical: you quantize, you run a real
  eval, you decide. The frontier goal is to know in advance which layers, tasks, and bit-widths are safe —
  and until that exists, blanket "N-bit is fine" claims are the tell of someone who has not shipped one.

The reason to track this line specifically: all three attack the same wall — bits bought back vs. quality
risked — from different angles (*smaller format*, *harder target*, *better prediction*). An expert can say
which one a given deployment is actually blocked on.

## Operating quantization in production

When a quantized model is live, you do not watch "quantization" — you watch a handful of signals that tell
you whether the footprint win was worth the quality you spent, and whether a regression is about to ship.

- **Perplexity vs. task-eval gap.** The single most important operational number is the *divergence*
  between perplexity and real task evals. Perplexity is an averaged next-token loss that dilutes the
  reasoning tokens quantization damages, so a quantized model can match FP16 perplexity while regressing on
  MMLU/GSM8K, code, or long-context. A small perplexity delta with a large task-eval delta is not a
  contradiction — it is the *expected* signature of low-bit damage, and it is why perplexity alone is never
  the gate.

- **Per-task quality delta after quantizing.** Measure quality per task against the **FP16 baseline**, not
  as one aggregate. Low-bit error is not uniform: reasoning, code, and long-context drop first while
  short-prompt tasks look fine. Tracking the delta per task is what turns "it seems okay" into a decision
  you can defend, and it locates *which* capability to protect (raise bits, per-group scales, protect that
  layer) if the delta is too large.

- **Throughput and memory win.** The whole point is the footprint and bandwidth you bought: the ~2x
  (INT8) or ~4x (INT4) weight-memory cut, and — because decode streams weights out of memory — the
  throughput and latency it unlocks. This is the *benefit* side of the ledger, and it is only meaningful
  read against the quality delta above. A big memory win with an unacceptable task delta is a bad trade,
  not a good one.

- **Eval-gate pass rate.** The operational discipline is a **CI eval gate**: the quantized build must pass
  the real task suite against the FP16 baseline before it ships. The pass rate of that gate over time is
  your leading indicator — a gate that starts failing on a task you did not watch before is exactly the
  silent regression the whole workflow exists to catch.

The operational stance in one line: **gate on the per-task eval delta against the FP16 baseline, read the
throughput and memory win against that delta, and never let a flat perplexity number stand in for either.**
