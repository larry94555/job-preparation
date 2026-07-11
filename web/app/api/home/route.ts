import { NextResponse } from "next/server";
import { homeData } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/home → topic list with dashboards + readiness (for the signed-in user).
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json(await homeData(userId));
}
