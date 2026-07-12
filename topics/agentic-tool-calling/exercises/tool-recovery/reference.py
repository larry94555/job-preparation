"""Reference solution: recover from bad tool calls."""


def safe_call(registry, name, args) -> dict:
    tool = registry.get(name)
    if tool is None:
        return {"ok": False, "error": "unknown_tool"}

    validate = tool.get("validate")
    if validate is not None and not validate(args):
        return {"ok": False, "error": "invalid_args"}

    return {"ok": True, "value": tool["handler"](args)}
