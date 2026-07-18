/**
 * Access mode — whether email sign-up + verification is required to use the site.
 *
 * Controlled by the `REQUIRE_SIGNUP` env var / secret:
 *   - unset or anything other than "false"  → **required** (the normal gated site;
 *     unauthenticated visitors are sent to sign-up). This is the default, so
 *     existing behavior is unchanged.
 *   - "false" (case-insensitive)             → **not required**: the whole site is
 *     open to anyone with no sign-up, so it can be validated end-to-end before an
 *     email-sending domain is set up.
 *
 * This module is intentionally NOT `server-only` and uses no Node APIs, so the
 * edge middleware can import it too.
 */
export function signupRequired(): boolean {
  return String(process.env.REQUIRE_SIGNUP ?? "true").trim().toLowerCase() !== "false";
}

/**
 * The shared user id anonymous visitors run as when sign-up is NOT required.
 * Their progress is scoped to this single id (shared across visitors) — fine for
 * a solo validation deploy; flip `REQUIRE_SIGNUP` back on for per-user accounts.
 */
export const GUEST_USER_ID = "guest";
