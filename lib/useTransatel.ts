"use client";
// Client-side helpers that call YOUR OWN Next.js API routes (never Transatel directly).

export interface SimLookup {
  found: boolean;
  data?: unknown;
  error?: string;
}

// eSIM details (Endpoint 3)
export async function fetchEsim(serial: string, history = true): Promise<SimLookup> {
  const res = await fetch(`/api/transatel/esim/${serial}?history=${history}`);
  if (res.status === 404) return { found: false };
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    return { found: false, error: d.detail ?? "Lookup failed" };
  }
  return { found: true, data: await res.json() };
}

// Subscriber details (Endpoint 4) — the "is this SIM active?" check
export async function fetchSubscriber(serial: string): Promise<SimLookup> {
  const res = await fetch(`/api/transatel/subscriber/${serial}`);
  if (res.status === 404) return { found: false }; // not registered yet
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    return { found: false, error: d.detail ?? "Lookup failed" };
  }
  return { found: true, data: await res.json() };
}
