"""Reference solution: run an eval suite and report pass-rate, avg score, and failures."""


def run_suite(agent, cases, judge) -> dict:
    if not cases:
        return {"pass_rate": 0.0, "avg_score": 0.0, "failed": []}

    results = []
    for case in cases:
        output = agent(case["input"])
        results.append((case, judge(case, output)))

    passed = [c for c, r in results if r["passed"]]
    total_score = sum(r["score"] for _, r in results)

    return {
        "pass_rate": len(passed) / len(cases),
        "avg_score": total_score / len(cases),
        "failed": [c["input"] for c, r in results if not r["passed"]],
    }
