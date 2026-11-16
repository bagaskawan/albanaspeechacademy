// Admin navigation (admin-ui-patterns §3.1): one sidebar — Dashboard, then groups with sub-menus.
// Kept in code; the old privilege_* tables are gone. Icons are names mapped in the shell.

export type AdminNavIcon =
  | "dashboard" | "users" | "receipt" | "book" | "calendar" | "trainer"
  | "article" | "media" | "gallery" | "quote" | "partner"
  | "academy" | "contact" | "bank";

export type AdminNavModule = {
  label: string; href: string; icon: AdminNavIcon; description: string;
  /** Reachable page (title, breadcrumb) that is not a sidebar item, e.g. /admin/settings from the account menu. */
  hidden?: boolean;
};

export type AdminNavGroup = {
  id: "dashboard" | "pendaftaran" | "kelas" | "konten" | "pengaturan";
  label: string;
  href: string;
  icon: AdminNavIcon;
  modules: AdminNavModule[];
  /** Page description for groups that are a page themselves (Dashboard). */
  description?: string;
};

export const adminNavGroups: AdminNavGroup[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: "dashboard", modules: [], description: "Statistik pendaftaran dan pembayaran Albana." },
  {
    id: "pendaftaran", label: "Pendaftaran", href: "/admin/pendaftar", icon: "users",
    modules: [
      { label: "Pendaftar", href: "/admin/pendaftar", icon: "users", description: "Pendaftaran yang masuk melalui formulir Albana. Status pembayaran diperiksa di Tagihan." },
      { label: "Tagihan", href: "/admin/tagihan", icon: "receipt", description: "Cocokkan bukti WhatsApp dan nominal persis sebelum memverifikasi. DP yang diverifikasi menerbitkan tagihan pelunasan." },
    ],
  },
  {
    id: "kelas", label: "Kelas", href: "/admin/program", icon: "book",
    modules: [
      { label: "Program & Batch", href: "/admin/program", icon: "book", description: "Biaya dan isi tiap program, jadwal batch, dan tawaran paket." },
      { label: "Trainer", href: "/admin/trainer", icon: "trainer", description: "Profil pengajar Albana." },
    ],
  },
  {
    id: "konten", label: "Konten", href: "/admin/artikel", icon: "article",
    modules: [
      { label: "Artikel", href: "/admin/artikel", icon: "article", description: "Draf dan artikel yang sudah terbit. Hanya artikel terbit yang tampil di situs publik." },
      { label: "Media", href: "/admin/media", icon: "media", description: "Foto dan video per program. Berkas draf hanya terlihat oleh admin; terbitkan setelah diperiksa." },
      { label: "Galeri", href: "/admin/galeri", icon: "gallery", description: "Foto dokumentasi kegiatan untuk situs publik." },
      { label: "Testimoni", href: "/admin/testimoni", icon: "quote", description: "Kutipan peserta yang tampil di beranda." },
      { label: "Partner", href: "/admin/partner", icon: "partner", description: "Instansi yang pernah dilatih Albana." },
    ],
  },
  {
    id: "pengaturan", label: "Pengaturan", href: "/admin/profil-akademi", icon: "academy",
    modules: [
      { label: "Profil akademi", href: "/admin/profil-akademi", icon: "academy", description: "Nama akademi, metode belajar, dan ketentuan penjadwalan ulang." },
      { label: "Kontak", href: "/admin/kontak", icon: "contact", description: "Kanal kontak resmi yang tampil di situs publik." },
      { label: "Rekening", href: "/admin/rekening", icon: "bank", description: "Rekening tujuan transfer tagihan pendaftaran. Hanya satu yang aktif." },
      { label: "Pengaturan", href: "/admin/settings", icon: "academy", description: "Profil akademi, kanal kontak, dan rekening pembayaran dalam satu tempat.", hidden: true },
    ],
  },
];

const isWithin = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function resolveAdminNav(pathname: string): { group: AdminNavGroup; module?: AdminNavModule; isDetail: boolean } {
  for (const group of adminNavGroups) {
    const found = group.modules.find((item) => isWithin(pathname, item.href));
    if (found) return { group, module: found, isDetail: pathname !== found.href };
  }
  return { group: adminNavGroups[0], isDetail: false };
}
