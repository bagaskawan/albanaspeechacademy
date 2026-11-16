type AdminCredentialsInput = {
  identifier: unknown;
  password: unknown;
};

export type AdminCredentials = {
  identifier: string;
  password: string;
};

export function isEmailUnconfirmed(error: unknown): boolean {
  return error !== null && typeof error === "object" &&
    "error_code" in error && error.error_code === "email_not_confirmed";
}

export function parseAdminCredentials(input: unknown): AdminCredentials | null {
  if (!input || typeof input !== "object") return null;
  const { identifier, password } = input as AdminCredentialsInput;
  if (typeof identifier !== "string" || typeof password !== "string") return null;

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);
  const isUsername = /^[a-z0-9][a-z0-9._-]{0,31}$/.test(normalizedIdentifier);
  if ((!isEmail && !isUsername) || password.length === 0) {
    return null;
  }
  return { identifier: normalizedIdentifier, password };
}

/** Maps the admin username (SUPABASE_ADMIN_USERNAME) to its Supabase Auth email; emails pass through. */
export function resolveAdminEmail(identifier: string, env: { username?: string; email?: string }): string | null {
  const name = identifier.trim().toLowerCase();
  if (name.includes("@")) return name;
  const username = env.username?.trim().toLowerCase();
  const email = env.email?.trim().toLowerCase();
  return username && email && name === username ? email : null;
}
