import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base Auth.js config: secret, session strategy, pages, and the JWT
 * callbacks — but NO adapter and NO providers (those live in auth.ts, which runs
 * on the Node runtime because the Drizzle adapter needs `pg`). The middleware
 * builds a lightweight `auth` from THIS config so session checks run on the edge
 * without pulling Postgres into the edge bundle. auth.ts spreads this and adds
 * the adapter + providers for the Node route handlers.
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

export const authConfig = {
  // A dev default keeps local build/dev/start working out of the box; real
  // deployments must set AUTH_SECRET.
  secret: process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/signup/check", // "check your email" after a magic link is sent
    error: "/help/signup", // auth errors land on the sign-up troubleshooter
  },
  // Providers are added in auth.ts (Node runtime). Empty here so the edge
  // middleware can verify JWT sessions without loading the adapter/providers.
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // On sign-in, `user` is present — stamp the stable id (lowercased email)
      // and role onto the JWT. This id is what the ProgressStore scopes by, so
      // auth identity and progress identity are the same value.
      if (user) {
        const email = (user.email ?? "").toLowerCase();
        token.id = email || token.sub || "";
        token.role = roleFor(email);
        // A fresh per-session id, minted once at sign-in. Lessons vary their
        // presentation (option order, reworded prompts) by session, so a new
        // login most likely reads a little differently even for identical content.
        token.sid = globalThis.crypto.randomUUID();
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
      (session as { sid?: string }).sid = (token.sid as string) ?? "";
      return session;
    },
  },
} satisfies NextAuthConfig;
