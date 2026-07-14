"""Reference solution: fit a message history under a token budget."""


def fit_messages(messages, max_tokens, count_tokens) -> list:
    if not messages:
        return []

    # A leading system message (if present) is always kept and counts first.
    system = None
    rest = messages
    if messages[0].get("role") == "system":
        system = messages[0]
        rest = messages[1:]

    used = count_tokens(system) if system is not None else 0

    # Walk the rest newest-first, keeping each message that still fits.
    kept_rest = []
    for msg in reversed(rest):
        cost = count_tokens(msg)
        if used + cost <= max_tokens:
            used += cost
            kept_rest.append(msg)
        else:
            # Oldest non-system messages are dropped first; once one doesn't
            # fit, everything older than it is dropped too.
            break

    kept_rest.reverse()  # back to original order

    # Assemble in original order: system (if kept) then the recent tail.
    result = []
    if system is not None:
        result.append(system)
    result.extend(kept_rest)
    return result
