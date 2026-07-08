"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { fetchSubscriber, fetchEsim } from "../../lib/useTransatel";

// .env.local -> NEXT_PUBLIC_API_URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Plan {
  id: number;
  name: string;
  slug: string;
  price: string;
  price_30: string | null;
  price_12: string | null;
  price_24: string | null;
  data_allowance: string | null;
  short_description: string | null;
  category: { id: number; name: string; slug: string } | null;
  features: { id: number; title: string }[];
}

// Subscriber shape from Transatel (only the bits we display; rest ignored)
interface Subscriber {
  msisdn?: string;
  simSerial?: string;
  iccid?: string;
  status?: string;
  [k: string]: unknown;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Recharge = monthly top-up, so prefer the 30-day price.
function topupPrice(p: Plan): string {
  return Number(p.price_30 ?? p.price_12 ?? p.price).toFixed(2);
}

// Mask a SIM serial like the screenshot: 89**************202
function maskSerial(serial?: string): string {
  if (!serial) return "—";
  if (serial.length <= 5) return serial;
  return serial.slice(0, 2) + "*".repeat(Math.max(3, serial.length - 5)) + serial.slice(-3);
}

const Check = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
  </svg>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Recharge() {
  const [phone, setPhone] = useState("");

  // validation state
  const [checking, setChecking] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sub, setSub] = useState<Subscriber | null>(null);

  // plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // recharge submit
  const [recharging, setRecharging] = useState(false);
  const [done, setDone] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const canValidate = digits.length >= 10; // UK MSISDN

  // Reset everything if the number is edited after validating.
  const onPhoneChange = (v: string) => {
    setPhone(v);
    if (validated || error) {
      setValidated(false);
      setSub(null);
      setError(null);
      setSelectedPlan(null);
      setPlans([]);
    }
  };

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/plans/v1/`);
      if (res.ok) {
        const data = await res.json();
        const list: Plan[] = Array.isArray(data) ? data : data.results ?? [];
        // Top-up plans = SIM-only / 30-day style plans (skip broadband/phone-line).
        const topups = list.filter(
          (p) => !/broadband|digital-phone|phone-line/i.test(p.category?.slug ?? "")
        );
        setPlans(topups.length ? topups : list);
      }
    } catch {
      /* plans are optional; validation still succeeded */
    } finally {
      setPlansLoading(false);
    }
  };

  // Validate the MSISDN against Transatel (subscriber → fallback eSIM).
  const validate = async () => {
    if (!canValidate) return;
    setChecking(true);
    setError(null);
    setValidated(false);
    setSub(null);
    setSelectedPlan(null);

    const s = await fetchSubscriber(digits);
    if (s.error) { setError(s.error); setChecking(false); return; }

    if (s.found) {
      const d = s.data as Subscriber;
      setSub({
        msisdn: d.msisdn ?? `+${digits}`,
        simSerial: d.simSerial ?? d.iccid ?? (d as Record<string, string>).sim_serial,
        status: d.status,
      });
      setValidated(true);
      setChecking(false);
      loadPlans();
      return;
    }

    // Not an active subscriber — try the eSIM record for the serial/status.
    const e = await fetchEsim(digits);
    if (e.found) {
      const d = e.data as Subscriber;
      setSub({ msisdn: `+${digits}`, simSerial: d.simSerial ?? d.iccid, status: d.status });
      setValidated(true);
      setChecking(false);
      loadPlans();
    } else {
      setError("We couldn't find an active SIM for that number. Please check and try again.");
      setChecking(false);
    }
  };

  const rechargeNow = async () => {
    if (!validated || !selectedPlan) return;
    setRecharging(true);
    try {
      // Reuse the orders endpoint (same one the checkout uses).
      const res = await fetch(`${API_BASE}/api/v1/bqorders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: "recharge",
          msisdn: sub?.msisdn ?? `+${digits}`,
          sim_serial: sub?.simSerial ?? null,
          plan: { id: selectedPlan.id, name: selectedPlan.name, price: topupPrice(selectedPlan) },
          totals: { total: Number(topupPrice(selectedPlan)) },
          paymentMethod: "manual",
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Recharge could not be completed. Please try again.");
    } finally {
      setRecharging(false);
    }
  };

  // ─── Success screen ───
  if (done) {
    return (
      <main className="bg-white px-4 py-20 text-center font-sans dark:bg-gray-900">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40">
            <Check />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Recharge submitted!</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {selectedPlan?.name} for {sub?.msisdn}. You'll receive confirmation shortly.
          </p>
          <Link href="/" className="mt-8 inline-block rounded-md bg-[#e6007e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c4007a]">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative bg-white font-sans dark:bg-gray-900">
      {/* ─── "Get in touch" side tab ─── */}
      <Link href="" className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg bg-[#e6007e] px-2 py-4 text-xs font-semibold text-white shadow-lg [writing-mode:vertical-rl] hover:bg-[#c4007a]">
        Get in touch
      </Link>

      {/* ─── Hero banner ─── */}
      <section className="w-full">
        <Image
          src="/images/topup/Rectangle 41673.png"
          alt="Stay connected without interruptions — recharge your SIM with Zoiko Mobile"
          width={1920}
          height={500}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </section>

      {/* ─── Recharge flow ─── */}
      <section className="bg-white px-4 py-16 sm:px-6 md:px-8 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl">
          {/* Phone number */}
          <label htmlFor="msisdn" className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
            Phone Number (MSISDN) <span className="text-[#e6007e]">*</span>
          </label>
          <input
            id="msisdn"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="enter your phone number"
            className="mt-2 w-full rounded-md border border-[#e6007e]/60 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#e6007e] focus:outline-none focus:ring-1 focus:ring-[#e6007e] dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />

          {/* Validate button (until validated) */}
          {!validated && (
            <button
              type="button"
              onClick={validate}
              disabled={!canValidate || checking}
              className={`mt-4 rounded-md px-6 py-2.5 text-sm font-semibold transition-colors ${
                canValidate && !checking ? "bg-[#e6007e] text-white hover:bg-[#c4007a]" : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              }`}
            >
              {checking ? "Validating…" : "Validate Number"}
            </button>
          )}

          {/* Messages */}
          {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
          {validated && <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-600"><Check /> Phone number validated successfully!</p>}

          {/* SIM Details */}
          {validated && sub && (
            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-lg font-bold text-[#0e7490] dark:border-gray-700 dark:bg-gray-800 dark:text-cyan-300">
                SIM Details
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 text-sm dark:border-gray-700">
                <span className="font-bold text-gray-800 dark:text-gray-100">Phone Number:</span>
                <span className="text-gray-600 dark:text-gray-300">{sub.msisdn}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 text-sm">
                <span className="font-bold text-gray-800 dark:text-gray-100">SIM Card ID:</span>
                <span className="text-gray-600 dark:text-gray-300">{maskSerial(sub.simSerial)}</span>
              </div>
            </div>
          )}

          {/* Plan selection */}
          {validated && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Choose a plan</h2>
              {plansLoading ? (
                <div className="mt-6 flex justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#e6007e] border-t-transparent" role="status"><span className="sr-only">Loading plans…</span></div>
                </div>
              ) : plans.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No plans available right now.</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {plans.map((p) => {
                    const active = selectedPlan?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p)}
                        className={`rounded-xl border p-5 text-left transition-colors ${
                          active ? "border-[#e6007e] ring-2 ring-[#e6007e]/30" : "border-gray-200 hover:border-[#e6007e]/50 dark:border-gray-700"
                        } bg-white dark:bg-gray-800`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 dark:text-white">{p.name}</span>
                          {active && <span className="text-[#e6007e]"><Check /></span>}
                        </div>
                        {p.data_allowance && <p className="mt-1 text-sm font-semibold text-green-600">{p.data_allowance} data</p>}
                        <p className="mt-2 text-xl font-extrabold text-[#e6007e]">£{topupPrice(p)}<span className="text-xs font-normal text-gray-400"> / month</span></p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recharge Now */}
          <button
            type="button"
            onClick={rechargeNow}
            disabled={!validated || !selectedPlan || recharging}
            className={`mt-8 rounded-md px-6 py-2.5 text-sm font-semibold transition-colors ${
              validated && selectedPlan && !recharging ? "bg-[#e6007e] text-white hover:bg-[#c4007a]" : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
            }`}
          >
            {recharging ? "Processing…" : "Recharge Now"}
          </button>
        </div>
      </section>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default Recharge;
export { Recharge };