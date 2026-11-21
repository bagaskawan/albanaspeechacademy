# Implementation Plan SEO/GEO Albana Speech Academy

**Tujuan.** Perjelas identitas Albana, relevansi beranda untuk pencarian merek dan kelas public speaking di Bandung, serta informasi program yang dapat dirujuk mesin pencari.

**Batas perubahan.** Landing tetap menampilkan semua informasi pembelian. Perubahan pada `/` terbatas pada metadata, OpenGraph, aset khusus metadata, dan JSON-LD. Bekukan copy, heading, navigasi, CTA, section, layout, dan alur pendaftaran. Detail program memakai rute Next.js App Router yang sudah ada. Indeks `/program`, artikel, robots/sitemap, dan optimasi performa menjadi lingkup terpisah.

## 1. Metadata beranda

- [x] Tambah `export const metadata: Metadata` di [`front/app/(web)/page.tsx`](<../../../front/app/(web)/page.tsx>). Tetapkan `metadataBase` sebagai `https://www.albanaspeechacademy.com` dan `alternates.canonical` sebagai `/`. Isi metadata di rute ini agar tetap spesifik untuk beranda.
- [x] Isi `title` dengan `Kelas Public Speaking Bandung | Albana Speech Academy` dan `description` dengan `Latihan presentasi langsung di Bandung dan dapatkan masukan dari trainer Albana Speech Academy. Lihat pilihan kelas, jadwal batch, dan biaya.`
- [x] Isi `openGraph` dengan `type: website`, `locale: id_ID`, `siteName: Albana Speech Academy`, canonical beranda, serta title dan description yang sama. Tambahkan `front/public/seo/og-home.png` berukuran **1200 × 630** dari aset merek yang sudah disetujui dan beri alt deskriptif. Arahkan `icons.icon` ke `/seo/favicon-96.png` dengan gambar persegi **96 × 96**. Uji respons `200` serta `Content-Type` kedua gambar. [Favicon Google](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [x] Render satu `<script type="application/ld+json">` dari Server Component beranda, di luar subtree visual `HomePage`. Isi `@graph` dengan `WebSite` (`@id` `/#website`, `name`, `url`, `inLanguage: id-ID`, `publisher` → `/#academy`) dan `EducationalOrganization` (`@id` `/#academy`, `name`, `url`, `logo`, `founder` → `Person` bernama `Alan Albana`). Tulis seluruh `@id` dan URL sebagai absolut. Tambahkan `sameAs` untuk akun resmi yang terverifikasi. Jika hubungan badan usaha dicantumkan, representasikan CV Asa Albana sesuai hubungan yang tercantum pada situs. [Site name](https://developers.google.com/search/docs/appearance/site-names) · [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [x] Serialisasi JSON-LD dengan `JSON.stringify(data).replace(/</g, '\\u003c')`. Cocokkan klaim schema dengan isi publik, khususnya identitas, lokasi, dan profil resmi. [Next.js JSON-LD](https://nextjs.org/docs/app/guides/json-ld) · [Kebijakan structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [ ] Bandingkan `/` sebelum dan sesudah pada mobile dan desktop dengan data CMS yang sama. HTML visual, teks, heading, tautan/tujuan CTA, dan screenshot harus sama. Periksa satu title, description, canonical absolut, set OpenGraph, dan graph JSON-LD yang dapat diparse pada respons HTML. Ambil baseline dari checkout yang sama agar perubahan lain di worktree tidak ikut dihitung.

## 2. Detail program bila konten siap

- [x] Inventarisasi slug `public-speaking-for-speakers`, `public-speaking-series`, `sertifikasi-pembicara-profesional`, dan `inhouse-training` pada rute [`/program/[slug]`](<../../../front/app/(web)/program/[slug]/page.tsx>). Mulai dari slug dengan intent yang jelas serta ringkasan, target peserta, dan materi atau proses yang sudah terverifikasi. Catat data yang kurang per slug sebelum memperluas halaman. Gunakan [spesifikasi program proyek](../project/website-revision-specification.md) sebagai acuan editorial.
- [x] Pakai kembali `readProgramDetail(slug)` di [`program-showcase.ts`](../../../front/lib/server/program-showcase.ts) dan [`ProgramDetailPage`](../../../front/components/program/program-detail-page.tsx). Bagikan pembacaan data metadata dan halaman per request dengan React `cache()` bila keduanya memanggil loader yang sama. Ambil ringkasan, materi, dan harga dari Program, jadwal dari Batch, dan lokasi dari Kontak. Gunakan `ProgramCard` yang sudah membawa data ini. Tambahkan waktu ISO untuk `<time>` lewat model detail bila sumber sesi tersedia.

### Layout visual dan responsif

- [x] **Desktop mulai 1024 px.** Letakkan breadcrumb di atas grid dua kolom. Kolom kiri memuat nama, ringkasan, dan isi program. Kartu jadwal, biaya, dan pendaftaran menempati kolom kanan selebar 18–23 rem, sejajar dengan judul. Batasi area baca di kiri sekitar `65ch` dan gunakan jarak antarkolom sekitar 2 rem.
- [x] **Mobile dan tablet di bawah 1024 px.** Tumpuk breadcrumb → nama dan ringkasan → kartu jadwal, biaya, dan pendaftaran → isi program → dokumentasi. Gunakan satu kartu yang sama pada kedua layout. Tetapkan urutan DOM sesuai urutan mobile agar fakta dan CTA terbaca sebelum bagian panjang. CTA utama memenuhi lebar kartu pada ponsel.
- [x] **Hierarki visual.** Pakai `Container`, token warna dan tipografi situs publik, serta `button-primary`. Utamakan H1 dan ringkasan singkat. Bedakan kartu pendaftaran dengan bidang `bg-card` dan `border-rule`. Gunakan jarak vertikal yang konsisten antarbagian dan satu CTA utama per program. Gunakan dokumentasi terbit dengan rasio media yang dicadangkan agar galeri stabil saat dimuat. [Design system Albana](../design/academy-design-system.md)

### Struktur konten dan status

- [x] Susun satu `<main>` dengan breadcrumb `<nav aria-label="Breadcrumb">`, tautan ke beranda, dan `aria-current="page"` pada nama program. Di dalam `<article>`, gunakan satu H1 dan H2 untuk bagian yang memiliki isi. Pakai H3 untuk subbagian yang diperlukan.

  | Bagian | Isi dan elemen HTML |
  | --- | --- |
  | H1 nama program | Paragraf pembuka menjawab siapa pesertanya, keterampilan yang dilatih atau layanan yang ditawarkan, dan formatnya. |
  | H2 Jadwal, biaya, dan pendaftaran | Di kartu, letakkan status terlebih dahulu, lalu `<dl>` berisi batch, jumlah sesi, tanggal, jam, lokasi, dan biaya resmi. Gunakan `<time datetime="…">` untuk tanggal yang diketahui. Pada mode mulai saja, tampilkan tanggal mulai dan jumlah pertemuan sesuai data. Letakkan CTA `card.registrationUrl` setelah biaya saat URL tersedia. |
  | H2 Untuk siapa | Audiens dan prasyarat yang berlaku. Untuk Inhouse, jelaskan kebutuhan tim yang dilayani. |
  | H2 Materi dan cara belajar | Hasil belajar yang terverifikasi, daftar materi, dan bentuk praktik. Untuk Inhouse, jelaskan proses konsultasi dan bentuk pelatihan yang tersedia. |
  | H2 Trainer | Nama dan peran trainer yang sudah dikonfirmasi untuk program. Tampilkan hanya jika datanya tersedia. |
  | H2 Dokumentasi | Media terbit dengan `<figure>` dan `<figcaption>`. Tampilkan bagian ini jika ada foto atau video program. |

- [x] Saat pendaftaran tutup atau jadwal belum tersedia, gunakan kartu yang sama dan tampilkan status CMS beserta informasi yang tersedia. Saat biaya belum ditetapkan, tampilkan status biaya dengan jelas. Untuk Inhouse, ganti isi kartu dengan **Konsultasi Inhouse** dan tautan WhatsApp resmi jika tersedia. Jika kontak belum terbit, tampilkan status ketersediaannya.

### Metadata detail dan verifikasi

- [x] Di `generateMetadata` untuk detail, gunakan `{judul program} | Albana Speech Academy`, deskripsi ringkas dari konten terverifikasi, canonical `/program/{slug}`, dan OG yang mengarah ke URL detail. Gunakan OG beranda sebagai fallback gambar bila detail belum punya aset publik stabil. Uji bahwa kegagalan data dibedakan dari slug tidak ditemukan, serta bahwa halaman error tidak mengirim schema program. Pertahankan tujuan alias `basic-to-advance` → `public-speaking-for-speakers`.
- [x] Tambahkan `BreadcrumbList` sesuai breadcrumb yang terlihat. Tambahkan `Course` dengan `provider` → `/#academy` hanya jika program memiliki kurikulum dan hasil belajar yang jelas. Gunakan `Service` untuk Inhouse, atau `WebPage` untuk detail yang belum memenuhi definisi `Course`. Hilangkan nilai schema yang belum bisa diverifikasi, termasuk harga, tanggal, dan rating. `Course` berguna untuk menjelaskan entitas program. Kelayakan rich result Course List mengikuti aturan bahasa dan daftar kursus Google. [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) · [Course List](https://developers.google.com/search/docs/appearance/structured-data/course)
- [ ] Uji detail dengan API data normal, batch terbuka, batch tutup, jadwal menyusul, serta Inhouse tanpa kontak. Cek bahwa canonical, harga dan jadwal cocok dengan yang terlihat, CTA mengikuti status, media kosong tidak membuat heading kosong, serta slug hilang mengembalikan `404` atau membawa `noindex` bila respons sudah terlanjur streaming.
- [ ] Uji visual pada 320, 768, 1024, dan 1440 px, termasuk judul panjang, galeri kosong, serta tampilan terang dan gelap. Pastikan kartu mudah ditemukan, halaman bebas scroll horizontal, CTA punya area sentuh minimal 44 px, dan indikator fokus terlihat saat navigasi keyboard. Periksa urutan baca dan tab dari breadcrumb hingga CTA dan isi program.

## 3. Verifikasi dan ukur

- [ ] Dari `front/`, jalankan `npm run build`, `npx tsc --noEmit`, dan `npx eslint` untuk file TypeScript yang disentuh. Uji hasil build dengan HTTP tanpa JavaScript. Validasi JSON-LD di [Schema Markup Validator](https://validator.schema.org/) dan fitur yang didukung di [Rich Results Test](https://search.google.com/test/rich-results).
- [ ] Setelah deploy yang disetujui, periksa `/` dan satu URL detail per tipe melalui URL Inspection. Cek akses crawler, canonical, serta tautan internal yang saat ini sudah ada. Catat URL detail yang belum terhubung karena freeze navigasi untuk fase teknis terpisah. Saat rute masih sulit ditemukan, kesiapan HTML dan schema saja belum membuktikan halaman akan terindeks.
- [ ] Bandingkan impresi, CTR, dan posisi untuk nama merek dan kueri `kelas public speaking Bandung` pada periode 28 hari sebelum dan sesudah perubahan terindeks. Ulangi set pertanyaan yang sama tentang pilihan program, jadwal, dan biaya untuk mencatat frekuensi serta URL yang dikutip AI Search. [Panduan Google AI Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
