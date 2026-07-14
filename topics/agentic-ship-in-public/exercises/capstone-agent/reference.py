"""Reference solution: the capstone agent (tool calling + bounded loop + validation + trace)."""


def _is_empty(observation) -> bool:
    return observation is None or observation in ("", [], {}, ())


def run_capstone(client, task, tools, max_steps=8) -> dict:
    messages = [{"role": "user", "content": task}]
    trace = []
    for step in range(max_steps):
        out = client.step(messages)
        if out.kind == "final":
            return {"answer": out.answer, "steps": step + 1, "trace": trace}

        observation = tools[out.tool](out.tool_input)
        if _is_empty(observation):
            trace.append({"tool": out.tool, "ok": False})
            note = f"error: tool {out.tool} returned no usable observation"
        else:
            trace.append({"tool": out.tool, "ok": True})
            note = observation
        messages.append({"role": "user", "content": str(note)})

    return {"answer": None, "steps": max_steps, "stopped": "step_limit", "trace": trace}
