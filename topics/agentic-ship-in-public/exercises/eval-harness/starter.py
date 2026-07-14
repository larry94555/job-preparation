"""The measurement layer: run an agent over eval cases and report a pass rate.

Implement run_evals(agent, cases, judge):
  - for each case: out = agent(case["input"]); passed = judge(case["input"], out)
  - return {"pass_rate": float, "passed": n, "total": m}
      n = number of cases the judge passed
      m = total number of cases
      pass_rate = n / m  (use 0.0 when there are no cases)
"""


def run_evals(agent, cases, judge) -> dict:
    raise NotImplementedError
