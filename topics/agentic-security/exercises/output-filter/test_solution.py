"""Tests for filter_output. Run: python test_solution.py"""

from solution import filter_output


def test_blocked_tool_is_rejected():
    for tool in ("send_email", "charge_payment", "delete"):
        out = filter_output({"tool": tool, "args": {}})
        assert out == {"allowed": False, "reason": "blocked_tool"}, (tool, out)


def test_allowed_tool_passes():
    out = filter_output({"tool": "search_docs", "query": "hello"})
    assert out == {"allowed": True}, out


def test_another_allowed_tool_passes():
    out = filter_output({"tool": "get_weather", "city": "Paris"})
    assert out == {"allowed": True}, out


test_blocked_tool_is_rejected()
test_allowed_tool_passes()
test_another_allowed_tool_passes()
print("ALL PASS")
