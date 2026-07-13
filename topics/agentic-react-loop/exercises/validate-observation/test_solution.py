"""Tests for validate_observation. Run: python test_solution.py"""

from solution import validate_observation


def test_non_empty_dict_ok():
    obs = {"price": 41.2}
    assert validate_observation(obs) == {"ok": True, "value": obs}


def test_non_empty_string_ok():
    assert validate_observation("sunny") == {"ok": True, "value": "sunny"}


def test_none_rejected():
    assert validate_observation(None) == {"ok": False, "error": "empty_observation"}


def test_empty_string_rejected():
    assert validate_observation("") == {"ok": False, "error": "empty_observation"}


def test_empty_dict_rejected():
    assert validate_observation({}) == {"ok": False, "error": "empty_observation"}


test_non_empty_dict_ok()
test_non_empty_string_ok()
test_none_rejected()
test_empty_string_rejected()
test_empty_dict_rejected()
print("ALL PASS")
