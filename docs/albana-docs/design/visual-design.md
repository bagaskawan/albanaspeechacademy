# Albana Speech Academy · Spesifikasi visual lintas kanal

**Status: aturan aktif 15 November 2026.** Dokumen ini adalah peta bersama untuk Figma, Stitch, dan implementasi. [Academy Design System](academy-design-system.md) mengatur halaman publik; [Admin Design System](admin-design-system.md) mengatur CMS. [Konten Home](../content/home-page-content.md), [brief](../project/project-brief.md), dan [spesifikasi revisi](../project/website-revision-specification.md) menentukan isi serta ketentuan bisnis. Arah lama 8 November dipindahkan ke [arsip](../archive/design-backup/visual-design-2026-11-08.md).

## Aturan visual yang berlaku

| Keputusan | Academy dan pendaftaran publik | Admin CMS |
|---|---|---|
| Peran | Meyakinkan calon peserta dan pengambil keputusan korporat melalui manfaat, cara belajar, bukti, jadwal, dan tindakan. | Membantu operator menyelesaikan tugas, membandingkan data, dan mengetahui status simpan. |
| Tipografi | Plus Jakarta Sans 600–800 untuk judul, navigasi, tombol; Inter 400–600 untuk paragraf, label, dan data. | Pasangan sama; judul lebih kecil, tabel Inter 14px dengan angka tabular. |
| Geometri | Hero, foto, grid, dan field garis radius 0; kartu mandiri serta tombol 8px; dialog 12px. | Kartu 16px, panel/shell 20px, tombol 14px, field 12px, pil filter 999px. |
| Bidang | Putih dominan, garis biru abu, dan foto/video dokumentasi nyata tersebar menurut cerita halaman. | Halaman biru sangat muda, shell/kartu putih dan field terisi biru pucat. Shell serta kartu memakai border; bayangan hanya pada lapisan terangkat seperti dropdown dan dialog. |
| Aksi | Biru logo `#26599A`, hover `#163E70`, teks putih. | Biru yang sama; satu aksi utama per konteks kerja. |
| Stabilo | `#DCEBFA` di belakang satu frasa, teks `#10243F`/`#163E70`. | Hanya pada judul pengantar; status dan navigasi memakai penanda tersendiri. |
| Gerak | Gerak khas “penekanan saat berbicara” (judul naik per baris, sapuan stabilo, media hero masuk) paling banyak satu per layar; isi memudar ringan; anchor scroll halus jika dipicu pengguna. | Feedback cepat pada tombol/filter/dialog; tidak ada reveal per baris atau parallax. |

> **Pembaruan 16 November 2026:** kolom **Admin CMS** pada tabel di atas digantikan oleh [Pola UI admin — Monochrome Soft](admin-ui-patterns.md): Poppins, monokrom dengan aksen kuning dan mint untuk status berhasil, navigasi pil, tombol bulat, kartu radius 32 px. Kedua kanal kini **sengaja tidak berbagi** font maupun palet; yang dibagi hanya logo dan aturan aksesibilitas. Kolom Academy tidak berubah.

Untuk situs publik, Poppins dan warna hijau pada gambar referensi bukan font atau palet Albana. Logo memakai aset resminya; warna biru `#26599A` adalah token rancangan yang perlu dicocokkan bila brand guide resmi tersedia. Foto, testimoni, angka, dan logo mitra hanya muncul dengan sumber serta izin yang tepat.

### Token dan tingkat penekanan

| Token rancangan | Nilai | Aturan pakai |
|---|---|---|
| Brand / aksi | `#26599A` | CTA, tautan, fokus; jangan pada seluruh judul dan kartu sekaligus. |
| Brand gelap | `#163E70` | Hover aksi, bidang ajakan, heading di atas biru pucat. |
| Tinta | `#10243F` | Teks utama pada bidang terang. |
| Stabilo | `#DCEBFA` | Satu frasa penting atau pilihan aktif. |
| Well admin | `#EDF4FB` | Pencarian, filter, ringkasan. |
| Latar admin | `#F4F8FC` | Halaman di luar shell. |
| Garis | `#D8E4F0` | Pemisah dekoratif di kedua kanal (1,29:1 di atas putih). |
| Tepi kontrol | `#7895B8` | Garis bawah field publik dan tepi field admin saat perlu batas jelas; 3,09:1 di atas putih. |
| Putih | `#FFFFFF` | Kanvas publik dan permukaan kartu. |

Warna status sukses, peringatan, dan galat boleh berbeda dari biru untuk menyampaikan makna; tuliskan labelnya. Periksa kontras teks biasa minimal 4,5:1, teks besar dan batas kontrol penting minimal 3:1 pada kedua tema. Jangan menurunkan opacity teks untuk mengejar nuansa lembut.

Tema gelap berbeda per kanal dengan sengaja: publik memakai kanvas navy merek `#10243F` dan aksen `#BBD7F5`; admin memakai halaman lebih gelap `#0D1B2D`, kartu `#15263D`, dan aksi `#DCEBFA` untuk kerja lama. Nilai lengkap ada di design system masing-masing; jangan menukar token gelap antar kanal.

### Tipografi dan bentuk

- Gunakan `Plus Jakarta Sans` pada heading dan judul kartu; `Inter` pada paragraf, formulir, tabel, dan metadata. Logo tidak disusun ulang dengan font UI. Bobot per kanal mengikuti tabel di bawah; sediakan fallback `system-ui, sans-serif`.
- Skala publik memakai sepuluh token di [Academy §4](academy-design-system.md): display 44 → 96px, `h2` 32 → 56px, isi 16 → 17px, label 12px kapital. Lompatan antar-tingkat minimal 1,5×; tracking negatif hanya pada 22px ke atas. Judul admin 24–32px. Body publik memakai tinggi baris 1.65; body admin 14px dengan tinggi baris 1.4–1.6. Hindari huruf kapital untuk paragraf panjang.
- Radius mengikuti **peran**, bukan satu nilai global. Academy memakai field bergaris bawah tanpa radius, sedangkan tombolnya memakai radius kecil; admin memakai field Soft UI terisi dengan radius 12px. Kedua kanal berbagi warna dan tipografi, tetapi bentuk formulirnya sengaja berbeda.
- Soft UI admin berbeda sengaja dari editorial academy: radius lebih lembut dan permukaan bertingkat. Kedalaman kartu berasal dari warna serta border; dropdown, tooltip, dan dialog boleh memakai bayangan sesuai [Admin §7](admin-design-system.md). Hindari neumorphism cekung dan panel bertumpuk yang mengaburkan hierarki.

| Font | Academy dan pendaftaran publik | Admin CMS |
|---|---|---|
| Inter | 400, 500, 600 | 400, 500, 600, 700 (700 hanya angka display) |
| Plus Jakarta Sans | 600, 700, 800 | 600, 700 |

**Implementasi saat ini:** token body `globals.css` memprioritaskan Inter dan token heading memprioritaskan Plus Jakarta Sans. Font masih dimuat melalui Google Fonts CSS; migrasi ke `next/font` merupakan perbaikan performa terpisah setelah risiko pada route lama diperiksa. Daftar di atas adalah aturan pakai per kanal, bukan jumlah berkas yang harus diunduh.

### Formulir dan media menurut kanal

| Kebutuhan | Academy publik | Admin CMS |
|---|---|---|
| Input, textarea, select | **Line style:** latar transparan, garis bawah 1px `#7895B8`, radius 0; fokus garis biru 2px dan ring fokus yang terlihat. | **Soft UI:** bidang `#EDF4FB` atau putih, border yang terlihat, radius 12px; fokus ring biru dan keadaan galat dengan pesan. |
| Label dan isi | Inter; label tetap terlihat, petunjuk dan galat tepat di dekat field. | Inter; label tetap terlihat, ruang lebih padat untuk tugas berulang. |
| Tombol | Plus Jakarta Sans, radius 8px, biru logo untuk aksi utama. | Plus Jakarta Sans, radius 14px, biru logo untuk aksi utama. |
| Bukti visual | Foto/video kelas berizin menjadi bagian dari hero, pengantar metode, dan dokumentasi; identitas dan CTA tetap terbaca sebelum media dimuat. | Thumbnail hanya bila membantu pekerjaan operator; tidak memakai hero pemasaran. |

Landing page memakai ritme **pesan → bukti visual → pilihan program → bukti proses → jadwal/aksi**, bukan menaruh semua dokumentasi di akhir. [Academy §5–§8](academy-design-system.md) menetapkan komposisi responsif dan aturan media; [konten beranda](../content/home-page-content.md) menetapkan urutan serta naskah. Media pratinjau tidak boleh tampil seolah-olah dokumentasi Albana yang telah terjadi.

### Aturan gerak bersama

Pedoman ini mengadaptasi [animate](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md) dan [animation-performance](https://github.com/emilkowalski/skills/blob/main/skills/animation-performance/SKILL.md) dari `emilkowalski/skills` (perintah sumber: `npx skills@latest add emilkowalski/skills`). Terapkan gerak hanya bila menjelaskan umpan balik, perubahan keadaan, atau urutan baca.

| Jenis | Durasi awal | Easing/properti | Pemakaian |
|---|---:|---|---|
| Tekan/hover | 100–160 ms | `ease`; warna/border/opacity | Respons segera. |
| Tooltip/filter/dropdown | 125–250 ms | `--ease-out`; opacity + transform kecil | Perubahan pilihan dan lapisan kecil. |
| Dialog/drawer | 200–300 ms | `--ease-out`; opacity + transform 8–12px | Perpindahan konteks, fokus segera. |
| Reveal isi publik | 450 ms | `--ease-out`; opacity + transform maksimal 12px | Sekali per kelompok, jeda 60 ms. |
| Gerak khas publik | 700–900 ms | `--ease-expo`; transform + opacity | Tiga tingkat: Wajib (hero, tombol, langkah formulir), Per halaman, Eksperimen; rincian di [Academy §10](academy-design-system.md). Tidak dipakai di admin. |

Definisikan `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` dan `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` bila belum ada token setara. Transisikan properti spesifik; jangan memakai `transition: all`, animasi layout (`width`, `height`, `top`, `left`), atau `will-change` pada seluruh halaman. Untuk `prefers-reduced-motion: reduce`, hilangkan translasi/smooth scroll dan tampilkan keadaan akhir atau fade singkat. Gerak hover hanya pada pointer yang mendukung hover. Konten tetap terlihat tanpa JavaScript; uji pada perangkat ponsel kelas menengah dan hapus efek jika gulir tersendat.

### Checklist handoff

- [ ] Font, warna, dan radius sesuai tabel per kanal; token CSS lama tidak dianggap otomatis sudah berubah.
- [ ] Hero publik punya H1, manfaat, CTA, dan satu media utama berizin yang tetap terbaca pada ponsel; dokumentasi pendukung tersebar tanpa mengulang media yang sama. Status batch/harga berasal dari data yang benar.
- [ ] Field academy memakai line style; field admin memakai Soft UI. Judul dan kontrol utama memakai Plus Jakarta Sans, isi serta label memakai Inter.
- [ ] CMS menampilkan shell, status kerja, filter, serta aksi utama yang jelas; daftar memilih kartu atau tabel sesuai kebutuhan perbandingan.
- [ ] Semua kontrol punya hover/fokus/aktif/loading/error yang terlihat, label aksesibel, target sentuh sekitar 44px, dan hasil simpan yang diumumkan.
- [ ] Pengujian dilakukan pada 320/390/834/1440px, zoom 200%, kedua tema, keyboard, reduced motion, dan koneksi lambat. Tidak ada konten yang menunggu animasi untuk bisa dibaca.

## Arsip

Arah 8 November 2026 (Inter/Montserrat, kanvas hangat, radius nol menyeluruh, hero terpusat, prompt Figma/Stitch lama) dipindahkan ke [arsip](../archive/design-backup/visual-design-2026-11-08.md). Isinya jejak keputusan, bukan instruksi implementasi.
