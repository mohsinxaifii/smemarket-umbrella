import { type Env, type User, fail, hashPassword, id, now, same, sha256 } from "./util";

const COOKIE = "sm_session";
const DAYS = 30;

function cookieValue(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
  }
  return "";
}

const isAdminEmail = (env: Env, email: string) =>
  (env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());

/** Creates a session and returns the Set-Cookie header value. */
export async function startSession(env: Env, userId: string, secure: boolean) {
  const token = id(32);
  const expires = now() + DAYS * 864e5;
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await sha256(token), userId, expires).run();
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DAYS * 86400}${secure ? "; Secure" : ""}`;
}

export async function endSession(env: Env, req: Request) {
  const token = cookieValue(req, COOKIE);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function currentUser(env: Env, req: Request): Promise<User | null> {
  const token = cookieValue(req, COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
  )
    .bind(await sha256(token))
    .first<User & { expires_at: number }>();
  if (!row || row.expires_at < now()) return null;
  const { expires_at: _e, ...user } = row;
  void _e;
  return user;
}

export async function requireUser(env: Env, req: Request) {
  return (await currentUser(env, req)) ?? fail(401, "Please log in first.");
}
export async function requireAdmin(env: Env, req: Request) {
  const u = await requireUser(env, req);
  if (u.role !== "admin") fail(403, "Admins only.");
  return u;
}

export async function signup(env: Env, input: { name: string; email: string; phone: string; password: string }) {
  const email = input.email.toLowerCase();
  const exists = await env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
  if (exists) fail(409, "There's already an account with that email. Log in instead.");
  const { hash, salt } = await hashPassword(input.password);
  const user: User = { id: id(), name: input.name, email, phone: input.phone || null, role: isAdminEmail(env, email) ? "admin" : "user", created_at: now() };
  await env.DB.prepare("INSERT INTO users (id, name, email, phone, pass_hash, pass_salt, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(user.id, user.name, user.email, user.phone, hash, salt, user.role, user.created_at)
    .run();
  return user;
}

export async function login(env: Env, emailRaw: string, password: string) {
  const email = emailRaw.toLowerCase();
  const row = await env.DB.prepare("SELECT id, pass_hash, pass_salt, role FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; pass_hash: string; pass_salt: string; role: string }>();
  // hash anyway when the user doesn't exist, so timing doesn't reveal which emails have accounts
  const { hash } = await hashPassword(password, row?.pass_salt ?? "0000000000000000");
  if (!row || !same(hash, row.pass_hash)) fail(401, "That email and password don't match.");
  if (row!.role !== "admin" && isAdminEmail(env, email)) await env.DB.prepare("UPDATE users SET role = 'admin' WHERE id = ?").bind(row!.id).run();
  return row!.id;
}
