"use server";

import { explainWrongChoice, gradeQuickChoice } from "@/lib/lesson-service";

/** Grade one quick-assessment choice. Deterministic + instant; keys stay server-side. */
export async function gradeQuick(
  topicId: string,
  questionId: string,
  chosen: string,
): Promise<{ correct: boolean; explanation: string }> {
  return gradeQuickChoice(topicId, questionId, chosen);
}

/** Fetch the tailored "why that's wrong" note (slow LLM) — called async, after
 *  the instant grade, so the UI can show a "thinking" state and fill it in. */
export async function explainWrong(
  topicId: string,
  questionId: string,
  chosen: string,
): Promise<{ explanation: string }> {
  return explainWrongChoice(topicId, questionId, chosen);
}
