"""Reference solution: estimate the dollar cost of one model call."""


def estimate_cost(input_tokens, output_tokens, price_per_1k_in, price_per_1k_out) -> float:
    cost = (input_tokens / 1000) * price_per_1k_in + (output_tokens / 1000) * price_per_1k_out
    return round(cost, 6)
