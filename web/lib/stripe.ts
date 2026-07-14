import "server-only";
import Stripe from "stripe";

let cached: Stripe | null | undefined;

/**
 * The Stripe client, or null when STRIPE_SECRET_KEY isn't set (local dev / build
 * with no keys). Callers degrade gracefully so the app builds and runs without
 * payments configured. Built once and cached.
 */
export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  cached = key ? new Stripe(key) : null;
  return cached;
}

/** True when donations can be taken (secret key present). */
export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
