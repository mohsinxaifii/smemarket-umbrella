// Private file storage in D1 (no R2 needed). Files are split into ~1.5 MB parts, because one D1 value
// can hold at most 2 MB. Used for buyer ID documents and sellers' data-room documents.
import type { Env } from "./util";

const PART = 1_500_000;

export async function putFile(env: Env, key: string, buf: ArrayBuffer, type: string) {
  await env.DB.prepare("DELETE FROM files WHERE key = ?").bind(key).run();
  const t = Date.now();
  for (let i = 0, p = 0; i < buf.byteLength || p === 0; i += PART, p++) {
    await env.DB.prepare("INSERT INTO files (key, part, type, data, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(key, p, type, new Uint8Array(buf.slice(i, i + PART)), t)
      .run();
  }
}

export async function getFile(env: Env, key: string): Promise<{ body: ArrayBuffer; type: string } | null> {
  const { results } = await env.DB.prepare("SELECT type, data FROM files WHERE key = ? ORDER BY part").bind(key).all<{ type: string | null; data: ArrayBuffer | number[] }>();
  if (!results.length) return null;
  const parts = results.map((r) => (r.data instanceof ArrayBuffer ? new Uint8Array(r.data) : Uint8Array.from(r.data)));
  const body = new Uint8Array(new ArrayBuffer(parts.reduce((n, p) => n + p.length, 0)));
  let o = 0;
  for (const p of parts) (body.set(p, o), (o += p.length));
  return { body: body.buffer as ArrayBuffer, type: results[0].type || "application/octet-stream" };
}
