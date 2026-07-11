import { type NextRequest, NextResponse } from "next/server";
import { recordSnapshot } from "@job-prep/lesson";
import { loadContext, saveProgress, stateFor } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/next?topic=... → advance index; record material views + snapshot.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const topicId = req.nextUrl.searchParams.get("topic") ?? "";
  const ctx = await loadContext(userId, topicId);
  if (!ctx) return NextResponse.json({ error: "unknown topic" }, { status: 404 });

  const { pt, progress } = ctx;
  const cur = pt.steps[progress.index];
  if (cur?.kind === "material" && !progress.viewedSections.includes(cur.sectionId)) {
    progress.viewedSections.push(cur.sectionId);
  }
  if (progress.index < pt.steps.length) progress.index++;
  recordSnapshot(progress, pt, Date.now());
  await saveProgress(userId, topicId, progress);
  return NextResponse.json(stateFor(ctx));
}
