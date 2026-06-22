"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import beQuick from "../utils/dasdbeQuickApi";

// ---------- Types ----------
interface SubscriberInfo {
  id?: string | number;
  subscriber_id?: string | number;
  primary_line_id?: string | number;
  email?: string;
  contact_number?: string;
  two_fa?: boolean;
}

interface PlanDetails {
  current_plans?: { id: string | number; name: string }[];
  service_period?: { end_at?: string };
  usage_summary?: {
    data?: UsageBlock;
    international_data?: UsageBlock;
  };
  line?: { device_identifier_ids?: (string | number)[]; status?: string };
}

interface UsageBlock {
  total?: string | number;
  used?: string | number;
  remaining?: string | number;
}

interface Device {
  label: string;
  note: string;
  status: string;
}

interface Card {
  id: string | number;
  card_holder_name?: string;
  card_holder?: string;
  last4?: string;
  card_number?: string;
  exp_month?: string | number;
  exp_year?: string | number;
  expiry_month?: string | number;
  expiry_year?: string | number;
}

interface Order {
  id?: string | number;
  order_id?: string | number;
  date?: string;
  created_at?: string;
  description?: string;
  amount?: string | number;
  total?: string | number;
}
interface NewCard {
  card_number: string;
  card_holder_name: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

// ---------- Helpers ----------
function formatDateAndRemaining(endAt?: string): { formatted: string; remainingDays: number | "N/A" } {
  if (!endAt) return { formatted: "N/A", remainingDays: "N/A" };
  const endDate = new Date(endAt);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const formatted = endDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return { formatted, remainingDays };
}

function kbToGb(kb: number): number {
  return kb / 1024 / 1024;
}

const DEFAULT_DEVICES: Device[] = [
  { label: "Device 3132", note: "pSIM • Primary Line (Selected)", status: "Active" },
  { label: "Device #77", note: "pSIM • Secondary Line", status: "Pending" },
];

async function fetchDevices(planDetailsInfo: PlanDetails | null): Promise<Device[]> {
  try {
    const deviceIds = planDetailsInfo?.line?.device_identifier_ids || [];
    if (deviceIds.length > 0) {
      return deviceIds.map((id, index) => ({
        label: `Device ${id}`,
        note: index === 0 ? "pSIM • Primary Line (Selected)" : "pSIM • Secondary Line",
        status: planDetailsInfo?.line?.status === "active" ? "Active" : "Pending",
      }));
    }
    return DEFAULT_DEVICES;
  } catch {
    return DEFAULT_DEVICES;
  }
}

// ---------- Component ----------
export default function MyAccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState<SubscriberInfo | null>(null);
  const [plans, setPlans] = useState<unknown[]>([]);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [lineUsage, setLineUsage] = useState<unknown>(null);
  const [currentBill, setCurrentBill] = useState<{ total?: number; closed_at?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [primaryLineId, setPrimaryLineId] = useState<string | number | null>(null);
  const [devices, setDevices] = useState<Device[]>(DEFAULT_DEVICES);
  const [userName, setUserName] = useState("Customer");
  const [accountEmail, setAccountEmail] = useState("");
  const [showSimModal, setShowSimModal] = useState(false);

  // Card states
  const [cards, setCards] = useState<Card[]>([]);
  const [savingCard, setSavingCard] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCard, setNewCard] = useState<NewCard>({
    card_number: "",
    card_holder_name: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });

  // ---------- Card API ----------
  async function fetchCards(): Promise<void> {
    try {
      const token = localStorage.getItem("zoiko_token");
      if (!token) { setCards([]); return; }
      const response = await fetch("#", {
        headers: { Authorization: `Token ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setCards(data?.success ? data.cards || [] : []);
    } catch {
      setCards([]);
    }
  }

  async function saveCard(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const { card_number, card_holder_name, exp_month, exp_year, cvv } = newCard;
    if (!/^\d{16}$/.test(card_number)) { alert("Card number must be exactly 16 digits."); return; }
    if (!card_holder_name.trim()) { alert("Card holder name is required."); return; }
    if (!/^(0[1-9]|1[0-2])$/.test(exp_month)) { alert("Expiry month must be 01–12."); return; }
    if (!/^\d{4}$/.test(exp_year) || parseInt(exp_year) < new Date().getFullYear()) {
      alert("Expiry year must be a valid future year."); return;
    }
    if (!/^\d{3,4}$/.test(cvv)) { alert("CVV must be 3 or 4 digits."); return; }

    setSavingCard(true);
    try {
      const token = localStorage.getItem("zoiko_token");
      if (!token) { alert("Please login again!"); return; }
      const response = await fetch("#", {
        method: "POST",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });
      const data = await response.json();
      if (data.success) {
        alert("Card added successfully!");
        setShowCardModal(false);
        setNewCard({ card_number: "", card_holder_name: "", exp_month: "", exp_year: "", cvv: "" });
        await fetchCards();
      } else {
        alert(data.message || "Failed to save card. Please check details.");
      }
    } catch {
      alert("Error saving card!");
    } finally {
      setSavingCard(false);
    }
  }

  async function useCard(cardId: string | number): Promise<void> {
    try {
      const token = localStorage.getItem("zoiko_token");
      if (!token) { alert("Please login again!"); return; }
      const response = await fetch("#", {
        method: "POST",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId }),
      });
      const data = await response.json();
      if (data.success) { alert("Card selected successfully!"); await fetchCards(); }
      else alert("Failed to set active card!");
    } catch {
      alert("Error selecting card!");
    }
  }

  async function deleteCard(cardId: string | number): Promise<void> {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      const token = localStorage.getItem("zoiko_token");
      if (!token) { alert("Please login again!"); return; }
      const response = await fetch(`#`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        alert("Card deleted successfully!");
      } else {
        alert("Failed to delete card!");
      }
    } catch {
      alert("Error deleting card!");
    }
  }

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (!/^\d*$/.test(value)) return;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- Load Dashboard ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Require a logged-in user; otherwise bounce to login.
        const token = localStorage.getItem("zoiko_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(localStorage.getItem("zoiko_user") || "{}");
        const userEmail: string = userData?.email || "";
        const displayName =
          [userData?.first_name, userData?.last_name].filter(Boolean).join(" ").trim() ||
          userData?.username ||
          userData?.name ||
          "Customer";
        setUserName(displayName);
        setAccountEmail(userEmail);

        await fetchCards();

        // Best-effort BeQuick enrichment. If any of this is missing or fails,
        // the dashboard still renders with default/placeholder values.
        if (userEmail) {
          try {
            const subscriberResult = (await beQuick.getSubscriberByEmail(userEmail)) as { subscriber_id?: number };
            const SUBSCRIBER_ID = subscriberResult?.subscriber_id;

            if (SUBSCRIBER_ID) {
              try {
                const subDetails = (await beQuick.getSubscriberDetails(SUBSCRIBER_ID)) as { subscribers: SubscriberInfo[] };
                const subscriberInfo = subDetails?.subscribers?.[0];
                if (subscriberInfo) {
                  setSubscriber(subscriberInfo);
                  setPrimaryLineId(subscriberInfo.primary_line_id ?? null);

                  if (subscriberInfo.primary_line_id) {
                    try {
                      const pDetails = (await beQuick.getPlanDetails(subscriberInfo.primary_line_id, true)) as PlanDetails;
                      setPlanDetails(pDetails);
                      setDevices(await fetchDevices(pDetails));
                    } catch { /* keep defaults */ }
                    try {
                      setLineUsage(await beQuick.getLineBuckets(subscriberInfo.primary_line_id));
                    } catch { /* ignore */ }
                  }
                }
              } catch { /* ignore */ }

              try {
                const plansData = (await beQuick.getAllPlans()) as { products?: unknown[]; data?: unknown[] };
                setPlans(plansData?.products || plansData?.data || []);
              } catch { /* ignore */ }

              try {
                const bill = (await beQuick.getCurrentBill(SUBSCRIBER_ID)) as { total?: number; closed_at?: string } | null;
                setCurrentBill(bill || null);
              } catch { /* ignore */ }

              try {
                const ord = (await beQuick.getOrders(SUBSCRIBER_ID)) as { orders?: Order[]; data?: Order[] };
                setOrders(ord?.orders || ord?.data || []);
              } catch { /* ignore */ }
            }
          } catch {
            // BeQuick unavailable for this user — fine, render the dashboard anyway.
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Derived values ----------
  const currentBilli = currentBill?.total || 0;
  const nextPayment = currentBill?.closed_at
    ? new Date(currentBill.closed_at).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "-";

  const servicePeriod = planDetails?.service_period || {};
  const domesticData = planDetails?.usage_summary?.data || {};
  const domesticTotalGB = domesticData.total ? kbToGb(Number(domesticData.total)) : 0;
  const domesticUsedGB = domesticData.used ? kbToGb(Number(domesticData.used)) : 0;
  const domesticRemainingGB = domesticData.remaining !== undefined
    ? kbToGb(Number(domesticData.remaining)) : domesticTotalGB - domesticUsedGB;
  const domesticPercentUsed = domesticTotalGB > 0 ? Math.round((domesticUsedGB / domesticTotalGB) * 100) : 0;

  const intlData = planDetails?.usage_summary?.international_data || {};
  const intlTotalGB = intlData.total ? kbToGb(Number(intlData.total)) : 0;
  const intlUsedGB = intlData.used ? kbToGb(Number(intlData.used)) : 0;
  const intlRemainingGB = intlData.remaining !== undefined
    ? kbToGb(Number(intlData.remaining)) : intlTotalGB - intlUsedGB;
  const intlPercentUsed = intlTotalGB > 0 ? Math.round((intlUsedGB / intlTotalGB) * 100) : 0;

  const { formatted: activeUntil, remainingDays } = formatDateAndRemaining(servicePeriod?.end_at);

  const openChat = (): void => {
    const tawk = window as Window & { Tawk_API?: { maximize: () => void } };
    if (tawk.Tawk_API) {
      tawk.Tawk_API.maximize();
    } else {
      alert("Chat is loading... please try again in a moment!");
    }
  };

  // ---------- Render ----------
  return (
    <div className="flex flex-col min-h-screen">
      <main className="grow dark:bg-gray-900 dark:text-white bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Dashboard */}
          {!loading && (
            <>
              {/* Welcome banner */}
              <div className="bg-green-100 border border-green-400 text-green-800 text-center px-4 py-3 rounded mb-6 font-bold">
                👋 Welcome, {userName}!
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

                {/* Plans & Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">My Plans &amp; Usage</h6>
                  <p className="text-gray-500 text-sm mb-4">See active plans, data use and renewal options</p>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
                    <h6 className="font-bold mb-1">{planDetails?.current_plans?.[0]?.name || "N/A"}</h6>
                    <small className="text-green-600">Active until: {activeUntil}</small>
                  </div>

                  {/* Domestic */}
                  <h6 className="text-sm font-semibold mb-1">Domestic Data</h6>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{domesticUsedGB.toFixed(2)} GB Used</span>
                    <span>{domesticRemainingGB.toFixed(2)} GB Remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${domesticPercentUsed}%` }} />
                  </div>
                  <small className="text-gray-400 block mb-3">
                    {domesticPercentUsed}% used {remainingDays !== "N/A" && `• Renews in ${remainingDays} days`}
                  </small>

                  {/* Roaming */}
                  <h6 className="text-sm font-semibold mb-1">Roaming Data</h6>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{intlUsedGB.toFixed(2)} GB Used</span>
                    <span>{intlRemainingGB.toFixed(2)} GB Remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${intlPercentUsed}%` }} />
                  </div>
                  <small className="text-gray-400 block mb-4">
                    {intlPercentUsed}% used {remainingDays !== "N/A" && `• Renews in ${remainingDays} days`}
                  </small>

                  <div className="flex gap-2 mt-auto">
                    <Link
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      href={`/dashboard/plan-usages/${primaryLineId}`}
                    >
                      View details
                    </Link>
                    <Link
                      className="px-3 py-1.5 bg-yellow-400 text-white text-sm rounded-md hover:bg-yellow-500 transition-colors"
                      href="/plans"
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                </div>

                {/* Devices & SIMs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">My Devices &amp; SIMs</h6>
                  <p className="text-gray-500 text-sm mb-4">Activate, pause, or switch your pSIM/eSIM</p>

                  {devices.map((d, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-3 mb-3">
                      <div>
                        <strong>{d.label}</strong>
                        <p className="text-gray-400 text-xs mb-0">{d.note}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        d.status === "Active"
                          ? "bg-green-600 text-white"
                          : "bg-yellow-400 text-gray-800"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-auto pt-2">
                    {subscriber?.id && (
                      <Link href={`/dashboard/my-devices-sims/${subscriber.id}`}>
                        <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                          Manage SIMs
                        </button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Billing & Payment */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">Billing &amp; Payment</h6>
                  <p className="text-gray-500 text-sm mb-4">Update payment method or view invoices</p>

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h5 className="font-bold mb-0">${Number(currentBilli).toFixed(2)}</h5>
                      <small className="text-gray-400">Current Bill</small>
                    </div>
                    <div>
                      <h6 className="font-bold mb-0">{nextPayment}</h6>
                      <small className="text-gray-400">Next Payment</small>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-2">Payment Method</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Account Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">Account Settings</h6>
                  <p className="text-gray-500 text-sm mb-4">Manage password, contact info, and security</p>
                  <p className="text-sm font-semibold mb-1">Contact Info</p>
                  <p className="text-gray-400 text-sm mb-0">{accountEmail || "—"}</p>
                  <p className="text-gray-400 text-sm mb-4">{subscriber?.contact_number || ""}</p>
                  <p className="text-sm font-semibold mb-1">Security</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Two-factor authentication {subscriber?.two_fa ? "enabled" : "disabled"}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Link href="/dashboard/edit-profile"
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>

                {/* Order History */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">Order History</h6>
                  <p className="text-gray-500 text-sm mb-4">Track previous orders</p>
                  {orders.slice(0, 3).map((o, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">{o.date || o.created_at || ""}</p>
                      <p>
                        <strong>Order {o.id || o.order_id || ""} - {o.description || ""}</strong>{" "}
                        <span className="text-gray-400">${Number(o.amount || o.total || 0).toFixed(2)}</span>
                      </p>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-auto">
                    <Link href="/dashboard/orders">
                      <button className="px-3 py-1.5 border border-green-600 text-green-600 text-sm rounded-md hover:bg-green-50 transition-colors">
                        View All Orders
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base text-red-500 mb-1">Request Support</h6>
                  <p className="text-gray-500 text-sm mb-4">Instant access to help with account pre-filled</p>
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded text-sm mb-4">
                    Need help? Our support team is available 24/7
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href="/faqs-self-service">
                      <button className="w-full px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                        FAQ
                      </button>
                    </Link>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href="/contact-us">
                      <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                        Contact Support
                      </button>
                    </Link>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h5 className="font-semibold text-lg">Add Payment Card</h5>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={saveCard} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234123412341234"
                  name="card_number"
                  maxLength={16}
                  value={newCard.card_number}
                  onChange={handleNumericInput}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  name="card_holder_name"
                  value={newCard.card_holder_name}
                  onChange={(e) => setNewCard({ ...newCard, card_holder_name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month (MM)</label>
                  <input
                    type="text"
                    name="exp_month"
                    placeholder="08"
                    maxLength={2}
                    value={newCard.exp_month}
                    onChange={handleNumericInput}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year (YYYY)</label>
                  <input
                    type="text"
                    name="exp_year"
                    placeholder="2028"
                    maxLength={4}
                    value={newCard.exp_year}
                    onChange={handleNumericInput}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="password"
                  name="cvv"
                  placeholder="123"
                  maxLength={4}
                  value={newCard.cvv}
                  onChange={handleNumericInput}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  disabled={savingCard}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCard}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {savingCard ? "Saving..." : "Save Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activate SIM Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="px-6 pt-6 pb-0 border-b pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 text-center">
                  <h4 className="font-bold text-xl mb-1">Get Your SIM in 3 Simple Steps</h4>
                  <p className="text-gray-400 text-sm mb-0">Quick activation. Seamless connectivity. No paperwork.</p>
                </div>
                <button
                  onClick={() => setShowSimModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { step: 1, title: "Choose a Plan", desc: "Pick a plan that fits your needs — Unlimited, Prepaid, Postpaid, Business, or Travel plans available.", full: false },
                  { step: 2, title: "Select SIM Type", desc: "Choose eSIM for instant activation or order a physical SIM delivered to your doorstep.", full: false },
                  { step: 3, title: "Activate & Go", desc: "Complete activation online and enjoy fast, reliable 4G/5G coverage within minutes.", full: true },
                ].map(({ step, title, desc, full }) => (
                  <div key={step} className={`${full ? "md:col-span-2" : ""} h-full p-4 rounded-lg border bg-gray-50`}>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {step}
                      </div>
                      <div>
                        <h6 className="font-semibold text-red-500 mb-1">{title}</h6>
                        <p className="text-gray-400 text-sm mb-0">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                className="px-8 py-2.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                onClick={() => { setShowSimModal(false); router.push("/all-plans"); }}
              >
                View Plans &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}