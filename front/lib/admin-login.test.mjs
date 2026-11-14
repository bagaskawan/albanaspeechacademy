import assert from "node:assert/strict";
import test from "node:test";
import { isEmailUnconfirmed, parseAdminCredentials } from "./admin-login.ts";

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
