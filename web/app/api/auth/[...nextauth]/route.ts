import { handlers } from "@/auth";

// Auth.js (NextAuth v5) route handlers — sign-in/out, callbacks, CSRF, session.
export const { GET, POST } = handlers;

export const runtime = "nodejs";
