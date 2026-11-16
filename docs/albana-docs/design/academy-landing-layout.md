# Layout landing page — Albana Speech Academy

**Status:** rancangan tata letak, 16 November 2026. Belum diterapkan ke kode. Dokumen ini menjawab satu pertanyaan: *seksi apa, urutan apa, dan susunan apa di tiap lebar layar*.

| Urusan | Sumber |
| --- | --- |
| Urutan informasi | [Spesifikasi revisi §I.3](../project/website-revision-specification.md) — tujuh prioritas pengunjung |
| Token, tipografi, komponen, gerak | [Design system akademi](academy-design-system.md) dan [aturan visual lintas kanal](visual-design.md) |
| Naskah | [Konten beranda](../content/home-page-content.md) |
| Isi lembaga | [Proposal akademi](../content/academy-proposal.md) |

Dokumen ini tidak mengulang nilai token; ia menunjuk ke bagian design system yang berlaku.

## 1. Peta halaman

Tujuh prioritas spesifikasi menjadi tujuh **bab**. Hero, penutup, dan footer membingkainya.

| # | Bab (prioritas spesifikasi) | Pertanyaan pengunjung | Seksi | Anchor | Latar |
| --- | --- | --- | --- | --- | --- |
| — | Header | — | Navigasi lengket | — | Putih |
| 1 | **Manfaat training** | “Apakah saya bisa lebih percaya diri berbicara?” | 1A Hero · 1B Pita manfaat | `#beranda` | Putih |
| 2 | **Program training** | “Materinya apa dan cocok untuk siapa?” | 2A Pilihan program · 2B Bukti proses | `#program` | Putih |
| 3 | **Kredibilitas lembaga** | “Apakah lembaga ini terpercaya?” | 3A Tentang ASA · 3B Cara belajar 70/20/10 · 3C Pita klien | `#tentang` | Permukaan sekunder `#F3F7FC` |
| 4 | **Testimoni & hasil** | “Apakah peserta sebelumnya berkembang?” | 4A Testimoni · 4B Dokumentasi | `#hasil` | Putih |
| 5 | **Trainer / mentor** | “Siapa yang akan mengajari saya?” | 5 Strip trainer | `#trainer` | Putih |
| 6 | **Harga & jadwal** | “Berapa biayanya dan kapan mulai?” | 6 Panel jadwal per program | `#jadwal` | Permukaan sekunder |
| 7 | **Cara pendaftaran** | “Bagaimana cara ikut?” | 7A Tiga langkah · 7B Public vs In House | `#daftar` | Putih |
| — | Penutup | — | Panel ajakan · Kontak · Footer | `#kontak` | Biru tua `#163E70` |

Ritme latar: putih → putih → **pucat** → putih → putih → **pucat** → putih → **biru tua**. Hanya dua bidang pucat dan satu bidang biru tua; sisanya ruang putih.

### Keselarasan dokumen

[Design system akademi §8](academy-design-system.md) dan [konten beranda](../content/home-page-content.md) diselaraskan dengan urutan ini pada 16 November 2026: dokumentasi berada di bab 4 bersama testimoni, cara belajar di bab 3 sebagai bukti kredibilitas. Kode beranda (`front/components/home/home-page.tsx`) belum diubah.

## 2. Kerangka halaman

Berlaku untuk semua seksi; rincian di [design system §5](academy-design-system.md).

| Lebar | Kontainer | Padding samping | Kolom | Jarak kolom | Padding vertikal seksi |
| --- | --- | --- | --- | --- | --- |
| ≥ 1280 px | `max-w-7xl` (1280 px) | 48 px | 12 | 32 px | 96 px |
| 1024–1279 px | penuh | 32 px | 12 | 24 px | 80 px |
| 768–1023 px | penuh | 24 px | 8 | 24 px | 64 px |
| < 768 px | penuh | 20 px | 4 | 16 px | 48 px |

**Kepala seksi** dipakai semua bab kecuali hero:

```text
[ LABEL BAB ]                                  ← label kurung siku, 12 px kapital
Judul seksi dua baris dengan satu       Paragraf pengantar maksimal
frasa ber-stabilo                       tiga baris, lebar ≤ 46 karakter.
──────────────────────────────────────────────────────────────────────
```

Desktop: judul 7 kolom kiri, pengantar 4 kolom kanan (1 kolom kosong di antaranya), garis `1px` menutup blok. Tablet dan ponsel: pengantar turun ke bawah judul; garis tetap.

## 3. Header

```text
┌──────────────────────────────────────────────────────────────────────┐
│ [logo]      Program  Tentang  Trainer  Jadwal  Kontak     ◐  [Lihat jadwal] │
└──────────────────────────────────────────────────────────────────────┘
```

- Tinggi 72 px desktop, 60 px ponsel; lengket di atas; latar putih, garis bawah `#D8E4F0`.
- Lima tautan anchor + pengubah tema + satu tombol utama. Tautan **Artikel** muncul hanya bila ada artikel terbit.
- < 1024 px: tautan masuk menu lembar penuh dari kanan; tombol **Lihat jadwal** dan pengubah tema tetap di bilah.
- Tautan aktif mengikuti seksi yang sedang terlihat: garis bawah 2 px, bukan warna pudar.
- Setiap anchor memakai `scroll-margin-top` setinggi header.

## 4. Bab 1 — Manfaat training

### 1A Hero

Desktop (≥ 1024 px), grid 5 : 7:

```text
┌───────────────────────────────┬──────────────────────────────────────┐
│ [logo Albana, tinggi 56–72px] │                                      │
│                               │                                      │
│ Albana ▓Speech▓               │        FOTO / POSTER VIDEO           │
│ Academy                       │        kegiatan, rasio 16:10         │
│                               │                                      │
│ Saat tim menunggu usulanmu,   │                                      │
│ bagaimana kamu memulai? …     │                                      │
│                               │                                      │
│ [Lihat jadwal] [Cara belajar] │                                      │
│                               ├──────────────────────────────────────┤
│ Presentasi · Diskusi · MC     │ caption satu baris / penanda dummy   │
└───────────────────────────────┴──────────────────────────────────────┘
```

Ponsel (< 768 px), satu kolom, urutan tetap: logo → H1 → uraian → CTA (bertumpuk, lebar penuh) → baris fokus → media 4:3 → caption.

| Elemen | Aturan |
| --- | --- |
| Logo | Elemen pertama dan utama (spesifikasi §I.2). Tinggi 72 px desktop, 56 px tablet, 48 px ponsel; jarak ke H1 32 px. Tidak diulang di dalam media. |
| H1 | Token display; stabilo hanya pada “Speech”. Maksimal 3 baris di 320 px. |
| Uraian | Satu paragraf, ≤ 3 baris desktop. |
| CTA | Utama **Lihat jadwal** → `#jadwal`; sekunder **Lihat cara belajar** → `#tentang`. |
| Media | Satu frame. Rasio dikunci di wadah agar tidak ada pergeseran layout. Video tidak autoplay. |
| Tinggi | Hero + pita manfaat muat dalam satu layar 1440×900; di ponsel CTA terlihat tanpa menggulir pada 390×844. |
| Gerak | W1 (judul per baris), W2 (stabilo), W3 (media) — satu komposisi. [Design system §10](academy-design-system.md). |

### 1B Pita manfaat

Empat hasil dari proposal, langsung di bawah hero, tanpa kepala seksi:

```text
├─────────────────┬─────────────────┬─────────────────┬─────────────────┤
│ 01              │ 02              │ 03              │ 04              │
│ Lebih percaya   │ Presentasi lebih│ Komunikasi kerja│ Tampil lebih    │
│ diri            │ meyakinkan      │ lebih efektif   │ profesional     │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

Empat sel bergaris (radius 0, tanpa kartu mengambang): nomor kecil + frasa 2–4 kata. Desktop 4 kolom; tablet 2×2; ponsel daftar satu kolom dengan garis antarbaris. Tanpa ikon dekoratif dan tanpa angka klaim.

## 5. Bab 2 — Program training

### 2A Pilihan program

Label `[ PROGRAM ]`. Dua kelompok dengan sub-judul kecil: **Public Training** (tiga kartu) dan **Inhouse Training** (satu panel lebar).

Desktop:

```text
PUBLIC TRAINING
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ 01                   │ 02                   │ 03                   │
│ Public Speaking      │ Public Speaking      │ Sertifikasi Pembicara│
│ Series               │ for Speakers         │ Profesional          │
│ Untuk siapa (1 baris)│ Untuk siapa          │ Untuk siapa          │
│ · materi 1           │ · materi 1           │ · materi 1           │
│ · materi 2           │ · materi 2           │ · materi 2           │
│ · materi 3           │ · materi 3           │ · materi 3           │
│ + Lihat materi lain  │ + Lihat materi lain  │ + Lihat materi lain  │
│ ──────────────────── │ ──────────────────── │ ──────────────────── │
│ ● Pendaftaran dibuka │ ● Pendaftaran dibuka │ ○ Jadwal menyusul    │
│ Rp1.500.000          │ Rp1.300.000  ~~1,5jt~~│ —                    │
│ [Daftar]  Selengkapnya→│ [Daftar] Selengkapnya→│ Selengkapnya →     │
└──────────────────────┴──────────────────────┴──────────────────────┘

INHOUSE TRAINING
┌─────────────────────────────────────────────┬────────────────────────┐
│ Pelatihan di tempat perusahaan. Materi,     │ [Konsultasi via WhatsApp]│
│ silabus, tanggal, dan waktu menyesuaikan.   │ Selengkapnya →          │
└─────────────────────────────────────────────┴────────────────────────┘
```

- Tiga kartu menjadi **satu matriks bergaris** (garis vertikal antarkolom), tinggi sama, bagian status–harga–aksi rata bawah.
- Urutan isi tiap kartu identik: nomor → nama → untuk siapa → tiga materi → status → harga → aksi. Perbedaan lewat teks, bukan warna.
- Catatan bundling pada kartu Speaker dan Sertifikasi hanya tampil bila penawaran aktif: satu baris “Tersedia paket dengan Sertifikasi”.
- Tablet: 2 kolom + 1 (kartu ketiga selebar penuh). Ponsel: satu kolom, garis vertikal menjadi horizontal; “Lihat materi lain” membuka di tempat.
- Tidak ada carousel atau tab. Tidak ada tanda “paling populer”.

| Keadaan kartu | Tampilan |
| --- | --- |
| Batch menerima | Titik status + “Pendaftaran dibuka”, harga, tombol **Daftar**. |
| Batch ada, tertutup | “Pendaftaran ditutup”, harga, hanya tautan Selengkapnya. |
| Belum ada batch | “Jadwal menyusul”, harga “—”, hanya tautan Selengkapnya. |
| Memuat | Skeleton tiga kartu dengan tinggi akhir. |
| Gagal | Satu pesan selebar matriks + **Coba lagi**; kepala seksi tetap. |

### 2B Bukti proses

Satu media lebar 12 kolom (rasio 21:9 desktop, 16:9 tablet, 4:3 ponsel) dengan caption satu baris di bawahnya. Tanpa kepala seksi; ini jeda visual antara bab 2 dan 3. Dihilangkan seluruhnya bila belum ada media terbit atau dummy berlabel.

## 6. Bab 3 — Kredibilitas lembaga

Latar permukaan sekunder. Tiga seksi berurutan dalam satu bidang.

### 3A Tentang ASA

```text
[ TENTANG KAMI ]
┌────────────────────────────┬─────────────────────────────────────────┐
│                            │ Albana Speech Academy by CV Asa Albana  │
│      POTRET ALAN           │ paragraf profil lembaga (≤ 5 baris)     │
│      rasio 4:5             │                                         │
│                            │ VISI                                    │
│                            │ satu kalimat                            │
│  Alan Albana               │ MISI                                    │
│  Founder                   │ · empat butir                           │
│                            │                                         │
│                            │ Sekilas Alan: 3 poin    Cara belajar →  │
└────────────────────────────┴─────────────────────────────────────────┘
```

Desktop 5 : 7. Tablet 3 : 5. Ponsel: potret (4:5, lebar penuh) lalu teks. Potret tidak sama dengan media hero. Tanpa potret, kolom teks melebar menjadi 8 kolom di tengah.

### 3B Cara belajar 70/20/10

```text
[ CARA BELAJAR ]  Kemampuan bicara tumbuh saat benar-benar dipraktikkan
┌──────────────────────────────────────────────┬──────────────┬───────┐
│ 70%                                          │ 20%          │ 10%   │
│ Praktik & simulasi                           │ Coaching &   │ Konsep│
│ praktik langsung · simulasi panggung ·       │ feedback     │       │
│ role play · real case                        │              │       │
└──────────────────────────────────────────────┴──────────────┴───────┘
 Fundamental ──→ Professional ──→ Advance ──→ Expert
```

- Tiga bidang dengan **lebar sebanding 7 : 2 : 1** di desktop (kolom 8 · 2 · 2 agar teks 10% tetap terbaca), sehingga proporsi terlihat tanpa grafik. Bidang 70% memakai biru logo dengan teks putih; dua lainnya putih bergaris.
- Tablet dan ponsel: tiga baris bertumpuk; proporsi ditunjukkan bilah `scaleX` setinggi 4 px di atas tiap baris.
- Di bawahnya, kerangka empat tingkat sebagai satu baris berpanah (ponsel: daftar bernomor vertikal).
- Tujuh bidang pelatihan tampil sebagai deret chip teks di bawah kerangka, berlabel “Bidang pelatihan” — bukan kartu.

### 3C Pita klien

Satu baris logo atau nama instansi yang pernah dilatih, berlabel “Pernah melatih”. Desktop 6 per baris, tablet 4, ponsel 3; maksimal dua baris + tautan **Lihat semua** ke halaman Inhouse. **Seluruh pita disembunyikan** sampai `academy_partners` berisi baris terbit dengan izin tercatat. Tanpa marquee.

## 7. Bab 4 — Testimoni & hasil

### 4A Testimoni

```text
[ CERITA PESERTA ]
┌──────────────────────────────────────┬───────────────┬───────────────┐
│ “Kutipan unggulan 20–30 kata dengan  │ “Kutipan      │ “Kutipan      │
│  satu frasa ▓ber-stabilo▓.”          │  pendek”      │  pendek”      │
│                                      │               │               │
│ ◯ Nama · Peran                       │ Nama · Peran  │ Nama · Peran  │
│ Hasil: “kini memandu acara kantor”   │               │               │
└──────────────────────────────────────┴───────────────┴───────────────┘
```

Satu kutipan unggulan (testimoni terbit terbaru) 6 kolom + dua pendukung 3 kolom. Tablet: unggulan penuh, dua pendukung berdampingan. Ponsel: bertumpuk. Bila hanya ada satu testimoni, tampil sendiri di 8 kolom tengah. **Tanpa testimoni terbit, seksi 4A tidak dirender** dan label bab berubah menjadi `[ DOKUMENTASI ]`.

### 4B Dokumentasi

Galeri editorial: satu frame dominan + pendukung.

```text
┌───────────────────────────────────────┬──────────────────┐
│                                       │        B         │
│                  A                    ├──────────────────┤
│               (dominan)               │        C         │
├──────────────────┬────────────────────┴──────────────────┤
│        D         │              E ▶ video                │
└──────────────────┴───────────────────────────────────────┘
```

| Jumlah media | Susunan desktop |
| --- | --- |
| 1 | Satu frame 12 kolom, 21:9. |
| 2 | 7 : 5. |
| 3 | A dominan 8 kolom + B, C bertumpuk 4 kolom. |
| 4–5 | Pola di atas. |
| ≥ 6 | Lima pertama + tombol **Lihat semua dokumentasi**. |

Ponsel: A selebar penuh, sisanya grid 2 kolom tanpa caption di sel (caption muncul di dialog). Klik membuka dialog gambar (radius 12 px, tutup dengan ×, latar, atau Escape; fokus kembali ke pemicu). Video memakai poster, durasi, dan tombol putar. Wadah mengunci rasio; setiap sel memakai placeholder warna `#F3F7FC` sampai gambar siap.

## 8. Bab 5 — Trainer

```text
[ TRAINER ]
┌───────────┬───────────┬───────────┬───────────┐
│  potret   │  potret   │  potret   │  potret   │
│   1:1     │   1:1     │   1:1     │   1:1     │
├───────────┼───────────┼───────────┼───────────┤
│ Alan      │ Nurachman │ Andhan    │ Abo       │
│ Albana    │           │ Indah     │ Priatna   │
│ Founder · │ Motivator │ Trainer   │ Trainer MC│
│ Master    │ · Author  │ Public    │ · Host    │
│ Trainer   │           │ Speaking  │           │
│ Profil →  │ Profil →  │ Profil →  │ Profil →  │
└───────────┴───────────┴───────────┴───────────┘
```

Empat kolom bergaris, potret persegi radius 0. Tablet 2×2. Ponsel: gulir horizontal ber-*snap* dengan kartu 72% lebar layar sehingga kartu berikutnya terlihat mengintip, atau 2×2 bila nama muat. Tanpa foto resmi: monogram inisial di bidang `#F3F7FC`. **Profil →** membuka dialog: bio, keahlian, pendidikan, sertifikasi, pengalaman. Tidak menyebut trainer mengajar batch tertentu.

## 9. Bab 6 — Harga & jadwal

Latar permukaan sekunder. Satu panel per program yang punya batch.

```text
[ JADWAL & BIAYA ]
┌──────────────────────────────────────────────────────────────────────┐
│ Public Speaking Series · Batch 9                 ● Pendaftaran dibuka│
├───────────────────────────────────────┬──────────────────────────────┤
│ Sesi 1  Sab, 7 Nov 2026  15.00–18.00  │ Biaya                        │
│ Sesi 2  Sab, 14 Nov 2026 15.00–18.00  │ Rp1.500.000                  │
│ Sesi 3  Sab, 21 Nov 2026 15.00–18.00  │ DP 20% · Rp300.000           │
│ Sesi 4  Sab, 28 Nov 2026 15.00–18.00  │                              │
│                                       │ [Daftar kelas ini]           │
│ ⌖ Albana Speech Academy, Jl. Diponegoro 61 │ Detail program →        │
└───────────────────────────────────────┴──────────────────────────────┘
```

- Panel putih radius 8 px (kartu mandiri), sesi sebagai tabel sederhana dengan angka tabular; kolom kiri 8, kanan 4.
- Tablet: sama, 5 : 3. Ponsel: kepala → sesi → tempat → biaya → tombol lebar penuh.
- Semua tanggal dan harga dari `batches`; waktu berlabel WIB.

| Keadaan | Tampilan |
| --- | --- |
| Menerima | Status hijau berlabel, tombol **Daftar kelas ini**. |
| Tertutup / penuh | Status netral berlabel, tanpa tombol daftar; tautan **Tanya admin**. |
| Program tanpa batch | Baris ringkas: nama program + “Jadwal program ini belum tersedia.” |
| Tidak ada batch sama sekali | Satu panel: “Jadwal kelas berikutnya belum tersedia.” + **Chat lewat WhatsApp**. |
| Gagal muat | “Jadwal belum bisa dimuat.” + **Coba lagi**. |

## 10. Bab 7 — Cara pendaftaran

### 7A Tiga langkah

```text
[ CARA DAFTAR ]
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ 01                   │ 02                   │ 03                   │
│ Isi formulir         │ Transfer sesuai      │ Kirim bukti lewat    │
│ Pilih program, isi   │ tagihan              │ WhatsApp             │
│ data, pilih lunas    │ Nominal persis       │ Admin memverifikasi; │
│ atau DP.             │ dengan kode unik.    │ kamu masuk grup kelas│
└──────────────────────┴──────────────────────┴──────────────────────┘
```

Tiga kolom bergaris, nomor besar. Ponsel: daftar vertikal dengan garis penghubung di kiri. Kalimat mengikuti alur nyata: tagihan dan rekening muncul di halaman konfirmasi, bukan dikirim admin.

### 7B Dua jalur

Dua panel sejajar (6 : 6; bertumpuk di ponsel): **Public Training** → **Lihat jadwal**; **In House Training** → **Konsultasi via WhatsApp**. Catatan kecil di bawah: penjadwalan ulang lewat admin; pembayaran tidak dikembalikan.

## 11. Penutup

- **Panel ajakan** (biru tua, lebar penuh, radius 0): judul putih “Usulan apa yang ingin kamu latih?”, satu tombol **Lihat jadwal** (putih, teks navy) dan tautan **Chat lewat WhatsApp**. Tampil hanya bila ada batch terbit atau kontak terverifikasi.
- **Kontak** (masih di bidang biru tua, 4 kolom): Alamat (catatan “Bukan lokasi kelas” bila berbeda) · WhatsApp · Email · Instagram. Ponsel: daftar vertikal, setiap baris target sentuh ≥ 44 px.
- **Footer**: logo putih, navigasi satu baris, ikon kanal, hak cipta — terpusat.

## 12. Ringkasan responsif

| Seksi | ≥ 1024 px | 768–1023 px | < 768 px |
| --- | --- | --- | --- |
| Hero | 5 : 7 | 4 : 4 atau tumpuk | Teks lalu media |
| Pita manfaat | 4 | 2×2 | 1 |
| Program | 3 + panel | 2 + 1 + panel | 1 |
| Tentang ASA | 5 : 7 | 3 : 5 | Potret lalu teks |
| 70/20/10 | 8 · 2 · 2 | 3 baris | 3 baris |
| Testimoni | 6 · 3 · 3 | 8, lalu 4 · 4 | 1 |
| Dokumentasi | Mosaik | Mosaik 8 kolom | 1 besar + grid 2 |
| Trainer | 4 | 2×2 | Gulir *snap* |
| Jadwal | 8 : 4 | 5 : 3 | 1 |
| Langkah | 3 | 3 | 1 vertikal |

Uji pada 320, 390, 834, dan 1440 px, zoom 200%, kedua tema.

## 13. Gerak per seksi

Resep gerak lengkap — kosakata G1–G7, gerak dua arah saat gulir turun dan naik, header, dan aturan keras — ada di [konten beranda §1.3](../content/home-page-content.md), dengan resep per seksi di setiap babak. Ringkasan:

| Seksi | Gerak |
| --- | --- |
| Hero | G1 judul per baris + G2 stabilo + G4 media; media menyusut halus saat digulir keluar |
| Pita manfaat, trainer, langkah | G6 deret horizontal, arah dibalik saat gulir naik |
| Kepala tiap bab | G1 + G2 |
| Isi seksi | G3, masuk searah gulir di kedua arah |
| Bilah 70/20/10, garis tiga langkah | G5 terikat posisi gulir |
| Dokumentasi | G4 bergantian arah masker |
| Penutup | Bidang biru tua terbuka (G4), lalu G1 + G2 |

Bukan parallax: tidak ada lapisan yang bergerak dengan kecepatan berbeda. Semua konten terlihat tanpa JavaScript; `prefers-reduced-motion` menjadi fade satu arah.

## 14. Sumber data per seksi

| Seksi | Sumber | Bila kosong |
| --- | --- | --- |
| Hero, pita manfaat, langkah | Naskah statis | — |
| Program | `programs` + `batches` aktif + `bundle_offers` | Kartu tanpa harga/aksi |
| Bukti proses | `media_assets` terbit / dummy berlabel | Seksi hilang |
| Tentang ASA | `academy` + naskah statis | Naskah statis |
| Pita klien | `academy_partners` terbit | Seksi hilang |
| Testimoni | `testimonials` terbit | Seksi hilang |
| Dokumentasi | `gallery` | Seksi dan tautan navigasi hilang |
| Trainer | `trainers` | Seksi hilang |
| Jadwal | `batches` (`sessions`, harga, DP, status) | Pesan “belum tersedia” |
| Kontak | `contact_channels` | Seksi hilang |

Seksi yang hilang tidak meninggalkan kepala seksi kosong, dan tautan navigasinya ikut disembunyikan.

## 15. Daftar periksa

- [ ] Urutan bab 1–7 sama dengan spesifikasi revisi §I.3.
- [ ] Logo hero terbaca dan proporsional di 320, 390, 834, 1440 px.
- [ ] CTA hero terlihat tanpa menggulir di 390×844.
- [ ] Empat program tampil sekaligus tanpa carousel; status dan harga dari data.
- [ ] Seksi tanpa data tidak dirender; tidak ada testimoni, klien, atau angka karangan.
- [ ] Media dummy berlabel “Contoh visual — bukan dokumentasi kelas Albana”.
- [ ] Hanya dua bidang pucat dan satu bidang biru tua.
- [ ] Tidak ada pergeseran layout saat media dimuat.
- [ ] Kedua tema, keyboard, zoom 200%, reduced motion diuji.
- [x] §8 design system dan urutan di konten beranda sudah diselaraskan.
