"""Tests for compress_history. Run: python test_solution.py"""

from solution import compress_history, count_tokens


def total(messages):
    return sum(count_tokens(m["content"]) for m in messages)


def fake_summarize(old_messages):
    """Deterministic fake: a fixed 3-word summary regardless of input length."""
    return "summary of decisions"


def msg(role, content):
    return {"role": role, "content": content}


def test_under_budget_returned_unchanged():
    history = [msg("user", "hi there"), msg("assistant", "hello back")]
    out = compress_history(history, 100, fake_summarize)
    assert out == history, out


def test_compresses_when_over_budget():
    # 5 messages, 4 words each = 20 tokens; budget 12 forces compression.
    history = [msg("user", f"word word word m{i}") for i in range(5)]
    assert total(history) == 20, total(history)
    out = compress_history(history, 12, fake_summarize)
    assert total(out) <= 12, (total(out), out)
    # First message is the injected summary.
    assert out[0]["role"] == "system", out
    assert out[0]["content"] == "summary of decisions", out


def test_keeps_recent_messages_intact():
    history = [msg("user", f"aaaa bbbb cccc dddd e{i}") for i in range(6)]
    out = compress_history(history, 15, fake_summarize)
    assert total(out) <= 15, (total(out), out)
    # The newest original message must survive verbatim as the last item.
    assert out[-1] == history[-1], (out[-1], history[-1])
    # Exactly one summary message, at the front.
    summaries = [m for m in out if m["content"] == "summary of decisions"]
    assert len(summaries) == 1, out
    assert out[0]["content"] == "summary of decisions", out


def test_exactly_at_budget_unchanged():
    history = [msg("user", "one two"), msg("user", "three four")]  # 4 tokens
    out = compress_history(history, 4, fake_summarize)
    assert out == history, out


test_under_budget_returned_unchanged()
test_compresses_when_over_budget()
test_keeps_recent_messages_intact()
test_exactly_at_budget_unchanged()
print("ALL PASS")
