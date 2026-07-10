# Cost attribution — drivers and the wrong granularity

## What actually drives cost

An LLM call's cost is not a single number on a pricing page. It is driven by several things at once:

- **Input tokens** — everything you send: system prompt, retrieved context, tool schemas, history.
- **Output tokens** — everything the model generates, usually priced higher than input.
- **Model tier** — which model, at which per-token price.
- **Multipliers** — **retries** after bad output, extra **tool calls** and round-trips, and whether
  **prompt caching** was hit or missed.

The same "one request" from a user can quietly become several billed calls once retrieval, tools, and
retries are counted. Estimating from the happy-path prompt alone always undershoots.

## Why per-model is the wrong granularity

The instinct is to open a dashboard that shows spend **per model**. That number tells you *what* you
spent, but not *where value or waste accrues*. A per-model total aggregates every use of that model —
across every feature, every workflow, every tenant — into one figure.

So when leadership says "cut spend," per-model cost gives you nowhere to aim. You can't see that one
feature's over-retrieval is half the bill, or that a single tenant's workflow is running away. To
optimize cost you have to attribute it to the **dimensions the business can act on**, not the model
that happened to serve it.
