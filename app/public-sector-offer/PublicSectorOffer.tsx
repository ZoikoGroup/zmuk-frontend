import Image from "next/image";

// ─── DATA ────────────────────────────────────────────────────────────────────

const heroImages = [
  { src: "/images/publicsector/Mask group.png", alt: "Public sector office workers in a meeting" },
  { src: "/images/publicsector/Mask group (1).png", alt: "Police officer" },
  { src: "/images/publicsector/Mask group (2).png", alt: "Firefighters" },
  { src: "/images/publicsector/happy-soldier-military-and-portrait-of-people-in-2025-04-06-10-08-19-utc 1.png", alt: "Military personnel" },
];

const steps = [
  { num: 1, title: "Choose Your Plan", desc: "Browse our range of SIM-only plans and select the perfect option for your needs." },
  { num: 2, title: "Sign Up with Your Work Email", desc: "Register for a Zoiko Mobile account using your official work email address." },
  { num: 3, title: "Verify Your Status", desc: "Provide a valid work ID to confirm your public sector employment status." },
  { num: 4, title: "Nominate Family and Friends", desc: "Add up to 5 nominated family and friends to receive a 20% lifetime discount on their SIM-only plans." },
  { num: 5, title: "Get Your Discount", desc: "Enjoy 30% off your chosen plan for as long as you remain a Zoiko Mobile customer, and 20% off for your nominated family and friends." },
];

const terms = [
  { title: "30% Discount", desc: "Applies to any Zoiko Mobile SIM-only plan for as long as you remain a customer." },
  { title: "20% Discount for Family and Friends", desc: "Applies to up to 5 nominated family and friends for as long as they remain Zoiko Mobile customers." },
  { title: "Valid Work ID", desc: "You must provide a valid work ID to confirm your public sector work status." },
  { title: "Eligibility", desc: "This offer is available to new public sector workers customers only." },
  { title: "Fair Usage Policy", desc: "Applies to all plans, including unlimited calls & texts and EU roaming." },
  { title: "5G Coverage", desc: "Available in selected areas only." },
  { title: "Wi-Fi Calling", desc: "Requires compatible handset and network coverage." },
  { title: "EU Roaming", desc: "For use in EU countries only. This offer can be used in conjunction with other promotional offers from Zoiko Mobile." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f9d6b] text-base font-bold text-white">
        {num}
      </div>
      <h3 className="mt-4 text-base font-bold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-6.7-4.35-9.33-8.06C.9 10.27 1.6 6.5 4.8 5.4c1.94-.66 3.86.2 4.9 1.66l.3.42.3-.42c1.04-1.46 2.96-2.32 4.9-1.66 3.2 1.1 3.9 4.87 2.13 7.54C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────

/** 1. HERO */
function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#1aa06a] via-[#138f6e] to-[#0e7d74] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 md:px-8 lg:grid-cols-2 lg:py-16">
        {/* Text */}
        <div>
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
            Exclusive Offer for UK Public Sector Workers
          </span>

          <h1 className="mt-5 font-extrabold leading-tight text-[clamp(1.9rem,5vw,3rem)]">
            Honoring Your Service with Exclusive Savings
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
            At Zoiko Mobile, we appreciate the hard work and dedication of our public sector
            workers. As a token of gratitude, we are offering an{" "}
            <span className="font-semibold text-[#ffd54a]">exclusive 30% lifetime discount</span>{" "}
            on any of our SIM-only plans for the public sector workers, and{" "}
            <span className="font-semibold text-[#ffd54a]">
              20% lifetime discount for up to 5 nominated family and friends.
            </span>
          </p>

          <button
            type="button"
            className="mt-7 rounded-full bg-[#f5c518] px-8 py-3 text-sm font-semibold text-gray-900 shadow-md transition-colors hover:bg-[#e6b800]"
          >
            Register Now
          </button>
        </div>

        {/* Image grid — space reserved */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {heroImages.map((img) => (
            <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/10">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 2. HOW TO GET YOUR DISCOUNT */
function HowToGet() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-extrabold text-gray-800 text-[clamp(1.5rem,4vw,2.25rem)]">
            How to Get Your Discount
          </h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-[#1f9d6b]" />
        </div>

        {/* First three steps */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.slice(0, 3).map((s) => (
            <StepCard key={s.num} {...s} />
          ))}
        </div>

        {/* Last two steps, centered */}
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {steps.slice(3).map((s) => (
            <StepCard key={s.num} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** 3. DON'T MISS OUT */
function DontMissOut() {
  return (
    <section className="bg-gray-100 px-4 py-14 sm:px-6 md:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* Text */}
        <div>
          <h2 className="font-extrabold text-gray-800 text-[clamp(1.5rem,4vw,2rem)]">Don&rsquo;t Miss Out</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500 sm:text-base">
            Take advantage of this exclusive offer and enjoy significant savings on your mobile
            plan. Browse our plans today and start saving with Zoiko Mobile.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full border border-[#0e8f74] px-6 py-2.5 text-sm font-semibold text-[#0e8f74] transition-colors hover:bg-[#0e8f74]/5"
          >
            Browse Plans Now
          </button>
        </div>

        {/* Discount card */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#e6007e] px-8 py-10 text-center text-white shadow-lg lg:ml-auto lg:max-w-sm">
          <span className="font-extrabold text-[clamp(2.5rem,8vw,3.5rem)] leading-none">30%</span>
          <span className="mt-1 text-lg font-semibold tracking-wide">OFF</span>
          <span className="mt-2 text-sm text-white/90">Lifetime Discount</span>
        </div>
      </div>
    </section>
  );
}

/** 4. THANK YOU */
function ThankYou() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 md:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-extrabold text-[#e6007e] text-[clamp(1.5rem,4vw,2rem)]">
            Thank You for Your Service
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base">
            At <span className="font-semibold text-[#e6007e]">Zoiko Mobile</span>, we are proud to
            support our public sector workers and their loved ones. We look forward to providing you
            with the best network experience at an unbeatable price.
          </p>
        </div>

        <div className="flex items-center gap-2 lg:justify-end">
          <HeartIcon />
          <span className="text-sm font-medium text-gray-700">We Appreciate You</span>
        </div>
      </div>
    </section>
  );
}

/** 5. TERMS & CONDITIONS */
function TermsConditions() {
  return (
    <section className="bg-gray-50 px-4 py-14 sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-extrabold text-gray-800 text-[clamp(1.5rem,4vw,2.25rem)]">
            Terms &amp; Conditions
          </h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-[#1f9d6b]" />
        </div>

        <div className="mt-10 space-y-3">
          {terms.map((t) => (
            <div key={t.title} className="rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-sm font-bold text-[#0e8f74]">{t.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlighted note */}
        <div className="mt-4 rounded-xl border border-[#f5c518] bg-[#fffbe9] px-5 py-4 text-center">
          <p className="text-sm text-gray-600">
            This offer can be used in conjunction with other promotional offers from Zoiko Mobile.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="w-full rounded-full bg-[#e6007e] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a] sm:w-auto"
          >
            Join Now
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-[#0e8f74] px-8 py-3 text-sm font-semibold text-[#0e8f74] transition-colors hover:bg-[#0e8f74]/5 sm:w-auto"
          >
            Switch &amp; Save
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PublicSectorOffer() {
  return (
    <main className="font-sans">
      <Hero />
      <HowToGet />
      <DontMissOut />
      <ThankYou />
      <TermsConditions />
    </main>
  );
}