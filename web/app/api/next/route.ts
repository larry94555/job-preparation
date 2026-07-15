import { type NextRequest, NextResponse } from "next/server";
import { recordSnapshot } from "@job-prep/lesson";
import { loadContext, mutateProgress, promptOverridesFor, stateFor } from "@/lib/lesson-service";
import { currentSessionId, currentUserId } from "@/lib/session";

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
  const now = Date.now();
  // Advance + record view/snapshot atomically; reflect the result in the response.
  ctx.progress = await mutateProgress(userId, topicId, (p) => {
    if (cur?.kind === "material" && !p.viewedSections.includes(cur.sectionId)) {
      p.viewedSections.push(cur.sectionId);
    }
    if (p.index < pt.steps.length) p.index++;
    recordSnapshot(p, pt, now);
  });
  return NextResponse.json(stateFor(ctx, promptOverridesFor(ctx, await currentSessionId())));
}
