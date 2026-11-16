# Referensi API — Albana Speech Academy

> **Catatan setelah pembersihan skema:** guard unggah dan media privat kini memakai `admin_users`; RPC `receive_registration` lama sudah dihapus. Rincian yang masih menyebut `members` atau tabel lama di bawah adalah riwayat dan perlu diselaraskan sebelum dipakai sebagai kontrak implementasi.

**Status:** dibaca dari `front/app/api/`, Server Actions admin, dan fungsi PostgreSQL proyek `clgjsekfnexmanjdxmqy` pada 15 November 2026. Hanya antarmuka yang dipakai produk Albana; rute `api/member/**` dan `api/portfolio/**` adalah warisan dan tidak didokumentasikan di sini.

## 1. Route Handler

### `POST /api/registrations` — publik

Menerima pendaftaran Public Training dan membuat tagihan awal.

**Permintaan.** `Content-Type: application/json`, isi ≤ 20.000 karakter, `Origin` (bila ada) harus sama dengan host permintaan. Isi divalidasi `parseAcademySubmission` (`lib/academy-registration-input.ts`); bidang yang diteruskan ke RPC tercantum di [bagian 3](#receive_academy_registrationrequest-jsonb--jsonb).

**Respons.**

| Kode | Kapan | Isi |
| --- | --- | --- |
| 200 | Diterima (atau kirim ulang identik) | `{ receiptToken, redirectUrl: "/register/konfirmasi/<token>" }` |
| 403 | `Origin` berbeda host | `{ message }` |
| 409 | RPC `changed` — harga/pilihan berubah | `{ message }` |
| 409 | RPC `unavailable` — batch tutup atau rekening aktif tidak ada | `{ message }` |
| 409 | RPC `duplicate` — email sudah terdaftar pada batch | `{ message }` |
| 413 | Isi terlalu besar | `{ message }` |
| 415 | Bukan JSON | `{ message }` |
| 422 | JSON rusak atau validasi gagal | `{ message }` |
| 429 | RPC `busy` — batas laju | `{ message }` |
| 503 | `REGISTRATION_RECEIPT_SECRET` kosong atau galat layanan | `{ message }` |

Respons 200 berarti **formulir diterima**, bukan pembayaran terverifikasi.

### `POST /api/upload` — admin

Unggah media. `multipart/form-data` dengan berkas dan `purpose`.

| Aturan | Nilai |
| --- | --- |
| Guard | Origin sama, sesi login, `members.role = 'admin'`. |
| Gambar | JPEG, PNG, atau WebP; resolusi ≥ batas minimal (bawaan 1280×720); dikonversi ke WebP. |
| Video | MP4; sisi pendek ≥ batas minimal (bawaan 720 px); ≤ 25 MiB; **tidak dikompresi**. |
| `purpose=landing` | Disimpan di bucket publik `gallery` (`landing/<uuid>.webp`); mengembalikan URL publik. |
| Lainnya | Disimpan di bucket privat `academy-media` (`albana/<uuid>.<ext>`); baris `media_assets` dibuat sebagai draf. |
| Galat | 413 (ukuran), 422 (format atau resolusi). |

### `GET /api/media/[id]` — publik bersyarat

Mengalihkan (302, `Cache-Control: no-store`) ke signed URL berumur 60 detik untuk aset `media_assets` berpenyedia `supabase_storage`. Aset terbit dapat diminta siapa pun; aset draf hanya oleh admin. `id` bukan bilangan, aset tidak ada, atau tidak berhak → 404. Gagal menandatangani → 503.

### `GET /auth/callback`, `GET /auth/confirm`

Pertukaran kode Supabase Auth untuk login dan reset kata sandi admin.

## 2. Server Actions admin

Semua berada di `app/(admin)/admin/<modul>/actions.ts`, menerima `FormData`, dan memanggil guard admin sebelum memakai service role.

| Action | Berkas | Efek |
| --- | --- | --- |
| `resolveInvoice` | `tagihan/actions.ts` | Memanggil `resolve_academy_invoice` dengan keputusan `verified` atau `rejected`. |
| `saveBundle` | `bundling/actions.ts` | Menyimpan baris `bundle_offers`. |
| `savePartner`, `togglePartner` | `partner/actions.ts` | Menyimpan dan menerbitkan/menarik `academy_partners`. |
| `addYoutube` | `media/actions.ts` | Menambah `media_assets` berpenyedia `youtube`. |
| `setMediaPublished` | `media/actions.ts` | Menerbitkan/menarik aset. |
| `saveMediaSettings` | `media/actions.ts` | Menyimpan batas resolusi minimal di `system_settings`. |

Program, Batch, Trainer, Artikel, Galeri, Testimoni, dan Kontak tidak memakai action: komponen admin menulis lewat klien Supabase dan dijaga RLS (lihat [kontrol akses](../data/access-control.md)).

## 3. Fungsi PostgreSQL (RPC)

Ketiganya hanya dapat dieksekusi `service_role`.

### `receive_academy_registration(request jsonb) → jsonb`

| Kunci `request` | Guna |
| --- | --- |
| `primaryBatchSlug` | Batch utama. |
| `secondaryBatchSlug`, `offerSlug` | Hanya untuk bundling. |
| `formKind` | Harus cocok dengan `batches.form_kind`. |
| `fullName`, `email`, `whatsapp` | Identitas. |
| `answers` | Objek jawaban formulir. |
| `paymentMethod` | `full` atau `dp`. |
| `expectedPriceIdr`, `expectedDpPercent` | Nilai yang dilihat pengunjung; dibandingkan dengan nilai terkini. |
| `idempotencyKey` | UUID dari browser. |
| `submissionHash`, `sourceHash` | Dihitung route; untuk deteksi kirim ulang dan pembatasan laju. |

| `status` hasil | Arti |
| --- | --- |
| `received` | Tersimpan; disertai `registrationId` dan `invoiceId`. Kirim ulang identik mengembalikan ID yang sama. |
| `changed` | Harga, DP, atau pilihan tidak lagi sama; juga bila kunci idempotensi dipakai ulang dengan isi berbeda. |
| `unavailable` | Batch tidak menerima, penawaran tidak aktif, atau tidak ada rekening aktif. |
| `duplicate` | Email sudah terdaftar pada batch itu. |
| `busy` | Batas laju terlampaui. |

Bila ke-999 kode unik sedang terpakai pada rekening aktif, fungsi melempar galat “Semua kode unik sedang dipakai” dan route menjawab 503.

### `resolve_academy_invoice(target_invoice_id bigint, decision text, reviewer text) → jsonb`

Menetapkan status tagihan, `reviewed_by`, dan `reviewed_at`. Hasil `{ status: "resolved", nextInvoiceId }`; `nextInvoiceId` terisi bila verifikasi DP membuat tagihan pelunasan. Masukan tidak sah menghasilkan `{ status: "invalid" }`.

### `receive_registration(...)` — transisi

Alur pendaftaran lama ke tabel `registrations`. Tidak dipanggil route saat ini; dihapus bersama tabelnya.

## 4. Bacaan publik

Halaman publik tidak memakai endpoint JSON; Server Components memanggil modul di `lib/server/`:

| Modul | Data |
| --- | --- |
| `catalog.ts` | Program, batch aktif, trainer. |
| `program-showcase.ts` | Media terbit per program/batch, partner. |
| `registration-batch.ts`, `bundle-offer.ts` | Batch yang menerima dan penawaran bundling untuk formulir. |
| `public-articles.ts` | Artikel terbit. |
| `public-contacts.ts` | Kanal kontak. |

## 5. Menambah endpoint

1. Tentukan jalur akses (publik, CMS langsung, atau berhak) sesuai [arsitektur](system-architecture.md#4-tiga-jalur-akses-data).
2. Validasi masukan di `lib/*.ts` dengan uji `*.test.mjs`.
3. Untuk jalur berhak: guard admin pada baris pertama, lalu service role.
4. Aturan yang harus atomik ditulis sebagai fungsi PostgreSQL dalam migrasi, dengan `EXECUTE` hanya untuk `service_role`.
5. Catat endpoint di dokumen ini.
