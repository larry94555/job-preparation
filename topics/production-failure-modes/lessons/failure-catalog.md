# Production failure modes — the catalog & the silent danger

## The failure catalog

An LLM system in production fails in ways a plain web service does not. The capstone catalog — drawn
from structured output, function calling, agents, and RAG — is worth memorizing:

- **Hallucinated tool call** — the model invents a function, or arguments, that don't exist in the
  tool schema.
- **Malformed output** — the model returns JSON that doesn't parse or doesn't match the schema.
- **Stale retrieval** — a RAG answer is grounded in documents that are out of date.
- **Runaway agent** — an agent loops or spends without bound, burning tokens and money.
- **Silent eval regression** — a prompt, model, or retrieval change quietly drops answer quality
  while nothing errors.

Each is a *model-layer* failure: it comes from what the model produced, not from a crashed process,
an expired certificate, or a full disk. Generic infra failures still happen, but they are not what
makes LLM systems hard.

## Why silent failures are the real danger

Split the catalog by how it announces itself. A **loud** failure throws — an exception, a non-2xx
status, a parse error. You can catch it, alert on it, and page someone. A **silent** failure returns
a confident, well-formed, *wrong* answer and a clean HTTP 200.

That is why "our error rate is near zero, so the feature is healthy" is dangerous reasoning. Error
rate only counts the loud failures. A hallucinated citation, a stale-retrieval answer, and a
post-tweak quality regression all sail past it. Nothing alerts, so the failure erodes user trust
before anyone notices.

The practical consequence: you cannot rely on runtime error dashboards alone. Catching silent
failures needs **validators** on the output and **eval monitoring** on quality — instrumentation that
inspects *what the model said*, not just whether the call returned.
