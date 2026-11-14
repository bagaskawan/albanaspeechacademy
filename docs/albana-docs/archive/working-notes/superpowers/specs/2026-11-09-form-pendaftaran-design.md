# Form pendaftaran on-site — desain

Tanggal: 9 November 2026
Status: diimplementasikan untuk alur Series; audit isi varian 02/03 menyusul
Revisi 9 November 2026: bentuk formulir berubah dari satu halaman menjadi wizard empat langkah atas permintaan pemilik; lihat `docs/archive/working-notes/superpowers/plans/2026-11-09-form-wizard.md`. Revisi terbaru: ringkasan batch tampil di atas isian pertama tanpa layar pembuka, indikator langkah dan progres ditampilkan, serta halaman register memakai panel tunggal; rincian pelaksanaan aktif ada di `docs/implementation_plan/step-02-form-pendaftaran.md`.
Cakupan: halaman `/register`, tepatnya mengganti tautan Google Form dengan formulir
yang dikirim ke `POST /api/registrations`.

## 1. Maksud dan alasan

Halaman `/register` sekarang hanya merangkum batch dan menautkan ke Google Form di tab
baru. Backend penyimpanan sudah siap (`web/app/api/registrations/route.ts`, validator
`web/lib/registration-input.ts`, RPC `rpc/receive_registration`). `docs/home-content.md`
pasal "Daftar kelas" memang meminta mengganti formulir luar situs begitu backend tersedia.

Tujuannya: calon peserta mengisi satu formulir di situs, menerima tanda terima, lalu
melanjutkan pembayaran manual lewat admin. Isi formulir mengikuti
`docs/form register/01-03`; tampilan mengikuti bahasa visual `docs/design.md` dengan
sentuhan referensi yang diberikan pengguna (label uppercase, input garis bawah, sosial
media dua kolom).

## 2. Tujuan, non-tujuan, anti-tujuan

**Tujuan**
- Formulir berfungsi untuk ketiga varian batch: `series`, `exclusive`, `bnsp`.
- Empat langkah (Data diri, Latar belakang dan motivasi, Informasi teknis, Pembayaran dan persetujuan), dikelompokkan dari bagian A–E seperti dokumen sumber; langkah dengan error tidak bisa dilanjutkan (lihat Revisi).
- Kirim JSON ke `/api/registrations`; tanda terima pada 200; pemulihan pada 409/422/429/503.
- Nilai yang sudah diisi dipertahankan setelah gagal yang bisa dipulihkan.
- Pemberitahuan penggunaan data + persetujuan eksplisit sebelum kirim.
- Harga dan varian dibaca dari data batch, bukan diketik di kode.

**Non-tujuan**
- Tidak ada upload/lampiran bukti pembayaran (lihat keputusan §4).
- Tidak ada tema gelap.
- Tidak membangun CMS admin, verifikasi pembayaran, atau basis data baru.
- Tidak mengubah halaman detail program atau kartu batch selain pembacaan data tambahan.

**Anti-tujuan**
- Menampilkan harga untuk batch yang belum terbit — dilarang `docs/design.md`.
- Mengarang nomor rekening, jumlah, atau nomor WhatsApp di kode.
- Menyimpan atau menampilkan data pribadi di halaman publik.

## 3. Batasan

- `docs/design.md` adalah otoritas visual: radius 0 px, font Inter (judul/label/tombol)
  dan Montserrat (isi), token dari `web/app/globals.css`, target sentuh 44 px, fokus
  terlihat, error selalu punya teks, tidak ada warna sebagai satu-satunya penanda.
- `parseRegistration` adalah otoritas validasi. Validasi klien hanya pelengkap.
- Batas kiriman JSON 32 KiB (route sudah menolak > 32768 byte).
- Naskah dalam bahasa Indonesia; tanggal WIB dan rupiah memakai formatter bersama.
- Kontak WhatsApp resmi dari `web/lib/academy-contact.ts` (`academyContactLinks.whatsapp`).

## 4. Keputusan yang sudah dipilih pengguna

- **Bentuk: wizard empat langkah dengan progres.** Ringkasan program, jadwal, tempat,
  dan biaya tampil sebelum isian pertama tanpa klik tambahan. Langkah dengan error tidak
  bisa dilanjutkan; judul langkah dan indikator “Langkah n dari 4” selalu terlihat.
- **Tanpa upload bukti pembayaran.** Poin 20 dokumen bertentangan dengan `step-02`,
  `docs/tech.md`, dan validator: form publik tidak menerima lampiran; Cloudinary belum
  dipasang dan upload pribadi hanya lewat admin. Setelah kirim, peserta diarahkan
  mengirim bukti transfer ke WhatsApp admin. Ini juga menggantikan poin 18 dokumen
  (rekening tidak dicetak di halaman publik).

## 5. Pendekatan yang dipertimbangkan

- **A — Satu halaman.** Semua bagian sekaligus, satu tombol kirim. Tidak dipilih.
- **B — Wizard bertahap (dipilih pengguna pada revisi).** Empat langkah dengan tombol
  Lanjut dan Kembali; langkah dengan error tidak bisa dilanjutkan.
- **C — Hibrida.** Bagian berurutan tanpa progress. Tidak dipilih.

Isi kolom identik pada ketiga opsi; yang berbeda hanya pembagiannya.

## 6. Bagaimana — bagian yang sudah diputuskan

### 6.1 Perluas pembacaan batch

`RegistrationBatch` (`web/lib/registration.ts`) dan `toRegistrationBatch`
(`web/lib/server/registration-batch.ts`) belum membawa data yang dibutuhkan payload.
Tambahkan dari `readCatalog` (katalog sudah memilih kolomnya): `formKind`
(`form_kind`), `priceIdr` (`price_idr`), `feeDetails` (`fee_details`), `dpPercent`
(`dp_percent`). Batch tanpa `price_idr` belum siap menerima pendaftaran, sehingga
form tidak ditampilkan. `form_kind` di luar
`series|exclusive|bnsp` membuat batch tidak siap.

`fee_details` ditampilkan apa adanya sebagai teks (bukan HTML). Nilai `price_idr` dan
`dp_percent` dari API dinormalkan ke number sebelum dipakai — PostgREST bisa
mengembalikannya sebagai string.

**Rute & resolusi batch.** URL formulir memakai slug program di path:
`/register/<slug-program>`. `/register` tanpa slug mengarahkan pengunjung ke
`/register/public-speaking-for-speakers`. Batch **tidak** ada di URL; server memilihnya untuk program itu —
batch dengan `accepting_registrations` benar, dan yang sesi pertamanya paling awal bila
ada lebih dari satu. Tidak ada batch menerima → keadaan "belum tersedia" tanpa formulir.

Link di kartu program (`web/lib/server/program-showcase.ts`, `registrationUrl`) berubah
dari `/register?batch=…` menjadi `/register/<slug-program>`. Kueri `?batch=`/`?program=`
lama tidak lagi jadi jalur utama.

### 6.2 Komponen

- `web/components/register/registration-form.tsx` — `"use client"`. Menyusun bagian
  A–E, menyimpan nilai, validasi, kirim `fetch` JSON, menangani keadaan.
- `web/components/ui/` — primitif field bersama (label, input garis bawah, radio,
  checkbox grup, pesan error, penghitung karakter untuk teks panjang). Domain-free,
  dipakai ulang bila halaman lain butuh.
- `web/components/register/register-page.tsx` — satu panel terpusat berisi logo,
  ringkasan batch dan formulir. Tanda terima menggantikan formulir setelah kirim.
- Rute: `web/app/register/[program]/page.tsx` (baru) meresolusi batch lalu merender
  formulir; `web/app/register/page.tsx` (ada) menampilkan program yang menerima
  pendaftaran saat tanpa slug.
- Aturan bersama (label varian, daftar pilihan, validasi) di
  `web/lib/registration-form.ts` supaya tidak digandakan di JSX.

### 6.3 Peta kolom ke payload

`POST /api/registrations` (JSON, ≤32 KiB):

| Bagian | Payload | Wajib | Aturan (dari validator) |
|---|---|---|---|
| A | `fullName` | ya | trim, ≤160 |
| A | `answers.nickname` | ya | ≤160 |
| A | `answers.domicile` | ya | ≤500 |
| A | `whatsapp` | ya | angka, opsional awalan `+`, 8–15 digit |
| A | `email` | ya | pola email, ≤254 |
| A | `answers.gender` | ya | `Perempuan` \| `Laki-laki` |
| A | `answers.age` | ya | bilangan bulat 1–150 |
| A | `answers.profession` | ya | ≤500 ("Jabatan/Profesi") |
| A | `answers.institution` | tidak | ≤500 |
| A | `answers.socials` | tidak | subset `instagram,tiktok,facebook,linkedin,other`, ≤5 |
| A | `answers.socialOther` | bila `other` | ≤500 |
| A | `answers.socialName` | tidak | ≤160 ("Nama Akun Sosial Media") |
| B | `answers.priorExperience` | ya | boolean (`Ya`/`Tidak`) |
| B | `answers.goal` | ya | ≤2000 |
| B | `answers.challenge` | ya (kecuali `bnsp`) | ≤2000 |
| C | `answers.source` | ya | `instagram` \| `whatsapp` \| `referral` \| `other` |
| C | `answers.sourceOther` | bila `other` | ≤500 |
| C | `answers.attendance` | ya | `yes` \| `maybe` |
| D | `paymentMethod` | ya | `full` \| `dp` |
| D | `dpPercent` | bila `dp` | dari data batch |
| E | `consent` | ya | harus `true` |
| — | `batch` | ya | slug batch |
| — | `formKind`, `priceIdr` | ya | dari data batch |

Nomor WhatsApp: bantu pengguna dengan contoh `'0896xxxxxxx` dan bersihkan spasi/`()`/`-`
di klien agar isian seperti dokumen tetap lolos validasi server.

### 6.4 Naskah varian

Data `formKind` menentukan tiga label:

| Field | `series` | `exclusive` | `bnsp` |
|---|---|---|---|
| `priorExperience` | Apakah pernah mengikuti pelatihan Public Speaking sebelumnya? | Apakah pernah mengikuti pelatihan Speaker sebelumnya? | Apakah pernah mengikuti sertifikasi BNSP sebelumnya? |
| `goal` | Apa tujuan utama mengikuti Public Speaking Series ini? | Apa tujuan utama mengikuti Public Speaking Training for Speakers ini? | Apa tujuan utama mengikuti Sertifikasi Professional Speakers by BNSP? |
| `challenge` | Apa tantangan terbesar Anda dalam aktivitas Public Speaking? | Apa tantangan terbesar Anda saat menjadi pembicara atau "speaker"? | — (tidak ditampilkan) |
| `attendance` | Kesediaan mengikuti pelatihan penuh selama 4 pertemuan | Kesediaan mengikuti pelatihan penuh (08.30–18.00 WIB) | Kesediaan mengikuti pelatihan penuh (08.30–18.00 WIB) |

Daftar pilihan tetap: sosial `Instagram/TikTok/Facebook/LinkedIn/Lainnya`, sumber
`Instagram (@albanaspeechacademy)/WhatsApp/Teman atau Kerabat/Lainnya`.

### 6.5 Keadaan dan pemulihan

- **Memuat:** tombol kirim menampilkan "Mengirim…" dan menahan klik ganda; status
  diumumkan `aria-live="polite"`.
- **200:** ganti kartu formulir dengan tanda terima: pesan diterima, dua langkah sisa
  (nominal + petunjuk pembayaran dari admin; konfirmasi setelah verifikasi), tombol
  kirim bukti lewat WhatsApp resmi, dan catatan kebijakan penjadwalan ulang. Nilai form
  tidak lagi ditampilkan.
- **409 (batch/biaya berubah atau batch tutup):** pertahankan isian, tampilkan pesan dan
  aksi menuju pilihan program terbaru.
- **422:** server hanya mengembalikan satu pesan agregat — `parseRegistration`
  mengembalikan objek penuh atau `null`, tanpa info per-field. Jangan ubah kontrak
  validator bersama (`web/lib/registration-input.ts`) atau route. Validasi klien yang
  menandai field bermasalah; pesan 422 tampil sebagai ringkasan di atas formulir.
- **429:** pesan "coba lagi dalam satu menit".
- **503/400/413/415:** pesan pulih umum, isian tetap.
- Harga dari batch siap diformat lewat `formatRupiah` bersama. Bila harga belum
  tersedia, tampilkan status program tanpa formulir.
- **DP:** opsi "DP" hanya ditampilkan bila `dpPercent` batch terisi (1–99). Menampilkan DP
  saat `dpPercent` kosong pasti berakhir 409/422. Saat tampil, cantumkan nominalnya
  (`priceIdr × dpPercent / 100`, lewat `formatRupiah`) di samping label "DP {dpPercent}%".

### 6.6 Gaya

Ikuti `docs/design.md`, bukan gambar mentah: input bergaris bawah (`border-b` warna
`Rule`/`Control`, fokus `Accent`), label uppercase kecil memakai keluarga display,
tolak semua radius. Susunan dua kolom untuk sosial media bila panel cukup lebar, satu kolom di
ponsel. Tanpa toggle tema. Nama halaman tetap tersedia sebagai H1 untuk pembaca layar,
tetapi tidak ada judul pengantar yang terlihat.

## 7. Urutan pengerjaan (satu per satu, mulai dari 01)

1. Perluas pembacaan batch + aturan bersama (varian, daftar, validasi) — semua varian.
2. Bangun primitif field + formulir wizard empat langkah.
3. Sambungkan ke `/register/<slug-program>` dan `POST /api/registrations`.
4. Uji varian **series (01)** lebih dulu di dev: kartu program → `/register/<slug-program>`
   → kirim → tanda terima, termasuk batch tutup dan harga berubah.
5. Lanjut uji **exclusive (02)** lalu **bnsp (03)** memakai komponen yang sama.

## 8. Yang diserahkan ke builder

- Naskah persis tiap label/petunjuk dan pesan error dalam bahasa Indonesia.
- Bentuk kontrol tiap field (teks, angka, radio, checkbox grup) dan atribut `autocomplete`.
- Penghitung karakter untuk `goal`/`challenge` (maks 2000).
- Tata letak persis primitif field dan kelas Tailwind-nya.
- Penyusunan ulang `register-page.tsx` menjadi panel tunggal.
- Rute `web/app/register/[program]/page.tsx`; ubah `registrationUrl` di
  `web/lib/server/program-showcase.ts` ke `/register/<slug-program>`.
- Tambah `formatRupiah` bersama di `web/lib/format.ts`.
- Perbarui `docs/home-content.md` bagian Daftar kelas (baris 199 dan 212) agar tidak lagi
  menyebut formulir luar situs dan "belum menyimpan data pendaftaran sendiri".
- Cakupan uji klien dan pembersihan `registrationFormUrl` bila tak terpakai lagi.

## 9. Pertanyaan terbuka untuk pemilik (di luar keputusan teknis)

- Pengesahan pemetaan varian, total biaya/DP, dan jam WIB (sudah tercatat sebagai
  keputusan terbuka di `docs/implementation_plan/step-02-form-pendaftaran.md`).
- Perilaku bila batch berkuota tetap: belum menerima kiriman sampai aturan kursi diputuskan.
- **Keputusan saya sendiri (mohon dikoreksi):** opsi DP disembunyikan bila `dp_percent`
  batch kosong, bukan selalu menampilkan "DP 20%" seperti dokumen sumber. Ini menghindari
  jalan buntu 409/422. Bila pemilik ingin DP selalu tampil, aturan kursi/DP perlu diputuskan
  lebih dulu.
- **Keputusan saya sendiri:** bila satu program punya lebih dari satu batch menerima
  pendaftaran, server memilih batch dengan sesi paling awal. Bila pemilik ingin batch
  dipilih manual atau ditampilkan sebagai pilihan, aturannya perlu diubah.
