import type { Question } from "@job-prep/schema";

export type Band = 0 | 1 | 2 | 3 | 4;

/** Client-safe view of a question — never carries the answer key. */
export interface QuestionView {
  id: string;
  type: string;
  prompt: string;
  options?: string[]; // multiple_choice (shuffled option text)
  inputKind?: "text"; // text_input
  referencePoints?: string[]; // essay application tasks
  language?: string; // code
}

export interface MaterialStep {
  kind: "material";
  sectionId: string;
  lessonId: string;
  lessonTitle: string;
  heading: string;
  html: string;
}

/** Formative check — instant feedback, never gates. */
export interface CheckStep {
  kind: "check";
  sectionId: string;
  lessonId: string;
  question: Question; // server-side (has key)
  params: Record<string, string>;
  view: QuestionView;
}

/** Application task (essay / code / config) — recorded; LLM-graded in Phase 2. */
export interface ApplyStep {
  kind: "apply";
  sectionId: string;
  lessonId: string;
  question: Question;
  view: QuestionView;
}

/** Summative section assessment — the mastery gate. */
export interface AssessmentStep {
  kind: "assessment";
  sectionId: string;
  title: string;
  passThreshold: number;
  items: { question: Question; params: Record<string, string>; view: QuestionView }[];
}

export type Step = MaterialStep | CheckStep | ApplyStep | AssessmentStep;

export interface SectionRef {
  id: string;
  title: string;
  lessonIds: string[];
  passThreshold: number;
}

export interface Playthrough {
  topicId: string;
  topicTitle: string;
  sections: SectionRef[];
  steps: Step[];
}
