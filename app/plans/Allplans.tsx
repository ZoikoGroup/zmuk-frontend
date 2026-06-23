
"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA — replace these arrays with your /api/plans/v1/ response later.
// ─────────────────────────────────────────────────────────────────────────────

type Duration = "24 Month Plan" | "12 Month Plan" | "30 Day Plan";
const DURATIONS: Duration[] = ["24 Month Plan", "12 Month Plan", "30 Day Plan"];

interface SimPlan {
  name: string;
  data: string;
  popular?: boolean;
  // price per duration
  prices: Record<Duration, number>;
  features: string[];
}

const SIM_PLANS: SimPlan[] = [
  {
    name: "Thrifty Connect",
    data: "1GB",
    prices: { "24 Month Plan": 4.04, "12 Month Plan": 5.04, "30 Day Plan": 6.0 },
    features: ["150 Calls & Texts", "International Calls*", "Wi-Fi Calling & eSIM", "150 Calling Minutes"],
  },
  {
    name: "Junior Jetsetter",
    data: "3GB",
    popular: true,
    prices: { "24 Month Plan": 5.66, "12 Month Plan": 6.99, "30 Day Plan": 8.49 },
    features: ["500 Calls & Texts", "International Calls*", "Wi-Fi Calling & eSIM", "500 Calling Minutes"],
  },
  {
    name: "Silver Surfer",
    data: "10GB",
    prices: { "24 Month Plan": 12.14, "12 Month Plan": 14.5, "30 Day Plan": 16.99 },
    features: ["500 Calls & Texts", "International Calls*", "Wi-Fi Calling & eSIM", "500 Calling Minutes"],
  },
];

interface FixedPlan {
  name: string;
  data: string;
  price: number;
  unit: string; // "per month" | "per day"
  features: string[];
  highlightData?: boolean; // pale yellow data block (roaming)
}

const BUSINESS_PLANS: FixedPlan[] = [
  {
    name: "Business Booster Lite",
    data: "30GB",
    price: 17.81,
    unit: "per month",
    features: ["Unlimited Calls & Texts", "Wi-Fi Calling & eSIM", "Free International Calls", "EU Roaming: 15GB/1000 min /1000 Texts"],
  },
  {
    name: "Business Booster Premium",
    data: "100GB",
    price: 29.96,
    unit: "per month",
    features: ["Unlimited Calls & Texts", "Wi-Fi Calling & eSIM", "Free International Calls", "EU Roaming: 30GB/2000 min /2000 Texts"],
  },
  {
    name: "Business Booster Pro",
    data: "UNLIMITED",
    price: 32.39,
    unit: "per month",
    features: ["Unlimited Calls & Texts", "Wi-Fi Calling & eSIM", "Free International Calls", "EU Roaming: 40GB/Unlimited Calls & Texts"],
  },
];

const ROAMING_PLANS: FixedPlan[] = [
  {
    name: "Day Pass Roaming Zones 2 & 3",
    data: "500MB",
    price: 6.99,
    unit: "per day",
    highlightData: true,
    features: ["100 Free Texts", "100 Minutes Calling", "International Calls*", "Out of Bundle Charges 3p per Texts/Minute/MB"],
  },
  {
    name: "Day Pass Roaming Zones 4 & 5",
    data: "100MB",
    price: 13.99,
    unit: "per day",
    highlightData: true,
    features: ["100 Free Texts", "100 Minutes Calling", "International Calls*", "Out of Bundle Charges 3p per Texts/Minute/MB"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UI bits
// ─────────────────────────────────────────────────────────────────────────────

const Check = () => (
  <svg className="h-4 w-4 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
  </svg>
);

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{children}</h2>
      <span className="mt-2 inline-block h-1 w-12 rounded bg-green-500" />
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mb-6 space-y-3">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Check />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

function CardButtons() {
  return (
    <div className="mt-auto space-y-2">
      <button className="w-full rounded-md border border-green-600 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-gray-700">
        View Details
      </button>
      <button className="w-full rounded-md bg-[#e6007e] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
        Buy this plan
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

function Allplans () {
  const [duration, setDuration] = useState<Duration>("24 Month Plan");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Choose Your SIM Only Plan &amp; Duration Below
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Duration toggle */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  duration === d
                    ? "bg-yellow-400 text-gray-900"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* SIM Only plans */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {SIM_PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 ${
                p.popular ? "border-2 border-teal-400" : "border border-gray-100 dark:border-gray-700"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{p.name}</h3>
              {p.popular && (
                <span className="mt-2 inline-block w-fit rounded bg-[#e6007e] px-2.5 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <div className="my-5 rounded-lg bg-gray-50 py-6 text-center dark:bg-gray-900">
                <div className="text-3xl font-extrabold text-green-600">{p.data}</div>
                <div className="text-xs tracking-wide text-gray-400">DATA</div>
                <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                  £{p.prices[duration].toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">per month</div>
              </div>

              <FeatureList items={p.features} />
              <CardButtons />
            </div>
          ))}
        </div>

        {/* Business Deals */}
        <SectionHeading>Zoiko SIM Only Business Deals</SectionHeading>
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {BUSINESS_PLANS.map((p) => (
            <div key={p.name} className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-bold text-gray-800 dark:text-white">{p.name}</h3>
              <div className="mb-5 rounded-lg bg-gray-50 py-6 text-center dark:bg-gray-900">
                <div className="text-3xl font-extrabold text-green-600">{p.data}</div>
                <div className="text-xs tracking-wide text-gray-400">DATA</div>
                <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">£{p.price.toFixed(2)}</div>
                <div className="text-xs text-gray-400">{p.unit}</div>
              </div>
              <FeatureList items={p.features} />
              <CardButtons />
            </div>
          ))}
        </div>

        {/* Roaming Deals */}
        <SectionHeading>Zoiko Roaming Deals</SectionHeading>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {ROAMING_PLANS.map((p) => (
            <div key={p.name} className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-700 dark:text-gray-200">{p.name}</h3>
              <div className="mb-5 rounded-lg bg-yellow-50 py-6 text-center dark:bg-yellow-900/20">
                <div className="text-3xl font-extrabold text-green-600">{p.data}</div>
                <div className="text-xs tracking-wide text-gray-400">DATA</div>
                <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">£{p.price.toFixed(2)}</div>
                <div className="text-xs text-gray-400">{p.unit}</div>
              </div>
              <FeatureList items={p.features} />
              <CardButtons />
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Choose Zoiko Mobile for Your Best SIM - Only Plans!
          </h3>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Zoiko Mobile has exceeded my expectations. Not only do they offer great value-for-money deals,
            but their service is top-notch. Setting up and changing tariffs has never been easier — a few
            simple steps and you&rsquo;re good to go. What truly sets Zoiko Mobile apart is the inclusion of
            free international calls in most of their plans.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <span className="text-yellow-400">★★★★★</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">Great</span>
            <span className="text-gray-400">Based on over 3,000 reviews</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Allplans ;
export { Allplans  };