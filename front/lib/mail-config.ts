export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo: string | null;
  siteUrl: string;
};

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

function parsePort(raw: string): number | null {
  if (!raw) return 465;
  if (!/^\d+$/.test(raw)) return null;
  const port = Number(raw);
  return Number.isSafeInteger(port) && port >= 1 && port <= 65535 ? port : null;
}

function resolveSiteUrl(env: Record<string, string | undefined>): string | null {
  const isProd = clean(env.NODE_ENV) === "production";
  const raw =
    clean(env.SITE_URL) ||
    clean(env.NEXT_PUBLIC_SITE_URL) ||
    clean(env.NEXT_PUBLIC_APP_URL) ||
    (isProd ? "" : "http://localhost:3000");
  if (!raw) return null;
  const normalized = raw.replace(/\/+$/, "");
  if (isProd && !normalized.startsWith("https://")) return null;
  return normalized;
}

export function readMailConfig(env: Record<string, string | undefined>): MailConfig | null {
  const user = clean(env.SMTP_USER);
  const pass = clean(env.SMTP_PASS);
  if (!user || !pass) return null;

  const port = parsePort(clean(env.SMTP_PORT));
  if (port === null) return null;

  const siteUrl = resolveSiteUrl(env);
  if (!siteUrl) return null;

  const host = clean(env.SMTP_HOST) || "smtp.gmail.com";
  const secure = clean(env.SMTP_SECURE) !== "false";
  const replyTo = clean(env.EMAIL_REPLY_TO) || null;
  // SMTP relays like Resend/Brevo log in with a non-email user, so the sender address is separate.
  const fromAddress = clean(env.SMTP_FROM) || user;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from: `"Albana Speech Academy" <${fromAddress}>`,
    replyTo,
    siteUrl,
  };
}
