# Reading list & staying current — adaptation-strategy-selection

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **RAG — Lewis et al. (2020).** The paper that established query-time retrieval to inject knowledge
  *without changing weights*. Notice that facts live in an external index you can update independently of
  the model — this is why RAG is the default lever for volatile facts and attribution.
- **LoRA — Hu et al. (Microsoft, 2021).** The canonical parameter-efficient fine-tuning (PEFT) method:
  adapt behavior by training a tiny set of low-rank weights instead of the whole model. Notice it changes
  *weights* (behavior/style), not the freshness of facts — the opposite lever from RAG.
- **Knowledge distillation — Hinton et al. (2015).** Copy a large teacher's behavior into a small student
  for cheap deployment. Notice the student inherits the teacher's *behavior at distill time*, so what you
  bake in is frozen — the third distinct lever, aimed at cost/latency, not knowledge.

## Go deeper (mechanism & the selection axes)
- **The knowledge-vs-behavior distinction.** The one-line mental model underneath every choice: RAG/ICL
  move *knowledge* (what the model knows), fine-tuning moves *behavior* (how it acts), distillation moves
  *the deployed model* (how cheaply it runs). Notice that naming the axis usually names the lever.
- **The four-lever tradeoff table (ICL/RAG vs. PEFT vs. distillation).** Read each lever by what it *buys*
  and *costs* across freshness, cost, latency, and attribution. Notice RAG wins freshness and attribution;
  PEFT wins behavior; distillation wins cheap deploy — and that hybrids stack their eval surfaces.
- **Prompting → RAG → fine-tune → distill as an escalation ladder.** Notice the discipline of reaching for
  the *lightest* lever that meets the requirement first; jumping straight to fine-tuning or distillation is
  premature optimization, not sophistication.

## Frontier — what to watch
- **Principled strategy selection.** The open problem: choosing the right lever (or combination) from a
  scenario's requirements rather than by habit. Watch for decision frameworks that make the choice
  defensible instead of vibes-driven.
- **Combining methods (hybrids).** RAG + PEFT + distillation stacked in one pipeline. Notice the cost —
  each added lever multiplies the eval surface (two-plus places quality can silently regress).
- **Continual / online adaptation as data drifts.** The frontier question of updating a deployed system as
  facts and distributions shift over time. Watch for approaches that adapt without full retraining.

## The antipattern worth memorizing
- **Fine-tuning for volatile facts.** The canonical *wrong tool*: baking changing facts into weights, which
  go stale the moment the facts do, with no attribution and an expensive re-train to fix. Notice the fix is
  RAG (fresh, attributable, index-updatable) — and the mirror antipattern of using RAG to fix *formatting*
  when the real need is behavior (PEFT).

## Tools & implementations worth reading
- **PEFT/LoRA libraries, RAG frameworks, and distillation tooling.** Reading a LoRA adapter config or a RAG
  retrieval pipeline is the fastest way to turn these papers into a mental model of real code — and to feel
  where the open-vs-frontier model choice actually bites on cost and control.

## How to stay current on this topic
- When a new adaptation technique appears, ask the three canon questions: *what does it change (knowledge /
  behavior / deployed model), what regime does it win in, and what does it trade?* — the same lens the
  decision-axes lesson uses.
- Track the RAG, PEFT/LoRA, and distillation tooling ecosystems — new levers and hybrids land in libraries
  and framework releases before they are named in surveys.
- Watch for work on the open problems: principled selection, method combination, and continual/online
  adaptation — these are where the frontier moves.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **LoRA became *the* default PEFT method.** Hu et al. (2021 preprint, arXiv:2106.09685; ICLR 2022) is now
  the canonical parameter-efficient fine-tuning technique — reference implementations, QLoRA, and adapter
  ecosystems made "fine-tune = train a LoRA" the practitioner default, exactly as the topic frames it.
- **RAG became the default lever for volatile facts and attribution.** Lewis et al. (2020) aged into an
  entire product category; the parametric-vs-nonparametric-memory framing held, and RAG (not fine-tuning)
  is the accepted answer for freshness and citations across the industry.
- **The escalation ladder (prompt → RAG → fine-tune → distill) held up as guidance.** "Reach for the lightest
  lever first" remains sound advice, and "fine-tuning for volatile facts" is still the textbook antipattern —
  neither aged out as the tooling matured.
- **Distillation aged into a mainstream deployment step, and hybrids became normal.** Hinton et al. (2015)
  soft-target distillation underpins today's small/"mini" production models, and stacked RAG+PEFT+distillation
  pipelines are common — validating the open-problem note that each added lever multiplies the eval surface.

