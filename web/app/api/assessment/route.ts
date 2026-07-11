import { type NextRequest, NextResponse } from "next/server";
import { gradeMultipleChoice, gradeTextInput } from "@job-prep/engine";
import { BANDS, recordSnapshot, scheduleReview, sectionBand } from "@job-prep/lesson";
import { loadContext, mutateProgress } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/assessment?topic=... → grade the section assessment items; update
// assessmentBest + review + snapshot; return score/band. Keys stay server-side.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const topicId = req.nextUrl.searchParams.get("topic") ?? "";
  const ctx = await loadContext(userId, topicId);
  if (!ctx) return NextResponse.json({ error: "unknown topic" }, { status: 404 });

  const { pt, progress } = ctx;
  const cur = pt.steps[progress.index];
  if (cur?.kind !== "assessment") {
    return NextResponse.json({ error: "not an assessment step" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { answers?: Record<string, string> };
  const answers = body.answers ?? {};
  const now = Date.now();

  // Grade each item purely (deterministic MC/text_input by construction).
  const review = cur.items.map((it) => {
    const a = String(answers[it.question.id] ?? "");
    const correct =
      it.question.type === "multiple_choice"
        ? gradeMultipleChoice(it.question, a)
        : it.question.type === "text_input"
          ? gradeTextInput(it.question, a, it.params)
          : false;
    return { id: it.question.id, correct };
  });

  const correct = review.filter((r) => r.correct).length;
  const score = cur.items.length ? correct / cur.items.length : 0;

  // Apply review schedules + best score + snapshot atomically.
  const saved = await mutateProgress(userId, topicId, (p) => {
    for (const r of review) {
      p.review[r.id] = scheduleReview(p.review[r.id], r.correct, now);
    }
    p.assessmentBest[cur.sectionId] = Math.max(p.assessmentBest[cur.sectionId] ?? 0, score);
    recordSnapshot(p, pt, now);
  });

  const band = sectionBand(pt, saved, cur.sectionId);
  return NextResponse.json({
    correct,
    total: cur.items.length,
    score,
    passed: score >= cur.passThreshold,
    passThreshold: cur.passThreshold,
    band,
    bandName: BANDS[band].name,
    review,
  });
}
