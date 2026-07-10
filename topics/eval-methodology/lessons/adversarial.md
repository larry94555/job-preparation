# Evals — adversarial & edge-case tests

## Adversarial and edge-case tests

A golden set samples the **happy path** — the typical inputs you expect. But production failures
rarely cluster there; they cluster in the edges. A system can score 95% on its golden set and still
break constantly in the wild because the golden set never exercised the inputs that break it.

An **adversarial** (or **red-team**) suite closes that gap. It deliberately targets the places a
system is most likely to fail:

- **Prompt injection** and jailbreak attempts.
- **Ambiguous or contradictory** inputs.
- **Boundary and edge cases** — empty input, huge input, unusual formats, unexpected languages.
- **Known failure modes** you've already seen in production.

## Building and gating on the suite

You build an adversarial suite the same way you earn scar tissue: mostly from **real production
failures** plus targeted red-team probes. Every time the system breaks, the failing input becomes a
new case, so the suite grows to cover the shape of your actual risk.

Track a **catch-rate** — the fraction of adversarial cases the system now handles — and run the
suite **alongside** the golden set in the same regression gate. The golden set proves you didn't
regress on normal usage; the adversarial suite proves you didn't regress on the dangerous edges.
Neither replaces the other.
