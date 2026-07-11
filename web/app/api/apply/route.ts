import { type NextRequest, NextResponse } from "next/server";
import type { GradingPayload } from "@job-prep/grading";
import { createJobQueue } from "@job-prep/store";
import { loadContext, readTestFile, saveProgress } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/apply?topic=... → ENQUEUE an open-ended (essay/code) grading job and
// return immediately (DESIGN §8: async grading — the single-slot model can't grade
// synchronously in a multi-user app). A worker pool grades the job later; the
// client polls /api/grading/[jobId]. Deterministic MC/text checks grade inline
// elsewhere and are unaffected.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const topicId = req.nextUrl.searchParams.get("topic") ?? "";
  const ctx = await loadContext(userId, topicId);
  if (!ctx) return NextResponse.json({ error: "unknown topic" }, { status: 404 });

  const { topic, pt, progress } = ctx;
  const cur = pt.steps[progress.index];
  if (cur?.kind !== "apply") {
    return NextResponse.json({ error: "not an apply step" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { answer?: unknown };
  const answer = String(body.answer ?? "");
  const q = cur.question;
  if (q.type !== "essay" && q.type !== "code") {
    return NextResponse.json({ error: "not an open-ended task" }, { status: 400 });
  }

  const skillId = q.eval_skill;
  const skill = skillId ? topic.skills.find((sk) => sk.frontmatter.id === skillId) : undefined;
  const calibration = skill
    ? topic.calibration.find((c) => c.skill === skill.frontmatter.id)
    : undefined;
  const referencePoints = q.type === "essay" ? q.reference_points : [];
  const testCode =
    q.type === "code" && q.test_file ? (readTestFile(topic, q.test_file) ?? undefined) : undefined;

  const payload: GradingPayload = {
    answer,
    skill,
    referencePoints,
    calibration,
    testCode,
  };

  // Enqueue the grading job. Deterministic types never reach here.
  const queue = createJobQueue();
  const jobId = await queue.enqueue({
    userId,
    topicId,
    questionId: q.id,
    kind: q.type,
    payload,
  });

  // Persist the attempt as pending so a reload shows "grading in progress".
  progress.pending = { ...(progress.pending ?? {}), [q.id]: { jobId, at: Date.now() } };
  await saveProgress(userId, topicId, progress);

  return NextResponse.json({ jobId, status: "queued" });
}
