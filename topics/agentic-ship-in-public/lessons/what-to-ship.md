# Ship in public — what to ship

## Proof beats a resume

A resume line that says "AI engineering" or "LLM agents" proves nothing — everyone writing a resume in
2026 lists the same words. What a hiring manager actually wants is **evidence that you can build a
working agent and reason about it**. The fastest way to lose a screen is to talk about agents you have
only read about; the fastest way to pass one is to point at a real agent you shipped and walk through
how it works.

So the capstone is not another tutorial clone. It is **your own** agent, designed by you, small enough
to finish but real enough to break. The goal of this whole track was never to memorize the tool loop —
it was to reach the point where you can assemble tool calling ([agentic-tool-calling](../agentic-tool-calling/)),
a bounded reason–act loop ([agentic-react-loop](../agentic-react-loop/)), and an eval suite
([agentic-evaluation](../agentic-evaluation/)) into one thing that runs and that you can defend.

Proof is a portfolio: something a stranger can open, read, and run. A **portfolio** of one real,
working agent — with the artifacts that let someone verify it — outweighs a page of buzzwords. The rest
of this lesson is about which artifacts make that proof legible.

## What to ship

A shippable capstone is a **real agent** plus three artifacts that let someone else trust it without
watching over your shoulder. Ship all four together:

- A **real agent** — not a chatbot wrapper, but a bounded loop that calls tools, reads observations, and
  produces a result. It should do one useful task end to end.
- A **README** — the document that explains *what the agent does, how it is built, and one architecture
  decision you made and why*. The README is where you show judgment, not just code. A repo with no
  README is unreadable proof.
- An **eval suite** — a small set of test cases with a judge, so you can say "it passes N of M" instead
  of "it seemed to work." Evals are what separate a demo that got lucky once from an agent you measured.
- A **demo** — a short recording (a Loom-style clip) or a runnable script that shows the agent working
  on a real input. A **demo** turns a claim into something a reviewer can see in ninety seconds.

The README carries your architecture; the eval suite carries your evidence; the demo carries the "it
actually runs." Miss any one and the proof has a hole: no README and it is unreadable, no evals and it is
unmeasured, no demo and it is unseen. Ship the agent *with* all three — that combination is the portfolio
piece that gets you the interview.
