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

Di `app/globals.css`, ganti token admin biru pada `.admin-shell` dan `.dark .admin-shell` dengan [pola UI admin §2](../design/admin-ui-patterns.md) (warna, radius, ruang, bayangan, pola diagonal) dan token gerak §4.1. Arahkan `--primary`, `--ring`, `--border` scope admin ke token baru.

- [ ] Tidak ada `#26599A`, `#DCEBFA`, `#EDF4FB`, `#F4F8FC` di aturan `.admin-shell`
- [ ] Beranda tidak berubah (tangkapan layar sebelum/sesudah)

### 3.2 Poppins · P1

Muat Poppins 300/400/500/600 hanya untuk `(admin)` dan `(auth)` lewat `next/font/google` di layout server pembungkus; pasang sebagai `--font-admin`.

- [ ] Admin Poppins; beranda tetap Plus Jakarta Sans + Inter
- [ ] Tanpa pergeseran layout saat font dimuat

### 3.3 Shell topbar pil + rail · P1 · ⟶ butuh 3.1, 3.2

Ganti `app/(admin)/admin/layout.tsx`:

1. Ubah konstanta `groups` menjadi lima grup pil: **Dashboard · Pendaftaran · Kelas · Konten · Pengaturan**, dengan modul per grup sesuai [pola UI admin §3.2](../design/admin-ui-patterns.md). Daftar tetap di kode (tabel `privilege_*` sudah tidak ada).
2. Topbar: tombol logo bulat, lima pil (aktif meluncur), tema, avatar (Profil, Keluar).
3. Rail kiri: tombol bulat per modul + tombol kembali; tooltip; masuk dengan spring.
4. Lencana kuning pada pil Pendaftaran = jumlah `academy_invoices` berstatus `pending`.
5. Responsif §3.4.

- [ ] Semua modul Albana terjangkau
- [ ] `aria-current` benar; keyboard melewati pil lalu rail
- [ ] 360, 768, 1280 px tanpa gulir horizontal

### 3.4 Kepala halaman bersama · P1 · ⟶ butuh 3.3

`components/admin/PageHeader.tsx`: breadcrumb `Grup ⟶ Modul`, judul 44/400, tombol bulat Saring · Cari · Aksi utama.

- [ ] Dipakai semua modul Albana

---

## Fase 4 — Komponen dan modul admin

### 4.1 Komponen dasar · P1 · ⟶ butuh Fase 3

Di `components/admin/ui/`, memakai primitif `components/ui/*`:

| # | Komponen | Acuan |
| --- | --- | --- |
| a | `Card`, `SpotlightCard` | §2.3, §4.2 |
| b | `RoundButton`, `PillButton` (menyusut → spinner → centang) | §6.4, §7.7 |
| c | `FilterCapsule` | §8.2 |
| d | `StatusChip` | §5 T1 |
| e | `DisplayNumber` | §2.2 |
| f | Field pil: input, textarea, select, segmen, switch, rupiah, persen | §7 |
| g | `RepeatRows` | §7.5 |
| h | `UploadZone` | §7.6 |
| i | `SaveBar` | §7.7 |
| j | `AdminDialog`, `ConfirmDialog`, lembar bawah | §6 |
| k | `SidePanel` | §5 T3 |
| l | `DataList`, `Pagination` | §8 |
| m | `SkeletonGrid`, `EmptyState`, `ErrorState` | §9 |
| n | Toast kapsul (`sonner`) | §10 |

- [ ] a–n selesai, diuji keyboard dan reduced motion

### 4.2 Modul · P1 · ⟶ butuh 4.1

| # | Modul | Templat | Tabel |
| --- | --- | --- | --- |
| 4.2.1 | Tagihan | T1 + T3 + konfirmasi | `academy_invoices`, `academy_registrations`, `bank_accounts` |
| 4.2.2 | Pendaftar | T1 + T3 | `academy_registrations`, `academy_registration_items` |
| 4.2.3 | Dashboard | T4 | Agregat dari tiga tabel di atas + `batches` |
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
| 4.2.14 | Login | Kartu tengah | — |

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

- [ ] Satu mesin gulir
- [ ] Konten terlihat tanpa JavaScript
- [ ] Gulir naik-turun cepat lancar di ponsel kelas menengah

### 5.2 Header · P1 · ⟶ butuh 5.1

Menu Program · Tentang · Trainer · Jadwal · Kontak; **Lihat jadwal**; tema; sembunyi saat turun, muncul saat naik; garis kemajuan; penanda bab aktif.

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

Hapus `groq-sdk`, `nodemailer`, `@types/nodemailer`, `resend`, `recharts` (bila dashboard baru tidak memakai), `@hello-pangea/dnd` (bila `RepeatRows` tidak memakai).

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
- [ ] Kontras diukur dengan alat (chip kuning, teks abu admin)

### 7.4 Kinerja

- [ ] LCP ponsel ≤ 2,5 detik; CLS ≤ 0,1
- [ ] Gulir naik-turun di ponsel kelas menengah tanpa tersendat berulang

---

## Fase 8 — Rilis · P0

Data tetap di proyek Supabase yang sama.

1. Pastikan paket Hostinger menjalankan Next.js/Node dan menerima unggahan ≥ 26 MiB.
2. Pasang variabel lingkungan yang sama dengan `front/.env` di hosting.
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
