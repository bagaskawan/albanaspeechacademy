// Admin navigation (admin-ui-patterns §3.1–§3.2): pill = group, rail = module.
// Kept in code; the old privilege_* tables are gone. Icons are names mapped in the shell.

export type AdminNavIcon =
  | "dashboard" | "users" | "receipt" | "book" | "calendar" | "trainer"
  | "article" | "media" | "gallery" | "quote" | "partner"
  | "academy" | "contact" | "bank";

export type AdminNavModule = { label: string; href: string; icon: AdminNavIcon };

export type AdminNavGroup = {
  id: "dashboard" | "pendaftaran" | "kelas" | "konten" | "pengaturan";
  label: string;
  href: string;
  icon: AdminNavIcon;
  modules: AdminNavModule[];
  /** Rail links that point into other groups (Dashboard only). */
  shortcuts?: AdminNavModule[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "dashboard", label: "Dashboard", href: "/admin", icon: "dashboard", modules: [],
    shortcuts: [
      { label: "Tagihan menunggu", href: "/admin/tagihan", icon: "receipt" },
      { label: "Batch aktif", href: "/admin/batch", icon: "calendar" },
    ],
  },
  {
    id: "pendaftaran", label: "Pendaftaran", href: "/admin/pendaftar", icon: "users",
    modules: [
      { label: "Pendaftar", href: "/admin/pendaftar", icon: "users" },
      { label: "Tagihan", href: "/admin/tagihan", icon: "receipt" },
    ],
  },
  {
    id: "kelas", label: "Kelas", href: "/admin/program", icon: "book",
    modules: [
      { label: "Program", href: "/admin/program", icon: "book" },
      { label: "Batch", href: "/admin/batch", icon: "calendar" },
      { label: "Trainer", href: "/admin/trainer", icon: "trainer" },
    ],
  },
  {
    id: "konten", label: "Konten", href: "/admin/artikel", icon: "article",
    modules: [
      { label: "Artikel", href: "/admin/artikel", icon: "article" },
      { label: "Media", href: "/admin/media", icon: "media" },
      { label: "Galeri", href: "/admin/galeri", icon: "gallery" },
      { label: "Testimoni", href: "/admin/testimoni", icon: "quote" },
      { label: "Partner", href: "/admin/partner", icon: "partner" },
    ],
  },
  {
    id: "pengaturan", label: "Pengaturan", href: "/admin/profil-akademi", icon: "academy",
    modules: [
      { label: "Profil akademi", href: "/admin/profil-akademi", icon: "academy" },
      { label: "Kontak", href: "/admin/kontak", icon: "contact" },
      { label: "Rekening", href: "/admin/rekening", icon: "bank" },
    ],
  },
];

const isWithin = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function resolveAdminNav(pathname: string): { group: AdminNavGroup; module?: AdminNavModule } {
  for (const group of adminNavGroups) {
    const found = group.modules.find((item) => isWithin(pathname, item.href));
    if (found) return { group, module: found };
  }
  return { group: adminNavGroups[0] };
}
