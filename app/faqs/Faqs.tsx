"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

// ─── ICONS (inline SVG) ────────────────────────────────────────────────────────

const Search = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4-4" /></svg>
);
const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`h-5 w-5 flex-shrink-0 text-[#0e8f74] transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
);
const PhoneIcon = () => (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2l2 5-2 1a12 12 0 006 6l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" /></svg>);
const ChatIcon = () => (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5z" /></svg>);
const MailIcon = () => (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="5" width="18" height="14" rx="2" /><path strokeLinecap="round" d="M4 7l8 6 8-6" /></svg>);
const Check = () => (<svg className="h-4 w-4 flex-shrink-0 text-[#1f9d6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const Star = ({ filled }: { filled: boolean }) => (
  <svg className={`h-7 w-7 transition-colors ${filled ? "text-[#f5c518]" : "text-gray-300 dark:text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" /></svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const quickCategories = [
  { name: "Billing & Payments", blurb: "Questions about bills, charges, and payment methods", count: 8 },
  { name: "Plans & Services", blurb: "Information about mobile plans, data, and features", count: 6 },
  { name: "Technical Support", blurb: "Network issues, device setup, and troubleshooting", count: 5 },
  { name: "Account Management", blurb: "SIM registration, account details, and security", count: 4 },
];

const faqGroups = [
  {
    title: "Billing & Payments",
    items: [
      { q: "How can I receive texts with Zoiko Mobile offers and promotions?", a: "Our offers and promotions are regularly updated on our website and communicated to our customers by emails and SMS." },
      { q: "Why have I been charged for internet access when I use WiFi?", a: "Please note that some handsets switch from WiFi to Mobile Internet depending on signal strength. To avoid these issues, please deactivate the data option on your mobile phone while using WiFi." },
      { q: "How can I get a copy of my itemised bill?", a: "To get a copy of your itemised billing, please log in to your account using the link that was sent to you after purchasing your Zoiko Mobile plan and follow the prompts. Alternatively, you may log in to your Zoiko Mobile account at MyBill" },
      { q: "How can I check my billing details?", a: "To check your billing details, log in to your Zoiko Mobile account at MyBill and view or update your billing details." },
    ],
  },
  {
    title: "Plans & Services",
    items: [
      { q: "Is it mandatory to register my details to use Zoiko Mobile services?", a: "While it is not mandatory to register your details, to use our paid monthly plan we would strongly recommend you do. However, you will be required to register all your details to use our contract plans. Registering your number opens up many additional facilities, including the ability to manage your Zoiko Mobile account online, set up Auto Renewal, collect itemised bill copies, change or update personal information, and more." },
      { q: "Do you provide locked or unlocked handsets?", a: "Yes, provide a FREE SIM card as well as new and refurbished handsets." },
      { q: "Do you offer contract services?", a: "Yes, Zoiko Mobile offers a variety of SIM Only deals with contract options spanning 30 days and 24 months. Depending on the contract length you choose, you can enjoy up to unlimited texts, unlimited data, unlimited SMS, and unlimited MMS.. Opting for the 30-day SIM Only contract provides you with the added benefit of flexibility, allowing you to modify or cancel your plan any time after the initial month of service." },
    ],
  },
  {
    title: "Technical Support",
    items: [
      { q: "How to Register Your Zoiko Mobile SIM?", a: "We’ll guide you through the process of registering your Zoiko Mobile SIM to ensure a smooth start: Text or call Customer Services at 500 using your Zoiko Mobile phone, and in the body of the text type your OTP (One Time Passcode) which begins with ZM, along with your full name, and a dedicated Zoiko Mobile Customer Services Representative will complete the process for you. Alternatively, you can contact +44 207 164 6399 from any other phone." },
      { q: "Why can't I send or receive texts?", a: "Firstly, please make sure you have enough credit to send a text. If you still can’t send or receive texts, please check the Message Centre Number (MCN) in your SMS settings – it should be +44 7870 020 555 for Zoiko Mobile UK. If you see a different number, enter +447870 020 555 turn your handset off and on and then retry sending any unsent texts. If the problem remains, please contact Customer Services at 500 from your Zoiko Mobile handset." },
      { q: "How do I activate roaming using Zoiko Mobile?", a: "Roaming services are automated, and they should work as soon as you travel abroad. If it seems roaming isn’t working, please restart your phone, and you should be able to use our roaming services without any problem. However, not all our plans have automated Roaming Services; if you have any questions regarding this, please call Customer Services at 500 before travelling outside the UK." },
    ],
  },
  {
    title: "Account Management",
    items: [
      { q: "I have just registered MyZoiko Mobile SIM. Why am I still unable to activate a plan?  ", a: "This could possibly be due to an active data connection. Please turn off mobile data and restart your handset. If the problem continues, please contact Customer Services on 500 from your Zoiko Mobile." },
      { q: "How do I check my balance?", a: "Zoiko Mobile currently offers a paid monthly service, which means that once you buy one of our plans you will never have to worry about running out of credit." },
      { q: "How do I check the call rates?", a: "You can check our unbeatably low rates from our website here www.zoikomobile.co.uk/plan/ Alternatively, you can dial Customer Service at 500 from your Zoiko Mobile." },
      { q: "How do I find my Zoiko Mobile number?", a: "On your iPhone handset you can find your number by going to ‘Settings’, then ‘Telephone’. You can find your number on your Android handset go to ‘Setting’ then go to ‘About Phone’." },
    ],
  },
];

const popularTopics = [
  "How to top up my account",
  "Setting up mobile internet",
  "International calling rates",
  "Network coverage checker",
  "Lost or stolen phone reporting",
  "Plan upgrade options",
];

const appFeatures = [
  "Check balance instantly",
  "Top up with one tap",
  "View usage history",
  "Manage your plan",
  "Get exclusive offers",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Underline() {
  return <span className="mt-3 block h-1 w-12 rounded-full bg-[#0e8f74]" />;
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{q}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-500 dark:border-gray-700 dark:text-gray-300">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Faqs() {
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Results section anchor — searching scrolls the user down to here.
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollToResults = () => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToResults();
  };

  const q = query.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!q) return faqGroups;
    return faqGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [q]);

  return (
    <main className="bg-gray-50 font-sans dark:bg-gray-900">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-14 text-center text-white sm:px-6 md:px-8">
        <h1 className="font-extrabold text-[clamp(1.9rem,5vw,2.75rem)]">Got Questions?</h1>
        <p className="mt-3 font-semibold">Zoiko&rsquo;s Got Answers!</p>
        <p className="mt-2 text-sm text-white/85">Find instant solutions to your mobile queries with our comprehensive help center</p>

        {/* Submitting (Enter or the search icon) scrolls down to the results below. */}
        <form
          onSubmit={handleSearchSubmit}
          className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-full bg-white px-4 py-3 shadow-md dark:bg-gray-800"
        >
          <button type="submit" aria-label="Search" className="text-gray-400 transition-colors hover:text-[#0e8f74] dark:text-gray-500">
            <Search />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers..."
            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </form>
      </section>

      {/* ─── Quick Help Categories ─── */}
      <section className="bg-white px-4 py-12 sm:px-6 md:px-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">Quick Help Categories</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickCategories.map((c) => (
              <div key={c.name} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-bold text-gray-800 dark:text-white">{c.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{c.blurb}</p>
                <span className="mt-4 inline-block rounded-full bg-[#0e8f74]/10 px-3 py-1 text-xs font-semibold text-[#0e8f74] dark:bg-[#0e8f74]/20 dark:text-[#34d39e]">
                  {c.count} questions
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main content ─── */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ─── Left column ─── */}
        <div className="space-y-10">
          {/* Intro card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">How Zoiko Mobile Help and Support Team helps?</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-300">
              Welcome to our Zoiko Mobile Help and Support hub, where we&rsquo;re here to assist you with a wide
              range of services. Whether you have questions about your plan, need technical support, or require
              help with billing and account management, our dedicated customer support team is ready to help.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-300">
              Explore our FAQs for quick answers to common inquiries or reach out directly for personalized
              assistance. From troubleshooting and upgrading mobile plans to addressing network issues and
              roaming support, we&rsquo;ve got you covered. Feel free to contact us for any queries regarding
              lost or stolen phones, billing disputes, or assistance with activations and deactivations. Your
              satisfaction is our priority, and we&rsquo;re here to ensure a smooth and seamless mobile
              experience for you.
            </p>
          </div>

          {/* FAQ groups — search scrolls here */}
          <div ref={resultsRef} className="scroll-mt-24 space-y-10">
            {filteredGroups.length === 0 ? (
              <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 ring-1 ring-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
                No results for &ldquo;{query}&rdquo;. Try a different search.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <section key={group.title}>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group.title}</h2>
                  <Underline />
                  <div className="mt-5 space-y-3">
                    {group.items.map((item) => (
                      <Accordion key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>

        {/* ─── Right sidebar ─── */}
        <aside className="space-y-6">
          {/* Need More Help */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">Need More Help?</h3>
            <Underline />
            <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-300">
              Can&rsquo;t find what you&rsquo;re looking for? Our support team is here to help!
            </p>

            <div className="mt-5 space-y-3">
              {/* Call (highlighted) */}
              <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-[#17a06a] to-[#0e8f74] p-4 text-white">
                <span className="mt-0.5"><PhoneIcon /></span>
                <div>
                  <p className="text-sm font-bold">Call Us</p>
                  <p className="mt-1 text-xs text-white/90">333 (from Zoiko mobile)</p>
                  <p className="text-xs text-white/90">0333 004 0333 (other networks)</p>
                </div>
              </div>
              {/* Live Chat */}
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <span className="mt-0.5 text-[#0e8f74] dark:text-[#34d39e]"><ChatIcon /></span>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">Live Chat</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Available 24/7</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instant support online</p>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <span className="mt-0.5 text-[#0e8f74] dark:text-[#34d39e]"><MailIcon /></span>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">Email Support</p>
                  <a href="mailto:help@zoikomobile.co.uk" className="mt-1 block text-xs text-[#0e8f74] hover:underline dark:text-[#34d39e]">help@zoikomobile.co.uk</a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">Popular Topics</h3>
            <Underline />
            <ul className="mt-4 space-y-3">
              {popularTopics.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => { setQuery(t); scrollToResults(); }}
                    className="block w-full text-left text-sm text-gray-600 transition-colors hover:text-[#0e8f74] dark:text-gray-300 dark:hover:text-[#34d39e]"
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Get the MyZoiko App */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">Get the MyZoiko App</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-300">Manage your account on the go with our mobile app!</p>
            <ul className="mt-4 space-y-2">
              {appFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {/* App promo images — image slots */}
            <div className="mt-5 space-y-3">
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                <Image src="/images/faq/app-promo-1.png" alt="MyZoiko app promo" fill sizes="320px" className="object-cover" />
              </div>
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                <Image src="/images/faq/app-promo-2.png" alt="MyZoiko app promo" fill sizes="320px" className="object-cover" />
              </div>
            </div>
          </div>

          {/* How are we doing */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">How are we doing?</h3>
            {submitted ? (
              <p className="mt-4 text-sm text-[#0e8f74] dark:text-[#34d39e]">Thanks for your feedback!</p>
            ) : (
              <>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">Your feedback helps us improve our support!</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star filled={n <= (hover || rating)} />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={rating === 0}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-[#17a06a] to-[#0e8f74] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Feedback
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default Faqs;
export { Faqs };