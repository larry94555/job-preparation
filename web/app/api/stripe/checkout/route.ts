import { type NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/stripe/checkout { amount } → create a "pay what you can" Checkout
// Session for a donor-chosen amount and return its hosted URL. Public: donations
// don't require sign-in. Card details are entered on Stripe's page, never here.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Donations aren't configured yet." }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { amount?: unknown };
  const dollars = Number(body.amount);
  if (!Number.isFinite(dollars) || dollars < 1) {
    return NextResponse.json({ error: "Please enter an amount of $1 or more." }, { status: 400 });
  }
  // Cap defensively so a typo can't create a huge charge intent.
  const amountCents = Math.round(Math.min(dollars, 10000) * 100);

  const origin = req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: { name: "Donation — thank you for your support!" },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/donate/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/donate`,
  });

  return NextResponse.json({ url: session.url });
}
