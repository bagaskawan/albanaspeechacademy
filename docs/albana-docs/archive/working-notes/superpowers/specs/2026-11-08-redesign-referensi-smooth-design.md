# Redesign referensi "smooth" — desain

Tanggal: 8 November 2026
Status: menunggu persetujuan
Menggantikan arah visual `asa-box-minimalist` di `docs/design.md`.

## 1. Maksud dan alasan

Pengguna ingin beranda Albana Speech Academy mengikuti gaya gambar referensi
("Jasper Harmony"): pewarnaan lembut/bersenyawa dan **tanpa `font-mono`**.
Bentuk huruf berat sebagai display, bidang warna pastel, dan panel besar
menggantikan kotak minimalis hangat yang sekarang.

Yang berubah hanya **bahasa visual**. Naskah, urutan seksi, aturan editorial,
dan logika data tetap seperti `docs/home-content.md` dan `docs/project/project-brief.md`.

## 2. Pendekatan dan pilihan

- **A — Restyle saja.** Ganti palet jadi biru lembut, hapus mono, tata letak
  tetap. Kecil, risiko rendah.
- **B — Bangun ulang ke tata letak referensi.** Judul display besar, bidang
  panel, rail kiri, kartu bernomor seperti "01 JASPER HARMONY". Dipilih
  pengguna (8 November 2026).

Alasan B: gambar referensi mengubah susunan, bukan sekadar warna.

## 3. Backup gaya lama (sudah ditulis lebih dulu)

Gaya lama belum ada di git. Salinan beku ada di `docs/style-backup/`
(`classic-globals.css`, `classic-layout.tsx`, `classic-design.md`) dengan
langkah pemulihan di `docs/archive/design-backup/README.md`. Ini memungkinkan kembali
ke gaya awal atau ke varian A kapan saja.

## 4. Arah visual B — `asa-soft-reference`

### 4.1 Warna (lembut/bersenyawa)

| Peran | Nilai | Catatan |
|---|---|---|
| Canvas | `#F7F4EE` | kertas hangat dinaikkan, tetap lembut |
| Panel | `#CBD9E7` | bidang biru lembut (dari referensi) |
| Panel-soft | `#E6EDF4` | bidang pendamping |
| Card | `#FFFFFF` | kartu di atas panel |
| Ink | `#15171B` | teks utama |
| Muted | `#5C6470` | teks sekunder |
| Accent | `#2F5C86` | biru navy dilembutkan |
| Accent-strong | `#24486A` | hover/pressed |
| Rule | `#DDE2E9` | garis/tepi lembut |
| Pastel pendukung | sage `#A7B7A9`, sand `#E6D9C4`, clay `#C58A78`, sun `#E7C75D` | dipakai hemat sebagai bidang |

Biru tetap keluarga logo ASA; kelembutan datang dari bidang pastel dan
kontras rendah antarpermukaan, bukan dari menambah warna jenuh.

### 4.2 Tipografi

- IBM Plex Mono **dihapus**: impor di `web/app/layout.tsx` dan token
  `--font-mono` di `globals.css` dibuang; `.eyebrow` dan semua label mono
  pindah ke keluarga sans (huruf besar, tracking kecil).
- Display: keluarga sans yang ada (Franklin Gothic ATF; fallback Arial),
  bobot tinggi dan tracking rapat untuk judul besar (keputusan 2).
- `tabular-nums` tetap untuk angka yang dibandingkan.

### 4.3 Bentuk

Sudut panel/kartu/kontrol dilembutkan: `--radius-panel: 12px`,
`--radius-card: 12px`, `--radius-control: 10px` (keputusan 1). Batas 1 px
tetap, tanpa shadow dekoratif.

Selain itu judul display besar (bobot tinggi, tracking rapat) dan rail kiri
vertikal pada ≥1024 px (keputusan 3).

## 5. Komposisi per seksi (referensi → ASA)

| Seksi | Perubahan dari gaya lama |
|---|---|
| Rail kiri (≥1024) | Kolom tipis, label seksi vertikal + Instagram, sticky (keputusan 3). |
| Masthead | Wordmark kiri (logo resmi), nav + aksi kotak kanan, di atas bidang panel. |
| Hero · #hero | H1 display besar "Albana Speech Academy", dua kolom teks kecil (deskripsi + baris fokus), bidang panel biru lembut + potret Alan dan bentuk abstrak. Tanpa mosaik kartu, tanpa foto stok. |
| Perkenalan Alan · #alan | Potret persegi + teks, dibungkus panel lembut. |
| Program · #program | Tujuh bidang bernomor gaya indeks; rapi di kolom. |
| Program pilihan · #program-pilihan | Dua kartu program bernomor besar **01 / 02** (mengacu kartu "01 JASPER HARMONY"), panel biru lembut. |
| Cara ngajar · #cara-ngajar | Tiga langkah dalam satu panel, angka besar. |
| Trainer · #trainer | Strip potret 4:5; placeholder monogram di bidang pastel (foto belum berizin). |
| Dokumentasi · #dokumentasi | Kolase grid; bidang pastel menggantikan foto yang belum ada. |
| Testimoni · #testimoni | Kartu dengan tanda kutip sans, bidang lembut. |
| Format pelatihan · #format | Dua panel berdampingan. |
| Hubungi kami · #kontak | Daftar kanal, panel lembut. |
| Footer | Bidang lembut/gelap, tautan kotak. |

Seksi Dokumentasi dan Testimoni tetap berlabel "Contoh pratinjau".

## 6. Batasan dan non-tujuan

- Naskah/urutan seksi tidak berubah (`home-content.md`).
- Tidak menambah foto stok, testimoni, statistik, atau logo mitra; panel
  media memakai bidang warna/placeholder sampai aset berizin ada.
- Kontras teks ≥4.5:1, kontrol/focus ≥3:1, target 44 px, reduced motion,
  focus terlihat tetap wajib walau warna lembut.
- Tidak ada tema gelap. Tidak menambah arsitektur/data baru.

## 7. Keputusan (disetujui 8 November 2026)

1. **Radius**: melembutkan ke `--radius-panel: 12px`, `--radius-card: 12px`,
   `--radius-control: 10px`.
2. **Font display**: tetap Franklin Gothic ATF / fallback Arial; tanpa
   dependency font baru.
3. **Rail kiri vertikal**: dipakai pada desktop ≥1024 px.
4. **Sebaran bidang biru lembut**: beberapa panel besar seperti referensi.

Keputusan cakupan:

- **Konten**: menata ulang tampilan yang sudah live; `home-content.md`
  dianggap usang untuk pekerjaan ini (naskah tidak diubah).
- **Cakupan**: token global + hapus `font-mono` di seluruh aplikasi; tata
  letak B diterapkan pada beranda dan `/register`.
- **Dokumen**: `docs/design.md` ditulis ulang ke bahasa visual baru; gaya
  lama tetap di `docs/style-backup/`. Kode saja, tanpa Figma/Stitch.

## 8. Varian A (cadangan tulis)

A = palet lembut pasal 4.1 + hapus mono pasal 4.2, **tanpa** mengubah tata
letak, radius tetap 0, tetap tanpa panel besar. Perubahan menyentuh
`web/app/globals.css` dan ~13 tempat `font-mono`. Bila A dipilih, gaya lama
tetap dapat dipulihkan dari `docs/style-backup/`.

## 9. Verifikasi

- `npm run lint`, `npx --no-install tsc --noEmit`, `npm run build` dari `web/`.
- Render 1440/834/390/320 px; tanpa scroll horizontal.
- Ukur ulang kontras pasangan token setelah perubahan palet.
- Periksa tidak ada `font-mono` tersisa dan tidak ada impor font mono.

## 10. Revisi kedua (8 November 2026)

Pengguna meminta empat perubahan lanjutan setelah revisi pertama:

1. **Hero banner mirip gambar referensi.** H1 display raksasa uppercase rata
   kiri "Albana Speech Academy" (tanpa panel), kolom kanan berisi label
   "Tonton" + H2 "Cuplikan Kelas", deskripsi, lingkaran media berlencana putar,
   dan dua CTA ("Daftar Kelas" → `/register`, "Lihat Program" → `/#program`,
   karena tidak ada seksi Jadwal). Penunjuk "Gulir" di bawah. Menggantikan
   hero panel-biru revisi pertama. Untuk lingkaran media, video kelas belum
   ada; sementara memakai potret Alan dengan lencana putar dekoratif
   (`aria-hidden`, bukan tombol) sampai aset berizin tersedia.
2. **Font**: judul → **Inter**, isi → **Montserrat**, keduanya lewat
   `next/font/google` (`--font-inter`, `--font-montserrat`). `--font-display`
   = Inter, `--font-sans` = Montserrat. Kelas variabel dipasang pada `<html>`
   (bukan `<body>`), karena token `--font-sans`/`--font-display` didefinisikan
   di `:root` dan mensubstitusi `var(--font-*)` pada elemen yang sama.
3. **Kotak biru muda** sebagai pelengkap komposisi hero: dua bidang `Panel`
   persegi di kanan-atas dan kiri-bawah, di dalam `overflow-hidden`.
4. **Tanpa border radius**: `--radius-panel/card/control/action/media` = `0`.
   Hanya lingkaran asli (titik indikator, media bulat, ikon bulat) yang bulat.

Keputusan revisi kedua menggantikan butir terkait di pasal 4.2, 4.3, dan 7.
Bahasa warna, grid, naskah, dan aturan editorial revisi pertama tetap berlaku.
`docs/design.md` diperbarui agar konsisten; gaya lama tetap di
`docs/style-backup/`.
