"""Sanitize untrusted content by scrubbing common prompt-injection patterns.

Implement sanitize(content): replace each of these patterns (CASE-INSENSITIVE)
with the literal marker "[removed]":
  - ignore (all )?(previous )?instructions
  - disregard (all )?(previous )?instructions
  - new instructions:
  - system prompt:
  - you are now

An adversarial "IGNORE ALL PREVIOUS INSTRUCTIONS" must come back containing "[removed]".
Ordinary benign text must be returned unchanged. Use the `re` module.
"""

import re


def sanitize(content: str) -> str:
    raise NotImplementedError
