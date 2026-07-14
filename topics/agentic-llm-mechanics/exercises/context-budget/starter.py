"""Fit a message history under a token budget.

Implement fit_messages(messages, max_tokens, count_tokens):
  - keep a leading system message (role == "system") if present
  - plus the MOST-RECENT messages whose combined token count (via the injected
    count_tokens(message)) fits under max_tokens
  - drop the oldest non-system messages first
  - return the kept messages in their ORIGINAL order

count_tokens is a function that takes one message and returns its token count.
"""


def fit_messages(messages, max_tokens, count_tokens) -> list:
    raise NotImplementedError
