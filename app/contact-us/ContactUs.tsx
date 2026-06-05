"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const subjectOptions = [
  "General Enquiry",
  "Billing",
  "Technical Support",
  "Roaming & International",
  "Complaints",
  "Other",
];

const emergencies = [
  { title: "Lost or Stolen Phone", desc: "Call 333 immediately to suspend your service" },
  { title: "Network Emergency", desc: "Report critical network issues 24/7" },
  { title: "Fraud Alert", desc: "Report suspicious activity immediately" },
];

const responseTimes = [
  { label: "Phone Support", value: "Immediate" },
  { label: "Live Chat", value: "< 2 minutes" },
  { label: "Email", value: "< 24 hours" },
  { label: "Social Media", value: "< 4 hours" },
];

const offices = [
  {
    badge: null as string | null,
    name: "London Head Office",
    img: "/images/office-london.jpg",
    address: ["35 Berkeley Square, Mayfair", "London W1J 5BF"],
    phone: "+44 (0)207 646 399",
    email: "info@zoikomobile.co.uk",
    hours: "Mon-Fri 9AM-6PM",
  },
  {
    badge: "Regional Office",
    name: "Glasgow Office",
    img: "/images/office-glasgow.jpg",
    address: ["Suite 2G, 2nd Floor 48 West", "George Street, Glasgow G2 1BP"],
    phone: "+44 141 530 1560",
    email: "glasgow@zoikomobile.co.uk",
    hours: "Mon-Fri 9AM-5PM",
  },
  {
    badge: "Regional Office",
    name: "Cardiff Office",
    img: "/images/office-cardiff.jpg",
    address: ["Portland House, 113-116 Blue", "Street, Cardiff CF10 5EQ"],
    phone: "+44 292 000 1374",
    email: "cardiff@zoikomobile.co.uk",
    hours: "Mon-Fri 9AM-5PM",
  },
];

const topics = [
  { icon: "/images/faq-billing.png", title: "Account & Billing", desc: "Payment methods, billing queries, and account management" },
  { icon: "/images/faq-network.png", title: "Network & Coverage", desc: "Signal issues, network coverage, and connectivity problems" },
  { icon: "/images/faq-roaming.png", title: "Roaming & International", desc: "International calls, roaming setup, and data charges abroad" },
  { icon: "/images/faq-charges.png", title: "Call & Text Charges", desc: "Call rates, international charges, and premium services" },
  { icon: "/images/faq-plans.png", title: "Plans & Packages", desc: "Day pass options, roaming plans, and service upgrades" },
  { icon: "/images/faq-sim.png", title: "SIM & Device Setup", desc: "SIM activation, device configuration, and technical support" },
];

// ─── SMALL ICONS (SVG, no emojis) ─────────────────────────────────────────────

const ic = "h-4 w-4 flex-shrink-0";
const Phone = () => (
  <svg className={`${ic} text-[#0e8f74]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.6a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.5 1.2L7.5 9.5a12 12 0 007 7l1.3-1.7a1 1 0 011.2-.5l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 5z" />
  </svg>
);
const Chat = () => (
  <svg className={`${ic} text-[#0e8f74]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a8 8 0 01-11.3 7.3L4 21l1.7-5.7A8 8 0 1121 12z" />
  </svg>
);
const Mail = () => (
  <svg className={`${ic} text-[#0e8f74]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0l9 6 9-6" />
  </svg>
);
const Pin = () => (
  <svg className={`${ic} text-[#e6007e]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const Star = () => (
  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
  </svg>
);

// ─── FORM HELPERS ─────────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e6007e]/40";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  savePref: boolean;
  newsletter: boolean;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  savePref: false,
  newsletter: false,
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────

function ContactUs() {
  const [form, setForm] = useState<FormState>(initialForm);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((f) => ({ ...f, [target.name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire up to your contact API
    console.log("Contact form submitted:", form);
  };

  return (
    <main className="bg-gray-50 font-sans">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-14 text-center text-white sm:px-6 md:px-8">
        <h1 className="font-extrabold text-[clamp(1.6rem,4.5vw,2.25rem)]">Have You Got Any Questions?</h1>
        <p className="mt-2 text-sm font-medium text-white/90">At Zoiko Mobile We Offer Solutions!</p>
        <p className="mt-1 text-sm text-white/80">
          We pride ourselves on providing tailored solutions within the shortest possible time
        </p>
      </section>

      {/* ─── Form + Sidebar ─── */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:px-8 lg:grid-cols-3">
        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800">Get In Touch With Us</h2>
          <p className="mt-2 text-sm text-gray-500">
            If you have any questions, at Zoiko Mobile we pride ourselves in providing tailored
            solutions within the shortest possible time.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Your Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" className={inputBase} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Your Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" className={inputBase} />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">Your Phone Number</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter your number" className={inputBase} />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
              <select id="subject" name="subject" value={form.subject} onChange={handleChange} className={`${inputBase} bg-white`}>
                <option value="" disabled>Select a topic</option>
                {subjectOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">Your Message</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Enter your message" rows={4} className={inputBase} />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-500">
              <input type="checkbox" name="savePref" checked={form.savePref} onChange={handleChange} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#e6007e] focus:ring-[#e6007e]" />
              <span>Save my name, email address, and website information on this browser for future use</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-500">
              <input type="checkbox" name="newsletter" checked={form.newsletter} onChange={handleChange} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#e6007e] focus:ring-[#e6007e]" />
              <span>Subscribe to our newsletter for updates and exclusive offers</span>
            </label>

            <button type="submit" className="w-full rounded-lg bg-[#e6007e] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
              Send Message
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Contact */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="border-b-2 border-[#1f9d6b] pb-3 text-base font-bold text-gray-800">Quick Contact</h3>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-center gap-2"><Phone /><p className="text-sm font-bold text-gray-800">Call Us Now</p></div>
                <p className="mt-1 text-sm text-gray-600"><strong className="font-semibold">333</strong> (from Zoiko mobile)</p>
                <p className="text-sm text-gray-600"><strong className="font-semibold">0333 004 0333</strong> (other networks)</p>
                <span className="mt-2 inline-block rounded-full border border-[#1f9d6b]/40 px-3 py-1 text-xs font-medium text-[#0e8f74]">Available 24/7</span>
              </div>
              <div>
                <div className="flex items-center gap-2"><Chat /><p className="text-sm font-bold text-gray-800">Live Chat</p></div>
                <p className="mt-1 text-sm text-gray-600">Instant support online</p>
                <span className="mt-2 inline-block rounded-full border border-[#1f9d6b]/40 px-3 py-1 text-xs font-medium text-[#0e8f74]">Available 24/7</span>
              </div>
              <div>
                <div className="flex items-center gap-2"><Mail /><p className="text-sm font-bold text-gray-800">Email Support</p></div>
                <a href="mailto:help@zoikomobile.co.uk" className="mt-1 block text-sm text-gray-600 hover:text-[#0e8f74]">help@zoikomobile.co.uk</a>
                <span className="mt-2 inline-block rounded-full border border-[#1f9d6b]/40 px-3 py-1 text-xs font-medium text-[#0e8f74]">Response within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Emergency Support */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="border-b-2 border-[#1f9d6b] pb-3 text-base font-bold text-gray-800">Emergency Support</h3>
            <div className="mt-4 space-y-4">
              {emergencies.map((e) => (
                <div key={e.title} className="border-l-4 border-red-500 pl-3">
                  <p className="text-sm font-bold text-red-600">{e.title}</p>
                  <p className="text-sm text-gray-500">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Response Times */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="border-b-2 border-[#1f9d6b] pb-3 text-base font-bold text-gray-800">Response Times</h3>
            <div className="mt-2 divide-y divide-gray-100">
              {responseTimes.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">{r.label}</span>
                  <span className="text-sm font-bold text-[#0e8f74]">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Office Locations ─── */}
      <section className="bg-white px-4 py-14 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-extrabold text-gray-800 text-[clamp(1.4rem,3.5vw,2rem)]">Our Office Locations</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {offices.map((o) => (
              <div key={o.name} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                {/* Photo — image slot */}
                <div className="relative aspect-[16/9] w-full bg-gray-100">
                  <Image src={o.img} alt={o.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  {o.badge && (
                    <span className="absolute left-3 top-3 rounded-md bg-[#1f9d6b] px-2.5 py-1 text-xs font-semibold text-white">
                      {o.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-gray-800">{o.name}</h3>
                  <div className="mt-3 flex items-start gap-2">
                    <span className="mt-0.5"><Pin /></span>
                    <p className="text-sm text-gray-500">{o.address.join(", ")}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2"><Phone /><p className="text-sm text-gray-600">{o.phone}</p></div>
                  <div className="mt-2 flex items-center gap-2"><Mail /><a href={`mailto:${o.email}`} className="text-sm text-gray-600 hover:text-[#0e8f74]">{o.email}</a></div>
                  <p className="mt-3 text-sm text-gray-600"><strong className="font-semibold">Hours:</strong> {o.hours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Most Asked Questions ─── */}
      <section className="bg-gray-50 px-4 py-14 sm:px-6 md:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-extrabold text-gray-800 text-[clamp(1.4rem,3.5vw,2rem)]">Most Asked Questions</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Quick answers to common questions - get instant help!</p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <div key={t.title} className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
                {/* Category icon — image slot */}
                <Image src={t.icon} alt={t.title} width={40} height={40} className="h-10 w-10 object-contain" />
                <h3 className="mt-4 text-base font-bold text-gray-800">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.desc}</p>
                <Link href="#" className="mt-4 text-sm font-semibold text-[#0e8f74] hover:underline">
                  View Questions &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonial ─── */}
      <section className="bg-gray-50 px-4 pb-16 sm:px-6 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <svg className="h-8 w-8 text-[#1f9d6b]/40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 7H4a4 4 0 00-.5 8H7V7zm10 0h-3a4 4 0 00-.5 8H17V7z" />
          </svg>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Zoiko Mobile has completely changed the way I use my phone. With their exceptional data
            plans, I never have to worry about exceeding my usage limits. Their network coverage is
            also surprisingly reliable, allowing me to stay connected wherever I go. I highly recommend
            Zoiko Mobile to anyone seeking a hassle-free mobile experience without compromising on
            network quality. Say goodbye to data worries and join Zoiko Mobile today!
          </p>
          <div className="mt-6 flex items-center gap-3">
            {/* Avatar — image slot */}
            <span className="relative block h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
              <Image src="/images/avatar-zing.jpg" alt="Zing C." fill sizes="44px" className="object-cover" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800">Zing C.</p>
              <p className="text-xs text-gray-400">Satisfied Customer</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">5.0 out of 5 stars</p>
          </div>
        </div>
      </section>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default ContactUs;
export { ContactUs };