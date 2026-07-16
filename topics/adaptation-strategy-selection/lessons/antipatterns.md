# Adaptation strategy — when each is the wrong tool

## When each is the wrong tool

The interview signal isn't naming the right tool — it's spotting when a *popular* choice is the wrong
one.

- **Fine-tuning for volatile facts.** Prices, inventory, this week's policy — bake them into weights
  and they go stale instantly, and every update needs another training run. Freshness is a *retrieval*
  problem, not a training one; use RAG.
- **RAG to fix formatting.** If the model won't follow your output format, adding more documents to
  context won't help. Formatting is *behavior*; retrieval supplies *knowledge*. Fix it with better
  prompting or fine-tuning.

Both mistakes come from the same confusion: treating a behavior problem as a knowledge problem, or
vice versa.

## Over-adapting and premature commitment

Two more antipatterns are about *timing and proportion*:

- **Over-adapting** — investing in a heavier method when a lighter one already meets the requirement.
  Fine-tuning something that a good prompt or a little retrieval already handles buys you cost and
  rigidity for no gain.
- **Premature fine-tuning** — training before you have a stable, validated target behavior. You freeze
  effort into weights before you know what "good" looks like, and lock yourself into a slow
  data-collection-plus-retraining loop. Discover the target cheaply with prompting/RAG first.
- **Premature distillation** — distilling before behavior is validated just mass-produces an
  unvalidated behavior: the student faithfully copies the teacher's flaws too. Validate first, then
  distill for cheaper serving.

Spotting these is what reads as senior in an interview and design review: each antipattern passes a demo and then goes stale, over-spends, or locks in a slow retraining loop under real traffic.
