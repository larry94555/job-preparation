import { type NextRequest, NextResponse } from "next/server";
import { gradeMultipleChoice, gradeTextInput } from "@job-prep/engine";
import { BANDS, recordSnapshot, scheduleReview, sectionBand } from "@job-prep/lesson";
import { loadContext, saveProgress } from "@/lib/lesson-service";
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

  const review = cur.items.map((it) => {
    const a = String(answers[it.question.id] ?? "");
    // Assessment items are deterministic (MC or text_input) by construction —
    // buildPlaythrough filters the pool to those two types. Narrow explicitly so
    // the grader sees the concrete question shape.
    const correct =
      it.question.type === "multiple_choice"
        ? gradeMultipleChoice(it.question, a)
        : it.question.type === "text_input"
          ? gradeTextInput(it.question, a, it.params)
          : false;
    progress.review[it.question.id] = scheduleReview(progress.review[it.question.id], correct, now);
    return { id: it.question.id, correct };
  });

  const correct = review.filter((r) => r.correct).length;
  const score = cur.items.length ? correct / cur.items.length : 0;
  progress.assessmentBest[cur.sectionId] = Math.max(
    progress.assessmentBest[cur.sectionId] ?? 0,
    score,
  );
  recordSnapshot(progress, pt, now);
  await saveProgress(userId, topicId, progress);

  const band = sectionBand(pt, progress, cur.sectionId);
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
