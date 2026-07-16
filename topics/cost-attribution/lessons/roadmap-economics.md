# Cost attribution — unit economics roadmap

## Roadmap: unit economics and hidden costs

**What this section covers.** The honest unit metric — cost per *successful* task — the hidden costs it
exposes, and how you build the rollup that computes it from labeled per-call records.

```mermaid
flowchart LR
    A["All spend: successes + retries + abandonment"] --> B["Group by feature, divide by successes"]
    B --> C["Cost per successful task"]
    C --> D["Judge features on marginal, not blended"]
```

**The ideas you'll meet:**

- **Cost per successful task** — total spend divided by outcomes that actually succeeded; the headline unit-economics number.
- **Marginal vs blended** — the incremental cost a feature adds per task vs. the smeared average across all features.
- **Hidden costs** — retries, abandonment, and over-retrieval: the gap between a happy-path estimate and the real bill.
- **Cost rollup** — grouping labeled records by dimension and summing cost against success counts.
- **Zero-success guard** — a bucket with no successes has no cost-per-success: return `null`, never `NaN`.

**Why it matters.** Dividing by requests flatters you and hides waste; dividing by successes ties spend
to delivered value and is the number every margin and pricing decision actually rests on.
