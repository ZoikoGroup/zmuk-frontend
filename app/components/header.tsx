"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Search, ShoppingCart } from "lucide-react";

// Top utility bar links
const topLinks = [
  { label: "Activate Your SIM", href: "/activate", highlight: true },
  { label: "Top Up", href: "/top-up" },
  { label: "Switch & Save", href: "/switch-save" },
  { label: "Contact Us", href: "/contact" },
  { label: "Support", href: "/support" },
  { label: "International Calls", href: "/international-calls" },
];

// Main nav. `dropdown` is optional. (Zoiko Plans sub-links are placeholders — edit to taste.)
const navLinks = [
  {
    label: "Zoiko Plans",
    href: "/plans",
    dropdown: [
      { label: "SIM Only Plans", href: "/plans" },
      { label: "Data Only SIMs", href: "/data-only-sims" },
      { label: "Business SIM Deals", href: "/business-sim-deals" },
      { label: "30-Day Plans", href: "/30-day-plans" },
    ],
  },
  { label: "Business Deals", href: "/business-deals" },
  { label: "Devices", href: "/devices" },
  { label: "Animals & Music", href: "/animals-music" },
  { label: "About Us", href: "/about-us" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* ─── Top utility bar (desktop only) ─── */}
      <div className="hidden bg-gradient-to-r from-white via-[#eef9f3] to-[#e2f4e9] lg:block">
        <div className="mx-auto flex max-w-7xl justify-end gap-6 px-4 py-2 sm:px-6 md:px-8">
          {topLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`text-sm transition-colors hover:text-[#0e8f74] ${
                l.highlight ? "font-bold text-gray-900" : "text-gray-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Main bar ─── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-8">
          {/* Logo — image slot */}
          <Link href="/" className="flex flex-shrink-0 items-center">
            <span className="relative block h-10 w-[180px] sm:w-[220px]">
              <Image src="/images/logo.png" alt="Zoiko Mobile" fill priority sizes="220px" className="object-contain object-left" />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-[#e6007e]"
                  >
                    {item.label}
                    <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />
                  </Link>
                  {/* pt-3 keeps a hover bridge between the link and the menu */}
                  <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    <div className="w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                      {item.dropdown.map((d) => (
                        <Link
                          key={d.label}
                          href={d.href}
                          className="block px-5 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#e6007e]"
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-[#e6007e]"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Right: search, cart, login, hamburger */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Search size={20} />
            </button>

            <Link
              href="/cart"
              aria-label="Cart"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
            >
              <ShoppingCart size={20} />
            </Link>

            <Link
              href="/login"
              className="hidden rounded-full bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:inline-block"
            >
              Login
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile menu ─── */}
      {mobileOpen && (
        <nav className="border-b border-gray-100 bg-white lg:hidden">
          {/* Main nav links */}
          {navLinks.map((item) =>
            item.dropdown ? (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  aria-expanded={openDropdown === item.label}
                  className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-3.5 text-sm font-medium text-gray-700 active:bg-gray-50"
                >
                  {item.label}
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === item.label && (
                  <div className="bg-gray-50">
                    {item.dropdown.map((d) => (
                      <Link
                        key={d.label}
                        href={d.href}
                        onClick={() => setMobileOpen(false)}
                        className="block border-b border-gray-100 py-3 pl-8 pr-5 text-sm text-gray-600 last:border-0 active:bg-gray-100"
                      >
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-gray-100 px-5 py-3.5 text-sm font-medium text-gray-700 active:bg-gray-50"
              >
                {item.label}
              </Link>
            )
          )}

          {/* Top utility links (shown here on mobile since the top bar is desktop-only) */}
          <div className="bg-gray-50">
            {topLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`block border-b border-gray-100 px-5 py-3 text-sm last:border-0 active:bg-gray-100 ${
                  l.highlight ? "font-bold text-gray-900" : "text-gray-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Login */}
          <div className="px-5 py-4">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full bg-gradient-to-r from-[#17a06a] to-[#0e8f74] py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}