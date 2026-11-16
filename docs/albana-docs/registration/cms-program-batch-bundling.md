# Rancangan CMS Program, Batch, dan Bundling

**Status:** radio bundling di editor Program, pintasan Tambah batch, harga dan pengaturan awal batch, serta pilihan ulang sebelum kirim telah ditambahkan ke kode pada 16 November 2026. Migrasi telah diterapkan ke proyek `clgjsekfnexmanjdxmqy`. Penempatan bundling per batch dan pilihan batch acuan manual masih rencana. Acuan alur peserta ada di [kontrak pendaftaran](registration-contract.md).

## Keadaan yang menjadi titik awal

- Editor Program menyimpan judul, deskripsi, harga, materi, naskah pertanyaan, dan penawaran bundling dari program tersebut. Rute Bundling lama mengarah ke Program.
- Editor Batch memiliki tab per program. Pintasan dari Program membuka form Batch pada tab yang sesuai; harga berasal dari Program dan jenis formulir, tempat, alamat, rincian biaya, serta DP menyalin batch aktif program itu bila ada. Jadwal selalu kosong; batch baru tidak otomatis aktif atau membuka pendaftaran.
- `bundle_offers` menyimpan pasangan program, penjelasan, harga, DP, status aktif, visibilitas dari masing-masing program, dan kolom scope/batch untuk perluasan kelak. Formulir pendaftaran membaca harga batch, sehingga nilai itu tetap harus terisi sebelum pendaftaran dibuka.

## Bundling di menu Program

Tambahkan bagian **Bundling** pada editor tiap Program dengan radio **Tidak** dan **Ya**. Nilai awal **Tidak** bila program belum memiliki penempatan penawaran yang aktif. Nilai radio mengatur apakah opsi bundling ditawarkan dari program yang sedang diedit, bukan apakah program boleh menjadi komponen paket dari program lain.

- **Tidak:** sembunyikan pilihan bundling dari alur pendaftaran program ini. Simpan konfigurasi paket yang sudah ada agar dapat diaktifkan kembali; jangan menghapus penawaran atau pendaftaran lama.
- **Ya:** tampilkan isian penawaran di bagian yang sama: program pasangan, judul paket, penjelasan singkat tentang apa yang termasuk, harga paket, opsi DP, dan status siap ditawarkan. Program yang sedang diedit terisi otomatis sebagai salah satu anggota paket. Penjelasan tampil di pilihan ulang sebelum checkout.
- Ketika menyimpan, cek program pasangan berbeda, harga paket positif, dan satu program tidak memiliki dua penawaran aktif yang membingungkan pada titik pendaftaran yang sama. Radio **Ya** belum membuat penawaran publik bila rincian wajib belum lengkap.
- Gunakan satu data penawaran untuk pasangan program, agar harga dan isi paket tidak digandakan ketika kedua program diedit. Perubahan pada penawaran bersama harus terlihat dari kedua editor. Radio tiap program boleh berbeda: menonaktifkan penawaran dari satu program tidak otomatis menonaktifkannya dari program pasangan.

Untuk saat ini, `placement_scope = 'program'`. Kolom `speaker_batch_slug` dan `certification_batch_slug` sudah tersedia untuk scope `batch`, tetapi CMS dan alur pendaftaran sengaja hanya menerima scope program. Saat mode Batch kelak diaktifkan, penawaran harus menunjuk batch tertentu dan validasi server perlu disesuaikan. Radio tiap program disimpan pada `show_on_speaker` atau `show_on_certification`; `active` menjadi status penawaran bersama.

Pilihan bundling hanya muncul pada tahap awal dan [peninjauan sebelum checkout](registration-contract.md#peninjauan-paket-sebelum-checkout) bila penempatannya aktif, harga dan penjelasan tersedia, serta batch kedua program menerima pendaftaran. Saat ini contoh paket adalah Speaker + Sertifikasi; Series tidak menampilkan bundling sampai admin membuat dan mengaktifkan penempatan untuk Series. Harga, nama paket, serta kedua batch yang dipilih harus diperiksa lagi di server saat pendaftaran dikirim.

## Membuat Batch dengan sedikit pengisian ulang

Dari daftar Program, aksi **Tambah batch** membuka form Batch pada tab program tersebut. Tab Batch yang ada tetap dapat dipakai untuk beralih program. Nilai awal selain harga disalin dari batch **aktif** program itu bila ada. Pilihan batch acuan manual dan aksi **Lihat batch** di editor Program belum dibuat.

| Isian batch baru | Nilai awal | Yang tetap dilakukan admin |
| --- | --- | --- |
| Program | Program asal dari tombol atau tab aktif | Boleh mengganti sebelum menyimpan. |
| Nama batch | Kosong, dengan contoh format nama | Isi nama batch. |
| Jenis formulir | Kosong, atau dari batch aktif program | Pilih untuk batch pertama; dapat koreksi hasil salinan. |
| Harga berlaku | Harga Program saat formulir dibuka | Periksa dan ubah jika batch punya harga khusus. Simpan nilai ke batch karena pendaftaran membacanya di sana. |
| Harga normal, rincian biaya, DP, tempat, alamat | Kosong, atau dari batch aktif program | Periksa sebelum menyimpan; data lama bisa tidak berlaku untuk batch baru. |
| Jadwal sesi | Satu baris kosong | Isi tanggal serta jam mulai/selesai; tambah baris untuk pertemuan berikutnya. Jangan menyalin tanggal batch lama. |
| Status | Tidak aktif, pendaftaran tertutup | Aktifkan dan buka pendaftaran setelah seluruh informasi diperiksa. |

Simpan program dan seluruh sesi dalam satu tindakan seperti editor sekarang. Validasi tanggal/jam, sesi tidak tumpang tindih, harga berlaku, dan kesiapan batch sebelum membuka pendaftaran tetap berlaku. Nilai awal adalah bantuan input, bukan alasan untuk otomatis menerbitkan batch. Setelah disimpan, kembali ke tab program yang sama dan tampilkan batch baru beserta statusnya.

## Cakupan penerapan kelak

Perluasan berikutnya adalah penawaran yang hanya berlaku untuk batch tertentu dan pilihan batch acuan manual di CMS. Keduanya memerlukan perubahan pembacaan serta validasi server sebelum scope `batch` boleh diaktifkan. Pendaftaran dan tagihan yang sudah tersimpan harus tetap memakai snapshot pilihan serta harga saat kirim.
