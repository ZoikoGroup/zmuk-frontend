// ─── DATA ────────────────────────────────────────────────────────────────────

const textRows = [
  { zone: "Zone 1 Countries", sent: "£0.08", received: "£0.00" },
  { zone: "Zone 2 Countries", sent: "£0.10", received: "£0.00" },
  { zone: "Zone 3 Countries", sent: "£0.16", received: "£0.00" },
  { zone: "Zone 4 Countries", sent: "£0.35", received: "£0.00" },
  { zone: "Zone 5 Countries", sent: "£0.70", received: "£0.00" },
  { zone: "Zone 6 Countries", sent: "£0.70", received: "£0.00" },
];

const callRows = [
  { zone: "Zone 1 Countries", sent: "£0.013", received: "£0.036" },
  { zone: "Zone 2 Countries", sent: "£0.065", received: "£0.052" },
  { zone: "Zone 3 Countries", sent: "£0.065", received: "£0.033" },
  { zone: "Zone 4 Countries", sent: "£0.065", received: "£0.390" },
  { zone: "Zone 5 Countries", sent: "£0.520", received: "£1.170" },
];

const dataRows = [
  { zone: "Zone 1 Countries", price: "£0.0040" },
  { zone: "Zone 2 Countries", price: "£0.0160" },
  { zone: "Zone 3 Countries", price: "£0.0320" },
  { zone: "Zone 4 Countries", price: "£0.0800" },
  { zone: "Zone 5 Countries", price: "£1.0900" },
  { zone: "Zone 6 Countries", price: "£3.1250" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const pillColor: Record<string, string> = {
  text: "bg-[#6d5dd3]",
  calls: "bg-[#e6007e]",
  data: "bg-[#ec4faa]",
};

function Pill({ label, color }: { label: string; color: keyof typeof pillColor }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white ${pillColor[color]}`}>
      {label}
    </span>
  );
}

const zoneCell = "px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap dark:text-gray-200";
const priceCell = "px-5 py-4 text-sm font-bold text-[#0e8f74] whitespace-nowrap dark:text-[#34d39e]";

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">{children}</table>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Roaming() {
  return (
    <main className="bg-gray-50 font-sans dark:bg-gray-900">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-12 text-center text-white sm:px-6 md:px-8">
        <h1 className="font-extrabold text-[clamp(1.6rem,4.5vw,2.5rem)]">Zoiko Roaming Zone Charges</h1>
        <p className="mt-2 text-sm text-white/90">Zone 1 - Ireland, Guernsey, Jersey, Isle of Man</p>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6 md:px-8">
        {/* ─── 1. Text ─── */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Pill label="TEXT" color="text" />
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">Roaming Zone Charges (Text)</h2>
          </div>
          <TableShell>
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-4 align-top">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Zones</p>
                  <p className="mt-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">Countries</p>
                </th>
                <th className="px-5 py-4 align-top">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Cost Per Text</p>
                  <p className="mt-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">Sent from visited Zones to any destinations whilst abroad (£)</p>
                </th>
                <th className="px-5 py-4 align-top">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Cost Per Text</p>
                  <p className="mt-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">Received whilst abroad (£)</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {textRows.map((r) => (
                <tr key={r.zone} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <td className={zoneCell}>{r.zone}</td>
                  <td className={priceCell}>{r.sent}</td>
                  <td className={priceCell}>{r.received}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </section>

        {/* ─── 2. Calls ─── */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Pill label="CALLS" color="calls" />
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">Roaming Zones (Calls)</h2>
          </div>
          <TableShell>
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-4 align-top">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Countries</p>
                </th>
                <th className="px-5 py-4 align-top">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Roaming Zones (Calls)</p>
                  <p className="mt-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">Sent from visited Zones to any destinations whilst abroad (£)</p>
                </th>
                <th className="px-5 py-4 align-top">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Received whilst abroad (£)</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {callRows.map((r) => (
                <tr key={r.zone} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <td className={zoneCell}>{r.zone}</td>
                  <td className={priceCell}>{r.sent}</td>
                  <td className={priceCell}>{r.received}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </section>

        {/* ─── 3. Data ─── */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Pill label="DATA" color="data" />
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">Zoiko Roaming Zone Charges (Data)</h2>
          </div>
          <TableShell>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-5 py-4 text-sm font-bold text-gray-700 dark:text-gray-200">Zones</th>
                <th className="px-5 py-4 text-sm font-bold text-gray-700 dark:text-gray-200">Price (£)/MB</th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((r) => (
                <tr key={r.zone} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <td className={zoneCell}>{r.zone}</td>
                  <td className={priceCell}>{r.price}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
          <p className="mt-4 text-center text-xs italic text-gray-400 dark:text-gray-500">
            Roaming Data is billed per kilobyte sent to or from Subscribers.
          </p>
        </section>

        {/* ─── For Pay Monthly Subscribers ─── */}
        <section className="overflow-hidden rounded-2xl border-t-4 border-[#17a06a] bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
          <h2 className="text-center text-lg font-bold text-gray-800 dark:text-white">For Pay Monthly Subscribers</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-300">
            For monthly recurring data bundles,{" "}
            <strong className="font-semibold text-gray-700 dark:text-gray-100">Zoiko Mobile does not impose a cap</strong>, and any
            Out-of-Bundle usage will be charged at the{" "}
            <strong className="font-semibold text-gray-700 dark:text-gray-100">Data Out-of-Bundle Charge rate</strong>. Subscriptions
            are charged upfront for the upcoming month. Pro-rata charges apply during the first billing
            period from the date of bundle activation until the next bill-cycle date.
          </p>
        </section>

        {/* ─── Voice And Text Bundles ─── */}
        <section className="overflow-hidden rounded-2xl border-t-4 border-[#e6007e] bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
          <h2 className="text-center text-lg font-bold text-gray-800 dark:text-white">Voice And Text Bundles</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-300">
            <p>
              Zoiko Mobile offers{" "}
              <strong className="font-semibold text-gray-700 dark:text-gray-100">Voice and Text Bundles for National Calls and National Texts</strong>{" "}
              within the Underlying Mobile Network and while roaming in Zone 1 (to comply with RLAH
              regulations). These bundles do not cover Calls and SMS while roaming outside the EU, to any
              International destination, to any Premium or Special numbers or Services, or incoming Calls and
              Texts.{" "}
              <strong className="font-semibold text-gray-700 dark:text-gray-100">
                Please note that only one Voice and Texts Bundle can be subscribed to per SIM card at a time.
                Pro-rata charges are applied during the first billing period from the date of Bundle activation
                until the next bill-cycle date. No pro-rata balance is refunded upon Bundle de-activation (the
                last month is fully billed).
              </strong>
            </p>
            <p className="font-semibold text-gray-700 dark:text-gray-100">
              Voice and Text Bundles come with an Allowance of Minutes and SMS. If you exceed the allowances,
              Zoiko Mobile will apply the Out-of-Bundle Charge for each additional Minute/SMS used outside the
              defined Bundle Allowance.
            </p>
            <p className="font-semibold text-gray-700 dark:text-gray-100">
              For subscribers using SIP Mobile Services, the Voice Allowance includes National Calls on the
              Underlying Mobile Network and while roaming in Zone 1 (to comply with RLAH regulation), to be
              routed to the Zoiko Mobile Platform. Please note that for voice calls delivered to the Service
              Provider Platform, the Service Provider is responsible for the costs associated with the
              termination of calls through its own interconnect agreements. Voice Calls from the Service
              Provider network (Mobile Call Termination SIP Service) are also included.
            </p>
            <p className="font-semibold text-gray-700 dark:text-gray-100">
              The maximum call duration is set to 2 hours. Beyond this duration, Zoiko Mobile reserves the
              right to bill the extra usage at the Out-of-Bundle Charge.
            </p>
            <p className="font-semibold text-gray-700 dark:text-gray-100">
              All Voice and Texts Bundles are limited to a maximum of 99 distinct destination numbers from each
              mobile Subscriber per month. Exceeding this limit, Zoiko Mobile reserves the right to bill the
              extra usage at the Out-of-Bundle Charge.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}