"""Tests for run_evals. Run: python test_solution.py"""

from solution import run_evals


def double(x):
    return x * 2


def judge_is_even(inp, out):
    return out % 2 == 0


def test_all_pass():
    cases = [{"input": 1}, {"input": 2}, {"input": 3}]
    out = run_evals(double, cases, judge_is_even)  # 2,4,6 all even
    assert out == {"pass_rate": 1.0, "passed": 3, "total": 3}, out


def test_some_fail():
    # judge passes only when output equals 4
    def agent(x):
        return x + 1

    def judge(inp, out):
        return out == 4

    cases = [{"input": 1}, {"input": 3}, {"input": 5}, {"input": 7}]  # outputs 2,4,6,8 -> one pass
    out = run_evals(agent, cases, judge)
    assert out == {"pass_rate": 0.25, "passed": 1, "total": 4}, out


def test_none_pass():
    def judge_never(inp, out):
        return False

    cases = [{"input": 1}, {"input": 2}]
    out = run_evals(double, cases, judge_never)
    assert out == {"pass_rate": 0.0, "passed": 0, "total": 2}, out


def test_empty_cases_no_divide_by_zero():
    out = run_evals(double, [], judge_is_even)
    assert out == {"pass_rate": 0.0, "passed": 0, "total": 0}, out


def test_judge_sees_input_and_output():
    seen = []

    def agent(x):
        return x

    def judge(inp, out):
        seen.append((inp, out))
        return inp == out

    cases = [{"input": 5}]
    out = run_evals(agent, cases, judge)
    assert seen == [(5, 5)], seen
    assert out == {"pass_rate": 1.0, "passed": 1, "total": 1}, out


test_all_pass()
test_some_fail()
test_none_pass()
test_empty_cases_no_divide_by_zero()
test_judge_sees_input_and_output()
print("ALL PASS")
