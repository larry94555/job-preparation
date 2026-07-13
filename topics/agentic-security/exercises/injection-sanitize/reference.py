"""Reference solution: sanitize untrusted content against prompt injection."""

import re

_PATTERNS = [
    r"ignore (all )?(previous )?instructions",
    r"disregard (all )?(previous )?instructions",
    r"new instructions:",
    r"system prompt:",
    r"you are now",
]


def sanitize(content: str) -> str:
    out = content
    for pat in _PATTERNS:
        out = re.sub(pat, "[removed]", out, flags=re.IGNORECASE)
    return out
