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
 * TODO: run observe → decide → act → verify. Call step(i) for the i-th step. After
 * counting the step, stop with (in this precedence):
 *   "done"        if the step reports done (a verified goal wins, even at the cap)
 *   "no-progress" if the observed state equals the previous step's state (stuck)
 *   "budget"      if the step count reached opts.maxSteps
 * Return { steps, stoppedBy }.
 */
export function runBoundedLoop(step: (i: number) => Step, opts: LoopOptions): LoopResult {
  throw new Error("not implemented");
}
