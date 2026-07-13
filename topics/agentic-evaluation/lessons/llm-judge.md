# Evaluation & quality — measuring what you ship

## Measure what you ship

An agent that talks, calls tools, and returns an answer *looks* like it works. Whether it *actually*
works — on the hundredth task, on the awkward inputs, after the prompt change you shipped this morning —
is a different question, and you cannot answer it by eyeballing a few transcripts. **You cannot improve
what you do not measure.** The first job of agent evaluation is to turn "seems fine" into a number you
can track, compare, and gate on.

The unit of measurement is a **judgment**: given a task and the agent's output, did the output do what
the task required? For a handful of cases you can label that by hand. But hand-labeling does not scale
to the hundreds of cases a real eval suite needs, and it does not run automatically on every deploy.
You need a judge that is cheap, repeatable, and applies the *same* standard every time — so the score
means the same thing today as it did last week.

This is the seam between building an agent and *trusting* one. Everything in this topic — the judge, the
rubric, the suite, the deploy gate — exists to produce one honest number: the fraction of tasks your
agent gets right, measured the same way every time, so a regression shows up as a drop you can see.
See the core topics [eval-methodology](../../eval-methodology/) and
[retrieval-evals](../../retrieval-evals/) for the general discipline this specializes.

## Use a model as the judge

When the correct answer is not a single string you can `==` against — a summary, a plan, a multi-step
agent trajectory — you grade it with an **LLM-as-judge**: another model call whose whole job is to read
the task and the output and return a verdict. The judge is not the agent; it is a separate, evaluation-only
call with one responsibility, scoring.

```python
def judge(task, output, client):
    verdict = client.score(task, output)   # returns a JSON string: {"passed": ..., "score": ...}
    return json.loads(verdict)
```

Two rules make an LLM judge trustworthy. First, **use the best model you can afford as the judge** —
grading is often *harder* than the task, and a weak judge that mislabels outputs corrupts every number
downstream. It is worth spending more on the judge than on the agent. Second, give the judge **explicit
criteria** rather than "is this good?"; that is the next lesson. A strong model plus a precise rubric is
what turns a vibe into a measurement. This repo's own **meta-eval gate** is a worked example: it uses an
LLM judge, pinned to a fixed model and calibrated against labeled exemplars, to grade the very essays and
code you are studying now.
