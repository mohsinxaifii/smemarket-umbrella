"use client";
import { useCallback, useEffect, useState } from "react";

/** Talks to the marketplace API (functions/api). Adds the anti-forgery header the server requires. */
export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const method = opts.method ?? (opts.body || opts.form ? "POST" : "GET");
  const res = await fetch(`/api/${path}`, {
    method,
    credentials: "same-origin",
    headers: { "x-sm": "1", ...(opts.body ? { "content-type": "application/json" } : {}) },
    body: opts.form ?? (opts.body ? JSON.stringify(opts.body) : undefined),
  });
  const data = await res.json().catch(() => ({ error: "We couldn't reach the server. Please try again." }));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error || "Something went wrong.");
  return data as T;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type Me = { id: string; name: string; email: string; phone: string | null; role: "user" | "admin" } | null;
export type Nda = { full_name: string; id_status: "pending" | "approved" | "rejected"; signed_at: number } | null;

let cache: { user: Me; nda: Nda } | null = null;
const listeners = new Set<() => void>();
export function refreshMe() {
  cache = null;
  listeners.forEach((l) => l());
}

/** The signed-in user (null when signed out), shared across the page. */
export function useMe() {
  const [state, setState] = useState<{ user: Me; nda: Nda; loading: boolean }>({ user: cache?.user ?? null, nda: cache?.nda ?? null, loading: !cache });
  const load = useCallback(() => {
    api<{ user: Me; nda: Nda }>("me")
      .then((d) => {
        cache = { user: d.user, nda: d.nda ?? null };
        setState({ ...cache, loading: false });
      })
      .catch(() => setState({ user: null, nda: null, loading: false }));
  }, []);
  useEffect(() => {
    if (!cache) load();
    listeners.add(load);
    return () => {
      listeners.delete(load);
    };
  }, [load]);
  return state;
}

export const aed = (n: number | null | undefined) => (n == null ? "—" : `AED ${n.toLocaleString("en-US")}`);
export const short = (n: number | null | undefined) => (n == null ? "—" : n >= 1e6 ? `${+(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
export const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
