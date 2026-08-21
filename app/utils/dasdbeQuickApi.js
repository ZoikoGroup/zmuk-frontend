"use client";

const BASE = process.env.NEXT_PUBLIC_BEQUICK_BASE_URL || "https://zoiko-atom-api.bequickapps.com";
const TOKEN = process.env.NEXT_PUBLIC_BEQUICK_TOKEN || "";

// --- Basic Request ---
async function request(path, { method = "GET", body = null, rawBody = false } = {}) {
  const url = BASE.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
  const headers = { Accept: "application/json", "X-AUTH-TOKEN": TOKEN };
  if (!rawBody && ["POST", "PUT", "PATCH"].includes(method)) headers["Content-Type"] = "application/json";

  const opts = { method, headers };
  if (body != null) opts.body = rawBody ? body : JSON.stringify(body);

  const res = await fetch(url, opts);
  const txt = await res.text();
  try {
    if (!txt) return { status: res.status, data: null };
    return { status: res.status, data: JSON.parse(txt) };
  } catch {
    return { status: res.status, data: txt };
  }
}

// --- Basic API Functions ---
export async function getSubscriberDetails(subscriberId) {
  const { data } = await request(`/subscribers/${subscriberId}`);
  return data;
}

export async function getAllPlans() {
  const { data } = await request("/products");
  return data;
}

export async function getPlanDetails(lineId, withDetails = false) {
  let path = `/lines/${lineId}`;
  if (withDetails) path += "/query_service_details";
  const { data } = await request(path);
  return data;
}

export async function getLineBuckets(lineId) {
  const { data } = await request(`/lines/${lineId}/service_balances`);
  return data;
}

export async function getPaymentMethods(subscriberId) {
  const { data } = await request(`/payment_methods?by_subscriber_id=${subscriberId}`);
  return data;
}

export async function getOrders(subscriberId) {
  const { data } = await request(`/orders?by_subscriber_id=${subscriberId}`);
  return data;
}

// --- Get subscriber by email ---
export async function getSubscriberByEmail(email) {
  const { data: result } = await request(
    `/subscribers?filter_by[0][value]=${encodeURIComponent(email)}&filter_by[0][column]=email`
  );

  const id =
    result?.subscribers?.[0]?.id ||
    result?.subscriber?.subscribers?.[0]?.id;
  return id ? { subscriber_id: id } : false;
}

// --- Cache Utilities ---
function getCache(key) {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { data, expires } = JSON.parse(cached);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data, durationMinutes = 30) {
  if (typeof window === "undefined") return;
  const expires = Date.now() + durationMinutes * 60 * 1000;
  localStorage.setItem(key, JSON.stringify({ data, expires }));
}

function getLineCacheKey(lineId, subscriberId = "1") {
  return `line_details_${subscriberId}_${lineId}`;
}

// --- Device Helpers ---
function determineSimType(line) {
  const isEsim =
    line.is_esim === true ||
    line.is_esim === "true" ||
    line.is_esim === 1 ||
    line.is_esim === "1" ||
    (line.sim_type && line.sim_type.toLowerCase() === "esim");
  return isEsim ? "eSIM" : "pSIM";
}

function determineLineType(line, currentLineId = null) {
  const isPrimary = line.primary === true || line.primary === "true" || line.primary === 1 || line.primary === "1";
  if (line.id === currentLineId) return isPrimary ? "Primary Line (Selected)" : "Selected Line";
  return isPrimary ? "Primary Line" : "Secondary Line";
}

function determineStatus(status) {
  switch ((status || "").toLowerCase()) {
    case "active": return "Active";
    case "inactive": case "paused": case "suspended": return "Paused";
    case "cancelled": case "terminated": return "Inactive";
    case "draft": case "pending": return "Pending";
    default: return "Unknown";
  }
}

function getDeviceName(line, cached = null) {
  if (cached?.raw_data?.line) {
    const c = cached.raw_data.line;
    if (c.manufacturer && c.model) return `${c.manufacturer} ${c.model}`;
    if (c.device_name) return c.device_name;
  }
  if (line.manufacturer && line.model) return `${line.manufacturer} ${line.model}`;
  if (line.device_model_id) return `Device Model ${line.device_model_id}`;
  if (line.imei) return `Device (${line.imei.slice(-4)})`;
  if (line.mdn) return `Device ${line.mdn.slice(-4)}`;
  return `Device #${line.id || "Unknown"}`;
}

function getStatusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "active": return "status-active";
    case "paused": case "suspended": return "status-paused";
    case "inactive": case "cancelled": case "terminated": return "status-inactive";
    case "pending": case "draft": return "status-pending";
    default: return "status-unknown";
  }
}

// --- Fetch & Cache Single Line ---
export async function getSingleLineDetails(lineId, subscriberId = "1") {
  const key = getLineCacheKey(lineId, subscriberId);
  const cached = getCache(key);
  if (cached) return { lineDetails: cached, fromCache: true };
  try {
    const data = await getPlanDetails(lineId, true);
    if (data) setCache(key, data);
    return { lineDetails: data, fromCache: false };
  } catch (e) {
    console.error("Error fetching line details", e);
  }
  return { lineDetails: null, fromCache: false };
}

// --- Fetch all lines by subscriber ---
export async function getUserLines(subscriberId) {
  try {
    const { data } = await request(`/lines?by_subscriber_id=${subscriberId}&per=200`);
    if (!data?.lines) return [];
    return data.lines.filter((l) => !["cancelled", "error"].includes(l.status));
  } catch (e) {
    console.error("Error fetching lines", e);
    return [];
  }
}

// --- Refresh Devices Section ---
export async function refreshDevicesSection(subscriberId, currentLineId) {
  const lines = await getUserLines(subscriberId);
  if (!lines.length) return { html: "<p>No devices found.</p>" };

  const enhancedLines = await Promise.all(
    lines.map(async (line) => {
      const { lineDetails, fromCache } = await getSingleLineDetails(line.id, subscriberId);
      const enhancedStatus = determineStatus(lineDetails?.raw_data?.line?.status || line.status);
      return {
        ...line,
        cached_details: fromCache ? lineDetails : null,
        enhanced_status: enhancedStatus,
      };
    })
  );

  // Sort active first
  const active = enhancedLines.filter((l) => l.enhanced_status === "Active");
  const others = enhancedLines.filter((l) => l.enhanced_status !== "Active");
  const devicesToShow = [...active, ...others].slice(0, 4);

  const html = `
    <div class="device-list">
      ${devicesToShow
        .map((line) => {
          const deviceName = getDeviceName(line, line.cached_details);
          const simType = determineSimType(line);
          const lineType = determineLineType(line, currentLineId);
          const status = line.enhanced_status;
          const statusClass = getStatusClass(status);

          return `
            <div class="device-item" data-line-id="${line.id}">
              <div class="device-info">
                <h4>${deviceName}</h4>
                <p>${simType} • ${lineType}</p>
              </div>
              <span class="status-badge ${statusClass}">${status}</span>
            </div>
          `;
        })
        .join("")}
      ${enhancedLines.length > 2
        ? `<div class="device-item"><div class="device-info"><p style="color:#666;font-style:italic;">+${enhancedLines.length - 2} more device(s)</p></div></div>`
        : ""}
    </div>
  `;

  return { html, devices: enhancedLines };
}

// --- 🧾 Get Current Bill ---
export async function getCurrentBill(subscriberId) {
  try {
    const { data } = await request(`/billing_statements?by_subscriber_id=${subscriberId}`);
    const billingStatements = data?.billing_statements || [];

    if (!billingStatements.length) return null;

    const currentBill = billingStatements.find(
      (bill) =>
        bill?.status?.toLowerCase() === "current" ||
        bill?.state?.toLowerCase() === "open"
    );

    if (currentBill) return currentBill;

    // fallback to latest by id
    return billingStatements.reduce((prev, curr) =>
      curr.id > prev.id ? curr : prev
    );
  } catch (err) {
    console.error("Error fetching current bill:", err);
    return null;
  }
}

async function createDeviceLine(payload) {
  return await fetch("https://zoiko-atom-api.bequickapps.com/lines", {
    method: "POST",
    headers: {
      "X-AUTH-TOKEN": process.env.NEXT_PUBLIC_BEQUICK_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      line: payload,
    }),
  }).then((res) => res.json());
}

async function getSubscriberLines(subscriber_id) {
  const url = `https://zoiko-atom-api.bequickapps.com/lines?by_subscriber_id=${subscriber_id}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-AUTH-TOKEN": process.env.NEXT_PUBLIC_BEQUICK_API_KEY,
      "Content-Type": "application/json",
    },
  });

  // 1️⃣ If API returned error status, show readable error
  if (!res.ok) {
    const text = await res.text();
    console.error("Error fetching lines:", text);
    return { lines: [] };
  }

  // 2️⃣ FIX: Avoid JSON parsing crash
  const text = await res.text();

  if (!text || text.trim() === "") {
    console.warn("Empty lines response");
    return { lines: [] };
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Invalid JSON in lines response:", text);
    return { lines: [] };
  }
}



export default {
  request,
  getSubscriberDetails,
  getAllPlans,
  getPlanDetails,
  getLineBuckets,
  getPaymentMethods,
  getOrders,
  getSubscriberByEmail,
  getUserLines,
  getSingleLineDetails,
  refreshDevicesSection,
  getCurrentBill,
  createDeviceLine,
  getSubscriberLines,
};
