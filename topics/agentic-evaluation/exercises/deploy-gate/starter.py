"""Implement the deploy gate.

Implement gate(results, min_pass_rate):
  results is the dict returned by an eval suite; it has a "pass_rate" key.
  Return True iff results["pass_rate"] >= min_pass_rate.

Use >= so a run landing EXACTLY on the bar passes — the threshold is the
minimum acceptable pass-rate, not something you must beat.
"""


def gate(results, min_pass_rate) -> bool:
    raise NotImplementedError
