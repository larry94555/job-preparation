import { type NextRequest, NextResponse } from "next/server";
import { type Db, insertDonation } from "@job-prep/store";
import { authDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/stripe/webhook → Stripe calls this on payment events. We verify the
// signature against STRIPE_WEBHOOK_SECRET (raw body required), then record a
// completed donation. Public + unauthenticated by design (Stripe is the caller).
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new NextResponse("Stripe webhook not configured", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text(); // raw body — required for signature verification
  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const db = authDb();
    if (db && s.payment_status === "paid") {
      await insertDonation(db as unknown as Db, {
        id: s.id,
        amountCents: s.amount_total ?? 0,
        currency: s.currency ?? "usd",
        email: s.customer_details?.email ?? s.customer_email ?? null,
      });
    }
  }

  return NextResponse.json({ received: true });
}
