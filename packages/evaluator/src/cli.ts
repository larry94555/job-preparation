#!/usr/bin/env tsx
import { resolve } from "node:path";
import { loadAllTopics } from "@job-prep/engine";
import { gradeOpen } from "./evaluator.js";
import { LlamaClient } from "./llama.js";

/**
 * Meta-eval gate (DESIGN §7): grade each skill's calibration cases with the
 * local model and report agreement with the expected verdicts. A skill below
 * threshold is "needs-work" and should not grade real users.
 *
 *   tsx cli.ts meta-eval [topicsDir] [--threshold 0.7]
 */
async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (command !== "meta-eval") {
    console.error("usage: meta-eval [topicsDir] [--threshold N]");
    return 2;
  }
  const topicsDir = resolve(rest.find((a) => !a.startsWith("--")) ?? "topics");
  const thIdx = rest.indexOf("--threshold");
  const threshold = thIdx >= 0 ? Number(rest[thIdx + 1]) : 0.7;

  const client = new LlamaClient();
  if (!(await client.health())) {
    console.log(`llama-server not reachable at ${client.baseUrl} — skipping meta-eval (set LLAMA_BASE_URL).`);
    return 0; // self-skip, like imini's eval gate
  }

  const { topics } = loadAllTopics(topicsDir);
  let failing = 0;
  let skillCount = 0;

  for (const topic of topics) {
    for (const cal of topic.calibration) {
      const skill = topic.skills.find((s) => s.frontmatter.id === cal.skill);
      if (!skill) continue;
      skillCount++;
      let agree = 0;
      for (const c of cal.cases) {
        // Exclude the case under test from its own few-shot to avoid leakage.
        const others = { ...cal, cases: cal.cases.filter((x) => x !== c) };
        const r = await gradeOpen({ skill, answer: c.answer, calibration: others });
        if (r.graded && r.aggregate.verdict === c.expect.verdict) agree++;
      }
      const rate = cal.cases.length ? agree / cal.cases.length : 0;
      const ok = rate >= threshold;
      if (!ok) failing++;
      console.log(
        `${ok ? "✓" : "✗"} ${topic.topic?.id}/${cal.skill}  agreement ${Math.round(rate * 100)}% (${agree}/${cal.cases.length})  ${ok ? "passing" : "needs-work"}`,
      );
    }
  }

  console.log("");
  console.log(`${skillCount} skill(s) measured, threshold ${Math.round(threshold * 100)}%.`);
  if (failing > 0) {
    console.log(`${failing} skill(s) below threshold — not cleared to grade real users.`);
    return 1;
  }
  console.log("All measured skills meet the bar.");
  return 0;
}

main(process.argv.slice(2)).then((code) => process.exit(code));
