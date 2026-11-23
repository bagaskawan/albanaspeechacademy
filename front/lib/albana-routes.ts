const adminPaths = [
  "/admin/program", "/admin/batch", "/admin/trainer", "/admin/bundling", "/admin/artikel",
];

export function isAlbanaPath(pathname: string) {
  if (["/", "/login", "/forgot-password", "/reset-password", "/privacy", "/terms", "/admin", "/sitemap.xml", "/robots.txt"].includes(pathname)) return true;
  if (["/program", "/artikel", "/register"].some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  if (["/auth/confirm", "/api/registrations", "/api/upload", "/api/admin/invoice-payments", "/api/admin/change-password", "/api/admin/live-counts", "/api/admin/activity"].includes(pathname) || /^\/api\/media\/[0-9]+$/.test(pathname)) return true;
  if (/^\/api\/article-images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pathname)) return true;
  if (/^\/api\/admin\/invoice-payments\/[0-9]+\/proof$/.test(pathname)) return true;
  if (/^\/api\/admin\/export\/[a-z]+$/.test(pathname)) return true;
  if (["/admin/galeri", "/admin/inhouse-galeri", "/admin/testimoni", "/admin/partner", "/admin/pendaftar", "/admin/tagihan", "/admin/kalender", "/admin/rekening", "/admin/kontak", "/admin/profil-akademi", "/admin/settings", "/admin/user-activity"].includes(pathname)) return true;
  return adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
