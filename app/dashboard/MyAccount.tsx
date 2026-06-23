"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import beQuick from "../utils/dasdbeQuickApi";

// In .env.local:
//   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
//   NEXT_PUBLIC_BEQUICK_BASE_URL=https://zoiko-atom-api.bequickapps.com
//   NEXT_PUBLIC_BEQUICK_TOKEN=<token>
//   NEXT_PUBLIC_BEQUICK_API_KEY=<same token>
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ---------- Types ----------
interface PlanDetails {
  current_plans?: { id: string | number; name: string }[];
  service_period?: { end_at?: string };
  usage_summary?: {
    data?: UsageBlock;
    international_data?: UsageBlock;
  };
}
interface UsageBlock {
  total?: string | number;
  used?: string | number;
  remaining?: string | number;
}
interface Device {
  id: string | number;
  label: string;
  note: string;
  status: string;
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
interface BqLine {
  id: string | number;
  manufacturer?: string;
  model?: string;
  device_name?: string;
  imei?: string;
  mdn?: string;
  status?: string;
  primary?: boolean | string | number;
  is_esim?: boolean | string | number;
  sim_type?: string;
}
interface RawOrderEntry {
  order_db_id?: number;
  bequick_order_id?: string | number;
  subscriber_id?: string | number;
  total?: string | number;
  created_at?: string;
  cart?: { name?: string; plan_name?: string; title?: string; product_name?: string }[];
}
interface ByUserResponse {
  status?: boolean;
  logged_user?: string;
  groups?: Record<string, Record<string, RawOrderEntry[]>>;
}

// ---------- Helpers ----------
function kbToGb(kb: number): number {
  return kb / 1024 / 1024;
}
function formatDateAndRemaining(endAt?: string): { formatted: string; remainingDays: number | "N/A" } {
  if (!endAt) return { formatted: "N/A", remainingDays: "N/A" };
  const endDate = new Date(endAt);
  const diffTime = endDate.getTime() - Date.now();
  const remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const formatted = endDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return { formatted, remainingDays };
}
function isEsim(line: BqLine): boolean {
  return (
    line.is_esim === true || line.is_esim === "true" || line.is_esim === 1 || line.is_esim === "1" ||
    (typeof line.sim_type === "string" && line.sim_type.toLowerCase() === "esim")
  );
}
function isPrimary(line: BqLine): boolean {
  return line.primary === true || line.primary === "true" || line.primary === 1 || line.primary === "1";
}
function deviceLabel(line: BqLine): string {
  if (line.manufacturer && line.model) return `${line.manufacturer} ${line.model}`;
  if (line.device_name) return line.device_name;
  if (line.imei) return `Device (${String(line.imei).slice(-4)})`;
  if (line.mdn) return `Device ${String(line.mdn).slice(-4)}`;
  return `Device #${line.id}`;
}
function niceStatus(status?: string): string {
  switch ((status || "").toLowerCase()) {
    case "active": return "Active";
    case "inactive": case "paused": case "suspended": return "Paused";
    case "cancelled": case "terminated": return "Inactive";
    case "draft": case "pending": return "Pending";
    default: return "Unknown";
  }
}
function describeCart(cart?: RawOrderEntry["cart"]): string {
  if (!cart || cart.length === 0) return "Plan Purchase";
  const names = cart.map((c) => c.name || c.plan_name || c.title || c.product_name).filter(Boolean) as string[];
  return names.length ? names.join(", ") : `${cart.length} item(s)`;
}

// ---------- Component ----------
export default function MyAccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Customer");
  const [accountEmail, setAccountEmail] = useState("");

  const [subscriberId, setSubscriberId] = useState<string | number | null>(null);
  const [primaryLineId, setPrimaryLineId] = useState<string | number | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [currentBill, setCurrentBill] = useState<{ total?: number; closed_at?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("zoiko_token");
        if (!token) {
          router.push("/login");
          return;
        }
        const userData = JSON.parse(localStorage.getItem("zoiko_user") || "{}");
        const email: string = userData?.email || "";
        setUserName(
          [userData?.first_name, userData?.last_name].filter(Boolean).join(" ").trim() ||
            userData?.username || "Customer"
        );
        setAccountEmail(email);

        // 1) Get this user's orders from OUR backend, and read the subscriber_id off them.
        let foundSubscriberId: string | number | null = null;
        try {
          const res = await fetch(`${API_BASE}/api/v1/bqorders/by-user/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ logged_user: email }),
          });
          const data: ByUserResponse = await res.json();
          const userGroups = data.groups?.[email] || {};
          const flatOrders: Order[] = [];
          for (const [orderId, entries] of Object.entries(userGroups)) {
            const entry = entries?.[0];
            if (!entry) continue;
            if (!foundSubscriberId && entry.subscriber_id) foundSubscriberId = entry.subscriber_id;
            flatOrders.push({
              id: entry.order_db_id ?? orderId,
              order_id: entry.bequick_order_id ?? orderId,
              created_at: entry.created_at,
              date: entry.created_at,
              amount: entry.total ?? 0,
              description: describeCart(entry.cart),
            });
          }
          setOrders(flatOrders);
          setSubscriberId(foundSubscriberId);
        } catch {
          // No orders / backend issue — user simply has no subscriber yet.
        }

        // 2) With a subscriber_id, pull LIVE data straight from BeQuick (same as DriverX).
        if (foundSubscriberId) {
          try {
            const lines = (await beQuick.getUserLines(foundSubscriberId)) as BqLine[];
            const mapped: Device[] = (lines || []).map((line) => ({
              id: line.id,
              label: deviceLabel(line),
              note: `${isEsim(line) ? "eSIM" : "pSIM"} • ${isPrimary(line) ? "Primary Line" : "Secondary Line"}`,
              status: niceStatus(line.status),
            }));
            setDevices(mapped);

            const primary = (lines || []).find(isPrimary) || (lines || [])[0];
            const pLineId = primary?.id ?? null;
            setPrimaryLineId(pLineId);

            if (pLineId) {
              try {
                setPlanDetails((await beQuick.getPlanDetails(pLineId, true)) as PlanDetails);
              } catch { /* keep N/A */ }
            }
          } catch { /* no lines */ }

          try {
            setCurrentBill((await beQuick.getCurrentBill(foundSubscriberId)) as { total?: number; closed_at?: string } | null);
          } catch { /* ignore */ }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Derived ----------
  const billTotal = currentBill?.total || 0;
  const nextPayment = currentBill?.closed_at
    ? new Date(currentBill.closed_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "-";

  const dom = planDetails?.usage_summary?.data || {};
  const domTotal = dom.total ? kbToGb(Number(dom.total)) : 0;
  const domUsed = dom.used ? kbToGb(Number(dom.used)) : 0;
  const domRemaining = dom.remaining !== undefined ? kbToGb(Number(dom.remaining)) : domTotal - domUsed;
  const domPct = domTotal > 0 ? Math.round((domUsed / domTotal) * 100) : 0;

  const intl = planDetails?.usage_summary?.international_data || {};
  const intlTotal = intl.total ? kbToGb(Number(intl.total)) : 0;
  const intlUsed = intl.used ? kbToGb(Number(intl.used)) : 0;
  const intlRemaining = intl.remaining !== undefined ? kbToGb(Number(intl.remaining)) : intlTotal - intlUsed;
  const intlPct = intlTotal > 0 ? Math.round((intlUsed / intlTotal) * 100) : 0;

  const { formatted: activeUntil, remainingDays } = formatDateAndRemaining(planDetails?.service_period?.end_at);
  const hasPlan = !!planDetails?.current_plans?.[0];

  // ---------- Render ----------
  return (
    <div className="flex flex-col min-h-screen">
      <main className="grow dark:bg-gray-900 dark:text-white bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          {!loading && (
            <>
              <div className="bg-green-100 border border-green-400 text-green-800 text-center px-4 py-3 rounded mb-6 font-bold">
                👋 Welcome, {userName}!
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

                {/* Plans & Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">My Plans &amp; Usage</h6>
                  <p className="text-gray-500 text-sm mb-4">See active plans, data use and renewal options</p>

                  {hasPlan ? (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
                        <h6 className="font-bold mb-1">{planDetails!.current_plans![0].name}</h6>
                        <small className="text-green-600">Active until: {activeUntil}</small>
                      </div>

                      <h6 className="text-sm font-semibold mb-1">Domestic Data</h6>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{domUsed.toFixed(2)} GB Used</span>
                        <span>{domRemaining.toFixed(2)} GB Remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${domPct}%` }} />
                      </div>
                      <small className="text-gray-400 block mb-3">
                        {domPct}% used {remainingDays !== "N/A" && `• Renews in ${remainingDays} days`}
                      </small>

                      <h6 className="text-sm font-semibold mb-1">Roaming Data</h6>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{intlUsed.toFixed(2)} GB Used</span>
                        <span>{intlRemaining.toFixed(2)} GB Remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${intlPct}%` }} />
                      </div>
                      <small className="text-gray-400 block mb-4">
                        {intlPct}% used {remainingDays !== "N/A" && `• Renews in ${remainingDays} days`}
                      </small>

                      <div className="flex gap-2 mt-auto">
                        <Link className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          href={`/dashboard/plan-usages/${primaryLineId}`}>View details</Link>
                        <Link className="px-3 py-1.5 bg-yellow-400 text-white text-sm rounded-md hover:bg-yellow-500 transition-colors"
                          href="/plans">Upgrade Plan</Link>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-start gap-3 mt-2">
                      <p className="text-sm text-gray-500">No active plan yet.</p>
                      <Link className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        href="/plans">Browse Plans</Link>
                    </div>
                  )}
                </div>

                {/* Devices & SIMs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">My Devices &amp; SIMs</h6>
                  <p className="text-gray-500 text-sm mb-4">Activate, pause, or switch your pSIM/eSIM</p>

                  {devices.length > 0 ? (
                    <>
                      {devices.slice(0, 4).map((d) => (
                        <div key={d.id} className="flex justify-between items-center border-b pb-3 mb-3">
                          <div>
                            <strong>{d.label}</strong>
                            <p className="text-gray-400 text-xs mb-0">{d.note}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            d.status === "Active" ? "bg-green-600 text-white" :
                            d.status === "Pending" ? "bg-yellow-400 text-gray-800" :
                            "bg-gray-400 text-white"
                          }`}>{d.status}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-auto pt-2">
                        {subscriberId && (
                          <Link href={`/dashboard/my-devices-sims/${subscriberId}`}>
                            <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                              Manage SIMs
                            </button>
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-start gap-3 mt-2">
                      <p className="text-sm text-gray-500">No active SIMs yet.</p>
                      <Link className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        href="/activate-your-sim">Activate Your SIM</Link>
                    </div>
                  )}
                </div>

                {/* Billing & Payment */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">Billing &amp; Payment</h6>
                  <p className="text-gray-500 text-sm mb-4">Update payment method or view invoices</p>

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h5 className="font-bold mb-0">${Number(billTotal).toFixed(2)}</h5>
                      <small className="text-gray-400">Current Bill</small>
                    </div>
                    <div>
                      <h6 className="font-bold mb-0">{nextPayment}</h6>
                      <small className="text-gray-400">Next Payment</small>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto pt-2">
                    {subscriberId && (
                      <Link href={`/dashboard/billing-payment/${subscriberId}`}>
                        <button className="px-3 py-1.5 border border-green-600 text-green-600 text-sm rounded-md hover:bg-green-50 transition-colors">
                          View Billing
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Account Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">Account Settings</h6>
                  <p className="text-gray-500 text-sm mb-4">Manage password, contact info, and security</p>
                  <p className="text-sm font-semibold mb-1">Contact Info</p>
                  <p className="text-gray-400 text-sm mb-4">{accountEmail || "—"}</p>
                  <div className="flex gap-2 mt-auto">
                    <Link href="/dashboard/edit-profile"
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                      Edit Profile
                    </Link>
                    <Link href="/dashboard/security"
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                      Security
                    </Link>
                  </div>
                </div>

                {/* Order History */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                  <h6 className="font-semibold text-base mb-1">Order History</h6>
                  <p className="text-gray-500 text-sm mb-4">Track previous orders</p>
                  {orders.length > 0 ? (
                    orders.slice(0, 3).map((o, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">{o.date || o.created_at || ""}</p>
                        <p>
                          <strong>Order {o.id || o.order_id} - {o.description}</strong>{" "}
                          <span className="text-gray-400">${Number(o.amount || o.total || 0).toFixed(2)}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">No orders yet.</p>
                  )}
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
                  <p className="text-gray-500 text-sm mb-4">Instant access to help with your account</p>
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded text-sm mb-4">
                    Need help? Our support team is available 24/7
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link href="/dashboard/support">
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
    </div>
  );
}