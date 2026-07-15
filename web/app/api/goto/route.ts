import { type NextRequest, NextResponse } from "next/server";
import { goToStep, stateFor } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/goto?topic=... { index } → move to an arbitrary step (clamped) and
// return the new state. Powers "← Back" and "Review the material ↑". Position
// change only — it doesn't alter seen/correct/review progress.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const topicId = req.nextUrl.searchParams.get("topic") ?? "";
  const body = (await req.json().catch(() => ({}))) as { index?: unknown };
  const index = Number(body.index);
  if (!Number.isFinite(index)) {
    return NextResponse.json({ error: "index required" }, { status: 400 });
  }
  const ctx = await goToStep(userId, topicId, index);
  if (!ctx) return NextResponse.json({ error: "unknown topic" }, { status: 404 });
  return NextResponse.json(stateFor(ctx));
}
