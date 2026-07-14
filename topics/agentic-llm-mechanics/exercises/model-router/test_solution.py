"""Tests for route_to_model. Run: python test_solution.py"""

from solution import route_to_model

# (task, expected tier). complexity is a hint; the named mapping decides.
CASES = [
    ("classify", "cheap"),
    ("summarize", "cheap"),
    ("extract", "cheap"),
    ("draft", "balanced"),
    ("analyze", "balanced"),
    ("reason", "best"),
    ("architecture", "best"),
]


def test_named_tasks_route_to_expected_tier():
    for task, expected in CASES:
        out = route_to_model(task, "medium")
        assert out == expected, f"{task} -> {out}, expected {expected}"


def test_unknown_task_defaults_to_balanced():
    out = route_to_model("translate-into-elvish", "medium")
    assert out == "balanced", out


def test_unknown_task_does_not_raise():
    try:
        route_to_model("", "low")
    except Exception as e:  # noqa: BLE001
        raise AssertionError(f"unknown task must not raise, got {e!r}")


test_named_tasks_route_to_expected_tier()
test_unknown_task_defaults_to_balanced()
test_unknown_task_does_not_raise()
print("ALL PASS")
