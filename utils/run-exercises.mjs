// Run each agentic-memory-state exercise's reference.py through the REAL
// LocalRunner (runPython path), exactly as grading would. Usage:
//   node --import tsx utils/run-exercises.mjs <topic-slug>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LocalRunner } from "@job-prep/sandbox";

const slug = process.argv[2] ?? "agentic-memory-state";
const dirs = process.argv.slice(3);
const exDirs = dirs.length ? dirs : ["memory-buffer", "context-compress", "recall-store"];
const runner = new LocalRunner();
let failed = 0;
for (const ex of exDirs) {
  const base = resolve("topics", slug, "exercises", ex);
  const solutionCode = readFileSync(resolve(base, "reference.py"), "utf8");
  const testCode = readFileSync(resolve(base, "test_solution.py"), "utf8");
  const r = await runner.run({ solutionCode, testCode, language: "python", timeoutMs: 30000 });
  console.log(`${r.passed ? "✓" : "✗"} ${ex}  passed=${r.passed} timedOut=${r.timedOut}`);
  if (!r.passed) {
    failed++;
    console.log(r.output.split("\n").slice(-15).join("\n"));
  }
}
process.exit(failed ? 1 : 0);
