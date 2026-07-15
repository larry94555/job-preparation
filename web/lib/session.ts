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

/**
 * The per-session id minted at sign-in (see auth.config.ts). Used to vary a
 * lesson's presentation — option order and reworded prompts — per session while
 * keeping it consistent within the session. Null when unauthenticated.
 */
export async function currentSessionId(): Promise<string | null> {
  const session = (await auth()) as { sid?: string } | null;
  return session?.sid ?? null;
}
