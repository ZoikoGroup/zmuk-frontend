"use client";

import React, { useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA — replace with your products API later.
// ─────────────────────────────────────────────────────────────────────────────

interface Device {
  id: number;
  name: string;
  image: string;        // /public path, e.g. "/images/iphone-12-mini.png"
  startingFrom: number;
  conditions: string[]; // e.g. ["A1-Flawless", "A2-Excellent"]
  colours: string[];    // hex values
  storage: string;      // e.g. "128GB | 256GB | 64GB"
}

const DEVICES: Device[] = [
  { id: 1, name: "iPhone 12 Mini", image: "/images/devices/iphone-12-mini.png", startingFrom: 978.99, conditions: ["A1-Flawless", "A2-Excellent"], colours: ["#ef4444", "#3b82f6", "#22c55e"], storage: "128GB | 256GB | 64GB" },
  { id: 2, name: "iPhone 11 Pro", image: "/images/devices/iphone-11-pro.png", startingFrom: 329.99, conditions: ["A1-Flawless", "A2-Excellent"], colours: ["#eab308", "#22c55e", "#1f2937"], storage: "128GB | 256GB | 512GB | 64GB" },
  { id: 3, name: "Galaxy S23+", image: "/images/devices/galaxy-s23-plus.png", startingFrom: 577.99, conditions: ["A1-Flawless", "A2-Excellent"], colours: ["#1f2937", "#ffffff"], storage: "256GB" },
  { id: 4, name: "Galaxy S23 FE", image: "/images/devices/galaxy-s23-fe.png", startingFrom: 403.99, conditions: ["A1-Flawless", "A2-Excellent"], colours: ["#1f2937", "#ffffff"], storage: "128GB" },
  { id: 5, name: "iPhone SE 3", image: "/images/devices/iphone-se-3.png", startingFrom: 261.99, conditions: ["A2-Excellent"], colours: ["#1f2937"], storage: "64GB" },
  { id: 6, name: "Pixel 8 Pro", image: "/images/devices/pixel-8-pro.png", startingFrom: 568.99, conditions: ["A2-Excellent"], colours: ["#3b82f6"], storage: "128GB" },
  { id: 7, name: "iPhone 13", image: "/images/devices/iphone-13.png", startingFrom: 449.99, conditions: ["A1-Flawless", "A2-Excellent"], colours: ["#ec4899", "#1f2937"], storage: "128GB | 256GB" },
  { id: 8, name: "Galaxy A54", image: "/images/devices/galaxy-a54.png", startingFrom: 219.99, conditions: ["A2-Excellent"], colours: ["#22c55e", "#1f2937"], storage: "128GB" },
  { id: 9, name: "Pixel 7a", image: "/images/devices/pixel-7a.png", startingFrom: 289.99, conditions: ["A1-Flawless"], colours: ["#3b82f6", "#ffffff"], storage: "128GB" },
];

const PAGE_SIZE = 6;

type Sort = "default" | "price-asc" | "price-desc" | "name";
const SORTS: { value: Sort; label: string }[] = [
  { value: "default", label: "Default sorting" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────

function DeviceCard({ d }: { d: Device }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-5 flex h-44 items-center justify-center">
        <img src={d.image} alt={d.name} className="h-full w-auto object-contain" />
      </div>

      <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">{d.name}</h3>

      <p className="text-xs text-gray-400">Starting from:</p>
      <p className="mb-4 text-2xl font-extrabold text-[#e6007e]">£{d.startingFrom.toFixed(2)}</p>

      <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
        <p className="text-xs text-gray-400">Device condition:</p>
        <p className="text-sm font-semibold text-green-600">{d.conditions.join("")}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Available colours:</span>
        <div className="flex gap-1.5">
          {d.colours.map((c, i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full border border-gray-200"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Internal storage:</span>
        <span className="text-right text-sm font-medium text-gray-700 dark:text-gray-200">{d.storage}</span>
      </div>

      <button className="mt-auto w-full rounded-md border border-green-600 py-2.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-gray-700">
        View Details
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

function DevicesList() {
  const [sort, setSort] = useState<Sort>("default");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const list = [...DEVICES];
    if (sort === "price-asc") list.sort((a, b) => a.startingFrom - b.startingFrom);
    else if (sort === "price-desc") list.sort((a, b) => b.startingFrom - a.startingFrom);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">

      {/* Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Grab &amp; Go Smartphones with 30-Day Flexi SIM Plans
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Showing + sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing <span className="font-bold text-green-600">{pageItems.length} Products</span> out of{" "}
            <span className="font-bold">{DEVICES.length}</span>
          </p>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as Sort); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((d) => (
            <DeviceCard key={d.id} d={d} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              aria-label="Previous"
            >
              &#8249;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  page === n
                    ? "bg-teal-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Next
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              aria-label="Next"
            >
              &#8250;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DevicesList;
export { DevicesList };