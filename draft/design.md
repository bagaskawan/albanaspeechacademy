# Arah Desain — Albana Speech Academy

Rancangan untuk [brief](Brief.md). Audiens utama: mahasiswa sampai profesional muda. Tujuan utama: calon peserta cepat memahami kelas, menemukan jadwal, lalu mendaftar. Arah visualnya **simple, minimalist, clean, dan mudah dipakai**.

## Arah dan kata kunci

- **Identitas:** logo Albana Speech Academy yang diberikan klien memakai biru pada latar putih. Sampel dari gambar raster memberi perkiraan biru gelap #245A9A dan biru terang #376CB0; cocokkan lagi dengan file logo asli sebelum produksi.
- **Referensi konten saja:** [Akademi Creator](https://akademicreator.com/) membantu mengingat jenis informasi yang perlu dijelaskan, seperti manfaat, program, pengajar, bukti kegiatan, dan cara bergabung. Desain, susunan halaman, warna, tipografi, dan interaksinya tidak dijadikan acuan.
- **Kata kunci audiens:** percaya diri, komunikasi efektif, latihan nyata, perkembangan karier, relevan untuk kuliah dan kerja.
- **Kata kunci visual:** spacious editorial, Swiss typography, large headline, generous whitespace, focused portrait, blue-and-white, mobile-first.
- **Gaya yang dipilih:** editorial minimalis dengan tipografi besar, satu foto utama, bidang putih yang luas, dan sedikit elemen per bagian. Biru logo dipakai sebagai aksen dan tombol utama.
- **Referensi portofolio:** ambil hierarki judul berukuran besar, potret trainer yang menonjol, dan jarak lega antara judul, foto, dan informasi pendukung. Gunakan foto Alan yang disetujui; jangan meniru nama, angka, atau klaim pada contoh.
- **Referensi tampilan laptop:** ambil bidang putih lapang, navigasi sederhana, headline sebagai fokus, dan satu aksen visual kecil. Komposisi ini menjadi acuan halaman web langsung, tanpa bingkai laptop atau latar ungu.

## Arsitektur konten dan alur

1. Header: logo; menu **Program, Jadwal, Tentang, Artikel**; tombol utama **Daftar Kelas**. Metode, dokumentasi, trainer, dan lokasi tetap mudah ditemukan di beranda, halaman Tentang, atau footer. Pada ponsel, menu ringkas dan tombol daftar tetap jelas.
2. Hero: manfaat kelas dan foto asli Alan/kegiatan; satu CTA utama **Daftar Kelas** menuju pemilihan jadwal, dengan tautan sekunder ke metode.
3. Jadwal terdekat dan program aktif: tanggal, tempat, harga, serta status hanya ketika data sudah disetujui. Kartu program menuju detail kelas.
4. Metode Pengajaran: bagaimana peserta belajar dan berlatih; jangan memakai angka persentase yang belum dikonfirmasi.
5. Dokumentasi dan testimoni: foto/video kegiatan serta kutipan nyata dengan izin; setiap foto diberi konteks.
6. Trainer: profil Alan, kredensial terverifikasi, dan foto nyata.
7. Lokasi: alamat terverifikasi, petunjuk singkat, tautan peta.
8. Artikel: cuplikan artikel terbit dan halaman baca.
9. Pendaftaran dan pembayaran: pilih batch → isi formulir → lihat langkah pembayaran manual → admin memverifikasi. Kebijakan penjadwalan ulang dan tanpa pengembalian dana terlihat sebelum kirim.

Kelompok konten mengikuti kebutuhan di brief dan dapat menjadi bagian beranda atau halaman tersendiri sesuai panjang materi. Menu jangan memaksakan sembilan item setara; pendaftaran menjadi satu aksi utama. Bila jadwal atau artikel belum tersedia, tampilkan keadaan kosong yang jujur dan kontak admin, tanpa tanggal, harga, testimoni, atau klaim rekaan.

## Panduan layout

- **Grid:** lebar konten maksimal 1200 px, 12 kolom dan gutter 24 px pada desktop ≥1024 px; 8 kolom dan gutter 20 px pada tablet 768–1023 px; satu kolom dan margin 20 px pada ponsel <768 px. Pada 320 px gunakan margin 16 px.
- **Hero desktop:** judul dan CTA di kiri sekitar 6 kolom; satu potret Alan atau foto kegiatan di kanan sekitar 5 kolom, dengan ruang kosong di antaranya. Gunakan satu kalimat pendukung pendek dan tombol **Daftar Kelas**. Judul singkat maksimal 2–3 baris; wajah, teks, dan tombol tidak saling menutupi. Pada ponsel tampilkan judul, penjelasan, CTA, lalu foto.
- **Bagian konten:** satu gagasan utama per bagian. Letakkan judul di kiri dan teks atau satu foto di sebelahnya; batasi lebar paragraf sekitar 65 karakter. Beri ruang kosong yang jelas di antara kelompok.
- **Program dan jadwal:** tampilkan sebagai daftar rapi dengan garis pemisah tipis. Setiap baris memuat nama program atau batch, tanggal dan lokasi yang tersedia, serta tautan daftar yang jelas; sertakan harga jika telah disetujui. Gunakan kartu hanya bila perlu untuk membedakan pilihan.
- **Ritme:** jarak antarbagian 120 px desktop, 88 px tablet, 64 px ponsel; jarak judul ke isi 24–32 px. Batasi ornamen, label, dan foto agar tidak bersaing dengan informasi utama.

## Sistem visual

| Elemen | Spesifikasi | Alasan |
| --- | --- | --- |
| Font | Plus Jakarta Sans untuk judul, isi, dan tombol; fallback system sans-serif | Modern, mudah dibaca, dan konsisten. |
| Biru utama | #245A9A | Berasal dari sampel logo; tombol utama dan tautan penting. Putih di atasnya memiliki kontras sekitar 6,99:1. |
| Biru terang | #376CB0 | Aksen ikon dan garis; putih di atasnya sekitar 5,34:1. Hindari teks kecil biru terang di latar biru pucat. |
| Teks utama | #16283D | Kontras tinggi untuk paragraf. |
| Teks sekunder | #52667C | Informasi pendukung; kontras sekitar 5,91:1 pada putih. |
| Latar | #FFFFFF dan #F7F9FC bergantian | Memisahkan bagian tanpa terlalu banyak kartu. |
| Garis | #D7E1EC | Batas input/kartu; gunakan label, jangan mengandalkan garis saja. |
| Biru pucat | #E8F1FA | Bidang informasi ringan; teks tetap memakai biru utama/gelap. |
| Status | Teks + ikon, warna status yang diuji kontras saat implementasi | Status pendaftaran/pembayaran tidak disampaikan melalui warna saja. |

- **Tipografi:** Plus Jakarta Sans; H1 desktop 72 px/1,05 dan ponsel 38 px/1,12, H2 44/30 px, H3 24/20 px, isi 16 px/1,6 dan teks bantu 14 px/1,5. Judul 700, tombol dan label 600, isi 400; judul rata kiri dan paragraf maksimal sekitar 65 karakter per baris. Gunakan huruf kapital biasa untuk keterbacaan.
- **Penerapan warna:** gunakan putih sebagai latar utama, #F7F9FC untuk pemisah bagian, dan #E8F1FA secukupnya pada bidang informasi pendukung. Gunakan #245A9A pada CTA utama dan tautan; #376CB0 sebagai aksen kecil. Teks utama tetap #16283D. Jangan menaruh teks kecil putih di atas foto tanpa bidang gelap yang teruji kontrasnya.
- **Ruang dan bentuk:** gunakan skala 8, 16, 24, 32, 48, 64 px di dalam komponen. Garis tipis dan bayangan lembut hanya untuk membedakan bidang.
- **Tombol:** satu tombol solid biru utama per area keputusan; tombol sekunder berupa tautan/outline. Tinggi sentuh minimal 44 px, focus ring terlihat, label berupa tindakan jelas.
- **Foto dan video:** utamakan dokumentasi asli kelas dan Alan, pencahayaan alami, peserta sedang berlatih. Rasio 4:3 atau 3:2 untuk dokumentasi. Video memakai thumbnail jelas dan kendali putar; jangan autoplay bersuara.
- **Detail visual:** gunakan garis pemisah 1 px, tombol sederhana, dan maksimal satu aksen biru kecil pada area hero. Foto dapat memakai latar putih atau potongan bersih bila tersedia; jaga keterbacaan tanpa teks di atas wajah.
- **Gerak:** transisi hover/fokus singkat 150–220 ms. Hormati prefers-reduced-motion.

## Perilaku dan pemeriksaan

- Ponsel mulai dari 320 px: satu kolom, navigasi dapat dibuka dengan keyboard, kartu jadwal tersusun vertikal, formulir satu kolom, tanpa gulir horizontal.
- Desktop sekitar 1440 px: hero dua kolom, daftar program dalam baris yang lega, dan dokumentasi dengan satu foto utama. Teks tetap terbaca saat zoom.
- Form: label tetap terlihat, contoh format hanya sebagai bantuan, pesan kesalahan dekat kolom, indikator sedang mengirim, hasil sukses yang menyatakan tindak lanjut admin, dan jalan keluar jika pengiriman gagal.
- CMS: admin melihat draft/terbit dan data pembayaran dengan label status yang jelas. Media tanpa izin tidak boleh terbit.
- Uji saat implementasi: kontras teks minimal 4,5:1, kontrol keyboard dan fokus, alt text foto bermakna, ukuran target sentuh, tampilan 320/390/1440 px, serta keadaan kosong, gagal, dan berhasil.

## Prompt untuk Stitch

Unggah logo resmi dan kedua gambar referensi visual sebagai aset, lalu gunakan prompt berikut di [stitch.google](https://stitch.google/). Ganti konten contoh dengan materi yang disetujui klien sebelum publikasi.

~~~text
Design a high-fidelity responsive website concept for Albana Speech Academy, an Indonesian public speaking training academy for university students and young professionals. Use the uploaded official logo exactly as provided. The interface language is Indonesian.

Create desktop 1440px and mobile 390px views of the homepage, plus a mobile registration flow screen. The primary task is to understand an available class and register. Include the content requested by the client: documentation, teaching method, programs, class schedule, trainer, location, registration, manual payment, and articles. Show one main "Daftar Kelas" CTA, authentic trainer/class photography, concise program and schedule cards, and clear next steps. Use Akademi Creator only to check content topics; do not use it as a reference for visual design, section order, layout, typography, colors, interactions, branding, metrics, or copy.

Style: spacious Swiss editorial minimalism for young professionals, based on the two uploaded visual references. Use a large typographic headline, one authentic portrait of Alan or class photo, simple navigation, a single primary action, and generous uninterrupted white space. Present the composition as an actual website, without a laptop frame. Use Plus Jakarta Sans: H1 72px desktop / 38px mobile, concise body copy and a clear reading order. Use white as the dominant background, logo blue #245A9A for the primary CTA, #376CB0 as a restrained accent, text #16283D and secondary text #52667C. Use a centered 1200px maximum grid: on desktop place headline and CTA on the left and one portrait on the right with open space between them; on mobile stack headline, copy, CTA, then portrait. Separate sections with generous whitespace: 120px desktop and 64px mobile. Use simple rows and subtle dividers for programs and schedules. Keep one main idea per section and avoid crowded card grids, decorative overlays, invented metrics, testimonials, urgency, or prices.

The registration screen should show batch choice, clearly labeled fields, visible manual-payment steps, reschedule/no-refund policy, consent notice, and one primary submit action. Include loading, field-error, success, and unavailable-batch states. If real dates, prices, testimonials, or articles are missing, show honest empty states rather than fabricated content. Keep touch targets at least 44px, maintain readable contrast and visible keyboard focus, and avoid horizontal overflow at 320px.
~~~

**Batas rancangan:** warna masih perkiraan dari gambar raster; foto, isi artikel, rincian kelas, dan syarat penjadwalan ulang menunggu klien. Belum ada layar yang dirender atau diuji dengan pengguna.
