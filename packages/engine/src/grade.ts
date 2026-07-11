import type { MultipleChoiceQuestion, TextInputQuestion } from "@job-prep/schema";
import { applyParams } from "./randomize.js";

/**
 * Deterministic (no-LLM) grading for multiple-choice and text-input questions.
 * Essay and code questions are graded by the LLM evaluators (later phases).
 */

/** Trim, lowercase, and collapse internal whitespace. */
export function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** True if `selectedText` matches a correct option. */
export function gradeMultipleChoice(q: MultipleChoiceQuestion, selectedText: string): boolean {
  return q.options.some((o) => o.correct && o.text === selectedText);
}

/**
 * Grade a text-input answer against its `answer` spec, applying resolved
 * parameter values (for parameterized questions) to `equals` first.
 */
export function gradeTextInput(
  q: TextInputQuestion,
  answer: string,
  params: Record<string, string> = {},
): boolean {
  const a = q.answer;

  if (a.equals !== undefined) {
    const expected = applyParams(a.equals, params);
    if (a.numeric_tolerance !== undefined) {
      const e = Number(expected);
      const g = Number(String(answer).trim());
      return Number.isFinite(e) && Number.isFinite(g) && Math.abs(e - g) <= a.numeric_tolerance;
    }
    return a.normalize ? normalizeText(expected) === normalizeText(answer) : expected === answer;
  }

  if (a.regex !== undefined) {
    // `normalize` lowercases the answer; compile the pattern case-insensitive to match.
    // (JS RegExp does not support inline `(?i)` flags — authors write plain patterns.)
    const re = new RegExp(a.regex, a.normalize ? "i" : "");
    return re.test(a.normalize ? normalizeText(answer) : answer);
  }

  return false;
}
