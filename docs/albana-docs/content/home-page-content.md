# Albana Speech Academy · Konten Home

Heading, description, dan label aksi di bawah adalah naskah antarmuka. **Contoh pratinjau** adalah materi simulasi untuk mockup. Ganti dengan data terbit dan dokumentasi berizin sebelum publikasi. Aturan visual dan prompt bersama Figma/Stitch ada di [spesifikasi desain](../design/visual-design.md).

Urutan yang direncanakan: Hero, Perkenalan Alan, Program, Cara ngajar, Trainer, Jadwal, Dokumentasi, Format pelatihan, dan Hubungi kami. Format pelatihan dan kontak melengkapi pilihan bagi calon peserta individu maupun organisasi. Materi dari proposal telah disetujui pengguna pada 8 November 2026 dan dirender sebagai konten terbit. Aksi pendaftaran membuka `/register` hanya untuk batch yang tersedia.

## Navigasi

**Identitas:** Albana Speech Academy  
**Menu:** Alan · Program · Cara ngajar · Trainer · Jadwal · Dokumentasi  
**Aksi utama:** Lihat jadwal

Tautan menu menuju anchor di beranda. Tambahkan tautan Dokumentasi dan Artikel hanya jika seksinya tersedia.

## 1. Hero

**Heading (H1):** Albana Speech Academy

**Description:** Saat tim menunggu usulanmu, bagaimana kamu memulai? Di kelas public speaking ini, kamu berlatih membuka presentasi, menjelaskan pilihan, dan menjawab pertanyaan di depan orang lain.

**CTA utama:** Lihat jadwal  
**CTA sekunder:** Lihat cara mengajar

“Lihat jadwal” menuju `#jadwal` di bagian pilihan program, termasuk saat katalog kosong atau gagal dimuat. Pendaftaran dimulai dari program yang dipilih.
**Baris fokus:** Presentasi · Diskusi · MC

Hero hanya berisi pengantar terpusat: judul, deskripsi, dan dua CTA dalam satu kolom. Jangan menambahkan mosaik kartu, label video, cuplikan kelas, atau foto profil di hero.

## 2. Perkenalan Alan

**Eyebrow:** Di balik kelas  
**Heading (H2):** Kenali Alan, sosok di balik Albana Speech Academy  
**Peran:** Founder Albana Speech Academy

**Description:** Pengalaman siaran, panggung, dan pelatihan menjadi bekal Alan saat mendampingi sesi praktik.

**Poin sekilas:**

- Berpengalaman sebagai penyiar Radio Republik Indonesia sejak 2015.
- Berlatar pendidikan komunikasi penyiaran Islam dan komunikasi pendidikan.
- Memiliki sertifikasi Master Trainer dan Public Speaker BNSP.

**Tautan:** Lihat cara mengajar

Gunakan foto Alan yang telah disetujui dengan alt “Alan Albana, founder Albana Speech Academy”. Jika foto belum tersedia atau gagal dimuat, tampilkan teks tanpa menggantinya dengan foto stok. Pengalaman, sertifikasi, dan izin foto disetujui berdasarkan proposal (8 November 2026). Profil lengkap hanya ditautkan jika sudah terbit.

## 3. Program

**Eyebrow:** Ruang latihan  
**Heading (H2):** Setiap situasi bicara membutuhkan latihan yang berbeda

**Description:** Ada saatnya kamu perlu mempresentasikan gagasan, memandu acara, atau menguatkan komunikasi tim. Mulai dari situasi yang paling dekat dengan kebutuhanmu.

### Public Speaking for Speaker

Pelatihan untuk mengembangkan kemampuan berbicara dan menyampaikan pesan sebagai pembicara profesional.

**Materi pada poster:**

- Memetakan pemangku kepentingan, menyusun strategi pesan dan taktik komunikasi, serta mengelola waktu.
- Fundamental public speaking, teknik opening dan closing, serta struktur pesan.
- Teknik interaktif, ice breaking, dan tanya jawab.
- Presentasi akhir dan feedback mendalam.

Poster menyebut pelatihan dan sertifikasi BNSP skema okupasi pembicara profesional. Detail penyelenggara, persyaratan, biaya, dan proses sertifikasi perlu dikonfirmasi sebelum menjadi janji pendaftaran; jangan menjanjikan kelulusan atau sertifikat. Brief saat ini menempatkan penjualan sertifikasi di luar cakupan awal, sehingga penerapan alur sertifikasi di situs memerlukan keputusan terpisah.

### Public Speaking Series

Program yang mencakup dasar public speaking dan latihan untuk berbagai peran saat berbicara di depan audiens.

**Materi pada poster:**

- Basic Public Speaking.
- MC formal dan nonformal.
- Moderator.
- Host Live.
- Personal Branding.

Poster menyebut empat pertemuan untuk batch yang ditawarkan. Jumlah pertemuan batch lain mengikuti jadwal yang terbit.

**Arahan penempatan:** Satukan kedua program dalam satu seksi Program di landing page. Tampilkan kedua program sebagai blok berurutan dari atas ke bawah pada semua ukuran layar, tanpa carousel atau tab yang menyembunyikan pilihan. Setiap blok memakai urutan yang sama: nama, ringkasan fokus, materi, lalu tautan jadwal. Gunakan pemisah dan ruang antarkelompok agar program mudah dibedakan; batasi lebar teks agar nyaman dibaca. Jangan menandai salah satu sebagai pilihan terbaik tanpa dasar.

Bagian Program menjelaskan perbedaannya; bagian Jadwal menampilkan batch, tanggal, tempat, harga yang tersedia, dan status per program. Dengan begitu pengunjung dapat membandingkan program sebelum memeriksa jadwal. Rincian materi di atas tetap tersedia dalam blok program; bila panjang pada ponsel, gunakan kontrol **Lihat materi** yang dapat dibuka dengan keyboard. Biaya dan kondisi yang memengaruhi pendaftaran tidak disembunyikan di dalam kontrol itu. Halaman detail `/program/[slug]` menampilkan ringkasan, status atau jadwal, dan seluruh materi program.

**Aksi tiap program:** Tampilkan tiga materi utama dan kontrol **Lihat materi lainnya** di dalam kartu. **Lihat selengkapnya** menuju `/program/[slug]`. **Daftar program** menuju `/register/<slug-program>`; bila jadwal belum tersedia, halaman itu tetap menampilkan program pilihan dan statusnya tanpa formulir.

## 4. Cara ngajar

**Eyebrow:** Cara belajar  
**Heading (H2):** Kemampuan bicara tumbuh saat benar-benar dipraktikkan

**Description:** Sebagian besar waktu belajar dipakai untuk praktik dan simulasi, lalu ditajamkan lewat coaching, feedback, dan kerangka komunikasi.

**Pendekatan:**

1. **70% praktik dan simulasi.** Coba berbicara, presentasi, atau memainkan peran sesuai materi pelatihan.
2. **20% coaching dan feedback.** Tinjau penampilan melalui masukan trainer dan sesama peserta.
3. **10% konsep dan kerangka.** Pelajari prinsip dan alat komunikasi yang mendukung praktik.

Gunakan model 70/20/10 sesuai keputusan pengguna. Kegiatan mengikuti silabus batch.

## 5. Trainer

**Eyebrow:** Pendamping latihan  
**Heading (H2):** Temui praktisi yang mendampingi proses belajarmu

**Description:** Setiap trainer hadir sesuai kebutuhan program. Buka profil untuk melihat informasi yang sudah tersedia.

Proposal mencantumkan Alan Albana, Nurachman, Andhan Indah, dan Abo Priatna; keempatnya tampil sebagai strip potret persegi dengan nama dan peran di bawah tiap foto. Selama foto resmi belum disetujui, slot potret memakai placeholder monogram berisi inisial, bukan foto contoh. Jangan menyiratkan semua trainer mengajar setiap batch; tampilkan penugasan hanya jika sudah dikonfirmasi.

**Aksi:** Lihat jadwal

## 6. Jadwal dan tempat

**Heading (H2):** Jadwal kelas

**Description:** Pilih batch dan periksa tanggal setiap sesi serta tempatnya sebelum mendaftar.

**Data dari poster · perlu konfirmasi status sebelum terbit**

**Public Speaking for Speaker**

- **Tanggal:** 29 dan 30 November 2026.
- **Waktu:** 08.00–18.00 WIB, sesuai waktu yang tercantum pada poster; pastikan berlaku pada kedua hari.
- **Tempat:** Albana Speech Academy, Jl. Diponegoro No. 61, Bandung.

**Public Speaking Series**

- **Sesi 1:** 7 November 2026, 15.00–18.00 WIB.
- **Sesi 2:** 14 November 2026, 15.00–18.00 WIB.
- **Sesi 3:** 21 November 2026, 15.00–18.00 WIB.
- **Sesi 4:** 28 November 2026, 15.00–18.00 WIB.
- **Tempat:** Albana Speech Academy, Jl. Diponegoro No. 61, Bandung.

Kedua jadwal di atas ditranskripsikan dari poster, bukan status pendaftaran terkini. Tanggal, jam, tempat, biaya, dan status harus dikonfirmasi sebelum dipublikasikan sebagai batch aktif. Sesi 1 Series sudah berlalu pada 8 November 2026; jangan menyimpulkan peserta masih dapat bergabung. Jangan memakai data ini sebagai contoh batch lain atau menampilkan biaya yang belum tersedia.

Kelompokkan setiap batch menurut program, dengan semua tanggal dan tempat dalam satu panel. Jika suatu program belum memiliki batch terbit, tampilkan nama program dan “Jadwal program ini belum tersedia.” Series pada poster memiliki empat sesi; for Speaker berlangsung dua hari. Jumlah sesi batch lain mengikuti data aktual. Tampilkan alamat, petunjuk, dan tautan peta hanya setelah terverifikasi. **Daftar kelas ini** menuju `/register/<slug-program>` hanya bila batch menerima pendaftaran dan tujuan berfungsi. Jika belum ada batch terbit, pertahankan `#jadwal` dan tampilkan **“Jadwal kelas berikutnya belum tersedia.”** Jika pemuatan gagal, tampilkan **“Jadwal belum bisa dimuat.”** dan aksi **Coba lagi** jika tersedia.

## 7. Dokumentasi

**Eyebrow:** Gambaran kelas  
**Heading (H2):** Kenali ritme latihan lewat gambaran berikut

**Description:** Foto Pexels berikut hanya menggambarkan situasi latihan. Dokumentasi kelas Albana akan ditampilkan setelah aset dan izin publikasi tersedia.

Tampilkan foto kegiatan berizin dalam bento grid: satu foto utama besar, empat foto kecil, dan satu foto panorama lebar pada layar lebar; pada layar sempit grid menyusut menjadi dua kolom tanpa memotong konten penting atau menimbulkan scroll horizontal. Klik atau Enter pada foto membuka dialog gambar besar; dialog dapat ditutup lewat tombol ×, klik latar, atau Escape, dan fokus kembali ke foto pemicu. Pertahankan proporsi gambar. Gunakan alt yang menjelaskan isi foto; foto dekoratif memakai alt kosong. Caption ditampilkan di bawah setiap foto bila membantu menjelaskan kegiatan dan faktanya telah dikonfirmasi.

Gambar contoh adalah acuan susunan, bukan izin untuk menerbitkan foto. Gunakan hanya dokumentasi asli yang telah mendapat izin tampil. Sembunyikan galeri dan tautan navigasinya jika tidak ada foto berizin; jika sebagian foto gagal dimuat, foto lain tetap dapat dilihat. Jangan menambahkan testimoni, nama peserta, atau aksi galeri yang belum tersedia. Untuk pratinjau tata letak sebelum foto asli tersedia, foto contoh dari Pexels boleh dipakai asalkan galeri tetap berlabel “Contoh pratinjau” dan dialog foto menyebut bahwa foto itu bukan dokumentasi Albana. Ganti dengan foto berizin sebelum publikasi.

## 8. Testimoni

**Eyebrow:** Cerita peserta  
**Heading (H2):** Setiap proses punya cerita yang pantas didengar

**Description:** Bagian ini disiapkan untuk pengalaman peserta yang telah memberi izin publikasi. Kartu yang tampil selama pratinjau bukan testimoni terbit.

Jangan menerbitkan kutipan, nama, foto, atau identitas peserta sebelum isi dan izin publikasinya tercatat. Sembunyikan seksi ini bila pratinjau tidak lagi diperlukan dan belum ada testimoni terbit.

## 9. Pilihan program

**Eyebrow:** Pilih langkahmu  
**Heading (H2):** Mulai dari program yang paling dekat dengan tujuanmu

**Description:** Bandingkan fokus latihan, materi, dan jadwal yang tersedia sebelum menentukan program.

Seksi ini memakai data program dan batch yang sama dengan halaman detail serta pendaftaran. Pertahankan keadaan loading, gagal, kosong, tertutup, penuh, dan menerima pendaftaran sesuai data.

## 10. Format pelatihan

**Eyebrow:** Cara mengikuti  
**Heading (H2):** Datang sebagai peserta atau ajak timmu berlatih

**Description:** Ikuti kelas terjadwal sebagai individu, atau diskusikan pelatihan yang disesuaikan untuk kebutuhan organisasi.

- **Public training:** Pelatihan dengan jadwal dan lokasi sesuai penawaran yang diterbitkan.
- **In-house training:** Pelatihan untuk organisasi; materi, silabus, tanggal, dan waktu disesuaikan dengan kebutuhan perusahaan.

Jangan menjanjikan kota, harga, atau ketersediaan sebelum dikonfirmasi. Untuk public training, arahkan ke **Lihat jadwal**. Untuk in-house training, **Hubungi kami** mengarah ke seksi kontak.

## 11. Hubungi kami

**Eyebrow:** Mulai percakapan  
**Heading (H2):** Ceritakan situasi komunikasi yang ingin kamu latih

**Description:** Sampaikan apakah kamu ingin melatih presentasi, memandu acara, atau menyiapkan pelatihan untuk tim. Tim Albana akan menjelaskan program yang tersedia.

Kanal kontak berasal dari proposal dan disetujui pengguna pada 8 November 2026: alamat Jl. Diponegoro No. 61 Bandung, WhatsApp 0857-1779-7637, email asaalbana91@gmail.com, dan Instagram @albanaspeechacademy. WhatsApp tampil sebagai tombol utama “Chat lewat WhatsApp”; email dan Instagram sebagai tautan aktif (tab baru); alamat tetap teks dengan catatan **“Bukan lokasi kelas.”** Jika kanal tidak lagi berfungsi, perbarui atau sembunyikan seksi ini.

## Halaman pendaftaran · /register

**Nama halaman aksesibel (H1 tersembunyi visual):** Pendaftaran kelas

**Description:** Isi formulir pendaftaran untuk batch yang kamu pilih. Admin akan menghubungimu setelah formulir diterima.

**Isi halaman:**

- Ringkasan singkat batch: program, jadwal, tempat, dan biaya yang terbit.
- Logo menuju beranda. Tidak ada judul pengantar atau tautan kembali di bagian atas panel.
- Formulir pendaftaran di dalam satu panel menampilkan ringkasan program, jadwal, tempat, dan biaya sebelum isian pertama. Empat langkah (Data diri, Latar belakang dan motivasi, Informasi teknis, Pembayaran dan persetujuan) memiliki indikator “Langkah n dari 4” dan bilah progres. Langkah dengan error tidak bisa dilanjutkan; pesan error tampil dekat field dan tombol Kembali mempertahankan isian. URL formulir memakai slug program: `/register/<slug-program>`; batch menerima dipilih server dari program tersebut, bukan dari URL. `/register` mengarahkan pengunjung ke `/register/public-speaking-for-speakers`.
- Catatan: data pribadi yang diisi dipakai untuk menindaklanjuti pendaftaran batch ini.

**Setelah formulir dikirim:**

1. Formulir diterima. Admin menghubungimu melalui kontak yang kamu isi dan mengirimkan nominal serta petunjuk pembayaran.
2. Setelah membayar, kirim bukti melalui WhatsApp resmi.
3. Setelah pembayaran diverifikasi admin, pendaftaranmu dikonfirmasi.

**Penjadwalan ulang dan pembayaran:** Jika berhalangan hadir, ajukan penjadwalan ulang melalui admin. Pembayaran tidak dikembalikan. Materi kelas dibagikan melalui grup WhatsApp peserta.

Halaman ini menyimpan data pendaftaran sendiri melalui `POST /api/registrations`. Batch menerima diambil dari data program; program tanpa batch menerima, atau batch yang gagal diverifikasi, menampilkan pesan pemulihan tanpa formulir. Bukti pembayaran dikirim menyusul lewat kanal WhatsApp resmi.

## Footer

**Identitas:** logo putih Albana Speech Academy di atas panel biru gelap (`Accent-strong`), terpusat.  
**Tautan:** Program · Jadwal · Cara ngajar · Trainer · Hubungi kami, satu baris navigasi terpusat berhuruf uppercase kecil.  
**Kanal:** ikon Instagram, Email, dan WhatsApp, terpusat di bawah navigasi.  
**Baris bawah:** © 2026 Albana Speech Academy, terpusat.

Susunannya satu tumpukan terpusat: logo, navigasi, kanal, hak cipta. Tidak ada bagian “Pendaftaran”, tautan “Cara daftar”, atau tombol kembali ke atas. Tampilkan hanya tujuan yang tersedia.

Tampilkan tujuan yang tersedia, kontak resmi, dan halaman legal yang sudah terbit. Ketentuan pendaftaran, pembayaran, serta pengelolaan artikel mengikuti [brief proyek](../project/project-brief.md).

## Belum ditampilkan di beranda

Seksi berikut menunggu materi atau konten terbit dan tidak dirender pada pratinjau ini:

- **Artikel · #artikel.** Judul: **“Catatan dari kelas.”** Tampilkan hingga tiga tulisan terbit terbaru. Sembunyikan seksi dan tautannya bila belum ada tulisan terbit.
- **Ajakan penutup.** Tampilkan hanya bila batch terbit atau kontak admin terverifikasi. Judul: **“Usulan apa yang ingin kamu latih?”** Aksi: **Lihat jadwal**.

Aktifkan artikel saat tulisan berizin tersedia.

## Audit proposal dan keputusan editorial

- Proposal menjadi sumber bidang pelatihan, metode belajar, nama trainer, format pelatihan, dan kanal kontak. Dua poster yang diberikan pengguna menjadi sumber nama dua program, materi, dan jadwal di atas. Bidang dalam proposal bukan tujuh program yang dijual.
- Format pelatihan ditambahkan agar organisasi dapat mengenali opsi in-house; kontak ditambahkan agar pertanyaan tersebut memiliki tujuan setelah kanal diverifikasi. Ini dua seksi tambahan di luar enam seksi utama.
- Proposal menyebut lokasi in-house di tempat perusahaan dan lokasi public training mengikuti penawaran silabus. Pastikan praktik saat ini sebelum menyebut lokasi sebagai ketentuan tetap.
- Data pendidikan, sertifikasi, pengalaman, dan nama trainer diterbitkan atas persetujuan pengguna (8 November 2026) berdasarkan proposal. Penugasan trainer per batch, izin foto, serta hak memakai nama dan logo pihak ketiga tetap perlu dikonfirmasi sebelum dipublikasikan.
- Jadwal poster adalah data penawaran spesifik, bukan bukti status pendaftaran saat ini. Harga, fasilitas, persyaratan sertifikasi, dan perubahan jadwal masih memerlukan konfirmasi.
- Penambahan dokumentasi dan perubahan dua program pada dokumen ini belum menyinkronkan [spesifikasi desain](../design/visual-design.md) atau aplikasi. Efektivitas pengalaman pengguna belum diuji.
