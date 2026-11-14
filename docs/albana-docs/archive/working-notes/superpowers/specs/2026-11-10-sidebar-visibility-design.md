# Pengaturan visibilitas sidebar admin

**Tanggal:** 10 November 2026  
**Status:** Disetujui

## Tujuan

Memberi semua admin satu pengaturan bersama untuk menampilkan atau menyembunyikan modul pada sidebar CMS. Admin tidak perlu mengatur ulang menu pada setiap akun atau perangkat.

## Cakupan

- Aktifkan halaman `/admin/sidebar-layout` sebagai halaman pengaturan visibilitas modul.
- Tambahkan akses menuju halaman tersebut dari area Pengaturan.
- Simpan slug modul yang disembunyikan pada kolom baru di baris tunggal `public.academy`.
- Terapkan konfigurasi yang sama pada sidebar desktop dan menu navigasi mobile.
- Tampilkan semua modul bila konfigurasi belum tersedia atau gagal dimuat.
- Pertahankan Ringkasan dan Pengaturan agar selalu terlihat.

## Di luar cakupan

- Tidak membuat pengaturan per akun, pengurutan menu, grup baru, atau permission per modul.
- Tidak menyembunyikan rute atau mengubah otorisasi. Pengaturan hanya mengubah navigasi yang terlihat.
- Tidak membuat tabel, dependency, atau sistem konfigurasi baru.

## Pendekatan yang dipertimbangkan

1. Menambah kolom pada `academy`. Dipilih karena konfigurasi bersifat global dan dapat memakai kebijakan admin yang sudah ada.
2. Membuat tabel `admin_settings`. Lebih terpisah secara domain, tetapi menambah tabel, grant, RLS, validasi, dan endpoint.
3. Menyimpan konfigurasi dalam kode. Global tetapi tidak dapat diubah dari CMS.

## Perilaku dan data

Kolom `hidden_admin_modules` berbentuk array teks dengan nilai awal kosong. Server membaca nilai ini setelah otorisasi admin, menyaring slug yang tidak dikenal, lalu mengirim daftar tersembunyi ke navigasi dan halaman pengaturan. Penyimpanan menerima hanya slug modul yang terdaftar pada `adminModules`.

Halaman menampilkan satu baris per modul dengan nama, grup, dan kontrol switch berlabel. Perubahan baru berlaku setelah admin menekan **Simpan perubahan**. Saat penyimpanan berhasil, navigasi diperbarui tanpa memerlukan login ulang. Kegagalan menampilkan pesan yang dapat dipahami dan mempertahankan pilihan di layar agar dapat dicoba kembali.

## Arah visual

Halaman mengikuti sistem desain admin yang sudah ada. Daftar dipakai karena tugas utama admin adalah memindai nama modul dan mengubah satu status. Aksen hanya menandai switch aktif dan tombol simpan. Tidak ada kartu statistik, ikon dekoratif, atau animasi baru.

Design Read: halaman pengaturan internal untuk admin, memakai bahasa visual Modern Monochrome Dashboard yang sudah ada, dengan ENERGY 1, RHYTHM 1, dan MOTION 1.

## Kriteria penerimaan

- Semua admin melihat konfigurasi sidebar yang sama setelah data tersimpan.
- Modul yang dimatikan hilang dari sidebar desktop dan menu mobile.
- Modul dapat ditampilkan kembali melalui `/admin/sidebar-layout`.
- Ringkasan dan Pengaturan tidak memiliki switch dan tetap dapat diakses.
- Input tidak dikenal ditolak oleh server.
- Keadaan memuat, gagal memuat, menyimpan, berhasil, dan gagal menyimpan terlihat dan dapat dipahami.
- Kontrol dapat digunakan dengan keyboard, memiliki label aksesibel, target sentuh minimal 44 px, dan fokus yang terlihat.
- Tampilan tidak meluber pada lebar 320, 390, 834, dan 1440 px.

## Risiko dan pemulihan

Kolom baru harus diterapkan pada database dev sebelum halaman dapat menyimpan perubahan. Migrasi bersifat expand-only dan nilai awal kosong mempertahankan sidebar saat ini. Jika fitur perlu dibatalkan, aplikasi dapat mengabaikan kolom tersebut tanpa menghapus data.
