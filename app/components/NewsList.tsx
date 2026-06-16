"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const ARTICLE_PREFIX = "/news";
const REQUEST_TIMEOUT = 10000;

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ArticleCard = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  featured_image: string | null;
  location: string;
  dateline_source: string;
  published_at: string | null;
};

type ListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArticleCard[];
};

type ErrorKind = null | "network" | "server";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, ms = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function NewsList() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);

  const load = useCallback(async (url: string, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        setError("server");
        return;
      }
      const data: ListResponse = await res.json();
      setArticles((prev) => (append ? [...prev, ...(data.results ?? [])] : data.results ?? []));
      setNextUrl(data.next);
    } catch {
      setError("network"); // abort/timeout or connection failure
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(`${API_BASE}/api/news/`, false);
  }, [load]);

  return (
    <main className="bg-gray-50 font-sans dark:bg-gray-900">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-r from-[#17a06a] to-[#0e8f74] px-4 py-20 text-center text-white sm:px-6">
        <h1 className="font-extrabold text-[clamp(2rem,6vw,3.5rem)]">Zoiko&rsquo;s Latest Tech Tea</h1>
        <p className="mt-3 text-lg text-white/90">On the Digital Pulse!</p>
      </section>

      {/* ─── Cards ─── */}
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-8">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm sm:p-8 dark:bg-gray-800">
                <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 h-7 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-6 h-11 w-full rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
            <p className="text-gray-700 dark:text-gray-200">
              {error === "network"
                ? "We couldn’t reach the server. Check your connection and try again."
                : "Something went wrong loading the news. Please try again."}
            </p>
            <button
              onClick={() => load(`${API_BASE}/api/news/`, false)}
              className="mt-5 rounded-md bg-[#0e8f74] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0b7460]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && articles.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-300">No news yet — check back soon.</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && articles.length > 0 && (
          <>
            <div className="space-y-8">
              {articles.map((a) => (
                <article key={a.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
                  <span className="inline-block rounded-md bg-gray-800 px-3 py-1 text-xs font-bold tracking-wide text-white dark:bg-gray-700">
                    {a.category}
                  </span>
                  <h2 className="mt-4 text-2xl font-extrabold leading-snug text-gray-800 dark:text-white">{a.title}</h2>
                  {a.published_at && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(a.published_at)}</p>}
                  {a.excerpt && <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{a.excerpt}</p>}
                  <Link
                    href={`${ARTICLE_PREFIX}/${a.slug}`}
                    className="mt-6 block w-full rounded-md bg-[#e6007e] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#c70069]"
                  >
                    Read More
                  </Link>
                </article>
              ))}
            </div>

            {/* Load more */}
            {nextUrl && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => load(nextUrl, true)}
                  disabled={loadingMore}
                  className="rounded-md border border-[#0e8f74] px-7 py-2.5 text-sm font-semibold text-[#0e8f74] transition-colors hover:bg-[#0e8f74] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#34d39e] dark:hover:text-white"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// Exported both ways so either default or named import works.
export default NewsList;
export { NewsList };
