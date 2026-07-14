import { type NextRequest, NextResponse } from "next/server";
import { runWorker, wireDefaults } from "@job-prep/grading";
import { createJobQueue } from "@job-prep/store";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/grading/[jobId] → poll a grading job's status/result (DESIGN §8).
//
// Local-dev convenience: if the job is still `queued`, run ONE worker tick inline
// so the in-memory / file-queue path grades without a separate worker process.
// In production a real worker pool drains the queue and this route just reads.
// The job is owner-scoped by the session user — a user can only poll their own.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { jobId } = await params;
  const queue = createJobQueue();

  let job = await queue.get(jobId);
  if (!job) return NextResponse.json({ error: "unknown job" }, { status: 404 });
  if (job.userId !== userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Local dev only: grade one tick inline so the memory/file queue advances
  // without a separate worker process. In production the dedicated worker pool
  // (which holds the LLM credentials) drains the queue, and this route only
  // reads — the web service never grades, so the LLM key stays worker-side.
  if (job.status === "queued" && process.env.NODE_ENV !== "production") {
    await runWorker(queue, wireDefaults(), { max: 1 });
    job = (await queue.get(jobId)) ?? job;
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    result: job.status === "done" || job.status === "flagged" ? job.result : null,
  });
}
