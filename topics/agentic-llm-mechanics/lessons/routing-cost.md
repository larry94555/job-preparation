# LLM fundamentals for agents — routing tasks to the cheapest capable model

## Not every task needs the best model

The most capable model is also the most **expensive** and the **slowest**. Yet a large share of an
agent's work — classifying a ticket, extracting a field, writing a one-line summary — is narrow,
high-volume, and forgiving, and a small fast model handles it correctly. Sending *everything* to the top
tier means overpaying (and waiting) for work a cheaper model does fine. **Routing** is the discipline of
sending each task to the cheapest tier that can still do it.

You decide the tier by task difficulty. Simple, well-scoped tasks (classify / extract / summarize) go to
the **cheap** tier; medium tasks (draft / analyze) to a **balanced** tier; hard multi-step reasoning or
architecture decisions — where a weaker model's small errors compound into a wrong answer — to the
**best** tier. A minimal router is just a mapping:

```python
TIERS = {"classify": "cheap", "extract": "cheap", "summarize": "cheap",
         "draft": "balanced", "analyze": "balanced",
         "reason": "best", "architecture": "best"}

def route(task):
    return TIERS.get(task, "balanced")   # unknown → safe middle default
```

The `model-router` exercise builds exactly this. Note the fallback: an *unknown* task routes to the
**balanced** middle, not the cheapest — you don't want to send something you can't classify to the
weakest model. See [model-routing-fallback](../model-routing-fallback/topic.yaml).

## Think like a shopkeeper

Routing is a **cost-per-task** decision, so it pairs with measuring cost. A shopkeeper doesn't send every
errand to the most expensive courier; they match the courier to the job and watch the bill. Same here:
estimate the cost of a task (input + output tokens × the tier's per-token price) and pick the cheapest
tier that clears the quality bar.

```python
def cheapest_ok(task, tiers, price):
    tier = route(task)
    return tier, price[tier]   # cost falls out of the routing choice
```

The `cost-estimator` exercise computes that per-call dollar figure. Together, routing + cost estimation
let you attribute spend and prove that the cheap tier is carrying the volume while the expensive tier is
reserved for the tasks that need it. See [cost-attribution](../cost-attribution/topic.yaml).
