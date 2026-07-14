"""Tests for supervise. Run: python test_solution.py"""

from solution import supervise


def make_research(calls):
    def research_agent(task):
        calls.append(("research", task))
        return f"research for {task}"

    return research_agent


def make_writer(calls):
    """Writer returns a versioned draft; version = number of times it ran."""
    state = {"n": 0}

    def writer_agent(research, issues):
        state["n"] += 1
        calls.append(("write", issues))
        return f"draft-v{state['n']}"

    return writer_agent


def approve_on_nth(n):
    """Critic approves on its nth review; rejects before that."""
    state = {"reviews": 0}

    def critic_agent(content):
        state["reviews"] += 1
        if state["reviews"] >= n:
            return {"approved": True, "issues": []}
        return {"approved": False, "issues": [f"issue-{state['reviews']}"]}

    return critic_agent


def never_approve():
    def critic_agent(content):
        return {"approved": False, "issues": ["nope"]}

    return critic_agent


def test_returns_revised_content_when_critic_approves_second_review():
    calls = []
    writer = make_writer(calls)
    # critic rejects the first draft, approves the revised one.
    out = supervise(make_research(calls), writer, approve_on_nth(2), "topic", max_revisions=3)
    # writer ran once for the first draft, once for the revision -> draft-v2
    assert out == "draft-v2", out
    write_calls = [c for c in calls if c[0] == "write"]
    assert len(write_calls) == 2, write_calls
    # the revision was told the critic's issues, the first draft was not
    assert write_calls[0][1] is None, write_calls
    assert write_calls[1][1] == ["issue-1"], write_calls


def test_returns_last_content_after_max_revisions_when_never_approved():
    calls = []
    writer = make_writer(calls)
    out = supervise(make_research(calls), writer, never_approve(), "topic", max_revisions=3)
    write_calls = [c for c in calls if c[0] == "write"]
    # first draft + one revision per rejected review, capped at max_revisions
    assert len(write_calls) == 1 + 3, write_calls
    assert out == "draft-v4", out


def test_returns_first_draft_when_approved_immediately():
    calls = []
    writer = make_writer(calls)
    out = supervise(make_research(calls), writer, approve_on_nth(1), "topic", max_revisions=3)
    assert out == "draft-v1", out
    write_calls = [c for c in calls if c[0] == "write"]
    assert len(write_calls) == 1, write_calls


test_returns_revised_content_when_critic_approves_second_review()
test_returns_last_content_after_max_revisions_when_never_approved()
test_returns_first_draft_when_approved_immediately()
print("ALL PASS")
