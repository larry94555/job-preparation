# Function-calling reliability — tools are APIs

## Tools are APIs with a contract

When you expose a tool to a model, you are publishing an **API**. The tool definition is not a hint
or a suggestion — it is a **contract**: a typed schema of arguments, a defined behavior, and a
defined set of errors. The model is one more untrusted caller of that API.

Thinking of it this way changes how you build:

- The **schema** (JSON Schema, Zod, Pydantic) names every argument, its type, and whether it is
  required. That schema is the contract the caller must satisfy.
- The **behavior** is what the tool does when called with valid arguments.
- The **errors** are the defined responses when the contract is violated.

Because the model is an untrusted caller, the harness treats every tool call the way a good web API
treats every request: nothing is executed until it has been checked against the contract.

## Read vs. write: the side-effect class

Not all tools carry the same risk. Classifying each tool by its **side-effect class** — read-only
vs. write/mutating — lets the harness apply the right policy:

- **Reads** (search, fetch, list) have no lasting effect. They can be auto-executed and retried
  freely.
- **Writes** (create, charge, delete) change the world. They deserve confirmation gates,
  idempotency protection, and stricter validation.

Read/write separation is the foundation the rest of reliability builds on: you can only decide "is
this safe to auto-run?" or "is this safe to retry?" once you know a tool's side-effect class.
