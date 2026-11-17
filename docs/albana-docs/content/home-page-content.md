# Albana Speech Academy · Konten Home

**Status:** naskah aktif, 16 November 2026. Dokumen ini adalah **satu-satunya sumber teks** beranda, sekaligus resep gerak tiap seksi. Susunan grid per lebar layar ada di [layout landing page](../design/academy-landing-layout.md); token warna, tipografi, dan easing ada di [design system akademi](../design/academy-design-system.md).

## 0. Cara memakai dokumen ini

Dokumen ini ditulis agar bisa dieksekusi langsung — oleh pengembang atau oleh LLM — tanpa menebak.

1. **Salin naskah apa adanya.** Teks dalam blok `Naskah` adalah final. Jangan memparafrasa, menambah kalimat, atau “memperhalus”.
2. **Data dinamis tidak ditulis di sini.** Harga, tanggal, nama batch, status, kutipan testimoni, dan logo partner selalu dibaca dari database. Bila datanya kosong, pakai naskah **Keadaan kosong** — jangan mengarang isi pengganti.
3. **Satu seksi, satu peran cerita.** Setiap seksi menjawab satu pertanyaan pengunjung. Jangan memindahkan isi antarseksi.
4. **Gerak memakai kosakata di §1.3.** Jangan menciptakan efek baru per seksi.
5. **Periksa daftar larangan di §1.4** sebelum menyerahkan hasil.

## 1. Garis cerita

### 1.1 Tokoh dan alur

Tokoh utama beranda adalah **pengunjung**, bukan Albana. Albana berperan sebagai pemandu. Halaman bercerita dalam tujuh babak yang mengikuti [spesifikasi revisi §I.3](../project/website-revision-specification.md):

| Babak | Seksi | Pertanyaan pengunjung | Peran cerita | Emosi yang dituju |
| --- | --- | --- | --- | --- |
| 1 | Hero + pita manfaat | “Bisakah saya lebih percaya diri berbicara?” | **Momen** — situasi yang ia kenal: semua menunggu ia bicara. | “Itu saya.” |
| 2 | Program + bukti proses | “Materinya apa, cocok untuk siapa?” | **Jalan** — empat jalur sesuai situasi bicaranya. | “Ada yang pas untuk saya.” |
| 3 | Tentang + cara belajar + klien | “Apakah lembaga ini terpercaya?” | **Pemandu** — siapa Albana dan bagaimana mereka melatih. | “Mereka serius.” |
| 4 | Testimoni + dokumentasi | “Apakah peserta benar-benar berkembang?” | **Bukti** — orang lain sudah melewatinya. | “Orang seperti saya bisa.” |
| 5 | Trainer | “Siapa yang mengajari saya?” | **Pendamping** — wajah dan pengalaman nyata. | “Saya tahu siapa yang akan menilai saya.” |
| 6 | Jadwal & biaya | “Berapa dan kapan?” | **Keputusan** — angka yang jelas, tanpa kejutan. | “Saya bisa merencanakan ini.” |
| 7 | Cara daftar + format | “Bagaimana caranya?” | **Langkah pertama** — tiga langkah, tidak lebih. | “Gampang.” |
| — | Penutup + kontak + footer | — | **Undangan** — kembali ke momen babak 1. | “Saya mulai sekarang.” |

Babak 1 dan penutup sengaja bergema: hero membuka dengan momen *menunggu kamu bicara*; penutup bertanya *apa yang ingin kamu latih*.

### 1.2 Suara

| Lakukan | Hindari |
| --- | --- |
| Sapaan **kamu**; kalimat pendek; satu gagasan per kalimat. | “Anda” bercampur “kamu”; kalimat > 25 kata. |
| Situasi konkret: rapat, presentasi, memandu acara, menjawab pertanyaan. | Abstraksi: “potensi”, “transformasi”, “level berikutnya”. |
| Kata kerja latihan: *berlatih, mencoba, menerima masukan, mengulang*. | Janji hasil: “pasti”, “dijamin”, “langsung mahir”. |
| Angka hanya dari data atau proposal (70/20/10, empat trainer). | Statistik karangan: “1000+ alumni”, “98% puas”. |
| Istilah tetap: **Public Training**, **Inhouse Training**, **batch**, **sesi**. | Sinonim berganti-ganti: kelas/kursus/workshop untuk hal yang sama. |

Panjang maksimal: eyebrow 24 karakter, H2 64 karakter, lead 180 karakter, label tombol 24 karakter.

### 1.3 Kosakata gerak

Gerak beranda bersifat **dua arah**: setiap kelompok masuk saat digulir ke bawah *dan* saat digulir kembali ke atas, dengan arah yang mengikuti arah gulir. Halaman terasa hidup di kedua arah, tetapi tidak ada lapisan yang bergerak dengan kecepatan berbeda (bukan parallax).

| Kode | Nama | Apa yang bergerak | Nilai | Pemakaian |
| --- | --- | --- | --- | --- |
| **G1** | Ucap | Judul naik per baris dari balik masker | `yPercent 105→0`, 700 ms, `--ease-expo`, jeda 80 ms antarbaris | H1, setiap H2 |
| **G2** | Tekan | Garis bawah frasa serif tergambar (`.accent-serif`, lihat [sistem desain](../design/academy-design-system.md#aksen-serif-pengganti-stabilo)) | `scaleX 0→1`, origin kiri, 450 ms, `--ease-out`, mulai 200 ms setelah G1 judulnya selesai; judul tanpa gerak dan reduced motion langsung memperlihatkan garis | Satu frasa per H2 |
| **G3** | Angkat | Kelompok isi muncul searah gulir | `opacity 0→1` + `y ±28px→0`, 600 ms, `--ease-out`, jeda 70 ms antar-anak | Paragraf, kartu, daftar |
| **G4** | Bingkai | Media terbuka dari wadah bermasker | wadah `yPercent 12→0` + gambar `scale 1.12→1`, 900 ms, `--ease-expo` | Foto dan poster video |
| **G5** | Isi | Nilai mengikuti posisi gulir (*scrub*) | `scaleX 0→1` terikat jarak gulir, `scrub: 0.6` | Bilah 70/20/10, garis kemajuan bab |
| **G6** | Geser | Deret horizontal masuk berurutan | `opacity 0→1` + `x ±32px→0`, 500 ms, jeda 90 ms | Trainer, tiga langkah, pita manfaat |
| **G7** | Hitung | Angka naik ke nilai akhir | 900 ms, `--ease-out`, `tabular-nums`, lebar dikunci | Hanya angka bersumber (70/20/10, persen DP) |
| **G8** | Skala bab | Kata bab ukuran `mega` membesar terikat gulir (*scrub*) | `scale 0.86→1`, `opacity 0.2→1`, `xPercent -4→0`, origin kiri bawah, `scrub: 0.6`, dari `top 90%` ke `top 35%`; hanya ≥ 1024 px dan bukan reduced motion, selain itu G1 | Kata “Public Training” dan “Inhouse Training” |

**Arah.** Saat masuk dari bawah (gulir turun), `y` dan `x` dimulai dari nilai positif. Saat masuk dari atas (gulir naik), dari nilai negatif. Implementasi dengan GSAP ScrollTrigger yang sudah terpasang:

```ts
// satu fungsi untuk G3 dan G6; dipanggil per kelompok
ScrollTrigger.create({
  trigger: group,
  start: "top 85%",
  end: "bottom 15%",
  onEnter:     () => reveal(group, +1),   // dari bawah
  onEnterBack: () => reveal(group, -1),   // dari atas
  onLeave:     () => hide(group, -1),     // keluar ke atas
  onLeaveBack: () => hide(group, +1),     // keluar ke bawah
});
```

`hide` hanya menurunkan `opacity` ke 0 dan menggeser 12 px (setengah jarak masuk) dalam 300 ms, sehingga elemen yang keluar layar sudah siap masuk lagi. Elemen tidak pernah disembunyikan selagi sebagian besar masih terlihat: rentang `top 85%`–`bottom 15%`.

**Gerak tingkat halaman** (bukan per seksi):

| Unsur | Gerak |
| --- | --- |
| Gulir halus | Lenis yang sudah terpasang, `lerp: 0.1`, hanya pointer halus (desktop); sentuh memakai gulir asli. ScrollTrigger disinkronkan dengan Lenis. |
| Garis kemajuan bab | Garis 2 px di bawah header, **G5** terhadap seluruh halaman. |
| Header | Turun 100% saat gulir ke bawah > 120 px; muncul lagi saat gulir ke atas sedikit pun, 240 ms. Selalu muncul bila fokus keyboard berada di dalamnya atau menu terbuka. |
| Penanda bab aktif | Tautan menu bab yang sedang terlihat mendapat garis bawah yang bergeser antartautan, 300 ms `--ease-in-out`. |
| Pergantian latar | Bidang biru pucat (bab 3 dan 6) dan biru tua (penutup) tidak berganti tiba-tiba: tepi atasnya memakai **G4** pada wadah seksi. |

**Aturan keras.**

- Hanya `transform` dan `opacity`. Tanpa `filter: blur`, tanpa `clip-path`, tanpa animasi `width`/`height`/`top`.
- Satu gerak khas (G1, G4) per layar pada satu waktu; isi lain memakai G3.
- Konten dan tombol ada di DOM dan dapat dipakai tanpa JavaScript. Kelas `motion-ready` dipasang sebelum paint pertama; bila terlambat, lewati animasi masuk awal.
- `prefers-reduced-motion: reduce`: semua G menjadi fade 150 ms satu arah; tanpa G5, tanpa Lenis, tanpa header yang bersembunyi.
- Ponsel < 768 px: jarak geser dikurangi setengah; G4 hanya `opacity` + `scale 1.06→1`; G5 tetap.
- Uji gugur: rekam gulir naik-turun cepat di ponsel kelas menengah. Bila ada frame tersendat berulang, turunkan seksi itu ke G3 saja.

### 1.4 Larangan (anti-*slop*)

Hasil ditolak bila memuat salah satu di bawah ini.

**Kata dan frasa:** “Wujudkan potensi terbaikmu”, “Raih kesuksesan”, “ke level berikutnya”, “Bersama kami”, “solusi terbaik”, “terpercaya #1”, “revolusioner”, “transformasi diri”, “unlock”, “empower”, “journey”, “game changer”, “Mengapa memilih kami?”, “Siap untuk…?” sebagai judul.

**Isi:** testimoni, nama peserta, angka alumni, rating bintang, logo klien, atau sertifikat yang tidak berasal dari database. Ikon emoji. Kutipan tokoh terkenal. Seksi FAQ, harga paket “Basic/Pro/Premium”, atau countdown yang tidak diminta.

**Visual:** gradien ungu/merah muda, blob, glassmorphism, kartu melayang dengan bayangan besar, ikon 3D, ilustrasi orang generik, foto stok tanpa label dummy, teks di atas foto **kecuali hero**, yang memakai lapisan gelap dengan kontras ≥ 4.5:1 (di tempat lain caption berada di bawah foto), carousel otomatis, marquee di luar hero, kursor khusus, partikel, efek ketik.

**Struktur:** seksi tambahan di luar dokumen ini; dua tombol utama dalam satu seksi; tab atau carousel yang menyembunyikan program; kartu dengan tinggi berbeda dalam satu deret.

## 2. Navigasi

**Naskah**

- Identitas: logo Albana Speech Academy
- Menu: **Program · Tentang · Trainer · Jadwal · Kontak**
- Aksi utama: **Lihat jadwal**
- Pengubah tema: label aksesibel “Ganti tema terang atau gelap”

Anchor: `#program`, `#tentang`, `#trainer`, `#jadwal`, `#kontak`. **Tentang** mencakup bab 3 dan 4. Tautan **Artikel** ditambahkan hanya bila ada tulisan terbit. Pada ponsel, menu dibuka tombol berlabel “Buka menu”; isinya memudar dari kanan (G6 satu arah), fokus pertama ke tautan pertama.

## 3. Babak 1 — Momen · `#beranda`

### 3.1 Hero

**Naskah**

- Baris fokus: **Presentasi · Diskusi · MC**
- H1 berisi logo resmi Albana Speech Academy, besar dan terpusat; tidak ada teks nama merek terpisah
- Lead: **Saat tim menunggu usulanmu, bagaimana kamu memulai? Di kelas public speaking ini, kamu berlatih membuka presentasi, menjelaskan pilihan, dan menjawab pertanyaan di depan orang lain.**
- CTA utama: **Lihat jadwal** → `#jadwal`

**Media:** satu foto penuh sebagai latar hero. Gunakan gambar dummy lokal sampai dokumentasi berizin tersedia dari database. Caption: **“Contoh visual — bukan dokumentasi kelas Albana.”**

**Tampilan:** hero memenuhi tinggi layar dengan foto penuh. Isi (logo H1, baris fokus, lead, CTA) berada di **kiri bawah**, putih di atas lapisan gelap; strip fakta berada **di bawah foto**, bukan di atasnya. Lapisan gelap adalah satu-satunya gradien di beranda: di bawah `lg` opasitas 0.88 di 0%, 0.60 di 55%, transparan di 90%; di `lg` ke atas 0.88 di 0%, 0.60 di 45%, transparan di 75%. Kontras lead terhitung ≥ 4.5:1 (5.05:1 pada kasus terburuk, putih). Tema terang dan gelap memakai tampilan yang sama; logo putih. Teks hero memakai Plus Jakarta Sans.

**Gerak (muat halaman):** baris fokus, logo, lead, dan CTA masuk berurutan dengan fade pendek. Foto latar masuk dengan **G4**; tidak ada deret foto berjalan.

**Header:** seluruh header tersembunyi di awal. Saat pengunjung menggulir melewati titik tengah hero, header muncul dengan fade dan geser pendek; saat kembali ke atas titik itu, header tersembunyi lagi.

### 3.2 Pita manfaat

Langsung di bawah hero, tanpa judul.

**Naskah** (empat sel, urutan tetap)

| No | Teks |
| --- | --- |
| 01 | **Lebih percaya diri** saat semua mata tertuju padamu |
| 02 | **Presentasi lebih meyakinkan** dari kalimat pertama |
| 03 | **Komunikasi kerja lebih efektif** di rapat dan diskusi |
| 04 | **Tampil profesional** saat mewakili tim atau organisasi |

Sumber: “Goals to Achieve” pada [proposal](academy-proposal.md). Bagian tebal adalah inti; sisanya situasi.

**Gerak:** **G6** dari kiri ke kanan; garis vertikal antarsel tergambar `scaleY 0→1` 400 ms sebelum teks masuk.

## 4. Babak 2 — Jalan · `#program`

### 4.1 Pilihan program

**Naskah**

- Eyebrow: **[ PROGRAM ]**
- H2: **Setiap situasi bicara butuh ▓latihan yang berbeda▓**
- Lead: **Mempresentasikan gagasan, memandu acara, atau melatih tim — mulai dari situasi yang paling dekat dengan kebutuhanmu.**
- Sub-judul kelompok: **Public Training** · **Inhouse Training**

**Kartu Public Training** — urutan isi identik di tiga kartu: nomor → nama → untuk siapa → tiga materi → status → harga → aksi.

| Program | Untuk siapa (naskah) | Tiga materi pertama (naskah) |
| --- | --- | --- |
| Public Speaking Series | **Untukmu yang ingin dasar kuat dan berlatih banyak peran bicara.** | Basic Public Speaking · MC formal dan nonformal · Moderator |
| Public Speaking for Speakers | **Untukmu yang ingin tampil sebagai pembicara di depan audiens.** | Fundamental, opening, dan closing · Struktur pesan · Teknik interaktif dan tanya jawab |
| Sertifikasi Pembicara Profesional | **Untukmu yang membutuhkan pengakuan kompetensi sebagai pembicara.** | Dibaca dari `programs.materials`; tanpa data, tampilkan **“Materi diumumkan bersama jadwal.”** |

Materi lain dibaca dari `programs.materials`. Kontrol **Lihat materi lainnya** membuka daftar di tempat. Jangan menjanjikan kelulusan atau sertifikat BNSP pada kartu Sertifikasi.

| Keadaan kartu | Status | Harga | Aksi |
| --- | --- | --- | --- |
| Batch menerima | **Pendaftaran dibuka** | Dari batch; harga coret bila ada | **Daftar** + **Selengkapnya** |
| Batch tertutup | **Pendaftaran ditutup** | Dari batch | **Selengkapnya** |
| Tanpa batch | **Jadwal menyusul** | “—” | **Selengkapnya** |
| Bundling aktif | Baris tambahan: **“Tersedia paket dengan Sertifikasi”** / **“…dengan Speaker”** | — | — |

**Panel Inhouse Training**

- Teks: **Pelatihan di tempat perusahaanmu. Materi, silabus, tanggal, dan waktu kami susun bersama timmu.**
- Aksi: **Konsultasi via WhatsApp** · **Selengkapnya**

**Keadaan kosong / gagal:** **“Program belum bisa dimuat.”** + **Coba lagi**.

**Gerak:** H2 **G1 + G2**. Tiga kartu **G3** berurutan kiri→kanan (jeda 90 ms); garis vertikal matriks tergambar lebih dulu. Panel Inhouse **G3** setelah kartu. Hover kartu (pointer halus saja): foto `scale 1.04`, panah geser 4 px, garis bawah nama tergambar 200 ms.

### 4.2 Bukti proses

Satu media lebar, tanpa judul.

- Caption: **“Peserta berlatih membuka presentasi, lalu menerima masukan langsung.”** — hanya bila media benar-benar memperlihatkan itu. Dummy memakai caption penanda.
- Tanpa media: seksi hilang.

**Gerak:** **G4** dengan masker horizontal penuh; saat masuk dari atas (gulir naik), masker terbuka ke bawah.

## 5. Babak 3 — Pemandu · `#tentang`

Bidang biru pucat. Tiga bagian dalam satu bidang.

### 5.1 Tentang Albana

**Naskah**

- Eyebrow: **[ TENTANG KAMI ]**
- H2: **Dibangun oleh ▓praktisi panggung▓, untuk orang yang harus bicara**
- Lead: **Albana Speech Academy oleh CV Asa Albana melatih individu dan organisasi agar tampil lebih percaya diri, komunikatif, dan profesional — lewat praktik langsung, bukan teori panjang.**
- Visi (label **VISI**): **Menjadi mitra terpercaya dalam pengembangan kompetensi komunikasi profesional dan kepemimpinan SDM yang berdaya saing tinggi.**
- Misi (label **MISI**):
  1. Mengembangkan pelatihan komunikasi dari dasar hingga lanjutan.
  2. Meningkatkan kepercayaan diri dan performa komunikasi.
  3. Menghadirkan pelatihan berbasis praktik nyata.
  4. Mendukung budaya komunikasi profesional di organisasi.

**Kartu Alan** (di samping potret)

- Nama: **Alan Albana, S.Kom.I., M.I.Kom.**
- Peran: **Founder · Trainer · MC · Penyiar RRI**
- Tiga poin:
  - **Penyiar Radio Republik Indonesia sejak 2015.**
  - **Certified Master Trainer dan Certified Public Speaker BNSP.**
  - **Pemateri untuk kementerian, BUMN, perbankan, dan korporasi.**
- Alt potret: **“Alan Albana, founder Albana Speech Academy.”** Potret tidak boleh sama dengan media hero.

**Gerak:** potret **G4**; H2 **G1 + G2**; lead, visi, misi **G3** berurutan; tiga poin Alan **G6**.

### 5.2 Cara belajar

**Naskah**

- Eyebrow: **[ CARA BELAJAR ]**
- H2: **Kemampuan bicara tumbuh saat ▓benar-benar dipraktikkan▓**
- Lead: **Sebagian besar waktumu dipakai untuk berbicara, bukan mendengar. Masukan trainer menajamkannya; kerangka komunikasi merapikannya.**

| Porsi | Judul | Isi |
| --- | --- | --- |
| **70%** | Praktik & simulasi | Praktik langsung, simulasi panggung, role play MC dan pembicara, presentasi kasus nyata. |
| **20%** | Coaching & feedback | Evaluasi performa pribadi, tinjauan sesama peserta, masukan trainer. |
| **10%** | Konsep & kerangka | Teori komunikasi profesional, struktur bicara, alat komunikasi praktis. |

Baris di bawahnya — label **Kerangka pengembangan**:
**Fundamental** · membangun percaya diri → **Professional** · komunikasi efektif → **Advance** · performa panggung → **Expert** · pembicara dan fasilitator

Deret chip — label **Bidang pelatihan**:
Public Speaking · Professional Presentation · MC & Event Communication · Moderator & Host · Leadership Communication · Service Excellence · Training of Trainer

Tujuh bidang ini adalah cakupan keahlian, **bukan** program yang dijual. Jangan membuat kartu atau tombol untuk masing-masing.

**Gerak:** inti bab ini.

- Tiga bilah porsi **G5** terikat gulir: saat seksi melintas dari `top 80%` ke `center 50%`, bilah 70% terisi lebih dulu, lalu 20%, lalu 10% (rentang gulir berurutan). Gulir naik mengosongkannya kembali.
- Angka **G7** berjalan sekali saat bilahnya mulai terisi; nilai akhir sudah ada di HTML.
- Kerangka empat tingkat: panah antartingkat tergambar `scaleX` berurutan, lalu label **G6**.
- Chip bidang **G3** dalam satu kelompok (jeda 40 ms).

**Media:** satu foto per baris 70/20/10 (tiga foto berbeda, 4:3), caption di bawah foto. Foto contoh tidak boleh berulang antarbaris maupun dengan hero dan bento. Bab ini bernada **sand**; angka 70/20/10 memakai ukuran `mega`.

### 5.3 Pernah melatih

**Naskah:** label **Pernah melatih**; daftar dari `academy_partners` terbit.

**Keadaan kosong:** seluruh bagian hilang. Daftar instansi pada proposal **tidak** boleh ditampilkan sampai izin nama dan logo tercatat.

**Gerak:** logo **G3** satu kelompok; grayscale ke warna saat hover (pointer halus saja).

## 6. Babak 4 — Bukti · `#tentang` (lanjutan)

### 6.1 Testimoni

**Naskah**

- Eyebrow: **[ CERITA PESERTA ]**
- H2: **Mereka pernah ▓gugup juga▓**
- Lead: **Cerita singkat dari peserta yang sudah berlatih bersama Albana.**

Isi kartu dari `testimonials` terbit: kutipan `quote` (20–30 kata), nama `attribution`, peran `role_label`, foto `photo_url` bila ada. Testimoni terbaru (`id` terbesar) tampil sebagai kutipan unggulan yang lebih besar; dua berikutnya sebagai pendukung.

Foto peserta hanya dari `photo_url` nyata; data contoh tidak memakai wajah dan tampil tanpa foto. Bab ini bernada **mist**.

**Keadaan kosong:** bagian 6.1 hilang; eyebrow bab menjadi **[ DOKUMENTASI ]** dan H2 di 6.2 menjadi judul bab.

**Gerak:** kutipan unggulan masuk per baris (**G1** dengan masker, jeda 60 ms) — satu-satunya tempat G1 dipakai pada isi, karena kutipan adalah “suara” peserta. Kartu pendukung **G3**.

### 6.2 Dokumentasi

**Naskah**

- H2: **Seperti inilah ▓suasana latihannya▓**
- Lead: **Praktik, umpan balik, dan momen di atas panggung dari kegiatan Albana.**
- Caption per media dari data; tanpa caption, alt saja.
- Tombol bila > 5 media: **Lihat semua dokumentasi** (di bento tampil sebagai tombol teks bergaris bawah dengan jumlah: **Lihat semua dokumentasi ({total})**; deret thumbnail kecil di bawah bento dihapus)
- Dialog: tombol tutup berlabel **“Tutup”**; navigasi **“Sebelumnya”** / **“Berikutnya”**.

**Keadaan kosong:** seksi dan tautannya hilang. Dummy memakai penanda **“Contoh visual — bukan dokumentasi kelas Albana.”** pada setiap media.

**Gerak:** media dominan **G4**; media pendukung **G4** berurutan dengan jeda 120 ms, arah masker bergantian (atas, kiri, bawah) agar mosaik tidak terasa seragam. Membuka dialog: gambar tumbuh dari posisi selnya (`scale` dari sel ke tengah, 350 ms) bila View Transition didukung; bila tidak, fade + `scale 0.96→1`.

## 7. Babak 5 — Pendamping · `#trainer`

**Naskah**

- Eyebrow: **[ TRAINER ]**
- H2: **Kenali ▓yang akan mendampingimu▓**
- Lead: **Praktisi yang sehari-hari berbicara di depan audiens — di radio, panggung, ruang kelas, dan ruang rapat.**

| Trainer | Peran (naskah kartu) | Tiga sorotan untuk dialog profil |
| --- | --- | --- |
| Alan Albana | **Founder · Master Trainer BNSP** | Penyiar RRI sejak 2015 · Penulis buku *Ice Breaking* · S2 Komunikasi Pendidikan UNISBA |
| Nurachman | **Motivator · Penulis 50 buku** | Public speaking dan grafologi · Manajemen SDM · Pemateri perbankan dan universitas |
| Andhan Indah | **Trainer Public Speaking · MC** | Female MC of The Year Hipapi Indonesia · Trainer komunikasi LIPI · Public Relations UNPAD |
| Abo Priatna | **Trainer MC · Host** | MC acara nasional dan korporat · Announcer dan podcaster · Certified Bilingual MC |

Sorotan berasal dari [proposal](academy-proposal.md); bio lengkap dibaca dari `trainers.bio`. Tanpa foto resmi: monogram inisial. Aksi kartu: **Lihat profil**. Jangan menyebut trainer mengajar batch tertentu.

**Gerak:** kartu **G6** kiri→kanan; potret di dalam kartu **G4** kecil (`scale 1.08→1`). Saat gulir naik, urutan masuk dibalik (kanan→kiri).

## 8. Babak 6 — Keputusan · `#jadwal`

Bidang biru pucat.

**Naskah**

- Eyebrow: **[ JADWAL & BIAYA ]**
- H2: **Pilih batch, ▓tandai kalendermu▓**
- Lead: **Semua tanggal, jam, tempat, dan biaya ada di sini. Waktu dalam WIB.**

Panel per program dari `batches`:

| Unsur | Naskah tetap | Data |
| --- | --- | --- |
| Kepala | — | Nama program · nama batch · status |
| Sesi | Label **Sesi 1**, **Sesi 2**, … | Hari, tanggal, jam mulai–selesai WIB |
| Tempat | Ikon lokasi + — | `venue`, `address` |
| Biaya | Label **Biaya** | `price_idr`; harga normal dicoret bila ada |
| DP | **DP {n}% · Rp{nominal}** | `dp_percent`; dihitung dari harga |
| Aksi menerima | **Daftar kelas ini** | → `/register/{slug-program}` |
| Aksi tertutup | **Tanya admin** | → WhatsApp |
| Tautan | **Detail program** | → `/program/{slug}` |

| Keadaan | Naskah |
| --- | --- |
| Program tanpa batch | **“Jadwal program ini belum tersedia.”** |
| Tidak ada batch sama sekali | **“Jadwal kelas berikutnya belum tersedia.”** + **Chat lewat WhatsApp** |
| Gagal memuat | **“Jadwal belum bisa dimuat.”** + **Coba lagi** |

**Media:** setiap panel program menampilkan thumbnail 16:9 — gambar pertama program, fallback ke foto `moments` bila program tanpa gambar. Bab ini bernada **mist**; panel tanpa kartu melayang, sudut 0–4 px.

Jadwal pada poster lama bukan sumber data. Jangan menulis tanggal atau harga di naskah.

**Gerak:** panel **G3**; baris sesi **G6** berurutan dari atas (jeda 60 ms) — seperti kalender yang terisi. Nominal **G7** sekali. Tombol daftar tidak dianimasikan selain hover.

## 9. Babak 7 — Langkah pertama · `#daftar`

### 9.1 Tiga langkah

**Naskah**

- Eyebrow: **[ CARA DAFTAR ]**
- H2: **Tiga langkah, ▓lalu kita berlatih▓**

| No | Judul | Isi |
| --- | --- | --- |
| 01 | **Isi formulir** | Pilih program, isi data diri, lalu pilih bayar lunas atau DP. |
| 02 | **Transfer sesuai tagihan** | Halaman konfirmasi menampilkan nominal persis, termasuk kode unik, dan rekening tujuan. |
| 03 | **Kirim bukti lewat WhatsApp** | Admin memverifikasi pembayaranmu, lalu mengundangmu ke grup kelas. |

Catatan kecil di bawah: **Berhalangan hadir? Ajukan penjadwalan ulang lewat admin. Pembayaran tidak dikembalikan.**

**Gerak:** garis penghubung antarlangkah **G5** terikat gulir; tiap nomor menyala (warna aksen) saat garis mencapainya; judul dan isi **G3**.

### 9.2 Dua jalur

| Panel | Judul | Teks | Aksi |
| --- | --- | --- | --- |
| Kiri | **Public Training** | **Ikut kelas terjadwal bersama peserta lain.** | **Lihat jadwal** |
| Kanan | **Inhouse Training** | **Pelatihan untuk timmu, di tempatmu, dengan materi yang disesuaikan.** | **Konsultasi via WhatsApp** |

**Gerak:** dua panel **G6** dari arah berlawanan (kiri dari kiri, kanan dari kanan).

## 10. Penutup · `#kontak`

### 10.1 Ajakan

Tampil hanya bila ada batch terbit atau kontak WhatsApp tersedia.

- H2 (putih di biru tua): **Usulan apa yang ingin ▓kamu latih▓?**
- Lead: **Ceritakan situasinya — presentasi, memandu acara, atau pelatihan tim. Kami bantu memilih program yang pas.**
- Tombol utama: **Lihat jadwal**
- Tautan: **Chat lewat WhatsApp**

**Media:** bab bernada **night**. Di atas ajakan ada strip 3 foto berbeda berrasio 4:5 (G4), caption di bawah foto. Tombol **Lihat jadwal** di bab ini putih dengan teks navy.

**Gerak:** bidang biru tua terbuka dari bawah (**G4** pada wadah seksi), lalu H2 **G1 + G2**. Ini gerak khas terakhir halaman.

### 10.2 Kontak

Dari `contact_channels`:

| Kanal | Label | Tampilan |
| --- | --- | --- |
| WhatsApp | **WhatsApp admin** | Tombol **Chat lewat WhatsApp** (`wa.me/6285717797637`) + nomor 0857-1779-7637 |
| Email | **Email** | asaalbana91@gmail.com, tautan `mailto:` |
| Instagram | **Instagram** | @albanaspeechacademy, tab baru |
| Alamat | **Kantor** | Jl. Diponegoro No. 61, Bandung. Catatan: **“Lokasi kelas tertera di jadwal tiap batch.”** |

**Gerak:** empat kanal **G6**.

### 10.3 Footer

- Logo putih, terpusat
- Tautan: **Program · Tentang · Trainer · Jadwal · Kontak**
- Ikon: Instagram, Email, WhatsApp (label aksesibel sesuai nama kanal)
- Hak cipta: **© 2026 Albana Speech Academy · CV Asa Albana**

**Gerak:** tidak ada; footer selalu statis.

## 11. Halaman pendaftaran · `/register/[program]`

**Naskah**

- H1 tersembunyi visual: **Pendaftaran kelas**
- Ringkasan di atas formulir: program, batch, jadwal, tempat, biaya (data)
- Indikator: **Langkah {n} dari 4** — Data diri · Latar belakang dan motivasi · Informasi teknis · Pembayaran dan persetujuan
- Tinjauan sebelum kirim, bila bundling aktif: **“Ingin sekalian ikut {program pasangan}?”** dengan dua pilihan: **{program} saja** / **Paket {judul bundling}**; total diperbarui seketika.
- Persetujuan: **Data yang kamu isi dipakai untuk menindaklanjuti pendaftaran batch ini.**
- Tombol akhir: **Kirim pendaftaran**

Field memakai line style akademi. Pesan galat tepat di bawah field. Tombol **Kembali** mempertahankan isian.

**Halaman konfirmasi `/register/konfirmasi/[token]`**

- Status: **Pendaftaranmu sudah kami terima.**
- Rincian: **{program atau bundling} – {batch}** · **Subtotal** · **Kode unik** · **Total transfer**
- Langkah: **1. Transfer tepat sebesar total di atas.** **2. Simpan bukti transfer.** **3. Kirim bukti lewat WhatsApp.**
- Tombol: **Kirim Bukti Transfer ke WhatsApp**
- Kolom kanan: nama bank, nomor rekening + tombol **Salin** (berubah menjadi **Tersalin**), nama pemilik

**Gerak:** langkah formulir geser 16 px searah maju/mundur, 250 ms; centang konfirmasi tergambar sekali (600 ms). Tanpa confetti.

## 12. Daftar periksa serah terima

- [ ] Seluruh teks tebal di dokumen ini disalin tanpa perubahan.
- [ ] Tidak ada harga, tanggal, kutipan, atau logo yang ditulis manual.
- [ ] Seksi tanpa data hilang beserta tautan navigasinya.
- [ ] Tidak ada satu pun butir §1.4.
- [ ] Setiap kelompok beranimasi saat digulir turun **dan** naik, dengan arah yang benar.
- [ ] Bilah 70/20/10 dan garis tiga langkah mengikuti posisi gulir dan kosong lagi saat digulir balik.
- [ ] Header muncul halus setelah gulir melewati setengah hero dan tersembunyi lagi saat kembali ke atas; navigasi tetap dapat dipakai dengan keyboard ketika tampil.
- [ ] Reduced motion: fade satu arah, tanpa scrub, tanpa Lenis.
- [ ] Gulir naik-turun cepat di ponsel kelas menengah tanpa tersendat.
- [ ] Teks dan tombol terbaca dan dapat diklik dengan JavaScript dimatikan.
