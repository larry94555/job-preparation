import "server-only";
import { auth } from "@/auth";

/**
 * Resolve the signed-in user's stable id (their lowercased email) from the
 * Auth.js session, or null if unauthenticated. This is the id the ProgressStore
 * scopes each user's progress by, so every route must thread it through — no
 * route may use a fixed user.
 */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const id = session?.user?.id;
  return id ? id : null;
}
