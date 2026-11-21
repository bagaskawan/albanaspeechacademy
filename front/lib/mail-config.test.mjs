import assert from "node:assert/strict";
import test from "node:test";
import { readMailConfig } from "./mail-config.ts";

const gmail = {
  SMTP_USER: "albana.test@gmail.com",
  SMTP_PASS: "abcdabcdabcdabcd",
  SITE_URL: "https://albanaspeechacademy.com/",
  NODE_ENV: "production",
};

test("only SMTP_USER and SMTP_PASS are required, like attendance-actions", () => {
  assert.equal(readMailConfig({ ...gmail, SMTP_USER: "" }), null);
  assert.equal(readMailConfig({ ...gmail, SMTP_PASS: "" }), null);
  assert.ok(readMailConfig(gmail));
});

test("defaults match the existing transporter: smtp.gmail.com, 465, TLS", () => {
  const config = readMailConfig(gmail);
  assert.equal(config.host, "smtp.gmail.com");
  assert.equal(config.port, 465);
  assert.equal(config.secure, true);
  assert.equal(config.replyTo, null);
  assert.equal(config.siteUrl, "https://albanaspeechacademy.com");
});

test("from always uses the SMTP account with the Albana display name", () => {
  assert.equal(readMailConfig(gmail).from, '"Albana Speech Academy" <albana.test@gmail.com>');
});

test("SMTP_FROM overrides the sender for relays like Resend", () => {
  const resend = { ...gmail, SMTP_HOST: "smtp.resend.com", SMTP_USER: "resend", SMTP_FROM: "noreply@albanaspeechacademy.com" };
  assert.equal(readMailConfig(resend).from, '"Albana Speech Academy" <noreply@albanaspeechacademy.com>');
  assert.equal(readMailConfig(resend).user, "resend");
});

test("SMTP_SECURE is false only for the exact string false", () => {
  assert.equal(readMailConfig({ ...gmail, SMTP_PORT: "587", SMTP_SECURE: "false" }).secure, false);
  assert.equal(readMailConfig({ ...gmail, SMTP_SECURE: "no" }).secure, true);
});

test("rejects a malformed port", () => {
  assert.equal(readMailConfig({ ...gmail, SMTP_PORT: "abc" }), null);
  assert.equal(readMailConfig({ ...gmail, SMTP_PORT: "70000" }), null);
});

test("site url falls back like checkout-actions and never to localhost in production", () => {
  const base = { SMTP_USER: "u@gmail.com", SMTP_PASS: "p" };
  assert.equal(
    readMailConfig({ ...base, NEXT_PUBLIC_SITE_URL: "https://a.id", NEXT_PUBLIC_APP_URL: "https://b.id" }).siteUrl,
    "https://a.id",
  );
  assert.equal(readMailConfig({ ...base, NEXT_PUBLIC_APP_URL: "https://b.id" }).siteUrl, "https://b.id");
  assert.equal(readMailConfig({ ...base, NODE_ENV: "development" }).siteUrl, "http://localhost:3000");
  assert.equal(readMailConfig({ ...base, NODE_ENV: "production" }), null);
  assert.equal(readMailConfig({ ...base, NODE_ENV: "production", SITE_URL: "http://albanaspeechacademy.com" }), null);
});
