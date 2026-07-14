import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "@job-prep/store";
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { authConfig } from "./auth.config";
import { authDb } from "@/lib/db";

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

const emailAuthConfigured = !!(db && process.env.RESEND_API_KEY);

const providers: NextAuthConfig["providers"] = [];

if (emailAuthConfigured) {
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  providers,
});
