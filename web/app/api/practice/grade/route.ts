import { type NextRequest, NextResponse } from "next/server";
import { gradePractice, type PracticeDescriptor } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/practice/grade  { descriptor, answers }
// The client echoes back the descriptor it got from /start; we re-derive the
// same server-side items deterministically (same seed/topic), grade, update
// SM-2 state, and persist. Stateless — no server session.
export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    descriptor?: PracticeDescriptor;
    answers?: Record<string, string>;
  };
  if (!body.descriptor || typeof body.descriptor.now !== "number") {
    return NextResponse.json({ error: "missing practice descriptor" }, { status: 400 });
  }
  const result = await gradePractice(userId, body.descriptor, body.answers ?? {});
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
