"""Tests for revise_until_approved. Run: python test_solution.py"""

from solution import revise_until_approved


def approve_on_nth(n):
    """Critic approves on its nth review; rejects before that."""
    state = {"reviews": 0}

    def critic(draft):
        state["reviews"] += 1
        if state["reviews"] >= n:
            return {"approved": True, "issues": []}
        return {"approved": False, "issues": [f"issue-{state['reviews']}"]}

    return critic


def never_approve():
    def critic(draft):
        return {"approved": False, "issues": ["nope"]}

    return critic


def make_revise(calls):
    def revise(draft, issues):
        calls.append(issues)
        return draft + "+"

    return revise


def test_approved_on_second_try():
    calls = []
    out = revise_until_approved("draft", approve_on_nth(2), make_revise(calls), max_tries=3)
    assert out["approved"] is True, out
    assert out["tries"] == 2, out
    # one rejection -> revised once
    assert out["content"] == "draft+", out
    assert len(calls) == 1, calls


def test_never_approved_returns_false_at_max_tries():
    calls = []
    out = revise_until_approved("draft", never_approve(), make_revise(calls), max_tries=3)
    assert out["approved"] is False, out
    assert out["tries"] == 3, out
    # rejected on every one of the max_tries reviews -> revised max_tries times
    assert len(calls) == 3, calls
    assert out["content"] == "draft+++", out


def test_approved_immediately_tries_one():
    calls = []
    out = revise_until_approved("draft", approve_on_nth(1), make_revise(calls), max_tries=3)
    assert out["approved"] is True, out
    assert out["tries"] == 1, out
    assert out["content"] == "draft", out
    assert len(calls) == 0, calls


test_approved_on_second_try()
test_never_approved_returns_false_at_max_tries()
test_approved_immediately_tries_one()
print("ALL PASS")
