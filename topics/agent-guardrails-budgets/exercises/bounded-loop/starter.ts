export interface StepResult<S> {
  state: S;
  done: boolean;
}
export interface AgentOptions<S> {
  initial: S;
  maxSteps: number;
}
export type StoppedBy = "complete" | "budget" | "no-progress";
export interface AgentRun<S> {
  steps: number;
  stoppedBy: StoppedBy;
  state: S;
}

/**
 * TODO: loop from opts.initial, applying step(state) and counting steps. After each step, check —
 * in this order:
 *   1. done            → stop "complete"
 *   2. new state deep-equals previous state → stop "no-progress"
 *   3. steps >= maxSteps → stop "budget"
 * Return { steps, stoppedBy, state } with the final state.
 */
export function runAgent<S>(step: (state: S) => StepResult<S>, opts: AgentOptions<S>): AgentRun<S> {
  throw new Error("not implemented");
}
