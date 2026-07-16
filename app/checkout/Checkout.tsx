"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ShieldCheck } from "lucide-react";

// .env.local -> NEXT_PUBLIC_API_URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
// Orders are stored by the `orders` app (BqOrder.raw_data). Mounted at /api/v1/.
const ORDER_URL = `${API_BASE}/api/v1/bqorders/`;            // device/product orders (BqOrder)
const SIM_ORDER_URL = `${API_BASE}/api/sim/checkout-order/`; // SIM orders (sim_orders app)
const CART_KEY = "cart";

// ── Cart item shape ──
// `type` distinguishes a SIM plan ("plan") from a device ("product").
// `simType` (eSIM/pSIM) is only meaningful for SIM plans and comes from the
// Choose SIM Type modal (stored on the cart item's metadata).
interface CartItem {
  id: number | string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  type?: "plan" | "product";
  simType?: "esim" | "psim";
  attributes?: Record<string, string>;
}

// Defensive normaliser (handles the Cartcontext shape + older shapes)
function normalise(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const price = Number(o.price ?? o.planPrice ?? 0);
  const qty = Math.max(1, Number(o.qty ?? o.quantity ?? 1) || 1);
  const name = String(o.name ?? o.planTitle ?? o.productName ?? "Item");
  if (!name) return null;

  const type = o.type === "plan" || o.type === "product" ? (o.type as "plan" | "product") : undefined;

  // simType may live on metadata.simType (Cartcontext) or directly on the item.
  const meta = (o.metadata as Record<string, unknown>) ?? {};
  const rawSim = meta.simType ?? o.simType;
  const simType = rawSim === "esim" || rawSim === "psim" ? (rawSim as "esim" | "psim") : undefined;

  return {
    id: (o.id as number | string) ?? (o.variantId as number | string) ?? name,
    slug: String(o.slug ?? o.productSlug ?? ""),
    name,
    image: (o.image as string) ?? (o.primary_image as string) ?? null,
    price: isNaN(price) ? 0 : price,
    qty,
    type,
    simType,
    attributes: (o.attributes as Record<string, string>) ?? undefined,
  };
}

const money = (n: number) => `£${n.toFixed(2)}`;

const simTypeLabel = (t?: "esim" | "psim") =>
  t === "esim" ? "eSIM" : t === "psim" ? "pSIM (Physical)" : "";

interface Customer {
  firstName: string; lastName: string; email: string; phone: string;
  address1: string; address2: string; city: string; postcode: string;
}
const emptyCustomer: Customer = {
  firstName: "", lastName: "", email: "", phone: "",
  address1: "", address2: "", city: "", postcode: "",
};

function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { id?: string | number }>(null);

  useEffect(() => {
    try {
      const rawCart = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      const items = (Array.isArray(rawCart) ? rawCart : [])
        .map(normalise)
        .filter((x): x is CartItem => x !== null);
      setCart(items);
    } catch {
      setCart([]);
    }
    try {
      const u = JSON.parse(localStorage.getItem("zoiko_user") ?? "null");
      if (u && typeof u === "object") {
        setCustomer((c) => ({
          ...c,
          firstName: u.first_name ?? c.firstName,
          lastName: u.last_name ?? c.lastName,
          email: u.email ?? c.email,
        }));
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const persist = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("zoiko-cart"));
  };

  const setQty = (idx: number, delta: number) => {
    const next = cart.map((it, i) => i === idx ? { ...it, qty: Math.max(1, it.qty + delta) } : it);
    persist(next);
  };
  const removeItem = (idx: number) => persist(cart.filter((_, i) => i !== idx));

  const subtotal = useMemo(() => cart.reduce((a, it) => a + it.price * it.qty, 0), [cart]);

  // Shipping is required if there's any physical item: a device, or a pSIM.
  // An order that is ONLY eSIMs needs no shipping address.
  const shippingRequired = useMemo(
    () => cart.some((it) => it.type === "product" || it.simType !== "esim"),
    [cart]
  );

  const shipping = 0; // free
  const total = subtotal + shipping;

  const baseValid =
    customer.firstName && customer.lastName && /\S+@\S+\.\S+/.test(customer.email) && customer.phone;
  const addressValid = customer.address1 && customer.city && customer.postcode;
  const formValid = shippingRequired ? baseValid && addressValid : baseValid;

  const placeOrder = async () => {
    setError(null);
    if (cart.length === 0) { setError("Your cart is empty."); return; }
    if (!formValid) {
      setError(shippingRequired
        ? "Please fill in all required contact and delivery details."
        : "Please fill in your name, email and phone.");
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem("zoiko_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      };

      const billingAddress = {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        postcode: customer.postcode,
      };

      const mapLine = (it: CartItem) => ({
        id: it.id, slug: it.slug, name: it.name,
        price: it.price, qty: it.qty,
        type: it.type ?? "plan",
        simType: it.simType ?? null,
        attributes: it.attributes ?? {},
      });

      // Split the cart: SIM plans vs physical products/devices.
      const simItems = cart.filter((it) => it.type !== "product");
      const deviceItems = cart.filter((it) => it.type === "product");

      const sum = (items: CartItem[]) => items.reduce((a, it) => a + it.price * it.qty, 0);

      const requests: Promise<Response>[] = [];
      const labels: string[] = [];

      // Device/product order -> BqOrder (unchanged destination)
      if (deviceItems.length > 0) {
        const sub = sum(deviceItems);
        labels.push("device");
        requests.push(fetch(ORDER_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({
            billingAddress,
            cart: deviceItems.map(mapLine),
            totals: { subtotal: sub, shipping: 0, discount: 0, total: sub },
            paymentMethod: "manual",
            order_type: "device",
          }),
        }));
      }

      // SIM order -> sim_orders app (separate SIM-orders table)
      if (simItems.length > 0) {
        const sub = sum(simItems);
        labels.push("sim");
        requests.push(fetch(SIM_ORDER_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({
            billingAddress,
            cart: simItems.map(mapLine),
            totals: { subtotal: sub, shipping: 0, discount: 0, total: sub },
            paymentMethod: "manual",
            order_type: "sim",
          }),
        }));
      }

      const responses = await Promise.all(requests);

      // If any leg failed, report which one and stop.
      const failed: string[] = [];
      let lastId: string | number | undefined;
      for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        if (!res.ok) {
          failed.push(labels[i]);
        } else {
          const d = await res.json().catch(() => ({}));
          lastId = d.id ?? d.order_id ?? d.order_ref ?? lastId;
        }
      }
      if (failed.length > 0) {
        throw new Error(`Could not place your ${failed.join(" & ")} order. Please try again.`);
      }

      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("zoiko-cart"));
      setCart([]);
      setDone({ id: lastId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place your order.");
    } finally {
      setPlacing(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">Order placed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Thanks for your order{done.id ? <> — reference <span className="font-semibold">#{done.id}</span></> : ""}. A
          confirmation will be sent to your email.
        </p>
        <Link href="/devices" className="mt-8 inline-block rounded-md bg-[#e6007e] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
          Continue shopping
        </Link>
      </div>
    );
  }

  const inputCx = "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-[#e6007e] focus:outline-none focus:ring-1 focus:ring-[#e6007e] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100";
  const labelCx = "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200";
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomer((c) => ({ ...c, [k]: e.target.value }));

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
          <ShoppingCart className="h-6 w-6 text-[#e6007e]" /> Checkout
        </h1>

        {loaded && cart.length === 0 && !done ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
            <Link href="/plans" className="mt-6 inline-block rounded-md border border-green-600 px-6 py-2.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-gray-700">
              Browse plans
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* Left: contact + (conditional) delivery details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-5 text-lg font-bold text-gray-800 dark:text-white">Your details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCx}>First name *</label><input className={inputCx} value={customer.firstName} onChange={set("firstName")} /></div>
                <div><label className={labelCx}>Last name *</label><input className={inputCx} value={customer.lastName} onChange={set("lastName")} /></div>
                <div><label className={labelCx}>Email *</label><input type="email" className={inputCx} value={customer.email} onChange={set("email")} /></div>
                <div><label className={labelCx}>Phone *</label><input className={inputCx} value={customer.phone} onChange={set("phone")} /></div>
              </div>

              {shippingRequired ? (
                <>
                  <h2 className="mb-4 mt-8 text-lg font-bold text-gray-800 dark:text-white">Delivery address</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><label className={labelCx}>Address line 1 *</label><input className={inputCx} value={customer.address1} onChange={set("address1")} /></div>
                    <div className="sm:col-span-2"><label className={labelCx}>Address line 2</label><input className={inputCx} value={customer.address2} onChange={set("address2")} /></div>
                    <div><label className={labelCx}>Town / City *</label><input className={inputCx} value={customer.city} onChange={set("city")} /></div>
                    <div><label className={labelCx}>Postcode *</label><input className={inputCx} value={customer.postcode} onChange={set("postcode")} /></div>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300">
                  Your order is eSIM only — no delivery address needed. We&rsquo;ll email your eSIM &amp; activation code.
                </div>
              )}

              {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
            </div>

            {/* Right: order summary */}
            <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-5 text-lg font-bold text-gray-800 dark:text-white">Order summary</h2>

              <div className="space-y-4">
                {cart.map((it, idx) => (
                  <div key={`${it.id}-${idx}`} className="flex gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900">
                      {it.image
                        ? <img src={it.image} alt={it.name} className="h-full w-full object-contain" />
                        : <div className="h-10 w-8 rounded border-2 border-dashed border-gray-200 dark:border-gray-700" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{it.name}</p>
                      {/* SIM type badge (plans) or attributes (products) */}
                      {it.type !== "product" && it.simType && (
                        <span className="mt-0.5 inline-block rounded-full bg-[#e6007e]/10 px-2 py-0.5 text-xs font-medium text-[#e6007e]">
                          {simTypeLabel(it.simType)}
                        </span>
                      )}
                      {it.attributes && Object.values(it.attributes).filter(Boolean).length > 0 && (
                        <p className="truncate text-xs text-gray-400">
                          {Object.values(it.attributes).filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-600">
                          <button type="button" onClick={() => setQty(idx, -1)} aria-label="Decrease" className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center text-sm text-gray-700 dark:text-gray-200">{it.qty}</span>
                          <button type="button" onClick={() => setQty(idx, 1)} aria-label="Increase" className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <span className="text-sm font-semibold text-[#e6007e]">{money(it.price * it.qty)}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(idx)} aria-label="Remove" className="self-start text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Shipping</span><span>{shippingRequired ? (shipping === 0 ? "Free" : money(shipping)) : "—"}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900 dark:border-gray-700 dark:text-white"><span>Total</span><span>{money(total)}</span></div>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={placing || cart.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#e6007e] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a] disabled:opacity-60"
              >
                {placing ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : "Place order"}
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
export { Checkout };