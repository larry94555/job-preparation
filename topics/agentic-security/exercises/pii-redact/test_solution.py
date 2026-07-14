"""Tests for redact. Run: python test_solution.py"""

from solution import redact


def test_email_and_api_key_redacted():
    text = "Contact alice@example.com with key sk-ABCDEFGHIJKLMNOP1234 to proceed."
    out = redact(text)
    assert "[EMAIL]" in out, out
    assert "[REDACTED]" in out, out
    assert "alice@example.com" not in out, out
    assert "sk-ABCDEFGHIJKLMNOP1234" not in out, out


def test_long_alnum_key_redacted():
    out = redact("token ABCDEFGHIJKLMNOPQRSTUVWX here")  # 24 chars
    assert "[REDACTED]" in out, out


def test_ordinary_words_untouched():
    benign = "The quick brown fox jumped over the lazy dog at noon."
    assert redact(benign) == benign, redact(benign)


def test_short_alnum_not_redacted():
    # A short code is not a secret-like token.
    benign = "Order id AB12 shipped today."
    assert redact(benign) == benign, redact(benign)


test_email_and_api_key_redacted()
test_long_alnum_key_redacted()
test_ordinary_words_untouched()
test_short_alnum_not_redacted()
print("ALL PASS")
