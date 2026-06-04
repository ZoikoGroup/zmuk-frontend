"use client";

import Image from "next/image";
import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const joinFeatures = [
  { icon: "/images/homepage/📱.png", label: "Keep Your Number" },
  { icon: "/images/homepage/🎵.png", label: "Apple Music Free" },
  { icon: "/images/homepage/⚡.png", label: "Quick & Easy" },
  { icon: "/images/homepage/📊.png", label: "Track Your Usage" },
  { icon: "/images/homepage/🎁.png", label: "Great Rewards" },
];

const whyChoose = [
  { icon: "/images/homepage/📡.png", title: "Free 5G Access", desc: "Lightning-fast speeds at no extra cost" },
  { icon: "/images/homepage/🚚.png", title: "Free UK Delivery", desc: "Quick delivery to your doorstep" },
  { icon: "/images/homepage/🌍.png", title: "Free 5G EU Roaming", desc: "Stay connected across Europe" },
  { icon: "/images/homepage/💬.png", title: "Free Customer Service Call", desc: "Always here to help you" },
  { icon: "/images/homepage/⏰.png", title: "Free 24×7 Customer Support", desc: "Round-the-clock assistance" },
  { icon: "/images/homepage/🔄.png", title: "Free Switching to Zoiko Mobile", desc: "Seamless transition process" },
];

const durationTabs = ["24 Months Plan", "12 Month Plan", "30 Days Plan"];

const plans = [
  {
    tag: "Value Pack",
    data: "12GB",
    price: "£12.14",
    priceNote: "per month",
    popular: false,
    features: [
      "Unlimited Calls & Texts",
      "Free International Call to 41 Countries",
      "EU Roaming",
      "Roaming 12GB (4G/5G with 3G/4G Backup)",
    ],
  },
  {
    tag: "Data Nights",
    data: "20GB",
    price: "£28.34",
    priceNote: "per month",
    popular: true,
    features: [
      "Unlimited Calls & Texts",
      "Free International Call to 41 Countries",
      "EU Roaming Inclusive",
      "Roaming 30GB (3000 Minutes 3000+ Texts)",
    ],
  },
  {
    tag: "Limitless Plus",
    data: "30%  Discount",
    price: "Special",
    priceNote: "offer",
    popular: false,
    features: [
      "Everything From Family and Friends Perks",
      "Unlimited Calls and Texts",
      "5G Coverage & Wi-Fi Calling",
      "EU Roaming",
    ],
  },
];

const careOptions = [
  { icon: "/images/homepage/✉️.png", title: "Email Support", desc: "Contact us at any time of the day via email" },
  { icon: "/images/homepage/💬 (1).png", title: "Live Chat", desc: "Chat with our team 24/7 for instant responses" },
  { icon: "/images/homepage/⏰ (1).png", title: "Extended Support", desc: "Our customer service is open for extended hours" },
  { icon: "/images/homepage/📱 (1).png", title: "Self-Service Portal", desc: "Get quick answers in our online help center" },
  { icon: "/images/homepage/💻.png", title: "Ask Me Temporarily", desc: "Quick help for common questions" },
  { icon: "/images/homepage/🎧.png", title: "Contact Sales", desc: "Speak to our sales team Monday to Sunday" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const PINK = "#e6007e";
const GREEN = "#00a859";

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e6007e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
    </svg>
  );
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────

/** 1. HERO */
function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 md:px-8 lg:grid-cols-2 lg:gap-6 lg:py-16">
        {/* Text */}
        <div className="order-1">
          <h1 className="font-extrabold leading-tight text-[#c4007a] text-[clamp(2rem,5vw,3.25rem)]">
            Make the Smart Switch today!
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:text-base">
            Unlimited Data | Unlimited Calls | Roam Free in 30+ Countries
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span className="font-extrabold text-[#e6007e] text-[clamp(2.25rem,6vw,3.5rem)] leading-none">£0.00</span>
            <span className="mb-1 text-xs text-gray-500 sm:text-sm">/Month For Up To 3 Months*</span>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="rounded-full bg-[#e6007e] px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#c4007a]">
              Switch &amp; Save
            </button>
            <button type="button" className="rounded-full border border-[#e6007e] px-8 py-3 text-sm font-semibold text-[#e6007e] transition-colors hover:bg-[#fff0f8]">
              View Plans
            </button>
          </div>
        </div>

        {/* Image collage — space reserved */}
        <div className="order-2">
          <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-[#f3e8f7] via-[#e9c9e8] to-[#8e3a8c]">
            <Image
              src="/images/homepage/girl.png"
              alt="Happy Zoiko Mobile customers"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 2. JOIN ZOIKO */
function JoinZoiko() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-extrabold text-gray-800 text-[clamp(1.4rem,3.5vw,2rem)]">
          Join Zoiko Mobile today and start something new!
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {joinFeatures.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-3 rounded-xl bg-gray-50 px-3 py-6 text-center">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image src={f.icon} alt={f.label} fill sizes="40px" className="object-contain" />
              </div>
              <span className="text-xs font-medium text-gray-700 sm:text-sm">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 3. WHY CHOOSE */
function WhyChoose() {
  return (
    <section className="bg-[#eef9f3] px-4 py-14 sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-extrabold text-gray-800 text-[clamp(1.5rem,4vw,2.25rem)]">
          Why Choose Zoiko Mobile?
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="relative mb-4 h-10 w-10">
                <Image src={item.icon} alt={item.title} fill sizes="40px" className="object-contain" />
              </div>
              <h3 className="text-base font-bold text-gray-800">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 4. PLANS */
function Plans() {
  const [activeTab, setActiveTab] = useState(durationTabs[0]);

  return (
    <section className="bg-white px-4 py-14 sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-extrabold text-gray-800 text-[clamp(1.5rem,4vw,2.25rem)]">
          Choose Your SIM Only Plan &amp; Duration Below
        </h2>

        {/* Duration toggle */}
        <div className="mx-auto mt-8 flex w-fit flex-wrap justify-center gap-1 rounded-full border border-gray-200 p-1">
          {durationTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                activeTab === tab ? "bg-[#e6007e] text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.tag}
              className={`relative flex flex-col rounded-2xl bg-white p-6 sm:p-7 ${
                plan.popular
                  ? "border-2 border-[#e6007e] shadow-xl lg:-translate-y-3"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e6007e] px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <span className="mx-auto rounded-full bg-[#fde4f2] px-4 py-1 text-xs font-semibold text-[#c4007a]">
                {plan.tag}
              </span>

              <p className="mt-5 text-center font-extrabold text-[#00a859] text-[clamp(1.75rem,4vw,2.25rem)]">
                {plan.data}
              </p>

              <div className="mt-2 text-center">
                <span className="font-extrabold text-[#e6007e] text-[clamp(1.75rem,4vw,2.25rem)]">{plan.price}</span>
                <span className="ml-1 text-sm text-gray-500">{plan.priceNote}</span>
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckIcon />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button type="button" className="mt-6 rounded-full border border-[#00a859] py-2.5 text-sm font-semibold text-[#00a859] transition-colors hover:bg-[#eef9f3]">
                View Details
              </button>
              <button type="button" className="mt-3 rounded-full bg-[#e6007e] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
                Buy this plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 5. CUSTOMER CARE */
function CustomerCare() {
  return (
    <section className="bg-[#eef2fb] px-4 py-14 sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-extrabold text-gray-800 text-[clamp(1.5rem,4vw,2.25rem)]">
          Zoiko Customer Care
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-500">
          We understand the importance of having a mobile. When you may not be on best person in the US, we offer a variety of accessible customer support options.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careOptions.map((opt) => (
            <div key={opt.title} className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="relative mb-4 h-10 w-10">
                <Image src={opt.icon} alt={opt.title} fill sizes="40px" className="object-contain" />
              </div>
              <h3 className="text-base font-bold text-gray-800">{opt.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 6. REVIEW */
function Review() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-extrabold text-gray-800 text-[clamp(1.25rem,3vw,1.75rem)]">Great</h2>
        <p className="mt-4 text-sm italic leading-relaxed text-gray-500 sm:text-base">
          Zoiko Mobile has extremely changed the way I use my phone. With their affordable prices and excellent customer support, I couldn&rsquo;t be happier with my switch!
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-700">Great</span>
          <span className="text-sm text-gray-400">Based on over 3,000 reviews</span>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ZoikoMobileHome() {
  return (
    <main className="font-sans">
      <Hero />
      <JoinZoiko />
      <WhyChoose />
      <Plans />
      <CustomerCare />
      <Review />
    </main>
  );
}