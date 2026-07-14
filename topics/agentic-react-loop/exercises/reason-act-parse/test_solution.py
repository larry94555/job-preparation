"""Tests for parse_react. Run: python test_solution.py"""

from solution import parse_react

FULL = """Thought: I need the current price, so I'll look it up.
Action: get_price
Action Input: {"ticker": "ACME"}"""

FINAL_ONLY = """Thought: I have the price already; I can answer now."""


def test_full_block_parses_all_fields():
    out = parse_react(FULL)
    assert out == {
        "thought": "I need the current price, so I'll look it up.",
        "action": "get_price",
        "action_input": '{"ticker": "ACME"}',
    }, out


def test_thought_only_final_step():
    out = parse_react(FINAL_ONLY)
    assert out == {
        "thought": "I have the price already; I can answer now.",
        "action": None,
        "action_input": None,
    }, out


def test_action_input_not_confused_with_action():
    # The Action line must capture only the tool name, not the Action Input line.
    out = parse_react(FULL)
    assert out["action"] == "get_price", out
    assert out["action_input"] == '{"ticker": "ACME"}', out


test_full_block_parses_all_fields()
test_thought_only_final_step()
test_action_input_not_confused_with_action()
print("ALL PASS")
