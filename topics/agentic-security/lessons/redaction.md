# Security & guardrails — redact PII and filter output

## Redact PII and filter output

Two guardrails sit on the *data flowing through* the agent rather than on the code it runs: **redact** the
sensitive data going *in*, and **filter** the actions coming *out*.

**Redaction** protects the context. Before untrusted or user text enters the model's window, scrub the
personally identifiable information — **redact PII** like emails, phone numbers, and secret-looking tokens
(API keys, credentials) — replacing each with a neutral placeholder. Redaction shrinks the blast radius:
what never enters the context cannot be leaked by an injection, logged in plaintext, or memorized.

```python
import re

def redact(text: str) -> str:
    # emails -> [EMAIL]
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", "[EMAIL]", text)
    # secret-like tokens (sk-... keys, long alnum credentials) -> [REDACTED]
    text = re.sub(r"\bsk-[A-Za-z0-9]{16,}\b", "[REDACTED]", text)
    text = re.sub(r"\b[A-Za-z0-9]{20,}\b", "[REDACTED]", text)
    return text
```

**Output filtering** protects the world. The agent proposes an action; a filter inspects it *before* the
harness executes it and blocks anything disallowed. This is where the confused-deputy defense actually
bites: even if an injection convinces the model to call `send_email` or `charge_payment`, the output
filter refuses the action because that tool was never on the allow-list for this task.

```python
_BLOCKED = {"send_email", "charge_payment", "delete"}

def filter_output(action: dict) -> dict:
    if action.get("tool") in _BLOCKED:
        return {"allowed": False, "reason": "blocked_tool"}
    return {"allowed": True}
```

Redaction filters what goes *into* the context; output filtering gates what comes *out* as an action.
Together they bracket the model: sensitive data is stripped before it can leak, and dangerous actions are
stopped before they fire. Neither is a silver bullet — a novel PII format slips redaction, a cleverly
named tool slips a naive filter — so they layer with separation, sanitizing, and sandboxing. Build them in
from the start, not after the breach.

See also **safety-engineering** and **multi-tenant-isolation**.
