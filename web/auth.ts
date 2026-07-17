import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "@job-prep/store";
import { eq } from "drizzle-orm";
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { cookies } from "next/headers";
import { authConfig } from "./auth.config";
import { authDb } from "@/lib/db";

/** Short-lived cookie carrying the name typed on the sign-up form. A magic link
 *  only transports an email, so the name is stashed here at sign-up and applied
 *  to the user row when verification actually creates them. */
export const SIGNUP_NAME_COOKIE = "signup_name";

/**
 * Full Auth.js config (Node runtime — the Drizzle adapter needs `pg`). Spreads
 * the edge-safe base (auth.config.ts) and adds the adapter + providers.
 *
 * Sign-in methods, each enabled only when its prerequisites are present so local
 * file-store dev and CI builds work with no database:
 *  - **Resend magic link** — the real, passwordless email sign-in. Needs both a
 *    database (adapter, for verification tokens + users) and RESEND_API_KEY.
 *  - **Dev credentials stub** — no password check; ONLY outside production, for
 *    local development without email.
 *  - **Google / GitHub OAuth** — enabled when their env keys are set.
 */

const db = authDb();

// The Drizzle adapter, with `createUser` overridden so a new user's id is their
// lowercased email — the same stable key lesson_progress is scoped by, so auth
// identity and progress identity never diverge.
const adapter: Adapter | undefined = db
  ? (() => {
      const base = DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      });
      return {
        ...base,
        createUser: (user) =>
          base.createUser!({ ...user, id: (user.email ?? user.id).toLowerCase() }),
      };
    })()
  : undefined;

/**
 * Outbound mail has two interchangeable transports; either one enables the
 * magic-link sign-up. SMTP is preferred when both are set.
 *
 *  - **SMTP (`nodemailer`)** — any relay: OCI Email Delivery, SES, a corporate
 *    smarthost. Uses the submission port (587), NOT port 25, so it works on a
 *    cloud host that blocks 25 (as OCI does by default).
 *  - **Resend** — an HTTP API; no SMTP ports needed at all.
 *
 * Both still require a database: the adapter stores the verification tokens.
 * The transport only DELIVERS the link; it never verifies anything itself.
 */
export const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const resendConfigured = !!process.env.RESEND_API_KEY;

/**
 * The id of the magic-link provider that is ACTUALLY registered below — the exact
 * string a `signIn(...)` call for email must use. It's `"nodemailer"` when SMTP is
 * set (preferred) and `"resend"` for the HTTP fallback, so the sign-up form must
 * read this rather than hardcode a name: hardcoding `"resend"` while SMTP is
 * configured asks Auth.js for a provider that doesn't exist, and nothing sends.
 */
export const emailProviderId: "nodemailer" | "resend" | null =
  db && smtpConfigured ? "nodemailer" : db && resendConfigured ? "resend" : null;
const emailAuthConfigured = emailProviderId !== null;

const providers: NextAuthConfig["providers"] = [];

if (db && smtpConfigured) {
  providers.push(
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        // 587 = STARTTLS (secure:false upgrades in-band); 465 = implicit TLS.
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    }),
  );
} else if (db && resendConfigured) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    }),
  );
}

if (process.env.NODE_ENV !== "production") {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Local dev sign-in",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
      },
      // Dev stub: no password check. Accept any email, mint a user keyed by the
      // lowercased email (the stable id the store scopes progress by).
      authorize(raw) {
        const email = String(raw?.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) return null;
        const name = String(raw?.name ?? "").trim() || email.split("@")[0];
        return { id: email, name, email };
      },
    }),
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

/** True when at least one OAuth provider is configured (for the login UI). */
export const oauthConfigured = !!(
  (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) ||
  (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
);

/** True when passwordless email sign-in is available (adapter + Resend key). */
export { emailAuthConfigured };

/** True only when the dev credentials stub is actually REGISTERED above. The UI
 *  must gate on this: in production the provider does not exist, so rendering its
 *  form would offer a sign-in that can only fail. */
export const devAuthConfigured = process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  providers,
  events: {
    // A magic link carries only an email, so a newly verified user has no name.
    // Apply the one they typed on the sign-up form (stashed in a short-lived
    // cookie). Best-effort: a missing cookie or a failed write just leaves the
    // name unset — it must never break verification.
    async createUser({ user }) {
      if (!db || !user.id) return;
      try {
        const name = (await cookies()).get(SIGNUP_NAME_COOKIE)?.value?.trim();
        if (name) await db.update(users).set({ name }).where(eq(users.id, user.id));
      } catch {
        /* no request scope / write failed — leave the name unset */
      }
    },
  },
});
