"use client";

import { useState } from "react";

// ─── ICONS (inline SVG) ────────────────────────────────────────────────────────

const ic = "h-6 w-6";
const PersonIcon = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4 21a8 8 0 0116 0" /></svg>);
const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const articles = [
  { Icon: PersonIcon, title: "Account & Billing", desc: "How billing works with Zoiko" },
  { Icon: PersonIcon, title: "Network Switch", desc: "What you need to know about keeping your number" },
  { Icon: PersonIcon, title: "Buy Calling Plans", desc: "Preparing your phone for roaming with zoiko" },
  { Icon: PersonIcon, title: "Android and Zoiko", desc: "Setting Up your android phone for roaming with Zoiko" },
  { Icon: PersonIcon, title: "Phasing Out 3G (UK)", desc: "3G on phone out" },
  { Icon: PersonIcon, title: "Calling Abroad", desc: "Preparing your phone for roaming with Zoiko" },
];

const INTRO =
  "Welcome to our Zoiko Mobile Help and Support hub, where we're here to assist you with a wide range of services. Whether you have questions about your plan, need technical support, or require help with billing and account management, our dedicated customer support team is ready to help. Explore our FAQs for quick answers to common inquiries or reach out directly for personalized assistance. From troubleshooting and upgrading mobile plans to addressing network issues and roaming support, we've got you covered. Feel free to contact us for any queries regarding lost or stolen phones, billing disputes, or assistance with activations and deactivations. Your satisfaction is our priority, and we're here to ensure a smooth and seamless mobile experience for you.";

// Answers use template literals (backticks) so multi-line text and line breaks are valid.
const faqs = [
  { q: "How Zoiko Mobile Help and Support Team helps?", a: INTRO },
  { q: "Does your eSIM card allow other network integrations?", a: `Dual SIM phones that come with eSIM cards have the advantage of allowing users to access two phone numbers on a single device. These smartphones are equipped with both a physical SIM card and an eSIM card, which gives users connect to different data networks with their respective plans. This feature is particularly suitable for individuals who require separate phone networks for different purposes or who frequently roam overseas.` },
  { q: "What is A non-steering M2M SIM?", a: `Non-steering M2M SIM card refers to a machine-to-machine (M2M) SIM card that does not have any restrictions or limitations on the network or service it can be used with. M2M SIM cards are specifically designed for devices and applications that require connectivity for communication and data exchange, such as smart meters, GPS trackers, vending machines, or industrial sensors. Non-steering M2M SIM cards offer the flexibility for these devices to connect to any available cellular network, regardless of the network operator. This means that they can be used globally, roaming seamlessly between different networks and countries, without any limitations or restrictions. With Zoiko Mobile's M2M SIM cards, you can get cohesive network coverage as prefer. The following benefits you may expect: – Build your own Carrier Wi-Fi network footprint and revoke the other network operators you decline. – Configure Multi-Network Management. – Remotely switch carrier connectivity with instant SIM list switching. Businesses and organizations can easily deploy their M2M devices and systems with non-steering M2M SIM cards, ensuring reliable connectivity and uninterrupted data exchange across different networks and regions.` },
  { q: "Can I get Zoiko Mobile's eSIM cards prepaid plans?", a: `Yes, indeed! We are equipped with eSIM cards' prepaid plans only, for all our customers, if your smartphones are compatible with the 5G eSIM card technology, you can successfully get our eSIM card deals for prepaid customers.` },
  { q: "How does scanning an eSIM card QR code with a smartphone work?", a: `Scanning a QR code with a smartphone is a simple and convenient process. It involves using the built-in camera on your smartphone to capture the QR code image and decode the barcode embedded within it. Here's how it typically works:
1. Open your smartphone's camera app: Open the camera app on your smartphone.
2. Align the sent QR code within the camera frame: Hold your smartphone steady and position it so that the QR code is visible within the camera frame. Make sure the entire QR code is within the frame and not cut off.

Let your smartphone detect the QR code: Once the QR code is in focus, your smartphone will automatically detect it.
1. Tap on the notification or follow the instructions: Depending on your device, you may receive a notification or prompt to open a link associated with the QR code.
2. Access information: After scanning, you will be directed to a webpage, app, or other relevant content related to the QR code.` },
  { q: "How do I activate my eSIM cards that I ordered online via the Zoiko Mobile website?", a: `Please follow this guide to activate your eSIM card:

I) After choosing and ordering our bundle plan for your digital sim card or eSIM online from Zoiko Mobile, you going to receive a confirmation email.

II) This email consists of a QR code for turning on your eSIM card.

III) Concerning your smartphone models (iOS or Android), oversee the guide below for the successful activation of your eSIM card;

For iPhone users: Your smartphone's WiFi connection is needed when activating your eSIM card with a QR code from your email ID. To download your eSIM card, open the camera app on your smartphone, align the sent QR code within the camera frame and follow the instructions. If you are still unable to scan the QR code, keep overseeing the below steps.
Connect the Wi-Fi network on your smartphone.
Open Quick Settings.
Access Mobile data on.
Click on eSIM card manager.
Click on "Add Mobile plan".
Follow the eSIM card activating instructions by scanning the QR code from Zoiko Mobile.

Google Smartphone users:
For the same purpose, connect your Wi-Fi network on your device and select the eSIM card activation prompt with a QR code from Zoiko Mobile. To download eSIM on your smartphone, open the camera app on your smartphone, align the sent QR code within the camera frame and follow the instructions. If you are still unable to scan the QR code, keep overseeing the below steps.
Connect the Wi-Fi network on your smartphone.
Open Quick Settings.
Select Network & Internet.
Choose the plus sign (+) that appears next to the Mobile network.
Click Download SIM instead. Then click on the "Next" button.
Follow the eSIM card activating instructions by scanning the QR code from Zoiko Mobile.

Huawei Smartphone users:
For the same purpose, connect your Wi-Fi network on your device and select the eSIM card activation prompt with a QR code from Zoiko Mobile.
Connect the Wi-Fi network on your smartphone.
Open Quick Settings.
Access Mobile data on.
Click on "Add eSIM card" (It will allow you to open the QR code scanner).
Follow the eSIM card activating instructions by scanning the QR code from Zoiko Mobile.

Samsung Smartphone users:
For the same purpose, connect your Wi-Fi network on your device and select the eSIM card activation prompt with a QR code from Zoiko Mobile. To download eSIM on your smartphone, open the camera app on your smartphone, align the sent QR code within the camera frame and follow the instructions. If you are still unable to scan the QR code, keep overseeing the below steps.
Connect the Wi-Fi network on your smartphone.
Open Quick Settings and choose Mobile Network.
Select SIM Management.
Click on Add eSIM card.
Click Sim Type – eSIM card.
Follow the eSIM card activating instructions by scanning the QR code from Zoiko Mobile.` },
  { q: "Can I activate my eSIM whilst I'm out of the UK?", a: `Your Zoiko Mobile eSIM card must be active in the UK territory. Once you cross the border, your eSIM card tariff plan needs to be activated as per the international standard plan.` },
  { q: "I am an existing Zoiko Mobile customer and have a physical SIM card too. How do I exchange it with an eSIM card?", a: `It's easy to swap an eSIM card with another physical SIM! Here's how:
1. Go to zoikomobile.co.uk and place your order for a free eSIM card.
2. Once you purchase an eSIM card, you will get a confirmation email from Zoiko Mobile with a QR code.
3. Then scan the QR code from your smartphone and install the eSIM card on your smartphone.
4. Then you need to log in to your Zoiko Mobile account from our website.
5. Visit the Account Manager section.
6. Press the tick button on the "SIM Swap" menu on the left navigation panel.
7. Choose the option to exchange from a physical SIM to an eSIM card. And you have done.` },
  { q: "How many devices are compatible with your Zoiko Mobile eSIM card?", a: `Zoiko Mobile eSIM card is the most convenient way to use your smart devices. It gives you more flexibility to switch between plans with Zoiko Mobile and allows you to enjoy the convenience of porting your number. Stay connected with your friends, colleagues, and families. Just have a look at our device-compatible tabs and match your smartphone device's name for the compatible check.` },
  { q: "How do I consume less data, how do I cut costs?", a: `If you want to reduce your data costs, it's crucial to consider the key features that can help you achieve this goal. Zoiko Mobile enables encryption, cloud certificates, and certificate validation to be added to the network instead of the device's SDK, ensuring greater security on the network for the public domain. That signifies, don't have to worry about having SDKs on your device, and everything just happens seamlessly in the network. No more cluttered apps, no more worrying about updates – everything just works!` },
  { q: "Whom I talk to if any queries?", a: `If you have any doubts, please reach out to us. We can connect you with a CS executives who can answer your detailed questions about connectivity.
If you are still interested in Zoiko Mobile, our customer service team will guide you and your team through the onboarding process. Our team consists of top executives who have been engaged in several development projects and processes of larger deployments on a global scale.
No need to worry, you will get used to it and save time troubleshooting.` },
  { q: "What plan durations are available?", a: `Zoiko Mobile offers flexible plan durations, including 30-day, 12-month, or 24-month options. Choose the plan that best suits your needs.` },
  { q: "Can I switch plans if I need more data or minutes?", a: `Absolutely! With Zoiko Mobile, you can easily switch plans using the Zoiko Mobile App or your online account, providing the flexibility to adjust your plan based on your requirements.` },
  { q: "What are the key features of Zoiko Mobile plans?", a: `Zoiko Mobile plans come with a monthly data allowance, unlimited talk, MMS, Wi-Fi calling, and customised SMS. Additionally, enjoy perks such as inclusive Roaming.` },
  { q: "How do I use Inclusive Roaming?", a: `Inclusive Roaming allows you to use your Zoiko Mobile plan abroad without incurring additional charges. Ensure your phone is set up for roaming, and you're good to stay connected internationally.` },
  { q: "Can I use Zoiko Mobile eSIM data plans with any phone?", a: `Zoiko Mobile eSIM cards can used in any 5G compatible device with most GSM unlocked phones. Just make sure your phone is not locked to another network before inserting the Zoiko eSIM card.` },
  { q: "How do I get started with Zoiko Mobile eSIM Only plans?", a: `Getting started is easy! Order your Zoiko Mobile eSIM card, pop it into your phone, and activate it following the provided instructions. You'll be enjoying your budget-friendly plan in no time.` },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function HelpSupport() {
  // First item open by default (matches the screenshot).
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  const toggle = (i: number) => setOpen((o) => ({ ...o, [i]: !o[i] }));

  return (
    <main className="bg-white font-sans dark:bg-gray-900">
      {/* ─── Popular Articles ─── */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 md:px-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-center text-2xl font-bold text-gray-800 sm:text-3xl dark:text-white">Popular Articles</h1>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0568f] to-[#e6007e] text-white">
                  <Icon />
                </div>
                <h2 className="mt-4 font-bold text-[#e6007e]">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-white px-4 py-12 sm:px-6 md:px-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          {/* Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-6 py-7 text-center">
            <h2 className="font-extrabold text-white text-[clamp(1.3rem,3.5vw,1.9rem)]">Got Questions? Zoiko&rsquo;s Got Answers</h2>
          </div>

          {/* Accordion */}
          <div className="mt-6 space-y-3">
            {faqs.map((item, i) => {
              const isOpen = Boolean(open[i]);
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    isOpen
                      ? "border-[#0e8f74]/40 bg-[#f0fbf6] dark:border-[#0e8f74]/50 dark:bg-[#0e8f74]/10"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.q}</span>
                    <Chevron open={isOpen} />
                  </button>
                  {isOpen && (
                    <div className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default HelpSupport;
export { HelpSupport };