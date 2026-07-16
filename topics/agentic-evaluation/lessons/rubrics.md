# Evaluation & quality — scoring against explicit criteria

## Score against explicit criteria

Asking a judge "is this output good?" gets you a different answer depending on the model's mood, the
phrasing, and the day. The fix is a **rubric**: a list of explicit **criteria** the output must meet,
each judged independently, so the score is a function of the output and the criteria rather than the
judge's vibe. A rubric turns "good" into "does it hit these four named things?" — reproducible, and
defensible when someone asks *why* an output failed.

```python
CRITERIA = [
    "answers the exact question asked (not a tangent)",
    "every factual claim is correct — no fabrications",
    "cites the tool results it used",
    "is concise — no filler",
]

def score(task, output, criteria, client):
    # the judge marks each criterion true/false, then we aggregate
    return client.grade(task, output, criteria)   # -> {"passed": bool, "score": float, "reasoning": str}
```

Explicit criteria also let you separate *kinds* of failure. "Hallucinated a fact" and "answered a
different question" are both failures, but a rubric records *which* one, so a regression report tells you
what broke rather than just that the number dropped.

The second discipline is the **output format**. A judge that replies in prose ("I think this is mostly
good, though…") cannot be aggregated — you cannot average English. Require the judge to return **strict
JSON** matching a fixed schema: a boolean `passed`, a numeric `score`, and a short `reasoning` string.
Parse it and validate it (a score outside `[0, 1]` is a bug you should raise on, not silently clamp).
Strict-JSON verdicts are what let a hundred individual judgments roll up into one pass-rate. This repo's
meta-eval judge does exactly this — it emits a JSON object of per-check booleans that the engine
aggregates into a verdict — and it is calibrated against labeled exemplars so its criteria mean the same
thing on every run. See [eval-methodology](../../eval-methodology/) for the general rubric-design
discipline.

A rubric matters because it makes a verdict *reproducible and defensible* — it is the difference between a
score you can trust across runs and one that drifts with the judge's mood.
