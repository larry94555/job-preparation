# Adaptation strategy — architecture, tradeoffs, and reviewing a design

You already know the four levers — in-context learning, RAG, fine-tuning, and distillation — and the
axes that pick between them. This lesson zooms out to the **design space**: the moves a systems
engineer actually makes when adapting a model, what each one trades away, and how to judge someone
else's adaptation design the way an interviewer or a staff engineer in a design review would.

## The adaptation-strategy-selection design space

Every adaptation decision is really a decision about **where a capability lives** — in the prompt, in
a retrieval index, in the weights, or in which model you deploy — and what that placement costs you in
freshness, cost, latency, and attribution. There are four independent levers, and real systems combine
them rather than picking one:

- **In-context learning (ICL)** — steer the model at inference time with instructions and few-shot
  examples. Nothing permanent changes; it is the cheapest, fastest-to-iterate lever, bounded by the
  context window. Reach for it first to *discover* the target behavior before you freeze anything.
- **RAG (Lewis et al., 2020)** — fetch relevant documents at query time and place them in context.
  This is the lever for **knowledge**, especially *fresh*, *private*, and *citable* knowledge. You
  update the index, not the weights, so answers stay current without retraining.
- **Fine-tuning / PEFT (LoRA, Hu et al., 2021)** — update the weights on your examples to durably
  change **behavior**: format, style, tone, task reliability. LoRA trains small low-rank adapters
  instead of all weights, which is what made this lever practical for most teams. It is a poor place
  to store facts that change.
- **Distillation (Hinton et al., 2015)** — train a smaller **student** to reproduce a known-good
  **teacher's** behavior, cutting deployment cost and latency. It is a *deployment* move: it copies
  behavior you already trust into a cheaper package.

The one-line mental model: **ICL and RAG change what's in the prompt; fine-tuning changes the weights;
distillation changes which model you deploy.** RAG is about *knowledge* (what the model can see);
fine-tuning is about *behavior* (how the model acts). Confusing the two is the root of most bad
adaptation designs — you cannot retrieve your way to a new behavior, and you cannot fine-tune your way
to always-current facts.

## A tradeoff table for adaptation-strategy-selection

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| In-context learning | Cheapest, fastest iteration; zero training; no infra | Bounded by context window; pays tokens every call; behavior not durable | Discovering the target, low volume, behavior still unstable |
| RAG | Fresh, private, citable knowledge without retraining | Retrieval latency + larger context per query; index/embedding infra to maintain | Knowledge is volatile, private, or must be attributed to a source |
| Fine-tuning / PEFT (LoRA) | Durable behavior/format/style baked into weights; short prompts | Front-loaded training cost; data collection + retraining loop; stale for volatile facts | Behavior the lighter methods can't reliably enforce, and the target is validated |
| Distillation | Cheaper, lower-latency model to deploy | Up-front distillation cost; student inherits teacher's flaws | Behavior is already validated and you want it cheaper to serve |
| Hybrid (RAG + PEFT [+ distill]) | Knowledge *and* behavior together; cheap serving | Most moving parts; two eval surfaces; more failure modes | Production systems that need current facts *and* a persistent behavior |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just fine-tune it" without naming the retraining loop and the
freshness cost is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any adaptation design is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** start with prompting / in-context learning, add **RAG** the
  moment the gap is *knowledge*, and reach for fine-tuning only when *behavior* the cheaper methods
  can't deliver is the blocker. This "lightest tool first" sequence is a perfectly good default and
  covers most real tasks.
- **SOTA (frontier, worth reaching for under real pressure):** a **hybrid** — RAG for volatile facts,
  PEFT/LoRA for durable behavior, and distillation for cheap deployment — often stacked together, with
  each layer gated by its own eval. The frontier is treating adaptation as a *pipeline of levers*
  chosen per-need, plus continual/online adaptation as the data drifts, rather than one monolithic
  training run.
- **Antipattern (looks fine, fails in production):** **fine-tuning for volatile facts** (prices,
  inventory, this week's policy) — they go stale in the weights the instant training finishes; **RAG
  to fix formatting** — retrieval supplies knowledge, not behavior; **over-adapting** — fine-tuning
  what a prompt or a little retrieval already handles, buying cost and rigidity for no gain; and
  **premature fine-tuning or distillation** — freezing effort into weights (or mass-producing a
  student) before the target behavior is validated. Each of these passes a demo and degrades, goes
  stale, or locks in a slow retraining loop under real traffic.

## Scaling, performance, and the token budget

The numbers that make the tradeoffs concrete:

- **RAG trades tokens for freshness.** Every query pays retrieval latency plus a larger context —
  more tokens in, higher per-call cost and latency — but the index updates without a training run. As
  volume grows, that per-query token tax is the thing to watch; as *change rate* grows, RAG is the
  only lever that keeps pace without constant retraining.
- **Fine-tuning front-loads cost, then serves cheap.** You pay training once and keep prompts short
  at serve time, so it amortizes well at high volume — *if* the target behavior is stable. If it
  isn't, every iteration is another data-collection-plus-retraining cycle, and that loop, not the GPU
  bill, is the real cost.
- **Distillation trades an up-front cost for ongoing savings.** A smaller student cuts per-token
  latency and serving cost, which pays back only at enough volume to amortize the distillation run —
  and only if the teacher's behavior was worth copying.
- **Hybrids multiply eval surface.** RAG + PEFT means two places quality can regress (retrieval and
  behavior) and two evals to maintain. The scaling cost of the SOTA design is *operational*, not just
  compute: more levers means more silent-regression surface to guard.

## Reviewing an adaptation-strategy-selection design

When you are handed an adaptation design to critique — in a review or an interview — walk the same
checklist:

1. **Knowledge or behavior?** Is the requirement really about *what the model knows* (→ RAG) or *how
   it acts* (→ fine-tuning)? A design that answers a behavior problem with retrieval, or a knowledge
   problem with training, is misclassified at the root.
2. **Is anything volatile being baked into weights?** Fine-tuning on facts that change (prices,
   inventory, policy) is the canonical wrong tool — flag it immediately and move it to retrieval.
3. **Did they start light?** Was prompting / RAG exhausted before committing to training? Jumping
   straight to fine-tuning or distillation is over-adapting or premature commitment.
4. **Is the target validated before it's frozen?** Fine-tuning or distilling before behavior is
   stable locks a slow retraining loop, and distillation faithfully copies the teacher's flaws.
5. **What's the eval and freshness story?** A real design names the eval gate for each lever and how
   the index stays current — never "it just works."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy picks one lever by fashion; a prototype matches lever to need; a demo sequences them
lightest-first; a production-ready design also validates behavior before freezing it, keeps volatile
facts in retrieval, and gates each lever behind its own eval.
