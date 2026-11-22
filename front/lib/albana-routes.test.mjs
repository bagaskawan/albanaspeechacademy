import assert from "node:assert/strict";
import { test } from "node:test";
import { isAlbanaPath } from "./albana-routes.ts";

test("rute Albana tetap tersedia", () => {
  for (const path of ["/", "/login", "/sitemap.xml", "/robots.txt", "/register/public-speaking", "/program/inhouse-training", "/admin", "/admin/program/public-speaking-series/edit", "/admin/pendaftar", "/api/registrations", "/api/upload", "/api/media/12", "/api/article-images/550e8400-e29b-41d4-a716-446655440000", "/api/admin/invoice-payments", "/api/admin/invoice-payments/1/proof", "/api/admin/export/pendaftar", "/admin/rekening", "/admin/kontak", "/admin/profil-akademi", "/admin/settings", "/admin/galeri", "/admin/partner"]) {
    assert.equal(isAlbanaPath(path), true, path);
  }
});

test("rute komunitas dan endpoint lama dipensiunkan", () => {
  for (const path of ["/myprofile", "/admin/media", "/admin/members", "/admin/roles", "/admin/galeri/addGallery", "/admin/partner/addPartner", "/api/member/profile", "/auth/callback", "/api/media/not-an-id", "/api/article-images/not-a-uuid", "/api/article-images/550e8400-e29b-41d4-a716-446655440000/extra", "/api/admin/invoice-payments/abc/proof", "/api/admin/invoice-payments/1/proof/x", "/api/admin/export/../x", "/api/admin/export/Pendaftar"]) {
    assert.equal(isAlbanaPath(path), false, path);
  }
});
