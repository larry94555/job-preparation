"""Reference solution: the deploy gate."""


def gate(results, min_pass_rate) -> bool:
    return results["pass_rate"] >= min_pass_rate
