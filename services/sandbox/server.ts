import { createServer } from "node:http";
import { type RunResult, runTypeScript } from "@job-prep/sandbox";

/**
 * Reference isolated sandbox service (DESIGN §9, HOSTING.md Phase 5).
 *
 * A minimal, dependency-free Node HTTP server that does exactly ONE thing: run a
 * TypeScript submission against a test file and return the `RunResult`. It
 * touches NO database and NO secrets — it only executes code. That single
 * responsibility is what makes it safe to deploy under strong OS-level isolation
 * (its own network with no egress, dropped Linux capabilities / non-root,
 * read-only + ephemeral filesystem, CPU/memory/wall-clock caps, and kernel
 * isolation via gVisor/Firecracker). This process is the application-level seam;
 * the isolation is a deploy-time property documented in HOSTING.md.
 *
 * Endpoints:
 *   POST /run    — { solutionCode, testCode, language?, timeoutMs? } → RunResult
 *   GET  /health — { ok: true }
 */

const PORT = Number(process.env.PORT ?? 4500);

interface RunRequest {
  solutionCode?: string;
  testCode?: string;
  language?: string;
  timeoutMs?: number;
}

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    // Cap the request body so a huge payload can't exhaust memory.
    const LIMIT = 1_000_000;
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > LIMIT) {
        reject(new Error("request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const json = (status: number, obj: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };

  if (req.method === "GET" && req.url === "/health") {
    return json(200, { ok: true });
  }

  if (req.method === "POST" && req.url === "/run") {
    try {
      const body = await readBody(req);
      const parsed = (body ? JSON.parse(body) : {}) as RunRequest;
      if (typeof parsed.solutionCode !== "string" || typeof parsed.testCode !== "string") {
        return json(400, { error: "solutionCode and testCode are required strings" });
      }
      const result: RunResult = await runTypeScript({
        solutionCode: parsed.solutionCode,
        testCode: parsed.testCode,
        timeoutMs: parsed.timeoutMs,
        repoRoot: process.cwd(),
      });
      return json(200, result);
    } catch (err) {
      return json(400, { error: err instanceof Error ? err.message : String(err) });
    }
  }

  return json(404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`sandbox service listening on http://localhost:${PORT} (POST /run, GET /health)`);
});
