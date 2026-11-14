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
