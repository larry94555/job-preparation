"""Compress a conversation history so it fits under a token budget.

A message is a dict: {"role": str, "content": str}. Token cost is proxied by the
number of whitespace-separated words in "content" (use `count_tokens`, provided).

Implement:
  compress_history(messages, token_budget, summarize) -> list

Behavior:
  - If the total token cost of `messages` is already <= token_budget, return them
    unchanged (as a list).
  - Otherwise, take the OLDEST messages and replace them with a SINGLE summary
    message produced by the injected callable `summarize(old_messages) -> str`.
    The summary message is {"role": "system", "content": <summary text>}.
  - Keep the most-recent messages intact. Summarize just enough of the oldest
    messages that the result (summary message + kept recent messages) is
    <= token_budget.
  - The summary message counts toward the budget too.
  - You may assume a valid compression exists (the budget is large enough to hold
    the summary plus at least the newest message).

Determinism: no randomness, no I/O. `summarize` is injected so the test can pass a
fake, predictable summarizer.
"""


def count_tokens(text):
    """Token proxy: number of whitespace-separated words."""
    return len(text.split())


def compress_history(messages, token_budget, summarize):
    raise NotImplementedError
