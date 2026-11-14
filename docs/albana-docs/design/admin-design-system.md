# Design System: Albana Speech Academy — Admin CMS

**Project ID:** albana-admin-01
**Aesthetic Style:** Editorial Dashboard — *"Biru Albana, kertas, stabilo"*
**Referensi Visual:** Ecomora Dashboard (struktur) · identitas Albana (warna dan tipografi)
**Menggantikan:** pedoman admin sebelumnya.
**Rujukan alur:** [archive/legacy/user-flow.md](../archive/legacy/user-flow.md) · **Rujukan implementasi:** [rencana 11 November 2026](../archive/plans/2026-11-11-admin-program-batch-article-registration.md)

---

## 0. Filosofi Desain

Admin dipakai operator dan penulis, bukan pengunjung. Prinsipnya **"Data First, Decoration Never"**: operator harus langsung melihat apa yang perlu diisi, kapan pendaftaran dibuka, dan apakah perubahannya sudah tersimpan. Warna dipakai untuk tiga hal saja: aksi, status, dan satu aksen lembut per area. Bukan dekorasi tersebar.

| Aspek | Web Komunitas | Admin CMS |
|---|---|---|
| **Pengguna** | Publik / calon peserta | Internal / operator dan penulis |
| **Mood** | Bold, editorial | Clean, hangat, data-driven |
| **Navigasi** | Header publik | Topbar + sidebar desktop, drawer di ponsel |
| **Warna** | Editorial + biru fungsional + stabilo kuning | Biru Albana untuk aksi + netral + stabilo + aksen pastel sage/sand/clay/sun |
| **Corner** | Sharp (0px) | 16–20px pada kartu dan panel |
| **Bayangan** | Tidak ada | Sangat tipis, hampir tak terlihat |
| **Tipografi angka** | — | Number display besar, tabular |

> Kelompokkan pertanyaan menurut pekerjaan operator. Tempatkan ringkasan dan satu aksi utama di akhir tiap tahap.

---

## 1. Visual Theme & Atmosphere

- **Permukaan netral:** halaman `#F2F4F7`, kartu `#FFFFFF`, field `#F5F5F5`. Tidak ada bayangan dramatis.
- **Aksi jelas:** tombol utama memakai biru Albana `#2F5C86` (hover `#24486A`), teks putih; ring fokus memakai biru yang sama. Biru ini diambil dari landing page (`--color-button`). Stabilo kuning hanya untuk satu frasa penekanan. Warna status tidak dipakai untuk tombol utama.
- **Aksen lembut:** sage, sand, clay, sun, dan biru panel `#D5E7FF` menjadi latar chip, panel info, dan grafik. Tidak pernah menjadi warna teks di atas putih.
- **Stabilo adalah identitas:** `.highlight-stabilo` yang sudah dipakai di nav admin dan halaman publik. Jangan membuat highlight kedua.
- **Bukan AI slop:** tanpa indigo, ungu, gradient ungu-biru, glassmorphism, emoji sebagai ikon, hero di tengah, atau angka karangan. Satu aksen per area, sisanya netral; biru aksi konsisten dengan landing page.
- **Number display:** angka statistik dan nominal memakai ukuran besar dengan weight 800–900 agar mudah dipindai.
- **Shell:** topbar `h-18` (72px) memanjang penuh, sidebar `w-56` (224px) mulai di bawah topbar, konten `max-w-7xl` dengan padding 24–32px.
- **Kartu besar dan lembut:** radius 16px untuk kartu, 20px untuk panel.
- **Minimal chrome:** setiap elemen harus punya fungsi informasi. Tidak ada ilustrasi dekoratif di area kerja.

---

## 2. Color Palette & Roles

### 2.1 Background & Surface

| Nama | Token | Light | Dark |
|---|---|---|---|
| Page background | `--bg-page` | `#F2F4F7` | `#0F1117` |
| Card surface | `--bg-card` | `#FFFFFF` | `#1A1D27` |
| Search / toolbar well | `--bg-well` | `#F5F5F5` | `#22263A` |
| Input form (style-line) | — | Transparan, mengikuti permukaan induk | Transparan |
| Sidebar | `--bg-sidebar` | `#FFFFFF` | `#1C1C1F` |
| Row hover | — | `#F8F9FA` | `#1F2333` |
| Skeleton base | — | `#E9EBEF` | `#2A2E42` |
| Disabled surface | `--bg-page` | `#F2F4F7` | `#0F1117` |

### 2.2 Teks & Hierarki

| Nama | Token | Light | Dark |
|---|---|---|---|
| Primary text | `--text-primary` | `#111111` | `#F0F0F0` |
| Secondary text | `--text-secondary` | `#6B7280` | `#8B8FA8` |
| Muted / placeholder | `--text-muted` | `#9CA3AF` | `#55596E` |
| Divider / border | `--border-default` | `#E5E7EB` | `#2A2E42` |

### 2.3 Warna Aksi, Fokus & Aksen Lembut

| Peran | Light | Dark | Catatan |
|---|---|---|---|
| Aksi utama | `#2F5C86` teks putih | `#D5E7FF` teks `#111111` | `--color-button`; satu aksi utama per header/tahap |
| Hover aksi utama | `#24486A` | `#E6EDF4` | `--color-hover`; transisi 100–120 ms |
| Fokus | `#2F5C86`, ring 2px offset 2px | `#D5E7FF` | Kontras minimal 3:1 terhadap permukaan |
| Tautan aksi | `#2F5C86` bergaris bawah | `#D5E7FF` | Bukan untuk dekorasi |
| Stabilo | `#FFE78A` | `rgba(116,135,87,0.45)` | Satu frasa per judul; pakai `.highlight-stabilo` |

Biru aksi berasal dari landing page: `--color-button` `#2F5C86`, hover `--color-hover` `#24486A`, pressed `--color-pressed` `#1A3350`. Jangan memakai indigo, purple, atau gradient.

Aksen lembut hanya latar, bukan warna teks:

| Aksen | Token | Pakai | Light | Dark |
|---|---|---|---|---|
| Blue panel | `--color-hero-panel` `#D5E7FF` | Panel info, ringkasan, latar highlight | 100% | `#22263A` |
| Sage | `--color-sage` `#A7B7A9` | Program, badge katalog | 22% di atas putih | 26% di atas `--bg-card` |
| Sand | `--color-sand` `#E6D9C4` | Batch, jadwal, draf | 26% | 22% |
| Clay | `--color-clay` `#C58A78` | Penanda perhatian ringan | 18% | 20% |
| Sun | `--color-sun` `#E7C75D` | Menunggu verifikasi | 22% | 18% |
| Surface | `--color-surface` `#E6EDF4` | Panel info, skeleton | 100% | `#22263A` |

- Campuran memakai `color-mix(in srgb, var(--token) <persen>, white)` untuk tema terang dan `var(--bg-card)` untuk tema gelap.
- Teks di atas aksen tetap `--text-primary`; jangan memakai aksen sebagai warna teks.
- Maksimal satu aksen per area layar. Dua aksen hanya untuk membedakan dua status.
- Tombol utama memakai biru aksi, bukan aksen lembut. Aksen tidak dipakai untuk badge galat/berhasil (§2.4).
- Jangan menambah kelas `admin-*` baru: `--color-admin-*` belum didefinisikan di `globals.css`. Pakai token §2 atau `.highlight-stabilo` yang sudah ada.

### 2.4 Warna Status Operasional

| Makna | Contoh label | Light · teks / latar | Dark · teks / latar |
|---|---|---|---|
| Draf | “Belum dibuka”, “Draf” | `#374151 / #F3F4F6` | `#E5E7EB / #27272A` |
| Aktif | “Sedang diedit”, “Aktif” | `#44503F / #EAF0E6` | `#D6E3D0 / #22301C` |
| Berhasil | “Tersimpan”, “Terbit”, “Lunas” | `#166534 / #DCFCE7` | `#BBF7D0 / #14532D` |
| Menunggu | “Menunggu verifikasi” | `#92400E / #FEF3C7` | `#FDE68A / #451A03` |
| Galat | “Jadwal bentrok”, “Gagal simpan” | `#991B1B / #FEE2E2` | `#FECACA / #450A0A` |

- Sertakan kata, bukan hanya warna.
- Badge memakai dot 6px di kiri label; dot mengikuti warna teks.
- Target kontras teks normal minimal 4,5:1.

### 2.5 Chart Colors

| Elemen | Warna |
|---|---|
| Bar utama | `#2F5C86` (dark: `#D5E7FF`) |
| Bar pembanding | sage 40% di atas kartu (dark: sage 30%) |
| Segmen donut utama | `#2F5C86` (dark: `#D5E7FF`) |
| Segmen donut lain | sand, sage, `--color-surface` |
| Garis target | clay 60%, putus-putus |
| Grid chart | `#F3F4F6` (dark: `#2A2E42`) |

---

## 3. Typography

> **Tidak ada font serif di admin.** Seluruh antarmuka memakai sans-serif.

- **Primary:** `"Montserrat"` lewat `--font-sans`; fallback `"Plus Jakarta Sans"`.
- **Angka display:** `"Inter"` lewat `--font-display` dengan `tnum`.
- **Fallback:** `ui-sans-serif, system-ui, -apple-system, sans-serif`.
- **Tabular numbers:** Inter mendukung `font-feature-settings: "tnum"`; aktifkan pada semua tabel, nominal, dan statistik agar kolom angka sejajar.
- **Label kontrol:** satu gaya untuk semua form — 11–12px uppercase, weight 700, tracking 0.14em, `--font-sans`. Jangan memakai `font-mono` untuk label atau nilai input; `SelectLine` saat ini memakai mono dan harus diselaraskan.
- **Stabilo:** `.highlight-stabilo` untuk satu frasa pada judul atau eyebrow. Jangan untuk angka, label tabel, atau isi sel.

| Level | Size | Weight | Warna |
|---|---|---|---|
| Display number | 38–56px | 800 | `--text-primary` |
| Page title | 24–28px | 700 | `--text-primary` |
| Eyebrow | 10–11px, uppercase, tracking 0.16em | 700 | `--text-secondary` |
| Section title | 16–18px | 600 | `--text-primary` |
| Section subtitle | 12px | 400 | `--text-muted` |
| Card label | 13–14px | 500 | `--text-secondary` |
| Body / table | 13px | 400–500 | `--text-primary` |
| Table body meta | 13px | 400 | `#374151` |
| Table header | 11–12px, uppercase, tracking 0.06em | 600 | `--text-secondary` |
| Nav label | 12–13px | 600 | `#374151` |
| Nav label aktif | 12–13px | 700 | `--text-primary` |
| Button / badge | 12–13px | 600–700 | Sesuai konteks |
| Link action | 13px | 600 | `--color-button` |

---

## 4. Layout & Navigation

### 4.1 Shell

```
+----------------------------------------------------------------------+
| TOPBAR h-18: logo | [ ADMIN ] / PROGRAM        tema  notifikasi  profil |
+----------------+-----------------------------------------------------+
| SIDEBAR w-56   |  Eyebrow                                           |
|                |  Judul halaman                    [Aksi utama]      |
| PENDAFTARAN    |                                                     |
|   Data Pendaftar|  Filter / pencarian                               |
| KATALOG        |  ┌───────────────────────────────────────────────┐  |
|   Program      |  │ Tabel / daftar                                 │  |
|   Batch        |  │                                               │  |
|   Artikel      |  └───────────────────────────────────────────────┘  |
+----------------+-----------------------------------------------------+
```

- Sidebar dan topbar tidak ikut di-scroll; area konten yang menggulir.
- Mobile: sidebar menjadi drawer dengan backdrop; tombol menu ada di topbar.
- Padding konten 24–32px; ritme vertikal eyebrow → judul 4–8px, judul → filter 20px, filter → tabel 16px.
- Halaman ringkasan memakai grid atas `1fr : 2fr : 1.5fr` (stat kecil : chart utama : donut) dan grid bawah `2fr : 1fr` (tabel : panel ringkas), gap 16–24px. Di bawah 1024px menjadi satu kolom.

### 4.2 Sidebar

- Grup menu mengikuti `privilege_groups`; fallback awal: **PENDAFTARAN** (Data Pendaftar) dan **KATALOG** (Program, Batch, Trainer, Artikel, Gallery).
- Grup label 10px uppercase, tracking 0.16em, warna `--text-muted`.
- Item setinggi 40px, padding horizontal 16px, ikon 16–18px, label 12–13px.
- Item aktif: garis kiri 3px `--text-primary` + `.highlight-stabilo` pada label, weight bold, `aria-current="page"`. Ini pola yang sudah dipakai shell sekarang.
- Hover: latar `--bg-page`, warna teks `--text-primary`; tinggi baris tidak berubah.
- Item yang tidak boleh dilihat peran tidak dirender, bukan hanya disembunyikan warnanya.

### 4.3 Topbar

- Logo Albana versi terang/gelap, garis pemisah vertikal, lalu breadcrumb `[ ADMIN ] / SEGMEN`.
- Kanan: toggle tema, notifikasi pending, avatar 32px, nama, chevron.
- Breadcrumb memakai teks 11px uppercase; segmen terakhir `--text-primary` weight 600.

### 4.4 Page Header

- Eyebrow opsional dalam kurung siku, judul halaman, lalu **satu** aksi utama.
- Aksi sekunder memakai tombol outline atau ikon; jangan dua tombol dengan aksi sama.
- Status halaman (mis. “LIVE”) memakai pill status §2.4, bukan warna acak.

### 4.5 Filter & Search

- Filter berbentuk pill dalam satu kontainer; tab aktif memakai latar status aktif, tab pasif transparan.
- Search mengisi sisa lebar, tinggi 44px, radius pill, ikon kaca pembesar, latar `--bg-well`.
- Select filter tinggi 44px, radius 12px.
- Di bawah 768px semua bertumpuk; filter dapat di-scroll horizontal.

---

## 5. Border Radius

| Komponen | Radius |
|---|---|
| Kartu | 16px |
| Panel tabel / chart | 20px |
| Topbar | 0px |
| Tombol | 14px (`--radius-lg`) |
| Search, filter, badge | 999px |
| Input, textarea, select form (style-line) | 0px — garis bawah |
| Menu/dropdown form | 12px |
| Avatar, tombol ikon | 50% |
| Thumbnail | 8px |
| Dropdown, popover | 12px |

---

## 6. Component Anatomy

### 6.1 Button

Gunakan primitif yang sudah ada, jangan membuat tombol baru: `front/components/ui/Button.tsx`.

- **Primary:** `variant="default"` — biru aksi §2.3 (`--color-button`), teks putih. Hanya satu per header/tahap. `variant="default"` membaca `--primary`; pada scope admin arahkan `--primary` ke `--color-button`, jangan menambah varian baru.
- **Secondary:** `variant="outline"`. **Ghost:** aksi dalam baris tabel. **Link:** navigasi teks.
- **Icon button:** `size="icon"`; wajib `aria-label` jika tanpa teks.
- **Destructive:** hanya untuk hapus/tutup paksa.
- **Disabled/loading:** `disabled` + spinner pada aksi yang menunggu. Jangan mengubah tinggi tombol.
- Radius mengikuti `rounded-lg` (`--radius-lg`, 14px); jangan menambahkan radius sendiri per halaman.
- Desktop tinggi 32–36px (`default`/`lg`); di ponsel aksi utama minimal 44px area sentuh.
- Tombol tidak memakai aksen pastel, gradient, atau indigo.

### 6.2 Form Controls — Shadcn + style-line

Wadah dan menu memakai primitif Shadcn yang sudah terpasang (`dialog.tsx`, `select.tsx`, `popover.tsx`, `table.tsx`, `badge.tsx`, `sonner.tsx`). Seluruh field form memakai `front/components/ui/style-line/`; jangan memakai `input.tsx`/`textarea.tsx` kotak untuk form baru.

| Data | Kontrol |
|---|---|
| Nama, angka, rupiah, jam | `InputLine` dengan `type`/`inputMode` yang sesuai |
| Uraian | `TextareaLine` |
| Pilihan tunggal / jamak | `SelectLine`, `MultiSelectLine`, `RadioGroupLine` |
| Tanggal, telepon, kota | `DatePickerLine`, `PhoneNumberLine`, `CityInputLine` |
| Boolean | Checkbox berlabel |

Semua kontrol memakai garis bawah (`border-b`), radius 0, latar transparan. Tinggi area sentuh minimal 44px di ponsel.

Anatomi satu field:

1. Label tetap dan dapat diklik, terhubung lewat `id`/`htmlFor`. `InputLine` saat ini belum mengaitkannya — perbaiki di komponen, bukan per halaman.
2. Penanda wajib (`*`) dan petunjuk singkat bila perlu.
3. Kontrol.
4. Pesan galat **tepat di bawah kontrol**, terhubung lewat `aria-describedby`.

Penempatan pesan:

- **Galat spesifik field:** di bawah field yang salah, garis field menjadi `--destructive`; fokuskan field pertama yang salah.
- **Galat umum:** bila bukan milik satu field (simpan gagal, koneksi, konflik versi), satu banner **di bawah judul dan di atas field pertama** — bukan toast.
- **Berhasil:** toast (`sonner`) — satu toast per aksi, bukan banner. Toast tidak dipakai untuk galat validasi.
- Galat tidak pernah menghapus isian.

Aturan:

- `aria-invalid="true"` hanya saat field benar-benar galat.
- Fokus terlihat: garis bawah biru 2px + ring 2px offset 2px; jangan `outline: none` tanpa pengganti.
- Tampilkan prefix “Rp” satu kali; simpan nilai sebagai integer.
- Tanggal dan jam sesi memakai WIB secara eksplisit.
- Di ponsel satu kolom. Di desktop pasangkan mulai/selesai sesi.
- Pertahankan nilai saat validasi gagal.
- Dialog yang dapat digulir: focus trap, Escape menutup, fokus kembali ke pemicu.
- Kontrol khusus (consent, file, editor) tetap memakai label, help, error, dan fokus yang setara.
- `SelectLine` memakai `font-mono`; ganti ke `--font-sans` agar sama dengan field lain.

> Renderer `CmsCollectionClient` saat ini memakai Input/Select/Textarea kotak. Migrasikan per tipe sesuai rencana §2.3; jangan menambah pemakaian baru untuk kontrol kotak.

### 6.3 Tabel & Daftar

- Pakai `front/components/ui/table.tsx`; panel radius 20px, border `--border-default`, tanpa shadow, `overflow: hidden`.
- Header: latar putih, hanya border bawah, teks 11–12px uppercase weight 600, warna `--text-secondary`.
- Sel: padding 16–24px; garis pemisah tipis `--border-default`; jangan memakai border ganda di baris terakhir.
- Baris: minimal 72px, hanya border bawah; hover `#F8F9FA` tanpa mengubah tinggi baris.
- Kolom identitas: avatar/inisial + nama + meta.
- Kolom angka: tabular, rata kanan bila berupa nominal.
- Kolom status: pill §6.4, bukan teks berwarna saja.
- Kolom aksi: ikon 32–36px, rata kanan; ikon tanpa teks wajib `aria-label`.
- Di bawah 768px tabel menjadi daftar kartu; jangan memaksa scroll horizontal untuk form.
- Status kosong, loading, dan galat dibedakan secara eksplisit. Daftar kosong tidak boleh terlihat seperti kegagalan baca.

### 6.4 Badge Status

- Pill 999px, dot 6px, teks 10–11px uppercase weight 600.
- Warna mengikuti §2.4. Sertakan kata status.
- Jangan memakai badge untuk aksi; badge bukan tombol.

### 6.5 Feedback & Status Simpan

| Keadaan | Tampilan |
|---|---|
| Belum tersimpan | Teks netral “Belum tersimpan” di dekat aksi |
| Menyimpan | “Menyimpan…” + spinner pada aksi; kontrol dinonaktifkan sementara |
| Tersimpan | Toast sukses “Perubahan tersimpan” + live region |
| Gagal validasi | Pesan di bawah tiap field; banner umum di bawah judul bila perlu |
| Gagal simpan / jaringan | Banner umum di atas form + aksi coba lagi; draf tetap ada |
| Konflik versi | “Artikel berubah di tab lain” + aksi muat ulang |

- Sukses selalu toast (`sonner` yang sudah terpasang), satu per aksi, tampil 4 detik.
- Galat tidak memakai toast; galat field tetap inline dan galat umum tetap banner.
- Umumkan hasil simpan lewat `role="status"` / live region.
- Jangan menampilkan sukses sebelum respons server.
- Galat koneksi tidak menghapus isian.

### 6.6 Dialog & Langkah

**Pilih wadah menurut panjang form:**

| Form | Wadah |
|---|---|
| Trainer, galeri, venue, partner, acara, member (≤ 12 field, tanpa editor) | Modal `dialog.tsx` |
| Batch (sesi berulang + pratinjau) | Halaman |
| Artikel (BlockNote) | Halaman |
| Rekap pendaftar | Modal / panel samping |

- Aturan: jika form butuh lebih dari satu layar, punya baris berulang, editor blok, atau pratinjau → halaman. Selain itu modal.
- Modal: `max-w-lg`, judul + deskripsi, badan dapat digulir, footer aksi tetap terlihat.
- Radius 16–20px, shadow level 3, latar kartu.
- Muncul 120–160 ms (opacity + translateY 4px); hormati `prefers-reduced-motion` dengan keadaan akhir langsung.
- Fokus awal ke judul atau field pertama; Escape menutup; fokus kembali ke pemicu.
- Langkah/wizard menampilkan kemajuan dan judul langkah; validasi hanya untuk langkah aktif.

### 6.7 Bukti Transfer lewat WhatsApp

Bukti tidak diunggah ke aplikasi. Alur yang berlaku: peserta transfer, lalu mengirim bukti ke WhatsApp admin Albana.

- Langkah bayar menampilkan rekening tujuan, nominal, dan sisa **sebelum** tombol kirim.
- Sediakan aksi salin nomor rekening dengan umpan balik “Tersalin”.
- Setelah form terkirim, tanda terima menampilkan ID pendaftaran dan tombol **“Kirim bukti via WhatsApp”** yang membuka `wa.me` dengan pesan terisi: ID, nama, program/batch, metode, nominal.
- Nomor resmi WhatsApp admin: **0857-1779-7637** (`wa.me/6285717797637`). Ambil dari satu sumber kanal kontak, bukan hardcode di komponen. Nomor komunitas `0878-2323-9575` bukan kanal admin Albana dan tidak dipakai di alur ini.
- Tampilkan nomor `0857-1779-7637` dan jam layanan di dekat tombol; jangan memakai file input untuk bukti.
- Admin mencocokkan pesan WhatsApp dengan ID pendaftaran, lalu menandai “Terverifikasi” di rekap.
- “Menunggu verifikasi” berarti bukti sudah dikirim tetapi belum diperiksa admin.
- Jangan menyimpan tangkapan bukti di storage publik dan jangan meminta peserta mengirim bukti dua kali.
- Bila peserta mengirim bukti sebelum menyelesaikan form, admin meminta ID pendaftaran dari tanda terima.

### 6.8 Program & Batch

**Daftar program**

- Sementara **statis, dua program**: **Public Speaking Series** dan **Basic to Advance**. Tidak ada aksi buat, ubah, atau hapus program.
- Sumber tunggal di `front/lib/server/program-showcase.ts`; hapus `DUMMY_PROGRAM_CARDS`. Slug, judul, ringkasan, varian, dan harga dasar ada di sana, dipetakan ke baris program hasil seed.
- Batch menaut ke id program hasil seed; tidak ada form program di admin.
- Tampilkan program beserta batch, sesi berikutnya, harga efektif, dan status buka.
- Batch dibuat dalam konteks program; operator tidak memilih program dua kali.

**Form program**

- Belum ada form program. Perubahan nama atau harga dilakukan lewat seed/migrasi sampai ada kebutuhan nyata.
- Bila nanti dibuka, wadahnya modal — bukan halaman.

**Form batch**

- Halaman, bukan modal: ada baris sesi berulang dan pratinjau.
- Field: nama batch, lokasi/alamat, sesi pertama WIB.
- Series: aksi **“Isi 4 pertemuan mingguan”** menyalin jam dan menambah 7 hari; tanggal tetap dapat diedit.
- Eksklusif: jam 08.30–18.00 WIB; tanggal dan jumlah hari diisi operator.
- Pratinjau jadwal sebelum simpan.
- Baris sesi baru muncul dengan animasi 120–160 ms; validasi menandai baris yang bentrok.

**Ringkasan batch**

- Tampilkan nama program, jadwal, harga normal/berlaku, DP, transfer penuh, dan status.
- “Simpan batch tertutup” untuk jadwal valid yang belum siap dijual.
- “Buka pendaftaran” hanya setelah rincian publik lengkap; tampilkan apa yang kurang dan tautkan ke field.
- Aturan buka yang sama dipakai tombol admin, kartu beranda, detail program, dan register.

### 6.9 Editor Artikel

- Halaman tulis/edit tersendiri, bukan dialog textarea.
- BlockNote dimuat lewat client wrapper dengan dynamic import dan SSR dimatikan; CSS dibatasi ke area tulis.
- Blok yang disediakan: paragraf, heading, daftar, kutipan, tautan, penekanan. Hanya tipe yang dapat ditampilkan pembaca.
- Menu slash dan toolbar; blok dapat dipindah dengan keyboard.
- Simpan JSON blok dan proyeksi teks `body` dalam satu transaksi.
- Artikel lama dikonversi ke blok di memori; perubahan ditulis hanya setelah penulis menyimpan.
- Tampilkan “Belum tersimpan”, “Menyimpan…”, dan hasil simpan §6.5.
- Lindungi perubahan saat meninggalkan editor atau saat versi berubah di tab lain.
- Draf disimpan eksplisit. Tanggal terbit pertama tidak berubah saat typo diperbaiki.
- Pratinjau memakai renderer publik di dalam akses admin.
- Kolom baca editor sekitar 64–70 karakter; teks 18–20px, line-height 1,65.

### 6.10 Rekap Pendaftar

- Daftar pendaftar terbaru di atas; buka satu baris untuk jawaban lengkap.
- Tampilkan batch, harga saat mendaftar, metode, nominal awal, dan sisa.
- Bukti transfer diterima lewat WhatsApp; rekap menampilkan ID pendaftaran dan status verifikasi untuk dicocokkan. Jangan menautkan gambar dari chat ke halaman publik.
- Aksi “Tandai terverifikasi” mencatat admin dan waktu.
- Status verifikasi memakai §2.4. Rekap lama tanpa bukti tetap ditampilkan.
- Jangan menampilkan identitas pendaftar lama saat menerima duplikat dari pengajuan lain.

### 6.11 Skeleton, Empty, Error

- **Skeleton:** meniru layout akhir; header tabel `#E2E5EA`, blok `#E9EBEF`; 5–6 baris; `aria-hidden="true"`, kontainer `aria-busy="true"`; pulse 1200 ms dan statis saat reduced motion. Jangan tampilkan jika data selesai di bawah ±300 ms.
- **Empty:** ikon/teks singkat + satu aksi yang relevan (mis. “Tambah batch”); jangan menawarkan aksi program yang memang statis.
- **Error:** pesan eksplisit + aksi coba lagi; jangan menyamarkan galat baca sebagai daftar kosong.

### 6.12 Kartu Statistik

- Kontainer: radius 16px, latar `--bg-card`, border tipis `--border-default`, padding 20–24px. Tanpa gradient dan tanpa shadow ganda.
- Label di atas angka: 13px weight 500, `--text-secondary`.
- Angka utama: Inter tabular 38–56px, weight 800, `--text-primary`; satu angka utama per kartu.
- Badge pertumbuhan: pill 999px, 11px weight 600. Positif memakai §2.4 Berhasil, negatif §2.4 Galat, netral §2.4 Draf. Jangan memakai lime atau salmon.
- Sparkline opsional: garis `--color-button` 2,5px tanpa isi, atau isi biru 12–20%. Bukan dekorasi tanpa data.
- Ikon opsional 16–20px, `--text-muted`, di kanan atas; jangan mengganti angka dengan ikon.

### 6.13 Kartu Chart

- Kontainer: radius 20px, latar `--bg-card`, border `--border-default`, padding 24px.
- Header: judul 16–18px weight 600 + subteks 12px `--text-muted`; filter opsional memakai Select Shadcn.
- Seri utama selalu biru aksi `#2F5C86`; pembanding sage 40%; segmen lain sand, sage, atau `--color-surface`. Jangan memakai hitam, navy `#1A1A2E`, atau lime.
- Grid horizontal `#F3F4F6` (gelap `#2A2E42`), hanya sumbu X yang diberi label; label 10–11px `#6B7280`.
- Bar radius 4px di atas. Area chart memakai garis biru 2,5px dan isi biru 12–20%.
- Tooltip memakai permukaan kartu + border, bukan panel hitam.
- Legend 12px `--text-secondary` dengan dot 8px; sediakan ringkasan teks untuk pembaca layar.
- Tanpa animasi masuk berulang saat data diperbarui; chart tidak mengubah tinggi panel.

### 6.14 Panel Ringkas

- Kontainer: radius 16px, latar `--bg-card`, border `--border-default`, header + daftar baris.
- Isi: batch berikutnya, pendaftar terbaru, atau ringkasan serupa; bukan produk e-commerce.
- Baris: identitas + meta di kiri, nilai/status di kanan; hover `#F8F9FA`, border bawah tipis.
- Maksimal 5 baris + tautan “Lihat semua”; status memakai pill §2.4.
- Angka rata kanan dan tabular; jangan memakai mini-chart dekoratif tanpa data nyata.

---

## 7. Elevation & Shadow

| Level | CSS | Penggunaan |
|---|---|---|
| 0 | `none` | Default |
| 1 | `0 1px 2px rgba(0,0,0,0.04)` | Kartu tanpa border |
| 2 | `0 4px 12px rgba(0,0,0,0.06)` | Dropdown, tooltip |
| 3 | `0 20px 60px rgba(0,0,0,0.10)` | Dialog |

Kartu memakai border tipis **atau** shadow level 1, tidak keduanya.

---

## 8. Spacing (Base 4px)

| Token | Nilai | Contoh |
|---|---|---|
| `space-1` | 4px | Ikon ke teks |
| `space-2` | 8px | Padding badge |
| `space-3` | 12px | Gap badge/tombol kecil |
| `space-4` | 16px | Padding kartu kecil, gap kartu |
| `space-5` | 20px | Padding standar kartu |
| `space-6` | 24px | Padding panel, gap section |
| `space-8` | 32px | Jarak grid utama |

---

## 9. Interactive States

| State | Efek |
|---|---|
| Hover tombol | Latar berubah, 100–120 ms |
| Hover baris | Latar `#F8F9FA`, 80 ms; tinggi tidak berubah |
| Hover nav | Latar `--bg-page`, teks `--text-primary` |
| Aktif nav | Garis kiri 3px + stabilo, bold, `aria-current="page"` |
| Fokus input | Garis bawah biru 2px + ring 2px, offset 2px |
| Klik tombol | `scale(0.98)`, 80 ms |
| Disabled | Opacity turun, tidak dapat diklik |
| Loading | Spinner pada aksi; konten lain tetap stabil |

---

## 10. Motion

| Interaksi | Gerak |
|---|---|
| Hover/fokus | Warna 100–120 ms |
| Dialog, langkah, baris sesi baru | Opacity + translateY 4px, 120–160 ms ease-out |
| Simpan/gagal | Pesan muncul 120 ms dan diumumkan |
| Loading | Satu indikator pada aksi; tabel/chart tidak melompat |

- Tidak ada animasi scroll, parallax, atau text reveal.
- `prefers-reduced-motion: reduce`: tampilkan keadaan akhir seketika; gunakan teks “Menyimpan…”.
- Transisi hanya pada properti yang berubah; jangan memakai transisi menyeluruh pada shell.
- Perubahan visual ini tidak memerlukan dependensi animasi.

---

## 11. Dark Mode Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#F2F4F7` | `#0F1117` |
| `--bg-card` | `#FFFFFF` | `#1A1D27` |
| `--bg-well` | `#F5F5F5` | `#22263A` |
| `--bg-sidebar` | `#FFFFFF` | `#1C1C1F` |
| `--text-primary` | `#111111` | `#F0F0F0` |
| `--text-secondary` | `#6B7280` | `#8B8FA8` |
| `--text-muted` | `#9CA3AF` | `#55596E` |
| `--border-default` | `#E5E7EB` | `#2A2E42` |
| Aksi utama | `#2F5C86` | `#D5E7FF` |
| Fokus | `#2F5C86` | `#D5E7FF` |
| Stabilo | `#FFE78A` | `rgba(116,135,87,0.45)` |
| `--chart-main` | `#2F5C86` | `#D5E7FF` |
| `--chart-secondary` | Sage 40% | Sage 30% |

`--accent-green` dan `--accent-red` adalah token lama; status memakai pasangan warna §2.4, bukan token ini. Jangan memakai lime `#BAFF6A` atau navy `#1A1A2E` untuk chart.

Toggle tema ada di area profil topbar. Preferensi disimpan di `localStorage`; default terang.

---

## 12. Responsive & Accessibility

- **360 px:** satu kolom; filter bertumpuk; tabel menjadi kartu; form dapat disimpan tanpa scroll horizontal.
- **Zoom 200%:** tidak ada konten terpotong; tombol tetap dapat dijangkau.
- **Keyboard:** semua kontrol dapat difokuskan; pilihan, dialog, Escape, dan pemulihan fokus diuji.
- **Label:** setiap kontrol punya label yang dapat diklik; help/error terhubung lewat `aria-describedby`.
- **Kontras:** teks normal minimal 4,5:1; indikator fokus minimal 3:1.
- **Status:** jangan hanya mengandalkan warna; sertakan kata.
- **Reduced motion:** hormati preferensi sistem.
- **Live region:** hasil simpan dan galat penting diumumkan sekali, tidak berulang.

---

## 13. Peta Modul

Sidebar mengikuti `privilege_groups`. Grup awal:

| Grup | Modul |
|---|---|
| **PENDAFTARAN** | Data Pendaftar |
| **KATALOG** | Program (statis), Batch, Trainer, Artikel, Galeri |

- Modul yang tidak berhubungan dengan alur program → batch → artikel → pendaftar tidak ditampilkan di sidebar: **Packages, Media, Voucher, Referral**, dan turunannya.
- Modul lain (Acara, Venue, Partner, Members, Admins, Settings) mengikuti pola visual yang sama bila tetap dipakai.
- Setiap modul memakai shell, tabel, form, badge, dan feedback yang sama. Jangan membuat pola visual baru per modul.

---

## 14. Verifikasi Penerapan

Periksa satu form sederhana, editor batch, editor artikel, dan satu tabel:

- [ ] Satu entri valid dan satu entri ditolak tampil benar.
- [ ] Label dapat diklik; help/error terbaca pembaca layar.
- [ ] Pilih lewat keyboard, Escape, dan pemulihan fokus berfungsi.
- [ ] Form 360 px dapat disimpan tanpa scroll horizontal.
- [ ] Tema terang/gelap dan reduced motion diperiksa.
- [ ] Hasil simpan diumumkan; tinggi tabel tidak berubah saat hover.
- [ ] Batch Series dapat dibuka dengan satu pasangan jam untuk empat sesi.
- [ ] Batch tanpa rekening tujuan tidak dapat dibuka.
- [ ] Artikel lama tetap terbaca; draf hilang dari daftar publik.
- [ ] Halaman pembaca tidak mengunduh editor (periksa Network).
- [ ] Program hanya dua dan tidak ada tombol buat/ubah program.
- [ ] Form pendek terbuka sebagai modal; batch dan artikel membuka halaman.
- [ ] Galat field muncul di bawah field; galat umum di atas field pertama; sukses memunculkan toast.
- [ ] Tombol biru `#2F5C86`, stabilo, dan label form memakai satu gaya; tidak ada indigo atau gradient sisa.
- [ ] Kartu statistik dan chart memakai biru aksi; tidak ada lime `#BAFF6A`, navy `#1A1A2E`, atau tooltip hitam.
- [ ] Tanda terima menampilkan ID dan tombol WhatsApp berisi pesan terisi ke nomor `0857-1779-7637`.
- [ ] Bukti transfer tidak disimpan di storage aplikasi.
- [ ] Ukuran JS admin sebelum/sesudah dibandingkan.

---

## 15. Keputusan & Asumsi

- Brand: **Albana Speech Academy**.
- Font admin: Montserrat; angka memakai Inter tabular; tidak ada serif dan tidak ada `font-mono` untuk label form.
- Aksi dan fokus: biru Albana `#2F5C86` (hover `#24486A`), mengikuti landing page; stabilo `#FFE78A`; aksen pastel §2.3. Status: §2.4.
- Wadah form: modal untuk form pendek, halaman untuk batch dan artikel.
- Komponen: Shadcn untuk dialog/tabel/menu/toast; `style-line` untuk field.
- Dashboard: kartu statistik radius 16px, kartu chart radius 20px, panel ringkas radius 16px; seri chart utama biru aksi dan badge pertumbuhan mengikuti §2.4.
- Program: statis dua — Public Speaking Series dan Basic to Advance — sampai ada kebutuhan CRUD.
- Bukti transfer: dikirim lewat WhatsApp admin `0857-1779-7637` (`wa.me/6285717797637`), bukan diunggah ke aplikasi.
- Shell: topbar `h-18`, sidebar `w-56`, konten `max-w-7xl`.
- Radius: kartu 16px, panel 20px.
- Bahasa antarmuka: Indonesia.
- Tema terang default; gelap opsional dan harus tetap kontras.
- Angka dan jadwal mengikuti data penawaran admin, bukan hardcode Batch 9.
- Perubahan visual tidak menambah dependensi animasi.
