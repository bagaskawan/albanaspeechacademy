import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isEmailUnconfirmed, type AdminCredentials } from "../admin-login";

const ADMIN_ACCESS_COOKIE = "asa-admin-access-token";

type AuthUser = { id: string; email?: string | null };
type AuthSession = { access_token: string; expires_in: number; user: AuthUser };

type LoginResult =
  | { status: "success"; session: AuthSession }
  | { status: "invalid" }
  | { status: "unconfirmed" }
  | { status: "error" };

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const adminUsername = process.env.SUPABASE_ADMIN_USERNAME?.trim().toLowerCase();
  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL?.trim().toLowerCase();
  if (!url || !key || !adminUsername || !adminEmail) throw new Error("Supabase auth belum dikonfigurasi.");
  return { url: url.replace(/\/$/, ""), key, adminUsername, adminEmail };
}

function resolveAdminEmail(identifier: string, adminUsername: string, adminEmail: string) {
  return identifier.includes("@") ? identifier : identifier === adminUsername ? adminEmail : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readSession(value: unknown): AuthSession | null {
  if (!isRecord(value) || typeof value.access_token !== "string" || typeof value.expires_in !== "number") return null;
  const user = isRecord(value.user) && typeof value.user.id === "string"
    ? { id: value.user.id, email: typeof value.user.email === "string" ? value.user.email : null }
    : null;
  return user ? { access_token: value.access_token, expires_in: value.expires_in, user } : null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function isAllowlisted(url: string, key: string, accessToken: string, userId: string) {
  const response = await fetch(`${url}/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(userId)}`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const rows = await readJson(response);
  return Array.isArray(rows) && rows.length > 0;
}

export async function signInAdmin(credentials: AdminCredentials): Promise<LoginResult> {
  const { url, key, adminUsername, adminEmail } = config();
  const email = resolveAdminEmail(credentials.identifier, adminUsername, adminEmail);
  if (!email) return { status: "invalid" };
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: credentials.password }),
    cache: "no-store",
  });
  if (response.status === 400 || response.status === 401) {
    return { status: isEmailUnconfirmed(await readJson(response)) ? "unconfirmed" : "invalid" };
  }
  if (!response.ok) return { status: "error" };

  const session = readSession(await readJson(response));
  if (!session) return { status: "error" };
  return (await isAllowlisted(url, key, session.access_token, session.user.id))
    ? { status: "success", session }
    : { status: "invalid" };
}

async function readUser(accessToken: string): Promise<AuthUser | null> {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const value = await readJson(response);
  return isRecord(value) && typeof value.id === "string"
    ? { id: value.id, email: typeof value.email === "string" ? value.email : null }
    : null;
}

export async function requireAdmin(): Promise<AuthUser> {
  return (await requireAdminAccess()).user;
}

export async function requireAdminAccess(): Promise<{ user: AuthUser; accessToken: string }> {
  const accessToken = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/login");

  const user = await readUser(accessToken);
  if (!user) redirect("/login");
  const { url, key } = config();
  if (!(await isAllowlisted(url, key, accessToken, user.id))) redirect("/login");
  return { user, accessToken };
}

export function adminAccessCookieName() {
  return ADMIN_ACCESS_COOKIE;
}
