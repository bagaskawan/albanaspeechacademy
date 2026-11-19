import "server-only";

const RETRY_DELAYS_MS = [250, 600];

function isTransientStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function academyRequest(path: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Koneksi akademi belum tersedia.");

  const target = new URL(`/rest/v1/${path}`, url);
  const isRead = body === undefined;
  const maxAttempts = isRead ? RETRY_DELAYS_MS.length + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(target, {
        method: body ? "POST" : "GET",
        headers: { apikey: key, "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });

      if (response.ok) return response.json();
      if (!isRead || !isTransientStatus(response.status) || attempt === maxAttempts - 1) {
        throw new Error("Database akademi tidak tersedia.");
      }
    } catch (error) {
      if (!isRead || attempt === maxAttempts - 1) {
        throw error instanceof Error ? error : new Error("Database akademi tidak tersedia.");
      }
    }

    await wait(RETRY_DELAYS_MS[attempt] ?? 500);
  }

  throw new Error("Database akademi tidak tersedia.");
}
