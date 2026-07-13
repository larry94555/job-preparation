"""Reference solution: validate every handoff."""


def validate_handoff(output) -> dict:
    if output is None or output == "" or output == {} or output == []:
        return {"ok": False, "error": "empty_handoff"}
    return {"ok": True, "value": output}
