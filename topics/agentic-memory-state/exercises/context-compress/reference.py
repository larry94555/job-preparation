"""Reference solution: compress a conversation history under a token budget."""


def count_tokens(text):
    """Token proxy: number of whitespace-separated words."""
    return len(text.split())


def _total(messages):
    return sum(count_tokens(m["content"]) for m in messages)


def compress_history(messages, token_budget, summarize):
    messages = list(messages)

    # Already fits: nothing to compress.
    if _total(messages) <= token_budget:
        return messages

    # Peel the oldest messages into `old` until the summary of `old` plus the
    # kept recent messages fits under the budget. Keep at least the newest one.
    # `split` is the index where the kept-recent tail begins.
    for split in range(1, len(messages)):
        old = messages[:split]
        recent = messages[split:]
        summary_msg = {"role": "system", "content": summarize(old)}
        if count_tokens(summary_msg["content"]) + _total(recent) <= token_budget:
            return [summary_msg] + recent

    # Fallback: summarize everything but the last message.
    old = messages[:-1]
    recent = messages[-1:]
    summary_msg = {"role": "system", "content": summarize(old)}
    return [summary_msg] + recent
