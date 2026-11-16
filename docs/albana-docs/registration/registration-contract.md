# Pendaftaran dan menu MVP Albana Speech Academy

## Pendaftaran peserta

### Tahap awal pada contoh formulir

Gambar sumber memperlihatkan [tahap awal bersama](./forms/00-tahap-awal.md) sebelum formulir per program: flyer dan video pengantar, pertanyaan centang **Saatnya tampil lebih berpengaruh**, lalu pilihan tunggal **Formulir Pendaftaran** dengan empat pilihan, termasuk Paket Bundling. Tahap ini hanya acuan isi dari Google Forms dan **tidak dibangun di situs**: peserta memilih program dari halaman program, dan paket ditawarkan di akhir formulir.

### Tawaran paket di akhir formulir

Menggantikan "peninjauan paket sebelum checkout" dan pilihan bundling di tahap awal. Rancangan: [Program tetap, Batch ringkas, dan tawaran paket](../plans/2026-11-16-program-batch-bundling-design.md) — menunggu persetujuan, belum diterapkan di kode.

- Hanya pada formulir [pelatihan Speaker](./forms/02-speaker-training.md) dan [sertifikasi BNSP](./forms/03-professional-speakers-certification.md). [Public Speaking Series](./forms/01-public-speaking-series.md) tidak menampilkan tawaran.
- Letak: setelah semua pertanyaan peserta, tepat sebelum metode pembayaran. Satu kartu pilihan tunggal; bawaan **tidak**.
- Tampil hanya bila CMS mengaktifkan paket, harga paket sah, dan **kedua** program punya batch yang dibuka dengan sesi pertama belum lewat. Bila tidak, formulir langsung ke metode pembayaran.
- Isi kartu: nama program tambahan, **batch dan jadwal sesinya**, tambahan biaya, total paket, penghematan bila ada, dan penjelasan paket dari CMS. Untuk sertifikasi, sebut bahwa itu uji kompetensi dan paket tidak menjamin kelulusan.
- Tambahan biaya = harga paket − biaya program yang sedang didaftari. Total paket sama dari kedua arah.
- Peserta yang menerima tawaran masuk ke batch yang sedang dibuka pada program pasangan; tidak ada jadwal paket terpisah.
- Ringkasan **Biaya**, **Transfer sekarang**, dan **Sisa** langsung mengikuti pilihan paket serta lunas/DP. DP memakai persen paket.
- Saat dikirim, server menghitung ulang harga dari Program dan penawaran, memeriksa kedua batch, lalu menyimpan satu pendaftaran dengan dua butir batch dan satu tagihan. Bila harga atau ketersediaan berubah, kiriman ditolak dan formulir menampilkan nilai terbaru.

Jangan memakai harga pada gambar sebagai harga aktif; nilai berlaku dibaca dari CMS. Pengaturan admin dijabarkan di [CMS Program, Batch, dan tawaran paket](cms-program-batch-bundling.md).

### Alur pendaftaran situs

Peserta memilih Program, melihat biayanya (Batch otomatis: batch yang sedang dibuka pada program itu). Tampilkan nama program, nama batch, biaya dalam rupiah dari Program, alamat dari Kontak, dan seluruh pertemuan dalam WIB sebelum peserta mengisi data.

Satu halaman, tanpa akun, dengan satu tombol **Kirim pendaftaran**. Peserta mengisi identitas, latar belakang dan informasi teknis, memilih lunas atau DP 20%, lalu mencentang persetujuan penggunaan data untuk mengurus pendaftaran.

Setelah jawaban tersimpan, tampilkan **Pendaftaran diterima** dan tombol **Kirim bukti transfer via WhatsApp**. Ambil nomor tujuan dari menu Kontak (`contact_channels.kind = 'whatsapp'`). Setelah transfer, peserta membuka percakapan, melampirkan bukti, dan mengirimnya sendiri. Minta peserta menyebutkan nama dan Program - batch agar admin dapat mencocokkan pembayaran.

Jika harga berubah selama pengisian, tampilkan biaya terbaru. Jika batch ditutup atau sesi pertama sudah mulai, arahkan peserta ke Kontak. Bila peserta sudah mentransfer, arahkan ke pengelola dengan bukti yang sama agar pembayaran bisa dicocokkan. Pertahankan isian jika pengiriman gagal.

## Perbandingan kedua formulir sumber

Dua formulir pelatihan memiliki 20 butir bernomor dengan urutan yang sama. Nomor 17–18 berisi informasi untuk dibaca. Delapan belas butir lainnya meminta jawaban atau lampiran. [Public Speaking Series](./forms/01-public-speaking-series.md) · [Basic to Advance Eksklusif](./forms/02-speaker-training.md). [Formulir sertifikasi](./forms/03-professional-speakers-certification.md) juga memiliki 20 butir, tetapi tidak menanyakan tantangan dan menampilkan biaya sertifikasi serta bundling secara terpisah.

| Butir                      | Persamaan dan perbedaan                                                                                                                                | Penerapan pada formulir bersama                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1–11 · Identitas           | Keduanya menanyakan sebelas hal yang sama.                                                                                                             | Gunakan label dan pilihan identitas yang sama.                                                   |
| 12–14 · Latar belakang     | Keduanya menanyakan pengalaman pelatihan, tujuan, dan tantangan. Series menyebut public speaking, Eksklusif menyebut peran pembicara.                  | Gunakan tiga pertanyaan bersama. Sisipkan nama program pada pertanyaan tujuan.                   |
| 15–16 · Informasi teknis   | Pilihan sumber informasi dan kesediaan hadir sama. Series menyebut empat pertemuan. Eksklusif menyebut pukul 08.30–18.00 WIB.                          | Tampilkan jadwal Batch pada pertanyaan kesediaan hadir.                                          |
| 17–18 · Biaya dan transfer | Series mencantumkan Rp1.500.000. Eksklusif mencantumkan harga normal Rp1.500.000 dan harga khusus Rp1.300.000. Instruksi rekening dan grup kelas sama. | Program menyimpan satu biaya yang berlaku. Harga pada formulir sumber merupakan contoh historis. |
| 19–20 · Pembayaran         | Keduanya menawarkan lunas atau DP 20% dan meminta unggahan bukti transfer.                                                                             | Pertahankan pilihan pembayaran. Butir 20 memberi petunjuk pengiriman bukti lewat WhatsApp.       |

Yang statis adalah label, urutan, validasi, dan pesan konfirmasi formulir. Nama program, biaya, batch, dan jadwal dibaca dari katalog. Setiap peserta menghasilkan satu kiriman sendiri. Satu alamat email boleh mendaftar ke beberapa batch. Pengiriman ulang pada batch yang sama tidak menggandakan data atau menimpa kontak awal.

### Isian dan informasi yang ditampilkan

Ikuti urutan sumber. Tanda * berarti wajib. Nama kolom merujuk ke `registrations`, kecuali informasi katalog dan instruksi transfer.

| No. | Pertanyaan atau informasi | Kontrol dan penyimpanan |
| --- | --- | --- |
| 1 | Nama lengkap * | Teks, `full_name`. |
| 2 | Nama panggilan * | Teks, `nickname`. |
| 3 | Alamat/domisili * | Teks, `domicile`. |
| 4 | Nomor WhatsApp aktif * | Telepon, `whatsapp`. Pertahankan nol awal. Server menormalisasi ke 8–15 digit dengan awalan `+` opsional. |
| 5 | Email aktif * | Email, `email`. Buang spasi tepi dan simpan dalam huruf kecil. |
| 6 | Jenis kelamin * | Pilih Perempuan atau Laki-laki, `gender`. |
| 7 | Usia * | Bilangan bulat 1–150 tahun, `age`. |
| 8 | Jabatan/profesi * | Teks, `profession`. |
| 9 | Instansi/perusahaan/komunitas (jika ada) * | Teks, `institution`. Sediakan pilihan “Tidak ada” agar peserta tanpa afiliasi tetap bisa mengisi butir wajib ini. |
| 10 | Media sosial (opsional) | Teks bebas untuk nama akun, mis. “Instagram @nama”, `social_name`. Tidak wajib diisi. |
| 11 | Apakah pernah mengikuti pelatihan berbicara di depan umum? * | Ya atau Tidak, `prior_experience`. |
| 12 | Apa tujuan utama Anda mengikuti [nama program]? * | Teks panjang, `goal`. |
| 13 | Apa tantangan terbesar Anda saat berbicara di depan umum? * | Teks panjang, `challenge`. |
| 14 | Bagaimana Anda mengetahui pelatihan ini? * | Instagram (@albanaspeechacademy), WhatsApp, Teman/Kerabat, atau Lainnya. Simpan di `source`. Jika Lainnya, isi `source_other`. |
| 15 | Apakah Anda bersedia mengikuti seluruh jadwal batch ini? * | Tampilkan tanggal dan jam tiap sesi dalam WIB. Pilih “Ya, siap hadir penuh” atau “Mungkin (akan menyesuaikan jadwal)”, `attendance`. |
| 16 | Biaya pelatihan | Tampilkan nama Program, Batch dan biaya yang berlaku. Simpan biaya saat kirim di `price_idr_at_signup`. |
| 17 | Informasi pembayaran | Tampilkan instruksi transfer yang telah dikonfirmasi pengelola. Gambar sumber menulis BCA 4497062020 a.n. ASA Albana CV; naskah lama menulis nama pemilik berbeda. Jangan memakai data dari gambar sebagai rekening aktif tanpa verifikasi. |
| 18 | Metode pembayaran * | Pilih “Transfer lunas” (`full`) atau “DP 20%” (`dp20`), simpan di `payment_method`. Tepat di bawah pilihan, tampilkan **Biaya program**, **Transfer sekarang**, dan **Sisa setelah transfer**. Hitung ulang langsung saat pilihan atau biaya berubah, sebelum formulir dikirim. |
| 19 | Cara mengirim bukti transfer | Tampilkan petunjuk “Setelah mendaftar dan melakukan transfer, kirim bukti melalui WhatsApp resmi akademi.” Tautan tersedia pada konfirmasi pendaftaran. |

Untuk DP, bulatkan 20% dari biaya ke rupiah terdekat. Hitung sisa dengan mengurangi biaya program sebesar DP yang sudah dibulatkan. Untuk transfer lunas, nominal transfer sama dengan biaya program dan sisanya Rp0.

| Pilihan | Biaya program | Transfer sekarang | Sisa setelah transfer |
| --- | ---: | ---: | ---: |
| DP 20% | Rp1.500.000 | Rp300.000 | Rp1.200.000 |
| Transfer lunas | Rp1.500.000 | Rp1.500.000 | Rp0 |

## Enam menu utama

| Menu    | Isian pengelola katalog                                                                                                                                          | Yang dilihat peserta                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Program | Nama dan biaya dalam rupiah. Slug stabil dibuat dari nama saat pembuatan.                                                                                        | Nama, biaya, dan pilihan batch program.                                |
| Batch   | Pilih Program yang sudah ada, beri nama batch, lalu tambahkan pasangan tanggal/jam mulai dan selesai per sesi pada form yang sama. Buka pendaftaran ketika siap. | Nama dan biaya diambil dari Program. Semua sesi ditampilkan berurutan. |
| Trainer | Nama dan bio singkat opsional.                                                                                                                                   | Profil pengajar.                                                       |
| Artikel | Judul, isi, dan status terbit.                                                                                                                                   | Artikel yang sudah terbit.                                             |
| Gallery | Nama dan gambar. Gunakan gambar yang memiliki izin publikasi.                                                                                                    | Gambar dengan nama sebagai keterangan.                                 |
| Kontak  | Jenis kanal dan nilainya.                                                                                                                                        | WhatsApp, email, Instagram, atau alamat resmi yang tersedia.           |

Program dapat dipakai oleh beberapa Batch. Satu penyimpanan Batch menulis pilihan Program dan seluruh jadwal sekaligus. Setiap sesi harus berakhir setelah waktu mulai dan tidak tumpang tindih dengan sesi berikutnya. ID pertemuan, editor sesi terpisah, dan penyalinan harga ke formulir pengelola batch tidak diperlukan.

## Akses admin dan penyimpanan

Sesudah login, admin membuka **Data Pendaftar** melalui area privat. Daftar menampilkan waktu masuk terbaru dahulu, program, batch, nama, WhatsApp, email, biaya, dan pilihan pembayaran. Admin dapat membaca seluruh jawaban pada detail pendaftaran dan mencocokkannya dengan bukti yang diterima di WhatsApp.

Pada daftar dan detail, tampilkan **Nominal transfer awal** (`initial_transfer_idr`) dan **Sisa setelah transfer awal** (`remaining_after_transfer_idr`). Database menghitung keduanya dari metode dan biaya saat peserta mendaftar. Angka sisa menunjukkan jumlah yang perlu dilunasi apabila transfer awal sudah diterima. Admin mencocokkan penerimaan aktual melalui bukti di WhatsApp.

| Kebutuhan | Kontrak data |
| --- | --- |
| Katalog | `programs(title, price_idr)`; `batches(program_slug, title, sessions, registration_open)`. Jadwal berupa larik terurut, misalnya `[{"starts_at":"2026-12-12T08:30","ends_at":"2026-12-12T18:00"}]` dalam WIB. |
| Konten | `trainers`, `articles`, `gallery(title, image_url)`, dan `contact_channels`. Pemilik katalog menyiapkan data lewat akses pengelola tepercaya. |
| Kiriman | Server membatasi percobaan, memvalidasi jawaban dan persetujuan, lalu memanggil `receive_registration(batch, expected_price, participant, consent)` memakai kredensial server. Objek `participant` hanya berisi kolom jawaban peserta. |
| Hasil | RPC memeriksa batch dan harga, lalu menyimpan jawaban serta biaya saat mendaftar. `received_at` mencatat waktu penerimaan dan persetujuan. Untuk `received` atau `duplicate`, tampilkan konfirmasi dan tautan WhatsApp yang sama. Untuk `changed`, `unavailable`, atau kesalahan validasi, tampilkan alasan yang sesuai. |
| Pembacaan | Ambil `registrations` beserta nama batch dan program melalui `registrations.batch_slug → batches.program_slug → programs.slug`. Gunakan sesi pengguna Supabase Auth. Kebijakan baca memeriksa keanggotaan di `admin_users`. |

[Skema instalasi MVP](../data/albana-schema.sql) ditujukan untuk proyek Supabase kosong. Untuk basis data yang sudah berisi pendaftar atau data komunitas, diperlukan migrasi dan pemetaan data tersendiri sebelum aplikasi beralih.
