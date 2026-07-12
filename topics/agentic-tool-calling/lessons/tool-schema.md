# Tool calling & structured outputs — tools are typed contracts

## Tools are typed contracts

When you expose a tool to a model, you are publishing an **API**, and the model is one more untrusted
caller of it. The tool's `input_schema` is the **contract**: it names every argument, its type, and
whether it is required. The model proposes arguments against that contract; the harness validates them
before anything runs.

A typed schema is what lets the harness **validate and coerce** the model's arguments before executing
the tool. A free-form "just pass a string and the model will format it right" design pushes every
failure into runtime as undefined behavior. A typed contract turns a malformed call into a *rejectable
error* the model can be told about — the difference between a bug and a recoverable step.

Because the model is untrusted, treat every tool call the way a good web API treats every request:
nothing is executed until it has been checked against the schema. The schema is not documentation the
model reads for inspiration — it is the gate the arguments must pass.

## The anatomy of a tool schema

A tool definition has a name, a human-readable description (so the model knows *when* to use it), and
an `input_schema` written as JSON Schema:

```python
{
  "name": "get_weather",
  "description": "Look up the current weather for a city.",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": {"type": "string"},
      "units": {"type": "string", "enum": ["c", "f"]},
    },
    "required": ["city"],
  },
}
```

The `properties` block defines each argument's type; the `required` list names the arguments the model
**must** supply. If the model emits a call with `city` missing, it fails validation and the harness
rejects it rather than running `get_weather` with a hole in its input. The `required` list is how the
contract distinguishes mandatory arguments from optional ones — and it is the first thing to check when
a call comes back malformed.
