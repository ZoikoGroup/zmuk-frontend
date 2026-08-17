"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const RELATED_POLICIES = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Acceptable Use Policy", href: "/acceptable-use-policy" },
  { label: "Data Protection", href: "/data-protection" },
  { label: "GDPR Compliance", href: "/gdpr-compliance" },
];

const COMMITMENTS = [
  { icon: "🔒", label: "GDPR Compliant" },
  { icon: "✓", label: "ISO 27001 Certified" },
  { icon: "🛡️", label: "Data Protected" },
];

const QUICK_NAV = [
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "cookie-policy", label: "Cookie Policy" },
  { id: "data-retention", label: "Data Retention" },
  { id: "user-rights", label: "User Rights" },
  { id: "security-measures", label: "Security Measures" },
  { id: "disclosure-of-information", label: "Disclosure of Information" },
  { id: "third-party-links", label: "Third-Party Links" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "updates-to-privacy-policy", label: "Updates to Privacy Policy" },
  { id: "contact-information", label: "Contact Information" },
];

const USE_CARDS = [
  { icon: "📱", title: "Service Delivery", body: "Process orders and provide customer support" },
  { icon: "📊", title: "Analytics", body: "Improve website functionality and user experience" },
  { icon: "🛡️", title: "Security", body: "Protect against fraud and abuse" },
  { icon: "✉️", title: "Communications", body: "Send updates and promotional materials" },
];

const RETENTION_STAGES = [
  { title: "Active Account", body: "Data retained while your account is active" },
  { title: "Post-Closure", body: "Up to 7 years for legal and tax purposes" },
  { title: "Deletion", body: "Securely deleted after retention period" },
];

const USER_RIGHTS = [
  { no: "5.1", title: "Access", body: "You have the right to request a copy of the personal information we hold about you." },
  { no: "5.2", title: "Rectification", body: "You have the right to request that we correct any inaccurate or incomplete personal information." },
  { no: "5.3", title: "Deletion", body: "You have the right to request the deletion of your personal information under certain circumstances." },
  { no: "5.4", title: "Restriction", body: "You have the right to request the restriction of processing of your personal information under certain circumstances." },
];

const SECURITY_MEASURES = [
  { title: "Encryption", body: "All data transmitted is encrypted using SSL/TLS technology" },
  { title: "Access Control", body: "Strict access controls limit who can view your information" },
  { title: "Monitoring", body: "Continuous monitoring for security threats and breaches" },
  { title: "Compliance", body: "Regular audits to ensure compliance with data protection laws" },
];

const DISCLOSURES = [
  { term: "With your explicit consent:", body: "When you have given us permission to share your information." },
  { term: "To comply with legal obligations:", body: "When required by law or legal process." },
  { term: "To protect our rights, privacy, safety, or property:", body: "When necessary to protect our legitimate interests." },
  { term: "In connection with a sale, merger, or acquisition:", body: "If all or part of our company is involved in a business transaction." },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

type CalloutTone = "blue" | "yellow" | "green" | "red" | "pink" | "gray";

const CALLOUT_TONES: Record<CalloutTone, string> = {
  blue: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40",
  yellow: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/40",
  green: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40",
  red: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40",
  pink: "border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/40",
  gray: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60",
};

function Callout({
  tone,
  title,
  children,
}: {
  tone: CalloutTone;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 ${CALLOUT_TONES[tone]}`}>
      {title && (
        <p className="mb-1 text-sm font-bold text-gray-800 dark:text-white">{title}</p>
      )}
      <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{children}</div>
    </div>
  );
}

function Section({
  id,
  no,
  title,
  children,
}: {
  id: string;
  no: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-4 text-xl font-bold text-[#e6007e] sm:text-2xl">
        {no}. {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SubSection({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold text-[#e6007e]">
        {no} {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{children}</p>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{children}</p>;
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-base font-medium text-white/90">Your Privacy, Our Priority</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
          We are committed to protecting your personal information and ensuring transparency in how we
          handle your data.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">

          {/* ── Sidebar ── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <SidebarCard title="Related Policies">
              <ul className="space-y-2">
                {RELATED_POLICIES.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="text-sm text-gray-500 transition-colors hover:text-[#e6007e] dark:text-gray-400 dark:hover:text-[#e6007e]"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </SidebarCard>

            <SidebarCard title="Need Help? 🤔">
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                If you have questions about our privacy practices, our support team is here to help.
              </p>
              <Link
                href="/contact-us"
                className="block w-full rounded-md bg-green-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                Contact Support
              </Link>
            </SidebarCard>

            <SidebarCard title="Our Commitment">
              <ul className="space-y-2">
                {COMMITMENTS.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <span className="shrink-0 text-green-600">{c.icon}</span>
                    <span>{c.label}</span>
                  </li>
                ))}
              </ul>
            </SidebarCard>
          </aside>

          {/* ── Main ── */}
          <main className="min-w-0 space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800">

            {/* Intro */}
            <div className="rounded-xl border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950/30">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                At Zoiko Mobile, we are committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, and safeguard your personal information. By using our website, you
                consent to the practices described in this policy.
              </p>
            </div>

            {/* Quick Navigation */}
            <nav className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-3 text-sm font-bold text-gray-800 dark:text-white">Quick Navigation</h2>
              <ol className="space-y-1.5">
                {QUICK_NAV.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-gray-500 transition-colors hover:text-[#e6007e] dark:text-gray-400 dark:hover:text-[#e6007e]"
                    >
                      {i + 1}. {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* 1 */}
            <Section id="information-we-collect" no={1} title="Information We Collect">
              <Prose>At Zoiko Mobile, we may collect the following types of information:</Prose>
              <SubSection no="1.1" title="Personal Information">
                We may collect personal information, such as your name, email address, phone number, or
                other identifying information when you voluntarily provide it to us through our website,
                forms, or other interactions.
              </SubSection>
              <SubSection no="1.2" title="Device Information">
                We may also collect information about the device you use to access our website, including
                your IP address, browser type, operating system, and other technical details.
              </SubSection>
              <Callout tone="blue" title="What This Means">
                We only collect information necessary to provide you with our services and improve your
                experience.
              </Callout>
            </Section>

            {/* 2 */}
            <Section id="how-we-use-your-information" no={2} title="How We Use Your Information">
              <Prose>
                We use the information we collect for various purposes, including but not limited to:
              </Prose>
              <SubSection no="2.1" title="Providing Services">
                To provide you with the services and products you request, process transactions, and
                deliver customer support.
              </SubSection>
              <SubSection no="2.2" title="Improving Our Website">
                To enhance and optimise our website&rsquo;s functionality, user experience, and content.
              </SubSection>
              <SubSection no="2.3" title="Marketing and Communications">
                To send you promotional materials, updates, and notifications about our products and
                services, subject to your consent where required by law.
              </SubSection>

              <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                {USE_CARDS.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="mb-2 text-2xl" aria-hidden="true">{c.icon}</div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{c.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{c.body}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 3 */}
            <Section id="cookie-policy" no={3} title="Cookie Policy">
              <Prose>
                Please refer to our{" "}
                <Link href="/cookie-policy" className="font-semibold text-[#e6007e] hover:underline">
                  Cookie Policy
                </Link>{" "}
                for detailed information about the use of cookies, including types of cookies used and
                instructions on how to manage your cookie preferences.
              </Prose>
              <Callout tone="yellow" title="Understanding Cookies">
                Cookies are small text files that are placed on your device to help us provide a better
                service. You can manage your cookie preferences through your browser settings.
              </Callout>
            </Section>

            {/* 4 */}
            <Section id="data-retention" no={4} title="Data Retention">
              <Prose>
                We will retain your personal information only for as long as necessary for the purposes
                set out in this Privacy Policy unless a longer retention period is required or permitted
                by law.
              </Prose>
              <ol className="relative space-y-6 pl-1">
                {RETENTION_STAGES.map((s, i) => (
                  <li key={s.title} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="h-4 w-4 shrink-0 rounded-full bg-green-500 ring-4 ring-green-100 dark:ring-green-900/40" />
                      {i < RETENTION_STAGES.length - 1 && (
                        <span className="mt-1 w-0.5 flex-1 bg-green-200 dark:bg-green-900" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{s.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            {/* 5 */}
            <Section id="user-rights" no={5} title="User Rights">
              <Prose>
                Under the General Data Protection Regulation (GDPR), you have certain rights regarding
                your personal information. These rights include:
              </Prose>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {USER_RIGHTS.map((r) => (
                  <div
                    key={r.no}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <p className="text-sm font-bold text-[#e6007e]">
                      {r.no} {r.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {r.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/40">
                <p className="mb-1 text-sm font-bold text-gray-800 dark:text-white">
                  Exercise Your Rights
                </p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  To exercise any of these rights, please contact our Data Protection Officer using the
                  contact details provided at the end of this policy.
                </p>
                <Link
                  href="/contact-us"
                  className="mt-4 inline-block rounded-md bg-white px-5 py-2 text-sm font-semibold text-green-700 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                >
                  Contact Us
                </Link>
              </div>
            </Section>

            {/* 6 */}
            <Section id="security-measures" no={6} title="Security Measures">
              <Prose>
                We implement appropriate technical and organisational measures to protect your personal
                information. However, no method of transmission over the internet or electronic storage is
                entirely secure, and we cannot guarantee absolute security.
              </Prose>
              <ul className="space-y-3">
                {SECURITY_MEASURES.map((m) => (
                  <li
                    key={m.title}
                    className="rounded-xl border border-gray-200 border-l-4 border-l-green-500 bg-gray-50 p-4 dark:border-gray-700 dark:border-l-green-500 dark:bg-gray-900"
                  >
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{m.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{m.body}</p>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 7 */}
            <Section id="disclosure-of-information" no={7} title="Disclosure of Information">
              <Prose>
                We may disclose your personal information to third parties in the following circumstances:
              </Prose>
              <ul className="space-y-2.5">
                {DISCLOSURES.map((d) => (
                  <li
                    key={d.term}
                    className="flex gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e6007e]" />
                    <span>
                      <strong className="font-semibold text-gray-800 dark:text-white">{d.term}</strong>{" "}
                      {d.body}
                    </span>
                  </li>
                ))}
              </ul>
              <Callout tone="red" title="Important">
                We will never sell your personal information to third parties for marketing purposes
                without your explicit consent.
              </Callout>
            </Section>

            {/* 8 */}
            <Section id="third-party-links" no={8} title="Third-Party Links">
              <Prose>
                Our website may contain links to third-party websites. We are not responsible for the
                privacy practices of these websites. We encourage you to read the privacy policies of
                these third-party sites.
              </Prose>
              <Callout tone="blue" title="External Links">
                When you click on third-party links, you leave our website and are subject to the privacy
                policies of those external sites.
              </Callout>
            </Section>

            {/* 9 */}
            <Section id="childrens-privacy" no={9} title="Children's Privacy">
              <Prose>
                Our website is not intended for children under the age of 13. We do not knowingly collect
                or maintain personal information from children under 13 years of age. If you are a parent
                or guardian and believe that your child has provided us with personal information, please
                contact us, and we will take appropriate action to remove the information.
              </Prose>
              <Callout tone="pink" title="Protection of Minors">
                We are committed to protecting children&rsquo;s privacy online. If we become aware that we
                have collected personal information from a child under 13, we will delete it immediately.
              </Callout>
            </Section>

            {/* 10 */}
            <Section id="updates-to-privacy-policy" no={10} title="Updates to the Privacy Policy">
              <Prose>
                We may update this Privacy Policy from time to time to reflect changes in our practices or
                for other operational, legal, or regulatory reasons. The date of the latest revision will
                be indicated at the top of this policy.
              </Prose>
              <Callout tone="gray" title="Stay Informed">
                We recommend reviewing this policy periodically. Continued use of our services after
                changes constitutes your acceptance of the updated policy.
              </Callout>
              <p className="text-xs text-gray-400 dark:text-gray-500">Last Updated: January 2025</p>
            </Section>

            {/* 11 */}
            <Section id="contact-information" no={11} title="Contact Information">
              <Prose>
                If you have any questions or concerns about this Privacy Policy, please contact us at the
                following address:
              </Prose>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-sm font-bold text-gray-800 dark:text-white">Zoiko Mobile</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  Berkeley Suite, 35 Berkeley Square
                  <br />
                  Mayfair, London W1J 5BF
                </p>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Email:</span>{" "}
                  <a href="mailto:info@zoikomobile.co.uk" className="text-[#e6007e] hover:underline">
                    info@zoikomobile.co.uk
                  </a>
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Telephone:</span>{" "}
                  <a href="tel:+443371646388" className="text-[#e6007e] hover:underline">
                    +44 3371 646 388
                  </a>
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-green-600 to-teal-500 p-5">
                <p className="mb-1 text-sm font-bold text-white">Data Protection Officer</p>
                <p className="text-sm leading-relaxed text-white/90">
                  For specific privacy-related inquiries, you can contact our dedicated Data Protection
                  Officer who will assist you with any concerns regarding your personal data.
                </p>
              </div>
            </Section>

            {/* Closing */}
            <div className="border-t border-gray-100 pt-8 text-center dark:border-gray-700">
              <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                By using our services, you agree to this Privacy Policy. Thank you for choosing Zoiko
                Mobile.
              </p>
              <button
                type="button"
                onClick={() => router.push("/plans")}
                className="mt-5 rounded-md bg-[#e6007e] px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]"
              >
                View Plans
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
export { PrivacyPolicy };