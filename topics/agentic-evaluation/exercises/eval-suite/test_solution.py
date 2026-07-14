"""Tests for run_suite. Run: python test_solution.py"""

from solution import run_suite


def echo_agent(x):
    """Trivial deterministic agent: returns the input unchanged."""
    return x


def make_judge():
    """Stub judge: a case passes iff its expected output equals the agent output.

    Each case carries an "expected" field and a "score" the judge should report.
    """

    def judge(case, output):
        passed = output == case["expected"]
        return {"passed": passed, "score": case["score"]}

    return judge


CASES = [
    {"input": "a", "expected": "a", "score": 1.0},   # pass
    {"input": "b", "expected": "b", "score": 0.8},   # pass
    {"input": "c", "expected": "WRONG", "score": 0.2},  # fail (echo returns "c")
    {"input": "d", "expected": "WRONG", "score": 0.0},  # fail
]


def test_pass_rate_and_avg_score():
    out = run_suite(echo_agent, CASES, make_judge())
    assert out["pass_rate"] == 0.5, out            # 2 of 4 passed
    assert abs(out["avg_score"] - 0.5) < 1e-9, out  # (1.0+0.8+0.2+0.0)/4
    assert out["failed"] == ["c", "d"], out


def test_all_pass():
    cases = [
        {"input": "x", "expected": "x", "score": 1.0},
        {"input": "y", "expected": "y", "score": 1.0},
    ]
    out = run_suite(echo_agent, cases, make_judge())
    assert out["pass_rate"] == 1.0, out
    assert out["avg_score"] == 1.0, out
    assert out["failed"] == [], out


def test_all_fail_reports_every_input():
    cases = [
        {"input": "p", "expected": "no", "score": 0.1},
        {"input": "q", "expected": "no", "score": 0.3},
    ]
    out = run_suite(echo_agent, cases, make_judge())
    assert out["pass_rate"] == 0.0, out
    assert out["failed"] == ["p", "q"], out


test_pass_rate_and_avg_score()
test_all_pass()
test_all_fail_reports_every_input()
print("ALL PASS")
