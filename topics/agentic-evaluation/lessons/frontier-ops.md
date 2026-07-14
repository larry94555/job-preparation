# Evaluation & quality — the frontier

## The frontier of agent evals

The LLM judge, the rubric, the suite, and the deploy gate are the solid ground — enough to measure and
gate a real agent. The frontier is where grading *agents specifically* gets hard: the thing you are
scoring is no longer a single answer but a long trajectory of tool calls, and the judge you grade it with
is itself a fallible model.

- **Agentic / task-completion benchmarks.** The field has moved from grading a single response to grading
  whether an agent *completed a real task* end to end — install this package, resolve this GitHub issue,
  book this trip. Benchmarks like **SWE-bench** (resolve real repository issues) and **τ-bench /
  tool-use suites** score task completion, not prose quality. The open problem is that pass/fail on a
  final state hides *how* the agent got there — and a task that passes today can break on a silent
  dependency change tomorrow.
- **Trajectory evaluation.** For a multi-step agent, the final answer is not the whole story: a run can
  reach the right end state through a wrong, wasteful, or unsafe path. **Trajectory eval** grades the
  *sequence* of tool calls — did it take a sane route, avoid destructive actions, stay grounded — not just
  the last message. Scoring a trajectory is far harder than scoring an answer, and it is an active
  research edge, not a solved metric.
- **Judge reliability at scale.** An LLM judge calibrated on 200 labeled cases can still drift on the long
  tail of real outputs, and its known biases (position, verbosity, self-preference) compound when it
  grades thousands of trajectories unsupervised. Keeping the judge honest at scale — re-calibrating,
  de-biasing, sampling for human review — is the reliability problem underneath every automated eval.

The reason to track this frontier is that it attacks the same gap this topic is built on — *you cannot
improve what you cannot measure* — at the scale where the thing being measured is a whole agent and the
measuring instrument is itself a model. An expert can say which of these to invest in first, and does not
pretend that a single pass-rate captures a long-horizon agent.
