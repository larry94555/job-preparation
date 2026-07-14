"""Redact PII before it enters the model's context.

Implement redact(text): use the `re` module to
  - replace email addresses with "[EMAIL]"
  - replace long secret-like tokens with "[REDACTED]":
      * an "sk-" prefix followed by 16 or more characters, OR
      * any run of 20 or more alphanumeric characters (a long key)

An email address and an API key must both be redacted; ordinary short words
must be left untouched.
"""

import re


def redact(text: str) -> str:
    raise NotImplementedError
