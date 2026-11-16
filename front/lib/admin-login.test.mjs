import assert from "node:assert/strict";
import test from "node:test";
import { isEmailUnconfirmed, parseAdminCredentials, resolveAdminEmail } from "./admin-login.ts";

test("menerima username dan email admin yang valid", () => {
  assert.deepEqual(
    parseAdminCredentials({ identifier: " admin ", password: "rahasia" }),
    { identifier: "admin", password: "rahasia" },
  );
  assert.deepEqual(
    parseAdminCredentials({ identifier: " ADMIN@example.com ", password: "rahasia" }),
    { identifier: "admin@example.com", password: "rahasia" },
  );
});

test("menolak kredensial admin yang kosong", () => {
  assert.equal(parseAdminCredentials({ identifier: "", password: "rahasia" }), null);
  assert.equal(parseAdminCredentials({ identifier: "admin", password: "" }), null);
});

test("mengenali error konfirmasi email Supabase tanpa salah menganggap error lain", () => {
  assert.equal(isEmailUnconfirmed({ error_code: "email_not_confirmed" }), true);
  assert.equal(isEmailUnconfirmed({ error_code: "invalid_credentials" }), false);
  assert.equal(isEmailUnconfirmed(null), false);
});

test("username admin dipetakan ke email admin, tanpa peka huruf besar dan spasi", () => {
  const env = { username: "adminalbana", email: "admin@example.invalid" };
  assert.equal(resolveAdminEmail("adminalbana", env), "admin@example.invalid");
  assert.equal(resolveAdminEmail(" AdminAlbana ", env), "admin@example.invalid");
});

test("email diteruskan apa adanya; username lain atau env kosong ditolak", () => {
  const env = { username: "adminalbana", email: "admin@example.invalid" };
  assert.equal(resolveAdminEmail("Orang@Example.invalid", env), "orang@example.invalid");
  assert.equal(resolveAdminEmail("adminlain", env), null);
  assert.equal(resolveAdminEmail("adminalbana", { username: "adminalbana", email: undefined }), null);
  assert.equal(resolveAdminEmail("adminalbana", { username: undefined, email: "admin@example.invalid" }), null);
});
