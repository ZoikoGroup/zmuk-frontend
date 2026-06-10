"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Recharge() {
  const [phone, setPhone] = useState("");

  // Simple validity check: at least 7 digits once non-digits are stripped.
  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length >= 7;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: wire up to your recharge/top-up API
  };

  return (
    <main className="relative bg-white font-sans dark:bg-gray-900">
      {/* ─── "Get in touch" side tab ─── */}
      <Link
        href=""
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg bg-[#e6007e] px-2 py-4 text-xs font-semibold text-white shadow-lg [writing-mode:vertical-rl] hover:bg-[#c4007a]"
      >
        Get in touch
      </Link>

      {/* ─── Hero banner — single image slot ─── */}
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

      {/* ─── Recharge form ─── */}
      <section className="bg-white px-4 py-16 sm:px-6 md:px-8 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
          <label htmlFor="msisdn" className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
            Phone Number (MSISDN) <span className="text-[#e6007e]">*</span>
          </label>
          <input
            id="msisdn"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="mt-2 w-full rounded-md border border-[#e6007e]/60 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#e6007e] focus:outline-none focus:ring-1 focus:ring-[#e6007e] dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />

          <button
            type="submit"
            disabled={!isValid}
            className={`mt-5 rounded-md px-6 py-2.5 text-sm font-semibold transition-colors ${
              isValid
                ? "bg-[#e6007e] text-white hover:bg-[#c4007a]"
                : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
            }`}
          >
            Recharge Now
          </button>
        </form>
      </section>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default Recharge;
export { Recharge };