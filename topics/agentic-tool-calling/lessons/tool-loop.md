# Tool calling & structured outputs — the agent loop

## The agent loop

Tool calling is not a single request/response — it is a **loop**. You call the model; if it wants a
tool, you run the tool, feed the result back, and call the model again. You keep going until the model
finishes. The signal that drives the loop is `stop_reason`:

- `stop_reason == "tool_use"` — the model paused to request a tool. It hands you a `tool_name` and a
  `tool_input`. The loop must **continue**: run the tool and call the model again.
- `stop_reason == "end_turn"` — the model is done. Its `.text` is the final answer to return.

```python
def run_agent(client, user_message, tools):
    messages = [{"role": "user", "content": user_message}]
    for _ in range(10):                      # cap steps so a bad model can't spin forever
        resp = client.create(messages)
        if resp.stop_reason == "tool_use":
            result = tools[resp.tool_name](resp.tool_input)
            messages.append(tool_result_message(resp, result))
            continue
        return resp.text                     # end_turn
    raise RuntimeError("step cap exceeded")
```

Two details matter. First, `tool_use` means *continue*, not *stop* — a common mistake is to treat the
tool-use turn as the final answer. Second, always **cap the number of steps**. A model that keeps
requesting tools (or loops between two of them) will otherwise run forever; a hard cap turns that into
a bounded, observable failure.

## Feeding results back

Running the tool is only half a turn. The model cannot see the result unless you put it back into the
conversation, and there is a specific shape for that. Tool output is returned as a **user-role message**
whose content is a **tool_result block** — not a system prompt, and not an assistant message.

```python
def tool_result_message(resp, result):
    return {
        "role": "user",
        "content": [{
            "type": "tool_result",
            "tool_use_id": resp.tool_use_id,   # ties the result to the call that produced it
            "content": str(result),
        }],
    }
```

The `tool_use_id` is what links a `tool_result` back to the exact `tool_use` request that asked for it
— essential when the model fired several tool calls in one turn and each result must land against the
right call. Append that message, call the model again, and it now reasons with the real result in hand.
That feedback step is what makes the loop an agent rather than a one-shot function call.
