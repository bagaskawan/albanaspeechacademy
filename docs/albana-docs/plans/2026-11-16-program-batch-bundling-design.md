# Rancangan — Program tetap, Batch ringkas, dan tawaran paket di akhir formulir

**Tanggal:** 16 November 2026 · **Status:** disetujui pemilik 17 November 2026 · **diterapkan** ([rencana kerja](2026-11-17-program-batch-bundling-implementation-plan.md))

Menggantikan rancangan radio bundling per program di [rancangan CMS Program, Batch, dan Bundling](../registration/cms-program-batch-bundling.md) (dokumen itu sudah direvisi mengikuti rancangan ini).

## 1. Maksud

Admin Albana hampir tidak pernah mengubah program; yang rutin dikerjakan adalah **membuka batch baru**. Sekarang form Batch meminta 10 isian yang sebagian besar selalu sama, dan bundling diatur lewat tiga tempat (radio per program, tahap awal, pilihan ulang). Rancangan ini memangkas keduanya:

- Program menjadi **daftar tetap** yang menyimpan semua hal yang jarang berubah.
- Batch hanya **nama dan jadwal sesi**.
- Bundling menjadi **satu tawaran di akhir formulir**, dua arah, dengan satu harga paket.

## 2. Keputusan pemilik

| # | Keputusan |
| --- | --- |
| K1 | Program makro: **Inhouse Training** dan **Public Training** (Public Speaking Series, Public Speaking for Speakers, Sertifikasi BNSP). Sesuai [proposal](../content/academy-proposal.md). |
| K2 | Daftar program statis; fokus pengelolaan pada Public Training. |
| K3 | Batch adalah turunan Program: yang sudah diisi di Program **tidak ditulis lagi** di Batch. Batch hanya nama (placeholder berurut, mis. "ASA Batch 9") dan jadwal sesi. |
| K4 | Biaya ada di Program. |
| K5 | Alamat pelaksanaan memakai alamat dari menu Kontak. |
| K6 | Sertifikasi mengikuti gambar formulir: Rp2.000.000; paket pelatihan + sertifikasi Rp2.900.000. Sertifikasi punya batch dan jadwal sendiri. |
| K7 | Landing page hanya menampilkan tiga program Public Training. Bundling **bukan** program keempat. |
| K8 | Bundling ditawarkan **di akhir formulir**, dua arah: dari Speaker ditawari Sertifikasi, dari Sertifikasi ditawari Speaker. Terbuka untuk siapa saja. |
| K9 | Peserta yang menerima tawaran masuk ke **batch yang sedang dibuka** pada program pasangan; tidak ada jadwal paket terpisah. |

## 3. Tujuan, bukan tujuan, dan yang harus dihindari

**Tujuan**

- Membuka batch baru cukup dua isian: nama dan jadwal.
- Satu tempat untuk harga; mengubah harga program langsung berlaku untuk batch yang sedang dibuka.
- Peserta melihat tawaran paket satu kali, pada saat mereka sudah tahu biaya program yang dipilih.
- Total paket sama dari arah mana pun.

**Bukan tujuan**

- Menambah atau menghapus program dari CMS.
- Bundling untuk Series, bundling per batch tertentu, atau lebih dari satu paket.
- Tahap awal ala Google Forms (flyer, video, pilihan empat formulir) sebagai halaman situs.
- Mengubah halaman konfirmasi, kode unik, atau alur verifikasi tagihan.

**Harus dihindari**

- Peserta membayar harga yang berbeda dari yang ditampilkan saat mengirim formulir.
- Tawaran paket muncul padahal program pasangan tidak punya batch yang dibuka.
- Pendaftaran lama berubah nilainya karena harga program diubah (snapshot harga tetap berlaku).
- Menyiratkan bahwa paket menjamin lulus sertifikasi.

## 4. Pendekatan yang dipertimbangkan

| | Pendekatan | Untung | Rugi |
| --- | --- | --- | --- |
| A | Bundling sebagai program keempat dengan batch dan jadwal sendiri | Paling sederhana di admin; mirip pilihan keempat di Google Forms | Landing page jadi empat program atau paket tersembunyi; jadwal diketik dua kali; peserta paket terpisah dari daftar kelasnya |
| B | Bundling menunjuk dua batch tertentu, dipilih dari tahap awal dan ditinjau ulang sebelum checkout (rancangan lama) | Jadwal tidak diketik ulang | Tiga titik pengaturan; radio per program membingungkan; langkah tambahan bagi peserta |
| **C** | **Tawaran di akhir formulir, dua arah, satu harga paket** | Landing tetap tiga program (K7); peserta ditawari saat paling siap; memakai struktur data yang ada (satu pendaftaran, dua butir batch, satu tagihan) | Bundling tidak bisa dipilih dari awal; tawaran bergantung pada batch pasangan yang dibuka |

**Dipilih: C**, oleh pemilik, dengan catatan K8 dan K9.

## 5. Rancangan

### 5.1 Program (tetap)

Empat baris tetap; CMS tidak punya tombol tambah atau hapus program.

| Program | Kelompok | Formulir | Batch |
| --- | --- | --- | --- |
| Public Speaking Series | Public Training | `series` | Ya |
| Public Speaking for Speakers | Public Training | `exclusive` | Ya |
| Sertifikasi Pembicara Profesional (BNSP) | Public Training | `bnsp` | Ya |
| Inhouse Training | Inhouse | — (konsultasi) | Tidak |

Yang dapat diubah admin pada tiap program Public Training:

| Isian | Catatan |
| --- | --- |
| Nama, deskripsi, materi | Seperti sekarang |
| **Biaya** | Satu-satunya sumber harga (K4) |
| Harga coret | Opsional; harus lebih besar dari biaya |
| **DP (%)** | Kosong = tanpa pilihan DP. Bawaan 20 |
| Rincian biaya | Opsional, satu paragraf |
| Naskah pertanyaan formulir | Seperti sekarang (`form_prior_experience`, `form_goal`, `form_challenge`) |

Jenis formulir melekat pada program dan **tidak** dapat diubah dari CMS. Tempat dan alamat tidak diisi di sini: situs menampilkan alamat dari Kontak (K5). Inhouse hanya punya nama, deskripsi, dan materi.

### 5.2 Batch (ringkas)

Form batch berupa modal (≤ 6 field, [pola UI admin §6.1](../design/admin-ui-patterns.md)):

| Isian | Aturan |
| --- | --- |
| Nama batch | Wajib. Placeholder = nama batch terakhir program itu dengan angka terakhirnya ditambah satu ("ASA Batch 9" → "ASA Batch 10"); bila belum ada batch, "ASA Batch 1". Placeholder hanya contoh, tidak terisi otomatis |
| Jadwal sesi | Wajib minimal satu baris: tanggal, jam mulai, jam selesai (WIB). Baris berulang; validasi urut dan tidak tumpang tindih seperti sekarang |
| Buka pendaftaran | Sakelar, bawaan mati. Menyalakannya menutup pendaftaran batch lain pada program yang sama (satu batch dibuka per program) |

Tidak ada isian program (ditentukan dari tempat tombol ditekan), harga, harga normal, DP, rincian biaya, jenis formulir, tempat, atau alamat.

### 5.3 Satu layar "Program & Batch"

Menu **Kelas** berisi **Program & Batch** dan **Trainer**. Rute `/admin/program`; `/admin/batch` dialihkan ke sana.

```text
Public Training
╭──────────────────────────────────────────────────────────────────────╮
│ Public Speaking Series            Rp1.500.000 · DP 20%          (✎)  │
│ ──────────────────────────────────────────────────────────────────── │
│ ASA Batch 10   4 sesi · mulai 7 Des 2026    • Dibuka     (✎) (🗑)     │
│ ASA Batch 9    4 sesi · mulai 7 Nov 2026    • Selesai    (✎) (🗑)     │
│ ( + Tambah batch )                                                   │
╰──────────────────────────────────────────────────────────────────────╯
╭ Public Speaking for Speakers      Rp1.300.000 (coret Rp1.500.000) …  ╮
╭ Sertifikasi Pembicara Profesional Rp2.000.000 …                      ╮

Paket Speaker + Sertifikasi          ( ● Ditawarkan )  Rp2.900.000  (✎)
  Dari Speaker: + Rp1.600.000 · Dari Sertifikasi: + Rp900.000

Inhouse Training                     Konsultasi langsung, tanpa batch (✎)
```

- (✎) pada program membuka halaman ubah program (form panjang → halaman).
- **Tambah batch** dan (✎) pada batch membuka modal 5.2.
- Status batch: **Dibuka**, **Ditutup**, atau **Selesai** (sesi terakhir sudah lewat; dihitung, bukan disimpan).
- Kartu paket: sakelar tawarkan, harga paket, penjelasan satu kalimat, DP paket. Tambahan per arah dihitung dan ditampilkan sebagai keterangan.
- Peringatan pada kartu bila ada yang menghalangi pendaftaran: biaya Rp0, belum ada batch dibuka, atau paket ditawarkan tetapi salah satu program tidak punya batch dibuka.

### 5.4 Tawaran paket

Satu penawaran untuk pasangan Speaker ⇄ Sertifikasi.

| Hal | Aturan |
| --- | --- |
| Harga paket | Disimpan sekali (contoh Rp2.900.000). Harus lebih besar dari biaya masing-masing program dan lebih kecil dari jumlah keduanya |
| Tambahan | Dihitung: harga paket − biaya program asal. Speaker Rp1.300.000 → + Rp1.600.000; Sertifikasi Rp2.000.000 → + Rp900.000 |
| Kapan tampil | Sakelar menyala, harga paket sah, **dan** kedua program punya batch yang dibuka dengan sesi pertama belum lewat |
| Batch tambahan | Batch yang sedang dibuka pada program pasangan (K9) |
| DP | Memakai DP paket; bila kosong, DP program asal |
| Series | Tidak pernah menampilkan tawaran |

### 5.5 `/register`

Alur tetap satu halaman per program (`/register/[program]`). Tidak ada tahap awal dengan pilihan paket.

1. Ringkasan program: nama, batch, jadwal semua sesi (WIB), biaya, alamat dari Kontak.
2. Data peserta dan pertanyaan program (butir 1–15 kontrak).
3. **Tawaran paket** — hanya Speaker dan Sertifikasi, hanya bila aturan 5.4 terpenuhi. Kartu pilihan tunggal tepat sebelum metode pembayaran:

```text
Sekalian ambil sertifikasi?
( ● ) Tidak, pelatihan ini saja                         Rp1.300.000
( ○ ) Tambah Sertifikasi Pembicara Profesional (BNSP)   + Rp1.600.000
      ASA Batch 3 · 14 Des 2026, 08.30–18.00 WIB
      Uji kompetensi BNSP. Paket tidak menjamin kelulusan.
      Total paket Rp2.900.000 (hemat Rp400.000)
```

   - Bawaan: tidak. Peserta harus memilih sendiri untuk menambah.
   - "Hemat" = jumlah dua biaya program − harga paket; baris itu hilang bila nilainya ≤ 0.
   - Dari formulir Sertifikasi, kartunya menawarkan pelatihan Speaker dengan susunan yang sama.
4. Metode pembayaran: ringkasan **Biaya**, **Transfer sekarang**, **Sisa** langsung mengikuti pilihan paket dan lunas/DP.
5. Kirim. Server menghitung ulang harga dari Program dan penawaran, memeriksa kedua batch masih dibuka, lalu menyimpan satu pendaftaran dengan satu atau dua butir batch dan satu tagihan. Bila harga atau ketersediaan berubah sejak formulir dibuka: tolak dengan pesan dan tampilkan nilai terbaru (perilaku 409 yang ada).

Halaman konfirmasi menampilkan "{Program} – {batch}" atau "Paket Speaker + Sertifikasi – {batch} + {batch}".

### 5.6 Landing page dan halaman program

- Tiga kartu program Public Training + Inhouse; tidak ada kartu paket (K7).
- Halaman detail Speaker dan Sertifikasi boleh memuat satu kalimat "Tersedia paket dengan … saat mendaftar" bila tawaran aktif; tanpa harga paket di kartu beranda.

## 6. Data

Pilihan penyimpanan diserahkan ke pembangun dengan batas berikut:

- **Sumber tunggal harga, DP, dan jenis formulir adalah Program.** Tambahkan `programs.dp_percent` dan `programs.form_kind` (migrasi). RPC `receive_academy_registration` dan pembaca katalog harus membaca nilai dari Program. Kolom `batches.price_idr`, `normal_price_idr`, `dp_percent`, `fee_details`, `form_kind`, `venue`, `address` tidak lagi diisi dari CMS; boleh dihapus setelah pembaca berpindah (migrasi terpisah, sesudah data lama dipetakan).
- **Pendaftaran lama aman**: nilai tersimpan di `price_idr_at_signup`, `dp_percent_at_signup`, dan tagihan; tidak dihitung ulang.
- **`bundle_offers`**: satu baris untuk pasangan Speaker ⇄ Sertifikasi. `show_on_speaker` dan `show_on_certification` selalu mengikuti `active` (keduanya dihapus kelak); `placement_scope` tetap `program`; kolom batch tidak dipakai.
- **Data awal** (migrasi data, nilai dari gambar formulir pemilik): Sertifikasi `price_idr = 2000000`, `form_kind = 'bnsp'`; paket `price_idr = 2900000`, DP 20; Series `series`, Speaker `exclusive`, DP 20 untuk ketiganya. Inhouse tanpa harga.
- **Alamat**: dari `contact_channels` (`kind = 'address'`); tidak ada kolom baru.
- Program statis: CMS menghapus aksi tambah/hapus; kebijakan RLS hapus program tidak perlu diubah.

## 7. Yang diserahkan ke pembangun

- Bentuk migrasi dan urutan pemindahan pembaca dari kolom batch ke kolom program.
- Cara menghitung placeholder nama batch berikutnya (di server atau klien).
- Susunan komponen layar Program & Batch; wajib memakai `FormDialog`, `FieldGrid`, `RowActions`, `StatusChip`, `EmptyState`.
- Naskah akhir kartu tawaran, selama memuat: nama program tambahan, batch dan jadwalnya, tambahan biaya, total paket, dan kalimat "tidak menjamin kelulusan" untuk sertifikasi.

## 8. Pemeriksaan

- Tes `node --test` untuk: tambahan = paket − biaya asal di kedua arah; aturan tampil tawaran (sakelar, harga sah, dua batch dibuka); placeholder nama batch; ringkasan lunas/DP dengan dan tanpa paket.
- Uji ujung ke ujung (rencana 2.2 butir 6): daftar Speaker + tambah Sertifikasi → dua butir batch, satu tagihan Rp2.900.000 + kode unik; arah sebaliknya menghasilkan total yang sama.
- Ubah biaya program saat formulir terbuka → kirim ditolak dengan nilai terbaru.
- Tutup batch pasangan → tawaran hilang dari formulir yang dimuat ulang; kiriman yang sudah memilih paket ditolak dengan pesan.
- Admin: membuka batch baru hanya meminta nama dan jadwal; menyalakan "Buka pendaftaran" menutup batch lain program itu.

## 9. Keputusan pembuat rancangan (koreksi bila keliru)

1. **Satu batch dibuka per program.** Mengikuti aturan "maksimal satu batch aktif per program" yang sudah ada; `is_active` dan `registration_open` dilebur menjadi satu sakelar di CMS.
2. **DP paket** mengikuti isian paket, bawaan 20%.
3. **Tawaran bawaan "tidak"**, agar tidak ada peserta yang terkena biaya paket tanpa memilih.
4. **Tahap awal Google Forms** (flyer, centang "Saatnya tampil lebih berpengaruh", pilihan empat formulir) tetap hanya acuan isi; tidak dibangun. Pertanyaan centang itu tidak masuk formulir situs.
5. **Jenis formulir tidak bisa diubah dari CMS**, karena menentukan pertanyaan yang ditampilkan.
