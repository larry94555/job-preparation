export interface Proposed {
  action: string;
  done: boolean;
}
export interface LoopOptions {
  maxSteps: number;
}
export type StoppedBy = "complete" | "budget" | "duplicate-call";
export interface LoopRun {
  steps: number;
  stoppedBy: StoppedBy;
}

/**
 * TODO: run think→act→observe. Each iteration call step(i) for the i-th action. After counting the
 * step, stop with:
 *   "complete"       if done
 *   "duplicate-call" if action === the previous action
 *   "budget"         if steps reached maxSteps
 * Return { steps, stoppedBy }.
 */
export function runHarnessLoop(step: (i: number) => Proposed, opts: LoopOptions): LoopRun {
  throw new Error("not implemented");
}
