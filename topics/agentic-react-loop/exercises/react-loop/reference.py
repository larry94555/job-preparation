"""Reference solution: the single-agent ReAct loop."""


def run_react(client, task, tools, max_steps=10):
    messages = [{"role": "user", "content": task}]
    log = []
    for n in range(1, max_steps + 1):
        step = client.step(messages)
        if step.kind == "final":
            log.append({"step": n, "kind": "final"})
            return {"answer": step.answer, "steps": n, "log": log}
        # kind == "action": run the tool, observe, and loop
        observation = tools[step.tool](step.tool_input)
        log.append({"step": n, "kind": "action", "tool": step.tool, "obs": observation})
        messages.append({"role": "tool", "content": observation})
    return {"answer": None, "steps": max_steps, "stopped": "step_limit", "log": log}
