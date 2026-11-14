import assert from "node:assert/strict";
import test from "node:test";
import {
  hiddenAdminModulesFromStorage,
  parseHiddenAdminModules,
  visibleAdminModules,
} from "./admin-sidebar.ts";
import { adminModules, adminSettingsMenu, adminSidebarMenu } from "./admin-modules.ts";

test("slug tersembunyi dinormalisasi menurut urutan modul dan tanpa duplikat", () => {
  assert.deepEqual(
    parseHiddenAdminModules(["artikel", "program", "artikel"]),
    ["program", "artikel"],
  );
});

test("payload sidebar menolak bentuk, anggota, dan slug yang tidak dikenal", () => {
  assert.equal(parseHiddenAdminModules({}), null);
  assert.equal(parseHiddenAdminModules(["program", 1]), null);
  assert.equal(parseHiddenAdminModules(["program", "tidak-ada"]), null);
});

test("nilai storage yang rusak kembali ke daftar kosong", () => {
  assert.deepEqual(hiddenAdminModulesFromStorage("program"), []);
  assert.deepEqual(hiddenAdminModulesFromStorage(["tidak-ada"]), []);
});

test("daftar modul terlihat hanya menghapus slug yang dipilih", () => {
  const visibleSlugs = visibleAdminModules(["program", "artikel"]).map((module) => module.slug);

  assert.equal(visibleSlugs.includes("program"), false);
  assert.equal(visibleSlugs.includes("artikel"), false);
  assert.equal(visibleSlugs.includes("trainer"), true);
});

test("semua modul dapat disembunyikan tanpa memasukkan menu pemulihan", () => {
  assert.deepEqual(visibleAdminModules(adminModules.map((module) => module.slug)), []);
  assert.equal(adminModules.includes(adminSidebarMenu), false);
  assert.equal(adminModules.includes(adminSettingsMenu), false);
});
