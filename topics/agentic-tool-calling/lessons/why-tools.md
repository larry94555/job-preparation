# Tool calling & structured outputs — why a talking model is not an agent

## Why a model that talks is not an agent

A language model, on its own, only produces text. You send it a prompt, it streams back tokens, and
that is the entire interaction. It can *describe* how to book a flight, *explain* what SQL to run, or
*say* it has updated a record — but it cannot touch a calendar, a database, or a file. A model that
can only talk is a **chatbot**.

An **agent** is a model wired into a loop where it can request **tools** — functions the surrounding
program runs on its behalf — and then read the results. The moment the model can call `search_flights`
or `write_file` and *see what came back*, it stops narrating actions and starts taking them. The model
supplies the intent; the harness supplies the hands.

The distinction is not the size of the model or the length of the context. It is whether there is a
harness around the model that (1) offers it tools, (2) executes the ones it asks for, and (3) feeds the
results back so the next turn is grounded in what actually happened.

## Tools turn words into actions

Concretely, a tool is a function plus a description the model can see. When the model decides it needs
one, it does not run the function itself — it *emits a request* to call it, and the turn ends with a
special signal. In the Anthropic API that signal is `stop_reason == "tool_use"`: the model has paused
to ask for a tool rather than finishing its answer.

```python
resp = client.create(messages)
if resp.stop_reason == "tool_use":
    result = tools[resp.tool_name](resp.tool_input)   # the harness acts
    # ...feed result back and call the model again
```

That single branch is the seam between talking and acting. The model chose a tool and its arguments;
the harness is the untrusting executor that decides whether and how to run it. Everything else in this
topic — typed schemas, the loop, structured outputs, recovery — is about making that seam reliable.
