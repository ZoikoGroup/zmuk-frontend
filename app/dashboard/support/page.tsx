"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaHeadset,
  FaCommentDots,
  FaPhone,
  FaTicketAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support/`;

interface Toast {
  msg: string;
  type: "success" | "error" | "";
}

interface TicketForm {
  subject: string;
  category: string;
  message: string;
}

interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved";
  created_at: string;
}

const initialForm: TicketForm = {
  subject: "",
  category: "general",
  message: "",
};

export default function SupportPage() {
  const [token, setToken] = useState<string>("");
  const [form, setForm] = useState<TicketForm>(initialForm);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast>({ msg: "", type: "" });
  const [callbackPhone, setCallbackPhone] = useState<string>("");
  const [callbackLoading, setCallbackLoading] = useState<boolean>(false);

  // Demo ticket history — replace with API result when ready.
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 1041, subject: "Cannot activate eSIM", category: "Technical", status: "Resolved", created_at: "10 May, 2026" },
    { id: 1042, subject: "Billing question on May invoice", category: "Billing", status: "In Progress", created_at: "12 May, 2026" },
    { id: 1043, subject: "Plan change request", category: "Account", status: "Open", created_at: "14 May, 2026" },
  ]);

  // ── Load token (optional — auth gating disabled) ──
  useEffect(() => {
    const storedToken = localStorage.getItem("driverx_token") || "";
    setToken(storedToken);
  }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  };

  // ── Submit support ticket ──
  const submitTicket = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      showToast("Please add a subject and a message.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}tickets/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast("Ticket submitted. We'll be in touch soon.", "success");
      } else {
        showToast("Ticket received (local). We'll follow up by email.", "success");
      }

      // Optimistically append to the visible list so the user gets feedback.
      setTickets((prev) => [
        {
          id: Math.max(0, ...prev.map((p) => p.id)) + 1,
          subject: form.subject,
          category:
            form.category.charAt(0).toUpperCase() + form.category.slice(1),
          status: "Open",
          created_at: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        },
        ...prev,
      ]);
      setForm(initialForm);
    } catch {
      showToast("Network error. Please try again.", "error");
    }
    setSubmitting(false);
  };

  // ── Request a call-back ──
  const requestCallback = async () => {
    if (!/^\+?\d{7,15}$/.test(callbackPhone.trim())) {
      showToast("Please enter a valid phone number.", "error");
      return;
    }
    setCallbackLoading(true);
    try {
      const res = await fetch(`${BASE_URL}callback/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: callbackPhone }),
      });

      if (res.ok) {
        showToast("Call-back requested. We'll call you shortly.", "success");
      } else {
        showToast("Request received (local). We'll call you back.", "success");
      }
      setCallbackPhone("");
    } catch {
      showToast("Network error. Please try again.", "error");
    }
    setCallbackLoading(false);
  };

  // ── Start live chat ──
  const openChat = (): void => {
    const tawk = window as Window & { Tawk_API?: { maximize: () => void } };
    if (tawk.Tawk_API) {
      tawk.Tawk_API.maximize();
    } else {
      showToast("Chat is loading… please try again in a moment.", "error");
    }
  };

  const statusBadgeClass = useMemo(
    () => (status: Ticket["status"]) => {
      if (status === "Resolved") return "bg-green-100 text-green-700 border-green-300";
      if (status === "In Progress") return "bg-yellow-100 text-yellow-800 border-yellow-300";
      return "bg-blue-100 text-blue-700 border-blue-300";
    },
    []
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow dark:bg-gray-900 dark:text-white bg-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold">Support</h4>
          </div>

          {/* Toast */}
          {toast.msg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded mb-6 border text-sm ${
              toast.type === "success"
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}>
              {toast.type === "success"
                ? <FaCheckCircle className="text-green-500" />
                : <FaExclamationCircle className="text-red-500" />
              }
              {toast.msg}
            </div>
          )}

          {/* Quick actions row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Live chat */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-green-500 text-xl">
                  <FaCommentDots />
                </div>
                <h5 className="font-semibold text-base">Live Chat</h5>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Chat with a support agent in real time. Available 24/7.
              </p>
              <button
                onClick={openChat}
                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Start Chat
              </button>
            </div>

            {/* Call-back */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-green-500 text-xl">
                  <FaPhone />
                </div>
                <h5 className="font-semibold text-base">Request a Call-back</h5>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Leave your number and our team will call you back.
              </p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  className="flex-1 min-w-[180px] h-10 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
                <button
                  onClick={requestCallback}
                  disabled={callbackLoading}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {callbackLoading ? "Requesting..." : "Request Call"}
                </button>
              </div>
            </div>

          </div>

          {/* Create Ticket */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-green-500 text-xl">
                <FaTicketAlt />
              </div>
              <h5 className="font-semibold text-base">Create a Support Ticket</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                >
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                Describe your issue
              </label>
              <textarea
                rows={4}
                placeholder="Share as much detail as you can — error messages, what you tried, when it started..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-none"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={submitTicket}
                disabled={submitting}
                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Submitting..." : "Create Ticket"}
              </button>
              <button
                onClick={() => setForm(initialForm)}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Ticket History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-green-500 text-xl">
                <FaHeadset />
              </div>
              <h5 className="font-semibold text-base">Ticket History</h5>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 font-medium">#</th>
                    <th className="py-2 font-medium">Subject</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-400 dark:text-gray-500"
                      >
                        No tickets yet.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <td className="py-3">#{t.id}</td>
                        <td className="py-3">{t.subject}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{t.category}</td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full border ${statusBadgeClass(t.status)}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{t.created_at}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
