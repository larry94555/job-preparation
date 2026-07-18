export interface Step {
  action: string;
  /** A snapshot of the observed world after acting — progress is measured by this changing. */
  state: string;
  done: boolean;
}
export interface LoopOptions {
  maxSteps: number;
}
export type StopReason = "done" | "no-progress" | "budget";
export interface LoopResult {
  steps: number;
  stoppedBy: StopReason;
}

/**
 * A bounded observe → decide → act → verify loop. `step(i)` returns the i-th
 * proposed step. Precedence each iteration (after counting the step):
 *   "done"        — a verified goal wins over everything, including the budget cap
 *   "no-progress" — the observed state did not change from the previous step (stuck)
 *   "budget"      — the step count reached maxSteps
 */
export function runBoundedLoop(step: (i: number) => Step, opts: LoopOptions): LoopResult {
  let prevState: string | undefined;
  for (let i = 0; ; i++) {
    const s = step(i);
    const steps = i + 1;
    if (s.done) return { steps, stoppedBy: "done" };
    if (prevState !== undefined && s.state === prevState) return { steps, stoppedBy: "no-progress" };
    if (steps >= opts.maxSteps) return { steps, stoppedBy: "budget" };
    prevState = s.state;
  }
}
