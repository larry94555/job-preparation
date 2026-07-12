"""Tests for safe_call. Run: python test_solution.py"""

from solution import safe_call


def make_registry(ran):
    return {
        "add": {
            "handler": lambda a: (ran.__setitem__("add", ran.get("add", 0) + 1), a["x"] + a["y"])[1],
            "validate": lambda a: isinstance(a.get("x"), int) and isinstance(a.get("y"), int),
        },
        "echo": {
            "handler": lambda a: (ran.__setitem__("echo", ran.get("echo", 0) + 1), a)[1],
            "validate": None,
        },
    }


def test_unknown_tool_returns_structured_error():
    ran = {}
    out = safe_call(make_registry(ran), "nope", {})
    assert out == {"ok": False, "error": "unknown_tool"}, out


def test_unknown_tool_does_not_raise():
    ran = {}
    try:
        safe_call(make_registry(ran), "missing", {"x": 1})
    except Exception as e:  # noqa: BLE001
        raise AssertionError(f"unknown tool must not raise, got {e!r}")


def test_invalid_args_rejected_before_handler():
    ran = {}
    out = safe_call(make_registry(ran), "add", {"x": "nope", "y": 2})
    assert out == {"ok": False, "error": "invalid_args"}, out
    assert "add" not in ran, "handler must not run on invalid args"


def test_valid_call_runs_and_returns_value():
    ran = {}
    out = safe_call(make_registry(ran), "add", {"x": 2, "y": 3})
    assert out == {"ok": True, "value": 5}, out
    assert ran.get("add") == 1, ran


def test_tool_without_validator_runs():
    ran = {}
    out = safe_call(make_registry(ran), "echo", {"a": 1})
    assert out == {"ok": True, "value": {"a": 1}}, out
    assert ran.get("echo") == 1, ran


test_unknown_tool_returns_structured_error()
test_unknown_tool_does_not_raise()
test_invalid_args_rejected_before_handler()
test_valid_call_runs_and_returns_value()
test_tool_without_validator_runs()
print("ALL PASS")
