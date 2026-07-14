"""Tests for validate_handoff. Run: python test_solution.py"""

from solution import validate_handoff

REJECT = {"ok": False, "error": "empty_handoff"}


def test_none_rejected():
    assert validate_handoff(None) == REJECT, validate_handoff(None)


def test_empty_string_rejected():
    assert validate_handoff("") == REJECT, validate_handoff("")


def test_empty_dict_rejected():
    assert validate_handoff({}) == REJECT, validate_handoff({})


def test_empty_list_rejected():
    assert validate_handoff([]) == REJECT, validate_handoff([])


def test_nonempty_string_passes():
    assert validate_handoff("result") == {"ok": True, "value": "result"}, validate_handoff("result")


def test_nonempty_dict_passes():
    out = validate_handoff({"a": 1})
    assert out == {"ok": True, "value": {"a": 1}}, out


def test_nonempty_list_passes():
    out = validate_handoff([1, 2])
    assert out == {"ok": True, "value": [1, 2]}, out


test_none_rejected()
test_empty_string_rejected()
test_empty_dict_rejected()
test_empty_list_rejected()
test_nonempty_string_passes()
test_nonempty_dict_passes()
test_nonempty_list_passes()
print("ALL PASS")
