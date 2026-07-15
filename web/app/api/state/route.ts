import { type NextRequest, NextResponse } from "next/server";
import { loadContext, promptOverridesFor, stateFor } from "@/lib/lesson-service";
import { currentSessionId, currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/state?topic=... → sanitized current step + total + dashboard.
export async function GET(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const topic = req.nextUrl.searchParams.get("topic") ?? "";
  const ctx = await loadContext(userId, topic);
  if (!ctx) return NextResponse.json({ error: "unknown topic" }, { status: 404 });
  return NextResponse.json(stateFor(ctx, promptOverridesFor(ctx, await currentSessionId())));
}
