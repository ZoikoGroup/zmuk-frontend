import Link from "next/link";

// ─── DATA ────────────────────────────────────────────────────────────────────

const points = [
  { n: 1, title: "Bundle Plans:", desc: "Our bundled packages include talk, text, mms and data services at a lower rate than if you purchased these services separately." },
  { n: 2, title: "SIM-Only Plans:", desc: "SIM-only plans, which exclude the cost of a new or refurbished device, are typically more affordable than traditional mobile contracts." },
  { n: 3, title: "Pay-As-You-Go:", desc: "Our Monthly Rolling plans are like pay-as-you-go, allow customers to pay only for the services they use with the flexibility of not having to enter long-term contracts, providing cost control and potential savings for low-usage customers." },
  { n: 4, title: "Family Plans:", desc: "We offer discounted rates for multiple SIMs or family plans, making it more cost-effective for households." },
  { n: 5, title: "Data-Specific Discounts:", desc: "We offer data-specific discounts or unlimited data options for a reduced price." },
  { n: 6, title: "Promotional Deals:", desc: "" },
  { n: 7, title: "Loyalty Rewards:", desc: "We do have loyalty programmes that provide discounts, free upgrades, or other perks to long-term customers." },
  { n: 8, title: "Student or Senior Discounts:", desc: "We offer specialised plans with discounts for students, seniors, or other specific customer groups, such as migrants and tourists." },
  { n: 9, title: "International Calling and Roaming:", desc: "We have competitive international calling and roaming rates, which can result in significant savings for frequent travellers. Some of our bundled plans include massive amount of EU roaming data." },
  { n: 10, title: "Refer-a-Friend Programme:", desc: "We offer discounts or credits to customers who refer friends or family members to our services." },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Discountedrates() {
  return (
    <main className="bg-gray-50 font-sans dark:bg-gray-900">
      {/* ─── Hero band ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-12 text-center text-white sm:px-6 md:px-8">
        <h1 className="font-extrabold text-[clamp(1.6rem,4vw,2.5rem)]">Zoiko Mobile Discounted Rates</h1>
      </section>

      {/* ─── Content panel ─── */}
      <section className="px-4 py-12 sm:px-6 md:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border-2 border-[#e6007e] bg-white p-6 shadow-sm sm:p-10 dark:bg-gray-800">
          <div className="space-y-9">
            {points.map((p) => (
              <div key={p.n}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-[#e6007e] px-2 text-xs font-bold text-white">
                    {p.n}.
                  </span>
                  <h2 className="text-lg font-bold text-[#e6007e]">{p.title}</h2>
                </div>
                {p.desc && (
                  <p className="mt-3 pl-10 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{p.desc}</p>
                )}

                {/* Closing note after the last point */}
                {p.n === 10 && (
                  <p className="mt-4 pl-10 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    The specific discounted rates and plans available will depend on our current market offerings.
                    To find the best discounted rates suitable to your specific needs, it&rsquo;s recommended to
                    research and compare plans from{" "}
                    <Link href="" className="font-semibold text-[#0e8f74] hover:underline dark:text-[#34d39e]">Plans category</Link>{" "}
                    to see which one best suit your needs and budget.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default Discountedrates;
export { Discountedrates };