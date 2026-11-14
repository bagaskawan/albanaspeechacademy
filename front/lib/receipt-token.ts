import { createHmac, timingSafeEqual } from "node:crypto";

function signature(id: number, expires: number, secret: string) {
  return createHmac("sha256", secret).update(`albana-receipt:${id}:${expires}`).digest("base64url");
}

export function createReceiptToken(id: number, secret: string, now = Date.now()): string {
  if (!Number.isSafeInteger(id) || id < 1 || !secret) throw new Error("Token tidak dapat dibuat.");
  const expires = Math.floor(now / 1000) + 30 * 86400;
  return `${id}.${expires}.${signature(id, expires, secret)}`;
}

export function readReceiptToken(token: string, secret: string, now = Date.now()): number | null {
  const match = /^(\d{1,15})\.(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match || !secret) return null;
  const id = Number(match[1]);
  const expires = Number(match[2]);
  if (!Number.isSafeInteger(id) || id < 1 || expires < Math.floor(now / 1000)) return null;
  const expected = Buffer.from(signature(id, expires, secret));
  const received = Buffer.from(match[3]);
  return expected.length === received.length && timingSafeEqual(expected, received) ? id : null;
}
