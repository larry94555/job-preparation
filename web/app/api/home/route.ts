import { NextResponse } from "next/server";
import { catalogData, homeData } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/home → for a signed-in user, the topic list with dashboards +
// readiness; for an anonymous visitor, the read-only public catalog (title +
// description per topic, no progress).
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json(await catalogData());
  return NextResponse.json(await homeData(userId));
}
