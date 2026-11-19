# Revisi plan hero Albana Speech Academy

**Status 19 November 2026.** Opsi A sudah terpasang di beranda: grid teks/foto 5:7 di desktop, kanvas `tone-mist`, CTA biru, kartu jadwal navy, dan foto sekunder mulai 640 px. Tiga revisi di bawah masih berupa usulan. Dasar audit adalah kode lokal pada checkout `e441c40` beserta perubahan kerja dan [aset merek](../../../front/public/images/alan-albana.jpg).

## 1. P0 · Tampilkan foto sejak halaman mulai terlihat

**Gap.** Foto utama sudah memakai `preload`. Namun `SkeletonImage` merender spinner “Memuat gambar...”, mengawali gambar dengan `opacity-0` dan menunggu `onLoad` untuk transisi 300 ms. CSS hero juga memberi foto animasi 700 ms dengan jeda 140 ms. Logo tema gelap ikut meminta `priority` melalui `BrandLogo`. [Hero](../../../front/components/home/hero-section.tsx) · [SkeletonImage](../../../front/components/home/skeleton-image.tsx) · [BrandLogo](../../../front/components/layout/brand-logo.tsx) · [CSS](../../../front/app/globals.css)

- Render foto utama langsung dengan `next/image` di dalam slot `relative` yang sudah ada. Lepas spinner, gerbang `onLoad`, dan `hero-anim-media` dari jalur foto utama. Pertahankan rasio 4:5 di ponsel dan 3:4 mulai 640 px sejak HTML awal, termasuk saat sumber kosong atau gagal.
- Untuk foto CMS, buat pratinjau selebar ±10 px dari **foto yang sama** saat media diproses. Simpan per aset dan teruskan sebagai `blurDataURL` opsional ke `hero.photo`; pakai `placeholder="blur"` bila tersedia. Siapkan pratinjau untuk foto hero lama yang aktif. Aset lama lain memakai warna dasar slot sampai pratinjau tersedia. Ini memperluas implementasi ke jalur media dan tipe data karena `HomeMedia` saat ini hanya membawa URL dan metadata dasar. [Tipe media](../../../front/lib/home-data.ts) · [Pemrosesan gambar](../../../front/lib/media-prepare.ts) · [API Image](https://nextjs.org/docs/app/api-reference/components/image#blurdataurl)
- Beri petunjuk preload hanya pada foto hero bila trace menunjukkan foto menjadi LCP secara konsisten. Bila H1 menjadi LCP di ponsel dan foto berada di bawah lipatan, batasi preload responsif ke rentang desktop yang terukur. Lepas prioritas logo di hero, muat foto sekunder secara lazy, dan sesuaikan `sizes` dengan lebar slot aktual termasuk batas kontainer 80rem. Cek `currentSrc` dan waterfall agar satu kandidat foto hanya diunduh sekali. [Panduan preload Next.js](https://nextjs.org/docs/app/api-reference/components/image#preload)

## 2. P1 · Perjelas manfaat dan arahkan CTA ke tujuan yang tersedia

**Gap.** “Latih momen saat semua mata tertuju padamu” menggambarkan situasi, tetapi pembaca perlu menuntaskan lead untuk memahami tawarannya. “Lihat jadwal kelas” selalu muncul, dan “Konsultasi dulu” menuju `#kontak` yang pada kondisi tertentu tidak dirender. [Hero](../../../front/components/home/hero-section.tsx) · [Jadwal](../../../front/components/home/schedule-section.tsx) · [Penutup](../../../front/components/home/closing-section.tsx)

| Elemen | Revisi siap dipakai |
|---|---|
| Label di samping logo | **Kelas public speaking · Bandung** |
| H1 | **Lebih percaya diri saat menyampaikan ide.** Beri aksen serif miring hanya pada “menyampaikan ide”. |
| Lead | **Latih cara membuka presentasi, menjelaskan ide, dan menjawab pertanyaan. Praktik langsung di kelas, dapatkan masukan dari trainer, lalu coba lagi.** |
| CTA utama | Jika `hero.nextBatch` tersedia, tampilkan **Lihat jadwal dan biaya** → `#jadwal`. Jika kosong, tampilkan **Jelajahi program** → `#program`. |
| CTA sekunder | **Tanya admin** langsung ke WhatsApp terbit yang sudah dibaca `readHomeData`. Teruskan URL melalui `HomePage` dan tampilkan tautan hanya jika tersedia. |
| Kartu kelas | Tonjolkan nama program dan tanggal mulai, lalu batch dan status. Saat `nextBatch` kosong, hilangkan kartu dan gunakan ruangnya untuk foto. |

**Ukur hasil.** Untuk sesi beranda dengan batch terbuka, bandingkan proporsi yang mencapai tombol “Daftar kelas ini” lalu mengekliknya, sebelum dan sesudah revisi. Pisahkan desktop/mobile serta catat perubahan batch agar pergeseran ketersediaan kelas dapat diperhitungkan.

## 3. P1 · Bangun kesan premium lewat tipografi dan proporsi

**Gap.** Referensi `alan-albana.jpg` adalah logo biru 150 × 150 px. Warna hero sudah senada. Yang masih perlu dirapikan adalah tiga potongan H1 yang dipaksa menjadi blok, label yang mengulang nama pada logo, dan kartu kelas yang pada ponsel baru muncul setelah foto 4:5. [Referensi warna](../../../front/public/images/alan-albana.jpg) · [Komposisi hero](../../../front/components/home/hero-section.tsx) · [Token dan skala huruf](../../../front/app/globals.css)

- **Desktop ≥1024 px.** Pertahankan grid 5:7. Gunakan Playfair Display untuk H1 dan Inter untuk lead. Pertahankan skala fluida `.type-display`, batasi H1 sekitar 16ch dan lead 40–46ch. Buat H1 satu aliran teks dengan `text-wrap: balance`. Tampilkan H1 dan CTA sejak paint pertama. Foto kelas tetap dominan, dengan foto sekunder dan kartu di sisi kanan.
- **Tablet 640–1023 px.** Tumpuk teks di atas media. Di bidang media, beri foto utama tiga dari lima kolom dan sisanya untuk kartu/foto pendukung. Bila keduanya kosong, lebarkan foto dan batasi tingginya agar bidang kanan tidak menyisakan lubang.
- **Ponsel <640 px.** Urutkan logo/label → H1 → lead → CTA → ringkasan kelas jika ada → foto utama. Gunakan jarak 12–16 px antara H1 dan lead, 20–24 px menuju CTA. Sediakan target sentuh minimal 44 px. Jika dua aksi tidak muat, turunkan tautan sekunder ke baris berikutnya. Foto sekunder cukup tampil mulai tablet.
- **Warna.** Pakai biru logo yang sudah diterapkan (`#26599a`) sebagai acuan, `--color-hero-button` (`#295b9f`) untuk aksi utama, `tone-mist` untuk kanvas, dan `--color-accent-strong` untuk kartu. Periksa teks dan indikator fokus CTA dalam kedua tema.

### Kriteria penerimaan

- **Visual dan alur.** Periksa 320, 375, 768, 1024, dan 1440 px dengan tema terang/gelap. Pada 375 × 667, targetkan CTA utama terlihat sebelum scroll pada ukuran teks default. Pada zoom 200%, H1, tanggal panjang, dan kedua aksi harus tetap terbaca tanpa terpotong atau menimbulkan scroll horizontal. Uji batch tersedia/kosong dan WhatsApp tersedia/kosong.
- **Pemuatan.** Ambil filmstrip dan trace sebelum/sesudah di build produksi dengan cache kosong dan simulasi 4G, tiga kali per viewport uji mobile/desktop. Catat elemen LCP, median LCP lab, serta pergeseran yang berasal dari hero. Target **kontribusi gambar ke CLS = 0** pada foto berhasil, lambat, kosong, dan gagal. Pastikan tidak ada frame spinner dan konten utama tetap terlihat dengan reduced motion atau JS dinonaktifkan. Sasaran lapangan **LCP ≤2,5 detik pada p75** per jenis perangkat. [Definisi dan ambang LCP](https://web.dev/articles/lcp)
