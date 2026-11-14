# Langkah 2 — Inventaris Rute Admin dan Bukti Perbaikan

Tanggal: 11 November 2026
Cakupan: `front/app/(admin)/admin` dan `front/components/admin`
Rujukan: [design system admin](../../design/admin-design-system.md) §2 warna, §6.2 field, §6.5 umpan balik; [komponen style-line](../../../../front/components/ui/style-line)

## 1. Legenda kolom

- **Entri** — kontrol yang menulis data (tombol tambah/ubah).
- **Filter** — kontrol baca saja yang menyaring daftar.
- **Berkas** — unggah/pilih gambar atau unduhan.
- **Kosong/loading/galat** — keadaan yang terlihat operator.
- **Fokus awal** — ke mana fokus bergerak saat form/modal dibuka.
- **Aksi utama** — satu tombol aksi yang dominan di layar.

## 2. Peta rute (status setelah Langkah 2)

| Rute | Entri | Filter | Berkas | Kosong / loading / galat | Fokus awal | Aksi utama | Status |
|---|---|---|---|---|---|---|---|
| `/admin` (dashboard) | — | — | — | kartu statistik | — | navigasi cepat | belum disentuh (di luar 2.4) |
| `/admin/program` | CMS `Tambah` → modal | — | — | `emptyText` "Belum ada program." | field pertama di dialog (Radix) | `Tambah` / `Simpan` (biru) | CmsCollectionClient ✓ |
| `/admin/batch` | CMS `Tambah`/`Ubah` → modal | — | — | daftar sesi kosong → galat field | field sesi pertama yang salah | `Tambah` / `Simpan` (biru) | CmsCollectionClient ✓ diuji |
| `/admin/artikel` | CMS `Tambah`/`Ubah` → modal | — | editor khusus | `emptyText` | field pertama di dialog | `Tambah` / `Simpan` (biru) | CmsCollectionClient ✓ |
| `/admin/trainer` | CMS `Tambah`/`Ubah` → modal | — | — | `emptyText` "Belum ada trainer." | field `Nama trainer` | `Tambah` / `Simpan` (biru) | CmsCollectionClient ✓ |
| `/admin/galeri` (daftar) | pilih + hapus massal | `Cari judul dokumentasi` (aria-label), filter kategori/status | — | `emptyText` | — | `Tambah Gallery` | search + checkbox ajaib; Select sudah Radix ✓ |
| `/admin/galeri/addGallery` | form | acara (SelectLine-style Radix), kategori | unggah gambar | galat di bawah field | field acara | `Simpan` (biru) | field teks/tanggal/tautan → Line ✓ |
| `/admin/acara` (daftar) | `Tambah Acara` | `Cari acara atau venue`, tipe, status, urutan (Radix, aria-label) | — | daftar kosong + filter kosong | — | `Tambah Acara` | search + Select ✓ |
| `/admin/acara/create` | form | — | — | banner galat di atas field | — | `Simpan Acara` (biru) | judul/deskripsi → Line; combobox tipe & venue tetap khusus + label terhubung ✓ |
| `/admin/acara/[id]` | tombol ubah/hapus | — | — | detail kosong | — | `Ubah Acara` | belum disentuh secara visual |
| `/admin/acara/[id]/edit` | form + galeri | — | unggah sampul, tautan Drive | banner galat | field judul | `Simpan Perubahan` (biru) | judul/deskripsi/tautan Drive → Line ✓ |
| `/admin/venue` (daftar) | — | `Cari venue atau kota` (aria-label) | — | kartu kosong | — | `Tambah Venue` | search ✓ |
| `/admin/venue/addVenue` | form | — | unggah gambar | galat per field → di bawah field | field `Nama Venue` | `Tambah Venue` / `Simpan Perubahan` (biru) | semua field teks → Line + `error` per field ✓ |
| `/admin/partner` (daftar) | — | `Cari partner, kontak` (aria-label) | — | kartu kosong | — | `Tambah Partner` | search ✓ |
| `/admin/partner/addPartner` | form | kategori (Radix) | unggah logo | — | field kategori | `Simpan` (biru) | deskripsi + 4 kontak → Line; nama/combobox venue tetap khusus + label terhubung ✓ |
| `/admin/members` | ubah status, kirim kredensial | `Cari member` (aria-label), komunitas, tier (Radix) | — | paginasi + skeleton | field catatan | `Simpan Perubahan` | catatan → Line; komunitas/tier/referrer label terhubung; sisa input kredensial diberi `id` eksplisit ✓ |
| `/admin/admins` | setujui/tolak, tambah dari member | `Cari admin` (aria-label) | — | kartu kosong | field label | `Tambah Admin` | search ✓ |
| `/admin/admins/[id]` | ubah label jabatan, setujui/cabut | — | — | status revoked menonaktifkan input | — | `Simpan` | input label terhubung `id`/`htmlFor` ✓ |
| `/admin/admins/add-from-member` (dialog) | pilih member, label, color ranger | `Cari nama, email, …` (aria-label) | — | pesan kosong per langkah | — | `Lanjut`/`Simpan` | input label sudah terhubung; tombol ranger kini `aria-pressed` ✓ |
| `/admin/settings` | general, kontak, absensi, referral | — | — | tab tanpa galat khusus | — | `Simpan` per panel | KontakPanel → Line ✓; general angka diberi `aria-label`; ReferralPanel dikecualikan (lihat §4) |
| `/admin/pendaftar` | ubah status, ekspor | filter komunitas/status/tanggal | ekspor CSV | tabel kosong | — | `Ekspor` | belum disentuh (di luar cakupan 2.4) |
| `/admin/confirmation`, `/admin/attendance`, `/admin/affiliate-payout`, `/admin/revenue`, `/admin/transactions` | aksi per baris | filter | — | skeleton/loading khusus | — | aksi baris | di luar lingkup alur; tidak disentuh |
| `/admin/media`, `/admin/packages`, `/admin/voucher`, `/admin/referral`, `/admin/resources`, `/admin/mentoring` | — | — | — | — | — | — | dikecualikan eksplisit oleh 2.4 |

Catatan loading: hanya `admin/loading.tsx`, `acara`, `acara/[id]`, `members`, `confirmation`, `affiliate-payout`, `packages` yang punya `loading.tsx`. Rute lain mengandalkan keadaan kosong dari komponen klien.

## 3. Bukti uji langsung (sesi admin sementara)

Sesi admin sementara dibuat lewat magic link service role untuk `admin.albanaspeechacademy@gmail.com`, hanya untuk pengujian; tidak ada kredensial atau token yang ditulis ke repo.

1. **Entri ditolak — batch.** Buka `Ubah` pada "Batch 8", kosongkan `Mulai 1`, tekan `Simpan`.
   Hasil: dialog tetap terbuka; pesan galat muncul tepat di bawah grup sesi — *"Setiap sesi wajib punya waktu mulai dan selesai."*; fokus berpindah ke `#batches-sessions-0-start`.
   Catatan: perbaikan fokus (`CmsCollectionClient.handleSubmit`) perlu karena field `sessions` merender id per baris (`…-0-start`), bukan `…-sessions`.
2. **Entri valid — batch.** Isi kembali waktu mulai, tekan `Simpan`.
   Hasil: dialog tertutup, daftar menyegarkan, dan wilayah `role="status"` mengumumkan *"Perubahan tersimpan."*; toast `sonner` tampil lalu hilang.
3. **SelectLine lewat keyboard.** Fokus ke `#batches-program_slug`, tekan `Enter` → daftar `role="listbox"` terbuka dengan opsi "Basic to Advance", "Public Speaking Series". `ArrowDown` + `Enter` memilih, fokus kembali ke trigger. `Enter` lalu `Escape` menutup daftar tanpa memilih dan mengembalikan fokus.
4. **Warna aksi.** `Tambah` dan `Simpan` dihitung `rgb(47, 92, 134)` (`#2F5C86`). Setelah perbaikan `body:has(.admin-shell)`, tombol di dalam dialog (portal di luar `.admin-shell`) juga biru.

Screenshot sebelum: `assets/2026-11-11-step-2-baseline/` (6 rute, tombol aksi masih hitam).
Screenshot sesudah: `assets/2026-11-11-step-2-after/`.

## 4. Modul yang ditunda (keputusan eksplisit)

Langkah 2.4 menyebut acara, venue, partner, galeri, trainer, member/admin, settings. Yang **selesai**: seluruh form entri teks/uraian pada acara, venue, partner, galeri, dan settings Kontak; trainer lewat `CmsCollectionClient`; perbaikan asosiasi label dan `aria-pressed` pada member dan admin; pemilihan `components/ui/select.tsx` kini memakai Radix (memperbaiki keyboard di semua pemakai: filter acara, member, galeri, partner, media, transaksi, konfirmasi, dll.).

Yang **ditunda** dengan alasan berikut:

- Kombobox khusus yang tidak dapat diganti `InputLine` tanpa kehilangan fungsi (autocomplete tipe acara, venue, nama partner kafe) — label sudah dihubungkan lewat `id`/`htmlFor`; bentuk khusus dipertahankan sesuai kalimat 2.3 ("file picker dan kontrol khusus dengan label setara").
- Sisa input pada `MembersClient` (kredensial password dan komunitas `readOnly`), input angka `GeneralPanel`, dan `ReferralPanel`: kontrol sempit yang sudah punya label/`aria-label`; memindahkannya ke `Line` tidak menambah perilaku.
- Rute di luar daftar 2.4 (media, packages, voucher, referral, resources, mentoring, confirmation, attendance, affiliate-payout, revenue, transactions, pendaftar, cms-akademi, cms-komunitas, funnel, logs, roles, payment, aktivitas, sidebar-layout, denied): tidak disentuh sesuai batas 2.4.

## 5. Yang belum dapat dibuktikan

- **360 px tanpa scroll horizontal**: alat peramban yang tersedia tidak mengekspos pengubahan lebar viewport, jadi hanya tangkapan desktop yang ada. Perlu uji manual di peramban perangkat.
- **Tema gelap** dan **motion reduce**: token gelap ditulis di `globals.css` dan blok `prefers-reduced-motion` menonaktifkan animasi, tetapi belum diperiksa secara visual pada rute admin.
- **Ukuran JS admin sebelum/sesudah**: belum diukur (Radix Select sudah menjadi dependensi karena `radix-ui` terpasang; `SelectLine` tidak menambah paket baru).

## 6. Berkas yang diubah di Langkah 2

- `components/ui/select.tsx` — Radix Select dengan API majemuk yang sama.
- `components/ui/SelectLine.tsx` — Radix Select, label/galat/`aria`.
- `components/ui/style-line/InputLine.tsx`, `TextareaLine.tsx`, `RadioGroupLine.tsx`, `MultiSelectLine.tsx`.
- `components/admin/cms/CmsCollectionClient.tsx` — per tipe field, galat per field + fokus, banner galat, toast + wilayah `status`.
- `app/globals.css` — token `.admin-shell` dan `body:has(.admin-shell)`, animasi dialog 140 ms, blok reduced-motion.
- `app/(admin)/admin/layout.tsx` — kelas `admin-shell`.
- `app/(admin)/admin/settings/panels/KontakPanel.tsx`, `panels/GeneralPanel.tsx`.
- `app/(admin)/admin/acara/create/AcaraCreateForm.tsx`, `acara/[id]/edit/AcaraEditForm.tsx`, `acara/AcaraListClient.tsx`.
- `app/(admin)/admin/venue/addVenue/AddVenueClient.tsx`, `venue/VenueClient.tsx`.
- `app/(admin)/admin/partner/addPartner/AddPartnerClient.tsx`, `partner/PartnerClient.tsx`.
- `app/(admin)/admin/galeri/addGallery/AddGalleryClient.tsx`, `galeri/GaleriCMSClient.tsx`.
- `app/(admin)/admin/members/MembersClient.tsx`, `admins/AdminsClient.tsx`, `admins/AddAdminFromMemberDialog.tsx`, `admins/[id]/AdminDetailClient.tsx`.
