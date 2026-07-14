import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Build a lightweight, EDGE-SAFE `auth` from the base config only (no adapter,
// no providers, no `pg`) — enough to verify the JWT session in middleware. The
// full auth.ts (adapter + providers) runs only on the Node route handlers.
const { auth } = NextAuth(authConfig);

/**
 * Public paths anyone may reach without signing in: the marketing/home surface,
 * the topic catalog, the free sample lesson, the sign-up + help flows, the sign-in
 * page, the Auth.js endpoints, and the read-only home API. A path matches if it
 * equals a base or is a sub-path of it (`/help/signup` matches `/help`), so the
 * as-yet-unbuilt `/signup`, `/help`, and `/sample` routes are already ungated for
 * later phases. Everything NOT listed here stays behind authentication.
 */
const PUBLIC_BASES = [
  "/topics", // the public catalog
  "/sample", // the free, no-login sample lesson (and its sub-paths)
  "/signup", // registration + its confirmation sub-pages
  "/help", // help + /help/signup troubleshooting
  "/login", // sign-in page
  "/donate", // "pay what you can" donations (no sign-in required)
  "/premium", // premium preview (marketing)
  "/privacy", // privacy policy
  "/terms", // terms of use
  "/api/home", // read-only catalog/home data
  "/api/auth", // Auth.js (sign-in/out, callbacks, magic-link verify)
  "/api/stripe", // checkout session creation + the Stripe webhook
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true; // the home page itself
  return PUBLIC_BASES.some((base) => pathname === base || pathname.startsWith(base + "/"));
}

/**
 * Gate the app behind authentication EXCEPT for the public paths above.
 * Unauthenticated requests to a gated path are redirected to /login (page
 * navigations) or get a clean 401 (API routes). The matcher below already
 * excludes static assets and Next internals.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    // API routes get a clean 401; page navigations get redirected to /login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
