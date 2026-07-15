import { type NextRequest, NextResponse } from "next/server";
import { gradeMultipleChoice, gradeTextInput } from "@job-prep/engine";
import { recordSnapshot, scheduleReview } from "@job-prep/lesson";
import { explainWrongAnswer, loadContext, mutateProgress } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/answer?topic=... → grade the current check; update seen/correct +
// review + snapshot; return correct + explanation. Answer keys stay server-side.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const topicId = req.nextUrl.searchParams.get("topic") ?? "";
  const ctx = await loadContext(userId, topicId);
  if (!ctx) return NextResponse.json({ error: "unknown topic" }, { status: 404 });

  const { pt, progress } = ctx;
  const cur = pt.steps[progress.index];
  if (cur?.kind !== "check") {
    return NextResponse.json({ error: "not a check step" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { answer?: unknown };
  const answer = String(body.answer ?? "");
  const now = Date.now();

  const correct =
    cur.question.type === "multiple_choice"
      ? gradeMultipleChoice(cur.question, answer)
      : cur.question.type === "text_input"
        ? gradeTextInput(cur.question, answer, cur.params)
        : false;

  // Accumulate seen/correct + review + snapshot atomically against the freshest
  // stored progress, so a concurrent write for this user+topic isn't lost.
  await mutateProgress(userId, topicId, (p) => {
    if (!p.seenChecks.includes(cur.question.id)) p.seenChecks.push(cur.question.id);
    if (correct && !p.correctChecks.includes(cur.question.id)) {
      p.correctChecks.push(cur.question.id);
    }
    p.review[cur.question.id] = scheduleReview(p.review[cur.question.id], correct, now);
    recordSnapshot(p, pt, now);
  });

  // Feedback: the authored explanation by default; on a wrong answer, prefer a
  // tailored plain-English "why that's not right" from the LLM (best-effort — it
  // falls back to the authored explanation if the LLM isn't available).
  let explanation =
    cur.question.type === "multiple_choice" ? (cur.question.explanation ?? "") : "";
  if (!correct) {
    const tailored = await explainWrongAnswer(cur.question, answer);
    if (tailored) explanation = tailored;
  }

  return NextResponse.json({ correct, explanation });
}
