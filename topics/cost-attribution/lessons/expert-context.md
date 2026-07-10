# Expert context: papers, frontier & interview

## Papers people and the frontier

Cost attribution is a **practice-led** topic more than a paper-led one: the canon is a short piece of
research plus a body of production/FinOps practice you should be able to name and reason about in an
interview.

- **FrugalGPT** (Chen et al., 2023) is the reference paper. It popularized using **LLM cascades** —
  try a cheap model first and escalate to an expensive one only when needed — to cut cost while
  holding quality. It anchors the idea that spend is a design variable, not a fixed line item.
- **FinOps-for-LLM practice** is the rest of the story. Borrowing the cloud-FinOps discipline, teams
  treat LLM spend as something you **tag, attribute, and optimize continuously** rather than read off
  a single invoice. This is where most of the field's know-how lives — in operational practice, not
  papers.

Tools you'd reference: **Helicone** and **Langfuse** (per-request cost tracking and rollups) and
**LiteLLM** (a gateway that records per-call cost), plus custom aggregators teams build in-house.
Current SOTA is **tagged attribution** — rolling cost up by feature, workflow, and tenant — combined
with **cost-per-successful-task** unit economics rather than cost-per-model or cost-per-call. Open
problems experts still argue about: attributing **shared, cached, and async** cost fairly; **predicting
per-feature cost** before you ship; and **fair per-tenant billing** when work is pooled.

## Interviewing on cost attribution

What a strong interviewer probes here:

- Do you know **why per-model cost is the wrong granularity** — that a per-model total aggregates every
  use of a model and hides *which feature, workflow, or tenant* is actually spending the money?
- Can you **attribute across features and tenants** by attaching attribution tags at the entry point
  and propagating them through downstream (including retried and async) calls?
- Do you reason in **cost per successful task**, so retries, abandoned runs, and over-retrieval show up
  against real outcomes instead of hiding in a per-call average?

**Red flags** that sink candidates: reporting **cost-per-model only**, **ignoring failed or abandoned
runs**, and treating **over-retrieval / oversized context** as free. Asked to design cost attribution,
lead with **tagged attribution across feature/workflow/tenant**, then **cost per successful task** as
the unit metric, and name **FrugalGPT** (cascades) plus **Helicone/LiteLLM/Langfuse** as the practical
tooling. Showing you know the canon *and* can reason about attribution granularity is what reads as
senior.
