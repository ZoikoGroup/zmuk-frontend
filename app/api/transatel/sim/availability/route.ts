import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/transatel/sim/availability
 *
 * Tallies how many SIMs of each type the order needs (e.g. esim=1, psim=2) from
 * the cart, then asks Django for that many of the latest available SIMs of each
 * type. Read-only — it does NOT reserve anything; the checkout still calls
 * POST /api/v1/sim/sims/reserve/ or /api/v1/sim/sim-orders/ to actually hold.
 *
 * Request body (any of these shapes):
 *   { items: [ { simType, quantity }, ... ] }          // buildItems() output
 *   { items: [ { metadata: { simType }, quantity } ] } // raw localStorage cart
 *   { esim: 1, psim: 2 }                               // explicit counts
 *
 * Response (passes through Django's body from availability/latest/):
 *   200 { success, requested, returned, shortfall, sufficient, sims: { esim:[…], psim:[…] } }
 *   502 { success: false, message, requested }         — backend unreachable
 *
 * Type mapping is handled Django-side: esim → eUICC, psim → UICC.
 */

// Prefer a server-only base URL if one is configured; fall back to the
// NEXT_PUBLIC one already used elsewhere in the app (see page.tsx) so this
// route works out of the box without adding a new env var.
const DJANGO_API_BASE_URL =
  process.env.API_URL ||
  process.env.DJANGO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL;

type SimType = "esim" | "psim";
type Counts = Record<SimType, number>;

interface CartLike {
  simType?: string;
  quantity?: number | string;
  metadata?: { simType?: string };
}

interface AvailabilityBody {
  esim?: number | string;
  psim?: number | string;
  items?: CartLike[];
}

/** Turn the request body into { esim, psim } quantities. */
function tallyRequested(body: AvailabilityBody | CartLike[]): Counts {
  const counts: Counts = { esim: 0, psim: 0 };

  // Explicit counts: { esim: 1, psim: 2 }
  if (!Array.isArray(body) && (body?.esim !== undefined || body?.psim !== undefined)) {
    counts.esim = Math.max(0, Math.floor(Number(body.esim) || 0));
    counts.psim = Math.max(0, Math.floor(Number(body.psim) || 0));
    return counts;
  }

  // Otherwise derive from the cart lines.
  const items: CartLike[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.items)
      ? body.items
      : [];

  for (const item of items) {
    const raw = String(item?.simType ?? item?.metadata?.simType ?? "").toLowerCase();
    const type: SimType = raw === "esim" ? "esim" : "psim";
    const qty = Math.max(1, Math.floor(Number(item?.quantity ?? 1) || 1));
    counts[type] += qty;
  }
  return counts;
}

export async function POST(request: NextRequest) {
  if (!DJANGO_API_BASE_URL) {
    return NextResponse.json(
      { success: false, message: "Backend API URL is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as AvailabilityBody | CartLike[];
  const requested = tallyRequested(body);

  // Django returns that many of the latest available SIMs per type, plus the
  // requested / returned / shortfall / sufficient breakdown.
  const upstreamUrl = new URL(
    "/api/v1/sims/availability/latest/",
    DJANGO_API_BASE_URL,
  );

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requested),
      // Availability changes constantly — never cache this route.
      cache: "no-store",
    });

    const data = await upstreamRes.json().catch(() => ({}));

    // Pass Django's status and body straight through.
    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (err) {
    console.error("❌ /api/transatel/sim/availability upstream error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Could not reach the SIM inventory service.",
        requested,
      },
      { status: 502 },
    );
  }
}