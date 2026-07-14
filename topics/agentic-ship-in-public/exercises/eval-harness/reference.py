"""Reference solution: the eval harness (measurement layer)."""


def run_evals(agent, cases, judge) -> dict:
    total = len(cases)
    passed = 0
    for case in cases:
        out = agent(case["input"])
        if judge(case["input"], out):
            passed += 1
    pass_rate = passed / total if total else 0.0
    return {"pass_rate": pass_rate, "passed": passed, "total": total}
