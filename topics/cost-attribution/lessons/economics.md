# Cost attribution — unit economics and hidden costs

## Cost per successful task

Per-call cost is a misleading unit. A user's single **successful** outcome often takes several calls,
a couple of retries, and sometimes an abandoned attempt before it lands. If you divide spend by API
calls, you flatter yourself; the real question is what it costs to **deliver value**.

**Cost per successful task** charges all the failed, retried, and abandoned spend to the tasks that
actually **succeeded**. It ties cost directly to outcomes and exposes waste that per-call metrics hide.
It is the headline **unit-economics** number, alongside cost per tenant and margin.

When you evaluate a *new* feature, watch the **marginal** cost it adds per task — the incremental
spend it causes — not the **blended** average across all features, which smears expensive and cheap
work together and hides the real decision.

## Hidden costs

The gap between a happy-path estimate and the real bill is made of **hidden costs**:

- **Retries** — regenerating after malformed or failed output multiplies token spend on the same task
  with no extra successful outcome.
- **Abandonment** — failed or abandoned sessions burn tokens that never produce value.
- **Over-retrieval** — stuffing the context with more chunks than the task needs means paying for
  input tokens that add nothing, on **every** call.

You surface these the same way you attribute anything: **tag and record every call** — including
retries and async work — and measure **cost per successful task**, so wasted spend shows up against
real outcomes instead of hiding in a blended average.
