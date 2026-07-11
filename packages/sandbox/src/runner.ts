import { type RunResult, runTypeScript } from "./run.js";

/**
 * The isolated code-execution seam (DESIGN §9). Grading talks to a `CodeRunner`
 * instead of calling `runTypeScript` directly, mirroring the `ProgressStore` /
 * `ContentSource` / `JobQueue` pattern: local dev uses the fast in-process
 * subprocess (`LocalRunner`); hosting uses a dedicated, network-isolated HTTP
 * sandbox service (`HttpRunner`) — without any change to grading logic.
 */
export interface CodeRunner {
  run(opts: {
    solutionCode: string;
    testCode: string;
    language?: string;
    timeoutMs?: number;
  }): Promise<RunResult>;
}

/**
 * In-process runner: wraps `runTypeScript`, executing the submission in a
 * subprocess on the SAME box with only a wall-clock timeout.
 *
 * This is the DEFAULT for local, single-user dev. It is explicitly **NOT a
 * security boundary** — it runs learner code with the same privileges and
 * filesystem/network access as the process. It must NEVER face untrusted users;
 * hosting must use `HttpRunner` against an OS-isolated sandbox service (§9).
 */
export class LocalRunner implements CodeRunner {
  run(opts: {
    solutionCode: string;
    testCode: string;
    language?: string;
    timeoutMs?: number;
  }): Promise<RunResult> {
    return runTypeScript({
      solutionCode: opts.solutionCode,
      testCode: opts.testCode,
      timeoutMs: opts.timeoutMs,
      repoRoot: process.cwd(),
    });
  }
}

/**
 * Remote runner: POSTs the run request as JSON to `${baseUrl}/run` on a
 * dedicated, isolated sandbox service and returns the parsed `RunResult`. The
 * OS-level isolation (no egress, dropped capabilities, read-only+ephemeral
 * filesystem, CPU/mem/wall-clock caps, gVisor/Firecracker) is a property of how
 * that service is deployed — see HOSTING.md Phase 5.
 */
export class HttpRunner implements CodeRunner {
  constructor(private readonly baseUrl: string) {}

  async run(opts: {
    solutionCode: string;
    testCode: string;
    language?: string;
    timeoutMs?: number;
  }): Promise<RunResult> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(opts),
    });
    if (!res.ok) {
      throw new Error(`sandbox service responded ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as RunResult;
  }
}

/**
 * Build the CodeRunner selected by the environment.
 *
 * - SANDBOX=local (default): `LocalRunner` — the zero-setup, in-process path.
 * - SANDBOX=http: `HttpRunner` against SANDBOX_URL (required) — the isolated
 *   sandbox service used for hosting.
 */
export function createCodeRunner(): CodeRunner {
  const kind = process.env.SANDBOX ?? "local";
  if (kind === "http") {
    const url = process.env.SANDBOX_URL;
    if (!url) {
      throw new Error(
        "SANDBOX=http requires SANDBOX_URL to be set (e.g. http://sandbox:4500).",
      );
    }
    return new HttpRunner(url);
  }
  if (kind !== "local") {
    throw new Error(`Unknown SANDBOX="${kind}" (expected "local" or "http").`);
  }
  return new LocalRunner();
}
