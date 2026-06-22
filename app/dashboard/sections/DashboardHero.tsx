import React from "react";

const Items2 = [
  {
    title: "Account Status",
    description: "Active",
  },
  {
    title: "Member Since",
    description: "Jan 2025",
  },
  {
    title: "Open Tickets",
    description: "0",
  },
];

export default function DashboardHero() {
  return (
    <section className="w-full">

      {/* ── HERO SECTION ───────────────────────── */}
      <div className="bg-[#10446C] dark:bg-gray-900 text-white text-center md:text-left py-16 px-6 sm:px-8 lg:px-20 lg:py-20 transition-colors duration-300">

        <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold leading-relaxed">
          Welcome back, John
        </h2>

        <p className="mt-2 text-base md:text-xl text-white/90 dark:text-gray-300">
          Manage your profile, security and support from one place
        </p>

      </div>

      {/* ── STATS SECTION ───────────────────────── */}
      <div className="bg-white dark:bg-gray-800 text-center md:text-left py-8 px-6 sm:px-8 lg:px-20 lg:py-12 transition-colors duration-300">

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Items2.map((item, i) => (
            <li key={i}>
              <article className="
                h-full px-6 py-6 flex flex-col items-center justify-center gap-3
                border border-[#f5c241]/40 dark:border-yellow-400/30
                bg-[#fefbf4] dark:bg-gray-800
                rounded-2xl transition
              ">
                <p className="text-base md:text-3xl font-semibold text-[#10446C] dark:text-white">
                  {item.description}
                </p>
                <p className="text-base md:text-lg font-medium text-[#666666] dark:text-gray-400 leading-tight">
                  {item.title}
                </p>
              </article>
            </li>
          ))}
        </ul>

      </div>

    </section>
  );
}
