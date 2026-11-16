# CMS Program, Batch, dan tawaran paket

**Status:** berlaku sejak 17 November 2026, mengikuti [rancangan Program tetap, Batch ringkas, dan tawaran paket](../plans/2026-11-16-program-batch-bundling-design.md) yang sudah **diterapkan di kode**. Acuan alur peserta ada di [kontrak pendaftaran](registration-contract.md).

## Ringkasan perubahan

| Sebelumnya | Sekarang |
| --- | --- |
| Program dapat ditambah dan dihapus | Empat program tetap: Series, Speaker, Sertifikasi BNSP (Public Training), dan Inhouse |
| Batch menyimpan harga, harga normal, DP, rincian biaya, jenis formulir, tempat, alamat | Semua itu di **Program**; alamat dari menu **Kontak**. Batch hanya **nama** dan **jadwal sesi** |
| Radio bundling Ya/Tidak per Program, visibilitas terpisah per program | **Satu sakelar** "Tawarkan paket Speaker + Sertifikasi" dan **satu harga paket** |
| Bundling dipilih di tahap awal lalu ditinjau ulang sebelum checkout | Bundling **hanya ditawarkan sekali, di akhir formulir**, dua arah |
| Menu Program dan menu Batch terpisah | Satu layar **Program & Batch** |

## Program

Program tidak dibuat atau dihapus dari CMS. Yang dapat diubah pada program Public Training: nama, deskripsi, materi, **biaya**, harga coret, **DP (%)**, rincian biaya, dan naskah pertanyaan formulir. Jenis formulir (`series`, `exclusive`, `bnsp`) melekat pada program. Inhouse hanya nama, deskripsi, dan materi; tanpa biaya dan tanpa batch.

Biaya di Program adalah satu-satunya sumber harga. Mengubahnya langsung berlaku bagi batch yang sedang dibuka; pendaftaran yang sudah masuk tetap memakai nilai saat mendaftar.

## Batch

Membuat batch dari tombol **Tambah batch** pada kartu program:

| Isian | Aturan |
| --- | --- |
| Nama batch | Wajib. Placeholder berurut dari batch terakhir program itu, mis. "ASA Batch 9" → "ASA Batch 10" |
| Jadwal sesi | Minimal satu sesi: tanggal, jam mulai, jam selesai (WIB). Urut dan tidak tumpang tindih |
| Buka pendaftaran | Bawaan mati. Satu batch dibuka per program; membuka yang baru menutup yang lama |

Tidak ada isian harga, DP, jenis formulir, tempat, atau alamat pada batch.

## Tawaran paket Speaker + Sertifikasi

- Satu penawaran untuk pasangan **Public Speaking for Speakers ⇄ Sertifikasi BNSP**. Series tidak punya tawaran.
- Admin mengisi: sakelar tawarkan, **harga paket**, DP paket, dan satu kalimat penjelasan.
- Tambahan yang dilihat peserta dihitung: **harga paket − biaya program yang sedang didaftari**. Total paket sama dari arah mana pun.

  | Mendaftar | Biaya program | Tawaran di akhir formulir | Total |
  | --- | ---: | --- | ---: |
  | Speaker | Rp1.300.000 | Tambah Sertifikasi, + Rp1.600.000 | Rp2.900.000 |
  | Sertifikasi | Rp2.000.000 | Tambah pelatihan Speaker, + Rp900.000 | Rp2.900.000 |

  Angka di atas dari gambar formulir pemilik; nilai berlaku dibaca dari CMS.
- Tawaran tampil hanya bila sakelar menyala, harga paket sah, dan **kedua** program punya batch yang dibuka. Peserta yang menerima tawaran masuk ke batch yang sedang dibuka pada program pasangan; tidak ada jadwal paket terpisah.
- Hasilnya satu pendaftaran dengan dua butir batch dan satu tagihan. Server menghitung ulang harga dan memeriksa kedua batch saat pendaftaran dikirim.
- Penjelasan paket wajib menyebut bahwa sertifikasi adalah uji kompetensi dan paket tidak menjamin kelulusan.

## Layar Program & Batch

Susunan layar, status batch (Dibuka, Ditutup, Selesai), dan peringatan kesiapan (biaya Rp0, belum ada batch dibuka, paket tanpa batch pasangan) dijabarkan di [rancangan §5.3](../plans/2026-11-16-program-batch-bundling-design.md).

## Di luar cakupan

Paket untuk Series, paket per batch tertentu, lebih dari satu paket, dan penambahan program baru dari CMS.
