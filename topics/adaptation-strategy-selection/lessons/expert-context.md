# Expert context: papers, frontier & interview

## Papers people and the frontier

Adaptation-strategy selection is really a question of *which lever to pull* to make a base model fit
your task — and the canon is a short list of the ideas behind those levers that you should be able to
name and attribute in an interview:

- **RAG** — retrieval-augmented generation (**Lewis et al., 2020**) — established the pattern of
  fetching relevant knowledge at query time and placing it in context, so the model can answer over
  fresh, private, or citable facts **without changing the weights**. This is the lever for *volatile
  knowledge*.
- **LoRA** — low-rank adaptation (**Hu et al., Microsoft, 2021**) — is the canonical **parameter-
  efficient fine-tuning (PEFT)** method: instead of updating all weights, you train small low-rank
  adapter matrices, drastically cutting the cost of durably changing *behavior/style/format*. PEFT is
  what made fine-tuning practical for most teams.
- **Knowledge distillation** — formalized by **Hinton et al. (2015)** — trains a smaller *student* to
  reproduce a known-good *teacher*'s behavior, giving you a cheaper, lower-latency model to deploy.

Tools you'd reference: **PEFT/LoRA libraries, RAG frameworks, distillation tooling**, and the choice
between **open vs. frontier models**. Current SOTA is not a single method but a **hybrid**: RAG for
volatile facts, PEFT for durable behavior, and distillation for cheap deployment — often stacked
together. Open problems experts still argue about: **principled selection** (which method for which
need), **combining methods** cleanly, and **continual / online adaptation** as data drifts.

## Interviewing on adaptation strategy selection

What a strong interviewer probes here is *judgment*, not recall — can you match a need to the right
lever, and just as importantly, can you name the **wrong** tool for a scenario?

- Can you **name the wrong tool** for a scenario? The classic tell: **fine-tuning for volatile facts**.
  Baking constantly-changing knowledge (prices, inventory, today's headlines) into weights means answers
  go stale the moment training finishes, and every update demands another training run. Freshness is a
  **retrieval** problem — reach for RAG, not fine-tuning.
- Can you **defend a combination** rather than treating the methods as rivals? Strong candidates
  sequence them: start with **prompting / in-context learning**, add **RAG** for knowledge, and reserve
  **fine-tuning (then distillation)** for behavior the lighter methods can't deliver.

**Red flags** that sink candidates: **fine-tuning for changing facts** (the canonical wrong tool),
using **RAG to fix formatting or style** (that's a behavior problem — fine-tune), and **premature
fine-tuning or distillation** before prompting and retrieval have been tried. Asked to choose an
adaptation strategy, lead with the decision axes — **freshness, behavior change, cost, latency,
attribution** — map each need to a lever, and name **RAG (Lewis et al.), LoRA/PEFT (Hu et al.), and
distillation (Hinton et al.)** as the prior art. Knowing the canon *and* knowing what each method is
*not* for is what reads as senior.
