"""Tests for portfolio_ready. Run: python test_solution.py"""

from solution import portfolio_ready


def test_complete_project_is_ready():
    project = {
        "agent": "run_capstone(...)",
        "readme": "# My agent\n...",
        "evals": ["case1", "case2"],
        "demo": "https://loom.example/abc",
    }
    out = portfolio_ready(project)
    assert out == {"ready": True, "missing": []}, out


def test_missing_keys_listed_sorted():
    project = {"agent": "code"}  # readme, evals, demo absent
    out = portfolio_ready(project)
    assert out == {"ready": False, "missing": ["demo", "evals", "readme"]}, out


def test_empty_values_count_as_missing():
    project = {"agent": "code", "readme": "", "evals": [], "demo": None}
    out = portfolio_ready(project)
    assert out == {"ready": False, "missing": ["demo", "evals", "readme"]}, out


def test_single_missing_key():
    project = {"agent": "code", "readme": "docs", "evals": ["c"], "demo": ""}
    out = portfolio_ready(project)
    assert out == {"ready": False, "missing": ["demo"]}, out


def test_all_missing():
    out = portfolio_ready({})
    assert out == {"ready": False, "missing": ["agent", "demo", "evals", "readme"]}, out


test_complete_project_is_ready()
test_missing_keys_listed_sorted()
test_empty_values_count_as_missing()
test_single_missing_key()
test_all_missing()
print("ALL PASS")
