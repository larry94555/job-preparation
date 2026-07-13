// Experiment: grade the KNOWN-GOOD pass answer (tools-essay case 4) under
// different judge-input conditions to see which recovers the correct PASS.
//   node --import tsx --import ./utils/load-secrets.mjs utils/exp-grader.mjs
import { resolve } from "node:path";
import { loadAllTopics } from "@job-prep/engine";
import { clientForSkill, gradeOpen } from "@job-prep/evaluator";

const { topics } = loadAllTopics(resolve("topics"));
const topic = topics.find((t) => t.topic?.id === "agentic-tool-calling");
const cal = topic.calibration.find((c) => c.skill === "eval-agentic-tools-essay");
const skill = topic.skills.find((s) => s.frontmatter.id === "eval-agentic-tools-essay");
const judge = clientForSkill(skill);

// The known-good PASS answer the 8B currently mis-grades (case index 4).
const passIdx = cal.cases.findIndex(
  (c, i) => c.expect.verdict === "pass" && i >= 2,
);
const good = cal.cases[passIdx];
const passes = cal.cases.filter((c, i) => c.expect.verdict === "pass" && i !== passIdx);
const fails = cal.cases.filter((c) => c.expect.verdict === "fail");

// Reference key production would supply for the talk-vs-act essay.
const essay = topic.questions.find((q) => q.id === "essay-talk-vs-act");
const refPts = essay?.reference_points ?? [];

const conds = {
  "A baseline (meta-eval: no ref, few-shot=2 pass)": {
    referencePoints: [],
    calibration: { ...cal, cases: [passes[0], passes[0]] },
  },
  "B +reference key (production-style)": {
    referencePoints: refPts,
    calibration: { ...cal, cases: [passes[0], passes[0]] },
  },
  "C +contrastive few-shot (1 pass + 1 fail)": {
    referencePoints: [],
    calibration: { ...cal, cases: [passes[0], fails[0]] },
  },
  "D +ref +contrastive (B+C)": {
    referencePoints: refPts,
    calibration: { ...cal, cases: [passes[0], fails[0]] },
  },
};

for (const [label, extra] of Object.entries(conds)) {
  // best-of-1 x3 to see stability
  const verdicts = [];
  for (let i = 0; i < 3; i++) {
    const r = await gradeOpen({ skill, answer: good.answer, ...extra }, judge);
    verdicts.push(r.graded ? r.aggregate.verdict : "NOGRADE");
  }
  console.log(`${label}\n   -> ${verdicts.join(", ")}   (expect: pass)`);
}
