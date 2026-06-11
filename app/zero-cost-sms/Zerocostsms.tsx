// ─── ICONS (inline SVG) ────────────────────────────────────────────────────────

const ic = "h-9 w-9";
const HandIcon = () => (<svg className={ic} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 2a1.5 1.5 0 013 0v6h.5V4a1.5 1.5 0 013 0v6.5h.5V7a1.5 1.5 0 013 0v8a7 7 0 01-7 7h-1.2a7 7 0 01-5.5-2.7L5 16.5c-.9-1.1.6-2.6 1.7-1.8L8 16V4a1.5 1.5 0 013 0v4h0V2z" /></svg>);
const ClickIcon = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l9 4-4 1.5L12.5 21 9 11z" /><path strokeLinecap="round" d="M5 4l1 2M3 8h2M5 12l2-1M9 5l1-2" /></svg>);
const AlarmIcon = () => (<svg className={ic} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a7 7 0 00-7 7v4l-1.5 2.5A1 1 0 004.3 18h15.4a1 1 0 00.8-1.5L19 14v-4a7 7 0 00-7-7z" /><path d="M9.5 19a2.5 2.5 0 005 0h-5z" /></svg>);
const HangUpIcon = () => (<svg className={ic} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.5c-2.5-2.3-5.7-3.5-9-3.5s-6.5 1.2-9 3.5c-.6.6-.6 1.6 0 2.2l1.8 1.7c.5.5 1.3.6 1.9.2l1.9-1.4c.3-.2.5-.6.5-1v-1.5c1.9-.6 4-.6 5.8 0V14c0 .4.2.8.5 1l1.9 1.4c.6.4 1.4.3 1.9-.2l1.8-1.7c.6-.6.6-1.6.3-2zM12 22l-3-4h6l-3 4z" /></svg>);

// ─── DATA ────────────────────────────────────────────────────────────────────

const shortNumbers = [
  { tag: "SHOUT", number: "85258" },
  { tag: "SPAM", number: "7726" },
  { tag: "PAC", number: "65075" },
  { tag: "STAC", number: "75075" },
  { tag: "INFO", number: "85075" },
];

const suspiciousText = [
  { Icon: HandIcon, title: "STOP", desc: "Hang up and call the company they claim to be from to check if it is a scam" },
  { Icon: ClickIcon, title: "DON'T CLICK", desc: "Don't click on any links or give out any personal or bank details." },
  { Icon: AlarmIcon, title: "REPORT", desc: "Report any suspicious texts to 2225 and make your friends and family aware too." },
];

const suspiciousCall = [
  { Icon: HandIcon, title: "STOP", desc: "Stop! Do not give out any personal or bank details" },
  { Icon: HangUpIcon, title: "HANG UP", desc: "Hang up and call the company they claim to be from to check if it is a scam" },
  { Icon: AlarmIcon, title: "REPORT", desc: "Report scam calls to Action Fraud and make your family aware too." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function AdviceCard({ Icon, title, desc }: { Icon: () => JSX.Element; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex justify-center text-[#e6007e]">
        <Icon />
      </div>
      <h3 className="mt-4 text-lg font-extrabold tracking-wide text-[#e6007e]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Zerocostsms() {
  return (
    <main className="bg-gray-50 font-sans dark:bg-gray-900">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-14 text-center text-white sm:px-6 md:px-8">
        <h1 className="font-extrabold text-[clamp(1.6rem,4vw,2.5rem)]">Enjoy Free SMS to Short Numbers with Zoiko Mobile!</h1>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-8">
        {/* ─── These include ─── */}
        <h2 className="text-center text-2xl font-extrabold text-[#e6007e]">These include:</h2>

        {/* British Transport Police banner */}
        <div className="mt-8 rounded-2xl bg-[#e9f8f1] px-6 py-5 text-center dark:bg-[#0e8f74]/10">
          <p className="font-bold text-gray-800 dark:text-white">The British Transport Police on: 61016</p>
        </div>

        {/* Short-number cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shortNumbers.map((s) => (
            <div key={s.tag} className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
              <span className="inline-block rounded-full bg-[#fde4f2] px-4 py-1 text-xs font-bold text-[#e6007e] dark:bg-[#e6007e]/20">
                {s.tag}
              </span>
              <p className="mt-4 text-2xl font-extrabold text-gray-800 dark:text-white">{s.number}</p>
            </div>
          ))}
        </div>

        {/* ─── If you receive a suspicious text ─── */}
        <h2 className="mt-14 text-center text-2xl font-extrabold text-[#0e8f74] dark:text-[#34d39e]">If you receive a suspicious text:</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suspiciousText.map((c) => (
            <AdviceCard key={c.title} {...c} />
          ))}
        </div>

        {/* Divider */}
        <hr className="mx-auto my-12 max-w-3xl border-[#0e8f74]/30" />

        {/* ─── If you receive a suspicious call ─── */}
        <h2 className="text-center text-2xl font-extrabold text-[#0e8f74] dark:text-[#34d39e]">If you receive a suspicious Call:</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suspiciousCall.map((c) => (
            <AdviceCard key={c.title} {...c} />
          ))}
        </div>
      </div>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default Zerocostsms;
