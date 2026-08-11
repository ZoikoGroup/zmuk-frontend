// "use client";

// import { useEffect, useState } from "react";
// import {
//   FaShieldAlt,
//   FaKey,
//   FaHistory,
//   FaExclamationTriangle,
//   FaCheckCircle,
//   FaExclamationCircle,
// } from "react-icons/fa";

// const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/security/`;

// interface Toast {
//   msg: string;
//   type: "success" | "error" | "";
// }

// interface LoginEntry {
//   id: number;
//   device: string;
//   location: string;
//   time: string;
// }

// export default function SecurityPage() {
//   const [token, setToken] = useState<string>("");
//   const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);
//   const [twoFALoading, setTwoFALoading] = useState<boolean>(false);
//   const [reportLoading, setReportLoading] = useState<boolean>(false);
//   const [reportNote, setReportNote] = useState<string>("");
//   const [toast, setToast] = useState<Toast>({ msg: "", type: "" });

//   // Demo login history — replace with API result when ready.
//   const loginHistory: LoginEntry[] = [
//     { id: 1, device: "Chrome on Windows 11", location: "Bangalore, IN", time: "Today, 09:42" },
//     { id: 2, device: "Safari on iPhone", location: "Bangalore, IN", time: "Yesterday, 21:18" },
//     { id: 3, device: "Firefox on macOS", location: "Mumbai, IN", time: "12 May, 14:05" },
//   ];

//   // ── Load token (optional — auth gating disabled) ──
//   useEffect(() => {
//     const storedToken = localStorage.getItem("driverx_token") || "";
//     setToken(storedToken);

//     const stored2FA = localStorage.getItem("driverx_2fa") === "true";
//     setTwoFAEnabled(stored2FA);
//   }, []);

//   const showToast = (msg: string, type: "success" | "error") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast({ msg: "", type: "" }), 3500);
//   };

//   // ── Toggle 2FA ──
//   const toggle2FA = async () => {
//     setTwoFALoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}two-fa/`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Token ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ enabled: !twoFAEnabled }),
//       });

//       if (res.ok) {
//         const next = !twoFAEnabled;
//         setTwoFAEnabled(next);
//         localStorage.setItem("driverx_2fa", String(next));
//         showToast(
//           next
//             ? "Two-factor authentication enabled."
//             : "Two-factor authentication disabled.",
//           "success"
//         );
//       } else {
//         // Optimistic UI fallback so the page still feels responsive in dev.
//         const next = !twoFAEnabled;
//         setTwoFAEnabled(next);
//         localStorage.setItem("driverx_2fa", String(next));
//         showToast(
//           next ? "2FA enabled (local)." : "2FA disabled (local).",
//           "success"
//         );
//       }
//     } catch {
//       // Same optimistic fallback for network errors during development.
//       const next = !twoFAEnabled;
//       setTwoFAEnabled(next);
//       localStorage.setItem("driverx_2fa", String(next));
//       showToast(
//         next ? "2FA enabled (offline)." : "2FA disabled (offline).",
//         "success"
//       );
//     }
//     setTwoFALoading(false);
//   };

//   // ── Report suspicious activity ──
//   const submitReport = async () => {
//     if (!reportNote.trim()) {
//       showToast("Please describe the suspicious activity first.", "error");
//       return;
//     }
//     setReportLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}report/`, {
//         method: "POST",
//         headers: {
//           Authorization: `Token ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ note: reportNote }),
//       });

//       if (res.ok) {
//         showToast("Report submitted. Our team will review it shortly.", "success");
//         setReportNote("");
//       } else {
//         showToast("Report received (local). We'll follow up by email.", "success");
//         setReportNote("");
//       }
//     } catch {
//       showToast("Network error. Please try again.", "error");
//     }
//     setReportLoading(false);
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <main className="flex-grow dark:bg-gray-900 dark:text-white bg-gray-100 py-8 px-4">
//         <div className="max-w-5xl mx-auto">

//           {/* Page Header */}
//           <div className="flex justify-between items-center mb-6">
//             <h4 className="text-xl font-bold">Security</h4>
//           </div>

//           {/* Toast */}
//           {toast.msg && (
//             <div className={`flex items-center gap-2 px-4 py-3 rounded mb-6 border text-sm ${
//               toast.type === "success"
//                 ? "bg-green-50 border-green-400 text-green-700"
//                 : "bg-red-100 border-red-400 text-red-700"
//             }`}>
//               {toast.type === "success"
//                 ? <FaCheckCircle className="text-green-500" />
//                 : <FaExclamationCircle className="text-red-500" />
//               }
//               {toast.msg}
//             </div>
//           )}

//           {/* Two-Factor Authentication */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="text-green-500 text-xl">
//                 <FaShieldAlt />
//               </div>
//               <h5 className="font-semibold text-base">Two-Factor Authentication</h5>
//             </div>

//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//               Add an extra layer of protection by requiring a verification code
//               in addition to your password when you sign in.
//             </p>

//             <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
//               <div>
//                 <p className="text-sm font-medium">
//                   {twoFAEnabled ? "2FA is currently ON" : "2FA is currently OFF"}
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                   {twoFAEnabled
//                     ? "You'll be asked for a verification code on new sign-ins."
//                     : "We recommend enabling 2FA for better account security."}
//                 </p>
//               </div>
//               <button
//                 onClick={toggle2FA}
//                 disabled={twoFALoading}
//                 className={`px-4 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
//                   twoFAEnabled
//                     ? "bg-red-600 hover:bg-red-700"
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//               >
//                 {twoFALoading
//                   ? "Working..."
//                   : twoFAEnabled
//                   ? "Disable 2FA"
//                   : "Enable 2FA"}
//               </button>
//             </div>
//           </div>

//           {/* Change Password CTA */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="text-green-500 text-xl">
//                 <FaKey />
//               </div>
//               <h5 className="font-semibold text-base">Change Password</h5>
//             </div>

//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//               You can update your password from the Edit Profile page.
//             </p>

//             <div className="flex gap-3 flex-wrap">
//               <a
//                 href="/dashboard/edit-profile"
//                 className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
//               >
//                 Go to Edit Profile
//               </a>
//               <button
//                 onClick={() => window.history.back()}
//                 className="px-4 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//               >
//                 ← Back
//               </button>
//             </div>
//           </div>

//           {/* Login History */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="text-green-500 text-xl">
//                 <FaHistory />
//               </div>
//               <h5 className="font-semibold text-base">Login History</h5>
//             </div>

//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//               Recent sign-in activity on your account.
//             </p>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
//                     <th className="py-2 font-medium">Device</th>
//                     <th className="py-2 font-medium">Location</th>
//                     <th className="py-2 font-medium">Time</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loginHistory.map((entry) => (
//                     <tr
//                       key={entry.id}
//                       className="border-b border-gray-100 dark:border-gray-700 last:border-0"
//                     >
//                       <td className="py-3">{entry.device}</td>
//                       <td className="py-3 text-gray-500 dark:text-gray-400">{entry.location}</td>
//                       <td className="py-3 text-gray-500 dark:text-gray-400">{entry.time}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Report Suspicious Activity */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="text-red-500 text-xl">
//                 <FaExclamationTriangle />
//               </div>
//               <h5 className="font-semibold text-base">Report Suspicious Activity</h5>
//             </div>

//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//               Noticed a login you don&apos;t recognise, or anything unusual? Tell
//               us about it and our team will investigate.
//             </p>

//             <textarea
//               rows={4}
//               placeholder="Describe what looked off (e.g. unfamiliar device, unexpected password reset email)..."
//               value={reportNote}
//               onChange={(e) => setReportNote(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-none mb-4"
//             />

//             <div className="flex gap-3 flex-wrap">
//               <button
//                 onClick={submitReport}
//                 disabled={reportLoading}
//                 className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 {reportLoading ? "Submitting..." : "Submit Report"}
//               </button>
//               <button
//                 onClick={() => setReportNote("")}
//                 className="px-4 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import {
  Share2,
  Tag,
  HelpCircle,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  UserPlus,
  ArrowUpRight,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountSummaryPage() {
  const [activeTab, setActiveTab] = useState("Account Summary");
  const [autoPay, setAutoPay] = useState(true);
  const [selectedUser, setSelectedUser] = useState("andrew");
  const [showPhone, setShowPhone] = useState(false);
  const [showImei, setShowImei] = useState(false);

  const router = useRouter();

  const navigationItems = [
    { label: "Refer & Earn", icon: Share2, href: "/refer-a-friend" },
    { label: "Latest Offers", icon: Tag, href: "/bundled-offers" },
  ];

  const dummyPageLinks = [
    { label: "Manage Devices", href: "/devices" },
    { label: "Roaming & Add-ons", href: "/recharge" },
    { label: "Data Boosters", href: "/data-only-plans" },
    { label: "SIM Swap Request", href: "/sim-check" },
  ];

  const bottomNavItems = [
    { label: "Help & Support", icon: HelpCircle, href: "/help-support" },
    {
      label: "Terms and Conditions",
      icon: ShieldCheck,
      href: "/terms-and-conditions",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans antialiased text-[#222222]">
      {/* Pink Header Banner */}
      <header className="w-full bg-gradient-to-r from-[#E5125A] via-[#E5127D] to-[#E5125A] py-3 text-center text-white font-semibold text-sm sm:text-base shadow-sm">
        Welcome to Your Account Summary with Zoiko Mobile!
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-xl shadow-sm py-5 px-0 flex flex-col justify-between overflow-hidden">
          <div>
            {/* User Profile Header */}
            <div className="flex flex-col items-center text-center px-4 mb-5">
              <div className="relative inline-block">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt="Amelia Agnes"
                  className="w-20 h-20 rounded-full object-cover shadow-sm"
                />
                <button className="absolute bottom-0 right-0 bg-[#0080FF] text-white p-1 rounded-full shadow hover:bg-blue-600 transition flex items-center justify-center w-5 h-5 text-[10px]">
                  ✏️
                </button>
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-2.5">
                Amelia Agnes
              </h2>
              <button className="mt-2 text-xs font-medium text-[#555555] border border-gray-300 rounded-md px-3 py-1 flex items-center gap-1.5 hover:bg-gray-50 transition">
                <LogOut className="w-3.5 h-3.5 text-gray-500" /> Logout
              </button>
            </div>

            {/* Main Navigation Links */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-3 px-5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#E5125A] text-white"
                        : "text-[#555555] hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-white text-[#E5125A]"
                          : "bg-[#E5125A] text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Dummy Placeholder Links */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <span className="block px-5 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                More Pages
              </span>
              <nav className="space-y-1">
                {dummyPageLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="w-full flex items-center gap-3 px-5 py-2 text-xs font-semibold text-[#555555] hover:bg-gray-50 transition"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Secondary Links */}
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-5 py-2 text-xs font-semibold text-[#555555] hover:bg-gray-50 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E5125A] text-white flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* Welcome Banner Header */}
          <div className="text-center pb-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, <span className="text-[#7B7B7B]">Amelia!</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Welcome to Your Account Summary
            </p>
          </div>

          {/* Top Section: Plan Card & Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Zoiko Essentials Plan Card */}
            <div className="md:col-span-6 border border-[#DF1E5A] bg-[#DF1E5A0D] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      Zoiko Essentials
                    </h3>
                    <span className="border border-[#000000] text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      Active
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#E5125A]">
                      $38.00
                    </span>
                    <span className="text-xs font-semibold text-[#E5125A]">
                      /mo
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5 text-xs">
                  <div>
                    <span className="block text-gray-600 font-semibold text-[11px]">
                      Phone Number
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-400 tracking-[1px] leading-6 font-medium mt-1 text-xs">
                      <span>
                        {showPhone
                          ? "+1 555 345 6789"
                          : "+1   xxx   xxx   3 4 5 6"}
                      </span>
                      <button
                        onClick={() => setShowPhone(!showPhone)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showPhone ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-gray-600 font-semibold text-[11px]">
                      Contract Valid Till
                    </span>
                    <span className="text-gray-400 font-medium mt-1 block text-xs">
                      12/10/2026
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center border-t border-[#FFC2D1] pt-3 mt-4">
                <button className="text-[#E5125A] font-bold text-sm inline-flex items-center gap-1.5 hover:underline">
                  Upgrade Plan <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Payment Methods Box */}
            <div className="md:col-span-6 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm bg-white">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Payment Methods
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Change how can you pay for your plan
                </p>

                {/* VISA Card Snippet */}
                <div className="mt-4 border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-white">
                  <div className="flex items-start gap-3">
                    <img
                      src="/images/Visa.png"
                      alt="VISA"
                      className="h-full w-auto object-contain"
                    />
                    <div className="text-[11px]">
                      <div className="font-bold text-gray-900">
                        VISA{" "}
                        <span className="font-normal text-gray-600">
                          ending in 6159
                        </span>
                      </div>
                      <div className="text-gray-500 text-[12px]">
                        Expires: 12/2030 <br />
                        <span className="italic">(Default)</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-[#1A1A1A] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg hover:bg-black transition">
                    Edit
                  </button>
                </div>
              </div>

              {/* AutoPay Toggle */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-3 text-xs">
                <span className="font-bold text-gray-900 text-[12px]">
                  Enable AutoPay:
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`font-bold ${
                      !autoPay ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    OFF
                  </span>
                  <button
                    onClick={() => setAutoPay(!autoPay)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      autoPay ? "bg-[#E5125A]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        autoPay ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span
                    className={`font-bold ${
                      autoPay ? "text-[#E5125A]" : "text-gray-400"
                    }`}
                  >
                    ON
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Users & Active Line Details */}
          <div className="pt-2">
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              Users &amp; Active Line Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* User 1 Card (Andrew) */}
              <div
                onClick={() => setSelectedUser("andrew")}
                className={`cursor-pointer rounded-xl p-3.5 border flex items-center gap-3 transition ${
                  selectedUser === "andrew"
                    ? "border-[#FF94B2] bg-[#FFF0F4]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white ${
                    selectedUser === "andrew"
                      ? "border-[#E5125A]"
                      : "border-gray-400"
                  }`}
                >
                  {selectedUser === "andrew" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5125A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">
                    Andrew Wilson
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span>+1 xxx xxx 3456</span>
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* User 2 Card (Erick) */}
              <div
                onClick={() => setSelectedUser("erick")}
                className={`cursor-pointer rounded-xl p-3.5 border flex items-center gap-3 transition ${
                  selectedUser === "erick"
                    ? "border-[#FF94B2] bg-[#FFF0F4]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white ${
                    selectedUser === "erick"
                      ? "border-[#E5125A]"
                      : "border-gray-400"
                  }`}
                >
                  {selectedUser === "erick" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5125A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">
                    Erick Peters
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span>+1 xxx xxx 4422</span>
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Add Family & Friends Card */}
              <div onClick={()=>router.push("/refer-a-friend")} className="border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 bg-white hover:bg-gray-50 cursor-pointer transition">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900">
                    Add Family &amp; Friends
                  </div>
                  <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
                    Link Numbers of your Family and Friends for Discounts &amp;
                    Bill Payments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Plan Detail & Usage Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t border-gray-100">
            {/* Active Plan & Contract Details */}
            <div className="md:col-span-6 space-y-4 pr-1">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="12"
                        y1="18"
                        x2="12.01"
                        y2="18"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="9"
                        y1="6"
                        x2="15"
                        y2="6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                      Active Plan
                    </span>
                    <h4 className="text-xs font-bold text-gray-900">
                      Zoiko Essentials Postpaid
                    </h4>
                  </div>
                </div>
                <button className="text-[#E5125A] text-xs font-bold hover:underline">
                  + Upgrade
                </button>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex text-[18px] items-center justify-between text-gray-900 font-bold border-b border-gray-100 pb-2">
                  <span>Contract Status</span>
                  <ChevronUp className="w-4 h-4 text-gray-700" />
                </div>

                <div className="space-y-3.5 text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>Contract Duration</span>
                    <span className="font-bold text-gray-900">12 Months</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Installments Left</span>
                    <span className="font-bold text-gray-900">10</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Next Bill Due on</span>
                    <span className="font-bold text-gray-900">
                      01/02/2025 | Amount:{" "}
                      <span className="text-[#E5125A]">$55.00</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Contract Validity Date</span>
                    <span className="font-bold text-gray-900">
                      12/11/2025{" "}
                      <span className="font-normal text-gray-500">to</span>{" "}
                      12/11/2026
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">
                      IMEI &amp; SIM Number
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                      <span>
                        {showImei ? "358921098412345" : "XXX XXX XXX XXX XXX"}
                      </span>
                      <button onClick={() => setShowImei(!showImei)}>
                        {showImei ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Summary Section */}
            <div className="md:col-span-6 space-y-4 pr-1">
              <h4 className="font-bold text-sm text-gray-900">Usage Summary</h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Data Usage Card */}
                <div className="bg-[#FFF0F4] rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                  <div className="flex items-center gap-1.5 text-gray-900 text-xs font-bold">
                    <span className="w-4 h-4 rounded-full bg-[#E5125A] text-white flex items-center justify-center text-[10px]">
                      🌐
                    </span>
                    <span>Data</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <div className="font-extrabold text-xl text-gray-900">
                        10.5GB
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Remaining
                      </div>
                    </div>

                    {/* Filled Pie Gauge for Data */}
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "conic-gradient(#E5125A 0deg 306deg, #FBD5E1 306deg 360deg)",
                      }}
                    >
                      <span className="text-[11px] font-bold text-white">
                        85%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Usage Card */}
                <div className="bg-[#FFF0F4] rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                  <div className="flex items-center gap-1.5 text-gray-900 text-xs font-bold">
                    <span className="w-4 h-4 rounded-full bg-[#E5125A] text-white flex items-center justify-center text-[10px]">
                      📞
                    </span>
                    <span>Voice</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <div className="font-extrabold text-xl text-gray-900">
                        250
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Remaining
                      </div>
                    </div>

                    {/* Filled Pie Gauge for Voice */}
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "conic-gradient(#E5125A 0deg 270deg, #FBD5E1 270deg 360deg)",
                      }}
                    >
                      <span className="text-[11px] font-bold text-white">
                        75%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Usage Row */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Texts Usage Card */}
                <div className="bg-[#FFF0F4] rounded-2xl p-4 flex items-center justify-between min-h-[110px]">
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-900 text-xs font-bold">
                      <span className="w-4 h-4 rounded-full bg-[#E5125A] text-white flex items-center justify-center text-[10px]">
                        💬
                      </span>
                      <span>Texts</span>
                    </div>
                    <div className="font-extrabold text-xl text-gray-900 mt-2">
                      20000
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      Remaining
                    </div>
                  </div>

                  {/* Filled Pie Gauge for Texts */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "conic-gradient(#E5125A 0deg 342deg, #FBD5E1 342deg 360deg)",
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-gray-700 bg-white rounded px-1 shadow-sm">
                      95%
                    </span>
                  </div>
                </div>

                {/* View Full Usage Link */}
                <div className="flex items-center justify-center p-2 text-center">
                  <button className="text-[#3B82F6] text-xs font-semibold hover:underline leading-snug">
                    View Full <br /> Usage Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
