import assert from "node:assert/strict";
import test from "node:test";
import { authRedirect } from "./auth-redirect.ts";

test("signed-out visits to /admin go to /login, never to /", () => {
  assert.equal(authRedirect("/admin", { signedIn: false, isAdmin: false }), "/login");
  assert.equal(authRedirect("/admin/tagihan", { signedIn: false, isAdmin: false }), "/login");
});

test("a signed-in admin opening /login goes straight to /admin", () => {
  assert.equal(authRedirect("/login", { signedIn: true, isAdmin: true }), "/admin");
});

test("a signed-in non-admin stays on /login (no /login ↔ /admin loop)", () => {
  assert.equal(authRedirect("/login", { signedIn: true, isAdmin: false }), null);
});

test("other cases pass through", () => {
  assert.equal(authRedirect("/login", { signedIn: false, isAdmin: false }), null);
  assert.equal(authRedirect("/admin", { signedIn: true, isAdmin: false }), null);
  assert.equal(authRedirect("/", { signedIn: false, isAdmin: false }), null);
  assert.equal(authRedirect("/administrasi", { signedIn: false, isAdmin: false }), null);
});
