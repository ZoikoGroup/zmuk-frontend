import Image from "next/image";
import Link from "next/link";

// ─── DATA ────────────────────────────────────────────────────────────────────

const linkColumns = [
  {
    title: "Zoiko Mobile",
    links: ["Zoiko Mobile Plans", "Business SIM Deals", "Data Only SIMs", "30-Day Plans", "Coverage Checker"],
  },
  {
    title: "Zoiko Rates",
    links: ["Roaming and Overage", "Zero Cost SMS", "Discounted Rates", "Refer A Friend", "Zoiko Programmes"],
  },
  {
    title: "About Zoiko",
    links: ["Blogs", "News", "FAQs", "Contact Us", "Useful Resources"],
  },
  {
    title: "Zoiko Legal",
    links: ["Terms and Conditions", "Vulnerability Policy", "Modern Slavery Policy", "ESG Policy", "Zoiko Policies"],
  },
];

const offices = [
  {
    city: "Head Office",
    address: "35 Berkeley Square, Mayfair, London W1J 5BF",
    phone: "Head Office +44 (0)2071 646 399",
    email: "info@zoikomobile.co.uk",
  },
  {
    city: "Glasgow",
    address: "Suite 2/3, 2nd Floor 48 West George Street, Glasgow G2 1BP",
    phone: "Glasgow +44 141 530 1560",
    email: "glasgow@zoikomobile.co.uk",
  },
  {
    city: "Cardiff",
    address: "Portland House, 113-116 Bute Street, Cardiff CF10 5EQ",
    phone: "Cardiff +44 292 000 1374",
    email: "cardiff@zoikomobile.co.uk",
  },
];

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#1ba36b] to-[#0e8f74] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:py-16">
        {/* Top: brand + link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand block */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Mobile</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              Empowering businesses with reliable connectivity solutions.
            </p>

            {/* App store buttons — image slots */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="#" className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 transition-colors hover:bg-black">
                <span className="relative h-5 w-5 flex-shrink-0">
                  <Image src="/image/google-play.png" alt="" fill sizes="20px" className="object-contain" />
                </span>
                <span className="text-xs font-medium">Google Play</span>
              </Link>
              <Link href="#" className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 transition-colors hover:bg-black">
                <span className="relative h-5 w-5 flex-shrink-0">
                  <Image src="/image/app-store.png" alt="" fill sizes="20px" className="object-contain" />
                </span>
                <span className="text-xs font-medium">App Store</span>
              </Link>
            </div>

            {/* Logo / QR placeholder — image slot */}
            <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-white/40">
              <span className="relative h-12 w-12">
                <Image src="/image/footer-logo.png" alt="Zoiko Mobile" fill sizes="48px" className="object-contain" />
              </span>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-white/80 transition-colors hover:text-white">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-10 border-white/20" />

        {/* Offices */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <div key={office.city}>
              <h4 className="text-sm font-bold">{office.city}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{office.address}</p>
              <p className="mt-1 text-sm text-white/80">{office.phone}</p>
              <a href={`mailto:${office.email}`} className="mt-1 block text-sm text-white/80 transition-colors hover:text-white">
                {office.email}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom divider + copyright */}
        <hr className="my-8 border-white/20" />
        <p className="text-center text-xs leading-relaxed text-white/70">
          © 2025 Zoiko Mobile UK. Zoiko Mobile UK is a trading name for Zoiko Mobile (UK) Ltd. Registered in England and Wales (No. 16564980). All rights reserved.
        </p>
      </div>
    </footer>
  );
}