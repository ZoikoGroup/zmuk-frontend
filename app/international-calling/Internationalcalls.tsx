import Link from "next/link";

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Internationalcalls() {
  return (
    <main className="bg-gray-50 font-sans dark:bg-gray-900">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-12 text-center text-white sm:px-6 md:px-8">
        <h1 className="font-extrabold text-[clamp(1.6rem,4vw,2.4rem)]">Global Chatter: Free International Calls</h1>
        <p className="mt-2 text-sm text-white/90">Find quick answers to common questions about our services, plans, and support</p>
      </section>

      {/* ─── Content card ─── */}
      <section className="px-4 py-12 sm:px-6 md:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-10 dark:bg-gray-800 dark:ring-gray-700">
          <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
            <p>
              Go global with your gossip using our International Calls feature! We&rsquo;re not just breaking down
              borders; we&rsquo;re demolishing them. With FREE international calls to over 80 countries on selected
              plans, staying in touch with friends, family, and colleagues around the world has never been
              easier&mdash;or cheaper!
            </p>
            <p>
              Whether you&rsquo;re sharing news with a mate in Melbourne, planning adventures with pals in Paris,
              or catching up with your cousin in{" "}
              <Link href="" className="font-medium text-[#0e8f74] underline hover:no-underline dark:text-[#34d39e]">Canada</Link>,
              our International Calls feature ensures your conversations keep flowing as freely as your travel
              plans. No more watching the clock or counting minutes; just unlimited chit-chat across the globe.
            </p>
            <p>
              Select plans come with this fantastic feature, making international communication as simple as a
              local call. So, why limit your words when you can speak your heart out to over 80 countries without
              fretting over the fees?
            </p>
            <p>
              With{" "}
              <Link href="" className="font-medium text-[#0e8f74] underline hover:no-underline dark:text-[#34d39e]">Zoiko Mobile</Link>,
              the world really is your oyster&mdash;or your local caf&eacute;! Dial into the diversity of the
              globe from the comfort of your couch and bring distant delights right to your doorstep.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default Internationalcalls;
export { Internationalcalls };