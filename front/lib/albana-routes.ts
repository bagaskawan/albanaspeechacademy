const adminPaths = [
  "/admin/program", "/admin/batch", "/admin/trainer", "/admin/bundling", "/admin/artikel",
];

export function isAlbanaPath(pathname: string) {
  if (["/", "/login", "/forgot-password", "/reset-password", "/privacy", "/terms", "/admin"].includes(pathname)) return true;
  if (["/program", "/artikel", "/register"].some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  if (["/auth/confirm", "/api/registrations", "/api/upload"].includes(pathname) || /^\/api\/media\/[0-9]+$/.test(pathname)) return true;
  if (/^\/api\/admin\/export\/[a-z]+$/.test(pathname)) return true;
  if (["/admin/galeri", "/admin/media", "/admin/testimoni", "/admin/partner", "/admin/pendaftar", "/admin/tagihan", "/admin/rekening", "/admin/kontak", "/admin/profil-akademi"].includes(pathname)) return true;
  return adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
