"""Estimate the dollar cost of one model call.

Implement estimate_cost(input_tokens, output_tokens, price_per_1k_in, price_per_1k_out):
  - input tokens are billed at price_per_1k_in per 1000 tokens
  - output tokens are billed at price_per_1k_out per 1000 tokens
  - return the summed cost in dollars, rounded to 6 decimal places
  - zero tokens must return 0.0
"""


def estimate_cost(input_tokens, output_tokens, price_per_1k_in, price_per_1k_out) -> float:
    raise NotImplementedError
