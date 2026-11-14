import { cmsCollections, type CmsTable } from "./cms-fields";

export type AdminGroup = "Akademi & katalog" | "Editorial" | "Operasional";

export type AdminModule = {
  slug: string;
  table: CmsTable;
  label: string;
  group: AdminGroup;
  description: string;
};

export const adminGroups: AdminGroup[] = ["Akademi & katalog", "Editorial", "Operasional"];

export const adminModules: AdminModule[] = [
  { slug: "profil-akademi", table: "academy", label: cmsCollections.academy.label, group: "Akademi & katalog", description: "Nama akademi, metode belajar, dan ketentuan penjadwalan ulang." },
  { slug: "program", table: "programs", label: cmsCollections.programs.label, group: "Akademi & katalog", description: "Program kelas yang tampil di halaman publik." },
  { slug: "trainer", table: "trainers", label: cmsCollections.trainers.label, group: "Akademi & katalog", description: "Profil pengajar Albana." },
  { slug: "batch", table: "batches", label: cmsCollections.batches.label, group: "Akademi & katalog", description: "Jadwal angkatan, biaya, lokasi, dan status pendaftaran." },
  { slug: "sesi", table: "sessions", label: cmsCollections.sessions.label, group: "Akademi & katalog", description: "Pertemuan per batch dengan waktu WIB." },
  { slug: "gallery", table: "gallery", label: cmsCollections.gallery.label, group: "Editorial", description: "Foto dan video Albana untuk publikasi." },
  { slug: "testimoni", table: "testimonials", label: cmsCollections.testimonials.label, group: "Editorial", description: "Kutipan peserta Albana." },
  { slug: "artikel", table: "articles", label: cmsCollections.articles.label, group: "Editorial", description: "Draf dan artikel yang sudah terbit." },
  { slug: "media", table: "media_assets", label: cmsCollections.media_assets.label, group: "Editorial", description: "Pustaka aset privat dan tautan video YouTube." },
  { slug: "kontak", table: "contact_channels", label: cmsCollections.contact_channels.label, group: "Operasional", description: "Kanal kontak yang tampil di situs publik." },
  { slug: "rekening", table: "bank_accounts", label: cmsCollections.bank_accounts.label, group: "Operasional", description: "Rekening internal untuk tindak lanjut pembayaran." },
];

export function moduleForSlug(slug: string): AdminModule | undefined {
  return adminModules.find((item) => item.slug === slug);
}

const settingsTables: CmsTable[] = ["contact_channels", "bank_accounts"];

export function isSettingsTable(table: CmsTable) {
  return settingsTables.includes(table);
}

export function adminModuleHref(adminModule: AdminModule) {
  // Kontak dan rekening berbagi satu halaman bertab.
  return isSettingsTable(adminModule.table) ? "/admin/pengaturan" : `/admin/${adminModule.slug}`;
}

export const adminSettingsMenu = {
  label: "Pengaturan",
  description: "Kanal kontak publik dan rekening untuk tindak lanjut pembayaran.",
  href: "/admin/pengaturan",
};

export const adminSidebarMenu = {
  label: "Tampilan sidebar",
  description: "Atur modul yang tampil pada navigasi admin.",
  href: "/admin/sidebar-layout",
};

export function moduleForTable(table: CmsTable): AdminModule {
  const found = adminModules.find((item) => item.table === table);
  if (!found) throw new Error("Modul admin tidak ditemukan.");
  return found;
}
