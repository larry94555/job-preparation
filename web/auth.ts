import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Auth.js (NextAuth v5) configuration — Phase 3 hosting: authentication +
 * real per-user scoping. DESIGN.md §12.
 *
 * The Credentials provider is the local dev stub ("log in as test user"): it
 * performs NO password check and simply mints a session for whatever
 * name/email is submitted. The user's lowercased email is used as the stable
 * `id`, which is what the ProgressStore scopes each user's `.progress/<id>/`
 * directory by — so per-user isolation falls out of a real id being threaded
 * through the app.
 *
 * OAuth (Google/GitHub) providers are wired conditionally behind env keys so
 * production can enable them without code changes; the dev-stub path is what is
 * exercised locally.
 */

/** Admin emails (comma-separated env). Everyone else is role "user". */
const ADMIN_EMAILS = new Set(
  (process.env.AUTH_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

function roleFor(email: string | null | undefined): "admin" | "user" {
  return email && ADMIN_EMAILS.has(email.toLowerCase()) ? "admin" : "user";
}

// Conditionally enable OAuth providers only when their env keys are present, so
// local dev works with just the credentials stub.
const oauthProviders = [];
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  oauthProviders.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

/** True when at least one real OAuth provider is configured (for the UI). */
export const oauthConfigured = oauthProviders.length > 0;

export const authConfig: NextAuthConfig = {
  // A dev default keeps local build/dev/start working out of the box; real
  // deployments must set AUTH_SECRET.
  secret: process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
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
        const email = String(raw?.email ?? "").trim().toLowerCase();
        if (!email) return null;
        const name = String(raw?.name ?? "").trim() || email.split("@")[0];
        return { id: email, name, email };
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    jwt({ token, user }) {
      // On sign-in, `user` is present — stamp the stable id + role onto the JWT.
      if (user) {
        const email = (user.email ?? "").toLowerCase();
        token.id = email || token.sub || "";
        token.role = roleFor(email);
      } else if (!token.role) {
        token.role = roleFor(typeof token.email === "string" ? token.email : "");
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub ?? "");
        session.user.role = (token.role as "admin" | "user") ?? "user";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
