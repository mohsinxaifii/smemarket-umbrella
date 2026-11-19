"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowUp, Loader2 } from "lucide-react";
import { api, ago, useMe } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { APP } from "@/lib/site";
import AppPage, { Empty, Notice } from "./AppPage";
import SignInGate from "./SignInGate";

type Thread = { id: string; listing_id: string; title: string; last_at: number; i_am_seller: number; last_body: string | null };
type Msg = { id: string; body: string; created_at: number; mine: number; sender_role: string; from_buyer: number; pending?: boolean; failed?: boolean };
type Open = { thread: { id: string; listing_id: string; title: string; i_am_seller: boolean; buyer_name?: string }; messages: Msg[] };

/** Private buyer–seller conversations. Everything stays on SMEmarket, on record. */
export default function Messages() {
  const { user, loading } = useMe();
  const tid = useSearchParams().get("t");
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(() => {
    api<{ threads: Thread[] }>("threads")
      .then((d) => setThreads(d.threads))
      .catch((e) => setErr(e.message));
  }, []);
  const loadOpen = useCallback(() => {
    if (!tid) return setOpen(null);
    api<Open>(`threads/${encodeURIComponent(tid)}`)
      .then(setOpen)
      .catch((e) => setErr(e.message));
  }, [tid]);

  useEffect(() => {
    if (user) loadThreads();
  }, [user, loadThreads]);
  useEffect(() => {
    if (user) loadOpen();
  }, [user, loadOpen]);
  // check for replies every 15s while a conversation is open
  useEffect(() => {
    if (!user || !tid) return;
    const t = setInterval(loadOpen, 15000);
    return () => clearInterval(t);
  }, [user, tid, loadOpen]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [open?.messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !tid) return;
    // show it straight away; the server copy replaces it when it lands
    const temp: Msg = { id: `temp-${Date.now()}`, body, created_at: Date.now(), mine: 1, sender_role: "user", from_buyer: 0, pending: true };
    setOpen((o) => (o ? { ...o, messages: [...o.messages, temp] } : o));
    setText("");
    setSending(true);
    try {
      await api(`threads/${tid}`, { body: { body } });
      loadOpen();
      loadThreads();
    } catch (x) {
      setOpen((o) => (o ? { ...o, messages: o.messages.map((m) => (m.id === temp.id ? { ...m, pending: false, failed: true } : m)) } : o));
      setText(body);
      toast((x as Error).message, "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <AppPage title="Messages"><Loader2 className="size-6 animate-spin text-muted" /></AppPage>;
  if (!user) return <AppPage title="Messages"><SignInGate /></AppPage>;

  const who = (m: Msg) => (m.mine ? "You" : m.sender_role === "admin" && !m.from_buyer ? "SMEmarket" : m.from_buyer ? open?.thread.buyer_name || "Buyer" : "Seller");

  return (
    <AppPage eyebrow="Messages" title="Your conversations." intro="Private threads between buyers and sellers. Every message stays on SMEmarket, on record.">
      {err && <Notice tone="error">{err}</Notice>}
      <div className="mt-2 grid min-h-[60vh] overflow-hidden rounded-[28px] bg-card ring-1 ring-rule md:grid-cols-[340px_1fr]">
        {/* list */}
        <div className={clsx("border-rule md:border-r", tid && "hidden md:block")}>
          {!threads ? (
            <div className="p-6">
              <Loader2 className="size-5 animate-spin text-muted" />
            </div>
          ) : !threads.length ? (
            <div className="p-6">
              <Empty title="No conversations yet.">
                Open a business and press <span className="font-semibold">Ask the seller</span>.
              </Empty>
            </div>
          ) : (
            <ul>
              {threads.map((t) => (
                <li key={t.id}>
                  <button onClick={() => router.push(`${APP.messages}?t=${t.id}`)} className={clsx("block w-full border-b border-rule px-5 py-4 text-left transition hover:bg-paper", t.id === tid && "bg-paper-2")}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[16px] font-semibold">{t.title}</span>
                      <span className="shrink-0 text-[12px] text-muted">{ago(t.last_at)}</span>
                    </span>
                    <span className="mt-0.5 block text-[12px] font-semibold text-muted">{t.i_am_seller ? "A buyer is asking" : "You asked the seller"}</span>
                    <span className="mt-1 block truncate text-[14px] text-ink-2">{t.last_body || "No messages yet"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* conversation */}
        <div className={clsx("flex flex-col", !tid && "hidden md:flex")}>
          {!tid ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-muted">Choose a conversation.</div>
          ) : !open ? (
            <div className="grid flex-1 place-items-center">
              <Loader2 className="size-5 animate-spin text-muted" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-rule px-5 py-4">
                <button onClick={() => router.push(APP.messages)} className="md:hidden" aria-label="Back to conversations">
                  <ArrowLeft className="size-5" />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-semibold">{open.thread.title}</span>
                  <span className="block text-[13px] text-muted">{open.thread.i_am_seller ? `With ${open.thread.buyer_name || "a buyer"}` : "With the seller"}</span>
                </span>
                <Link href={APP.listing(open.thread.listing_id)} className="shrink-0 rounded-[10px] border border-ink/30 px-3 py-2 text-[14px] font-semibold">
                  View listing
                </Link>
              </div>
              <div className="flex max-h-[60vh] min-h-[320px] flex-1 flex-col gap-3 overflow-y-auto p-5" data-lenis-prevent>
                {!open.messages.length && <p className="m-auto text-[15px] text-muted">Say hello. Ask about the figures, the lease or a visit.</p>}
                {open.messages.map((m) => (
                  <div key={m.id} className={clsx("flex max-w-[80%] animate-[pageIn_.35s_cubic-bezier(.16,1,.3,1)_both] flex-col", m.mine ? "self-end items-end" : "self-start")}>
                    <span className={clsx("mb-1 text-[12px] font-semibold", m.failed ? "text-stamp" : "text-muted")}>
                      {who(m)} · {m.failed ? "Not sent" : m.pending ? "Sending…" : ago(m.created_at)}
                    </span>
                    <p className={clsx("whitespace-pre-line rounded-2xl px-4 py-2.5 text-[16px] leading-relaxed transition-opacity", m.mine ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md bg-paper-2", (m.pending || m.failed) && "opacity-60")}>{m.body}</p>
                  </div>
                ))}
                <div ref={end} />
              </div>
              <form onSubmit={send} className="flex items-end gap-2 border-t border-rule p-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      (e.currentTarget.form as HTMLFormElement).requestSubmit();
                    }
                  }}
                  rows={1}
                  placeholder="Write a message…"
                  className="field min-h-12 resize-none"
                />
                <button type="submit" disabled={sending || !text.trim()} aria-label="Send" className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-lime disabled:opacity-40">
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-5" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppPage>
  );
}
