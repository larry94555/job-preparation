"use server";

import { gradeQuickChoice } from "@/lib/lesson-service";

/** Grade one quick-assessment choice. Stateless; answer keys stay server-side. */
export async function gradeQuick(
  topicId: string,
  questionId: string,
  chosen: string,
): Promise<{ correct: boolean; explanation: string }> {
  return gradeQuickChoice(topicId, questionId, chosen);
}
