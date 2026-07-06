#!/usr/bin/env tsx
import { resolve } from "node:path";
import { loadAllTopics, type LoadedTopic } from "./loader.js";
import { mulberry32, prepareQuestion, resolveParameters, seedFromString, shuffle } from "./randomize.js";
import { gradeMultipleChoice, gradeTextInput } from "./grade.js";

/**
 * Content CLI.
 *
 *   tsx cli.ts validate  [topicsDir]
 *   tsx cli.ts selfcheck [topicsDir]        # auto-score answer keys (no LLM)
 *   tsx cli.ts preview   <topicId> [topicsDir] [--seed N] [--count N]
 */

function findTopic(topics: LoadedTopic[], id: string): LoadedTopic | undefined {
  return topics.find((t) => t.topic?.id === id);
}

function cmdValidate(topicsDir: string): number {
  const { topics, ok } = loadAllTopics(topicsDir);
  if (topics.length === 0) {
    console.error(`No topics found under ${topicsDir}`);
    return 1;
  }
  let totalIssues = 0;
  for (const t of topics) {
    const name = t.topic?.id ?? t.dir;
    if (t.issues.length === 0) {
      console.log(
        `✓ ${name}  (${t.questions.length} questions, ${t.skills.length} skills, ${t.calibration.length} calibration sets)`,
      );
      continue;
    }
    console.log(`✗ ${name}`);
    for (const issue of t.issues) {
      totalIssues++;
      console.log(`    ${issue.file ? issue.file + ": " : ""}${issue.message}`);
    }
  }
  console.log("");
  if (ok) {
    console.log(`All ${topics.length} topic(s) valid.`);
    return 0;
  }
  console.log(`${totalIssues} issue(s) across ${topics.length} topic(s).`);
  return 1;
}

/**
 * Feed each deterministic question its own answer key and confirm the grader
 * accepts it (and rejects a wrong MC option). Proves grader + content agree.
 */
function cmdSelfcheck(topicsDir: string): number {
  const { topics } = loadAllTopics(topicsDir);
  if (topics.length === 0) {
    console.error(`No topics found under ${topicsDir}`);
    return 1;
  }
  let checked = 0;
  let failures = 0;
  let regexOnly = 0;
  let skipped = 0;

  for (const t of topics) {
    const name = t.topic?.id ?? t.dir;
    const problems: string[] = [];

    t.questions.forEach((q, i) => {
      const rng = mulberry32(seedFromString(name + ":" + i));
      if (q.type === "multiple_choice") {
        const correct = q.options.find((o) => o.correct);
        const wrong = q.options.find((o) => !o.correct);
        if (!correct || !gradeMultipleChoice(q, correct.text)) {
          problems.push(`${q.id}: correct option does not grade as correct`);
        } else if (wrong && gradeMultipleChoice(q, wrong.text)) {
          problems.push(`${q.id}: a wrong option grades as correct`);
        } else checked++;
      } else if (q.type === "text_input") {
        const params = resolveParameters(q.parameters, rng);
        if (q.answer.equals !== undefined) {
          const key = q.answer.equals.replace(/\{\{(\w+)\}\}/g, (_, n) => params[n] ?? _);
          if (!gradeTextInput(q, key, params)) {
            problems.push(`${q.id}: equals key "${key}" does not grade as correct`);
          } else checked++;
        } else if (q.answer.regex !== undefined) {
          try {
            new RegExp(q.answer.regex);
            regexOnly++;
          } catch (e) {
            problems.push(`${q.id}: invalid regex — ${(e as Error).message}`);
          }
        }
      } else {
        skipped++; // essay / code — LLM-graded
      }
    });

    if (problems.length === 0) {
      console.log(`✓ ${name}`);
    } else {
      console.log(`✗ ${name}`);
      for (const p of problems) {
        failures++;
        console.log(`    ${p}`);
      }
    }
  }

  console.log("");
  console.log(
    `${checked} answer-key check(s) passed, ${regexOnly} regex compile-checked, ${skipped} LLM-graded skipped.`,
  );
  if (failures > 0) {
    console.log(`${failures} failure(s).`);
    return 1;
  }
  console.log("Self-check clean.");
  return 0;
}

function cmdPreview(topicId: string, topicsDir: string, seed: number, count: number): number {
  const { topics } = loadAllTopics(topicsDir);
  const t = findTopic(topics, topicId);
  if (!t) {
    console.error(`Topic "${topicId}" not found under ${topicsDir}`);
    return 1;
  }
  console.log(`# ${t.topic?.title ?? topicId}  (seed ${seed})\n`);
  const rng = mulberry32(seed);
  const drawn = shuffle(t.questions, rng).slice(0, count); // randomized mixed draw
  drawn.forEach((q, i) => {
    const prepared = prepareQuestion(q, rng);
    console.log(`Q${i + 1}. [${q.type}] ${prepared.prompt}`);
    if (prepared.type === "multiple_choice") {
      prepared.options.forEach((o, j) =>
        console.log(`     ${String.fromCharCode(97 + j)}) ${o.text}`),
      );
    }
    console.log("");
  });
  console.log(`(${Math.min(count, t.questions.length)} of ${t.questions.length} questions)`);
  return 0;
}

function getFlag(argv: string[], name: string, dflt: number): number {
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1]) {
    const n = Number(argv[idx + 1]);
    if (Number.isFinite(n)) return n;
  }
  return dflt;
}

function main(argv: string[]): number {
  const [command, ...rest] = argv;

  switch (command) {
    case "validate":
      return cmdValidate(resolve(rest[0] ?? "topics"));
    case "selfcheck":
      return cmdSelfcheck(resolve(rest[0] ?? "topics"));
    case "preview": {
      // Separate positional args from `--flag value` pairs.
      const positional: string[] = [];
      for (let i = 0; i < rest.length; i++) {
        if (rest[i].startsWith("--")) i++; // skip the flag's value
        else positional.push(rest[i]);
      }
      const topicId = positional[0];
      const topicsDir = resolve(positional[1] ?? "topics");
      if (!topicId) {
        console.error("usage: preview <topicId> [topicsDir] [--seed N] [--count N]");
        return 2;
      }
      return cmdPreview(topicId, topicsDir, getFlag(rest, "--seed", 42), getFlag(rest, "--count", 6));
    }
    default:
      console.error("usage: cli <validate|selfcheck|preview> ...");
      return 2;
  }
}

process.exit(main(process.argv.slice(2)));
