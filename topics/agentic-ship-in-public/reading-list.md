# Reading list & staying current — agentic-ship-in-public

**Snapshot: 2026-07-12.** A curated path into the practices this capstone rests on, plus how to keep the
list current as the agentic-engineer job market moves (Goals D2/D7). Each entry says *why it matters* and
*what to notice* — read for the idea and the tradeoff, not the exact numbers. Where a year is given it is
context, not something to memorize.

## Start here (the load-bearing ideas)
- **Build in public / ship in public (the practice).** The habit of shipping work openly and narrating it
  as you go. Notice the mechanism: public, linkable artifacts argue for you in rooms you are not in, and a
  working thing beats a described thing. This is the spine of the whole topic — proof over pedigree.
- **"Proof of work over resume" for AI engineers (e.g. writing in the vein of swyx / "the rise of the AI
  engineer").** The reframing that a portfolio of shipped, working projects beats a keyword-stuffed
  resume. Notice *why*: a working agent is falsifiable evidence a reviewer can verify, while a skills list
  is an unverifiable claim.

## Go deeper (the artifacts that make an agent legible)
- **READMEs and Architecture Decision Records (ADRs).** How to document *what* a system does and *why* it
  is built that way — the "we chose X over Y because Z" record. Notice that the README is where judgment
  shows: one defended decision is worth more than a wall of code.
- **Agent evaluation write-ups (eval suites, pass rates, LLM-as-judge).** How practitioners turn "it
  works" into "it passes N of M." Notice that shipping evals is what separates a measured agent from a
  lucky demo — and that it reads as senior precisely because most portfolios skip it. (This capstone
  assembles the eval suite from `agentic-evaluation`.)
- **Demos and Loom-style recordings.** Why a ninety-second clip of the agent running beats a slide deck.
  Notice that a demo makes "it actually runs" *visible* — the artifact a reviewer can absorb fastest.

## Frontier — what to watch
- **Agent project ideas & the "portfolio agent" genre.** Collections of buildable agent tasks (research
  assistants, code-review bots, data-wrangling agents). Notice the selection criterion: pick something
  real enough to break and small enough to finish, so it produces a genuine break-and-fix to write up.
- **The agentic-engineer hiring bar (job postings, hiring threads, interview reports).** Where the "AI
  engineer" / "agent engineer" role is actually settling. Notice that the title is unstable and the bar is
  rising — from "I built an agent" to "I measured it, know where it breaks, and can defend the
  architecture."
- **The prior three topics as the capstone's inputs — [agentic-tool-calling](../agentic-tool-calling/),
  [agentic-react-loop](../agentic-react-loop/), [agentic-evaluation](../agentic-evaluation/).** Re-read
  them as the components you assemble here. Notice that the capstone is not new material — it is the
  integration test for everything the track taught.

## How to stay current on this topic
- Follow **build-in-public** practitioners and AI-engineering communities — the norms for what a strong
  agent portfolio looks like move fast and in public.
- Track **real job postings and hiring threads** for agent/AI-engineer roles, not just hype — they show
  where the differentiating bar actually sits.
- When you see a portfolio agent that lands well, ask: *what does its README defend, what do its evals
  measure, and what break-and-fix does its write-up show?* — the same lens the lessons use.
- Re-read this topic's `expert-surface.md` when the hiring frontier shifts; its 🟡/⬜ items are your next
  reads.
