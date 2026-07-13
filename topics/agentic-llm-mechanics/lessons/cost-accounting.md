# LLM fundamentals for agents — cost accounting per run

## Cost per run is a sum over calls

Treating the model as a component means you can put a dollar figure on it. The cost of a single call is
just its tokens priced by the tier: input tokens at the tier's input price and output tokens at its
output price — **separately**, because providers almost always price the two differently (output usually
costs more). The cost of a whole agent **run** is the sum of that figure over every call the run makes:

```python
def run_cost(calls, price_in_per_1k, price_out_per_1k):
    return sum(c.in_tokens / 1000 * price_in_per_1k
               + c.out_tokens / 1000 * price_out_per_1k
               for c in calls)
```

This one number — **cost per run** — is what lets you attribute spend to a step, compare tiers, and
justify a routing change with evidence instead of a hunch. The `cost-estimator` exercise computes the
per-call piece; summing it across the run gives you the total. See
[cost-attribution](../cost-attribution/topic.yaml).

## Why the growing history dominates the bill

The subtlety that trips people up: an agent **re-sends its accumulated context on every call**. Turn one
sends a short prompt; turn ten sends the system prompt plus nine turns of history plus tool outputs. So
the *input* token count climbs call after call, and the later calls — not the first ones — carry the
largest input cost. A ten-call run costs far more than the naive "ten small prompts" intuition, because
each call is bigger than the last.

Two levers follow directly. First, **trim the context budget**: keeping the system prompt and the recent
turns while dropping the stale middle cuts the input tokens re-sent every call, which cuts both cost and
latency. Second, **route the high-volume step to a cheaper tier** once cost-per-run shows it is the
driver — but only after checking the cheap tier still clears the quality bar, and keeping an escalation
path for the low-confidence tail. Cost accounting is what makes both decisions evidence-based rather than
guesswork. See [inference-stack-tradeoffs](../inference-stack-tradeoffs/topic.yaml).
