import "server-only";
import { auth } from "@/auth";
import { GUEST_USER_ID, signupRequired } from "@/lib/access";

/**
 * Resolve the signed-in user's stable id (their lowercased email) from the
 * Auth.js session, or null if unauthenticated. This is the id the ProgressStore
 * scopes each user's progress by, so every route must thread it through — no
 * route may use a fixed user.
 *
 * When sign-up is NOT required (REQUIRE_SIGNUP=false), an unauthenticated visitor
 * resolves to the shared guest user instead of null, so every gated page/route
 * grants full access with no sign-in. A real signed-in session still wins, so
 * anyone who does sign up keeps their own private progress.
 */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (id) return id;
  return signupRequired() ? null : GUEST_USER_ID;
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
