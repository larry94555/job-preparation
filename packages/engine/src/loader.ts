import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import { z } from "zod";
import {
  CalibrationSet,
  EvalSkillFrontmatter,
  Question,
  QuestionFile,
  Topic,
} from "@job-prep/schema";

export interface LoadIssue {
  /** Path relative to the topic dir, or "" for topic-level issues. */
  file: string;
  message: string;
}

export interface LoadedSkill {
  frontmatter: z.infer<typeof EvalSkillFrontmatter>;
  body: string;
}

export interface LoadedTopic {
  dir: string;
  topic?: z.infer<typeof Topic>;
  questions: z.infer<typeof Question>[];
  skills: LoadedSkill[];
  calibration: z.infer<typeof CalibrationSet>[];
  issues: LoadIssue[];
}

function formatZodError(err: z.ZodError): string {
  return err.issues
    .map((i) => `${i.path.length ? i.path.join(".") + ": " : ""}${i.message}`)
    .join("; ");
}

function readYaml(path: string): unknown {
  return YAML.parse(readFileSync(path, "utf8"));
}

function listFiles(dir: string, ext: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ext)
    .map((f) => join(dir, f))
    .sort();
}

/** Load and validate a single topic directory. Never throws — issues are collected. */
export function loadTopic(dir: string): LoadedTopic {
  const issues: LoadIssue[] = [];
  const result: LoadedTopic = { dir, questions: [], skills: [], calibration: [], issues };

  // topic.yaml
  const topicPath = join(dir, "topic.yaml");
  if (!existsSync(topicPath)) {
    issues.push({ file: "topic.yaml", message: "missing topic.yaml" });
  } else {
    const parsed = Topic.safeParse(readYaml(topicPath));
    if (parsed.success) result.topic = parsed.data;
    else issues.push({ file: "topic.yaml", message: formatZodError(parsed.error) });
  }

  // questions/*.yaml  (each file is a YAML list of questions)
  const seenIds = new Set<string>();
  for (const path of listFiles(join(dir, "questions"), ".yaml")) {
    const rel = join("questions", basename(path));
    const parsed = QuestionFile.safeParse(readYaml(path));
    if (!parsed.success) {
      issues.push({ file: rel, message: formatZodError(parsed.error) });
      continue;
    }
    for (const q of parsed.data) {
      if (seenIds.has(q.id)) {
        issues.push({ file: rel, message: `duplicate question id "${q.id}"` });
        continue;
      }
      seenIds.add(q.id);
      result.questions.push(q);
    }
  }

  // skills/*.md
  const skillIds = new Set<string>();
  for (const path of listFiles(join(dir, "skills"), ".md")) {
    const rel = join("skills", basename(path));
    const { data, content } = matter(readFileSync(path, "utf8"));
    const parsed = EvalSkillFrontmatter.safeParse(data);
    if (!parsed.success) {
      issues.push({ file: rel, message: formatZodError(parsed.error) });
      continue;
    }
    skillIds.add(parsed.data.id);
    result.skills.push({ frontmatter: parsed.data, body: content.trim() });
  }

  // calibration/*.yaml
  for (const path of listFiles(join(dir, "calibration"), ".yaml")) {
    const rel = join("calibration", basename(path));
    const parsed = CalibrationSet.safeParse(readYaml(path));
    if (!parsed.success) {
      issues.push({ file: rel, message: formatZodError(parsed.error) });
      continue;
    }
    result.calibration.push(parsed.data);
    if (!skillIds.has(parsed.data.skill)) {
      issues.push({ file: rel, message: `calibration references unknown skill "${parsed.data.skill}"` });
    }
  }

  // ---- cross-field semantic checks (not expressible in the union schema) ----
  for (const q of result.questions) {
    if (q.type === "multiple_choice" && !q.options.some((o) => o.correct)) {
      issues.push({ file: "questions", message: `mcq "${q.id}" has no correct option` });
    }
    if (q.type === "essay" && !skillIds.has(q.eval_skill)) {
      issues.push({ file: "questions", message: `essay "${q.id}" references unknown eval_skill "${q.eval_skill}"` });
    }
    if (q.type === "code" && q.eval_skill && !skillIds.has(q.eval_skill)) {
      issues.push({ file: "questions", message: `code "${q.id}" references unknown eval_skill "${q.eval_skill}"` });
    }
  }

  return result;
}

export interface LoadResult {
  topics: LoadedTopic[];
  /** True when every topic loaded with zero issues. */
  ok: boolean;
}

/** Load every immediate subdirectory of `topicsDir` as a topic. */
export function loadAllTopics(topicsDir: string): LoadResult {
  if (!existsSync(topicsDir)) {
    return { topics: [], ok: false };
  }
  const dirs = readdirSync(topicsDir)
    .map((name) => join(topicsDir, name))
    .filter((p) => statSync(p).isDirectory())
    .sort();

  const topics = dirs.map(loadTopic);
  const ok = topics.every((t) => t.issues.length === 0);
  return { topics, ok };
}
