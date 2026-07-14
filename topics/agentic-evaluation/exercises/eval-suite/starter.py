"""Implement an eval suite runner.

Implement run_suite(agent, cases, judge):
  - each case is a dict with at least an "input" key
  - for each case: output = agent(case["input"]); result = judge(case, output)
    where result is a dict with "passed" (bool) and "score" (float)
  - return:
      {
        "pass_rate": fraction of cases that passed,
        "avg_score": mean score over all cases,
        "failed":    list of case["input"] for every case that did NOT pass,
      }
"""


def run_suite(agent, cases, judge) -> dict:
    raise NotImplementedError
