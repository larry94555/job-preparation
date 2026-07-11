import type { DefaultSession } from "next-auth";

/**
 * Module augmentation: expose the stable user `id` and `role` we stamp onto the
 * JWT/session in web/auth.ts so route handlers and pages typecheck.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "user";
  }
}
