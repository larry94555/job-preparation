# Evaluation & quality — the deploy gate

## Never deploy below the bar

A number you look at but never act on protects nothing. The eval suite earns its keep only when it is
wired into a **deploy gate**: an automated check that blocks the release if the suite's pass-rate is
below a fixed **threshold**. The rule is blunt on purpose — **never deploy below the bar**. If the bar is
0.9 and the run comes back at 0.87, the deploy does not ship, no matter how good the change *feels*.

```python
def gate(results, min_pass_rate):
    return results["pass_rate"] >= min_pass_rate   # >= so hitting the bar exactly passes

if not gate(run_suite(agent, cases, judge), min_pass_rate=0.9):
    raise SystemExit("eval gate failed — not deploying")
```

The **threshold** is a policy decision, set once and enforced automatically. Two details matter. The
comparison is `>=`, so an agent that lands *exactly* on the bar passes — the bar is the minimum
acceptable, not something you must beat. And the gate must be *mechanical*: a human who can wave a
borderline run through "just this once" is not a gate, because the exception always gets taken under
deadline pressure. The gate's job is to make "we'll fix the evals later" impossible.

This is the same shape as a test suite blocking a merge on red, specialized to agent quality: the eval
suite produces a pass-rate, the gate compares it to a threshold, and a run below the bar fails the build.
This repo does exactly this — `npm run eval-gate` runs the meta-eval judge against the calibration sets
and fails CI when the judge's agreement drops below its threshold, so a change that breaks grading cannot
merge. A gate you can bypass, a threshold nobody enforces, or a suite you run only after an incident are
all the same anti-pattern: measuring without gating. Cross-reference
[eval-methodology](../../eval-methodology/) for how thresholds are chosen.
