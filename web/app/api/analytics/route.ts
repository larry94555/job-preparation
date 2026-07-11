import { NextResponse } from "next/server";
import { analyticsData } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/analytics → mastery-now, mastery-over-time trend, SM-2 retention,
// and per-topic mastery bars (for the signed-in user).
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json(await analyticsData(userId));
}
