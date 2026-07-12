"""Reference solution: the agent tool-use loop."""

MAX_STEPS = 10


def run_agent(client, user_message, tools):
    messages = [{"role": "user", "content": user_message}]
    for _ in range(MAX_STEPS):
        resp = client.create(messages)
        if resp.stop_reason == "tool_use":
            result = tools[resp.tool_name](resp.tool_input)
            messages.append(
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_name": resp.tool_name,
                            "content": result,
                        }
                    ],
                }
            )
            continue
        return resp.text
    raise RuntimeError("step cap exceeded")
