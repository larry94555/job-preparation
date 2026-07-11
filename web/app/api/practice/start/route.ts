import { type NextRequest, NextResponse } from "next/server";
import { type PracticeKind, startPractice } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/practice/start  { kind, topic? }
// → title + sanitized item views + descriptor (echoed back to grade). Mock adds
//   timeLimitSec. Review with nothing due returns { empty: true }. No answer keys.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { kind?: string; topic?: string };
  const kind = body.kind as PracticeKind;
  if (kind !== "review" && kind !== "mock" && kind !== "cumulative") {
    return NextResponse.json({ error: "unknown practice kind" }, { status: 400 });
  }
  const result = await startPractice(userId, kind, body.topic);
  if ("error" in result) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
