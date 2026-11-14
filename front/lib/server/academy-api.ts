import "server-only";

export async function academyRequest(path: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Koneksi akademi belum tersedia.");
  const response = await fetch(new URL(`/rest/v1/${path}`, url), {
    method: body ? "POST" : "GET",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Database akademi tidak tersedia.");
  return response.json();
}
