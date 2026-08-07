"use client";

/**
 * Malima / Orange IoT — client orchestration helper
 * --------------------------------------------------
 *
 * Replaces the BeQuick `processOrderStripe` path entirely. New flow:
 *
 *   1. allocateSimsFromDjango(cart)
 *        Django reserves msisdn/imsi/iccid triples from its inventory.
 *   2. createMalimaOrder(enrichedCart)
 *        One POST per SIM to api.orange.com/.../productOrders/ via the
 *        internal /api/malima/create-order route (server-side OAuth2).
 *   3. saveMalimaOrderToDjango(malimaResponse, extra)
 *        Captures the full result + reservation ids + customer context
 *        in Django for reconciliation.
 *
 * The orchestrator `processOrderMalima` wires all three steps together so
 * the checkout component just calls it once.
 *
 * Volume convention
 * -----------------
 * Aligned with the WP plugin (`class-malima-api-client.php::build_orange_item`):
 * `addedBucket.volume` is sent to Orange as a string of **megabytes**.
 *   - 2 GB → "2000"
 *   - 500 MB → "500"
 * `toMalimaCart` normalises any reasonable input (GB / MB / decimal / suffix)
 * to MB before forwarding to the server route.
 *
 * The browser never sees the Orange OAuth2 bearer; it lives server-side.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface MalimaCartItem {
  cartIndex: number;
  unitIndex: number;
  planId?: string | number | null;
  bqPlanID?: string | null;
  planName?: string | null;
  simType?: string | null;             // "eSIM" | "pSIM" (others filtered out)
  durationDays?: number | string | null;
  /** Data allowance in **MB** (string). */
  dataVolume?: number | string | null;
  roamingZone?: string | null;
  msisdn?: string | null;              // filled by Django allocation
  imsi?: string | null;                // filled by Django allocation
  iccid?: string | null;               // filled by Django allocation
  reservation_id?: string | null;      // Django-side bookkeeping
  qty?: number;
}

export interface SimAllocation {
  cartIndex: number;
  unitIndex: number;
  msisdn: string;
  imsi: string;
  iccid: string;
  reservation_id?: string | null;
}

export interface AllocateResponse {
  success: boolean;
  message?: string;
  allocations?: SimAllocation[];
  response?: unknown;
}

export interface MalimaResult {
  cartIndex: number;
  planId: string | number | null;
  simType: string | null;
  status: number;
  ok: boolean;
  request: Record<string, unknown>;
  response: unknown;
  orangeOrderId?: string;
  msisdn?: string | null;
  imsi?: string | null;
  iccid?: string | null;
  error?: string;
}

export interface MalimaCreateResponse {
  status: boolean;
  message: string;
  results: MalimaResult[];
}

export interface ProcessOrderResult {
  status: boolean;
  message: string;
  /** Reason it stopped, if status === false. */
  stage: "empty_cart" | "allocate_failed" | "malima_failed" | "save_failed" | "ok";
  allocations: SimAllocation[];
  malima: MalimaCreateResponse;
  saved?: { success: boolean; message: string; response?: unknown };
}

// ── Extraction helpers ───────────────────────────────────────────────────────

/**
 * Convert any reasonable volume input into a string of **megabytes**.
 * Mirrors the WP plugin's `build_orange_item`.
 *
 *   "2GB"      → "2000"
 *   "500 MB"   → "500"
 *   "2"        → "2000"   (decimal numbers < 50 assumed GB)
 *   "2000"     → "2000"   (decimal numbers ≥ 50 assumed MB)
 *   2          → "2"      (numbers assumed already MB unless very small)
 *   0.2        → "200"    (< 50 → assumed GB → MB)
 *   null       → null     (caller decides default)
 */
export function normaliseVolumeMB(raw: unknown): string | null {
  if (raw == null || raw === "") return null;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw <= 0) return null;
    return raw < 50 ? String(Math.round(raw * 1000)) : String(Math.round(raw));
  }

  const s = String(raw).trim();
  if (!s) return null;

  const numeric = s.match(/^(\d+(?:\.\d+)?)$/);
  if (numeric) {
    const n = parseFloat(numeric[1]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n < 50 ? String(Math.round(n * 1000)) : String(Math.round(n));
  }

  const withUnit = s.toUpperCase().replace(/\s+/g, "").match(/^(\d+(?:\.\d+)?)(GB|MB|G|M)$/);
  if (withUnit) {
    const val = parseFloat(withUnit[1]);
    const unit = withUnit[2];
    if (!Number.isFinite(val) || val <= 0) return null;
    return unit.startsWith("M") ? String(Math.round(val)) : String(Math.round(val * 1000));
  }

  return null;
}

/** Parse "8 Days" / "30-days" / "30" / 30 → integer days. Returns null on miss. */
export function parseDurationDays(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, Math.round(raw));
  const s = String(raw).trim();
  if (!s) return null;
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Extract a roaming zone from a plan title.
 *   "Orbit Explore — 2GB • Europe & UK • 8 days" → "Europe"
 */
const KNOWN_ZONES = ["Europe", "UK", "USA", "World", "France", "Spain", "Germany", "Italy"];
function zoneFromTitle(title: string): string | null {
  if (!title) return null;
  const lower = title.toLowerCase();
  const found = KNOWN_ZONES.find((z) => lower.includes(z.toLowerCase()));
  return found ?? null;
}

/** Pull a value from any of a list of fields on an object. */
function pick<T = unknown>(obj: Record<string, unknown> | null | undefined, keys: string[]): T | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return null;
}

// ── Cart shaping ─────────────────────────────────────────────────────────────

/**
 * Flatten the checkout cart into one MalimaCartItem per SIM **unit**.
 *
 * The input can be either:
 *   • the raw localStorage cart (rich fields, possibly with `_raw`/`formData`), or
 *   • the lightweight `buildProducts()` output (planTitle, duration, simType…).
 *
 * For each item we resolve durationDays / dataVolume (MB) / roamingZone from
 * the first available source — explicit field → nested `_raw` → plan title
 * regex. Only eSIM/pSIM items are emitted; non-SIM lines are dropped here so
 * allocations and Malima calls line up index-for-index.
 */
export function toMalimaCart(items: unknown[]): MalimaCartItem[] {
  if (!Array.isArray(items)) return [];
  const out: MalimaCartItem[] = [];

  items.forEach((raw, cartIndex) => {
    const item = (raw ?? {}) as Record<string, unknown>;

    // ── simType gate ────────────────────────────────────────────────────
    const simTypeRaw = (item.simType as string | null) ?? null;
    const simType = (simTypeRaw || "").toLowerCase();
    if (simType !== "esim" && simType !== "psim") return;

    const formData = (item.formData ?? {}) as Record<string, unknown>;
    const nested = (item._raw ?? {}) as Record<string, unknown>;

    const planTitle =
      (item.planTitle as string | null) ??
      (item.planName as string | null) ??
      (nested.planTitle as string | null) ??
      (nested.planName as string | null) ??
      "";

    // ── durationDays ─────────────────────────────────────────────────────
    const durationDays =
      parseDurationDays(
        pick<number | string>(item, ["durationDays", "duration", "planDuration"]) ??
        pick<number | string>(nested, ["durationDays", "duration", "planDuration"]) ??
        planTitle
      ) ?? null;

    // ── dataVolume (always MB string) ────────────────────────────────────
    let dataVolume =
      normaliseVolumeMB(
        pick<number | string>(item, ["dataVolume", "data_volume", "dataVolumeMB", "dataAllowance"]) ??
        pick<number | string>(nested, ["dataVolume", "data_volume", "dataVolumeMB", "dataAllowance"])
      );
    if (dataVolume == null) {
      // Last resort: scan the plan title for "2GB" / "500MB".
      const m = planTitle.match(/(\d+(?:\.\d+)?)\s*(GB|MB|G|M)\b/i);
      if (m) dataVolume = normaliseVolumeMB(`${m[1]}${m[2]}`);
    }

    // ── roamingZone ──────────────────────────────────────────────────────
    let roamingZone =
      pick<string>(item, ["roamingZone", "roaming_zone"]) ??
      pick<string>(nested, ["roamingZone", "roaming_zone"]) ??
      null;
    if (!roamingZone) roamingZone = zoneFromTitle(planTitle);

    // ── quantity ─────────────────────────────────────────────────────────
    const qty = Math.max(
      1,
      Number(item.quantity ?? formData.priceQty ?? item.qty ?? 1) || 1,
    );

    for (let unitIndex = 0; unitIndex < qty; unitIndex++) {
      out.push({
        cartIndex,
        unitIndex,
        planId: (item.planId as string | number | null) ?? null,
        bqPlanID: (item.bqPlanID as string | null) ?? null,
        planName:
          (item.planName as string | null) ??
          (item.planTitle as string | null) ??
          null,
        simType: simTypeRaw,
        durationDays,
        dataVolume,
        roamingZone,
        msisdn: null,
        imsi: null,
        iccid: null,
        reservation_id: null,
        qty: 1, // already flattened
      });
    }
  });

  return out;
}

// ── Step 1: allocate ─────────────────────────────────────────────────────────

export async function allocateSimsFromDjango(
  cart: MalimaCartItem[]
): Promise<AllocateResponse> {
  const res = await fetch("/api/malima/allocate-sims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cart: cart.map((c) => ({
        cartIndex: c.cartIndex,
        unitIndex: c.unitIndex,
        planId: c.planId,
        bqPlanID: c.bqPlanID,
        simType: c.simType,
        roamingZone: c.roamingZone,
      })),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<AllocateResponse>;
  return {
    success: Boolean(json.success),
    message: json.message || (res.ok ? "OK" : `HTTP ${res.status}`),
    allocations: Array.isArray(json.allocations) ? json.allocations : [],
    response: json.response,
  };
}

export function applyAllocations(
  cart: MalimaCartItem[],
  allocations: SimAllocation[]
): { enriched: MalimaCartItem[]; missing: MalimaCartItem[] } {
  const key = (c: { cartIndex: number; unitIndex: number }) =>
    `${c.cartIndex}:${c.unitIndex}`;
  const byKey = new Map(allocations.map((a) => [key(a), a]));

  const enriched: MalimaCartItem[] = [];
  const missing: MalimaCartItem[] = [];

  for (const item of cart) {
    const a = byKey.get(key(item));
    if (a && a.msisdn && a.imsi && a.iccid) {
      enriched.push({
        ...item,
        msisdn: a.msisdn,
        imsi: a.imsi,
        iccid: a.iccid,
        reservation_id: a.reservation_id ?? null,
      });
    } else {
      missing.push(item);
    }
  }
  return { enriched, missing };
}

// ── Step 2: create on Orange ─────────────────────────────────────────────────

export async function createMalimaOrder(
  cart: MalimaCartItem[]
): Promise<MalimaCreateResponse> {
  const res = await fetch("/api/malima/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<MalimaCreateResponse>;
  return {
    status: Boolean(json.status),
    message: json.message || (res.ok ? "OK" : `HTTP ${res.status}`),
    results: Array.isArray(json.results) ? json.results : [],
  };
}

// ── Step 3: save ─────────────────────────────────────────────────────────────

export async function saveMalimaOrderToDjango(
  malimaResponse: MalimaCreateResponse,
  extra: Record<string, unknown> = {}
): Promise<{ success: boolean; message: string; response?: unknown }> {
  const res = await fetch("/api/malima/save-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ malima: malimaResponse, ...extra }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    response?: unknown;
  };
  return {
    success: Boolean(json.success),
    message: json.message || (res.ok ? "OK" : `HTTP ${res.status}`),
    response: json.response,
  };
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Full Malima order pipeline. Replaces `processOrderStripe`.
 *
 * @param rawCart    cart from localStorage / state. Can be the raw cart
 *                   (richer, preferred) or the buildProducts() output.
 * @param context    extra metadata to persist alongside the Malima record
 *                   (billing address, totals, payment intent id, etc.)
 */
export async function processOrderMalima(
  rawCart: unknown[],
  context: Record<string, unknown> = {}
): Promise<ProcessOrderResult> {
  const empty: MalimaCreateResponse = {
    status: true,
    message: "skipped",
    results: [],
  };

  // 0️⃣ Flatten + filter
  const flatCart = toMalimaCart(rawCart);
  if (flatCart.length === 0) {
    return {
      status: true,
      message: "No eSIM/pSIM items in cart — Malima skipped.",
      stage: "empty_cart",
      allocations: [],
      malima: empty,
    };
  }

  // 1️⃣ Allocate SIMs via Django
  const alloc = await allocateSimsFromDjango(flatCart);
  if (!alloc.success || !alloc.allocations || alloc.allocations.length === 0) {
    // Even on allocate failure, snapshot the attempt to Django so ops have
    // a trail of *why* it failed (e.g. out-of-inventory for that zone/profile).
    const savedFailure = await saveMalimaOrderToDjango(empty, {
      ...context,
      stage: "allocate_failed",
      allocations: alloc.allocations ?? [],
      allocation_error: alloc.message,
    }).catch(() => undefined);

    return {
      status: false,
      message: alloc.message || "SIM allocation failed.",
      stage: "allocate_failed",
      allocations: alloc.allocations ?? [],
      malima: empty,
      saved: savedFailure,
    };
  }

  const { enriched, missing } = applyAllocations(flatCart, alloc.allocations);
  if (missing.length > 0) {
    const savedFailure = await saveMalimaOrderToDjango(empty, {
      ...context,
      stage: "allocate_incomplete",
      allocations: alloc.allocations,
      missing_units: missing,
    }).catch(() => undefined);

    return {
      status: false,
      message: `SIM allocation incomplete — ${missing.length} unit(s) without identifiers.`,
      stage: "allocate_failed",
      allocations: alloc.allocations,
      malima: empty,
      saved: savedFailure,
    };
  }

  // 2️⃣ Create product orders on Orange (one POST per SIM, parallel server-side)
  const malima = await createMalimaOrder(enriched);

  // 3️⃣ Persist everything to Django — even on Malima failure, so an operator
  //     can reconcile from the captured request/response and reservation ids.
  const saved = await saveMalimaOrderToDjango(malima, {
    ...context,
    allocations: alloc.allocations,
    enriched_cart: enriched,
  });

  if (!malima.status) {
    return {
      status: false,
      message: malima.message,
      stage: "malima_failed",
      allocations: alloc.allocations,
      malima,
      saved,
    };
  }
  if (!saved.success) {
    return {
      status: false,
      message: saved.message,
      stage: "save_failed",
      allocations: alloc.allocations,
      malima,
      saved,
    };
  }

  return {
    status: true,
    message: "Order processed successfully via Malima/Orange.",
    stage: "ok",
    allocations: alloc.allocations,
    malima,
    saved,
  };
}

export default {
  toMalimaCart,
  applyAllocations,
  allocateSimsFromDjango,
  createMalimaOrder,
  saveMalimaOrderToDjango,
  processOrderMalima,
  normaliseVolumeMB,
  parseDurationDays,
};