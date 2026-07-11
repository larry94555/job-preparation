import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Gate the whole app behind authentication. Unauthenticated requests are
 * redirected to /login (or get a 401 for API routes). The matcher below already
 * excludes /api/auth/*, static assets, and Next internals; /login itself is
 * allowed through here so the sign-in page is reachable.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Always allow the sign-in page and the Auth.js endpoints.
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
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
