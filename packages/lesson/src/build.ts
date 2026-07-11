import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type LoadedTopic, mulberry32, prepareQuestion, shuffle } from "@job-prep/engine";
import type { Question } from "@job-prep/schema";
import { extractSection, renderMarkdown } from "./markdown.js";
import type { Playthrough, QuestionView, SectionRef, Step } from "./types.js";

function viewOf(q: Question, prepared: ReturnType<typeof prepareQuestion>): QuestionView {
  switch (q.type) {
    case "multiple_choice": {
      const options = prepared.type === "multiple_choice" ? prepared.options.map((o) => o.text) : [];
      return { id: q.id, type: q.type, prompt: prepared.prompt, options };
    }
    case "text_input":
      return { id: q.id, type: q.type, prompt: prepared.prompt, inputKind: "text" };
    case "essay":
      return { id: q.id, type: q.type, prompt: q.prompt, referencePoints: q.reference_points };
    case "code":
      return { id: q.id, type: q.type, prompt: q.prompt, language: q.language };
  }
}

function paramsOf(prepared: ReturnType<typeof prepareQuestion>): Record<string, string> {
  return prepared.type === "text_input" ? prepared.params : {};
}

/**
 * Flatten a validated topic (with sections + lessons) into a linear, seeded
 * playthrough: material → checks → application tasks, then a section assessment.
 * Phase 1: assessments draw only deterministic (MC / text) items so they score
 * without an LLM; essay/code assessment items arrive in Phase 2.
 */
export function buildPlaythrough(topic: LoadedTopic, seed: number): Playthrough {
  const rng = mulberry32(seed);
  const lessonById = new Map(topic.lessons.map((l) => [l.id, l]));
  const questById = new Map(topic.questions.map((q) => [q.id, q]));
  const materialCache = new Map<string, string>();
  const readMaterial = (file: string): string => {
    if (!materialCache.has(file)) {
      materialCache.set(file, readFileSync(join(topic.dir, "lessons", file), "utf8"));
    }
    return materialCache.get(file)!;
  };

  const steps: Step[] = [];
  const sections: SectionRef[] = [];
  const defaultThreshold = topic.topic?.pass_threshold ?? 0.7;

  for (const section of topic.sections) {
    const threshold = section.assessment.pass_threshold ?? defaultThreshold;
    sections.push({ id: section.id, title: section.title, lessonIds: section.lessons, passThreshold: threshold });

    for (const lessonId of section.lessons) {
      const lesson = lessonById.get(lessonId);
      if (!lesson) continue;
      const md = readMaterial(lesson.material);

      for (const seg of lesson.segments) {
        if ("present" in seg) {
          const sec = extractSection(md, seg.present);
          steps.push({
            kind: "material",
            sectionId: section.id,
            lessonId,
            lessonTitle: lesson.title,
            heading: sec?.heading ?? seg.present,
            html: renderMarkdown(sec?.body ?? ""),
          });
        } else if ("check" in seg) {
          const q = questById.get(seg.check);
          if (!q) continue;
          const prepared = prepareQuestion(q, rng);
          steps.push({
            kind: "check",
            sectionId: section.id,
            lessonId,
            question: q,
            params: paramsOf(prepared),
            view: viewOf(q, prepared),
          });
        } else {
          const q = questById.get(seg.apply);
          if (!q) continue;
          const prepared = prepareQuestion(q, rng);
          steps.push({ kind: "apply", sectionId: section.id, lessonId, question: q, view: viewOf(q, prepared) });
        }
      }
    }

    // Section assessment — deterministic items only (Phase 1).
    const a = section.assessment;
    const pool = topic.questions.filter(
      (q) =>
        (q.type === "multiple_choice" || q.type === "text_input") &&
        (a.from_ids.includes(q.id) || q.tags.some((t) => a.from_tags.includes(t))),
    );
    const drawn = shuffle(pool, rng).slice(0, a.count);
    steps.push({
      kind: "assessment",
      sectionId: section.id,
      title: a.title,
      passThreshold: threshold,
      items: drawn.map((q) => {
        const prepared = prepareQuestion(q, rng);
        return { question: q, params: paramsOf(prepared), view: viewOf(q, prepared) };
      }),
    });
  }

  return {
    topicId: topic.topic?.id ?? "unknown",
    topicTitle: topic.topic?.title ?? "Lesson",
    sections,
    steps,
  };
}
