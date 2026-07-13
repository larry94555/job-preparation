# Security & guardrails — sandbox untrusted code and build security in

## Sandbox untrusted code

Separating and sanitizing keep untrusted *text* from hijacking the model. The next class of risk is
untrusted *execution*: an agent that writes and runs code, or runs code fetched from elsewhere, is running
input you do not control. The rule is **sandbox untrusted code** — execute it in an isolated environment
with no access to your real filesystem, network, secrets, or host.

A **sandbox** is a confined environment where hostile code can run and fail without touching anything that
matters: a container with no credentials mounted, no outbound network, a read-only or ephemeral
filesystem, a CPU/'memory/time budget, and least-privilege everything.

```python
# Never: exec(model_written_code)      # runs with YOUR permissions — game over
# Instead: hand it to an isolated runner with no host access.
result = sandbox.run(
    code,
    network=False,          # no exfiltration path
    filesystem="ephemeral", # nothing persists, nothing real is reachable
    timeout_sec=5,          # bounded so it cannot hang or spin
)
```

Sandboxing is also a **compliance** posture, not just a technical control: isolating untrusted execution
is how you can honestly say a customer's code (or an attacker's payload) cannot reach another tenant's
data. The isolation boundary is the thing an audit points at. Treat "would I run this on my laptop as
root?" as the test — if the answer is no, it belongs in a sandbox.

## Build security in

The through-line of this whole topic is a posture: **build security in, do not bolt it on**. Separation,
sanitizing, sandboxing, redaction, and output filtering are cheap and robust when they are part of the
agent's architecture from day one, and brittle and incomplete when they are retrofitted after an incident.

- **Assume every input is hostile.** Untrusted content, tool results, and model output are all suspect by
  default — validate and constrain them at the boundary, the same discipline you apply to any untrusted
  API caller.
- **Least authority, always.** Give the agent the *minimum* tools and permissions it needs. A confused
  deputy cannot pull a lever it was never handed, so gate the dangerous tools behind explicit allow-lists.
- **Defense in depth.** No single control is trusted. Injection may slip a filter, a sandbox may have an
  edge — layering separate + sanitize + sandbox + redact + filter is what makes the *system* hard to break
  even when one layer fails.

Security bolted on after the fact leaves gaps between the layers; security built in makes those layers the
shape of the system. That is the difference between an agent that survives contact with the real world and
one that becomes the confused deputy for the first attacker who finds it.

See also **safety-engineering** and **multi-tenant-isolation**.
