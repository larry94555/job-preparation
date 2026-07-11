#!/usr/bin/env tsx
import { resolve } from "node:path";
import { loadAllTopics } from "@job-prep/engine";
import { clientForSkill, gradeOpen } from "./evaluator.js";
import { gradeWithEscalation } from "./escalation.js";
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
  // --samples N (default 1): with N>1, grade each case best-of-N and take the
  // majority verdict (DESIGN §7 confidence escalation). Costs N model calls/case.
  const sIdx = rest.indexOf("--samples");
  const samples = sIdx >= 0 ? Math.max(1, Number(rest[sIdx + 1])) : 1;
  // --only <skillId>: measure a single skill (fast check when iterating on one
  // calibration/judge). Omit to measure every skill.
  const oIdx = rest.indexOf("--only");
  const only = oIdx >= 0 ? rest[oIdx + 1] : undefined;

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
      if (only && cal.skill !== only) continue;
      const skill = topic.skills.find((s) => s.frontmatter.id === cal.skill);
      if (!skill) continue;
      skillCount++;
      // Route to the skill's judge (default pinned model, or `grader_model`
      // override for skills the small judge can't reproduce — DESIGN §7).
      const judge = clientForSkill(skill);
      // Effective samples: a skill can pin its own best-of-N (grader_samples) so
      // the gate measures it the way production grades it (best-of-N majority),
      // overriding the CLI default. Keeps the sweep fast (1 sample) for the many
      // skills whose judge is comfortably above threshold.
      const effSamples = Math.max(samples, skill.frontmatter.grader_samples ?? 1);
      const routed = skill.frontmatter.grader_model ? ` [judge: ${skill.frontmatter.grader_model}]` : "";
      const voted = effSamples > 1 ? ` [best-of-${effSamples}]` : "";
      let agree = 0;
      for (const c of cal.cases) {
        // Exclude the case under test from its own few-shot to avoid leakage.
        const others = { ...cal, cases: cal.cases.filter((x) => x !== c) };
        if (effSamples > 1) {
          // Best-of-N over the same (skill, answer, calibration); the closure
          // carries the real LoadedSkill so the escalation grade fn stays generic.
          const grade = async () => {
            const rr = await gradeOpen({ skill, answer: c.answer, calibration: others }, judge);
            return { verdict: rr.graded ? rr.aggregate.verdict : ("fail" as const) };
          };
          const esc = await gradeWithEscalation({ grade, skill, answer: c.answer, calibration: others, samples: effSamples });
          if (esc.verdict === c.expect.verdict) agree++;
        } else {
          const r = await gradeOpen({ skill, answer: c.answer, calibration: others }, judge);
          if (r.graded && r.aggregate.verdict === c.expect.verdict) agree++;
        }
      }
      const rate = cal.cases.length ? agree / cal.cases.length : 0;
      const ok = rate >= threshold;
      if (!ok) failing++;
      console.log(
        `${ok ? "✓" : "✗"} ${topic.topic?.id}/${cal.skill}  agreement ${Math.round(rate * 100)}% (${agree}/${cal.cases.length})  ${ok ? "passing" : "needs-work"}${routed}${voted}`,
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
