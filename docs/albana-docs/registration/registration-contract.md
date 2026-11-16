# Pendaftaran dan menu MVP Albana Speech Academy

## Pendaftaran peserta

### Tahap awal pada contoh formulir

Gambar sumber memperlihatkan [tahap awal bersama](./forms/00-tahap-awal.md) sebelum formulir per program: flyer dan video pengantar, pertanyaan centang **Saatnya tampil lebih berpengaruh**, lalu pilihan tunggal **Formulir Pendaftaran**. Empat pilihan ditampilkan, termasuk sertifikasi dan bundling. Folder `forms/` memiliki tiga formulir lanjutan; gambar tidak memperlihatkan formulir khusus untuk bundling. Tahap awal ini adalah acuan isi dari contoh Google Forms, bukan pernyataan bahwa alur tersebut sudah diterapkan di situs.

### Peninjauan paket sebelum checkout

Setelah pertanyaan program terisi, tetapi sebelum checkout atau pengiriman pendaftaran, peserta dapat meninjau ulang pilihan awal. Tampilkan pilihan tunggal **tetap pada program biasa** atau **ambil bundling** hanya jika CMS memiliki penawaran aktif yang ditempatkan pada program tersebut dan kedua batch dapat didaftari. Saat ini contoh yang terdokumentasi memasangkan [pelatihan Speaker](./forms/02-speaker-training.md) dengan [sertifikasi BNSP](./forms/03-professional-speakers-certification.md); [Public Speaking Series](./forms/01-public-speaking-series.md) tidak memiliki penawaran bundling saat ini. Jika bundling dipilih sejak tahap awal, tandai bundling sebagai pilihan awal di sini. Peserta tetap dapat kembali ke program biasa sebelum mengirim pendaftaran.

CMS perlu menyediakan penawaran per pasangan program: judul, dua program, penjelasan isi paket, harga, aturan DP, dan status aktif. Penjelasan harus menyebut apa yang didapat peserta; untuk paket Speaker–BNSP, jelaskan bahwa sertifikasi adalah uji kompetensi, bukan jaminan lulus. Sebelum peserta menetapkan pilihan, tampilkan jadwal tiap kegiatan, persyaratan yang berlaku, biaya program biasa dan bundling, serta selisihnya. Perubahan pilihan harus memperbarui nama paket, biaya, dan nominal lunas atau DP pada ringkasan checkout; simpan hanya pilihan final yang dikonfirmasi peserta. Jangan memakai harga pada gambar sebagai harga aktif. Jika tidak ada penawaran valid untuk program itu, lewati pilihan bundling dan lanjutkan program biasa.

Pengaturan radio Ya/Tidak per Program, penempatan bundling tingkat program sekarang atau batch kelak, dan alur input Batch dengan nilai awal dijabarkan dalam [rancangan CMS Program, Batch, dan Bundling](cms-program-batch-bundling.md).

Editor Program sekarang memiliki radio bundling dan isian penjelasan paket. Penawaran yang ditampilkan di situs masih pada tingkat program; penempatan per batch belum diaktifkan. Pilihan ulang tersedia pada langkah pembayaran. Tahap awal dengan flyer dari gambar sumber belum menjadi halaman situs.

### Alur pendaftaran situs

Peserta memilih Program, melihat biayanya (Batch otomatis dari admin). Tampilkan nama program, nomor atau nama batch, biaya dalam rupiah, dan seluruh pertemuan dalam WIB sebelum peserta mengisi data.

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
