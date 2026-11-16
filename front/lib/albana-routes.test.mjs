import assert from "node:assert/strict";
import { test } from "node:test";
import { isAlbanaPath } from "./albana-routes.ts";

test("rute Albana tetap tersedia", () => {
  for (const path of ["/", "/login", "/register/public-speaking", "/program/inhouse-training", "/admin", "/admin/program/public-speaking-series/edit", "/admin/pendaftar", "/api/registrations", "/api/media/12", "/api/admin/export/pendaftar", "/admin/rekening", "/admin/kontak", "/admin/profil-akademi", "/admin/settings"]) {
    assert.equal(isAlbanaPath(path), true, path);
  }
});

test("rute komunitas dan endpoint lama dipensiunkan", () => {
  for (const path of ["/myprofile", "/admin/members", "/admin/roles", "/admin/galeri/addGallery", "/admin/partner/addPartner", "/api/member/profile", "/auth/callback", "/api/media/not-an-id", "/api/admin/export/../x", "/api/admin/export/Pendaftar"]) {
    assert.equal(isAlbanaPath(path), false, path);
  }
});
