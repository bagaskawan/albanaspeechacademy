# Template sistem desain admin: daftar dan formulir

Gunakan panduan ini untuk dua pekerjaan operator: **menemukan dan membandingkan data** di halaman daftar, lalu **menambah atau mengubah satu data** di formulir. Pola yang dipertahankan adalah urutan informasi, perbedaan prioritas aksi, dan umpan balik setelah interaksi. Nama kolom, font, warna, dan ukuran mengikuti kebutuhan proyek.

**Cara memakai:** isi tabel berikut untuk satu modul, lalu terapkan bagian 1–5. Angka dalam panduan adalah nilai awal untuk antarmuka desktop yang padat, dalam piksel CSS pada ukuran dasar 16 px. Nama token menjelaskan fungsi visual dan dapat dipetakan ke tema yang sudah ada, tanpa bergantung pada framework.

| Keputusan per modul | Isi untuk proyek Anda | Contoh: inventaris |
| --- | --- | --- |
| Data apa yang dikelola? Bagaimana membedakan dua data bernama sama? | [Entitas] · [nama utama] · [pengenal kedua] | Barang · nama barang · SKU |
| Keputusan apa yang dibuat dari daftar? | [Tugas operator] · [atribut pembanding] | Menentukan barang yang perlu dipesan · stok tersedia dan stok minimum |
| Bagaimana operator menemukan satu data? | [Kolom pencarian] · [filter yang berguna] | Cari nama atau SKU · filter gudang |
| Aksi apa yang paling sering dilakukan? | [Aksi halaman] · [aksi per baris] | Tambah barang · Ubah barang |
| Apa yang terjadi sesudah simpan atau batal? | [Tujuan setelah tambah] · [tujuan setelah ubah] · [konteks yang dipertahankan] | Kembali ke daftar dengan filter gudang semula; tampilkan konfirmasi setelah simpan |

## 1. Tipografi

Pilih satu keluarga **sans-serif** untuk judul, isi, dan kontrol. Gunakan font produk bila tersedia; pilihan tanpa dependensi adalah `system-ui, sans-serif`. Gunakan gaya tegak sebagai standar. Simpan **monospace** untuk pengenal yang perlu disalin atau dibandingkan karakter demi karakter, seperti SKU. Untuk kolom angka, fitur `tabular-nums` menjaga digit tetap sejajar tanpa mengganti keluarga font.

| Peran | Ukuran / tinggi baris | Bobot | Aturan pakai |
| --- | --- | --- | --- |
| Judul halaman | 24 / 32 px | 700 | Satu judul utama. Sebut objek atau pekerjaan: “Daftar barang”, “Tambah barang”, “Ubah barang”. |
| Judul kelompok | 16 / 24 px | 600 | Pakai saat beberapa bidang memiliki tujuan yang sama, misalnya “Lokasi penyimpanan”. |
| Isi tabel dan kontrol | 14 / 20 px | 400–500 | Tebalkan identitas utama baris ke 600. Angka dan tanggal tetap mudah dibandingkan tanpa semua nilai menjadi tebal. |
| Label bidang dan kepala kolom | 12 / 16 px | 600 | Label terlihat meski bidang terisi. Gunakan kapital seperti kalimat; singkatan resmi seperti SKU tetap kapital. |
| Metadata dan petunjuk | 12 / 16 px | 400 | Letakkan dekat nilai yang dijelaskan. Kesalahan dan instruksi wajib harus tetap mudah dibaca. |
| Label tombol dan status | Tombol 14 / 20 px; status 12 / 16 px | 600 | Tombol memakai kata kerja (“Simpan”); status menyebut kondisi (“Tersimpan”). |

Sesuaikan kepadatan melalui skala ini. Pada layar sentuh, titik awal yang lebih nyaman untuk teks masukan adalah 16 px. Uji dengan nama terpanjang dan bahasa yang dipakai operator sebelum memperkecil huruf.

## 2. Tata letak dan jarak

Ratakan judul, bilah kontrol, dan isi ke tepi konten yang sama. **Daftar** boleh memakai seluruh lebar yang tersedia agar kolom dapat dibandingkan. **Formulir** mengikuti panjang jawaban: batasi panel satu kolom sekitar 640–800 px di desktop bila sebagian besar bidang berisi teks pendek.

| Hubungan | Jarak awal | Penerapan |
| --- | --- | --- |
| Label → bidang → petunjuk | 4–8 px | Ketiganya terbaca sebagai satu kelompok. Letakkan pesan kesalahan di posisi petunjuk. |
| Ikon → teks; tombol → tombol | 8–12 px | Pertahankan jarak yang sama saat label tombol berubah menjadi status proses. |
| Bidang → bidang | 16–20 px | Berlaku untuk susunan vertikal dan celah di antara dua kolom terkait. |
| Kelompok → kelompok | 24–32 px | Pakai untuk memisahkan kepala halaman, filter, hasil, atau bagian formulir. |
| Tepi halaman dan panel | 16 px pada layar sempit; 24–32 px pada layar lebar | Pada ponsel, kurangi padding panel sebelum mempersempit kontrol atau mengecilkan teks. |

**Permukaan dan warna:** petakan peran `canvas` ke latar halaman, `surface` ke panel, `inset` ke isian, dan `border` ke pemisah. Contoh tema terang: #F2F4F7, #FFFFFF, #F5F5F5, dan #E5E7EB. Gunakan pasangan `action-primary` dan `on-primary` untuk latar tombol utama dan teksnya. Pisahkan warna merek dari warna status; setiap status memiliki label yang tetap bermakna tanpa warna. Jika proyek mendukung tema gelap, ganti nilai token tanpa mengubah hierarkinya.

**Aturan responsif:** susun satu kolom dahulu. Mulai uji pasangan bidang pada lebar 640 px dan tabel pada 768 px. Beralih berdasarkan ruang **konten**: jika sidebar membuat dua label terpotong, pertahankan susunan satu kolom meskipun viewport sudah lebar.

## 3. Tombol: varian dan keadaan

| Varian | Kapan dipakai | Bentuk awal |
| --- | --- | --- |
| Utama | Satu aksi utama per area kerja, misalnya “Tambah barang” di daftar atau “Simpan perubahan” di formulir. | Isian kontras, tinggi 40 px, padding horizontal 16 px, label tebal. |
| Sekunder | Alternatif yang perlu terlihat bersama aksi utama, misalnya “Batal”. | Tinggi dan radius sama dengan tombol utama; permukaan netral dan border 1 px. |
| Tersier / ikon | Aksi pendukung seperti kembali, segarkan, atau lihat detail. Pertahankan label teks bila arti ikon tidak jelas. | Latar transparan, ikon 16 px. Beri nama aksesibel yang menyebut aksi dan objek untuk tombol per baris. |
| Destruktif | Tindakan yang menghilangkan data. Sebut objeknya, misalnya “Hapus barang”. | Gunakan warna bahaya; pisahkan dari Simpan. Minta konfirmasi jika penghapusan tidak dapat dipulihkan. |

Gunakan satu radius kontrol, misalnya 12 px, untuk tombol dan input. Bentuk kapsul cocok untuk filter pilihan. Bedakan filter yang dapat ditekan dari lencana status yang hanya menyampaikan informasi.

| Keadaan | Perilaku |
| --- | --- |
| Normal, hover, ditekan | Label dapat dibaca sebelum interaksi. Saat hover atau ditekan, ubah warna permukaan atau border tanpa menggeser tata letak. |
| Fokus keyboard | Tampilkan garis fokus yang kontras, misalnya 2 px dengan jarak luar 2 px. Fokus harus terlihat tanpa mengandalkan hover. |
| Terpilih | Untuk filter atau tombol pilihan, pertahankan tanda centang, border, atau isian setelah pointer pergi. Sampaikan keadaan pilihan juga ke pembaca layar. |
| Nonaktif | Cegah aktivasi dengan klik maupun keyboard. Bila alasannya tidak jelas, jelaskan di dekat kontrol, misalnya “Pilih minimal satu baris untuk mengekspor”. |
| Sedang diproses | Pertahankan lebar tombol, ubah label menjadi “Menyimpan…”, dan cegah pengiriman ganda. Setelah gagal, aktifkan kembali tombol agar bisa dicoba ulang. |

## 4. Tabel data: struktur halaman daftar

**Urutan baca:** judul dan aksi halaman → pencarian atau filter yang diperlukan → hasil → navigasi halaman bila hasil terbagi. Tambahkan segmen dengan jumlah hanya jika operator sering berpindah di antara kelompok yang sama. Tampilkan filter aktif dan cara menghapusnya di dekat hasil.

| Posisi | Isi kolom | Aturan |
| --- | --- | --- |
| Pertama: identitas | Nama atau judul, dengan kode pembeda di bawahnya jika diperlukan. | Rata kiri. Foto atau ikon hanya berguna bila membantu pengenalan. Jika nama dipotong, sediakan cara membaca nilai lengkap. |
| Tengah: pembanding | Atribut yang diperlukan untuk keputusan di daftar. Contoh inventaris: gudang, stok tersedia, stok minimum. | Teks rata kiri; jumlah dan nilai uang rata kanan, termasuk kepala kolomnya. Gunakan satuan serta format tanggal yang konsisten. Pindahkan rincian yang jarang dibandingkan ke halaman detail. |
| Opsional: status | Kondisi yang mengubah tindak lanjut, misalnya “Perlu dipesan”. | Gunakan teks singkat. Jangan beri warna pada setiap kategori bila perbedaannya tidak memengaruhi tindakan. |
| Terakhir: aksi | Aksi terhadap baris itu, misalnya “Ubah”. | Jaga posisi dan urutan tetap sama. Pindahkan aksi yang jarang dipakai ke menu berlabel. Hilangkan kolom jika tidak ada aksi per baris. |

**Anatomi:** gunakan tabel semantik dengan kepala kolom. Mulai dengan padding sel 12–14 px vertikal dan 16–20 px horizontal. Bedakan kepala tabel dengan latar tipis; gunakan garis horizontal 1 px untuk memisahkan baris. Jika kolom dapat diurutkan, jadikan judulnya kontrol dan tunjukkan arah urutan aktif.

| Keadaan daftar | Apa yang dilihat dan dapat dilakukan operator |
| --- | --- |
| Belum ada data | Sebutkan bahwa daftar masih kosong. Tawarkan “Tambah [entitas]” jika operator boleh membuat data. |
| Tidak ada hasil filter | Pertahankan pencarian dan filter. Tampilkan “Tidak ada hasil yang cocok” dengan aksi “Hapus filter”. |
| Memuat / gagal dimuat | Pertahankan kepala daftar ketika memuat. Saat gagal, tampilkan pesan dan “Coba lagi”; jangan menampilkan kegagalan sebagai daftar kosong. |
| Banyak halaman | Pertahankan filter dan urutan saat berpindah. Tampilkan posisi saat ini dan nonaktifkan arah yang sudah mencapai batas. |

**Di layar sempit, pilih berdasarkan pekerjaan:** jika operator perlu membandingkan angka antarkolom, pertahankan tabel dan izinkan gulir horizontal di area tabel. Jika operator mencari satu objek lalu membukanya, gunakan kartu ringkas berisi identitas, atribut penentu, dan aksi yang sama.

## 5. Formulir: tambah dan ubah

Gunakan urutan bidang yang sama di kedua mode. **Tambah** dimulai dari nilai kosong atau default yang aman; **Ubah** memuat nilai tersimpan, termasuk nilai kosong yang sah. Jangan menerapkan default pembuatan ke data lama saat operator hanya mengubah satu bidang.

| Bagian | Spesifikasi |
| --- | --- |
| Kepala | Judul “Tambah [entitas]” atau “Ubah [entitas]”. Pada mode ubah, tampilkan nama atau kode objek jika ada risiko salah sasaran. Tambahkan deskripsi hanya untuk keputusan yang butuh penjelasan. |
| Identitas | Mulai dari bidang yang mengenalkan objek. Gunakan label permanen di atas kontrol; placeholder hanya untuk contoh. Tandai bidang wajib dan jelaskan penandanya. |
| Atribut | Susun satu kolom sebagai dasar. Pasangkan dua bidang hanya jika dibaca bersama, misalnya jumlah dan satuan atau tanggal mulai dan selesai. Uraian panjang dan pesan lintas bidang memakai lebar penuh. |
| Pilihan dan konsekuensi | Gunakan pilihan tunggal untuk opsi yang saling meniadakan dan checkbox untuk keputusan independen. Jelaskan akibatnya di label, misalnya “Tampilkan di katalog publik”. Jangan mengasumsikan publikasi aktif secara default. |
| Area aksi | Pisahkan dari bidang terakhir dengan jarak 16–24 px atau divider. Letakkan “Batal” dan aksi utama dalam urutan yang konsisten. Di layar sempit, beri ruang agar label tetap utuh dan kedua tombol mudah disentuh. |

**Kontrol:** mulai dari tinggi 40 px, padding horizontal 12–16 px, dan border 1 px untuk input satu baris. Gunakan textarea sekitar tiga baris untuk uraian. Tambahkan pencarian pada pilihan yang panjang; gunakan select biasa bila opsi singkat dan mudah dipindai. Hubungkan label dan petunjuk dengan kontrol yang dijelaskan.

**Validasi:** tunjukkan kesalahan di dekat bidang dan jelaskan perbaikannya, misalnya “Tanggal selesai harus setelah tanggal mulai”. Saat pengiriman gagal karena isian, arahkan fokus ke ringkasan kesalahan atau bidang pertama yang perlu diperbaiki. Untuk kegagalan jaringan, beri pesan pada tingkat formulir dan pertahankan seluruh isian.

**Selesai atau batal:** aksi utama menyebut hasilnya (“Tambah barang” atau “Simpan perubahan”). Setelah berhasil, beri konfirmasi dan arahkan ke tujuan yang ditetapkan untuk modul tersebut. Batal kembali tanpa menyimpan; jika ada perubahan yang akan hilang, beri kesempatan untuk tetap mengedit.

Untuk menguji adaptasi pertama, coba satu alur utuh: cari objek → ubah satu nilai → simpan → temukan kembali objek dengan filter sebelumnya. Ulangi di layar sempit dan dengan keyboard. Jika operator kehilangan konteks atau tidak tahu apakah perubahan tersimpan, perbaiki alurnya sebelum menyesuaikan warna atau radius.
