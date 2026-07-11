import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import { z } from "zod";
import {
  CalibrationSet,
  EvalSkillFrontmatter,
  LessonManifest,
  Question,
  QuestionFile,
  Section,
  SectionsFile,
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
  lessons: z.infer<typeof LessonManifest>[];
  sections: z.infer<typeof Section>[];
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

/** GitHub-ish heading slug: lowercase, drop punctuation, spaces→hyphens. */
function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Slugs of all Markdown headings (`#`..`######`) in a material file. */
function headingSlugs(md: string): Set<string> {
  const slugs = new Set<string>();
  for (const line of md.split(/\r?\n/)) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m) slugs.add(slugify(m[1]));
  }
  return slugs;
}

/** The single key of a lesson segment. */
function segEntry(seg: unknown): { kind: "present" | "check" | "apply"; value: string } {
  const o = seg as Record<string, string>;
  if ("present" in o) return { kind: "present", value: o.present };
  if ("check" in o) return { kind: "check", value: o.check };
  return { kind: "apply", value: o.apply };
}

/** Load and validate a single topic directory. Never throws — issues are collected. */
export function loadTopic(dir: string): LoadedTopic {
  const issues: LoadIssue[] = [];
  const result: LoadedTopic = {
    dir,
    questions: [],
    skills: [],
    calibration: [],
    lessons: [],
    sections: [],
    issues,
  };

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
  const questById = new Map<string, z.infer<typeof Question>>();
  for (const path of listFiles(join(dir, "questions"), ".yaml")) {
    const rel = join("questions", basename(path));
    const parsed = QuestionFile.safeParse(readYaml(path));
    if (!parsed.success) {
      issues.push({ file: rel, message: formatZodError(parsed.error) });
      continue;
    }
    for (const q of parsed.data) {
      if (questById.has(q.id)) {
        issues.push({ file: rel, message: `duplicate question id "${q.id}"` });
        continue;
      }
      questById.set(q.id, q);
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

  // ---- cross-field semantic checks on the item bank ----
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

  // ---- lessons + sections (optional: presence makes the topic a "lesson") ----
  loadLessons(dir, result, questById, issues);

  return result;
}

/**
 * Load `lessons/*.yaml` manifests and `sections.yaml`, enforcing the
 * present-before-test rule (DESIGN §10.1 / Goals §6.1).
 */
function loadLessons(
  dir: string,
  result: LoadedTopic,
  questById: Map<string, z.infer<typeof Question>>,
  issues: LoadIssue[],
): void {
  const lessonById = new Map<string, z.infer<typeof LessonManifest>>();

  // lesson manifests
  for (const path of listFiles(join(dir, "lessons"), ".yaml")) {
    const rel = join("lessons", basename(path));
    const parsed = LessonManifest.safeParse(readYaml(path));
    if (!parsed.success) {
      issues.push({ file: rel, message: formatZodError(parsed.error) });
      continue;
    }
    const lesson = parsed.data;
    if (lessonById.has(lesson.id)) {
      issues.push({ file: rel, message: `duplicate lesson id "${lesson.id}"` });
      continue;
    }
    lessonById.set(lesson.id, lesson);
    result.lessons.push(lesson);

    // material file + heading anchors
    const materialPath = join(dir, "lessons", lesson.material);
    const slugs = existsSync(materialPath)
      ? headingSlugs(readFileSync(materialPath, "utf8"))
      : null;
    if (slugs === null) {
      issues.push({ file: rel, message: `material file "${lesson.material}" not found` });
    }

    // segment checks + present-before-test within the lesson
    let presented = false;
    lesson.segments.forEach((seg, i) => {
      const { kind, value } = segEntry(seg);
      if (kind === "present") {
        presented = true;
        if (slugs && !slugs.has(value)) {
          issues.push({ file: rel, message: `segment ${i}: material has no heading "${value}"` });
        }
      } else {
        if (!questById.has(value)) {
          issues.push({ file: rel, message: `segment ${i}: ${kind} references unknown question "${value}"` });
        }
        if (!presented) {
          issues.push({
            file: rel,
            message: `segment ${i}: "${value}" tested before any material is presented (present-before-test)`,
          });
        }
      }
    });
    if (!presented) {
      issues.push({ file: rel, message: `lesson "${lesson.id}" presents no material` });
    }
  }

  // sections.yaml (optional)
  const sectionsPath = join(dir, "sections.yaml");
  if (!existsSync(sectionsPath)) return;

  const parsed = SectionsFile.safeParse(readYaml(sectionsPath));
  if (!parsed.success) {
    issues.push({ file: "sections.yaml", message: formatZodError(parsed.error) });
    return;
  }
  result.sections = parsed.data.sections;

  for (const section of parsed.data.sections) {
    // collect tags/ids taught by this section's lessons (checks + applies)
    const taughtTags = new Set<string>();
    const taughtIds = new Set<string>();
    for (const lessonId of section.lessons) {
      const lesson = lessonById.get(lessonId);
      if (!lesson) {
        issues.push({ file: "sections.yaml", message: `section "${section.id}" references unknown lesson "${lessonId}"` });
        continue;
      }
      for (const seg of lesson.segments) {
        const { kind, value } = segEntry(seg);
        if (kind === "present") continue;
        taughtIds.add(value);
        const q = questById.get(value);
        if (q) for (const t of q.tags) taughtTags.add(t);
      }
    }

    const a = section.assessment;
    if (a.from_tags.length === 0 && a.from_ids.length === 0) {
      issues.push({ file: "sections.yaml", message: `section "${section.id}" assessment has no draw source (from_tags/from_ids)` });
    }
    // present-before-test at section scope: only assess what the section taught
    for (const t of a.from_tags) {
      if (!taughtTags.has(t)) {
        issues.push({ file: "sections.yaml", message: `section "${section.id}" assessment draws untaught tag "${t}"` });
      }
    }
    for (const id of a.from_ids) {
      if (!taughtIds.has(id)) {
        issues.push({ file: "sections.yaml", message: `section "${section.id}" assessment draws untaught id "${id}"` });
      }
    }
    // the draw pool must be large enough
    const pool = result.questions.filter(
      (q) => a.from_ids.includes(q.id) || q.tags.some((t) => a.from_tags.includes(t)),
    );
    if (pool.length < a.count) {
      issues.push({
        file: "sections.yaml",
        message: `section "${section.id}" assessment wants ${a.count} items but its pool has ${pool.length}`,
      });
    }
  }
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
