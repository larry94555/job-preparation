# Adaptation strategy — the frontier and operating it in production

The deep-dive gave you the four levers and the decision axes. This lesson drills the two things that
separate someone who *knows* the levers from someone who *runs* adaptation at the frontier: where the
open research problems actually are, and the operational signals you watch once a strategy is live.

## The adaptation-strategy-selection frontier

Three open problems are where adaptation work is actually moving right now.

- **Continual and online adaptation as data drifts.** Every lever you learned assumes a *snapshot*: you
  fine-tune on today's data, distill today's teacher, index today's documents. The frontier question is
  how to keep a deployed system correct as facts and distributions shift over time **without a full
  retraining run every cycle**. RAG already handles fact drift cheaply — you update the index, not the
  weights — which is exactly why it is the default lever for volatile knowledge. But *behavior* drift
  (new formats, new tasks, a shifting distribution the fine-tune no longer covers) has no equally cheap
  fix: re-fine-tuning is a data-collection-plus-training loop, and a distilled student is frozen at
  distill time. The open work is adapting the weight-based levers incrementally as the world moves,
  rather than periodically freezing another monolithic snapshot.

- **Principled method combination (RAG + PEFT + distillation).** The SOTA design is rarely one lever —
  it is a *pipeline*: RAG for fresh, citable knowledge; PEFT/LoRA for durable behavior; distillation to
  serve the result cheaply. The frontier is combining these *principled by requirement* rather than by
  habit — each layer chosen because a specific need (freshness, behavior, cost) demands it, and each
  gated by its own eval. The load-bearing caution is that combination is not free: **every added lever
  multiplies the eval surface.** RAG + PEFT means two independent places quality can regress — a
  retrieval miss and a behavior regression look different and need different evals — so a hybrid buys
  capability at the cost of more silent-regression surface to guard.

- **When to fine-tune vs. prompt/RAG as an open decision problem.** The escalation ladder
  (prompt → RAG → fine-tune → distill) is good *guidance*, but the boundary between "a prompt/RAG can
  still carry this" and "this now needs weights" is not a solved formula — it is judgment. The frontier
  is making that call **defensible from a scenario's requirements** (Is the gap knowledge or behavior?
  How volatile? Does it need attribution? What's the volume?) instead of vibes-driven. Getting it wrong
  in either direction is costly: fine-tune too early and you freeze effort into weights before the
  target is validated; reach for it too late and you pay a token tax on every call for behavior a small
  adapter would have made durable.

Why track this line specifically: all three attack the same weakness — that the classic levers assume a
static world and a single monolithic choice. An expert can say *which* open problem a given system is
actually hitting, and reach for the lever combination that targets it.

## Operating adaptation in production

Once a strategy is live, you do not watch "adaptation" — you watch a handful of signals that tell you
whether each lever is still earning its place and where the next regression will come from.

- **Per-strategy quality, cost, and latency, tracked separately.** A hybrid has more than one lever, so
  a single end-to-end number hides which one moved. Track them per lever: retrieval quality (did the
  right documents come back?) apart from generation/behavior quality; RAG's per-query token cost and
  retrieval latency apart from the fine-tuned model's short-prompt serving cost. When end-to-end quality
  drops, the per-strategy split is what tells you whether it was a retrieval miss or a behavior
  regression — the two failures need different fixes.

- **Staleness of fine-tuned (and distilled) knowledge.** Anything baked into weights was correct *at
  train time* and drifts silently afterward — the canonical antipattern of fine-tuning volatile facts is
  exactly this failure. Watch for answers that were right when you trained and are now wrong; a rising
  rate of stale-fact errors is the signal to move that knowledge into retrieval, not to retrain again.

- **Retrieval freshness (index age / TTL).** RAG is only as current as its index. Track how old the
  indexed content is and whether the freshness TTL is being met; a retrieval layer that is silently
  serving month-old documents recreates the staleness problem RAG was supposed to solve. Index age and
  reindex lag are the leading indicators here.

- **Re-train / re-distill cadence signals.** The decision to retrain a fine-tune or re-distill a student
  should be driven by measured drift, not the calendar. The signals that trigger it: rising behavior
  regression on the eval set, growing distance between production traffic and the training distribution,
  and the staleness rate above. Retraining on a fixed schedule wastes compute when nothing drifted and
  is too slow when something did.

The operating discipline: **evaluate every lever on its own axis, treat weight-frozen knowledge as
perishable, keep the index fresh, and let measured drift — not the calendar — trigger the next
retrain.**
