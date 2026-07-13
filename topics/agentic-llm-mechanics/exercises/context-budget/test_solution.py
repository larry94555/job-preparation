"""Tests for fit_messages. Run: python test_solution.py"""

from solution import fit_messages


def count_tokens(msg):
    # Fake, deterministic counter: one token per character of content.
    return len(msg["content"])


def msg(role, content):
    return {"role": role, "content": content}


def test_all_fit_under_budget_keeps_everything():
    messages = [
        msg("system", "sys"),          # 3
        msg("user", "hi"),             # 2
        msg("assistant", "yo"),        # 2
    ]                                  # total 7
    out = fit_messages(messages, 100, count_tokens)
    assert out == messages, out


def test_over_budget_keeps_system_and_recent_drops_oldest():
    messages = [
        msg("system", "SYS"),          # 3  (always kept)
        msg("user", "aaaa"),           # 4  (oldest non-system -> dropped)
        msg("user", "bbbb"),           # 4  (dropped)
        msg("assistant", "cc"),        # 2  (kept)
        msg("user", "dd"),             # 2  (kept, most recent)
    ]
    # Budget 8: system(3) + dd(2) + cc(2) = 7 <= 8; adding bbbb(4) -> 11 > 8, stop.
    out = fit_messages(messages, 8, count_tokens)
    assert out == [messages[0], messages[3], messages[4]], out
    # original order preserved and system first
    assert out[0]["role"] == "system", out


def test_no_system_message_keeps_recent_only():
    messages = [
        msg("user", "aaaaa"),          # 5 (dropped)
        msg("assistant", "bb"),        # 2 (kept)
        msg("user", "cc"),             # 2 (kept)
    ]
    out = fit_messages(messages, 5, count_tokens)
    assert out == [messages[1], messages[2]], out


def test_empty_returns_empty():
    assert fit_messages([], 10, count_tokens) == []


test_all_fit_under_budget_keeps_everything()
test_over_budget_keeps_system_and_recent_drops_oldest()
test_no_system_message_keeps_recent_only()
test_empty_returns_empty()
print("ALL PASS")
