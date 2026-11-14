# Desain: Restrukturisasi & Redesign Web Admin

**Tanggal:** 10 November 2026
**Status:** Menunggu persetujuan

## 1. Tujuan

Memecah admin yang saat ini hanya punya tiga halaman (`/admin`, `/admin/login`, `/admin/konten/[table]`) menjadi modul bernama sesuai `docs/data/system-architecture.md`, lalu menerapkan tampilan `docs/design/admin-design-system.md` di desktop dan `docs/archive/admin/admin-mobile-guidelines.md` di mobile.

Yang berubah hanya lapisan rute dan tampilan. Skema database, endpoint tulis (`/api/admin/content/[table]`, `/api/admin/media`, `/api/admin/login`, `/api/admin/logout`), validasi, dan aturan otorisasi tetap dipakai apa adanya.

## 2. Non-goals

- Tidak membuat halaman `/admin/pendaftaran` dan `/admin/pembayaran`. Keduanya belum punya alur tindak lanjut dan otorisasi tersendiri; arsitektur menyebutnya direncanakan.
- Tidak membuat dashboard statistik/grafik. Ringkasan tetap menjadi hub tautan modul, sesuai arsitektur ("bukan statistik yang belum tersedia").
- Tidak membuat `system_settings`, halaman `/admin/settings`, atau sinkronisasi dua database. `admin-mobile.md` §5–6 memakai nama project dan tabel dari aplikasi lain (Panggung Kreator); ID `zpcsqidgedvuaqgrklgp`/`wmuzvefmrbgffftkpdnx` bukan project Albana. Pagination memakai limit tetap 10 dengan penanda `shortcut:`.
- Tidak menambah dark mode (design-system §13 menyebutnya pertanyaan terbuka). Token hanya light mode.
- Tidak mengubah halaman publik atau token publik di `globals.css`.

## 3. Keputusan yang sudah dipilih

| Topik | Keputusan |
| --- | --- |
| Navigasi desktop | Sidebar 220px + top header 56px sesuai design-system §4.1/§4.3 |
| Navigasi mobile | Topbar + drawer menu; daftar memakai kartu dan action dock sesuai admin-mobile |
| Cakupan rute | 12 modul bernama (semua koleksi CMS) |
| Pola edit | Daftar → halaman detail/create terpisah |
| Pagination | Client-side, 10 per halaman, tanpa tabel baru |
| Dark mode | Tidak termasuk |

## 4. Struktur rute dan file

`app/admin/layout.tsx` **tidak** dibuat, karena login harus tampil tanpa shell. Shell admin memakai route group `(cms)` sehingga URL tidak berubah.

```text
web/app/admin/
├── login/page.tsx                      # tetap, di-restyle
├── (cms)/
│   ├── layout.tsx                      # requireAdmin + AdminShell
│   ├── loading.tsx                     # skeleton animate-pulse
│   ├── page.tsx                        # hub modul
│   ├── profil-akademi/page.tsx         # academy
│   ├── program/page.tsx                # programs
│   ├── program/[key]/page.tsx          # edit / baru
│   ├── trainer/page.tsx                # trainers
│   ├── trainer/[key]/page.tsx
│   ├── batch/page.tsx                  # batches
│   ├── batch/[key]/page.tsx
│   ├── sesi/page.tsx                   # sessions
│   ├── sesi/[key]/page.tsx
│   ├── penugasan-trainer/page.tsx      # batch_trainers
│   ├── penugasan-trainer/[key]/page.tsx
│   ├── gallery/page.tsx                # gallery
│   ├── gallery/[key]/page.tsx
│   ├── testimoni/page.tsx              # testimonials
│   ├── testimoni/[key]/page.tsx
│   ├── artikel/page.tsx                # articles
│   ├── artikel/[key]/page.tsx
│   ├── media/page.tsx                  # media_assets + unggah
│   ├── media/[key]/page.tsx
│   ├── kontak/page.tsx                 # contact_channels
│   ├── kontak/[key]/page.tsx
│   ├── rekening/page.tsx               # bank_accounts
│   ├── rekening/[key]/page.tsx
│   └── konten/[table]/page.tsx         # URL lama → redirect ke modul
```

`[key]` adalah kunci baris. Koleksi dengan kunci gabungan (`sessions`, `batch_trainers`) memakai nilai yang di-encode dengan pemisah `~` oleh `lib/cms-key.ts`. Segmen `baru` berarti create.

Kenapa halaman detail terpisah per modul, bukan satu rute dinamis: sesuai permintaan arsitektur "satu folder rute bernama untuk setiap modul", dan menghindari benturan pencocokan rute statis/dinamis Next.js. Setiap file rute hanya beberapa baris dan mendelegasikan ke komponen bersama.

## 5. Komponen dan modul baru

| File | Tanggung jawab |
| --- | --- |
| `lib/admin-modules.ts` | Daftar modul: slug, tabel, label, grup, deskripsi. Sumber tunggal untuk sidebar, hub, dan redirect URL lama. |
| `lib/cms-key.ts` | Encode/decode kunci baris (termasuk kunci gabungan). |
| `lib/admin-list.ts` | Aturan murni daftar: kolom ringkas, nilai utama, status badge, filter pencarian, potong halaman. `ADMIN_PAGE_SIZE = 10` dengan komentar `shortcut:`. |
| `components/admin/admin-shell.tsx` | Bingkai: sidebar, topbar, konten, drawer mobile. |
| `components/admin/admin-nav.tsx` | Navigasi sidebar + drawer (client, `usePathname`). |
| `components/admin/admin-topbar.tsx` | Breadcrumb, email admin, tombol keluar, tombol menu mobile. |
| `components/admin/admin-icon.tsx` | SVG inline (tanpa dependency ikon baru). |
| `components/admin/admin-collection-page.tsx` | Server: `requireAdminAccess` + `listCmsRows`, render daftar. |
| `components/admin/admin-collection-list.tsx` | Client: pencarian, tabel desktop, kartu mobile, pagination, dock tambah. |
| `components/admin/admin-record-page.tsx` | Server: decode kunci, `findCmsRow`, 404 bila tidak ada, render form. |
| `components/admin/cms-editor.tsx` | Dipertahankan, di-restyle ke form admin. |
| `components/admin/cms-upload-form.tsx` | Dipertahankan, di-restyle. |
| `components/admin/admin-login-form.tsx` | Dipertahankan, di-restyle. |

Tidak ada dependency baru. Ikon memakai SVG inline; font memakai Inter yang sudah dimuat sebagai `--font-display`.

## 6. Tampilan

### Shell desktop
- Sidebar `w-[220px]` putih, border kanan, logo Albana di atas, grup menu (Akademi & katalog, Editorial, Operasional). Item aktif: teks hitam `font-bold` + border kiri 3px hitam, tanpa background.
- Topbar `h-14` penuh: breadcrumb `[ ADMIN ] / <modul>`; kanan email admin + tombol keluar.
- Konten: background `#F2F4F7`, padding 24–32px, kartu radius 16–20px, border `#E5E7EB` tanpa shadow.

### Shell mobile
- Topbar dengan tombol menu → drawer navigasi.
- Daftar berupa kartu `rounded-3xl`, bukan tabel.
- Action dock `fixed bottom-6` berisi satu tombol "Tambah" (hanya pada koleksi yang bisa create). Tidak ada tombol filter/sort tambahan; pencarian hanya di header.
- Modal/drawer `rounded-none sm:rounded-3xl`.

### Halaman daftar
- Tagline modul `[ NAMA ]`, judul `text-2xl font-bold`, pencarian kapsul `h-9`, tombol "Tambah" pill, separator.
- Kolom tabel: maksimal 4 field non-teks pertama dari definisi koleksi; nilai boolean/status menjadi badge; tanggal diformat WIB.
- Pagination: `← Sebelumnya`, `Hal X dari Y`, `Selanjutnya →`, plus "Menampilkan A–B dari C data (10/hal)".
- Pencarian memfilter judul/nama/slug dan field teks lain secara client-side.

### Halaman detail/form
- Tombol back bulat, judul record.
- Form putih di desktop; transparan tanpa border di mobile.
- Label 11px semibold, field `h-10 rounded-xl`, textarea `rounded-xl`, tombol Batal/Simpan `h-10`.
- Daftar field dan validasi tetap dari `cmsCollections` dan `parseCmsInput`.

### Login
- Satu kartu monokrom di tengah, field dan tombol memakai aturan form admin.
- Tetap memanggil `/api/admin/login`.

## 7. Data dan keamanan

- Setiap halaman `(cms)` memanggil `requireAdminAccess()` sebelum baca data; layout juga memanggil `requireAdmin()` untuk identitas topbar. Endpoint tetap memeriksa sesi sendiri.
- Halaman detail memakai `findCmsRow` sehingga kunci gabungan divalidasi oleh aturan yang sudah ada.
- Redirect `/admin/konten/[table]` hanya untuk tabel yang terdaftar; tabel tak dikenal → 404.
- Tidak ada kolom/tabel baru. Tidak ada perubahan RLS atau env.
- `export const instant = false` pada layout dan halaman yang membaca cookie.

## 8. Verifikasi

- `npm run lint`
- `npx --no-install tsc --noEmit`
- `npm run build`
- `node --test lib/cms-key.test.mjs lib/admin-list.test.mjs`
- Cek render manual 1440, 834, 390 px: sidebar/drawer, pencarian, pagination, form create/edit, redirect URL lama, login.
- Uji sesi: akses `/admin/program` tanpa cookie → login; kunci tidak dikenal → 404.

## 9. Risiko

- 24 file rute kecil memang banyak, tetapi masing-masing tidak berisi logika; perubahan perilaku tetap terpusat di komponen bersama.
- Pagination client-side memuat semua baris. Aman untuk ukuran CMS saat ini; ganti ke query server bila salah satu koleksi melewati beberapa ratus baris.
- Style login/dashboard berubah total, jadi bookmark ke `/admin` tetap valid tetapi tampilannya berbeda.
