import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lazy singleton — never instantiated at module load, so the build
// succeeds even when STRIPE_SECRET_KEY is absent (e.g. CI).
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key);
  return _stripe;
}

interface IncomingBody {
  /** Total in GBP (decimal pounds, e.g. 12.99). Zoiko Mobile UK bills GBP. */
  totalGbp: number;
  /** Lightweight order context for Stripe metadata. Keep small — Stripe
   *  metadata has a 500-char value limit per key. */
  cartSummary?: {
    itemCount: number;
    variationIds: number[]; // up to ~30 ids
  };
  customerEmail?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;
    const gbp = Number(body.totalGbp);

    if (!gbp || isNaN(gbp) || gbp <= 0) {
      return NextResponse.json(
        { error: "Invalid totalGbp amount" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Build a minimal metadata payload — Stripe limits each value to 500
    // chars and there's a 50-key cap on the metadata object.
    const variationList = (body.cartSummary?.variationIds ?? [])
      .slice(0, 30)
      .join(",");

    const paymentIntent = await stripe.paymentIntents.create({
      // GBP is a 2-decimal currency, so Stripe expects integer pence.
      amount: Math.round(gbp * 100),
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      receipt_email: body.customerEmail || undefined,
      metadata: {
        itemCount: String(body.cartSummary?.itemCount ?? 0),
        variationIds: variationList,
        source: "zoiko-mobile-uk-checkout",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe PI Error:", message);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}