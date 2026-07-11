import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/session";
import LessonClient from "./LessonClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Topic lives in the URL. The loop itself is a Client Component that drives the
// present/check/apply/assessment interactions via the /api/* route handlers.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  if (!(await currentUserId())) redirect("/login");
  const { topic } = await params;
  return <LessonClient topic={topic} />;
}
