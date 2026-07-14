"""Reference solution: redact PII (emails and secret-like tokens)."""

import re


def redact(text: str) -> str:
    # Emails first, so an address is not partially consumed by the token rules.
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", "[EMAIL]", text)
    # sk-style keys: an explicit provider prefix with a long body.
    text = re.sub(r"\bsk-[A-Za-z0-9]{16,}\b", "[REDACTED]", text)
    # Any other long alphanumeric run (20+ chars) is treated as a secret.
    text = re.sub(r"\b[A-Za-z0-9]{20,}\b", "[REDACTED]", text)
    return text
