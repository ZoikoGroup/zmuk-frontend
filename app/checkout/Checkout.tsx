"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ShieldCheck } from "lucide-react";

// .env.local -> NEXT_PUBLIC_API_URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
// Orders are stored by the `orders` app (BqOrder.raw_data). Mounted at /api/v1/.
const ORDER_URL = `${API_BASE}/api/v1/bqorders/`;
const CART_KEY = "cart";

// ── Cart item shape (what the product page should write into localStorage "cart") ──
interface CartItem {
  id: number | string;              // variant id (or product id)
  slug: string;
  name: string;
  image: string | null;
  price: number;                    // unit price
  qty: number;
  attributes?: Record<string, string>; // e.g. { Condition, Color, Storage }
}

// Defensive normaliser (handles slightly different stored shapes)
function normalise(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const price = Number(o.price ?? o.planPrice ?? 0);
  const qty = Math.max(1, Number(o.qty ?? o.quantity ?? 1) || 1);
  const name = String(o.name ?? o.planTitle ?? o.productName ?? "Item");
  if (!name) return null;
  return {
    id: (o.id as number | string) ?? (o.variantId as number | string) ?? name,
    slug: String(o.slug ?? o.productSlug ?? ""),
    name,
    image: (o.image as string) ?? (o.primary_image as string) ?? null,
    price: isNaN(price) ? 0 : price,
    qty,
    attributes: (o.attributes as Record<string, string>) ?? undefined,
  };
}

const money = (n: number) => `£${n.toFixed(2)}`;

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

  // Load cart + prefill from stored user
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
    window.dispatchEvent(new Event("zoiko-cart")); // let a cart badge update if you add one
  };

  const setQty = (idx: number, delta: number) => {
    const next = cart.map((it, i) => i === idx ? { ...it, qty: Math.max(1, it.qty + delta) } : it);
    persist(next);
  };
  const removeItem = (idx: number) => persist(cart.filter((_, i) => i !== idx));

  const subtotal = useMemo(() => cart.reduce((a, it) => a + it.price * it.qty, 0), [cart]);
  const shipping = 0; // free
  const total = subtotal + shipping;

  const formValid =
    customer.firstName && customer.lastName && /\S+@\S+\.\S+/.test(customer.email) &&
    customer.phone && customer.address1 && customer.city && customer.postcode;

  const placeOrder = async () => {
    setError(null);
    if (cart.length === 0) { setError("Your cart is empty."); return; }
    if (!formValid) { setError("Please fill in all required delivery details."); return; }

    setPlacing(true);
    try {
      const token = localStorage.getItem("zoiko_token");
      const res = await fetch(ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          // shaped to match the orders app (bqorders/by-user reads these keys)
          billingAddress: {
            first_name: customer.firstName,
            last_name: customer.lastName,
            email: customer.email,        // by-user filters on this
            phone: customer.phone,
            address1: customer.address1,
            address2: customer.address2,
            city: customer.city,
            postcode: customer.postcode,
          },
          cart: cart.map((it) => ({
            id: it.id, slug: it.slug, name: it.name,
            price: it.price, qty: it.qty, attributes: it.attributes ?? {},
          })),
          totals: { subtotal, shipping, discount: 0, total },
          paymentMethod: "manual",
          order_type: "device",
        }),
      });
      if (!res.ok) {
        let msg = "Could not place your order. Please try again.";
        try { const d = await res.json(); msg = d.detail ?? d.message ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const data = await res.json().catch(() => ({}));
      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("zoiko-cart"));
      setCart([]);
      setDone({ id: data.id ?? data.order_id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place your order.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Success screen ──
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
            <Link href="/devices" className="mt-6 inline-block rounded-md border border-green-600 px-6 py-2.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-gray-700">
              Browse devices
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* Left: delivery details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-5 text-lg font-bold text-gray-800 dark:text-white">Delivery details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCx}>First name *</label><input className={inputCx} value={customer.firstName} onChange={set("firstName")} /></div>
                <div><label className={labelCx}>Last name *</label><input className={inputCx} value={customer.lastName} onChange={set("lastName")} /></div>
                <div><label className={labelCx}>Email *</label><input type="email" className={inputCx} value={customer.email} onChange={set("email")} /></div>
                <div><label className={labelCx}>Phone *</label><input className={inputCx} value={customer.phone} onChange={set("phone")} /></div>
                <div className="sm:col-span-2"><label className={labelCx}>Address line 1 *</label><input className={inputCx} value={customer.address1} onChange={set("address1")} /></div>
                <div className="sm:col-span-2"><label className={labelCx}>Address line 2</label><input className={inputCx} value={customer.address2} onChange={set("address2")} /></div>
                <div><label className={labelCx}>Town / City *</label><input className={inputCx} value={customer.city} onChange={set("city")} /></div>
                <div><label className={labelCx}>Postcode *</label><input className={inputCx} value={customer.postcode} onChange={set("postcode")} /></div>
              </div>

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
                      {it.attributes && (
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
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
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