#!/usr/bin/env tsx
import { resolve } from "node:path";
import { loadAllTopics } from "@job-prep/engine";
import { clientForSkill, gradeOpen } from "./evaluator.js";
import { gradeWithEscalation } from "./escalation.js";
import { LlamaClient } from "./llama.js";
import { getModelConfig, resolveGrader } from "./model-config.js";

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

  // Probe the SAME backend the grader will use (the resolved model_configuration
  // backend / LLAMA_BASE_URL), not the bare default, so the gate doesn't self-skip
  // against localhost when a remote backend (e.g. Oracle Cloud) is configured.
  const cfg = getModelConfig();
  const healthBaseUrl = cfg ? resolveGrader(cfg).baseUrl : undefined;
  const client = new LlamaClient(healthBaseUrl ? { baseUrl: healthBaseUrl } : {});
  // Skip unless we can ACTUALLY grade — reachable AND authenticated. Probing the
  // grading endpoint (not the public /models) means CI (no API key) self-skips as
  // a no-op instead of failing every skill at 0%.
  if (!(await client.canGrade())) {
    console.log(
      `grading model at ${client.baseUrl} not usable (unreachable or unauthorized) — skipping meta-eval.`,
    );
    return 0; // self-skip, like imini's eval gate
  }

  // Preflight: a multi-slot backend batches requests, which is non-deterministic
  // even at temperature 0 — grades then wobble run-to-run and can't be certified.
  const slots = await client.slotCount();
  if (slots !== null && slots > 1) {
    console.log(
      `⚠️  backend at ${client.baseUrl} reports ${slots} parallel slots — grading is NON-DETERMINISTIC ` +
        `(continuous batching reorders FP reductions). Restart llama-server with --parallel 1 before certifying.`,
    );
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
      // Label the RESOLVED judge model (from model_configuration.yaml) for skills
      // routed to the stronger tier, so the output reflects what actually graded.
      const routed = skill.frontmatter.grader_model ? ` [judge: ${judge.model}]` : "";
      const voted = effSamples > 1 ? ` [best-of-${effSamples}]` : "";
      // Reference key: in production the judge is handed each essay's
      // `reference_points` as ground truth (apply/route.ts). The gate must grade
      // the judge the SAME way, or it measures a harder task than real users hit
      // and understates accuracy. Supply the union of reference_points across the
      // essays this skill grades. Code skills have no reference key (they grade
      // from test evidence), so this is empty for them.
      // Cap the key: it is repeated in every few-shot exemplar, so a long union
      // (5 essays × 3 pts = 15) bloats the prompt and the 8B starts emitting
      // non-JSON. A compact ~4-point domain key is what fixes the mis-grades
      // without breaking output; production passes one essay's ~3 points.
      const referencePoints =
        skill.frontmatter.applies_to === "essay"
          ? [
              ...new Set(
                topic.questions.flatMap((q) =>
                  q.type === "essay" && q.eval_skill === skill.frontmatter.id
                    ? (q.reference_points ?? [])
                    : [],
                ),
              ),
            ].slice(0, 4)
          : [];
      let agree = 0;
      for (const c of cal.cases) {
        // Exclude the case under test from its own few-shot to avoid leakage.
        const others = { ...cal, cases: cal.cases.filter((x) => x !== c) };
        if (effSamples > 1) {
          // Best-of-N over the same (skill, answer, calibration); the closure
          // carries the real LoadedSkill so the escalation grade fn stays generic.
          const grade = async () => {
            const rr = await gradeOpen({ skill, answer: c.answer, calibration: others, referencePoints }, judge);
            return { verdict: rr.graded ? rr.aggregate.verdict : ("fail" as const) };
          };
          const esc = await gradeWithEscalation({ grade, skill, answer: c.answer, calibration: others, samples: effSamples });
          if (esc.verdict === c.expect.verdict) agree++;
        } else {
          const r = await gradeOpen({ skill, answer: c.answer, calibration: others, referencePoints }, judge);
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
