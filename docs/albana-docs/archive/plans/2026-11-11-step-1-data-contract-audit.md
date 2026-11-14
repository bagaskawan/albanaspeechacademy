# Audit langkah 1 — kontrak data admin, batch, artikel, dan pendaftaran

**11 November 2026 · hasil pemeriksaan proyek Supabase dan kode checkout**

Dokumen ini adalah bukti pelaksanaan [langkah 1 rencana implementasi](./2026-11-11-admin-program-batch-article-registration.md). Kredensial tidak dicatat; hanya nama variabel dan host proyek.

---

## 1. Proyek yang dituju

| Pemeriksaan | Hasil |
|---|---|
| `front/.env` `NEXT_PUBLIC_SUPABASE_URL` | `https://clgjsekfnexmanjdxmqy.supabase.co` |
| MCP Supabase `project_ref` | `clgjsekfnexmanjdxmqy` |
| Nama proyek | `adminalbanaspeechacademy-database` (region `ap-southeast-1`) |
| Proyek lain di organisasi | `albanaspeechacademy-dev` (`pwoyhhxpigljxpkqhfro`) — tidak dirujuk `.env` maupun MCP |
| Staging terpisah | Tidak ada. Proyek di atas adalah satu-satunya lingkungan non-produksi yang dipakai aplikasi. |

Klien admin (`front/lib/supabase/server.ts`, `client.ts`, `service-role.ts`) membaca `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `academyRequest` sebelumnya membaca `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` yang **tidak ada** di `front/.env`, sehingga katalog dan intake selalu melempar “Koneksi akademi belum tersedia.”

Perbaikan yang diterapkan: `front/lib/server/academy-api.ts` memakai nama yang ada sebagai fallback. Dengan begitu klien admin dan `academyRequest` menunjuk proyek yang sama tanpa menyalin kredensial ke kode.

**Konsekuensi yang belum diselesaikan:** `academyRequest` memakai anon key. Anon tidak boleh `EXECUTE receive_registration`. Intake di langkah 5 harus memakai klien service-role atau jalur server khusus, bukan `academyRequest` apa adanya.

---

## 2. Bentuk nyata di database

### 2.1 Tabel

| Tabel | Kolom | Catatan |
|---|---|---|
| `programs` | `slug` (PK), `title`, `price_idr` | Sesuai `data/albana-schema.sql`. Tidak ada `summary`, `audience`, `curriculum`, dan kolom pemasaran lain. |
| `batches` | `slug` (PK), `program_slug` (FK), `title`, `sessions` (jsonb), `registration_open` (bool) | Jadwal disimpan sebagai JSON, bukan baris tabel. |
| `sessions` | `batch_slug`, `sequence_no`, `starts_at`, `ends_at` | Tabel ada dan punya FK, tetapi alur batch menulis `batches.sessions`. Tidak dipakai katalog/register saat ini. |
| `articles` | `slug` (PK), `title`, `body`, `published` | Status publikasi hanya boolean `published`. |
| `registrations` | `id` (identity), `batch_slug`, identitas 1–16, `payment_method`, `price_idr_at_signup`, `initial_transfer_idr`, `remaining_after_transfer_idr`, `received_at` | Flat. Tidak ada `form_kind`, `answers` jsonb, atau `consent_at`. Dua kolom nominal transfer adalah generated column. |
| `payments` | `id`, `registration_id`, `amount_idr`, `proof_object_key`, `status`, `reviewed_by`, `reviewed_at` | Kandidat tempat status verifikasi langkah 5.6. |
| `bank_accounts` | `id`, `bank`, `account_number`, `holder`, `active` | Kosong. |

### 2.2 Kolom aditif yang ditambahkan (migrasi `add_batch_offer_and_article_metadata`)

| Tabel | Kolom | Alasan |
|---|---|---|
| `batches` | `venue`, `address` | Dibutuhkan katalog dan form register. |
| `batches` | `price_idr`, `normal_price_idr` | Harga efektif per batch dan harga normal opsional; `programs.price_idr` menjadi fallback. |
| `batches` | `fee_details` | Rincian promo/harga yang tampil di ringkasan. |
| `batches` | `form_kind` (`series`/`exclusive`/`bnsp`) | Varian formulir melekat pada batch. |
| `batches` | `dp_percent` (1–99) | Persentase DP per batch. |
| `articles` | `excerpt`, `published_at` | Dibutuhkan pembaca publik; belum ada sebelumnya. |

Semua nullable dan tidak menghapus data. Tabel terkait berisi 0 baris sebelum migrasi.

### 2.3 Constraint penting

- `programs.slug` dan `batches.slug`: regex `^[a-z0-9]+(-[a-z0-9]+)*$`.
- `batches.program_slug` → `programs.slug`; `sessions.batch_slug` → `batches.slug`.
- `batches_sessions_check` memanggil `valid_session_schedule(sessions)`.
- `registrations` unik pada `(batch_slug, email)`.
- `registrations.payment_method` ∈ `full`, `dp20`.
- `registrations.gender`, `attendance`, `source`, `socials` dibatasi check.
- `registrations.whatsapp` regex `^[+]?[0-9]{8,15}$`.
- `registrations.email` harus huruf kecil dan cocok format.
- `payments.status` ∈ `pending`, `verified`, `rejected`; status selain `pending` wajib punya `reviewed_by` dan `reviewed_at`.

### 2.4 Pembentuk slug

Trigger `set_catalog_slug` terpasang pada `programs`, `batches`, `articles`, dan `trainers`. Saat insert, bila `slug` kosong, slug dibuat dari `title`/`name`: huruf kecil, karakter non-alfanumerik menjadi `-`, lalu diberi akhiran `-1`, `-2`, … bila sudah dipakai. Slug yang sudah diisi tidak diubah.

---

## 3. RPC `receive_registration`

Signature nyata:

```sql
receive_registration(
  batch text,
  expected_price bigint,
  participant jsonb,
  consent boolean
) returns text
```

- `SECURITY INVOKER`, `search_path = ''`.
- `EXECUTE` hanya untuk `service_role` (dan `postgres`). Anon/authenticated tidak boleh.
- Hasil yang dibuktikan langsung: `received`, `duplicate`, `changed`.
- `unavailable` dikembalikan bila batch tutup, jadwal pertama sudah lewat, atau batch tidak ditemukan.
- `consent` wajib `true`; bila tidak, fungsi melempar exception.
- Insert memakai `on conflict on constraint registrations_batch_slug_email_key do nothing`.

### 3.1 Ketidakcocokan dengan `receive-registration.ts`

| Hal | RPC nyata | Helper sekarang |
|---|---|---|
| Argumen | `batch`, `expected_price`, `participant`, `consent` | Mengirim `batch`, `participant`, `token` |
| `expected_price` | Wajib | Tidak dikirim |
| `consent` | Wajib `true` | Tidak dikirim |
| `token` | Tidak ada | Dikirim |
| Bentuk `participant` | Kolom `registrations` (snake_case) | `{ fullName, email, whatsapp, formKind, priceIdr, paymentMethod, dpPercent, answers: {...} }` |
| Hasil `duplicate` | Ada | Tidak ditangani → jatuh ke `default` dan melempar “Respons pendaftaran tidak valid.” |
| Hasil `busy` | Tidak pernah | Diharapkan untuk 429 |

Artinya jalur intake saat ini **tidak bisa** memanggil RPC yang terpasang. Perbaikan ada di langkah 5.2/5.4: samakan payload, tambahkan harga yang dilihat peserta, dan pindahkan pembatasan laju ke route.

---

## 4. Izin dan RLS

| Peran | `programs` | `batches` | `articles` | `registrations` | `sessions` |
|---|---|---|---|---|---|
| `anon` | SELECT (2 baris) | SELECT (3 baris) | SELECT hanya `published` (1 baris) | ditolak (`permission denied`) | SELECT grant, tetapi tanpa policy → 0 baris |
| `authenticated` | SELECT; tulis bila ada di `admin_users` | sama | sama | SELECT bila ada di `admin_users` | tulis bila ada di `admin_users` |
| `service_role` | semua | semua | semua | semua | semua |

- Tulis admin memakai allowlist `admin_users`, bukan `members.role`.
- Guard halaman admin (`admin-guard.ts`) memakai `members.role = 'admin'`. Pada data sekarang satu anggota adalah `admin`, ada di `admin_users` sebagai `adminsuper`, dan `members.id = auth.uid`. Keduanya konsisten.
- `receive_registration` tidak dapat dipanggil anon/authenticated; ini benar untuk intake server.

---

## 5. Perbandingan sumber dengan kenyataan

| Sumber | Yang diklaim | Kenyataan | Dampak |
|---|---|---|---|
| `data/albana-schema.sql` | Skema MVP: `programs(slug,title,price_idr)`, `batches(sessions jsonb, registration_open)`, `articles(body,published)`, `registrations` flat | Cocok untuk tabel inti. Lapisan CMS (`sessions`, `bank_accounts`, `batch_trainers`, policy tulis) ditambahkan migrasi lain. | `data/albana-schema.sql` tetap acuan tabel inti; jangan menjalankannya ulang di proyek ini. |
| `data/database-reference.md` | Batch punya `venue`, `address`, `price_idr`, `fee_details`, `capacity`, `closes_at`, `status`, `form_kind`, `dp_percent`, `proof_on_followup`; artikel punya `excerpt`, `published_at`, `status`; registrasi punya `form_kind`, `answers`, `consent_at` | Sebagian besar **tidak terpasang**. Yang ada hanya skema MVP + kolom aditif di §2.2. | Dokumen itu menggambarkan skema dev sebelumnya, bukan proyek `clgjsekfnexmanjdxmqy`. |
| `cms-fields.ts` | Program punya 11 field; batch punya status, kapasitas, tenggat; artikel punya `excerpt` dan `status` | Field itu tidak ada di tabel nyata. Halaman admin sekarang tidak memakai file ini; tiap halaman mendefinisikan `CmsField` sendiri. | File ini kontrak lama. Jangan dipakai untuk menulis sebelum diselaraskan. |
| `cms-validation.ts` | Aturan buka batch mensyaratkan `form_kind`, `proof_on_followup`, kapasitas kosong; artikel memakai `status` | Tidak dipakai halaman admin saat ini dan mengacu kolom yang tidak ada. | Pindahkan aturan ke validasi server langkah 3/5, atau selaraskan lebih dulu. |
| `catalog.ts` | Meminta `status`, `accepting_registrations`, `sessions(...)` sebagai relasi, dan kolom program pemasaran | Sebelum diperbaiki, setiap permintaan 400. | Sudah diperbaiki: membaca `batches.sessions` jsonb dan kolom yang ada. |
| `public-articles.ts` | Meminta `excerpt`, `published_at` | Kolom belum ada sebelum migrasi. | Sudah cocok setelah kolom ditambahkan. |
| `receive-registration.ts` | Payload bertingkat + `token` | Tidak cocok dengan signature RPC. | Diperbaiki di langkah 5. |

---

## 6. Pemetaan baca/tulis yang ditetapkan

### 6.1 Program

- Sumber: dua baris statis `public-speaking-series` dan `basic-to-advance`.
- Baca: `slug`, `title`, `price_idr`.
- Tulis: tidak ada CRUD. Seed/ubah hanya lewat migrasi atau SQL operasional.
- Salinan pemasaran (ringkasan, kurikulum, FAQ) berada di `front/lib/server/program-showcase.ts`, bukan di tabel.

### 6.2 Batch dan sesi

- Satu-satunya sumber sesi: `batches.sessions` jsonb, berisi `{ starts_at, ends_at }` waktu lokal WIB.
- `valid_session_schedule` menolak array kosong, format salah, akhir ≤ mulai, dan sesi yang tumpang tindih/tidak berurutan.
- Tabel `sessions` tidak ditulis oleh alur ini. Bila nanti dipakai, batch dan baris sesi harus ditulis dalam satu transaksi.
- Bacaan katalog memproyeksikan JSON menjadi daftar berurutan; `sequence` diambil dari urutan array.
- Harga efektif: `coalesce(batches.price_idr, programs.price_idr)`.
- Harga normal: `batches.normal_price_idr` (nullable); null berarti sama dengan harga efektif.
- Varian: `batches.form_kind` (`series`, `exclusive`; `bnsp` hanya untuk pembacaan historis).
- Tempat: `batches.venue` dan `batches.address` (keduanya wajib untuk batch yang tampil publik).
- DP: `batches.dp_percent`; Batch 9 memakai 20.
- Status buka: **hanya** `batches.registration_open`. Label diturunkan, tidak disimpan:
  - `open` = `registration_open` dan sesi pertama masih di masa depan;
  - `closed` = `registration_open = false`;
  - `running` = `registration_open` dan sesi pertama sudah mulai.
- Tidak menambah `status`, `capacity`, `closes_at`, atau `proof_on_followup`. Bukti menyusul lewat WhatsApp adalah perilaku tetap, bukan field.
- Slug dibuat trigger; relasi `program_slug` dipertahankan.

### 6.3 Artikel

- Status publikasi: **hanya** `published` boolean.
- `published_at` adalah metadata; null untuk draf dan artikel lama tanpa tanggal. Tanggal pertama kali terbit dipertahankan saat edit (langkah 4).
- `excerpt` nullable. Bila null, daftar publik memakai paragraf awal `body`; tanggal yang tidak diketahui tidak ditampilkan.
- `body_blocks` **belum** ditambahkan; migrasinya milik langkah 4.1 dan tidak perlu sebelum editor ada.
- Baca publik: `slug`, `title`, `excerpt`, `body`, `published_at`. RLS sudah membatasi anon ke `published`.

### 6.4 Pendaftaran

- Ditulis hanya lewat RPC. Satu baris per `(batch_slug, email)`.
- Harga saat daftar: `price_idr_at_signup` diisi RPC dari `programs.price_idr` setelah dibandingkan dengan `expected_price`.
- Metode: `full` atau `dp20`. UI boleh memakai `dp`, tetapi payload akhir harus memetakan ke `dp20`.
- `initial_transfer_idr` dan `remaining_after_transfer_idr` dihitung DB (DP 20% dibulatkan).
- Varian tidak disimpan per pendaftar; rekap membaca `batches.form_kind`.
- Pemetaan jawaban ke kolom:

| Butir formulir | Kolom |
|---|---|
| 1 nama lengkap | `full_name` |
| 2 nama panggilan | `nickname` |
| 3 domisili | `domicile` |
| 4 WhatsApp | `whatsapp` |
| 5 email | `email` |
| 6 jenis kelamin | `gender` |
| 7 usia | `age` |
| 8 jabatan/profesi | `profession` |
| 9 instansi | `institution` (isi “Tidak ada” bila tidak ada) |
| 10 media sosial | `socials[]` |
| 10 nama akun | `social_name` |
| 10 lainnya | `social_other` |
| 12 pengalaman | `prior_experience` |
| 13 tujuan | `goal` |
| 14 tantangan | `challenge` |
| 15 sumber | `source`, `source_other` |
| 16 kesediaan hadir | `attendance` |
| 19 metode | `payment_method` |
| 17–18 harga/DP | `price_idr_at_signup`, kolom generated |

- Persetujuan tidak disimpan: RPC lama mewajibkan `consent`, tetapi rencana 5.2 menghapus checkbox tambahan. Keputusan: RPC baru tidak boleh mewajibkan `consent`; jangan mengirim `true` untuk tindakan yang tidak dilakukan peserta.
- Bukti transfer tidak masuk database. `payments.proof_object_key` tetap null; verifikasi memakai `payments.status` + `reviewed_by` + `reviewed_at`.
- Retry/duplikat: butuh penanda idempoten (mis. token klien nullable + unique per batch) agar retry mengembalikan ID yang sama tanpa membuka identitas pendaftar lain. Ini diputuskan di langkah 5.4, belum ditambahkan.

### 6.5 Rekap admin

`PendaftarClient.tsx` sudah membaca kolom flat dan relasi `registrations → batches → programs`. Ini cocok dengan skema nyata. Yang perlu ditambah di langkah 5.6: ID pendaftaran, metode, nominal, status verifikasi, dan aksi “Tandai terverifikasi”.

---

## 7. Fixture dan bukti yang sudah dijalankan

Fixture dibuat di proyek dev:

| Fixture | Isi |
|---|---|
| Program | `public-speaking-series` (Rp1.500.000), `basic-to-advance` (Rp1.500.000) |
| Batch 9 Series | 4 sesi mingguan 21/28 Nov dan 5/12 Des 2026, buka, efektif Rp1.500.000, DP 20% |
| Batch 9 Eksklusif | 1 sesi 22 Nov 2026 08.30–18.00, buka, normal Rp1.500.000, efektif Rp1.300.000, DP 20% |
| Batch 8 Series | tutup, sesi 3 Okt 2026 (masa lalu) |
| Artikel terbit | `mengenal-public-speaking`, `published = true`, `published_at` terisi |
| Artikel draf | `draf-catatan-latihan`, `published = false`, `published_at` null |
| Pendaftar historis | `historis@example.com`, batch 8, `dp20`, Rp1.500.000, transfer awal Rp300.000, sisa Rp1.200.000 |

Bukti:

- Anon membaca 2 program, 3 batch, 1 artikel terbit; draf tidak terlihat; `registrations` ditolak.
- RPC sebagai `service_role`: panggilan pertama `received`, panggilan kedua `duplicate`, harga berbeda `changed`.
- REST anon dengan select katalog yang sudah diperbaiki mengembalikan dua program beserta batch dan array sesi JSON; artikel publik hanya yang terbit.
- Harga efektif Eksklusif Rp1.300.000 dan Series Rp1.500.000 terbaca dari `coalesce(batch, program)`.
- DP 20% menghasilkan Rp300.000 / sisa Rp1.200.000 untuk Rp1.500.000; Eksklusif menghasilkan Rp260.000 / sisa Rp1.040.000 (dihitung dari Rp1.300.000).

**Belum dibuktikan:** screenshot baseline 360 px dan desktop untuk program, batch, artikel, trainer, dan satu form operasional. Alasannya: tidak ada sesi admin yang bisa dipakai tanpa mengetik kredensial ke tool, dan halaman trainer/galeri masih memakai kolom yang tidak ada di DB. Ini tetap menjadi syarat 1.3 yang belum dicentang.

Catatan tindakan dari kode saat ini:

- Membuka batch: menu **Batch** → **Ubah** pada baris → centang **Buka pendaftaran** → **Simpan**. Tiga tindakan dan satu perpindahan halaman dari menu Program.
- Pengguna login mengetik ulang **9** field identitas (nama lengkap, nama panggilan, domisili, WhatsApp, email, jenis kelamin, usia, profesi, instansi). Prefill anggota belum ada; target langkah 6.1 menyisakan 4 field (panggilan, jenis kelamin, usia, instansi).

---

## 8. Temuan yang harus ditutup sebelum atau selama langkah berikutnya

1. **Intake (langkah 5):** samakan signature/payload RPC, tangani `duplicate`, pindahkan `busy`/rate limit ke route, dan pakai service-role. Jangan memakai `academyRequest` anon untuk RPC.
2. **Katalog (langkah 3.6):** `catalog.ts` sudah membaca bentuk nyata; sambungkan kartu, detail, dan `/register` ke sumber yang sama. Jangan menambah `accepting_registrations` sebagai kolom.
3. **Admin trainer/galeri/program (langkah 2–3):** halaman masih memakai kolom lama (`role`, `photo_url`, `asset_url`, `alt_text`, `caption`, `sort_order`, `published`) yang tidak ada. Halaman akan tampil kosong tetapi gagal menyimpan.
4. **Artikel (langkah 4):** admin belum menulis `published_at`; tambahkan aturan tanggal terbit pertama dan `body_blocks`.
5. **Kontak WhatsApp (langkah 5.3):** `contact_channels` hanya berisi `email`; belum ada baris `whatsapp` untuk `0857-1779-7637`.
6. **File kontrak lama:** `cms-fields.ts` dan `cms-validation.ts` tidak dipakai halaman admin dan tidak cocok dengan DB. Selaraskan atau hapus agar tidak menyesatkan.
7. **Tabel `sessions`:** ada tetapi tidak dipakai alur. Jangan menulis ganda; putuskan nanti apakah dihapus atau dijadikan sumber tunggal.
8. **Staging:** tidak ada lingkungan terpisah. Migrasi dan fixture ini berjalan di proyek dev yang dipakai aplikasi.
