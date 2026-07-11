export interface EvalCase {
  name: string;
  input: string;
  expected: string;
}
export interface GateResult {
  passRate: number;
  passed: boolean;
  failures: string[];
}

/**
 * TODO:
 *   For each case, a case passes when run(input) === expected.
 *   passRate = (# passing) / (total cases)
 *   passed   = passRate >= threshold
 *   failures = names of the failing cases
 */
export function runEvalGate(
  cases: EvalCase[],
  run: (input: string) => string,
  threshold: number,
): GateResult {
  throw new Error("not implemented");
}
