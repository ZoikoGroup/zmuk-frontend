"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// .env.local -> NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ---------- Types ----------
interface Order {
  id?: string | number;
  order_id?: string | number;
  date?: string;
  created_at?: string;
  description?: string;
  amount?: string | number;
  total?: string | number;
  status?: string;
}

// Shape returned by /api/v1/bqorders/by-user/  (matches MyAccount.tsx)
interface RawOrderEntry {
  order_db_id?: number;
  bequick_order_id?: string | number;
  subscriber_id?: string | number;
  total?: string | number;
  created_at?: string;
  payment_method?: string;
  cart?: { name?: string; plan_name?: string; title?: string; product_name?: string }[];
}
interface ByUserResponse {
  status?: boolean;
  logged_user?: string;
  groups?: Record<string, Record<string, RawOrderEntry[]>>;
}

// Turn a cart into a readable description
function describeCart(cart?: RawOrderEntry["cart"]): string {
  if (!cart || cart.length === 0) return "Plan Purchase";
  const names = cart.map((c) => c.name || c.plan_name || c.title || c.product_name).filter(Boolean) as string[];
  return names.length ? names.join(", ") : `${cart.length} item(s)`;
}

// ---------- Component ----------
export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // ---------- Fetch Orders from OUR backend (same source as the dashboard card) ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("zoiko_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(localStorage.getItem("zoiko_user") || "{}");
        const email: string = userData?.email || "";
        if (!email) {
          setError("We couldn't find your account email. Please sign in again.");
          return;
        }

        const res = await fetch(`${API_BASE}/api/v1/bqorders/by-user/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ logged_user: email }),
        });

        if (!res.ok) throw new Error("Failed to load orders");

        const data: ByUserResponse = await res.json();
        const userGroups = data.groups?.[email] || {};

        const flat: Order[] = [];
        for (const [orderId, entries] of Object.entries(userGroups)) {
          const entry = entries?.[0];
          if (!entry) continue;
          flat.push({
            id: entry.order_db_id ?? orderId,
            order_id: entry.bequick_order_id ?? orderId,
            created_at: entry.created_at,
            date: entry.created_at,
            amount: entry.total ?? 0,
            description: describeCart(entry.cart),
            status: "completed",
          });
        }
        setOrders(flat);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // ---------- Filter + Search ----------
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.id || order.order_id || "").toString().includes(search) ||
        (order.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (order.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // ---------- Pagination ----------
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ---------- Render ----------
  return (
    <div className="flex flex-col min-h-screen">
      <main className="grow dark:bg-gray-900 dark:text-white bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Title */}
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold mb-0">All Orders</h4>
            <span className="text-gray-400 text-sm">
              Total: {filteredOrders.length} orders
            </span>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="🔍 Search orders..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="md:max-w-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

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

          {/* Empty */}
          {!loading && !error && filteredOrders.length === 0 && (
            <div className="text-center py-10">
              <h5 className="font-semibold">No Orders Found</h5>
              <p className="text-gray-400">Your orders will appear here once you complete a purchase.</p>
            </div>
          )}

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOrders.map((order, i) => {
              const status = (order.status || "").toLowerCase();
              const badgeClass =
                status === "completed" ? "bg-green-600 text-white" :
                status === "processing" ? "bg-sky-400 text-gray-800" :
                status === "pending" ? "bg-yellow-400 text-gray-800" :
                status === "failed" ? "bg-red-600 text-white" :
                "bg-gray-400 text-white";

              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex flex-col" key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <h6 className="font-bold mb-0">
                      Order #{order.id || order.order_id}
                    </h6>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                      {status || "unknown"}
                    </span>
                  </div>

                  <small className="text-gray-400 mb-2 block">
                    {order.date || order.created_at || "-"}
                  </small>

                  <p className="text-gray-500 grow mb-3">
                    {order.description || "Plan Purchase"}
                  </p>

                  <h5 className="text-green-600 font-bold mb-0">
                    £{Number(order.amount || order.total || 0).toFixed(2)}
                  </h5>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap">
              <button
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200 dark:border-gray-600"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200 dark:border-gray-600"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}