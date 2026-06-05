import Image from "next/image";
import Link from "next/link";

// ─── DATA ────────────────────────────────────────────────────────────────────
//
// Add the real route in each `href` below — they're left empty ("") on purpose
// so you can fill them in later. Empty ones safely fall back to "#" until then.

type FooterLink = { label: string; href: string };

const linkColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Zoiko Mobile",
    links: [
      { label: "Zoiko Mobile Plans", href: "" },
      { label: "Business SIM Deals", href: "" },
      { label: "Data Only SIMs", href: "" },
      { label: "30-Day Plans", href: "" },
      { label: "Coverage Checker", href: "" },
    ],
  },
  {
    title: "Zoiko Rates",
    links: [
      { label: "Roaming and Overage", href: "/roaming-and-coverage" },
      { label: "Zero Cost SMS", href: "" },
      { label: "Discounted Rates", href: "" },
      { label: "Refer A Friend", href: "" },
      { label: "Zoiko Programmes", href: "" },
    ],
  },
  {
    title: "About Zoiko",
    links: [
      { label: "Blogs", href: "" },
      { label: "News", href: "" },
      { label: "FAQs", href: "" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Useful Resources", href: "" },
    ],
  },
  {
    title: "Zoiko Legal",
    links: [
      { label: "Terms and Conditions", href: "/terms-and-conditions" },
      { label: "Vulnerability Policy", href: "/vulnerability-policy" },
      { label: "Modern Slavery Policy", href: "/modern-slavery-policy" },
      { label: "ESG Policy", href: "/esg-policy" },
  
    ],
  },
];

// App store buttons — add the real store URLs in `href`.
const storeButtons = [
  { label: "Google Play", img: "/image/google-play.png", href: "" },
  { label: "App Store", img: "/image/app-store.png", href: "" },
];

const offices = [
  {
    city: "Head Office",
    address: "167-169 Great Portland Street, 5th Floor, London W1W 5PF",
    phone: "+44 020 7164 6399",
    email: "info@zoikomobile.co.uk",
  },
  {
    city: "Glasgow",
    address: "Suite 2/3, 48 West George Street, Glasgow G2 1BP",
    phone: "+44 020 7164 6399",
    email: "info@zoikomobile.co.uk",
  },
  {
    city: "Cardiff",
    address: "Portland House, 113-116 Blue Street, Cardiff CF10 5EQ",
    phone: "+44 020 7164 6399",
    email: "info@zoikomobile.co.uk",
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
              {storeButtons.map((btn) => (
                <Link
                  key={btn.label}
                  href={btn.href || "#"}
                  className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 transition-colors hover:bg-black"
                >
                  <span className="relative h-5 w-5 flex-shrink-0">
                    <Image src={btn.img} alt="" fill sizes="20px" className="object-contain" />
                  </span>
                  <span className="text-xs font-medium">{btn.label}</span>
                </Link>
              ))}
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
                  <li key={link.label}>
                    <Link href={link.href || "#"} className="text-sm text-white/80 transition-colors hover:text-white">
                      {link.label}
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
              <a
                href={`tel:${office.phone.replace(/\s+/g, "")}`}
                className="mt-1 block text-sm text-white/80 transition-colors hover:text-white"
              >
                {office.phone}
              </a>
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