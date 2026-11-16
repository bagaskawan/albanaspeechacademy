# Implementation plan — Redesign dan restrukturisasi Albana

**Tanggal:** 16 November 2026 · **Proyek Supabase:** `clgjsekfnexmanjdxmqy` (dipakai apa adanya) · **Aplikasi:** `front/`

Rencana ini langsung masuk ke pekerjaan substansi. Proyek Supabase, kunci, dan riwayat migrasi **tidak** disetel ulang. Setiap perubahan tabel atau kolom ditulis sebagai SQL siap terap di langkah yang membutuhkannya, lalu diterapkan langsung ke proyek sebagai migrasi bernama.

## Titik awal (diperiksa 16 November 2026)

| Area | Keadaan |
| --- | --- |
| Database | **18 tabel** `public` setelah migrasi `remove_community_schema` dan `remove_unused_albana_columns`. `members`, `privilege_*`, `admin_roles`, `registrations`, `payments`, `sessions`, dan tabel komunitas lain **sudah tidak ada**. Fungsi `get_email_by_username` dan `receive_registration` sudah dihapus. |
| Kolom yang dihapus | `academy.hidden_admin_modules`; `testimonials.member_id`, `result_highlight`, `is_featured`, `order_index`. |
| Bundling | `bundle_offers` sudah punya `description`, `show_on_speaker`, `show_on_certification`, `placement_scope`, `speaker_batch_slug`, `certification_batch_slug`. |
| Guard admin | `requireAdminMember`, `/api/upload`, `/api/media/[id]` sudah memakai `admin_users`. |
| Sidebar | Daftar berkode di `app/(admin)/admin/layout.tsx`: Operasional · Kelas · Konten. |
| Data kosong | `bank_accounts` 0, `academy` 0, `academy_partners` 0, `testimonials` 0, `media_assets` 0. |
| Kode yang masih merujuk tabel terhapus | `pendaftar/PendaftarClient.tsx` (hapus dari `registrations`), `galeri/addGallery`, `partner/addPartner` (`members`), `lib/actions/auth-actions.ts`, `app/auth/callback/route.ts`, serta ±23 rute admin warisan. |
| Rekening | Tidak ada layar; `lib/admin-modules.ts` menunjuk `/admin/pengaturan` yang tidak ada. |
| Gerak | `gsap` 3.15 dan `lenis` 1.3 terpasang dan dipakai beranda. `motion` belum terpasang; `framer-motion` tidak ada. Animasi masuk/keluar memakai `tw-animate-css`. |

## Acuan

| Area | Dokumen |
| --- | --- |
| Kebutuhan dan gerbang rilis | [PRD](../project/product-requirements.md) |
| Data | [Skema database](../data/database-schema.md) |
| Admin | [Pola UI admin — Monochrome Soft](../design/admin-ui-patterns.md) |
| Landing page | [Layout landing page](../design/academy-landing-layout.md) · [Konten beranda](../content/home-page-content.md) · [Design system akademi](../design/academy-design-system.md) |
| Pembersihan | [Kandidat pembersihan](../project/cleanup-candidates.md) |

## Aturan kerja

- Kerjakan fase berurutan. Langkah dalam satu fase boleh paralel kecuali bertanda **⟶ butuh n**.
- Satu langkah = satu commit. Pesan menyebut nomor langkah: `fix(admin): 1.2 rujukan tabel terhapus`.
- Perubahan database: terapkan migrasi bernama langsung ke `clgjsekfnexmanjdxmqy`, simpan berkas yang sama di `front/supabase/migrations/`, lalu perbarui [skema database](../data/database-schema.md) pada commit yang sama.
- Centang hanya setelah **Selesai bila** terbukti.
- Prioritas: **P0** pemblokir rilis · **P1** wajib serah terima · **P2** boleh menyusul.

## Ringkasan fase

| Fase | Isi | Prioritas |
| --- | --- | --- |
| 1 | Database dan kode yang patah | P0 |
| 2 | Alur pendaftaran dan tagihan | P0 |
| 3 | Fondasi admin Monochrome Soft | P1 |
| 4 | Komponen dan modul admin | P1 |
| 5 | Landing page | P1 |
| 6 | Pembersihan kode warisan | P1 |
| 7 | QA | P0 |
| 8 | Rilis | P0 |

Jalur minimum rilis: Fase 1 → 2 → 6.1 → 7 → 8. Fase 3–5 dapat paralel setelah Fase 1.

---

## Fase 1 — Database dan kode yang patah

### 1.1 Migrasi data dan aturan admin · P0

Satu migrasi: `20261116_albana_admin_rules.sql`.

```sql
-- Tepat satu rekening aktif; RPC tagihan memilih rekening aktif.
create unique index if not exists bank_accounts_one_active
  on public.bank_accounts ((true)) where active;

-- Baris profil akademi (tabel satu baris, id = 1).
insert into public.academy (id, name, teaching_method, reschedule_policy)
values (
  1,
  'Albana Speech Academy',
  '70% praktik dan simulasi, 20% coaching dan feedback, 10% konsep dan kerangka.',
  'Peserta yang berhalangan dapat mengajukan penjadwalan ulang melalui admin. Pembayaran tidak dikembalikan.'
)
on conflict (id) do nothing;

-- Fungsi trigger SECURITY DEFINER tidak perlu dapat dipanggil lewat REST.
revoke execute on function public.enforce_single_active_batch() from public, anon, authenticated;
revoke execute on function public.reactivate_old_program_batch() from public, anon, authenticated;
```

- [x] Migrasi diterapkan dan berkasnya ada di repo
- [x] Insert rekening aktif kedua ditolak database
- [x] `academy` berisi satu baris
- [x] Advisor keamanan tidak lagi melaporkan dua fungsi trigger
- [x] [Skema database](../data/database-schema.md) mencatat indeks dan baris baru

### 1.2 Perbaiki rujukan ke tabel yang sudah dihapus · P0

| Berkas | Masalah | Perbaikan |
| --- | --- | --- |
| `app/(admin)/admin/pendaftar/PendaftarClient.tsx` | Hapus dari `registrations` | Buang aksi hapus. Pendaftaran tidak dihapus dari CMS; pembatalan lewat status tagihan `cancelled` |
| `app/(admin)/admin/galeri/addGallery/page.tsx` | Baca `members` | Buang kueri; guard sudah memastikan admin |
| `app/(admin)/admin/partner/addPartner/page.tsx` | Baca `members` | Sama |
| `lib/actions/auth-actions.ts` | `members`, RPC `get_email_by_username` | Pastikan `/login` hanya memakai `app/(auth)/login/actions.ts`; hapus fungsi yang tidak lagi dipanggil |
| `app/auth/callback/route.ts` | Sinkron `members` untuk login Google | Login Google tidak dipakai admin Albana: arahkan ke `/login` dengan pesan, atau hapus rute |
| `lib/admin-modules.ts` | `/admin/pengaturan` tidak ada | Arahkan Kontak ke `/admin/kontak`, Rekening ke `/admin/rekening` (dibuat di 1.3) |

Periksa sisa dengan:

```bash
grep -rnE 'from\("(members|privilege_[a-z]+|admin_roles|admin_role_permissions|registrations|payments|intake_key|sessions|contact_details|trainer_contacts|gallery_albums|landing_sections|vouchers|transactions|referral_codes|partners|team_members|wa_group_assignments|media_library|admin_activity_logs)"\)|get_email_by_username|receive_registration' front/app front/lib front/components
```

- [x] Perintah di atas hanya menemukan berkas rute warisan yang dihapus di Fase 6
- [x] Login username dan email berhasil; akun bukan admin ditolak
- [x] `/admin/pendaftar`, `/admin/galeri/addGallery`, `/admin/partner/addPartner` terbuka tanpa galat

### 1.3 Layar Rekening · P0 · ⟶ butuh 1.1

1. `app/(admin)/admin/rekening/page.tsx`: daftar rekening (bank, nomor, pemilik, status aktif).
2. `app/(admin)/admin/rekening/actions.ts`: `saveBankAccount`, `activateBankAccount` — guard di baris pertama; aktivasi = nonaktifkan semua lalu aktifkan satu, dalam satu RPC atau dua pernyataan berurutan yang dijaga indeks 1.1.
3. Hapus hanya untuk `adminsuper` (RLS sudah membatasi).
4. Tambahkan **Rekening** ke grup sidebar (sementara di grup Operasional sampai Fase 3).
5. Isi rekening aktif nyata dari pemilik.

- [x] Admin dapat menambah, mengubah, dan mengaktifkan rekening
- [x] Mengaktifkan rekening lain menonaktifkan yang lama
- [x] Rekening tidak terbaca dengan anon key
- [x] Rekening aktif nyata terisi

**Selesai bila:** pendaftaran uji tidak lagi ditolak “rekening belum tersedia”.

### 1.4 Layar Kontak dan Profil akademi · P1

1. Pindahkan panel Kontak dari `/admin/settings` ke `/admin/kontak` (tabel `contact_channels`, empat jenis tetap).
2. `/admin/profil-akademi`: ubah `academy.name`, `teaching_method`, `reschedule_policy`.
3. Redirect `/admin/settings` → `/admin/kontak`.

Visi, misi, bidang pelatihan, dan kerangka empat tingkat tetap **naskah statis** dari [konten beranda](../content/home-page-content.md); tidak perlu kolom baru.

- [x] Kontak dan profil dapat diubah dari CMS
- [x] Perubahan tampil di beranda tanpa deploy

### 1.5 Data trainer · P1

Lengkapi `trainers.bio` dan `trainers.expertise` empat trainer dari [proposal](../content/academy-proposal.md) melalui `/admin/trainer`.

- [x] Empat trainer punya bio dan keahlian

---

## Fase 2 — Alur pendaftaran dan tagihan

### 2.1 Layar Pendaftar · P0 · ⟶ butuh 1.2

`app/(admin)/admin/pendaftar/page.tsx` sudah membaca `academy_registrations`. Lengkapi:

1. Gabungkan `academy_registration_items` (batch) dan status `academy_invoices` per pendaftaran.
2. Detail: seluruh `answers` dengan label pertanyaan menurut `batches.form_kind` dan `programs.form_*`.
3. Saring per batch dan status tagihan; simpan di URL.

- [ ] Pendaftaran uji tampil dengan batch dan status tagihan
- [ ] Detail menampilkan semua jawaban
- [ ] Saringan bekerja

### 2.2 Uji ujung ke ujung · P0 · ⟶ butuh 1.3, 2.1

Di browser, ponsel 390 px dan desktop:

1. Lunas → konfirmasi → total = subtotal + kode unik → verifikasi di `/admin/tagihan`.
2. DP → verifikasi → tagihan pelunasan terbentuk → verifikasi pelunasan.
3. Kirim ulang identik → tidak berganda.
4. Harga batch diubah saat formulir terbuka → 409.
5. Email sama, batch sama → duplikat.
6. Bundling aktif (`bundle_offers.active`, `show_on_speaker`/`show_on_certification`) → dua butir batch, satu tagihan.
7. Tolak tagihan → status `rejected`.

- [ ] Tujuh skenario lulus
- [ ] Salin rekening dan tautan WhatsApp berfungsi
- [ ] Data uji dihapus

---

## Fase 3 — Fondasi admin Monochrome Soft

### 3.1 Token · P1

Nilai warna diganti oleh 3.6 (monokrom putih). Di `app/globals.css`, ganti token admin biru pada `.admin-shell` dan `.dark .admin-shell` dengan [pola UI admin §2](../design/admin-ui-patterns.md) (warna, radius, ruang, bayangan, pola diagonal) dan token gerak §4.1. Arahkan `--primary`, `--ring`, `--border` scope admin ke token baru.

- [x] Tidak ada `#26599A`, `#DCEBFA`, `#EDF4FB`, `#F4F8FC` di aturan `.admin-shell`
- [ ] Beranda tidak berubah (tangkapan layar sebelum/sesudah)

### 3.2 Poppins · P1

Muat Poppins 300/400/500/600 hanya untuk `(admin)` dan `(auth)` lewat `next/font/google` di layout server pembungkus; pasang sebagai `--font-admin`.

- [x] Admin Poppins; beranda tetap Plus Jakarta Sans + Inter
- [ ] Tanpa pergeseran layout saat font dimuat

### 3.3 Motion · P1

Pasang `motion` (paket gratis; impor `motion/react`). Jangan pasang `framer-motion` atau `motion-plus`.

**Pembagian alat** — satu efek, satu alat:

| Alat | Dipakai untuk |
| --- | --- |
| CSS (`transition`, `@keyframes`, `tw-animate-css`) | Hover, warna, bayangan, spinner, shimmer skeleton |
| Motion (`motion/react`) | Elemen yang keluar dari DOM (`AnimatePresence`), indikator berpindah (`layoutId`), perubahan layout (`layout`), tekan/usap (`whileTap`, `drag`), urutan state imperatif (`animate()`) |
| GSAP + ScrollTrigger + Lenis | **Hanya** gerak gulir beranda (G1–G7, garis kemajuan, header sembunyi/muncul). Motion tidak dipakai untuk gulir agar tetap satu mesin gulir |

Langkah:

1. `npm i motion` di `front/`.
2. `components/motion/MotionProvider.tsx` (`"use client"`): `LazyMotion strict` dengan `domMax` dimuat async (`layoutId` dan `drag` butuh `domMax`) + `MotionConfig reducedMotion="user"` dengan transisi bawaan dari token [pola UI admin §4.1](../design/admin-ui-patterns.md).
3. Pasang provider di layout `(admin)`, `(auth)`, dan pembungkus dialog beranda. Komponen memakai `m.div`, bukan `motion.div`, agar `strict` menolak muatan penuh.
4. `lib/motion/tokens.ts`: padanan JS token CSS — `easeOut`, `easeInOut`, durasi `press/hover/micro/pop/overlay/exit`, dan `spring = { type: "spring", bounce: 0.25, visualDuration: 0.22 }` pengganti `--ease-spring` (hanya untuk pil dan tombol bulat, sesuai §4.3).
5. Server component yang hanya butuh elemen bergerak memakai `import * as motion from "motion/react-client"`; hook, `AnimatePresence`, dan `MotionConfig` hanya di berkas `"use client"`.

**Padanan gerak admin ([pola UI admin §4.2](../design/admin-ui-patterns.md)) ke API:**

| Unsur | API |
| --- | --- |
| Item aktif sidebar berpindah | `m.span layoutId="admin-nav-active"` di dalam item aktif, 280 ms `easeInOut` (3.12) |
| Tombol bulat ditekan | `whileTap={{ scale: 0.92 }}` + `spring` |
| Tombol bulat hover | CSS `transition` pada ikon (geser 2 px, putar 90°) |
| Sub-menu buka/tutup | `AnimatePresence initial={false}` + `height: 0 ↔ "auto"` 200 ms (3.12) |
| Kartu sorotan bertumpuk | `AnimatePresence` + `drag="x"` dengan `dragConstraints`; lepas dengan kecepatan → kartu berikutnya; titik indikator `layoutId` |
| Angka display berubah | `AnimatePresence initial={false}` per digit, `key` = digit, `y "100%"→0`; jeda 30 ms dari kanan |
| Laci sidebar (< 1024 px) | `AnimatePresence` + Radix Dialog `forceMount`, `x "-100%"→0` (3.12) |
| Kepala halaman pindah modul | `m.div key={pathname}`, `opacity` + `y 6→0` 160 ms, tanpa menunggu keluar (3.15) |
| Kartu masuk saat halaman dimuat | `variants` + `stagger(0.05)`, maksimal 6 kartu; `initial={false}` bila `sessionStorage` sudah mencatat kunjungan |
| Dialog, lembar bawah, panel samping | Radix `open`/`onOpenChange` diangkat ke `useState`; `AnimatePresence` membungkus `Dialog.Portal forceMount` + `asChild` ke `m.div` |

- [x] `motion` di `package.json`; `framer-motion` tidak ada
- [ ] `domMax` tidak ada di chunk awal admin (dimuat async); ukuran JS rute beranda tidak naik bila dialog belum dibuka
- [ ] Reduced motion: transform dan layout mati, opacity tetap
- [ ] Tidak ada animasi Motion yang membaca `MotionValue` saat render

### 3.4 Shell topbar pil + rail · P1 · ⟶ butuh 3.1, 3.2, 3.3

> Digantikan oleh 3.12 (satu sidebar). Topbar pil dan rail dihapus.

Ganti `app/(admin)/admin/layout.tsx`:

1. Ubah konstanta `groups` menjadi lima grup pil: **Dashboard · Pendaftaran · Kelas · Konten · Pengaturan**, dengan modul per grup sesuai [pola UI admin §3.2](../design/admin-ui-patterns.md). Daftar tetap di kode (tabel `privilege_*` sudah tidak ada).
2. Topbar: tombol logo bulat, lima pil (aktif meluncur lewat `layoutId`), tema, avatar (username, Keluar; 3.7).
3. Rail kiri: tombol bulat per modul; tooltip; masuk dengan `spring` dan `stagger` (3.3). Tombol kembali pindah ke kepala halaman detail (3.8).
4. Lencana (hitam, 3.6) pada pil Pendaftaran = jumlah `academy_invoices` berstatus `pending`.
5. Responsif §3.4.

- [ ] Semua modul Albana terjangkau
- [ ] `aria-current` benar; keyboard melewati pil lalu rail
- [ ] Fokus pindah seketika saat ganti grup, tidak menunggu animasi rail
- [ ] 360, 768, 1280 px tanpa gulir horizontal

### 3.5 Kepala halaman bersama · P1 · ⟶ butuh 3.4

`components/admin/PageHeader.tsx`: breadcrumb `Grup ⟶ Modul`, judul 44/400 dengan crossfade per pathname (3.3), tombol bulat Saring · Cari · Aksi utama.

- [ ] Dipakai semua modul Albana

### Revisi admin UI (16 November 2026)

Masukan pemilik setelah 3.1–3.5 terpasang. Langkah 3.6–3.11 **menggantikan** bagian yang bertentangan di 3.1, 3.4, 4.1, dan 4.2.3. Bila [pola UI admin](../design/admin-ui-patterns.md) berbeda dengan revisi ini, revisi ini yang berlaku sampai dokumen itu diperbarui di 3.6.

| # | Masukan | Langkah |
| --- | --- | --- |
| R1 | Latar terang putih, monokrom, tanpa biru; warna lembut sebagai pelengkap agar tidak kaku | 3.6 |
| R2 | Login memakai username; username admin `adminalbana` | 3.7 |
| R3 | Tombol kembali hanya di halaman detail | 3.8 |
| R4 | Mode gelap rusak | 3.9 |
| R5 | Pindah halaman tanpa muat ulang; skeleton saat memuat | 3.10 |
| R6 | Dashboard berisi statistik | 3.11 |

### 3.6 Monokrom putih + warna lembut · P1 · ⟶ butuh 3.1

Ganti nilai token 3.1 di `app/globals.css`. Nama token tetap.

| Token | Terang | Gelap | Pakai |
| --- | --- | --- | --- |
| `--admin-canvas` | `#FFFFFF` | `#0B0B0B` | Latar aplikasi |
| `--admin-surface` | `#F6F6F6` | `#161616` | Kartu, pil pasif, tombol bulat |
| `--admin-surface-muted` | `#EDEDED` | `#222222` | Input, kolom cari, chip pasif, hover |
| `--admin-ink` | `#0B0B0B` | `#F5F5F5` | Teks utama, pil aktif, tombol utama, kartu sorotan |
| `--admin-on-ink` | `#FFFFFF` | `#0B0B0B` | Teks di atas `--admin-ink` |
| `--admin-text-secondary` | `#5C5C5C` | `#A8A8A8` | Meta, label |
| `--admin-text-faint` | `#8F8F8F` | `#6E6E6E` | Hanya angka ≥ 32 px |
| `--admin-line` | `#E5E5E5` | `#2A2A2A` | Pemisah, tepi kartu di atas putih |
| `--admin-line-strong` | `#C9C9C9` | `#3D3D3D` | Bingkai ikon, tepi input saat hover |
| `--admin-danger` | `#B42318` | `#F97066` | Teks galat dan aksi hapus |

**Warna lembut pelengkap.** Kerangka tetap monokrom. Lima nada pastel memberi isyarat makna pada unsur kecil agar layar tidak kaku. Biru tetap tidak dipakai.

| Nada | Latar `-soft` (terang / gelap) | Teks `-ink` (terang / gelap) | Titik `-dot` | Makna |
| --- | --- | --- | --- | --- |
| `mint` | `#DDF1E4` / `#15291D` | `#1E6A3C` / `#9FE0B5` | `#22A35A` | Terverifikasi, terbit, dibuka |
| `peach` | `#FDE7DA` / `#33201A` | `#9A4A1F` / `#F6B894` | `#E8833A` | Menunggu verifikasi, perlu tindakan |
| `rose` | `#FBE1E1` / `#331A1A` | `#A3282A` / `#F4A3A3` | `#E5484D` | Ditolak, dibatalkan, latar galat |
| `butter` | `#FBF6C8` / `#2E2B12` | `#6B5D00` / `#F2E58A` | `#E1C100` | Sorotan angka (`+17 baru`), isi area grafik, garis bawah penanda |
| `lilac` | `#ECE7FA` / `#221D33` | `#5B47A8` / `#C3B5F2` | `#7C66D9` | Kategori netral: deret kedua grafik, label program, draf |

Nama token: `--admin-{nada}-soft`, `--admin-{nada}-ink`, dan `--admin-{nada}-dot`, didaftarkan juga sebagai utilitas Tailwind (`bg-admin-mint-soft`, dst.).

Aturan:

1. Warna lembut **hanya** untuk:
   - chip status;
   - titik 8 px sebelum label;
   - lencana hitungan di tab saring;
   - chip selisih pada kartu statistik;
   - isi dan deret grafik;
   - latar banner galat.

   Kartu, panel, pil navigasi, dan tombol tetap abu, hitam, atau putih.
2. Satu nada membawa satu makna di seluruh CMS (tabel di atas). Jangan memakai nada sebagai hiasan.
3. Paling banyak tiga nada berbeda di satu kartu.
4. Teks di atas `-soft` selalu memakai `-ink` nada yang sama. Kontrasnya ≥ 4,5:1 di kedua tema.
5. Tab saring meniru pola kapsul: tab aktif `--admin-surface-muted` dengan hitungan di lencana putih; tab pasif diawali titik `-dot` sesuai maknanya.
6. Lencana tagihan menunggu di pil Pendaftaran memakai `peach`: latar `-dot` dengan teks `#0B0B0B`.
7. `--admin-accent` kuning terang dan `--admin-success-*` dari 3.1 diganti oleh `butter` dan `mint` di atas.
8. Kartu di atas kanvas putih memakai `--admin-surface` tanpa bayangan. Kartu yang bersebelahan dengan kanvas sewarna memakai tepi 1 px `--admin-line`.
9. Hapus semua warna langsung di modul Albana dan auth. Ganti dengan kelas token (`bg-admin-surface`, `text-admin-ink`, `border-admin-line`, dst.). Ada 16 berkas yang terdampak (diperiksa 16 November). Logo putih pada tombol bulat hitam tetap.
10. Perbarui [pola UI admin §1, §2.1, §5](../design/admin-ui-patterns.md) agar sesuai kedua tabel di atas pada commit yang sama.

Periksa sisa warna:

```bash
grep -rniE '#(26599A|163E70|10243F|344B66|425A73|566B8[14]|D8E4F0|DCEBFA|EDF4FB|F4F8FC|EDE84A|D3E5CF)|bg-white|(text|bg|border)-(blue|sky|indigo)-' "front/app/(admin)/admin/"{page.tsx,pendaftar,tagihan,rekening,kontak,profil-akademi,program,batch,trainer,artikel,media,galeri,testimoni,partner,bundling} "front/app/(auth)" front/components/admin/{cms,article,shell,PageHeader.tsx}
```

- [x] Perintah di atas kosong
- [ ] Warna di luar abu hanya berasal dari token nada dan `--admin-danger`; setiap nada dipakai sesuai maknanya, kedua tema
- [ ] Kontras ≥ 4,5:1 diukur dengan alat untuk `--admin-text-secondary` di atas `--admin-surface` dan setiap pasangan `-ink` di atas `-soft`, kedua tema

### 3.7 Login dengan username · P0

`app/(auth)/login/actions.ts` sudah menerima username: nilai yang sama dengan `SUPABASE_ADMIN_USERNAME` dipetakan ke `SUPABASE_ADMIN_EMAIL`, lalu masuk dengan kata sandi Supabase Auth.

1. Setel `SUPABASE_ADMIN_USERNAME=adminalbana` di `front/.env` dan di hosting (Fase 8). Nilai env tidak di-commit.
2. Halaman login (sekaligus 4.2.14):
   - field pertama berlabel **Username**, `autocomplete="username"`, placeholder `adminalbana`;
   - email tetap diterima di field yang sama;
   - pesan galat tetap umum: "Username atau kata sandi tidak valid.".
3. Tampilkan username di menu avatar shell (3.4), bukan email. Ambil dari env di layout server; email menjadi cadangan bila env kosong.
4. Tes `lib/admin-login.test.mjs`:
   - `adminalbana` dan `AdminAlbana ` (huruf besar dan spasi) dipetakan ke email admin;
   - username lain ditolak tanpa memanggil Supabase.

Admin kedua dengan username sendiri butuh kolom `admin_users.username` (unik) dan migrasi. Ini di luar revisi ini; catat bila pemilik memintanya.

- [ ] Masuk dengan `adminalbana` + kata sandi berhasil; dengan email juga berhasil
- [ ] Username salah dan kata sandi salah memberi pesan yang sama
- [ ] Menu avatar menampilkan `adminalbana`

### 3.8 Tombol kembali hanya di halaman detail · P1 · ⟶ butuh 3.4, 3.5

1. Buang tombol ← dari rail (3.4). Rail hanya berisi modul grup aktif.
2. `resolveAdminNav()` mengembalikan `isDetail = pathname !== module.href`. Contoh: `/admin/program/[slug]/edit` dan `/admin/artikel/baru`.
3. `PageHeader` menampilkan tombol bulat ← di kiri breadcrumb hanya bila `isDetail`. Tombol ini `Link` ke `module.href`, bukan `router.back()`, agar tujuannya pasti saat halaman dibuka dari bookmark. `aria-label="Kembali ke {Modul}"`.
4. Breadcrumb halaman detail: `Grup ⟶ Modul ⟶ {judul halaman}`. Judul diisi modul lewat `AdminPageTitle` (portal seperti `AdminPageActions`). Bila tidak diisi, dipakai "Detail".

- [x] Tes `lib/admin-nav.test.mjs` mencakup `isDetail` untuk halaman daftar, halaman detail, dan Dashboard
- [ ] Halaman daftar modul tidak punya tombol kembali; halaman detail punya, dan tujuannya halaman daftar modul

### 3.9 Mode gelap · P0 · ⟶ butuh 3.6

Penyebab yang sudah terbukti adalah warna langsung di 16 berkas. 3.6 menghapusnya. Periksa juga hal berikut, lalu perbaiki yang terbukti rusak:

| Periksa | Perbaikan bila rusak |
| --- | --- |
| `ThemeToggle` membaca kelas `dark` di `useEffect`, sehingga ikon salah sesaat dan galat lint | Baca lewat `useSyncExternalStore` pada `MutationObserver` kelas `<html>` |
| Kontrol bawaan peramban (scrollbar, `select`, `date`) tetap terang | `color-scheme: dark` pada `.dark .admin-shell, .dark body:has(.admin-shell)` |
| Portal Radix (dialog, dropdown, tooltip) memakai warna shadcn global, bukan token admin | Pastikan `body:has(.admin-shell)` menimpa `--popover`, `--card`, `--border` di tema gelap; uji tiap jenis portal |
| Toast `sonner` tidak mengikuti tema | `theme` dari kelas `<html>` |
| `app/(admin)/admin/loading.tsx` memakai `zinc-200/800` | Skeleton baru 3.10 memakai `--admin-surface-muted` |
| Kilat putih saat pindah halaman di tema gelap | Kanvas dari token pada `body:has(.admin-shell)`; tanpa `bg-white` di skeleton |

- [ ] Setiap modul Albana, login, dialog, dropdown, tooltip, dan toast diperiksa di tema gelap pada 360 dan 1280 px; tangkapan layar dilampirkan di PR
- [ ] Ganti tema tidak memuat ulang halaman dan tidak meninggalkan unsur terang
- [ ] Tema tersimpan setelah muat ulang, tanpa kilat tema salah

### 3.10 Navigasi sisi klien dan skeleton · P1 · ⟶ butuh 3.4

Shell (topbar, rail, kepala halaman) tetap terpasang saat berpindah modul. Hanya area konten yang berganti, lewat RSC payload, tanpa muat ulang dokumen.

1. Semua tautan internal admin memakai `next/link`. Grep `href="/admin`, `window.location`, `location.href`, dan `<a ` di modul Albana; ganti yang internal. Pengecualian: Keluar (`window.location.assign("/login")`) agar seluruh status klien terhapus.
2. Mutasi memakai Server Action + `revalidatePath`/`router.refresh()`, bukan muat ulang. Tombol simpan memakai `useTransition` untuk status sibuk.
3. `loading.tsx` per modul Albana, sesuai templatnya:

   | Skeleton | Modul |
   | --- | --- |
   | `SkeletonList` (T1 daftar: kapsul saring + 6 baris) | Pendaftar, Tagihan, Batch, Artikel, Rekening |
   | `SkeletonCards` (T1 kartu: grid 6 kartu) | Program, Trainer, Testimoni, Partner, Media, Galeri |
   | `SkeletonForm` (T2: 2 seksi × 4 field) | Profil akademi, Kontak, halaman edit/baru |
   | `SkeletonDashboard` (4 kartu statistik, grafik + peringkat, 3 panel bilah) | Dashboard |

   Tempatkan di `components/admin/ui/skeleton/`. Bentuknya meniru tata letak akhir agar tidak ada lompatan layout. Shimmer memakai CSS (3.3). Kepala halaman sudah berganti judul seketika dari `pathname`, sebelum data tiba.
4. Ganti `app/(admin)/admin/loading.tsx` lama dengan `SkeletonList`.
5. `prefetch` bawaan `Link` dibiarkan. Data tetap dibaca di server; guard di layout tidak dijalankan ulang per navigasi, tetapi setiap `page.tsx` dan action tetap memanggil guard.

- [ ] DevTools Network: pindah antar modul hanya memicu permintaan RSC (`?_rsc=`), tanpa permintaan dokumen
- [ ] Skeleton tampil seketika saat data lambat (uji throttling Slow 4G); topbar dan rail tidak berkedip
- [ ] CLS saat skeleton diganti isi ≤ 0,05
- [ ] Simpan data tidak memuat ulang halaman; daftar ikut berubah

### 3.11 Dashboard statistik · P1 · ⟶ butuh 3.6, 3.10

Menggantikan isi 4.2.3. Dashboard adalah halaman **statistik**: angka utama, tren, peringkat, dan komposisi peserta. Pekerjaan harian (tagihan yang perlu dicek, pendaftar baru) tetap di modul Tagihan dan Pendaftar; dashboard hanya menautkannya. Semua angka berasal dari tabel yang ada; tidak ada kolom baru. `batches` tidak punya kolom kuota, sehingga tidak ada persentase keterisian.

**Periode.** Segmen di kepala halaman: **30 hari · 90 hari · Tahun ini**, disimpan di URL (`?periode=30d|90d|ytd`), bawaan 30 hari. Semua batas waktu dalam WIB. Selisih dibandingkan dengan periode sebelumnya yang sama panjang.

**Baris 1 — kartu statistik (4 kartu):**

| Kartu | Angka utama | Chip selisih | Garis mini |
| --- | --- | --- | --- |
| Pendaftar | Jumlah `academy_registrations` dalam periode | `butter`: `+n` dibanding periode sebelumnya | Jumlah harian |
| Pembayaran terverifikasi | Total `total_idr`, `status = 'verified'`, `reviewed_at` dalam periode (angka bertingkat) | `butter`: `+x%` | Total harian |
| Tagihan menunggu | Jumlah + total rupiah `status = 'pending'` (tanpa periode) | `peach`: "tertua n hari" | — (tautan ↗ ke `/admin/tagihan?status=pending`) |
| Tingkat pelunasan | Persen pendaftar periode ini yang semua tagihannya `verified` | `mint` bila naik, `rose` bila turun | — |

**Baris 2 — tren dan peringkat:**

| Panel | Isi |
| --- | --- |
| Pendaftar per minggu (lebar 2/3) | Grafik area: garis `--admin-ink`, isi `butter`. Deret kedua (pembayaran terverifikasi per minggu) berupa garis `lilac` yang dapat dinyalakan dari legenda. 12 minggu terakhir, atau per bulan untuk "Tahun ini". Garis rata-rata putus-putus dengan label "Rata-rata n/minggu". |
| Batch teratas (lebar 1/3) | Tabel peringkat 5 batch menurut pendaftar aktif dalam periode. Kolom: peringkat (bulat hitam untuk #1), batch – program, pendaftar aktif, terverifikasi, chip `mint` "% lunas". |

Pendaftar aktif = butir `academy_registration_items` yang tagihannya bukan `rejected` atau `cancelled`.

**Baris 3 — komposisi peserta (3 panel bilah):**

Diolah dari `academy_registrations.answers` (lihat `buildRegistrationPayload` di `lib/registration-form.ts`). Hanya kunci berpilihan yang diagregasi; jawaban bebas (`goal`, `challenge`, `profession`, `institution`) **tidak** ditampilkan di dashboard.

| Panel | Kunci | Kelompok |
| --- | --- | --- |
| Sumber informasi | `source` | Instagram · WhatsApp · Teman/Kerabat · Lainnya |
| Usia | `age` | < 25 · 25–34 · 35–44 · ≥ 45 |
| Profil | `gender`, `priorExperience`, `paymentMethod` (kolom) | Tiga bilah terbelah: Perempuan/Laki-laki, Pernah/Belum pelatihan, Lunas/DP |

Setiap bilah memakai label kiri dan nilai `n% (jumlah)` di kanan dengan huruf mono kecil. Isi bilah `--admin-ink`, porsi kosong memakai pola diagonal. Panel menampilkan "Data belum cukup" bila n < 5, agar persentase tidak menyesatkan.

**Pendaftar per program** tampil sebagai bilah di bawah kartu Pendaftar saat kartu itu dibuka ↗ (bukan panel tetap).

Aturan teknis:

1. `page.tsx` server: `requireAdminMember()`, lalu baca baris mentah periode berjalan dan periode sebelumnya lewat `academyBillingClient()` secara paralel. Kolom yang dibaca: `id`, `received_at`, `payment_method`, `answers`, butir, dan tagihan. Hitungan tanpa baris memakai `count: "exact", head: true`.
2. Semua agregasi ada di fungsi murni `lib/server/admin-dashboard.ts` (`buildDashboardStats(rows, period, now)`) dengan tes `node --test`. Volume pendaftaran Albana kecil, jadi agregasi di server Node cukup. Pindah ke RPC SQL bila satu periode melebihi 5.000 baris.
3. Grafik area memakai `recharts` (sudah terpasang). Muat lewat `next/dynamic` di komponen klien `DashboardTrendChart`. Garis mini dan bilah memakai SVG/CSS biasa. Teks sumbu `--admin-text-secondary`; tanpa garis kisi vertikal.
4. Kartu masuk dengan `stagger` (3.3). Angka berubah dengan `DisplayNumber` (4.1e) hanya saat periode diganti.
5. Keadaan kosong: database tanpa pendaftar menampilkan kartu bernilai 0 dan satu ajakan "Belum ada pendaftar. Buka batch di Kelas ⟶ Batch".
6. Grafik punya ringkasan teks untuk pembaca layar, misalnya "12 minggu, tertinggi 9 pada minggu 3 November".
7. Data peserta di dashboard hanya berupa agregat; tidak ada nama atau kontak.

- [ ] Angka dashboard sama dengan hitungan manual SQL pada data uji 2.2 untuk ketiga periode
- [x] Tes `lib/server/admin-dashboard.test.mjs` lulus untuk: batas hari WIB, selisih periode, kelompok usia, ambang n < 5, dan pengecualian tagihan `rejected`/`cancelled`
- [ ] Ganti periode tanpa muat ulang (3.10); skeleton `SkeletonDashboard` meniru 3 baris di atas
- [ ] Ponsel 360 px: kartu 1 kolom, grafik dapat dibaca, tabel peringkat tanpa gulir horizontal

### Revisi admin UI #2 (16 November 2026)

Masukan pemilik setelah 3.6–3.11 terpasang. Desain rinci ada di [pola UI admin §3 dan §8.3](../design/admin-ui-patterns.md).

| # | Masukan | Langkah |
| --- | --- | --- |
| R7 | Satu sidebar berbasis grup dan sub-menu; hapus menu di header agar kursor tidak bolak-balik; gaya tetap | 3.12 |
| R8 | Hapus yang ditandai: pil grup di atas, rail ikon di kiri, dan judul modul ganda ("ARTIKEL") di bawah judul halaman | 3.12, 3.13 |
| R9 | Tabel lebih ramah: tipografi dan tata letak | 3.14 |
| R10 | Gerak kasar dan perpindahan lambat | 3.15 |

### 3.12 Satu sidebar · P1 · ⟶ butuh 3.4

> Diubah oleh 3.16: logo, tema, dan akun pindah kembali ke header; sidebar hanya berisi navigasi.

Ganti topbar pil + rail di `components/admin/shell/AdminShell.tsx` dengan sidebar [§3.1](../design/admin-ui-patterns.md).

1. `lib/admin-nav.ts`:
   - Grup tetap lima: Dashboard sebagai item tunggal, ditambah Pendaftaran, Kelas, Konten, dan Pengaturan.
   - Tambahkan `description` satu kalimat per modul untuk kepala halaman (3.13).
   - Buang `shortcuts` Dashboard.
2. Sidebar 264 px, panel `--admin-surface` radius 32 px mengambang 12 px.
   - **Kepala:** logo dan "Albana CMS".
   - **Isi:** Dashboard, lalu judul grup yang dapat dibuka/ditutup (`aria-expanded`). Grup berisi item pil 44 px; item aktif pil hitam yang meluncur (`layoutId`).
   - **Kaki:** akun (username, Keluar) dan tombol tema.
3. Lencana tagihan menunggu (`peach`) di item **Tagihan**; pindah ke judul grup bila Pendaftaran tertutup.
4. Keadaan grup:
   - grup yang memuat halaman aktif selalu terbuka;
   - grup lain mengingat keadaannya di `localStorage` (`admin-nav-open`), dibaca setelah hidrasi agar tidak ada ketidakcocokan render.
5. Responsif:
   - ≥ 1280 px: sidebar penuh;
   - 1024–1279 px: ringkas 80 px dengan tooltip, dan tombol ⟷ untuk membuka penuh (`admin-nav-compact`);
   - < 1024 px: bilah ringkas 64 px (menu, logo, avatar) dan laci dari kiri (`AnimatePresence`, Radix Dialog `forceMount`, tutup dengan Escape, ketuk di luar, atau setelah memilih).
6. Hapus `GroupPills`, `Rail`, `useTopbarHidden`, dan lembar bawah grup dari shell. Tes `lib/admin-nav.test.mjs` disesuaikan: lima grup, tanpa `shortcuts`, dan setiap modul punya `description`.

- [ ] Tidak ada navigasi di atas konten pada ≥ 1024 px; semua modul terjangkau dari sidebar dalam satu klik (grup terbuka) atau dua klik (grup tertutup)
- [ ] `aria-current`, `aria-expanded`, dan urutan Tab benar: logo → item → kaki → konten
- [ ] Laci ponsel: fokus terkunci di dalam laci, Escape menutup, fokus kembali ke tombol menu
- [ ] 360, 1024, 1280 px tanpa gulir horizontal; sidebar ringkas punya tooltip yang terbaca keyboard

### 3.13 Satu judul per halaman · P1 · ⟶ butuh 3.12

1. `PageHeader` menampilkan breadcrumb, judul 40/400, deskripsi modul 15 `--admin-text-secondary` (hanya halaman daftar), dan slot aksi kanan.
2. Di setiap modul Albana, hapus blok judul sendiri: `h1`, eyebrow, dan deskripsi yang mengulang judul halaman. Contoh yang ditandai: "ARTIKEL" + "Draf dan artikel yang sudah terbit…" di `/admin/artikel`.

   | Berkas | Blok yang dihapus |
   | --- | --- |
   | `app/(admin)/admin/page.tsx` | Sudah tidak ada (3.11) |
   | `pendaftar/page.tsx`, `pendaftar/PendaftarClient.tsx` | `h1` "Pendaftar Albana"/"Data Pendaftar" + deskripsi |
   | `tagihan/page.tsx` | `h1` "Tagihan Albana" + deskripsi |
   | `program/page.tsx`, `artikel/page.tsx` | `h1` uppercase + deskripsi |
   | `rekening/RekeningClient.tsx`, `kontak/KontakClient.tsx`, `profil-akademi/ProfilAkademiClient.tsx` | `h1` + deskripsi |
   | `media/page.tsx`, `media/MediaLibraryClient.tsx` | `h1` ganda |
   | `galeri/GaleriCMSClient.tsx`, `partner/PartnerClient.tsx` | `h1` + eyebrow |
   | `components/admin/cms/CmsCollectionClient.tsx` (Batch, Trainer, Testimoni) | `h1 {title}` + eyebrow |

3. (Diperluas oleh 3.17 menjadi bilah alat lengkap.) Tombol aksi utama modul (mis. "Tulis artikel", "Tambah program", "Tambah rekening") pindah ke kepala lewat `AdminPageActions` sebagai pil hitam berlabel, 15/500, huruf biasa. Kolom cari dan tombol saring yang sudah ada di modul ikut pindah ke slot yang sama bila letaknya di baris judul lama.
4. Deskripsi yang memuat aturan penting (mis. Tagihan: "Cocokkan bukti … sebelum memverifikasi") dipindah ke `description` modul di `lib/admin-nav.ts`, bukan dibuang.

Grep pemeriksa:

```bash
grep -rnE '<h1' "front/app/(admin)/admin/"{pendaftar,tagihan,rekening,kontak,profil-akademi,program,batch,trainer,artikel,media,galeri,testimoni,partner} front/components/admin/cms
```

- [ ] Grep di atas kosong; satu `h1` per halaman, dari `PageHeader`
- [ ] Setiap aksi utama yang dulu ada di baris judul modul masih dapat dijangkau dari kepala halaman

### 3.14 Tabel · P1 · ⟶ butuh 3.6

Satu komponen tabel bersama mengikuti [pola UI admin §8.3](../design/admin-ui-patterns.md): kepala tabel abu bersudut 16 px, baris di atas kanvas dipisah garis tipis, tanpa kartu pembungkus, tanpa garis vertikal, tanpa huruf kapital pada judul kolom.

1. `components/admin/ui/data-table.tsx`:
   - **Bagian tabel:** `DataTable` (wadah + `caption` sr-only), `DataTableHead`, `Th` (`align`, `sort`), `Tr` (`onOpen`), dan `Td` (`align`, `muted`).
   - **Isi sel:** `CellIdentity` (judul 14/500 + meta 13), `CellDate` (WIB, relatif < 24 jam), `CellMoney` (angka bertingkat), `CellAction` (tombol ikon 36 px atau menu ⋯), dan `StatusChip` (4.1d).
   - **Kelas:** semua kelas ada di komponen. Modul tidak menulis kelas `th`/`td`.
2. Terapkan ke semua tabel Albana: Pendaftar (`page.tsx` dan `PendaftarClient.tsx`), Tagihan, Rekening, Program, Artikel, Galeri, Partner, dan tabel generik `CmsCollectionClient` (Batch, Trainer, Testimoni). Tabel "Batch teratas" di dashboard memakai `CellIdentity` dan `StatusChip` yang sama.
3. Chip status jadi huruf biasa dengan titik: "Draf" (abu), "Terbit" (`mint`), "Menunggu" (`peach`), "Ditolak" (`rose`). Hapus chip uppercase 10–11 px yang ada.
4. Ponsel < 768 px: baris menjadi kartu bertumpuk (§8.1), memakai data yang sama, tanpa gulir horizontal.
5. Hapus aturan CSS global `.admin-shell table/th/td` (sementara, dari 3.15) setelah semua tabel memakai `DataTable`. Aturan global mengubah tabel di luar daftar data dan sulit dikendalikan per kolom.

- [ ] Grep `<table` di modul Albana hanya menemukan `data-table.tsx`
- [ ] Judul kolom tanpa uppercase; angka dan rupiah rata kanan `tabular-nums`; tanggal satu format WIB
- [ ] Teks panjang terpotong dengan `title`; baris tetap 64/72 px
- [ ] Keyboard: baris yang dapat dibuka menerima fokus dan Enter; aksi ⋯ dapat dibuka dengan keyboard
- [ ] 360 px: kartu bertumpuk tanpa gulir horizontal; 1280 px: tidak ada kolom terpotong pada data uji

### 3.15 Navigasi ringan · P0 · ⟶ butuh 3.10

Diukur dari log server dev: setiap pindah halaman menghabiskan 200–700 ms di `proxy.ts` (`getUser()` ke server Auth + kueri `admin_users`), lalu guard di layout dan halaman mengulang keduanya. Perbaikan (sudah ditulis, belum di-commit pada saat revisi ini):

1. `proxy.ts`: hanya `getClaims()` (verifikasi JWT lokal, sekaligus menyegarkan cookie). Pemeriksaan `admin_users` pindah sepenuhnya ke guard.
2. `lib/server/admin-guard.ts`: `requireAdminMember()` memakai `getClaims()` dan `cache()` React, sehingga layout, halaman, dan action berbagi satu pemeriksaan per permintaan.
3. `components/ui/SmoothScroll.tsx`: Lenis dan penelusuran DOM per roda gulir tidak berjalan di `/admin` dan halaman auth. Bug ikutan ikut diperbaiki: ticker GSAP tidak pernah dilepas.
4. Motion: `domMax` dimuat sinkron (pemuatan async membuat animasi pertama melompat). Kepala halaman tidak lagi menunggu animasi keluar. `template.tsx` memudarkan isi halaman 160 ms (`opacity` saja).
5. Hapus `components/motion/features.ts` yang tidak terpakai.
6. Perbarui `front/AGENTS.md`: proxy hanya memeriksa sesi; `admin_users` diperiksa guard.

- [ ] Build produksi: pindah antar modul ≤ 300 ms sampai skeleton atau isi tampil (DevTools, tanpa throttling)
- [ ] Pengguna login yang bukan admin tetap ditolak di setiap halaman dan action admin
- [ ] Gulir admin memakai gulir bawaan peramban; beranda tetap memakai Lenis
- [ ] DevTools Performance: tidak ada frame panjang > 50 ms saat pindah modul

### Revisi admin UI #3 (16 November 2026)

Masukan pemilik setelah 3.12–3.15 terpasang. Desain rinci: [pola UI admin §3.1–§3.4, §8.2, §8.7](../design/admin-ui-patterns.md).

| # | Masukan | Langkah |
| --- | --- | --- |
| R11 | Header tetap ada untuk logo, mode tema, dan pengguna | 3.16 |
| R12 | Teks item aktif sidebar tidak terlihat | 3.16 |
| R13 | Tambah data, ekspor data, dan tombol yang dibutuhkan per tabel; ubah dan hapus di setiap baris sebagai templat | 3.17, 3.18 |
| R14 | Menu Pendaftaran hanya tombol ekspor | 3.17 |

### 3.16 Header dan warna item aktif · P1 · ⟶ butuh 3.12

1. Kembalikan header 72 px di atas sidebar dan konten (§3.1):
   - kiri: logo dan "Albana CMS";
   - kanan: tombol tema, lalu avatar + username yang membuka menu Keluar;
   - tanpa pil grup atau tautan modul.

   Di bawah 1024 px, tombol ☰ di header membuka laci sidebar, menggantikan bilah ringkas 64 px dari 3.12.
2. Sidebar (§3.2) tidak lagi memuat logo, tema, dan akun. Kakinya hanya tombol ⟷. Sidebar lengket di bawah header (`top` = 72 + 12 px), dengan tinggi `calc(100vh - 72px - 24px)`.
3. **Warna item aktif.** Gejala: pada item aktif hanya ikon putih yang tampil, labelnya tidak terlihat (tangkapan layar pemilik, item Pendaftar).
   - Perbaikan: label dan ikon item aktif diberi kelas `text-admin-on-ink` langsung, bukan warisan dari `Link`, serta `relative z-[1]` di atas pil `layoutId`.
   - Periksa penyebabnya sebelum memperbaiki: kelas `sr-only` pada mode `auto`, warna `a` global, dan urutan tumpukan pil. Catat penyebab yang terbukti di pesan commit.
4. `aria-label` tombol pengguna: "Menu akun {username}".

- [ ] Label item aktif terbaca (kontras ≥ 4,5:1) di tema terang dan gelap, pada mode penuh, ringkas (tooltip), dan laci
- [ ] Header tidak memuat navigasi modul; tema dan Keluar berfungsi dari header di 360, 1024, dan 1280 px
- [ ] Sidebar tidak tertutup header saat halaman digulir

### 3.17 Bilah alat dan aksi baris · P1 · ⟶ butuh 3.14, 3.16

Satu templat untuk semua tabel admin (§8.2). Modul hanya memilih tombol lewat konfigurasi, tidak menulis tombol sendiri.

1. `components/admin/ui/table-toolbar.tsx` — `TableToolbar`, dirender ke kepala halaman lewat `AdminPageActions`. Prop:
   - `search?`: `{ placeholder }`, menulis `?q=`;
   - `filters?`: daftar pilihan, menulis `?status=`, `?program=`, `?batch=`;
   - `exportModule?`: nama modul untuk 3.18;
   - `create?`: `{ label, href }` atau `{ label, onClick }`.

   Urutan tetap: Cari · Saring · Ekspor · Tambah.
2. `components/admin/ui/row-actions.tsx` — `RowActions`. Prop:
   - `onEdit` atau `editHref`;
   - `onDelete` + `itemName`; tombol hapus hanya untuk `adminsuper`;
   - `extra?`: aksi khusus, misalnya Aktifkan atau Terbitkan.

   Hapus selalu lewat `ConfirmDialog` (§6) berisi nama data dan kalimat "Tindakan ini tidak dapat dibatalkan". Ganti `ProgramRowActions`, tombol baris di `CmsCollectionClient`, dan tombol di `RekeningClient` dengan komponen ini.
3. Terapkan matriks §8.2 ke setiap modul:

   | Modul | Bilah alat | Aksi baris |
   | --- | --- | --- |
   | Pendaftar | Ekspor saja | Tidak ada (baris tetap dapat dibuka untuk detail, 2.1) |
   | Tagihan | Ekspor saja | Verifikasi · Tolak (alur yang ada) |
   | Program | Cari · Ekspor · Tambah program | Ubah (halaman) · Hapus · Tambah batch |
   | Batch | Cari · Saring (program, status) · Ekspor · Tambah batch | Ubah · Hapus · Buka/tutup pendaftaran |
   | Trainer | Cari · Ekspor · Tambah trainer | Ubah · Hapus |
   | Artikel | Cari · Saring (draf/terbit) · Ekspor · Tulis artikel | Ubah (halaman) · Hapus |
   | Media | Cari · Saring (program, status) · Unggah media | Ubah · Hapus · Terbitkan/Tarik |
   | Galeri | Cari · Tambah gambar | Ubah · Hapus |
   | Testimoni | Cari · Saring (draf/terbit) · Ekspor · Tambah testimoni | Ubah · Hapus · Terbitkan/Tarik |
   | Partner | Cari · Ekspor · Tambah partner | Ubah · Hapus · Terbitkan/Tarik |
   | Rekening | Tambah rekening | Ubah · Hapus · Aktifkan |

4. **Menu Pendaftaran** (Pendaftar, Tagihan): hapus semua tombol Tambah, Ubah, dan Hapus. Pastikan juga tidak ada Server Action tulis yang dapat dipanggil untuk `academy_registrations` dari modul ini.
   - Saringan per batch dan status tagihan dari 2.1 tetap tersedia lewat URL, tetapi tidak tampil sebagai tombol di bilah alat.
   - Tampilannya berupa tab saring di atas tabel (pola §2.1 aturan 5), karena pemilik meminta tombolnya hanya Ekspor.
5. Hapus kolom cari dan tombol tambah lama di modul yang dipindah ke bilah alat (`CmsCollectionClient`, Program, Artikel, Rekening), termasuk tombol mengambang di ponsel.

- [ ] Setiap modul menampilkan tepat tombol pada matriks; Pendaftar dan Tagihan hanya Ekspor
- [ ] Ubah membuka formulir terisi; Hapus selalu lewat konfirmasi dan hanya tampil untuk `adminsuper`
- [ ] Cari dan Saring tersimpan di URL dan ikut terbawa ke Ekspor
- [ ] Keyboard: Tab melewati Cari → Saring → Ekspor → Tambah, lalu aksi baris per baris

### 3.18 Ekspor CSV · P1 · ⟶ butuh 3.17

1. `lib/admin-export.ts` (fungsi murni, diuji `node --test`):
   - definisi kolom per modul;
   - `toCsv(rows, columns)` menghasilkan UTF-8 dengan BOM, pemisah koma, dan kutipan RFC 4180;
   - sel yang diawali `=`, `+`, `-`, `@`, tab, atau CR diberi awalan `'`.
2. `app/api/admin/export/[module]/route.ts`:
   - menjalankan `requireAdminMember()` dan mengembalikan 401 bila gagal;
   - menerima parameter saringan yang sama dengan halaman;
   - mengembalikan `Content-Type: text/csv; charset=utf-8` dan `Content-Disposition: attachment; filename="albana-{modul}-{tanggal}.csv"`;
   - batas 5.000 baris, dengan 413 dan pesan bila terlampaui.

   Tambahkan rute ini ke daftar izin `lib/albana-routes.ts` dan tesnya.
3. Kolom per modul:

   | Modul | Kolom |
   | --- | --- |
   | Pendaftar | Masuk (WIB), nama, email, WhatsApp, program/bundling, batch, metode bayar, status tagihan, total, ditambah jawaban formulir: panggilan, domisili, usia, jenis kelamin, profesi, instansi, pengalaman, tujuan, tantangan, sumber |
   | Tagihan | Dibuat, nama, program – batch, tahap, subtotal, kode unik, total, status, diperiksa oleh, diperiksa pada |
   | Program | Nama, harga, harga coret, jumlah materi, jumlah batch |
   | Batch | Judul, program, sesi pertama, jumlah sesi, harga, pendaftaran dibuka, aktif |
   | Trainer | Nama, keahlian, bio |
   | Artikel | Judul, status, terbit, diperbarui, slug |
   | Testimoni | Nama, peran, kutipan, terbit |
   | Partner | Nama, terbit, urutan |

   Tanpa `idempotency_key`, `submission_hash`, token, dan kunci apa pun.
4. Tombol Ekspor menampilkan "Menyiapkan…" selama unduhan dan toast "Ekspor siap" setelahnya. Galat ditampilkan sebagai toast `rose`.

- [ ] Tes `lib/admin-export.test.mjs`: koma, kutip, baris baru, BOM, dan injeksi rumus
- [ ] Ekspor tanpa sesi admin → 401; dengan sesi bukan admin → 403 atau 401
- [ ] Berkas terbuka benar di Excel dan Google Sheets (huruf beraksen, rupiah, tanggal WIB)
- [ ] Hasil ekspor mengikuti saringan yang aktif

---

## Fase 4 — Komponen dan modul admin

### 4.1 Komponen dasar · P1 · ⟶ butuh Fase 3

Di `components/admin/ui/`, memakai primitif `components/ui/*`:

| # | Komponen | Acuan | Gerak (3.3) |
| --- | --- | --- | --- |
| a | `Card`, `SpotlightCard` | §2.3, §4.2 | Masuk `stagger`; sorotan `drag="x"` + `AnimatePresence` |
| b | `RoundButton`, `PillButton` (menyusut → spinner → centang) | §6.4, §7.7 | `whileTap` + `spring`; urutan state lewat `useAnimate()` + `animate()` (lebar → spinner → centang), spinner CSS |
| c | `FilterCapsule` | §8.2 | Kapsul aktif `layoutId` unik per instans (`useId()`) |
| d | `StatusChip`, `Dot`, `DeltaChip` | §5 T1 | CSS saja. Nada lembut sesuai makna (3.6): `peach` menunggu, `mint` terverifikasi/terbit, `rose` ditolak, `lilac` draf |
| e | `DisplayNumber` | §2.2 | Digit `AnimatePresence initial={false}` |
| f | Field pil: input, textarea, select, segmen, switch, rupiah, persen | §7 | Segmen `layoutId`; switch `layout` + `spring`; lainnya CSS |
| g | `RepeatRows` | §7.5 | Baris `layout` + `AnimatePresence mode="popLayout"` saat tambah/hapus; urut ulang `Reorder` + tombol panah untuk keyboard |
| h | `UploadZone` | §7.6 | Progres `scaleX`; pratinjau masuk `opacity` |
| i | `SaveBar` | §7.7 | `AnimatePresence`, `y 100%→0` saat ada perubahan |
| j | `AdminDialog`, `ConfirmDialog`, lembar bawah | §6 | Radix `forceMount` di dalam `AnimatePresence`; lembar bawah `drag="y"` tutup saat ditarik |
| k | `SidePanel` | §5 T3 | `AnimatePresence`, `x 100%→0`, keluar lebih cepat |
| l | `DataTable` (3.14), `TableToolbar`, `RowActions` (3.17), `Pagination` | §8.2–§8.3 | Tanpa gerak (§4.3: tidak ada gerak pada hasil saring dan ganti halaman) |
| m | `SkeletonList`, `SkeletonCards`, `SkeletonForm`, `SkeletonDashboard` (3.10), `EmptyState`, `ErrorState` | §9 | Shimmer CSS; ganti skeleton → isi `opacity` |
| n | Toast kapsul (`sonner`) | §10 | Bawaan `sonner` |

- [ ] a–n selesai, diuji keyboard dan reduced motion
- [ ] Tidak ada `layoutId` ganda saat komponen yang sama muncul dua kali di satu halaman

### 4.2 Modul · P1 · ⟶ butuh 4.1

| # | Modul | Templat | Tabel |
| --- | --- | --- | --- |
| 4.2.1 | Tagihan | T1 + T3 + konfirmasi | `academy_invoices`, `academy_registrations`, `bank_accounts` |
| 4.2.2 | Pendaftar | T1 + T3 | `academy_registrations`, `academy_registration_items` |
| 4.2.3 | Dashboard | Statistik (3.11) | `academy_invoices`, `academy_registrations`, `academy_registration_items`, `batches`, `programs` |
| 4.2.4 | Program (+ bundling) | T1 kartu + T2 | `programs`, `bundle_offers` |
| 4.2.5 | Batch | T1 + T2 | `batches` (sesi di `batches.sessions` JSONB) |
| 4.2.6 | Trainer | T1 kartu + Dialog M | `trainers` |
| 4.2.7 | Artikel | T1 + T2 editor | `articles` |
| 4.2.8 | Media, Galeri | T1 grid + Dialog unggah | `media_assets`, `gallery` |
| 4.2.9 | Testimoni | T1 kartu + Dialog M | `testimonials` (`attribution`, `quote`, `role_label`, `photo_url`, `published`) |
| 4.2.10 | Partner | T1 kartu + Dialog S | `academy_partners` |
| 4.2.11 | Profil akademi | T2 ringkas | `academy` |
| 4.2.12 | Kontak | T2 ringkas | `contact_channels` |
| 4.2.13 | Rekening | T1 + Dialog S | `bank_accounts` |
| 4.2.14 | Login | Kartu tengah, field Username (3.7) | — |

Untuk setiap modul:

- [ ] Templat dan komponen sesuai
- [ ] Skeleton, kosong (3 jenis), galat
- [ ] Guard di halaman dan action
- [ ] Ponsel 360 px
- [ ] Checklist [pola UI admin §13](../design/admin-ui-patterns.md) lulus

### 4.3 Pengalihan · P1

`/admin/bundling` → `/admin/program`; `/admin/settings` → `/admin/kontak`.

- [ ] Bookmark lama tidak 404

---

## Fase 5 — Landing page

### 5.1 Mesin gerak · P1

1. `lib/motion/scroll.ts`: Lenis (pointer halus saja) + sinkron ScrollTrigger.
2. G1–G7 dua arah sesuai [konten beranda §1.3](../content/home-page-content.md).
3. `motion-ready` sebelum paint pertama.
4. Reduced motion: fade 150 ms satu arah, tanpa Lenis dan scrub.
5. Gabungkan `ScrollAnimationInit.tsx`, `SmoothScroll.tsx`, `section-reveal.tsx` menjadi satu jalur.
6. Motion di beranda hanya untuk elemen yang masuk/keluar DOM: dialog profil trainer (5.3.5), menu ponsel (5.2), lightbox dokumentasi (5.3.4). Pakai `AnimatePresence` dengan provider 3.3 yang dimuat bersama komponen itu, bukan di layout beranda. Gerak gulir tidak memakai `whileInView`, `useScroll`, atau `scroll()`.

- [ ] Satu mesin gulir (GSAP + Lenis); `grep -rn "useScroll\|whileInView" components/home` kosong
- [ ] Konten terlihat tanpa JavaScript
- [ ] Gulir naik-turun cepat lancar di ponsel kelas menengah

### 5.2 Header · P1 · ⟶ butuh 5.1

Menu Program · Tentang · Trainer · Jadwal · Kontak; **Lihat jadwal**; tema; sembunyi saat turun, muncul saat naik; garis kemajuan; penanda bab aktif. Sembunyi/muncul dan garis kemajuan memakai ScrollTrigger (5.1); menu ponsel buka/tutup memakai `AnimatePresence`; penanda bab aktif `layoutId`.

- [ ] Header tetap muncul saat fokus keyboard di dalamnya

### 5.3 Seksi · P1 · ⟶ butuh 5.1

Urutan render di `components/home/home-page.tsx` mengikuti [layout §1](../design/academy-landing-layout.md); teks dari konten beranda.

| # | Seksi | Data |
| --- | --- | --- |
| 5.3.1 | Hero + pita manfaat | Statis |
| 5.3.2 | Program (3 kartu + Inhouse) + bukti proses | `programs`, `batches`, `bundle_offers`, `media_assets` |
| 5.3.3 | Tentang + cara belajar + pernah melatih | Statis + `academy` + `academy_partners` |
| 5.3.4 | Testimoni + dokumentasi | `testimonials` (terbaru = unggulan), `gallery` |
| 5.3.5 | Trainer + dialog profil | `trainers` |
| 5.3.6 | Jadwal & biaya | `batches` |
| 5.3.7 | Tiga langkah + dua jalur | Statis |
| 5.3.8 | Ajakan + kontak + footer | `contact_channels` |

Setiap seksi:

- [ ] Teks sama persis dengan konten beranda
- [ ] Keadaan kosong sesuai naskah; seksi tanpa data hilang beserta tautannya
- [ ] Gerak dua arah sesuai resep
- [ ] 320, 390, 834, 1440 px
- [ ] Tanpa butir larangan [konten §1.4](../content/home-page-content.md)

### 5.4 Halaman program dan pendaftaran · P1

1. `/program/[slug]`: detail, foto batch, video; Inhouse: dokumentasi + partner + CTA konsultasi.
2. `/register/[program]` dan `/register/konfirmasi/[token]` sesuai [konten §11](../content/home-page-content.md).

- [ ] Inhouse tanpa formulir
- [ ] Konfirmasi menampilkan “{program/bundling} – {batch}”, subtotal, kode unik, total

### 5.5 Media nyata · P1

Unggah dan terbitkan media berizin lewat `/admin/media` dan `/admin/galeri`; hapus penanda dummy hanya pada slot yang terganti.

- [ ] Tidak ada `images/preview/` tampil sebagai dokumentasi
- [ ] Setiap media punya alt

---

## Fase 6 — Pembersihan kode warisan

Tabelnya sudah dihapus, sehingga kode berikut kini **patah saat dibuka**, bukan sekadar tidak terpakai.

### 6.1 Rute yang membaca tabel terhapus · P0

Hapus folder: `acara`, `admins`, `affiliate-payout`, `aktivitas`, `attendance`, `cms-akademi`, `cms-komunitas`, `confirmation`, `funnel`, `logs`, `members`, `mentoring`, `packages`, `payment`, `referral`, `resources`, `revenue`, `roles`, `sidebar-layout`, `transactions`, `venue`, `voucher` di `app/(admin)/admin/`; `app/(checkout)`, `app/(form)`, `app/myprofile`, `app/preview-email`, `app/api/member`, `app/api/portfolio`.

- [ ] Perintah grep di 1.2 kosong
- [ ] `npm run build` lulus

### 6.2 Komponen, aksi, dan gaya · P2

`components/{community,member,galeri,kolaborasi,landing,tentang}`, `components/admin/{PackageForm,EventGalleryModal}.tsx`, `components/admin/dashboard/**` lama, `lib/actions/*` yang tak dirujuk, `app/globals-pangkre.css`.

- [ ] `npm run build` lulus setelah tiap kelompok
- [ ] Galat lint turun dari baseline 542

### 6.3 `proxy.ts` · P1

Hapus logika subdomain `panggungkreator.web.id` dan pengalihan `/register`, `/myprofile`; pertahankan penyegaran sesi dan perlindungan `/admin`.

- [ ] `/register` dan `/login` tidak dialihkan di domain produksi

### 6.4 Dependensi · P2

Hapus `groq-sdk`, `nodemailer`, `@types/nodemailer`, `resend`, `@hello-pangea/dnd` (`RepeatRows` memakai `Reorder` dari Motion). Pertahankan `gsap`, `lenis`, `motion`, `tw-animate-css`, `recharts` (grafik dashboard 3.11).

- [ ] `npm run build` lulus

---

## Fase 7 — QA · P0

### 7.1 Fungsional

- [ ] Skenario 2.2 diulang pada build produksi
- [ ] CRUD semua modul; hapus hanya `adminsuper`
- [ ] Unggah gambar dan MP4 nyata; terbit/tarik
- [ ] Draf artikel tidak terbuka publik

### 7.2 Keamanan

- [ ] Advisor keamanan hanya menyisakan INFO yang disengaja (`academy_*` tanpa kebijakan)
- [ ] Anon key tidak membaca `academy_registrations`, `academy_invoices`, `bank_accounts`, `admin_users`
- [ ] Setiap Server Action memanggil guard
- [ ] Tidak ada rahasia di `.next/static`

### 7.3 Tampilan dan aksesibilitas

- [ ] Beranda dan admin di 320/360, 390, 768/834, 1280/1440 px, kedua tema
- [ ] Keyboard saja: navigasi, pendaftaran, dialog admin
- [ ] Zoom 200%, reduced motion
- [ ] Kontras diukur dengan alat (teks abu admin, `--admin-danger`, kedua tema)

### 7.4 Kinerja

- [ ] LCP ponsel ≤ 2,5 detik; CLS ≤ 0,1
- [ ] Gulir naik-turun di ponsel kelas menengah tanpa tersendat berulang
- [ ] Ganti grup rail, buka/tutup panel samping, dan usap kartu sorotan berulang cepat: animasi terputus mulus, tanpa frame panjang > 50 ms di DevTools Performance

---

## Fase 8 — Rilis · P0

Data tetap di proyek Supabase yang sama.

1. Pastikan paket Hostinger menjalankan Next.js/Node dan menerima unggahan ≥ 26 MiB.
2. Pasang variabel lingkungan yang sama dengan `front/.env` di hosting, termasuk `SUPABASE_ADMIN_USERNAME=adminalbana` (3.7).
3. Deploy; uji asap: beranda, satu pendaftaran uji, satu verifikasi.
4. Hapus data uji; alihkan domain.

- [ ] [Gerbang rilis PRD §10](../project/product-requirements.md) terpenuhi
- [ ] Domain aktif dengan HTTPS

---

## Keputusan pemilik

| Keputusan | Memblokir |
| --- | --- |
| Data rekening aktif | 1.3, 2.2, rilis |
| Izin nama/logo instansi “Pernah melatih” | 5.3.3 |
| Testimoni berizin | 5.3.4 |
| Foto/video tiap slot | 5.5 |
| Harga dan batch Sertifikasi, harga bundling | Bundling |
| Paket hosting dan domain | Fase 8 |

## Risiko

| Risiko | Mitigasi |
| --- | --- |
| Tenggat 17 November tidak cukup untuk Fase 3–5 | Rilis dengan jalur minimum; admin gaya lama dan beranda sekarang dulu |
| Rute warisan patah dapat dibuka lewat URL | 6.1 masuk jalur minimum |
| Gerak dua arah membebani ponsel | Uji gugur per seksi; turunkan ke G3 |
| Kunci service role pernah bernama `NEXT_PUBLIC_` | Di luar cakupan rencana ini atas keputusan pemilik; catat sebagai risiko terbuka |
