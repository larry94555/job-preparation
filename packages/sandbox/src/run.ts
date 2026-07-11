import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface RunResult {
  passed: boolean;
  timedOut: boolean;
  output: string;
}

/**
 * Run a TypeScript submission against a test file, locally.
 *
 * Phase 3, local-first: this executes the learner's own code in a subprocess
 * with a wall-clock timeout — enough to protect the single local user from an
 * infinite loop. It is NOT a security boundary for untrusted code; the hosted
 * deployment runs submissions in an isolated sandbox service (DESIGN §9).
 *
 * The temp dir is created *under the repo* so Node/tsx resolve `tsx` and deps
 * from the repo's node_modules. The test file must import the submission from
 * `./solution.js`.
 */
export function runTypeScript(opts: {
  solutionCode: string;
  testCode: string;
  timeoutMs?: number;
  repoRoot?: string;
}): Promise<RunResult> {
  const repoRoot = opts.repoRoot ?? process.cwd();
  const base = join(repoRoot, ".sandbox");
  if (!existsSync(base)) mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(join(base, "run-"));
  writeFileSync(join(dir, "solution.ts"), opts.solutionCode);
  writeFileSync(join(dir, "solution.test.ts"), opts.testCode);

  // Run the child in a clean copy of the environment with the parent's
  // node:test context stripped: the submission itself uses `node --test`, and an
  // inherited NODE_TEST_CONTEXT would make that nested runner report to the
  // parent over IPC instead of exiting non-zero — corrupting the pass/fail result
  // whenever grading is invoked from within a test harness.
  const childEnv = { ...process.env };
  delete childEnv.NODE_TEST_CONTEXT;

  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--test", "solution.test.ts"], {
      cwd: dir,
      env: childEnv,
    });
    let out = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, opts.timeoutMs ?? 15000);

    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    const done = (passed: boolean) => {
      clearTimeout(timer);
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        /* best effort cleanup */
      }
      resolve({ passed, timedOut, output: out.slice(-4000) });
    };
    child.on("close", (code) => done(!timedOut && code === 0));
    child.on("error", () => done(false));
  });
}
