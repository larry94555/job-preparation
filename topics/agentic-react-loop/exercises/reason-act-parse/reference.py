"""Reference solution: parse a ReAct step block."""


def _field(text, prefix):
    """Return the stripped value after `prefix` on its line, or None if absent."""
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith(prefix):
            return stripped[len(prefix):].strip()
    return None


def parse_react(text) -> dict:
    thought = _field(text, "Thought:")
    action = _field(text, "Action:")            # "Action Input:" does not start with "Action:"
    action_input = _field(text, "Action Input:")
    if action is None:
        # A final, thought-only step: no action to take.
        return {"thought": thought, "action": None, "action_input": None}
    return {"thought": thought, "action": action, "action_input": action_input}
