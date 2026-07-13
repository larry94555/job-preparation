# Observability & tracing — the frontier

## The frontier of agent observability

Per-step spans, cost/latency/failure metrics, dashboards, and alerts are the solid ground. The frontier
is where they stop being enough — where an agent runs long, branching trajectories and the hard question
is no longer *what did each step cost* but *was the trajectory any good*.

- **Semantic / agent-specific observability.** A span tells you a tool ran, how long it took, and what
  it cost. It does not tell you whether the agent *should* have called that tool, whether its reasoning
  was sound, or whether the run reached a correct end state. Instrumenting the *meaning* of a step — not
  just its mechanics — is an open problem: the metrics are easy, the semantics are not.
- **Evaluating trajectories in production.** Offline evals score a fixed test set; production runs are
  unlabeled, unbounded, and drift. Scoring whole trajectories live — did this multi-step run actually
  accomplish the user's goal, and how would you know without a ground-truth label — is where LLM-as-judge
  scoring, trajectory evals, and human review are still being figured out. The failures here are
  **silent and semantic**: nothing errors, the cost looks normal, and the agent still did the wrong thing.
- **Observability at agent scale.** Many concurrent agents over long horizons generate more spans than
  anyone can read, and the distributed-systems edges return: sampling without losing the rare failing
  trajectory, propagating trace context across tool and sub-agent boundaries, and keeping the signal
  affordable. More spans do not close this gap — better *questions over* the spans do.

The reason to track this frontier: it attacks the same trust gap the topic is built on — *you cannot
manage what you cannot see* — but at the scale and semantic depth where a per-step metric is no longer
the whole story. An expert can say which of these to invest in first and does not claim they are solved.
