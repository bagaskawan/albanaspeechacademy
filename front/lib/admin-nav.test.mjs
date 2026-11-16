import assert from "node:assert/strict";
import test from "node:test";
import { adminNavGroups, resolveAdminNav } from "./admin-nav.ts";

test("five pill groups in fixed order", () => {
  assert.deepEqual(adminNavGroups.map((group) => group.label), ["Dashboard", "Pendaftaran", "Kelas", "Konten", "Pengaturan"]);
});

test("/admin is Dashboard with no active module", () => {
  const nav = resolveAdminNav("/admin");
  assert.equal(nav.group.id, "dashboard");
  assert.equal(nav.module, undefined);
});

test("nested module route resolves group and module", () => {
  const nav = resolveAdminNav("/admin/program/speaker-training/edit");
  assert.equal(nav.group.id, "kelas");
  assert.equal(nav.module?.href, "/admin/program");
});

test("tagihan belongs to Pendaftaran, not the dashboard shortcut", () => {
  const nav = resolveAdminNav("/admin/tagihan");
  assert.equal(nav.group.id, "pendaftaran");
  assert.equal(nav.module?.label, "Tagihan");
});

test("prefix match respects path segments", () => {
  assert.equal(resolveAdminNav("/admin/programs-old").module, undefined);
  assert.equal(resolveAdminNav("/admin/profil-akademi").group.id, "pengaturan");
});

test("unknown admin route falls back to Dashboard", () => {
  assert.equal(resolveAdminNav("/admin/denied").group.id, "dashboard");
});

test("every module href is unique across groups", () => {
  const hrefs = adminNavGroups.flatMap((group) => group.modules.map((item) => item.href));
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test("isDetail only below a module's list page", () => {
  assert.equal(resolveAdminNav("/admin").isDetail, false);
  assert.equal(resolveAdminNav("/admin/program").isDetail, false);
  assert.equal(resolveAdminNav("/admin/program/speaker-training/edit").isDetail, true);
  assert.equal(resolveAdminNav("/admin/artikel/baru").isDetail, true);
  assert.equal(resolveAdminNav("/admin/denied").isDetail, false);
});

test("every module has a one-line description and Dashboard has no shortcuts", () => {
  for (const group of adminNavGroups) {
    assert.equal("shortcuts" in group, false);
    for (const item of group.modules) assert.ok(item.description && !item.description.includes("\n"), item.href);
  }
  assert.ok(adminNavGroups[0].description);
});

test("/admin/settings resolves to Pengaturan but stays out of the sidebar", () => {
  const nav = resolveAdminNav("/admin/settings");
  assert.equal(nav.group.id, "pengaturan");
  assert.equal(nav.module?.label, "Pengaturan");
  assert.equal(nav.module?.hidden, true);
  assert.equal(nav.isDetail, false);
});

test("Kelas berisi Program & Batch dan Trainer; /admin/batch bukan modul lagi", () => {
  const kelas = adminNavGroups.find((group) => group.id === "kelas");
  assert.deepEqual(kelas.modules.map((item) => item.label), ["Program & Batch", "Trainer"]);
  assert.equal(resolveAdminNav("/admin/batch").module, undefined);
  assert.equal(resolveAdminNav("/admin/program").module?.label, "Program & Batch");
});
