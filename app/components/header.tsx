"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Plans", href: "/plans" },
  { label: "Business SIM", href: "/business-sim" },
  { label: "Coverage", href: "/coverage" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-8">
        {/* Logo — image slot */}
        <Link href="/" className="flex flex-shrink-0 items-center">
          <span className="relative block h-10 w-[120px]">s
            <Image src="/images/logo.png" alt="Zoiko Mobile" fill priority sizes="220px" className="object-contain object-left" />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-[#e6007e]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: CTA + hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href="/plans"
            className="hidden rounded-full bg-[#e6007e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a] sm:inline-block"
          >
            Switch &amp; Save
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

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-gray-100 bg-white lg:hidden">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block border-b border-gray-100 px-5 py-3.5 text-sm font-medium text-gray-700 active:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="px-5 py-4">
            <Link
              href="/plans"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full bg-[#e6007e] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]"
            >
              Switch &amp; Save
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}