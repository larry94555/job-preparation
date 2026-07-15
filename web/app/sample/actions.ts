"use server";

import { gradeSampleCheck } from "@/lib/lesson-service";

/**
 * Server action: grade one sample check. Runs on the server so the answer key
 * stays server-side; takes no user and writes nothing (the sample is stateless).
 */
export async function gradeSampleCheckAction(
  questionId: string,
  answer: string,
  seed: number,
): Promise<{ correct: boolean; explanation: string }> {
  return gradeSampleCheck(questionId, answer, seed);
}
