# Registrasi → Checkout → Verifikasi + Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lengkapi alur pendaftaran semua program dengan modal konfirmasi sebelum kirim, halaman checkout yang memuat panduan konfirmasi, Email #1 (instruksi pembayaran) saat pendaftaran diterima, dan Email #2 (pembayaran diterima) saat admin memverifikasi tagihan.

**Architecture:** Sebagian besar alur sudah ada: `registration-form.tsx` → `POST /api/registrations` → RPC `receive_academy_registration` → halaman `/register/konfirmasi/[token]` (sudah berisi total, kode unik, rekening, tombol WhatsApp) → admin `/admin/tagihan` → RPC `resolve_academy_invoice`. Rencana ini **tidak membuat alur baru**; ia menambah modal di form, merapikan halaman konfirmasi menjadi checkout, dan memasang pengiriman email lewat `nodemailer` (sudah terpasang) yang dijalankan dengan `after()` dari `next/server` agar kegagalan SMTP tidak pernah menggagalkan pendaftaran atau verifikasi. Tabel baru `academy_email_deliveries` mencegah email ganda dan memberi admin status kirim serta tombol kirim ulang.

**Tech Stack:** Next.js 16 App Router (route handler + server action + `after`), React 19, Supabase Postgres (service role via `academyBillingClient()`), `nodemailer` 8, `node --test` untuk tes `.test.mjs` di `lib/`.

**Spec:** Permintaan pengguna 2026-11-18 (ringkasan di bawah) + [kontrak pendaftaran](../registration/registration-contract.md). Peta kode: [`front/AGENTS.md`](../../../front/AGENTS.md).

> Ringkasan spec: (1) setelah form selesai tampilkan modal *"Apakah data Anda sudah yakin?"* dengan **Cek Lagi** dan **Yakin / Lanjut**; (2) setelah yakin, arahkan ke halaman Checkout berisi nominal, kode unik, rekening, panduan konfirmasi, CTA WhatsApp, dan kirim **Email #1 (Instruksi Pembayaran)** berisi detail tagihan, rekening, cara bayar, instruksi kirim bukti; (3) admin memverifikasi di menu transaksi CMS, dan saat status menjadi "Lunas/Confirmed" kirim **Email #2 (Konfirmasi Berhasil)** berisi pembayaran diterima + langkah selanjutnya; (4) sertakan proses pembuatan email sender.

## Keputusan desain (baca sebelum Task 1)

| Topik | Keputusan | Alasan |
|---|---|---|
| Halaman Checkout | Pakai route yang ada `/register/konfirmasi/[token]`; tidak membuat route baru. | Halaman sudah memuat nominal, kode unik, rekening, CTA WhatsApp; token HMAC 30 hari sudah aman. Cukup tambah panduan dan pemberitahuan email. |
| Status "Lunas/Confirmed" | Dipetakan ke status DB yang ada `academy_invoices.status = 'verified'`. Tidak menambah status. | `resolve_academy_invoice` sudah transaksional dan dipakai tombol **Verifikasi** di `/admin/tagihan`. |
| DP | Verifikasi tagihan `initial` metode DP → Email #2 varian **"DP diterima"** yang juga berisi instruksi pelunasan (tagihan `remaining` dibuat RPC). Verifikasi tagihan `remaining` → Email #2 varian **"Pelunasan diterima"**. Tidak ada email instruksi terpisah untuk tagihan `remaining`. | Satu email per keputusan admin; peserta langsung tahu sisa yang harus dibayar. |
| Tagihan ditolak | Tidak mengirim email. | Di luar spec; admin menghubungi peserta lewat WhatsApp. Lihat *Pertanyaan terbuka*. |
| Pengirim | `nodemailer` + **Gmail SMTP dengan App Password**, meniru pola `lib/actions/attendance-actions.ts`: variabel `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/`SMTP_USER`/`SMTP_PASS` yang sudah ada di `front/.env`, bawaan `smtp.gmail.com:465` TLS, From = `"Albana Speech Academy" <SMTP_USER>`. Pola dipusatkan di `lib/server/mailer.ts` (tidak disalin per aksi). Tanpa dependensi baru; `resend` tidak dipakai. | Konfigurasi SMTP sudah teruji di kode lama dan `.env`; tidak perlu DNS/domain untuk mulai. Mailbox domain tetap bisa dipakai kelak hanya dengan mengganti nilai variabel. |
| Waktu kirim | `after(() => deliverInvoiceEmail(...))` di route/action. | Respons ke peserta/admin tidak menunggu SMTP; error email tidak membatalkan transaksi. |
| Kunci setelah "Yakin" | Setelah pendaftaran diterima, **email atau nomor WhatsApp yang sama** tidak bisa mengirim pendaftaran baru (program apa pun) selama ada tagihan `pending` yang dibuat **< 30 menit** lalu. Kunci lepas otomatis setelah 30 menit, atau lebih cepat bila admin memverifikasi/menolak tagihan itu. Ditegakkan di RPC `receive_academy_registration` (status baru `locked`), route membalas **423** + `Retry-After`. Tidak ada kunci di browser saja. | Kunci di klien (localStorage/cookie) mudah dilewati dengan browser lain dan tidak tahu kapan admin memverifikasi. RPC sudah memegang data tagihan dan sudah serial per `idempotencyKey`; cukup tambah satu cek + advisory lock per identitas. Kunci tidak berlaku untuk retry dengan `idempotencyKey` yang sama (tetap mengembalikan `received`). |
| Nominal anti-manipulasi | **Server satu-satunya sumber nominal.** Sudah berlaku sekarang: RPC menghitung harga dari `programs`/`batches`/`bundle_offers`, DP dari persen di DB, kode unik dan rekening dipilih RPC, `total_idr` kolom *generated*; `expectedPriceIdr`/`expectedDpPercent` dari browser hanya **pembanding** (beda → `changed`, tidak disimpan). Checkout, Email #1/#2, dan admin membaca nominal dari DB. Rencana ini **mengunci perilaku itu dengan tes** (Task 5B) dan menambah **pencocokan nominal diterima** saat admin memverifikasi (Task 8A). | Inspect element hanya mengubah tampilan di browser si pengguna. Celah nyata ada dua: (1) regresi kode yang kelak menerima angka dari browser, (2) admin memverifikasi dari tangkapan layar/teks WhatsApp yang diedit, bukan dari mutasi rekening. |
| Transfer kurang/lebih | **Tidak ada jalur selisih di sistem.** Verifikasi hanya lolos bila nominal diterima = total tagihan. Selisih diselesaikan **manual oleh admin lewat WhatsApp** dengan peserta: kekurangan → peserta mentransfer sisanya, lalu admin memasukkan **jumlah semua mutasi** untuk tagihan itu; kelebihan → admin mengembalikan selisih di luar sistem lalu memasukkan nominal sebesar total. Bila tidak selesai, admin **Tolak** tagihan. | Keputusan pemilik produk 2026-11-18. Menjaga RPC tetap sederhana dan semua tagihan terverifikasi berarti lunas tepat. |
| Catat transfer / kurang bayar | "Halaman detail pendaftaran" = panel **Detail tagihan** (`AdminSheet`) di `/admin/tagihan`; `/admin/pendaftar` hanya tabel ekspor. Tiap kartu tagihan `pending` mendapat tombol sekunder **Catat transfer**. Catatan disimpan **append-only** di tabel baru `academy_invoice_payments` lewat RPC yang mengunci tagihan, menghitung jumlah masuk dan **selisih** (`total − jumlah masuk`, bertanda: positif = kurang, negatif = lebih), dan menyimpannya sebagai snapshot per catatan. Salah input → **Batalkan catatan** (void, bukan hapus). Riwayat + sisa hanya **pengingat**: tidak memblokir Verifikasi; aturan Task 8A (nominal diterima = total) tetap penentu. | Selisih bertanda menangani kurang & lebih dengan satu kolom. Append-only + void menjaga jejak audit uang. Riwayat tidak dijadikan syarat verifikasi agar kasus normal (bayar pas, tanpa catatan) tetap satu klik. |
| Bukti transfer | Bucket **privat** baru `payment-proofs` (5 MiB, JPEG/PNG/WebP). Unggah lewat route handler admin `POST /api/admin/invoice-payments` (bukan server action: batas body server action 1 MB). Gambar dikompres di browser (`lib/file-compress.ts`), lalu di server didekode ulang dengan Sharp (`prepareImage`) → WebP, metadata EXIF terbuang. Dilihat lewat `GET /api/admin/invoice-payments/[id]/proof` → cek admin → redirect signed URL 60 detik. Sumber file: **drag & drop** atau **pilih dari penyimpanan perangkat** (file picker; di ponsel `accept="image/*"` juga menawarkan kamera/galeri). | Bukti transfer memuat nama, nomor rekening, dan saldo peserta: tidak boleh ada URL publik. Pola signed URL sama dengan `app/api/media/[id]/route.ts`. |
| Menu Cicilan & Pelunasan | Menu baru `/admin/cicilan` di grup **Pendaftaran** (setelah Tagihan). Satu baris **per peserta/pendaftaran** (bukan per tagihan): harga, sudah masuk, sisa keseluruhan, tahap, progres. Panel detail memakai **kartu tagihan yang sama** dengan Tagihan (riwayat, Catat transfer + bukti, Verifikasi, Tolak). **Tanpa tabel atau RPC baru**: cicilan = beberapa catatan `academy_invoice_payments` (Task 8B) pada tagihan yang sedang `pending` (DP, pelunasan, atau lunas yang dibayar bertahap); pelunasan selesai = admin memverifikasi tagihan itu (Task 8A). Tidak ada jadwal/jatuh tempo cicilan. | Data dan aturan uang tetap satu jalur (8A/8B), jadi dua menu tidak bisa memberi angka berbeda. Menu ini hanya sudut pandang "siapa masih berutang berapa" yang tidak terlihat dari daftar per tagihan. |
| Anti-dobel | Baris unik `(invoice_id, kind)` di `academy_email_deliveries` diklaim **sebelum** mengirim. | Retry dengan `idempotencyKey` yang sama mengembalikan `received` lagi dari RPC (lihat migrasi `20261113043955`, baris ~118–124); tanpa klaim, email terkirim dua kali. |

## Global Constraints

- Tidak ada dependensi npm baru. Pakai `nodemailer` yang sudah ada di `front/package.json`.
- Variabel email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_REPLY_TO` (opsional), `SITE_URL` (fallback `NEXT_PUBLIC_SITE_URL` → `NEXT_PUBLIC_APP_URL`). Variabel `SMTP_*` dan `EMAIL_*` hanya dibaca di server dan **tidak boleh** diberi awalan `NEXT_PUBLIC_`; hanya URL situs yang boleh publik.
- Semua pengiriman email lewat `sendMail()` di `lib/server/mailer.ts`; jangan membuat `nodemailer.createTransport` baru di route/aksi lain.
- Kegagalan email **tidak boleh** mengubah status HTTP `POST /api/registrations` atau membuat `resolveInvoice` melempar error.
- Nominal uang (harga, persen DP, subtotal, kode unik, total, rekening tujuan) **tidak pernah** diambil dari body request, query string, atau props client untuk disimpan, ditampilkan di checkout, atau dikirim lewat email. Selalu dibaca/dihitung di server dari DB. Ringkasan di modal (Task 6) hanya tampilan; checkout menampilkan angka resmi.
- Semua data dari peserta (nama, judul program, nama batch) wajib di-escape sebelum masuk HTML email.
- Jangan menulis alamat email, nomor WhatsApp, token tanda terima, atau isi `SMTP_PASS` ke `console.*`; log cukup `invoiceId` + kind + pesan error yang dipotong 300 karakter.
- Perubahan skema hanya lewat migrasi baru di `front/supabase/migrations/`; tabel baru RLS aktif tanpa policy (hanya service role).
- Naskah UI dan email berbahasa Indonesia; nama merek **Albana Speech Academy** (bukan "Panggung Kreator" dari kode lama).
- Nominal ditulis dengan `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`; waktu dalam WIB (`Asia/Jakarta`).
- Pemeriksaan dari `front/`: `node --test <berkas>.test.mjs`, `npx tsc --noEmit`, `npx eslint <berkas-yang-disentuh>`, `npm run build`.
- Working tree punya banyak perubahan belum di-commit milik pekerjaan lain: setiap commit **hanya** `git add` berkas yang disebut di task.

## Review Focus

1. **Nama peserta berisi HTML** (`<img src=x onerror=alert(1)>`, `Budi & "Sari"`) → email menampilkan teks apa adanya, tidak ada tag aktif. Tes: Task 3 `escapes participant data in html`.
2. **Kirim ulang dengan idempotencyKey sama** (koneksi putus setelah server menerima, peserta menekan lagi) → tetap satu Email #1. Tes: Task 2 SQL QA `QA-DB-02` + QA `QA-E1-04`.
3. **SMTP mati / variabel belum diisi** → pendaftaran tetap 200 dan diarahkan ke checkout; baris email `failed` (termasuk saat SMTP belum dikonfigurasi) dan admin bisa **Kirim ulang**. Tes: Task 1 `only SMTP_USER and SMTP_PASS are required, like attendance-actions` + QA `QA-SND-05`, `QA-E1-05`, `QA-ADM-06`.
4. **Klik ganda "Yakin / Lanjut"** → satu request `POST /api/registrations`. Tes: QA `QA-FORM-05` (guard `submittingRef` sudah ada; tombol dinonaktifkan saat mengirim).
5. **Peserta yang sudah "Yakin" mencoba mendaftar lagi dalam 30 menit** (tab lain, browser lain, email beda tapi WhatsApp sama, dua kiriman bersamaan) → ditolak 423 dengan pesan menunggu pembayaran; isian tidak hilang. Tes: Task 5A SQL QA + QA `QA-LOCK-01` s.d. `QA-LOCK-08`.
6. **Pengguna jail mengubah nominal** (edit DOM checkout, ubah body request di DevTools/Burp, tambah field `totalIdr`/`uniqueCode`, kirim bukti transfer/teks WhatsApp yang diedit) → tagihan tetap sesuai harga DB; request dengan harga palsu ditolak 409; admin tidak bisa memverifikasi bila nominal mutasi ≠ total tagihan. Tes: Task 5B + Task 8A + QA `QA-SEC-04` s.d. `QA-SEC-14`.
7. **Dua admin memverifikasi tagihan yang sama bersamaan** → RPC kedua mengembalikan `changed`, hanya satu Email #2. Tes: QA `QA-ADM-04` + baris unik Task 2.

---

## File Structure

| Berkas | Status | Tanggung jawab |
|---|---|---|
| `front/lib/mail-config.ts` | Baru | Membaca & memvalidasi variabel SMTP dari `env` (murni, bisa dites). |
| `front/lib/mail-config.test.mjs` | Baru | Tes konfigurasi. |
| `front/lib/server/mailer.ts` | Baru | `sendMail()` tipis di atas `nodemailer` (server-only). |
| `front/supabase/migrations/20261118100000_academy_email_deliveries.sql` | Baru | Tabel log & klaim email. |
| `front/lib/registration-email.ts` | Baru | Template Email #1/#2 (subject, html, text), label tahap, pesan WhatsApp, `maskEmail`. Murni. |
| `front/lib/registration-email.test.mjs` | Baru | Tes template. |
| `front/lib/server/registration-mail.ts` | Baru | `deliverInvoiceEmail()`: klaim → baca data → render → kirim → catat. |
| `front/app/api/registrations/route.ts` | Ubah | Jadwalkan Email #1 dengan `after()`. |
| `front/supabase/migrations/20261118110000_registration_pending_lock.sql` | Baru | RPC `receive_academy_registration` + status `locked` (kunci 30 menit). |
| `front/lib/registration-feedback.ts` (+ `.test.mjs`) | Ubah | Pesan banner untuk `423`. |
| `front/lib/academy-registration-input.test.mjs` | Ubah | Tes bahwa field uang dari browser dibuang (Task 5B). |
| `front/supabase/migrations/20261118120000_invoice_received_amount.sql` | Baru | Kolom `received_idr` + `resolve_academy_invoice` mewajibkan nominal diterima = total (Task 8A). |
| `front/lib/billing.ts` (+ `.test.mjs`) | Ubah | `parseRupiahInput()` untuk input admin; `paymentBalance()` (Task 8B). |
| `front/supabase/migrations/20261118130000_invoice_payments.sql` | Baru | Tabel `academy_invoice_payments`, bucket `payment-proofs`, RPC catat & batalkan (Task 8B). |
| `front/app/api/admin/invoice-payments/route.ts` | Baru | `POST`: validasi admin, proses gambar, unggah, panggil RPC. |
| `front/app/api/admin/invoice-payments/[id]/proof/route.ts` | Baru | `GET`: redirect signed URL bukti untuk admin. |
| `front/lib/albana-routes.ts` (+ `.test.mjs`) | Ubah | Izinkan dua route API baru di proxy. |
| `front/components/admin/billing/RecordPaymentDialog.tsx` | Baru | Modal input nominal + dropzone bukti + pratinjau selisih (Task 8B; dipakai 8C). |
| `front/components/admin/billing/PaymentHistory.tsx` | Baru | Ringkasan sisa + riwayat transfer di kartu tagihan (Task 8B; dipakai 8C). |
| `front/components/admin/billing/InvoiceCard.tsx` | Baru | Kartu tagihan bersama (status, email, riwayat, Catat, Verifikasi/Tolak) — diekstrak dari `TagihanClient.tsx` di Task 8C. |
| `front/lib/installments.ts` (+ `.test.mjs`) | Baru | `installmentSummary()` dan filter tahap untuk menu Cicilan & Pelunasan (Task 8C). |
| `front/app/(admin)/admin/cicilan/page.tsx`, `CicilanClient.tsx`, `loading.tsx` | Baru | Menu **Cicilan & Pelunasan** (Task 8C). |
| `front/lib/admin-nav.ts` (+ `.test.mjs`), `front/components/admin/shell/AdminShell.tsx` | Ubah | Entri menu + ikon `wallet` (Task 8C). |
| `front/lib/registration-form.ts` (+ `.test.mjs`) | Ubah | `confirmationSummary()` untuk isi modal. |
| `front/components/register/confirm-registration-dialog.tsx` | Baru | Modal konfirmasi (`<dialog>` native). |
| `front/components/register/registration-form.tsx` | Ubah | Buka modal sebelum `fetch`. |
| `front/app/(web)/register/konfirmasi/[token]/page.tsx` | Ubah | Judul Checkout, panduan 4 langkah, pemberitahuan email, pesan WhatsApp dari helper bersama. |
| `front/app/(admin)/admin/tagihan/actions.ts` | Ubah | Jadwalkan Email #2; aksi `resendInvoiceEmail`. |
| `front/app/(admin)/admin/tagihan/page.tsx`, `TagihanClient.tsx`, `front/lib/billing-rows.ts` (+ test) | Ubah | Tampilkan status email + tombol Kirim ulang. |
| `front/.env.example` | Baru (belum ada di repo) | Daftar nama variabel email tanpa nilai. |

---

### Task 1: Email sender — penyiapan pengirim dan modul mailer

Pengiriman **meniru pola SMTP yang sudah jalan** di `front/lib/actions/attendance-actions.ts` (baris ~188–242) dan `lib/actions/checkout-actions.ts`: `nodemailer.createTransport` dengan variabel `SMTP_*` yang sama, nilai bawaan yang sama, `From` = alamat `SMTP_USER`, dan kegagalan email hanya di-log tanpa menggagalkan aksi utama. Bedanya hanya dua: pola itu dipusatkan di satu modul (bukan disalin per aksi), dan nama pengirim **Albana Speech Academy** (bukan "Panggung Kreator").

Pola acuan (jangan disalin mentah; Task 1B membungkusnya):

```ts
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "false" ? false : true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
await transporter.sendMail({ from: `"Panggung Kreator" <${process.env.SMTP_USER}>`, to, subject, html });
```

Variabel yang sudah ada di `front/.env` (Gmail SMTP: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER`, `SMTP_PASS`) **dipakai apa adanya**. Variabel `RESEND_*` yang dikomentari di `.env` tidak dipakai; paket `resend` tidak disentuh.

**Files:**
- Create: `front/lib/mail-config.ts`, `front/lib/mail-config.test.mjs`, `front/lib/server/mailer.ts`
- Create: `front/.env.example`

**Interfaces:**
- Produces:
  - `type MailConfig = { host: string; port: number; secure: boolean; user: string; pass: string; from: string; replyTo: string | null; siteUrl: string }`
  - `readMailConfig(env: Record<string, string | undefined>): MailConfig | null` (di `lib/mail-config.ts`)
  - `sendMail(config: MailConfig, message: { to: string; subject: string; html: string; text: string }): Promise<{ messageId: string }>` (di `lib/server/mailer.ts`, `import "server-only"`)

**Aturan `readMailConfig` (selaras dengan pola acuan):**

| Field | Sumber | Aturan |
|---|---|---|
| `host` | `SMTP_HOST` | Kosong → `"smtp.gmail.com"`. |
| `port` | `SMTP_PORT` | Kosong → `465`. Bukan bilangan bulat 1–65535 → `null` (pola lama memakai `parseInt` tanpa cek; di sini ditolak agar salah ketik tidak diam-diam jadi `NaN`). |
| `secure` | `SMTP_SECURE` | `false` hanya bila nilainya persis `"false"`; selain itu `true`. |
| `user`, `pass` | `SMTP_USER`, `SMTP_PASS` | **Wajib** (sama dengan guard `process.env.SMTP_USER && process.env.SMTP_PASS`). Kosong → `null`. |
| `from` | — | `"Albana Speech Academy" <${SMTP_USER}>`. Gmail menolak/menimpa From yang bukan akun login, jadi alamat From selalu `SMTP_USER`; tidak ada variabel `EMAIL_FROM`. |
| `replyTo` | `EMAIL_REPLY_TO` | Opsional; kosong → `null`. Isi bila admin membaca balasan di kotak masuk lain. |
| `siteUrl` | `SITE_URL` → `NEXT_PUBLIC_SITE_URL` → `NEXT_PUBLIC_APP_URL` | Nilai pertama yang terisi, tanpa garis miring akhir (urutan fallback sama dengan `checkout-actions.ts`). Semua kosong → `"http://localhost:3000"` hanya bila `NODE_ENV !== "production"`; di produksi → `null` (tautan email tidak boleh menunjuk localhost). Di produksi wajib `https://`. |

#### 1A. Proses pembuatan email sender (operasional)

Jalur utama = **akun Gmail khusus Albana + App Password** (sesuai `.env` saat ini). Mailbox domain adalah opsi lanjutan; kodenya sama, hanya isi variabel yang berubah.

- [ ] **Step 1: Siapkan akun Gmail khusus** untuk Albana (bukan Gmail pribadi admin), mis. akun operasional akademi. Nama tampilan akun: `Albana Speech Academy`. Catat siapa pemegang akses akun ini.
- [ ] **Step 2: Aktifkan Verifikasi 2 Langkah** di akun itu (Google Account → Security → 2-Step Verification). App Password tidak tersedia tanpa ini.
- [ ] **Step 3: Buat App Password** (Google Account → Security → App passwords) dengan nama `albana-web-smtp`. Salin 16 karakter yang muncul (tanpa spasi) sebagai `SMTP_PASS`. Jangan memakai password login akun. Bila bocor, cabut App Password itu dan buat baru — password akun tidak ikut berubah.
- [ ] **Step 4: Isi variabel lingkungan** di `front/.env` (lokal, sudah di-`.gitignore` lewat `.env*`) dan di pengaturan environment hosting produksi/staging:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=        # alamat Gmail khusus Albana
SMTP_PASS=        # App Password 16 karakter
EMAIL_REPLY_TO=   # opsional
SITE_URL=https://albanaspeechacademy.com
```

- [ ] **Step 5: Uji koneksi** dari `front/` (memakai opsi transport yang sama dengan pola acuan):

```powershell
node --env-file=.env -e "require('nodemailer').createTransport({host:process.env.SMTP_HOST||'smtp.gmail.com',port:parseInt(process.env.SMTP_PORT||'465'),secure:process.env.SMTP_SECURE!=='false',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}).verify().then(()=>console.log('SMTP OK'),e=>console.error(e.message))"
```

Expected: `SMTP OK`. Galat `535-5.7.8 Username and Password not accepted` = App Password salah/dicabut atau 2FA belum aktif.

- [ ] **Step 6: Uji kirim** satu email (QA `QA-SND-02`): di Gmail penerima → *Show original* tampil `SPF: PASS`, `DKIM: PASS` (domain `gmail.com`), dan From = alamat `SMTP_USER` dengan nama `Albana Speech Academy`.
- [ ] **Step 7: Catat batas Gmail.** Akun Gmail biasa ±500 penerima/hari; Workspace ±2.000. Satu pendaftaran = 1–3 email, jadi cukup untuk volume saat ini. Bila mendekati batas atau email sering masuk Spam, pindah ke **opsi lanjutan** di bawah.

**Opsi lanjutan (tidak wajib sekarang): mailbox domain `@albanaspeechacademy.com`.** Buat mailbox (hosting email domain atau Google Workspace), isi `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` sesuai penyedia, lalu pasang DNS: satu record **SPF** (`v=spf1 include:<penyedia> ~all`; gabungkan bila sudah ada), **DKIM** dari penyedia, dan **DMARC** `_dmarc` `v=DMARC1; p=none; rua=mailto:<email-admin>` (naikkan ke `p=quarantine` setelah seminggu bersih). Tidak ada perubahan kode.

#### 1B. Kode

- [ ] **Step 8: Tulis tes yang gagal** di `front/lib/mail-config.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { readMailConfig } from "./mail-config.ts";

const gmail = { SMTP_USER: "albana.test@gmail.com", SMTP_PASS: "abcdabcdabcdabcd",
  SITE_URL: "https://albanaspeechacademy.com/", NODE_ENV: "production" };

test("only SMTP_USER and SMTP_PASS are required, like attendance-actions", () => {
  assert.equal(readMailConfig({ ...gmail, SMTP_USER: "" }), null);
  assert.equal(readMailConfig({ ...gmail, SMTP_PASS: "" }), null);
  assert.ok(readMailConfig(gmail));
});

test("defaults match the existing transporter: smtp.gmail.com, 465, TLS", () => {
  const config = readMailConfig(gmail);
  assert.equal(config.host, "smtp.gmail.com");
  assert.equal(config.port, 465);
  assert.equal(config.secure, true);
  assert.equal(config.replyTo, null);
  assert.equal(config.siteUrl, "https://albanaspeechacademy.com");
});

test("from always uses the SMTP account with the Albana display name", () => {
  assert.equal(readMailConfig(gmail).from, '"Albana Speech Academy" <albana.test@gmail.com>');
});

test("SMTP_SECURE is false only for the exact string false", () => {
  assert.equal(readMailConfig({ ...gmail, SMTP_PORT: "587", SMTP_SECURE: "false" }).secure, false);
  assert.equal(readMailConfig({ ...gmail, SMTP_SECURE: "no" }).secure, true);
});

test("rejects a malformed port", () => {
  assert.equal(readMailConfig({ ...gmail, SMTP_PORT: "abc" }), null);
  assert.equal(readMailConfig({ ...gmail, SMTP_PORT: "70000" }), null);
});

test("site url falls back like checkout-actions and never to localhost in production", () => {
  const base = { SMTP_USER: "u@gmail.com", SMTP_PASS: "p" };
  assert.equal(readMailConfig({ ...base, NEXT_PUBLIC_SITE_URL: "https://a.id", NEXT_PUBLIC_APP_URL: "https://b.id" }).siteUrl, "https://a.id");
  assert.equal(readMailConfig({ ...base, NEXT_PUBLIC_APP_URL: "https://b.id" }).siteUrl, "https://b.id");
  assert.equal(readMailConfig({ ...base, NODE_ENV: "development" }).siteUrl, "http://localhost:3000");
  assert.equal(readMailConfig({ ...base, NODE_ENV: "production" }), null);
  assert.equal(readMailConfig({ ...base, NODE_ENV: "production", SITE_URL: "http://albanaspeechacademy.com" }), null);
});
```

- [ ] **Step 9: Jalankan** `node --test lib/mail-config.test.mjs` dari `front/`. Expected: FAIL (modul belum ada).
- [ ] **Step 10: Implementasikan `readMailConfig`** di `front/lib/mail-config.ts` sesuai tabel aturan (tanpa `server-only` agar bisa dites; tidak mengimpor apa pun).
- [ ] **Step 11: Implementasikan `sendMail`** di `front/lib/server/mailer.ts`: `import "server-only"`; `import nodemailer from "nodemailer"` (sama dengan pola acuan); `nodemailer.createTransport({ host, port, secure, auth: { user, pass } })` dari `config`; `transporter.sendMail({ from: config.from, replyTo: config.replyTo ?? undefined, to, subject, html, text })`; kembalikan `{ messageId: info.messageId }`. Transport dibuat per panggilan seperti pola acuan (volume rendah). Fungsi ini **boleh melempar**; penangkapan galat dan log (setara `console.error("Gagal mengirim email …")` di pola acuan, tetapi tanpa alamat penerima) dilakukan pemanggil (`deliverInvoiceEmail`, Task 4).
- [ ] **Step 12: Tambahkan nama variabel Step 4 (tanpa nilai) ke `front/.env.example`.**
- [ ] **Step 13: Verifikasi** `node --test lib/mail-config.test.mjs` → PASS; `npx tsc --noEmit` → tanpa error baru; `npx eslint lib/mail-config.ts lib/server/mailer.ts` → bersih.
- [ ] **Step 14: Commit**

```powershell
git add front/lib/mail-config.ts front/lib/mail-config.test.mjs front/lib/server/mailer.ts front/.env.example
git commit -m "feat(email): konfigurasi SMTP dan modul pengirim"
```

---

### Task 2: Tabel log & klaim email

**Files:**
- Create: `front/supabase/migrations/20261118100000_academy_email_deliveries.sql`

**Interfaces:**
- Produces: tabel `public.academy_email_deliveries` dengan kolom di bawah; `kind ∈ ('payment_instructions','payment_confirmed')`, `status ∈ ('sending','sent','failed')`, unik `(invoice_id, kind)`.

- [ ] **Step 1: Tulis migrasi:**

```sql
create table public.academy_email_deliveries (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.academy_invoices(id) on delete cascade,
  kind text not null check (kind in ('payment_instructions', 'payment_confirmed')),
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  attempts smallint not null default 1 check (attempts between 1 and 20),
  message_id text,
  last_error text check (char_length(last_error) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invoice_id, kind)
);

alter table public.academy_email_deliveries enable row level security;
revoke all on public.academy_email_deliveries from public, anon, authenticated;
grant select, insert, update on public.academy_email_deliveries to service_role;
```

- [ ] **Step 2: Terapkan ke database lokal/staging** (`npx supabase db push` atau `migration up` sesuai alur proyek) dan jalankan SQL QA:
  - `QA-DB-01`: insert `(invoice_id=X, kind='payment_instructions')` dua kali → insert kedua gagal `23505` (unique violation).
  - `QA-DB-02`: `insert … on conflict (invoice_id, kind) do nothing returning id` untuk baris yang sudah ada → 0 baris.
  - `QA-DB-03`: sebagai role `anon`, `select * from academy_email_deliveries` → permission denied.
- [ ] **Step 3: Commit**

```powershell
git add front/supabase/migrations/20261118100000_academy_email_deliveries.sql
git commit -m "feat(db): tabel log pengiriman email tagihan"
```

---

### Task 3: Template Email #1 & #2

**Files:**
- Create: `front/lib/registration-email.ts`, `front/lib/registration-email.test.mjs`

**Interfaces:**
- Produces (semua murni, tanpa `server-only`):

```ts
export type EmailKind = "payment_instructions" | "payment_confirmed";
export type InvoiceStage = "initial" | "remaining";
export type PaymentMethod = "full" | "dp";
export type InvoiceAmounts = { invoiceId: number; subtotalIdr: number; uniqueCode: number; totalIdr: number };
export type InvoiceEmailData = {
  registrationId: number;
  fullName: string;
  offerTitle: string;
  batchNames: string;            // "Batch 3 + Batch 1" (gabungan, sama seperti halaman konfirmasi)
  paymentMethod: PaymentMethod;
  stage: InvoiceStage;
  invoice: InvoiceAmounts;
  bank: { bank: string; accountNumber: string; holder: string };
  receiptUrl: string;            // absolut, ke /register/konfirmasi/<token>
  whatsappUrl: string | null;    // sudah berisi ?text=
  firstSessionAt: string | null; // ISO; sesi pertama batch utama
  remaining: InvoiceAmounts | null; // hanya untuk Email #2 varian DP diterima
};
export type RenderedEmail = { subject: string; html: string; text: string };

export function invoiceStageLabel(stage: InvoiceStage, method: PaymentMethod): "Pembayaran lunas" | "DP" | "Pelunasan";
export function paymentProofMessage(d: { registrationId: number; invoiceId: number; fullName: string; offerTitle: string; batchNames: string; stageLabel: string; totalIdr: number }): string;
export function maskEmail(email: string): string;
export function paymentInstructionsEmail(d: InvoiceEmailData): RenderedEmail;
export function paymentConfirmedEmail(d: InvoiceEmailData): RenderedEmail;
```

**Naskah yang dipatok:**
- `invoiceStageLabel`: `remaining` → `"Pelunasan"`; `initial` + `dp` → `"DP"`; `initial` + `full` → `"Pembayaran lunas"` (sama dengan logika baris `stage` di halaman konfirmasi saat ini).
- `paymentProofMessage`: `Halo Admin Albana, saya {fullName} mengirim bukti transfer untuk pendaftaran #{registrationId} ({offerTitle} – {batchNames}), tagihan #{invoiceId} ({stageLabel}), total {rupiah}.`
- `maskEmail("budi.santoso@gmail.com")` → `"bu***@gmail.com"`; bagian lokal ≤ 2 karakter → karakter pertama + `***`.
- Subject Email #1: `Instruksi pembayaran pendaftaran #{registrationId} – Albana Speech Academy`.
- Subject Email #2: `full` atau `remaining` → `Pembayaran diterima – pendaftaran #{registrationId} terkonfirmasi`; `initial` + `dp` → `DP diterima – pendaftaran #{registrationId}`.
- Isi Email #1, berurutan: sapaan `Halo {fullName},`; "Pendaftaranmu untuk {offerTitle} – {batchNames} sudah kami terima."; tabel tagihan (Tagihan #id · tahap, Subtotal, Kode unik, **Total transfer**); kotak rekening (bank, nomor, a.n.); cara bayar 4 langkah — (1) transfer **tepat** sebesar total termasuk kode unik, (2) simpan bukti transfer, (3) kirim bukti lewat WhatsApp admin (tombol bila `whatsappUrl`), (4) admin memverifikasi lalu mengirim email konfirmasi; tombol "Lihat halaman pembayaran" → `receiptUrl`; catatan "Tautan berlaku 30 hari. Abaikan email ini jika kamu tidak merasa mendaftar."
- Isi Email #2 lunas/pelunasan: "Pembayaran {stageLabel} sebesar {total} untuk pendaftaran #{id} sudah kami terima. Kepesertaanmu di {offerTitle} – {batchNames} terkonfirmasi."; **Langkah selanjutnya**: (1) sesi pertama `{firstSessionAt dalam WIB, format "Sabtu, 6 Desember 2026 pukul 08.30 WIB"}` (baris dihilangkan bila `null`), (2) admin akan mengundangmu ke grup WhatsApp kelas melalui nomor yang kamu daftarkan, (3) hubungi admin lewat WhatsApp bila ada pertanyaan (tombol bila `whatsappUrl`).
- Isi Email #2 DP diterima: "DP sebesar {total} … sudah kami terima. Tempat kelasmu sudah diamankan."; lalu blok **Sisa pembayaran** dari `remaining` (Subtotal, Kode unik, Total transfer, rekening sama) dan instruksi transfer sisa sebelum sesi pertama; tombol "Lihat tagihan pelunasan" → `receiptUrl` (halaman konfirmasi memilih tagihan `pending` terbaru).
- HTML: tabel inline-style lebar maks 560px, latar putih, tanpa gambar eksternal; `text` adalah versi teks polos dengan isi yang sama.

- [ ] **Step 1: Tulis tes yang gagal** di `front/lib/registration-email.test.mjs` dengan fixture `base` (`fullName: "Budi Santoso"`, `registrationId: 41`, `invoice: { invoiceId: 77, subtotalIdr: 1_300_000, uniqueCode: 123, totalIdr: 1_300_123 }`, `paymentMethod: "full"`, `stage: "initial"`, bank BCA `1234567890` a.n. `PT Albana`, `receiptUrl: "https://albanaspeechacademy.com/register/konfirmasi/41.1799999999.x"`, `whatsappUrl: null`, `firstSessionAt: "2026-12-06T01:30:00Z"`, `remaining: null`). Tes:
  - `stage labels match the receipt page` — tiga kombinasi di atas.
  - `instructions email carries the exact transfer data` — subject persis `Instruksi pembayaran pendaftaran #41 – Albana Speech Academy`; `html` dan `text` sama-sama memuat hasil format `Intl` untuk `1_300_123` dan `123` (bangun string ekspektasi dengan `Intl.NumberFormat` yang sama, karena pemisahnya bisa NBSP), `"1234567890"`, `"PT Albana"`, dan `receiptUrl`.
  - `escapes participant data in html` — `fullName: '<img src=x onerror=alert(1)> & "Sari"'` → `html` tidak mengandung `<img`, mengandung `&lt;img` dan `&amp;` dan `&quot;`; `text` memuat nama asli.
  - `omits whatsapp button when no contact` — `whatsappUrl: null` → `html` tidak memuat `wa.me`; dengan `whatsappUrl: "https://wa.me/62811?text=x"` → memuat URL itu (dengan `&` di-escape menjadi `&amp;` bila ada).
  - `confirmed full payment lists next steps with WIB session time` — subject `Pembayaran diterima – pendaftaran #41 terkonfirmasi`; `text` memuat `6 Desember 2026` dan `08.30 WIB`.
  - `confirmed DP payment shows remaining invoice` — `paymentMethod: "dp"`, `invoice` DP `{ invoiceId: 77, subtotalIdr: 260_000, uniqueCode: 5, totalIdr: 260_005 }`, `remaining: { invoiceId: 78, subtotalIdr: 1_040_000, uniqueCode: 9, totalIdr: 1_040_009 }` → subject `DP diterima – pendaftaran #41`; `text` memuat total `1.040.009` dan `Sisa pembayaran`.
  - `null first session omits the schedule line` — `firstSessionAt: null` → `text` tidak memuat `Sesi pertama`.
  - `maskEmail hides the local part` — dua contoh di naskah di atas.
  - `payment proof message names participant and program` — memuat `Budi Santoso`, `#41`, `#77`.
- [ ] **Step 2: Jalankan** `node --test lib/registration-email.test.mjs` → FAIL (modul belum ada).
- [ ] **Step 3: Implementasikan** semua fungsi di Interfaces. Satu helper lokal `escapeHtml(value: string)` yang mengganti `& < > " '`; semua interpolasi ke `html` (termasuk URL di `href`) lewat helper ini. Format WIB: `Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })` + ` WIB`.
- [ ] **Step 4: Jalankan** tes → PASS; `npx eslint lib/registration-email.ts` bersih.
- [ ] **Step 5: Commit**

```powershell
git add front/lib/registration-email.ts front/lib/registration-email.test.mjs
git commit -m "feat(email): template instruksi dan konfirmasi pembayaran"
```

---

### Task 4: Layanan pengiriman `deliverInvoiceEmail`

**Files:**
- Create: `front/lib/server/registration-mail.ts`

**Interfaces:**
- Consumes: `readMailConfig` + `sendMail` (Task 1), tabel Task 2, template Task 3, `academyBillingClient()`, `createReceiptToken()` (`lib/receipt-token.ts`), `readPublishedContacts()` + `contactHref()` (`lib/server/public-contacts.ts`).
- Produces: `deliverInvoiceEmail(invoiceId: number, kind: EmailKind, options?: { retry?: boolean }): Promise<"sent" | "skipped" | "failed" | "unconfigured">` — **tidak pernah melempar**.

- [ ] **Step 1: Implementasikan dengan urutan berikut** (`import "server-only"`; seluruh badan di dalam `try/catch` yang mengembalikan `"failed"`):
  1. `const config = readMailConfig(process.env)`; `REGISTRATION_RECEIPT_SECRET` wajib. Bila salah satu tidak ada → `console.warn("Email tagihan dilewati: SMTP_USER/SMTP_PASS atau URL situs belum diisi", { invoiceId, kind })`, lakukan klaim langkah 2 lalu tandai baris `failed` dengan `last_error = "Pengirim email belum dikonfigurasi"`, dan kembalikan `"unconfigured"`. Baris `failed` ini yang memunculkan tombol **Kirim ulang** di admin setelah `.env` diisi (padanan guard `if (process.env.SMTP_USER && process.env.SMTP_PASS)` di pola acuan, tetapi tidak diam-diam hilang).
  2. **Klaim.** Tanpa `retry`: `upsert({ invoice_id, kind }, { onConflict: "invoice_id,kind", ignoreDuplicates: true }).select("id")`; 0 baris → `"skipped"`. Dengan `retry`: `update({ status: "sending", attempts: attempts + 1, updated_at: now })` dengan syarat `status = 'failed'` **atau** (`status = 'sending'` dan `updated_at < now() - 10 menit`); 0 baris → `"skipped"`. Untuk `attempts + 1`: baca baris dulu, lalu update dengan filter tambahan `attempts = <nilai lama>` (optimistic lock; 0 baris = admin lain sudah mengklaim → `"skipped"`).
  3. **Baca data** (service role): `academy_invoices` (`id, registration_id, stage, subtotal_idr, unique_code, total_idr, status, bank_accounts(bank,account_number,holder)`), `academy_registrations` (`id, full_name, email, offer_title, payment_method, primary_batch_slug`), `academy_registration_items` + `batches(title, sessions)` (nama batch digabung `" + "` urut `batch_slug`, sama dengan halaman konfirmasi; `firstSessionAt` = `sessions[0].starts_at` batch utama, ditafsirkan WIB seperti RPC: string tanpa zona + `+07:00`). Untuk `payment_confirmed`: invoice harus `status = 'verified'`; bila `stage = 'initial'` dan `payment_method = 'dp'` ambil tagihan `remaining` berstatus `pending` sebagai `remaining`. Untuk `payment_instructions`: invoice harus `status = 'pending'` (bila sudah diproses, tandai `failed` dengan `last_error = "Tagihan sudah tidak pending"` dan kembalikan `"skipped"`).
  4. `receiptUrl = ${config.siteUrl}/register/konfirmasi/${createReceiptToken(registrationId, secret)}`; `whatsappUrl` = `contactHref(kontak whatsapp)` + `?text=` + `encodeURIComponent(paymentProofMessage(...))` untuk Email #1 dan varian DP; untuk lunas/pelunasan pakai pesan polos `Halo Admin Albana, saya {fullName} (pendaftaran #{id}).`. Kegagalan membaca kontak → `whatsappUrl = null` (jangan gagalkan email).
  5. Render (`paymentInstructionsEmail` / `paymentConfirmedEmail`), `sendMail(config, { to: registration.email, ... })`.
  6. Sukses → `update({ status: "sent", message_id, last_error: null, updated_at })` → `"sent"`. Gagal → `update({ status: "failed", last_error: String(error.message).slice(0, 300), updated_at })`, `console.error("Email tagihan gagal", { invoiceId, kind })` → `"failed"`.
- [ ] **Step 2: Verifikasi tipe & lint:** `npx tsc --noEmit`, `npx eslint lib/server/registration-mail.ts`.
- [ ] **Step 3: Commit**

```powershell
git add front/lib/server/registration-mail.ts
git commit -m "feat(email): layanan kirim email tagihan dengan klaim anti-dobel"
```

(Perilaku diuji end-to-end di Task 5, 8, dan checklist QA karena butuh DB + SMTP.)

---

### Task 5: Trigger Email #1 saat pendaftaran diterima

**Files:**
- Modify: `front/app/api/registrations/route.ts` (blok sukses, sebelum `return json({ registrationId, ... }, 200)`)

**Interfaces:**
- Consumes: `deliverInvoiceEmail(result.invoiceId, "payment_instructions")` (Task 4); `after` dari `next/server`.

- [ ] **Step 1: Tambahkan** `after(() => deliverInvoiceEmail(result.invoiceId as number, "payment_instructions"));` tepat setelah `createReceiptToken` dan sebelum `return`. Jangan `await`. Retry dengan kunci idempoten sama tetap memanggilnya; klaim di Task 4 mengembalikan `"skipped"`.
- [ ] **Step 2: Verifikasi manual (dev server + SMTP uji, mis. Mailtrap/Ethereal atau penyedia asli ke inbox sendiri):** QA `QA-E1-01`, `QA-E1-04`, `QA-E1-05` di bawah lulus.
- [ ] **Step 3:** `npx tsc --noEmit`, `npx eslint app/api/registrations/route.ts`.
- [ ] **Step 4: Commit**

```powershell
git add front/app/api/registrations/route.ts
git commit -m "feat(register): kirim email instruksi pembayaran setelah pendaftaran"
```

---

### Task 5A: Kunci pendaftaran 30 menit setelah "Yakin"

Aturan: kiriman baru ditolak bila ada tagihan **`stage = 'initial'`** berstatus **`pending`** yang dibuat **kurang dari 30 menit** lalu, milik pendaftaran dengan **email sama** *atau* **nomor WhatsApp sama** (dinormalisasi). Batasan `stage = 'initial'` wajib: tagihan `remaining` dibuat saat admin memverifikasi DP dan tidak boleh mengunci ulang peserta.

**Files:**
- Create: `front/supabase/migrations/20261118110000_registration_pending_lock.sql`
- Modify: `front/app/api/registrations/route.ts`, `front/lib/registration-feedback.ts`, `front/lib/registration-feedback.test.mjs`, `front/components/register/registration-form.tsx`

**Interfaces:**
- Produces: RPC `receive_academy_registration` dapat mengembalikan `{ "status": "locked", "retryAfterSeconds": <int 1..1800> }`. Route membalas `423` dengan body `{ message: string, retryAfter: number }` dan header `Retry-After: <detik>`.

- [ ] **Step 1: Tulis migrasi** `create or replace function public.receive_academy_registration(request jsonb)` dengan menyalin **definisi terbaru** dari `20261117100000_program_owns_price_and_bundle.sql` (baris ~58 dst., bukan versi `20261113043955`) lalu menyisipkan blok berikut **tepat setelah** blok idempoten `if found then … return … 'received' … end if;` dan sebelum pemilihan batch. Ulangi `revoke`/`grant` yang sama di akhir migrasi.

```sql
  -- Kunci per identitas: email lalu WhatsApp, urutan tetap agar tidak deadlock.
  signup_email := lower(btrim(request->>'email'));
  signup_phone := regexp_replace(regexp_replace(coalesce(request->>'whatsapp', ''), '\D', '', 'g'), '^62', '0');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('albana-email:' || signup_email, 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('albana-wa:' || signup_phone, 0));
  select i.created_at into blocking_at
    from public.academy_invoices i
    join public.academy_registrations r on r.id = i.registration_id
    where i.stage = 'initial' and i.status = 'pending'
      and i.created_at > now() - interval '30 minutes'
      and (r.email = signup_email
        or regexp_replace(regexp_replace(r.whatsapp, '\D', '', 'g'), '^62', '0') = signup_phone)
    order by i.created_at desc limit 1;
  if found then
    return jsonb_build_object('status', 'locked', 'retryAfterSeconds',
      greatest(1, ceil(extract(epoch from blocking_at + interval '30 minutes' - now())))::int);
  end if;
```

Tambahkan `signup_email text; signup_phone text; blocking_at timestamptz;` di blok `declare`.

- [ ] **Step 2: SQL QA** di lokal/staging (panggil RPC dengan payload valid via service role):
  - `QA-DB-L1`: kirim A (email `a@x.id`, WA `0812…`) → `received`; kirim B program lain, email sama → `locked`, `retryAfterSeconds` ≈ 1800.
  - `QA-DB-L2`: kirim C email beda, WA `+62 812…` sama dengan A → `locked`.
  - `QA-DB-L3`: ulangi A dengan `idempotencyKey` sama → tetap `received` (bukan `locked`).
  - `QA-DB-L4`: `update academy_invoices set created_at = now() - interval '31 minutes' where …` → kirim B → `received`.
  - `QA-DB-L5`: `resolve_academy_invoice(<tagihan A>, 'verified', 'qa')` (A metode DP, sehingga tagihan `remaining` baru dibuat) → kirim B → `received`.
  - `QA-DB-L6`: `resolve_academy_invoice(<tagihan A>, 'rejected', 'qa')` → kirim B → `received`.
- [ ] **Step 3: Route** `app/api/registrations/route.ts`: sebelum cek `received`, tangani `result.status === "locked"`: hitung `retryAfter = Number(result.retryAfterSeconds)` (fallback 1800 bila bukan bilangan bulat 1..1800), jam buka kunci `new Date(Date.now() + retryAfter * 1000)` diformat `HH.mm WIB` (`Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })`). Balas `423`, header `Retry-After`, body `{ message, retryAfter }` dengan `message` persis: `Pendaftaranmu sebelumnya masih menunggu pembayaran. Selesaikan pembayaran sesuai email instruksi, atau daftar lagi setelah pukul {jam} WIB.` Ubah helper `json()` agar menerima header tambahan.
- [ ] **Step 4: Tes yang gagal** di `lib/registration-feedback.test.mjs`: `locked registration keeps the server message without program link` — `registrationFailure(423, "X")` → `{ message: "X" }` (tanpa `showProgramLink`); `registrationFailure(423)` → pesan fallback `Pendaftaranmu sebelumnya masih menunggu pembayaran. Coba lagi dalam 30 menit.`. Jalankan → FAIL, implementasikan cabang `423`, jalankan → PASS.
- [ ] **Step 5: Form** `registration-form.tsx`: status `423` **tidak** memanggil `setStaleKey` (form tidak dianggap basi) dan mengosongkan `idempotencyKey.current` agar percobaan setelah kunci lepas memakai kunci baru; modal ditutup (sudah tercakup jalur gagal Task 6) dan banner tampil; isian tetap.
- [ ] **Step 6: Verifikasi** `node --test lib/registration-feedback.test.mjs`, `npx tsc --noEmit`, `npx eslint` berkas yang disentuh; QA `QA-LOCK-01` s.d. `QA-LOCK-08`.
- [ ] **Step 7: Commit**

```powershell
git add front/supabase/migrations/20261118110000_registration_pending_lock.sql front/app/api/registrations/route.ts front/lib/registration-feedback.ts front/lib/registration-feedback.test.mjs front/components/register/registration-form.tsx
git commit -m "feat(register): kunci pendaftaran baru 30 menit selama tagihan menunggu pembayaran"
```

> Urutan eksekusi: kerjakan Task 5A **setelah Task 6** bila Step 5 bentrok dengan refaktor `submitRegistration` (keduanya menyentuh `registration-form.tsx`).

---

### Task 5B: Kunci nominal di server dengan tes (anti inspect element)

Tidak ada perubahan perilaku; task ini memastikan perilaku aman yang sudah ada tidak hilang saat refaktor.

**Files:**
- Modify: `front/lib/academy-registration-input.test.mjs`

**Interfaces:**
- Consumes: `parseAcademySubmission(input)` (sudah ada, `lib/academy-registration-input.ts`).

- [ ] **Step 1: Tulis tes** `money fields from the browser are dropped`: ambil payload valid yang sudah dipakai tes `form tunggal dipetakan…`, tambahkan `totalIdr: 1`, `subtotalIdr: 1`, `uniqueCode: 1`, `priceIdr: 1`, `bankAccountId: 99`, `invoiceId: 1`, `status: "verified"` → hasil `parseAcademySubmission` tidak `null` dan `Object.keys(result).sort()` **sama persis** dengan daftar: `["answers","email","expectedDpPercent","expectedPriceIdr","formKind","fullName","idempotencyKey","offerSlug","paymentMethod","primaryBatchSlug","secondaryBatchSlug","whatsapp"]`. Tes ini sengaja gagal bila kelak ada field baru — penambah field wajib meninjau apakah itu nilai uang.
- [ ] **Step 2: Tulis tes** `negative or fractional expected price is rejected`: `priceIdr: -1`, `priceIdr: 0.5`, `priceIdr: "1300000"` (string) masing-masing → `null` (sesuaikan nama field dengan bentuk payload yang dipakai `parseRegistration`). Bila salah satu lolos, perbaiki validasi di `lib/registration-input.ts` agar hanya bilangan bulat positif aman.
- [ ] **Step 3: Jalankan** `node --test lib/academy-registration-input.test.mjs` → PASS (Step 1 seharusnya langsung lulus karena objek hasil dibangun eksplisit; bila gagal, itu bug yang harus diperbaiki).
- [ ] **Step 4: SQL QA** terhadap RPC (service role, payload valid untuk batch harga 1.300.000):
  - `QA-DB-S1`: `expectedPriceIdr = 1000` → `changed`; tidak ada baris baru di `academy_registrations`.
  - `QA-DB-S2`: `paymentMethod = 'dp'`, `expectedDpPercent = 1` padahal DB 20 → `changed`.
  - `QA-DB-S3`: body mengandung `"subtotalIdr": 1, "uniqueCode": 1` → `received`; tagihan tersimpan `subtotal_idr = 1300000` dan `unique_code` hasil RPC.
  - `QA-DB-S4`: `offerSlug` paket aktif + `secondaryBatchSlug` batch milik program lain → `unavailable`.
  - `QA-DB-S5`: `update academy_invoices set total_idr = 1` → ditolak Postgres (kolom generated).
- [ ] **Step 5: Commit**

```powershell
git add front/lib/academy-registration-input.test.mjs front/lib/registration-input.ts
git commit -m "test(register): kunci nominal hanya dihitung di server"
```

---

### Task 6: Modal konfirmasi "Apakah data Anda sudah yakin?"

Satu komponen form dipakai semua program (Series, Speaker, BNSP, dan paket bundling), jadi modal otomatis berlaku untuk seluruh program.

**Files:**
- Modify: `front/lib/registration-form.ts`, `front/lib/registration-form.test.mjs`
- Create: `front/components/register/confirm-registration-dialog.tsx`
- Modify: `front/components/register/registration-form.tsx:99-150` (`handleSubmit`), `:204-207` (tombol)

**Interfaces:**
- Consumes: `initialBill(priceIdr, method, dpPercent)` dari `lib/billing.ts`.
- Produces:
  - `confirmationSummary(values: RegistrationValues, batch: RegistrationBatch, bundleTitle: string | null): { label: string; value: string }[]` di `lib/registration-form.ts`.
  - `ConfirmRegistrationDialog({ open, rows, submitting, onCancel, onConfirm }: { open: boolean; rows: { label: string; value: string }[]; submitting: boolean; onCancel(): void; onConfirm(): void })`.

- [ ] **Step 1: Tulis tes yang gagal** `confirmation summary lists identity, program, and transfer now` di `lib/registration-form.test.mjs`: dengan `fullName "Budi"`, `email "budi@x.id"`, `whatsapp "0812-3456-7890"`, `paymentMethod "dp"`, batch `priceIdr 1_300_000`, `dpPercent 20`, tanpa bundle → label berurutan persis `["Nama lengkap", "Email", "WhatsApp", "Program", "Pembayaran", "Transfer sekarang"]`; nilai Pembayaran `DP 20%`; nilai Transfer sekarang memuat `260.000` dan berakhiran ` + kode unik`. Dengan `bundleTitle "Paket Speaker + BNSP"` → nilai Program sama dengan `bundleTitle`. Metode `full` → `Lunas`.
- [ ] **Step 2: Jalankan** `node --test lib/registration-form.test.mjs` → FAIL.
- [ ] **Step 3: Implementasikan `confirmationSummary`.** Program tanpa bundle: `{batch.programName} – {batch.batchName}`. Sebelum menulis, pastikan `batch.priceIdr`/`batch.dpPercent` yang diterima form sudah nilai efektif paket ketika bundle dipilih (bandingkan dengan ringkasan **Biaya / Transfer sekarang** di langkah terakhir); bila tidak, terima harga efektif sebagai parameter tambahan agar modal = ringkasan langkah terakhir.
- [ ] **Step 4: Jalankan** tes → PASS.
- [ ] **Step 5: Buat `ConfirmRegistrationDialog`** dengan `<dialog>` native (`showModal()` saat `open` berubah true, `close()` saat false — memberi focus trap, `Esc`, dan backdrop tanpa dependensi):
  - `aria-labelledby` ke judul `Apakah data Anda sudah yakin?`; paragraf `Periksa kembali data berikut. Instruksi pembayaran akan dikirim ke email di bawah. Setelah dikirim, data tidak bisa diubah sendiri dan pendaftaran baru dengan email/WhatsApp ini ditahan 30 menit.`; `<dl>` dari `rows`.
  - Tombol kiri **Cek Lagi** (`type="button"`, `autoFocus`, gaya tombol sekunder sama dengan **Kembali** di form) → `onCancel`. Tombol kanan **Yakin / Lanjut** (`button-primary`) → `onConfirm`; saat `submitting` teks `Mengirim…` dan kedua tombol `disabled`.
  - Event `cancel` (Esc) → `preventDefault()` saat `submitting`, selain itu `onCancel`.
  - Token warna `var(--tone-*)` seperti form; lebar `min(32rem, calc(100vw - 2rem))`; tidak ada scroll horizontal di 375px.
- [ ] **Step 6: Ubah `registration-form.tsx`:**
  - State `const [confirmOpen, setConfirmOpen] = useState(false)`.
  - Di `handleSubmit`, setelah validasi lolos (tepat sebelum `submittingRef.current = true`): `setConfirmOpen(true); return;`.
  - Pindahkan blok `submittingRef.current = true` … `finally` ke fungsi `async function submitRegistration()` tanpa perubahan perilaku; tambahkan `setConfirmOpen(false)` di setiap jalur gagal (non-OK dan `catch`) agar banner galat terlihat. Pada sukses modal tetap terbuka dengan `Mengirim…` sampai `window.location.assign`.
  - Render `<ConfirmRegistrationDialog open={confirmOpen} rows={confirmationSummary(values, batch, withBundle && offer ? offer.title : null)} submitting={submitState === "submitting"} onCancel={() => setConfirmOpen(false)} onConfirm={submitRegistration} />` di dalam `<form>`.
  - Ganti teks tombol langkah terakhir dari `Kirim pendaftaran` menjadi `Tinjau & kirim` (submit kini membuka modal).
- [ ] **Step 7: Verifikasi** `npx tsc --noEmit`, `npx eslint components/register/confirm-registration-dialog.tsx components/register/registration-form.tsx lib/registration-form.ts`, lalu QA `QA-FORM-01` s.d. `QA-FORM-08` di browser.
- [ ] **Step 8: Commit**

```powershell
git add front/lib/registration-form.ts front/lib/registration-form.test.mjs front/components/register/confirm-registration-dialog.tsx front/components/register/registration-form.tsx
git commit -m "feat(register): modal konfirmasi data sebelum kirim pendaftaran"
```

---

### Task 7: Halaman Checkout

**Files:**
- Modify: `front/app/(web)/register/konfirmasi/[token]/page.tsx`

**Interfaces:**
- Consumes: `invoiceStageLabel`, `paymentProofMessage`, `maskEmail` (Task 3).

- [ ] **Step 1: Ubah query** `academy_registrations` agar juga memilih `full_name,email`.
- [ ] **Step 2: Ganti** perhitungan `stage` lokal dengan `invoiceStageLabel(invoice.stage, registration.payment_method)` dan teks WhatsApp dengan `paymentProofMessage({...})` (sekarang memuat nama + program – batch, sesuai kontrak pendaftaran).
- [ ] **Step 3: Ubah naskah:**
  - `<h1>`: `Checkout pembayaran` (route tetap).
  - Di bawah judul seksi, saat `invoice.status === "pending"`: `Instruksi pembayaran juga kami kirim ke {maskEmail(email)}. Periksa folder Spam/Promosi bila belum masuk dalam 10 menit.`
  - Panduan menjadi 4 langkah: (1) `Transfer tepat sebesar total di atas, termasuk kode unik.` (2) `Simpan bukti transfer.` (3) `Kirim bukti lewat tombol WhatsApp di bawah; pesannya sudah berisi nomor pendaftaran.` (4) `Admin memverifikasi pembayaran, lalu mengirim email konfirmasi ke alamat yang sama.`
  - Tombol WhatsApp tetap `Kirim Bukti Transfer ke WhatsApp`.
  - Di bawah panduan, saat `pending` dan tagihan `initial`: `Selama 30 menit ke depan, email dan nomor WhatsApp ini belum bisa dipakai untuk pendaftaran baru, kecuali pembayaran sudah diverifikasi. Salah isi data? Hubungi admin lewat WhatsApp.`- [ ] **Step 4: Verifikasi** `npx tsc --noEmit`, `npx eslint "app/(web)/register/konfirmasi/[token]/page.tsx"`, QA `QA-CO-01` s.d. `QA-CO-06`.
- [ ] **Step 5: Commit**

```powershell
git add "front/app/(web)/register/konfirmasi/[token]/page.tsx"
git commit -m "feat(register): halaman checkout dengan panduan konfirmasi dan info email"
```

---

### Task 8: Trigger Email #2 + status email di menu Tagihan

**Files:**
- Modify: `front/app/(admin)/admin/tagihan/actions.ts`, `page.tsx`, `TagihanClient.tsx`
- Modify: `front/lib/billing-rows.ts`, `front/lib/billing-rows.test.mjs`

**Interfaces:**
- Consumes: `deliverInvoiceEmail` (Task 4).
- Produces:
  - `BillingRow` tambahan `emails: { kind: EmailKind; status: "sending" | "sent" | "failed"; attempts: number }[]`.
  - Server action `resendInvoiceEmail(form: FormData): Promise<void>` (field `invoiceId`, `kind`).

- [ ] **Step 1: Tulis tes yang gagal** di `lib/billing-rows.test.mjs`: `invoice rows carry email delivery status` — registrasi dengan invoice yang punya `academy_email_deliveries: [{ kind: "payment_instructions", status: "failed", attempts: 2 }]` → `rows[0].emails` sama persis; invoice tanpa properti itu → `emails: []`.
- [ ] **Step 2: Jalankan** `node --test lib/billing-rows.test.mjs` → FAIL; implementasikan pemetaan di `invoiceRows`; jalankan lagi → PASS.
- [ ] **Step 3: `page.tsx`:** tambahkan `academy_email_deliveries(kind,status,attempts)` di dalam seleksi `academy_invoices(...)`.
- [ ] **Step 4: `actions.ts` `resolveInvoice`:** setelah `data?.status === "resolved"` dan `decision === "verified"`, panggil `after(() => deliverInvoiceEmail(id, "payment_confirmed"))` sebelum `revalidatePath`. Tagihan `rejected` tidak mengirim email.
- [ ] **Step 5: `actions.ts` `resendInvoiceEmail`:** `await requireAdminMember()`; validasi `invoiceId` integer ≥ 1 dan `kind ∈ EmailKind`; `const result = await deliverInvoiceEmail(id, kind, { retry: true })` (di-`await`, bukan `after`, agar admin melihat hasil); `revalidatePath("/admin/tagihan")`; bila `result === "unconfigured"` lempar `Error("Pengirim email belum dikonfigurasi.")`.
- [ ] **Step 6: `TagihanClient.tsx`:** di samping status tagihan, untuk tiap entri `emails` tampilkan teks kecil `Email instruksi: terkirim | mengirim | gagal` / `Email konfirmasi: …` (warna `text-admin-danger` untuk gagal). Bila `failed`, tampilkan `<form action={resendInvoiceEmail}>` dengan hidden `invoiceId` + `kind` dan tombol `Kirim ulang` bergaya tombol sekunder yang sudah ada (`border-admin-line`). Terapkan di kedua tampilan (kartu ~baris 95–130 dan tabel ~baris 185–206). Label tombol **Verifikasi** tetap.
- [ ] **Step 7: Verifikasi** `npx tsc --noEmit`, `npx eslint` untuk keempat berkas, QA `QA-ADM-01` s.d. `QA-ADM-07`.
- [ ] **Step 8: Commit**

```powershell
git add "front/app/(admin)/admin/tagihan/actions.ts" "front/app/(admin)/admin/tagihan/page.tsx" "front/app/(admin)/admin/tagihan/TagihanClient.tsx" front/lib/billing-rows.ts front/lib/billing-rows.test.mjs
git commit -m "feat(admin): email konfirmasi saat tagihan diverifikasi dan kirim ulang"
```

---

### Task 8A: Admin wajib mencocokkan nominal diterima

Menutup celah bukti transfer/teks WhatsApp yang diedit: admin mengetik nominal dari **mutasi rekening**, dan database menolak verifikasi bila tidak sama persis dengan `total_idr`.

**Files:**
- Create: `front/supabase/migrations/20261118120000_invoice_received_amount.sql`
- Modify: `front/lib/billing.ts`, `front/lib/billing.test.mjs`, `front/app/(admin)/admin/tagihan/actions.ts`, `TagihanClient.tsx`, `page.tsx`, `front/lib/billing-rows.ts`

**Interfaces:**
- Produces:
  - `parseRupiahInput(value: string): number | null` di `lib/billing.ts` — menerima `"1.300.123"`, `"Rp 1.300.123"`, `"1300123"`; mengembalikan bilangan bulat > 0 atau `null`.
  - RPC `resolve_academy_invoice(target_invoice_id bigint, decision text, reviewer text, received_idr bigint default null)` → tambahan status `amount_mismatch`.
  - Kolom `academy_invoices.received_idr bigint` (null sampai diverifikasi).

- [ ] **Step 1: Tes yang gagal** di `lib/billing.test.mjs`: `parseRupiahInput accepts bank-style formats` — tiga contoh di atas → `1300123`; `parseRupiahInput rejects ambiguous input` — `""`, `"0"`, `"-5"`, `"1,5"`, `"12a"`, `"1.300.123,50"` → `null`. Jalankan → FAIL; implementasikan (buang `Rp`, spasi, titik ribuan; tolak koma desimal dan karakter lain); jalankan → PASS.
- [ ] **Step 2: Migrasi:** `alter table public.academy_invoices add column received_idr bigint check (received_idr > 0);` lalu `drop function public.resolve_academy_invoice(bigint, text, text);` dan buat ulang dengan parameter keempat `received_idr bigint default null`. Salin badan versi terakhir (`20261113043955`, baris 210–248) dan tambahkan, setelah `if not found or bill.status <> 'pending' …`:

```sql
  if decision = 'verified' and received_idr is distinct from bill.total_idr then
    return jsonb_build_object('status', 'amount_mismatch');
  end if;
```

  serta isi `received_idr = resolve_academy_invoice.received_idr` pada `update … set status = decision …` saat `verified`. Ulangi `revoke`/`grant` untuk signature baru `(bigint, text, text, bigint)`.
- [ ] **Step 3: SQL QA:** `QA-DB-A1` verified dengan `received_idr = total - 1` → `amount_mismatch`, status tetap `pending`; `QA-DB-A2` `received_idr = total` → `resolved`, kolom terisi; `QA-DB-A3` `rejected` tanpa nominal → `resolved`.
- [ ] **Step 4: `resolveInvoice`:** untuk `decision === "verified"` baca `form.get("receivedIdr")` → `parseRupiahInput`; `null` → `throw new Error("Isi nominal yang diterima sesuai mutasi rekening.")`. Kirim ke RPC sebagai `received_idr`. Status `amount_mismatch` → `throw new Error("Nominal diterima tidak sama dengan total tagihan. Cek mutasi rekening, bukan tangkapan layar dari peserta. Selesaikan selisih dengan peserta lewat WhatsApp; tagihan tetap menunggu pembayaran.")`. Email #2 (Task 8) hanya dijadwalkan bila `resolved`.
- [ ] **Step 5: UI `TagihanClient.tsx`:** pada kedua form **Verifikasi**, tambahkan `<input name="receivedIdr" required inputMode="numeric" autoComplete="off" aria-label="Nominal diterima di mutasi rekening" placeholder={total diformat}>` sebelum tombol (lebar ±8rem, gaya input admin yang ada). Tampilkan `Total` tagihan jelas di baris yang sama, plus tautan `Chat peserta` (`https://wa.me/<nomor peserta dinormalisasi ke 62…>`, `target="_blank" rel="noopener noreferrer"`) untuk menyelesaikan selisih secara manual. Petunjuk kecil di bawah input: `Selisih? Hubungi peserta via WhatsApp. Kekurangan dibayar → isi jumlah semua mutasi. Kelebihan dikembalikan → isi sebesar total.` Untuk tagihan `verified`, `page.tsx`/`billing-rows.ts` ikut memilih dan meneruskan `received_idr` agar bisa ditampilkan di detail.
- [ ] **Step 6: Verifikasi** `node --test lib/billing.test.mjs lib/billing-rows.test.mjs`, `npx tsc --noEmit`, `npx eslint` berkas yang disentuh; QA `QA-SEC-11`, `QA-SEC-12`.
- [ ] **Step 7: Commit**

```powershell
git add front/supabase/migrations/20261118120000_invoice_received_amount.sql front/lib/billing.ts front/lib/billing.test.mjs "front/app/(admin)/admin/tagihan/actions.ts" "front/app/(admin)/admin/tagihan/TagihanClient.tsx" "front/app/(admin)/admin/tagihan/page.tsx" front/lib/billing-rows.ts
git commit -m "feat(admin): verifikasi tagihan wajib nominal mutasi sama dengan total"
```

---

### Task 8B: Catat transfer / kurang bayar + bukti transfer

Bergantung pada Task 8 (status email di kartu tagihan) dan Task 8A (`parseRupiahInput`, input **Nominal diterima**).

**Files:**
- Create: `front/supabase/migrations/20261118130000_invoice_payments.sql`
- Create: `front/app/api/admin/invoice-payments/route.ts`, `front/app/api/admin/invoice-payments/[id]/proof/route.ts`
- Create: `front/components/admin/billing/RecordPaymentDialog.tsx`, `front/components/admin/billing/PaymentHistory.tsx` (folder bersama karena dipakai juga menu Cicilan & Pelunasan, Task 8C)
- Modify: `front/lib/billing.ts`, `front/lib/billing.test.mjs`, `front/lib/billing-rows.ts`, `front/lib/billing-rows.test.mjs`, `front/lib/albana-routes.ts`, `front/lib/albana-routes.test.mjs`, `front/app/(admin)/admin/tagihan/page.tsx`, `TagihanClient.tsx`, `actions.ts`

**Interfaces:**
- Produces:
  - Tabel `public.academy_invoice_payments(id, invoice_id, amount_idr, paid_total_after_idr, balance_after_idr, proof_object_key, note, recorded_by, recorded_at, voided_by, voided_at)`.
  - RPC `record_invoice_payment(target_invoice_id bigint, amount_idr bigint, proof_key text, note text, recorder text) returns jsonb` → `{status:"recorded", paymentId, paidTotalIdr, balanceIdr}` | `{status:"changed"}` (tagihan tidak ada / bukan `pending`) | `{status:"invalid"}`.
  - RPC `void_invoice_payment(target_payment_id bigint, reviewer text) returns jsonb` → `{status:"voided"}` | `{status:"changed"}`.
  - `paymentBalance(totalIdr: number, amountsIdr: readonly number[]): { paidIdr: number; balanceIdr: number; state: "none" | "short" | "exact" | "over" }` di `lib/billing.ts` (`none` bila daftar kosong; `balanceIdr = totalIdr − paidIdr`).
  - `BillingRow`/invoice detail tambahan `payments: { id: number; amountIdr: number; balanceAfterIdr: number; note: string | null; recordedAt: string; recordedBy: string; voided: boolean }[]`.
  - `POST /api/admin/invoice-payments` (multipart: `invoiceId`, `amount`, `note?`, `proof`) → `201 { paymentId, paidTotalIdr, balanceIdr }` | `401/403/404/409/413/415/422/503 { error }`.
  - `GET /api/admin/invoice-payments/[id]/proof` → `302` ke signed URL | `404`.
  - Server action `voidInvoicePayment(form: FormData)` (field `paymentId`) di `tagihan/actions.ts`.

- [ ] **Step 1: Tes yang gagal** di `lib/billing.test.mjs`:
  - `payment balance reports shortfall` — `paymentBalance(1_300_123, [1_000_000])` → `{ paidIdr: 1_000_000, balanceIdr: 300_123, state: "short" }`.
  - `payment balance reports exact and over` — `[1_000_000, 300_123]` → `state "exact"`, `balanceIdr 0`; `[1_400_000]` → `state "over"`, `balanceIdr -99_877`.
  - `payment balance with no entries` — `[]` → `{ paidIdr: 0, balanceIdr: 1_300_123, state: "none" }`.
  Jalankan → FAIL; implementasikan; jalankan → PASS.
- [ ] **Step 2: Migrasi** `20261118130000_invoice_payments.sql`:

```sql
create table public.academy_invoice_payments (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.academy_invoices(id) on delete cascade,
  amount_idr bigint not null check (amount_idr > 0 and amount_idr <= 1000000000),
  paid_total_after_idr bigint not null,
  balance_after_idr bigint not null,           -- total − jumlah masuk; > 0 kurang, < 0 lebih
  proof_object_key text not null check (proof_object_key ~ '^invoice-[0-9]+/[0-9a-f-]{36}\.webp$'),
  note text check (char_length(note) <= 300),
  recorded_by text not null,
  recorded_at timestamptz not null default now(),
  voided_by text,
  voided_at timestamptz,
  check ((voided_by is null) = (voided_at is null))
);
create index academy_invoice_payments_invoice_idx on public.academy_invoice_payments (invoice_id);
alter table public.academy_invoice_payments enable row level security;
revoke all on public.academy_invoice_payments from public, anon, authenticated;
grant select, insert, update on public.academy_invoice_payments to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
```

  Tanpa policy `storage.objects` untuk bucket ini (hanya service role). Lalu dua fungsi `security invoker`, `set search_path = ''`, `revoke … from public, anon, authenticated` + `grant execute … to service_role`:
  - `record_invoice_payment`: tolak `invalid` bila `amount_idr` ≤ 0, `proof_key`/`recorder` kosong, atau `note` > 300; `select … from academy_invoices where id = target_invoice_id for update`; bukan `pending` → `changed`; `paid := coalesce(sum(amount_idr) filter (where voided_at is null), 0) + amount_idr`; `balance := total_idr − paid`; insert baris dengan snapshot itu; kembalikan `recorded`.
  - `void_invoice_payment`: kunci baris pembayaran + tagihannya `for update`; hanya bila belum di-void dan tagihan masih `pending`; set `voided_by`, `voided_at = now()`. Snapshot baris lain **tidak** dihitung ulang (riwayat apa adanya; ringkasan dihitung langsung dari baris aktif).
- [ ] **Step 3: SQL QA:** `QA-DB-P1` catat 1.000.000 pada tagihan total 1.300.123 → `balance_after_idr = 300123`; `QA-DB-P2` catat 300.123 → `0`; `QA-DB-P3` catat pada tagihan `verified` → `changed`; `QA-DB-P4` void P1 → `voided`, void kedua kali → `changed`; `QA-DB-P5` dua `record` bersamaan pada tagihan sama → snapshot kedua memperhitungkan yang pertama (serial karena `for update`); `QA-DB-P6` `select` lewat anon key dan `storage.from('payment-proofs').list()` dengan anon key → ditolak/kosong.
- [ ] **Step 4: Route `POST /api/admin/invoice-payments`** (`runtime = "nodejs"`), urutan:
  1. Guard admin persis seperti `app/api/upload/route.ts` (sesi Supabase + baris `admin_users`); tolak `content-length` > 6 MiB (`413`).
  2. `formData()`: `invoiceId` bilangan bulat ≥ 1; `amount` → `parseRupiahInput` (Task 8A); `note` dipangkas, ≤ 300; `proof` wajib `File`, ukuran 1 B–`MAX_IMAGE_SOURCE`, tipe `image/jpeg|png|webp` (`415` selain itu). Galat validasi → `422` dengan pesan Indonesia.
  3. `prepareImage(source, 200, 200)` (dekode ulang dengan Sharp → WebP, EXIF hilang; gagal dekode → `422 "Bukti bukan gambar yang valid."`).
  4. Kunci objek `invoice-${invoiceId}/${crypto.randomUUID()}.webp`; `storage.from("payment-proofs").upload(key, bytes, { contentType: "image/webp", upsert: false })`.
  5. RPC `record_invoice_payment` dengan `recorder = user.id`. Status bukan `recorded` → hapus objek yang baru diunggah, balas `409 "Tagihan sudah diproses."` (`changed`) atau `422`.
  6. `201 { paymentId, paidTotalIdr, balanceIdr }`, header `Cache-Control: no-store`. Log galat tanpa nominal/nama peserta.
- [ ] **Step 5: Route `GET /api/admin/invoice-payments/[id]/proof`:** id cocok `^[1-9]\d{0,14}$`; guard admin (tanpa sesi → `404`, sama dengan `media/[id]`); baca `proof_object_key`; `createSignedUrl(key, 60)`; `302` dengan `Cache-Control: no-store`. Bukti yang sudah di-void tetap bisa dilihat (jejak audit).
- [ ] **Step 6: Proxy allowlist** `lib/albana-routes.ts`: izinkan `"/api/admin/invoice-payments"` dan `/^\/api\/admin\/invoice-payments\/[0-9]+\/proof$/`. Tes di `lib/albana-routes.test.mjs`: kedua path diizinkan; `/api/admin/invoice-payments/abc/proof` dan `/api/admin/invoice-payments/1/proof/x` ditolak. Jalankan → PASS.
- [ ] **Step 7: Data ke UI:** `page.tsx` menambah `academy_invoice_payments(id,amount_idr,balance_after_idr,note,recorded_at,recorded_by,voided_at)` di dalam `academy_invoices(...)`; `billing-rows.ts` memetakan ke `payments` (urut `recorded_at` naik). Tes `billing-rows.test.mjs`: `invoice rows carry payment history` (pemetaan + `voided: true` bila `voided_at` terisi; tanpa properti → `[]`). **Jangan** meneruskan `proof_object_key` ke client — cukup `id`, bukti dibuka lewat route Step 5.
- [ ] **Step 8: `RecordPaymentDialog.tsx`** (client; `components/ui/dialog.tsx` seperti dialog admin lain, mis. `admins/AddAdminFromMemberDialog.tsx`):
  - Props: `{ invoiceId: number; totalIdr: number; recordedIdr: number[]; open: boolean; onOpenChange(open: boolean): void }`.
  - Judul `Catat transfer masuk`; deskripsi `Tagihan #{invoiceId} · Total {rupiah}`. Ringkasan tiga baris: `Total tagihan`, `Sudah tercatat`, `Sisa sebelum catatan ini`.
  - Field **Nominal ditransfer*** (`inputMode="numeric"`, `autoComplete="off"`, ditampilkan berformat ribuan saat blur); **Bukti transfer*** (dropzone); **Catatan** (opsional, `maxLength=300`, placeholder `mis. transfer kedua via BCA mobile`).
  - Pratinjau langsung dari `paymentBalance(totalIdr, [...recordedIdr, nominal])`: `short` → `Kurang {rupiah(balance)}` (warna danger); `exact` → `Pas, siap diverifikasi` (hijau); `over` → `Lebih {rupiah(-balance)} — kembalikan selisih manual` (amber).
  - Dropzone: area bertanda `role="button"` `tabIndex=0` (Enter/Spasi membuka picker) + `<input type="file" accept="image/jpeg,image/png,image/webp" hidden>`; `onDragOver`/`onDragLeave`/`onDrop` ikuti pola `app/(admin)/admin/settings/LegalityClient.tsx`; hanya satu file; tampilkan thumbnail `URL.createObjectURL` (+ `revokeObjectURL` saat ganti/tutup), nama, ukuran, tombol `Ganti`/`Hapus`. File > 10 MiB atau tipe lain → pesan galat di bawah dropzone, tidak dikirim. Sebelum unggah, kompres dengan `compressImage` dari `lib/file-compress.ts` (sesuai `docs/design-global/image-compression-storage-pipeline.md`).
  - Kirim: `fetch("/api/admin/invoice-payments", { method: "POST", body: formData })`; tombol `Simpan catatan` → `Menyimpan…` dan nonaktif; sukses → tutup, `toast.success("Transfer tercatat")` (sonner), `router.refresh()`; galat → tampilkan `error` dari respons di dalam modal, isian tetap.
- [ ] **Step 9: `PaymentHistory.tsx`** dirender di tiap kartu tagihan pada `AdminSheet` (setelah baris subtotal, `TagihanClient.tsx` ~baris 280):
  - Bila `payments` aktif kosong dan status `pending`: hanya tombol sekunder `Catat transfer` (ikon `Plus` 14px, `text-[13px] text-admin-text-secondary underline-offset-2 hover:underline`, tanpa latar) — tidak mencolok.
  - Bila ada catatan: blok ringkasan `Total · Sudah masuk · Sisa` dengan chip `Kurang Rp…` / `Pas` / `Lebih Rp…` (`StatusChip` tone danger/success/warning), lalu daftar riwayat: waktu WIB, nominal, `Sisa setelahnya` (snapshot), catatan, tautan `Lihat bukti` (`/api/admin/invoice-payments/{id}/proof`, tab baru), dan untuk tagihan `pending` tombol kecil `Batalkan` (form `voidInvoicePayment`, konfirmasi `window.confirm("Batalkan catatan transfer ini? Bukti tetap tersimpan.")`). Baris yang di-void tampil dicoret dengan label `Dibatalkan`, tidak dihitung di ringkasan.
  - Tombol `Catat transfer` tetap ada di bawah riwayat selama tagihan `pending`.
- [ ] **Step 10: Pengingat sebelum lunas** di `TagihanClient.tsx`:
  - Baris tabel/kartu daftar: bila sisa aktif > 0, chip kecil `Kurang {rupiah}` di samping status tagihan.
  - Form **Verifikasi** (Task 8A): bila ada catatan aktif, isi awal `receivedIdr` dengan jumlah masuk dan tampilkan peringatan `Tercatat {rupiah(paid)} dari {rupiah(total)}. Masih kurang {rupiah}.` bila `short`. Tidak memblokir; RPC 8A tetap menolak bila nominal ≠ total.
- [ ] **Step 11: `voidInvoicePayment`** di `actions.ts`: `requireAdminMember()`, ambil `user.id`, validasi `paymentId`, panggil RPC `void_invoice_payment`; `changed` → `throw new Error("Catatan sudah dibatalkan atau tagihan sudah diproses.")`; `revalidatePath("/admin/tagihan")`.
- [ ] **Step 12: Verifikasi:** `node --test lib/billing.test.mjs lib/billing-rows.test.mjs lib/albana-routes.test.mjs`, `npx tsc --noEmit`, `npx eslint` berkas yang disentuh, QA bagian **E2**.
- [ ] **Step 13: Commit**

```powershell
git add front/supabase/migrations/20261118130000_invoice_payments.sql front/app/api/admin/invoice-payments front/components/admin/billing front/lib/billing.ts front/lib/billing.test.mjs front/lib/billing-rows.ts front/lib/billing-rows.test.mjs front/lib/albana-routes.ts front/lib/albana-routes.test.mjs "front/app/(admin)/admin/tagihan"
git commit -m "feat(admin): catat transfer masuk dan bukti untuk kasus kurang bayar"
```

---

### Task 8C: Menu Cicilan & Pelunasan

Bergantung pada Task 8, 8A, 8B. Tidak ada migrasi.

**Files:**
- Create: `front/lib/installments.ts`, `front/lib/installments.test.mjs`
- Create: `front/components/admin/billing/InvoiceCard.tsx`
- Create: `front/app/(admin)/admin/cicilan/page.tsx`, `CicilanClient.tsx`, `loading.tsx` (salin pola `tagihan/loading.tsx`)
- Modify: `front/app/(admin)/admin/tagihan/TagihanClient.tsx`, `front/app/(admin)/admin/tagihan/actions.ts`, `front/components/admin/billing/RecordPaymentDialog.tsx`
- Modify: `front/lib/admin-nav.ts`, `front/lib/admin-nav.test.mjs`, `front/components/admin/shell/AdminShell.tsx`, `front/lib/albana-routes.ts`, `front/lib/albana-routes.test.mjs`

**Interfaces:**
- Consumes: `BillingRegistration` + invoice `payments`, `received_idr` (Task 8/8A/8B), `paymentBalance()` (8B), `RecordPaymentDialog`, `PaymentHistory` (8B), `resolveInvoice`, `voidInvoicePayment`, `resendInvoiceEmail` (`tagihan/actions.ts`).
- Produces:

```ts
// lib/installments.ts (murni)
export type InstallmentStage = "awaiting_dp" | "awaiting_payment" | "awaiting_remaining" | "short" | "paid" | "closed";
export type InstallmentSummary = {
  registrationId: number;
  priceIdr: number;        // price_idr_at_signup
  receivedIdr: number;     // Σ tagihan verified (received_idr ?? total_idr) + Σ catatan aktif pada tagihan pending
  outstandingIdr: number;  // Σ (total_idr − catatan aktif) tagihan pending + perkiraan sisa DP bila tagihan remaining belum terbit
  stage: InstallmentStage;
  progress: number;        // 0..1, receivedIdr / (receivedIdr + outstandingIdr), dibulatkan 2 desimal
  lastActivityAt: string;  // terbaru dari received_at, reviewed_at, recorded_at
};
export function installmentSummary(registration: BillingRegistration): InstallmentSummary;
export const INSTALLMENT_FILTERS = ["semua", "pelunasan", "kurang", "lunas"] as const;
export function matchesInstallmentFilter(summary: InstallmentSummary, filter: (typeof INSTALLMENT_FILTERS)[number]): boolean;
```

  - `InvoiceCard({ invoice, registration, context }: { invoice: BillingInvoice; registration: BillingRegistration; context: "tagihan" | "cicilan" })` di `components/admin/billing/InvoiceCard.tsx`.
  - `RecordPaymentDialog` prop tambahan `title: string` (bawaan `Catat transfer masuk`).

**Aturan tahap (`stage`), urutan pertama yang cocok:**
1. Tidak ada tagihan selain `rejected`/`cancelled` → `closed`.
2. Ada tagihan `pending` dengan catatan aktif dan sisa > 0 → `short`.
3. Tagihan `initial` `pending` + metode `dp` → `awaiting_dp`; + metode `full` → `awaiting_payment`.
4. Tagihan `remaining` `pending` → `awaiting_remaining`.
5. Semua tagihan non-batal `verified` dan (metode `full` atau tagihan `remaining` sudah `verified`) → `paid`.

**Perkiraan sisa DP:** bila metode `dp` dan tagihan `remaining` belum ada, tambahkan `priceIdr − subtotal_idr tagihan initial` ke `outstandingIdr` (tanpa kode unik; label UI `perkiraan, kode unik menyusul`).

**Filter:** `semua` = bukan `closed`; `pelunasan` = `awaiting_dp | awaiting_remaining` atau metode `dp` dengan `short`; `kurang` = `short`; `lunas` = `paid`.

- [ ] **Step 1: Tes yang gagal** `lib/installments.test.mjs` (fixture harga 1.300.000, DP 20%):
  - `dp awaiting first payment estimates the remaining` — initial DP `{ subtotal 260_000, code 5, total 260_005, pending }`, tanpa catatan → `stage "awaiting_dp"`, `receivedIdr 0`, `outstandingIdr 260_005 + 1_040_000`.
  - `verified dp with two installments on remaining` — initial `verified` (`received_idr 260_005`), remaining `{ total 1_040_009, pending }` dengan catatan aktif 500_000 dan 300_000 → `stage "short"`, `receivedIdr 1_060_005`, `outstandingIdr 240_009`, `progress 0.82`.
  - `voided installment is ignored` — catatan 300_000 di atas di-void → `outstandingIdr 540_009`.
  - `fully settled dp is paid` — initial dan remaining `verified` → `stage "paid"`, `outstandingIdr 0`, `progress 1`.
  - `full payment paid in parts` — metode `full`, initial `{ total 1_300_123, pending }` catatan 1_000_000 → `stage "short"`, `outstandingIdr 300_123`.
  - `rejected only registration is closed and hidden from semua` — `stage "closed"`, `matchesInstallmentFilter(…, "semua") === false`.
  - `filters` — `pelunasan` memuat `awaiting_dp` dan DP-`short`, tidak memuat full-`short`; `lunas` hanya `paid`.
  Jalankan `node --test lib/installments.test.mjs` → FAIL.
- [ ] **Step 2: Implementasikan** `lib/installments.ts` (pakai `paymentBalance` untuk tagihan pending) → tes PASS.
- [ ] **Step 3: Ekstrak `InvoiceCard`** dari blok kartu di `AdminSheet` `TagihanClient.tsx` (judul tagihan + chip status, subtotal + kode = total, status email + Kirim ulang, `PaymentHistory`, tombol Catat, form Verifikasi dengan input Nominal diterima, Tolak) tanpa mengubah perilaku. `TagihanClient` memakai `<InvoiceCard context="tagihan" …/>`. Label tombol catat menurut tagihan: initial+dp → `Catat DP`; remaining → `Catat cicilan / pelunasan`; initial+full → `Catat transfer`; judul modal sama dengan labelnya. Jalankan ulang QA `QA-PAY-01..03` untuk memastikan Tagihan tidak berubah.
- [ ] **Step 4: `tagihan/actions.ts`:** setiap aksi (`resolveInvoice`, `voidInvoicePayment`, `resendInvoiceEmail`) memanggil juga `revalidatePath("/admin/cicilan")`.
- [ ] **Step 5: Navigasi & akses:**
  - `lib/admin-nav.ts`: tambah `"wallet"` ke union `AdminNavIcon` dan modul setelah Tagihan: `{ label: "Cicilan & Pelunasan", href: "/admin/cicilan", icon: "wallet", description: "Pantau sisa DP, cicilan, dan kekurangan bayar per peserta. Catat setiap transfer beserta buktinya; verifikasi saat nominal pas." }`.
  - `AdminShell.tsx`: petakan `wallet: Wallet` (lucide-react) di peta ikon.
  - `lib/albana-routes.ts`: tambah `"/admin/cicilan"` ke daftar rute admin yang diizinkan.
  - Tes: `admin-nav.test.mjs` `cicilan belongs to Pendaftaran` (`resolveAdminNav("/admin/cicilan")` → group `pendaftaran`, module label `Cicilan & Pelunasan`); `albana-routes.test.mjs` path `/admin/cicilan` diizinkan. Jalankan → PASS.
- [ ] **Step 6: `cicilan/page.tsx`** (server, `dynamic = "force-dynamic"`): `await requireAdminMember()`; baca `searchParams` `{ q?: string; tahap?: string }` (`tahap` di luar `INSTALLMENT_FILTERS` → `semua`); query `academy_registrations` dengan seleksi yang sama seperti `tagihan/page.tsx` (termasuk `received_idr`, `academy_email_deliveries`, `academy_invoice_payments`), `order received_at desc`, `limit 200`, pencarian `q` dengan `ilikePattern` seperti Tagihan; hitung `installmentSummary` per baris di server, saring dengan `matchesInstallmentFilter`, urutkan `stage` (`short`, `awaiting_remaining`, `awaiting_dp`, `awaiting_payment`, `paid`) lalu `lastActivityAt` terbaru. Kirim ke client hanya data yang sudah dipakai Tagihan (tanpa `proof_object_key`).
- [ ] **Step 7: `CicilanClient.tsx`:**
  - Toolbar: `TableToolbar` pencarian `Cari nama atau email…` + tab tahap `Semua · Menunggu pelunasan · Ada kekurangan · Lunas` (link `?tahap=`; pertahankan `q`), masing-masing dengan jumlah.
  - Kartu ringkasan di atas tabel: `Total sisa tertagih` (Σ `outstandingIdr` dari daftar tersaring) dan `Peserta dengan kekurangan` (jumlah `short`).
  - `DataTable` `stackOnMobile`, kolom: **Peserta** (nama, email), **Program – batch**, **Metode** (`Lunas` / `DP 20%`), **Harga**, **Sudah masuk**, **Sisa** (danger bila > 0; tambahkan `perkiraan` bila mengandung perkiraan sisa DP), **Tahap** (`StatusChip`: `Kurang bayar` danger, `Menunggu DP`/`Menunggu pembayaran`/`Menunggu pelunasan` warning, `Lunas` success), **Progres** (bar `role="progressbar"` `aria-valuenow` persen + teks), **Aksi** (`Detail`).
  - `Detail` membuka `AdminSheet` berjudul `#{id} · {nama}`; isi: ringkasan (harga, sudah masuk, sisa, tahap), lalu `InvoiceCard context="cicilan"` untuk tiap tagihan urut id naik. Catat cicilan/pelunasan dan Verifikasi dilakukan di sini dengan modal + unggah bukti yang sama.
  - Kosong: `EmptyState` `Belum ada cicilan atau pelunasan` / saat mencari `Tidak ada peserta yang cocok`.
- [ ] **Step 8: Verifikasi** `node --test lib/installments.test.mjs lib/admin-nav.test.mjs lib/albana-routes.test.mjs lib/billing-rows.test.mjs`, `npx tsc --noEmit`, `npx eslint` berkas yang disentuh, QA bagian **E3**.
- [ ] **Step 9: Commit**

```powershell
git add front/lib/installments.ts front/lib/installments.test.mjs front/components/admin/billing "front/app/(admin)/admin/cicilan" "front/app/(admin)/admin/tagihan/TagihanClient.tsx" "front/app/(admin)/admin/tagihan/actions.ts" front/lib/admin-nav.ts front/lib/admin-nav.test.mjs front/components/admin/shell/AdminShell.tsx front/lib/albana-routes.ts front/lib/albana-routes.test.mjs
git commit -m "feat(admin): menu cicilan dan pelunasan dengan pencatatan bukti transfer"
```

---

### Task 9: Regression & build

- [ ] **Step 1:** dari `front/`: `node --test lib/*.test.mjs` → semua PASS.
- [ ] **Step 2:** `npx tsc --noEmit` → tanpa error baru dibanding `main` sebelum task 1 (catat error lama bila ada).
- [ ] **Step 3:** `npm run build` → sukses.
- [ ] **Step 4:** Jalankan seluruh checklist QA di bawah pada staging dengan SMTP asli; isi kolom Hasil.
- [ ] **Step 5:** Perbarui [kontrak pendaftaran](../registration/registration-contract.md) bagian *Alur pendaftaran situs*: modal konfirmasi, checkout, Email #1/#2. Commit `docs: alur konfirmasi, checkout, dan email pendaftaran`.

---

## Arsitektur ringkas

### Data & state

```
academy_registrations 1─* academy_registration_items *─1 batches(title, sessions)
        │
        └─1─* academy_invoices (stage initial|remaining, status pending|verified|rejected|cancelled)
                     │
                     ├─1─* academy_email_deliveries (kind payment_instructions|payment_confirmed,
                     │                               status sending|sent|failed, unique(invoice_id, kind))
                     └─1─* academy_invoice_payments (amount, snapshot paid_total/balance, proof_object_key,
                                                     void) ──▶ storage bucket privat payment-proofs
```

State form (client): `step` → validasi → `confirmOpen` → `submitState: idle | submitting | success` → redirect ke checkout.

### Alur API & trigger email

```
[Form] Tinjau & kirim ─▶ validateRegistration ─▶ Modal
   ├─ Cek Lagi ─▶ tutup modal, isian tetap
   └─ Yakin / Lanjut ─▶ POST /api/registrations
          └─ RPC receive_academy_registration
                 ├─ locked (email/WA sama punya tagihan initial pending < 30 menit) ─▶ 423 + Retry-After ─▶ banner, isian tetap
                 └─ received
                        ├─ respons 200 { redirectUrl } ─▶ /register/konfirmasi/[token] (Checkout)
                        └─ after(): deliverInvoiceEmail(invoiceId, payment_instructions) ─▶ EMAIL #1

[Admin /admin/tagihan] Verifikasi ─▶ resolveInvoice ─▶ RPC resolve_academy_invoice ─▶ resolved
          ├─ (DP initial) RPC membuat tagihan remaining
          └─ after(): deliverInvoiceEmail(invoiceId, payment_confirmed) ─▶ EMAIL #2
                         (varian: Lunas | DP diterima + sisa | Pelunasan diterima)

[Admin Detail tagihan] Catat transfer ─▶ modal (nominal + bukti, drag & drop / file picker)
          ─▶ POST /api/admin/invoice-payments ─▶ Sharp → bucket payment-proofs ─▶ RPC record_invoice_payment
          ─▶ riwayat + "Kurang Rp…" tampil di kartu & di samping tombol Verifikasi (pengingat)

[Admin /admin/cicilan] daftar per peserta (installmentSummary: harga, masuk, sisa, tahap, progres)
          ─▶ Detail ─▶ InvoiceCard yang sama ─▶ Catat DP / cicilan / pelunasan (alur Task 8B) ─▶ Verifikasi (Task 8A)

[Admin] Kirim ulang (status failed / sending > 10 menit) ─▶ resendInvoiceEmail ─▶ deliverInvoiceEmail(retry)
```

### Komponen UI

| Komponen | Lokasi | Perubahan |
|---|---|---|
| Form pendaftaran | `components/register/registration-form.tsx` | Submit membuka modal; tombol `Tinjau & kirim`. |
| Modal konfirmasi | `components/register/confirm-registration-dialog.tsx` | Baru. |
| Checkout | `app/(web)/register/konfirmasi/[token]/page.tsx` | Judul, 4 langkah, info email tersamarkan, pesan WA bernama. |
| Tagihan admin | `app/(admin)/admin/tagihan/TagihanClient.tsx` | Status email + Kirim ulang; input Nominal diterima; chip `Kurang Rp…`. |
| Catat transfer | `components/admin/billing/RecordPaymentDialog.tsx` | Baru: modal nominal + dropzone bukti + pratinjau selisih. |
| Riwayat transfer | `components/admin/billing/PaymentHistory.tsx` | Baru: ringkasan sisa, daftar catatan, lihat bukti, batalkan. |
| Kartu tagihan | `components/admin/billing/InvoiceCard.tsx` | Baru (ekstraksi): dipakai Tagihan dan Cicilan & Pelunasan. |
| Cicilan & Pelunasan | `app/(admin)/admin/cicilan/` | Baru: daftar per peserta (harga, sudah masuk, sisa, tahap, progres) + panel detail dengan kartu tagihan yang sama. |

---

## Checklist pengujian (QA)

Lingkungan: staging dengan migrasi Task 2, SMTP asli, minimal satu batch terbuka per program (Public Speaking Series, Speaker Training, Sertifikasi BNSP) dan satu paket bundling aktif, rekening aktif, kontak WhatsApp terbit. Gunakan alamat email uji milik tim.

### A. Email sender

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| QA-SND-01 | Koneksi SMTP | Jalankan perintah Task 1 Step 5 | `SMTP OK` | |
| QA-SND-02 | Autentikasi | Daftar dengan email Gmail tim → Show original | `SPF: PASS`, `DKIM: PASS` (gmail.com) | |
| QA-SND-03 | Header | Buka email yang sama | From `"Albana Speech Academy" <alamat SMTP_USER>`; Reply-To = `EMAIL_REPLY_TO` bila diisi, bila tidak header Reply-To tidak ada | |
| QA-SND-05 | App Password salah | Ganti `SMTP_PASS` lalu daftar | Pendaftaran tetap 200; baris email `failed` dengan galat `535`; tidak ada password di log | |
| QA-SND-06 | Variabel lama tetap jalan | Jalankan alur yang masih memakai `attendance-actions.ts` (bila rutenya aktif di lingkungan uji) | `.env` yang sama tetap dipakai kedua jalur tanpa perubahan | |
| QA-SND-04 | Inbox | Kirim ke Gmail, Outlook, Yahoo | Masuk Inbox/Promosi, bukan Spam | |

### B. Form & modal (ulang untuk tiap program + bundling)

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-FORM-01 | Isi semua langkah valid, tekan `Tinjau & kirim` | Modal tampil dengan judul *Apakah data Anda sudah yakin?*; 6 baris ringkasan sesuai isian; belum ada request ke `/api/registrations` (cek Network) | |
| QA-FORM-02 | Ada field wajib kosong lalu tekan `Tinjau & kirim` | Modal tidak tampil; pindah ke langkah dengan galat pertama | |
| QA-FORM-03 | Klik **Cek Lagi** | Modal tertutup, semua isian utuh, tetap di langkah terakhir, fokus kembali ke tombol | |
| QA-FORM-04 | Tekan `Esc` saat modal terbuka (tidak mengirim) | Sama seperti Cek Lagi | |
| QA-FORM-05 | Klik **Yakin / Lanjut** dua kali cepat | Satu request POST; tombol `Mengirim…` nonaktif; redirect ke checkout | |
| QA-FORM-06 | Paket bundling dipilih, metode DP | Program = judul paket; Transfer sekarang = DP paket, sama dengan ringkasan langkah terakhir | |
| QA-FORM-07 | Harga batch diubah admin selama pengisian, lalu Yakin | Modal tertutup, banner harga berubah (409) tampil, isian utuh | |
| QA-FORM-08 | Matikan jaringan lalu Yakin | Modal tertutup, banner koneksi tampil; nyalakan jaringan dan kirim ulang → satu pendaftaran | |
| QA-FORM-09 | Aksesibilitas | Keyboard saja: Tab tidak keluar dari modal; pembaca layar membacakan judul modal; layar 375px tanpa scroll horizontal | |

### B2. Kunci 30 menit

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-LOCK-01 | Setelah Yakin & tiba di checkout, buka program lain di tab baru, isi email sama, Yakin | Banner `Pendaftaranmu sebelumnya masih menunggu pembayaran… setelah pukul HH.mm WIB.`; isian tetap; tidak ada pendaftaran/tagihan/email baru | |
| QA-LOCK-02 | Browser/perangkat lain, email beda, WhatsApp sama (format `+62 812-…` vs `0812…`) | Ditolak sama seperti LOCK-01 | |
| QA-LOCK-03 | Program sama, email & WA berbeda (orang lain) | Diterima | |
| QA-LOCK-04 | Network: respons 423 | Header `Retry-After` berisi sisa detik (≤ 1800) | |
| QA-LOCK-05 | Tunggu 30 menit (atau mundurkan `created_at` di staging) lalu kirim lagi | Diterima; tagihan lama tetap `pending` | |
| QA-LOCK-06 | Admin Verifikasi tagihan lunas sebelum 30 menit, lalu daftar program lain | Diterima | |
| QA-LOCK-07 | Admin Verifikasi DP (tagihan pelunasan baru dibuat), lalu daftar program lain | Diterima (tagihan `remaining` tidak mengunci) | |
| QA-LOCK-08 | Dua tab dengan email sama menekan Yakin hampir bersamaan (program berbeda) | Satu `received`, satu 423 | |

### C. Checkout

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-CO-01 | Setelah redirect | Judul `Checkout pembayaran`; subtotal, kode unik, total (= subtotal + kode) benar | |
| QA-CO-02 | Rekening | Bank, nomor, a.n. sesuai rekening aktif; tombol salin berfungsi | |
| QA-CO-03 | Info email | Email tampil tersamar (`bu***@domain`) | |
| QA-CO-04 | WhatsApp | Tombol membuka WA dengan pesan berisi nama, #pendaftaran, program – batch, #tagihan, tahap, total | |
| QA-CO-05 | Token diubah satu karakter / kedaluwarsa | 404 | |
| QA-CO-06 | Setelah admin verifikasi, muat ulang | Panduan hilang, tampil status `sudah diverifikasi` (DP: tampil tagihan pelunasan pending) | |

### D. Email #1 (Instruksi pembayaran)

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-E1-01 | Pendaftaran lunas | Email diterima ≤ 2 menit; subject `Instruksi pembayaran pendaftaran #… – Albana Speech Academy`; total, kode unik, rekening sama persis dengan checkout; tombol halaman pembayaran membuka checkout yang sama | |
| QA-E1-02 | Pendaftaran DP | Tahap `DP`, total = DP + kode unik | |
| QA-E1-03 | Nama `<b>Budi</b> & "Sari"` | Nama tampil literal, tidak tebal | |
| QA-E1-04 | Kirim ulang payload sama dengan `idempotencyKey` sama (replay request di DevTools) | Respons 200 ke checkout yang sama; tetap **satu** email; satu baris di `academy_email_deliveries` | |
| QA-E1-05 | `SMTP_PASS` salah | Pendaftaran tetap 200 + checkout tampil; baris `failed` dengan `last_error`; log server tanpa email/nomor peserta | |
| QA-E1-06 | `SMTP_USER`/`SMTP_PASS` kosong | Pendaftaran tetap 200; baris email `failed` (`Pengirim email belum dikonfigurasi`); warn di log server; setelah `.env` diisi dan server dimuat ulang, **Kirim ulang** di admin mengirim email | |
| QA-E1-07 | Tampilan | Gmail web + aplikasi ponsel: tidak ada layout rusak; versi teks polos terbaca | |

### E. Admin & Email #2

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-ADM-01 | Verifikasi tagihan lunas | Status `verified`; Email #2 `Pembayaran diterima – pendaftaran #… terkonfirmasi` dengan jadwal sesi pertama WIB dan langkah selanjutnya | |
| QA-ADM-02 | Verifikasi tagihan DP | Tagihan `remaining` dibuat; Email #2 `DP diterima – pendaftaran #…` memuat total sisa + kode unik baru + rekening; tautan membuka checkout tagihan pelunasan | |
| QA-ADM-03 | Verifikasi tagihan pelunasan | Email #2 varian pelunasan; tidak ada tagihan baru | |
| QA-ADM-04 | Dua tab admin klik Verifikasi bersamaan | Satu sukses, satu galat "Tagihan sudah berubah"; hanya satu Email #2 | |
| QA-ADM-05 | Tolak tagihan | Status `rejected`; tidak ada email | |
| QA-ADM-06 | Email gagal (SMTP salah) lalu perbaiki SMTP | Kolom status `gagal` + tombol Kirim ulang; klik → `terkirim`, `attempts` naik | |
| QA-ADM-07 | Kirim ulang untuk baris `sent` (paksa via form/devtools) | Tidak ada email baru (`skipped`) | |
| QA-ADM-08 | Panggil `resendInvoiceEmail` tanpa sesi admin | Ditolak oleh `requireAdminMember()` | |

### E2. Catat transfer / kurang bayar

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-PAY-01 | Buka Detail tagihan `pending` tanpa catatan | Hanya tautan sekunder `Catat transfer`; tidak ada blok ringkasan | |
| QA-PAY-02 | Catat Rp1.000.000 + bukti (drag & drop) pada total Rp1.300.123 | Modal menampilkan `Kurang Rp300.123` sebelum simpan; setelah simpan toast, riwayat 1 baris, chip `Kurang Rp300.123` di kartu dan di daftar | |
| QA-PAY-03 | Catat Rp300.123 + bukti (pilih lewat file picker) | Ringkasan `Pas`; Verifikasi terisi awal Rp1.300.123 → lolos (Task 8A) → Email #2 | |
| QA-PAY-04 | Catat Rp1.400.000 pada tagihan lain | `Lebih Rp99.877 — kembalikan selisih manual` | |
| QA-PAY-05 | Simpan tanpa bukti / nominal kosong / `1,5` / `-100` | Ditolak di modal, tidak ada request | |
| QA-PAY-06 | Seret PDF, GIF, atau gambar 12 MiB | Galat di dropzone, tidak terkirim | |
| QA-PAY-07 | Ganti ekstensi `.exe` jadi `.png` lalu kirim lewat DevTools | `422 Bukti bukan gambar yang valid.`; tidak ada objek tertinggal di bucket | |
| QA-PAY-08 | `Lihat bukti` | Tab baru membuka gambar lewat signed URL; URL kedaluwarsa setelah 60 detik | |
| QA-PAY-09 | Buka `/api/admin/invoice-payments/1/proof` tanpa login / akun non-admin | 404 | |
| QA-PAY-10 | `POST /api/admin/invoice-payments` tanpa sesi admin | 401/403; tidak ada unggahan | |
| QA-PAY-11 | `Batalkan` satu catatan | Baris dicoret `Dibatalkan`; ringkasan dihitung ulang tanpa baris itu; bukti masih bisa dilihat | |
| QA-PAY-12 | Catat transfer pada tagihan yang baru diverifikasi admin lain | `409 Tagihan sudah diproses.`; objek yang terunggah dihapus | |
| QA-PAY-13 | Verifikasi dengan sisa masih `Kurang` | Peringatan tampil; RPC menolak bila nominal ≠ total | |
| QA-PAY-14 | Modal di layar 375px + keyboard saja | Dropzone bisa dibuka dengan Enter/Spasi; tidak ada scroll horizontal; fokus terkunci di modal | |
| QA-PAY-15 | Unduh bukti lalu cek metadata (`exiftool`) | Tidak ada EXIF/GPS (re-encode WebP) | |
| QA-PAY-16 | Isi halaman/HTML client `/admin/tagihan` | Tidak memuat `proof_object_key` atau URL bucket | |

### E3. Menu Cicilan & Pelunasan

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-INS-01 | Buka sidebar Pendaftaran | Menu `Cicilan & Pelunasan` di bawah Tagihan, ikon dompet, aktif saat di `/admin/cicilan` | |
| QA-INS-02 | Peserta DP baru (belum bayar) | Tahap `Menunggu DP`; Sisa = DP + kode + perkiraan sisa, berlabel `perkiraan` | |
| QA-INS-03 | Detail → `Catat DP` Rp260.005 + bukti → Verifikasi | Tagihan pelunasan terbit; Email #2 varian DP; baris pindah ke `Menunggu pelunasan`; sisa = total tagihan pelunasan (dengan kode unik) | |
| QA-INS-04 | `Catat cicilan / pelunasan` Rp500.000 lalu Rp300.000, masing-masing dengan bukti | Tahap `Kurang bayar`; sisa Rp240.009; progres 82%; riwayat dua baris dengan bukti | |
| QA-INS-05 | Catat Rp240.009 → Verifikasi dengan nominal terisi otomatis Rp1.040.009 | Lolos; tahap `Lunas`; progres 100%; Email #2 pelunasan | |
| QA-INS-06 | Batalkan satu cicilan | Sisa & progres naik kembali sesuai; baris dicoret | |
| QA-INS-07 | Peserta lunas yang membayar bertahap (Task 8B) | Muncul di filter `Ada kekurangan`, tidak di `Menunggu pelunasan` | |
| QA-INS-08 | Pendaftaran yang hanya punya tagihan ditolak | Tidak muncul di `Semua` | |
| QA-INS-09 | Filter + pencarian (`?tahap=kurang&q=budi`) | Hasil tersaring keduanya; jumlah di tab sesuai | |
| QA-INS-10 | Catat/verifikasi di menu Tagihan lalu buka Cicilan (dan sebaliknya) | Angka sama di kedua menu (revalidasi) | |
| QA-INS-11 | `?tahap=apa-saja` | Diperlakukan `semua`, tanpa galat | |
| QA-INS-12 | Akses `/admin/cicilan` tanpa login / non-admin | Dialihkan ke login / ditolak seperti menu admin lain | |
| QA-INS-13 | Layar 375px | Tabel bertumpuk, progres terbaca, panel detail dapat digulir; tanpa scroll horizontal | |

### F. Keamanan & privasi

| ID | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| QA-SEC-01 | Cari `SMTP_PASS`, `SMTP_USER`, `nodemailer` di bundle client (`.next/static`) | Tidak ditemukan | |
| QA-SEC-02 | Log server selama QA | Tidak ada email, nomor WA, token, atau password | |
| QA-SEC-03 | `academy_email_deliveries` lewat REST anon key | Ditolak | |
| QA-SEC-04 | Inspect element: ubah angka **Transfer sekarang** di form/modal lalu Yakin | Tagihan di checkout, Email #1, dan admin = harga DB | |
| QA-SEC-05 | Inspect element: ubah total/rekening di halaman checkout | Hanya tampilan lokal; muat ulang kembali ke angka DB; Email #1 & admin tidak berubah | |
| QA-SEC-06 | DevTools/Burp: ubah `priceIdr` di body POST jadi `1000` | 409 *Harga atau pilihan kelas berubah*; tidak ada pendaftaran/tagihan/email | |
| QA-SEC-07 | Tambah `totalIdr`, `subtotalIdr`, `uniqueCode`, `bankAccountId` ke body | 200; nilai tersimpan tetap hasil server | |
| QA-SEC-08 | Ubah `dpPercent` jadi `1` atau `paymentMethod` jadi `dp` pada program tanpa DP | 409; tidak tersimpan | |
| QA-SEC-09 | Ganti `offerSlug`/`secondaryBatchSlug` ke kombinasi tidak sah | 409 *Kelas atau rekening pembayaran belum tersedia* | |
| QA-SEC-10 | Panggil RPC `receive_academy_registration`/`resolve_academy_invoice` langsung dengan anon key | Permission denied | |
| QA-SEC-11 | Peserta transfer kurang Rp1.000 lalu kirim tangkapan layar & teks WA yang diedit ke nominal penuh; admin mengetik nominal mutasi asli | Verifikasi ditolak *Nominal diterima tidak sama…*; status tetap `pending`; tidak ada Email #2 | |
| QA-SEC-12 | Admin mengetik nominal sama persis dengan total | Terverifikasi; `received_idr` tersimpan; Email #2 terkirim | |
| QA-SEC-12b | Lanjutan QA-SEC-11: admin klik `Chat peserta`, peserta transfer kekurangan Rp1.000, admin mengetik jumlah kedua mutasi | WhatsApp terbuka ke nomor peserta; verifikasi lolos; Email #2 terkirim | |
| QA-SEC-13 | Ubah id di token checkout (`41.` → `42.`) | 404 (HMAC tidak cocok) | |
| QA-SEC-14 | Ubah nominal di URL WhatsApp sebelum kirim | Tidak memengaruhi data; admin tetap mencocokkan dengan total DB | |

---

## Pertanyaan terbuka (perlu jawaban pemilik produk sebelum Task 1A & 3)

1. Akun Gmail pengirim: apakah akun di `SMTP_USER` saat ini memang akun khusus Albana (bukan akun pribadi/Panggung Kreator)? Perlu `EMAIL_REPLY_TO` ke kotak masuk lain?
2. ~~Penyedia SMTP~~ — **terjawab 2026-11-18:** Gmail SMTP seperti `attendance-actions.ts`. Mailbox domain tetap opsi lanjutan (Task 1A).
3. Naskah "langkah selanjutnya" di Email #2: apakah undangan grup WhatsApp kelas dikirim manual oleh admin (asumsi rencana ini), atau tautan grup harus disimpan per batch di CMS?
4. Perlu email saat tagihan **ditolak**? Rencana ini tidak mengirimnya.
5. Kunci 30 menit: apakah kunci memang berlaku lintas **semua program** (asumsi rencana ini) atau hanya program yang sama? Kontrak pendaftaran membolehkan satu email di beberapa batch; kunci ini hanya menunda 30 menit, tidak melarang.
6. ~~Transfer lebih/kurang~~ — **terjawab 2026-11-18:** diselesaikan manual lewat WhatsApp admin; lihat *Keputusan desain → Transfer kurang/lebih*.
7. Retensi bukti transfer: berapa lama gambar di `payment-proofs` disimpan (mis. 1 tahun setelah kelas selesai)? Rencana ini tidak menghapus otomatis.
8. Cicilan terjadwal (jumlah termin, jatuh tempo, pengingat otomatis) tidak termasuk; menu 8C hanya mencatat. Perlu dijadwalkan di sistem?
9. Batas waktu pembayaran (mis. 1×24 jam) — belum ada di sistem; tidak dicantumkan di email/checkout sampai ditentukan.
