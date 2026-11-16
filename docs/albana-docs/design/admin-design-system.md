# Design System: Albana Speech Academy — Admin CMS

> **Arah visual digantikan 16 November 2026** oleh [Pola UI admin — Monochrome Soft](admin-ui-patterns.md): kanvas putih monokrom + nada lembut, font Poppins, satu sidebar dengan grup dan sub-menu, tabel berkepala abu, tombol ikon bulat, kartu radius 32 px. Bagian warna (§2), tipografi (§3), layout (§4), radius (§5), bayangan (§7), gerak (§10), dan token gelap (§11) di bawah tidak berlaku lagi untuk admin. Aturan perilaku tetap berlaku: status simpan (§6.5), bukti transfer WhatsApp (§6.7), Program & Batch (§6.8), editor artikel (§6.9), rekap pendaftar (§6.10), serta responsif dan aksesibilitas (§12).

**Project ID:** albana-admin-01
**Aesthetic Style:** Blue Soft UI — ruang kerja Albana yang tenang, ringan, dan jelas.
**Referensi Visual:** Gambar dashboard terlampir untuk shell, pil filter, serta ritme kartu; gambar style guide untuk kelembutan permukaan. Isi, logo, dan warna contoh bukan aset Albana.
**Menggantikan:** pedoman admin sebelumnya.
**Rujukan alur:** [archive/legacy/user-flow.md](../archive/legacy/user-flow.md) · **Rujukan implementasi:** [rencana 11 November 2026](../archive/plans/2026-11-11-admin-program-batch-article-registration.md)

---

## 0. Filosofi Desain

Admin dipakai operator dan penulis, bukan pengunjung. Prinsipnya **"Data First, Decoration Never"**: operator harus langsung melihat apa yang perlu diisi, kapan pendaftaran dibuka, dan apakah perubahannya sudah tersimpan. Warna dipakai untuk tiga hal saja: aksi, status, dan satu aksen lembut per area. Bukan dekorasi tersebar.

| Aspek | Academy (publik) | Admin CMS |
|---|---|---|
| **Pengguna** | Publik / calon peserta | Internal / operator dan penulis |
| **Mood** | Bold, editorial | Clean, hangat, data-driven |
| **Navigasi** | Header publik | Topbar + sidebar desktop, drawer di ponsel |
| **Warna** | Biru-putih dengan stabilo biru pucat | Biru-putih dengan permukaan biru sangat muda; status punya warna semantik terbatas |
| **Corner** | Siku pada kerangka editorial, kecil pada kontrol | 16px pada kartu dan 20px pada panel |
| **Bayangan** | Tidak ada | Hanya pada lapisan terangkat (dropdown, dialog); lihat §7 |
| **Tipografi angka** | — | Number display besar, tabular |

> Kelompokkan pertanyaan menurut pekerjaan operator. Tempatkan ringkasan dan satu aksi utama di akhir tiap tahap.

---

## 1. Visual Theme & Atmosphere

- **Permukaan netral:** halaman `#F4F8FC`, kartu `#FFFFFF`, well/field `#EDF4FB`; bidang-bidang ini membentuk kedalaman bersama garis `#D8E4F0`.
- **Aksi jelas:** tombol utama memakai biru logo `#26599A` (hover `#163E70`), teks putih; ring fokus memakai biru yang sama. Warna status tidak dipakai untuk tombol utama.
- **Aksen lembut:** hanya turunan biru: `#DCEBFA`, `#EDF4FB`, dan putih. Warna status semantik dipakai seperlunya untuk sukses, peringatan, dan galat.
- **Stabilo:** biru pucat `#DCEBFA`, hanya untuk satu frasa pada judul pengantar. Navigasi aktif memakai latar biru lembut dan tanda aktif, bukan stabilo kuning.
- **Bukan AI slop:** tanpa indigo, ungu, gradient ungu-biru, glassmorphism, emoji sebagai ikon, hero di tengah, atau angka karangan. Satu aksen per area, sisanya netral; biru aksi konsisten dengan landing page.
- **Number display:** angka statistik dan nominal memakai Inter tabular 32–48px weight 700 agar mudah dipindai.
- **Shell:** topbar 64–72px, sidebar 64px pada desktop lebar dengan label lewat tooltip atau dapat melebar 224px; konten maksimum 1280px dengan padding 24–32px. Di layar sempit, sidebar menjadi drawer.
- **Kartu besar dan lembut:** radius 16px untuk kartu, 20px untuk panel.
- **Minimal chrome:** setiap elemen harus punya fungsi informasi. Tidak ada ilustrasi dekoratif di area kerja.

---

## 2. Color Palette & Roles

### 2.1 Background & Surface

| Nama | Token | Light | Dark |
|---|---|---|---|
| Page background | `--bg-page` | `#F4F8FC` | `#0D1B2D` |
| Card surface | `--bg-card` | `#FFFFFF` | `#15263D` |
| Search / toolbar well | `--bg-well` | `#EDF4FB` | `#1D3552` |
| Input form Soft UI | `--bg-well` | `#EDF4FB` atau putih pada panel berwarna | `#1D3552` atau `#15263D` pada panel berwarna |
| Sidebar | `--bg-sidebar` | `#FFFFFF` | `#10243F` |
| Row hover | `--bg-page` | `#F4F8FC` | `#1D3552` |
| Skeleton base | `--bg-well` | `#EDF4FB` | `#1D3552` |
| Disabled surface | `--bg-page` | `#F4F8FC` | `#0D1B2D` |

### 2.2 Teks & Hierarki

| Nama | Token | Light | Dark |
|---|---|---|---|
| Primary text | `--text-primary` | `#10243F` | `#F4F8FC` |
| Secondary text | `--text-secondary` | `#425A73` | `#B8CBE0` |
| Muted / placeholder | `--text-muted` | `#566B81` | `#9FB4CB` |
| Divider / border | `--border-default` | `#D8E4F0` | `#2D4763` |

### 2.3 Warna Aksi, Fokus & Aksen Lembut

| Peran | Light | Dark | Catatan |
|---|---|---|---|
| Aksi utama | `#26599A` teks putih | `#DCEBFA` teks `#10243F` | Satu aksi utama per header/tahap |
| Hover aksi utama | `#163E70` | `#FFFFFF` | Transisi 100–160 ms |
| Fokus | `#26599A`, ring 2px offset 2px | `#DCEBFA` | Kontras minimal 3:1 terhadap permukaan |
| Tautan aksi | `#26599A` bergaris bawah | `#DCEBFA` | Bukan untuk dekorasi |
| Stabilo | `#DCEBFA` | `#24486A` | Satu frasa per judul, dengan teks berkontras |

Biru aksi mengikuti [Academy Design System](academy-design-system.md): `#26599A`, hover `#163E70`. Nilai token CSS yang saat ini berbeda perlu diselaraskan pada tahap implementasi; spesifikasi ini tidak mengklaim CSS sudah berubah.

Aksen lembut hanya latar, bukan warna teks. Empat aksen pastel dari rancangan admin lama tidak menjadi identitas baru:

| Aksen | Token | Pakai | Light | Dark |
|---|---|---|---|---|
| Blue panel | `#DCEBFA` | Panel info, ringkasan, highlight | 100% | `#24486A` |
| Blue well | `#EDF4FB` | Pencarian, filter, panel tenang | 100% | `#1D3552` |
| White | `#FFFFFF` | Kartu, dialog, tabel | 100% | `#15263D` |

- Jika perlu tingkat antara, gunakan `color-mix()` dari token biru yang sama dan periksa kontras hasilnya.
- Teks di atas aksen tetap `--text-primary`; jangan memakai aksen sebagai warna teks.
- Maksimal satu aksen per area layar. Dua aksen hanya untuk membedakan dua status.
- Tombol utama memakai biru aksi, bukan aksen lembut. Badge galat/berhasil mengikuti warna status §2.4.
- Saat implementasi, petakan token ini ke scope admin pada `globals.css` dan komponen bersama; jangan menganggap token desain ini sudah tersedia di kode.

### 2.4 Warna Status Operasional

| Makna | Contoh label | Light · teks / latar | Dark · teks / latar |
|---|---|---|---|
| Draf | “Belum dibuka”, “Draf” | `#374151 / #F3F4F6` | `#E5E7EB / #27272A` |
| Aktif | “Sedang diedit”, “Aktif” | `#44503F / #EAF0E6` | `#D6E3D0 / #22301C` |
| Berhasil | “Tersimpan”, “Terbit”, “Lunas” | `#166534 / #DCFCE7` | `#BBF7D0 / #14532D` |
| Menunggu | “Menunggu pembayaran” | `#92400E / #FEF3C7` | `#FDE68A / #451A03` |
| Galat | “Jadwal bentrok”, “Gagal simpan” | `#991B1B / #FEE2E2` | `#FECACA / #450A0A` |

- Sertakan kata, bukan hanya warna.
- Badge memakai dot 6px di kiri label; dot mengikuti warna teks.
- Target kontras teks normal minimal 4,5:1.

### 2.5 Chart Colors

| Elemen | Warna |
|---|---|
| Bar utama | `#26599A` (dark: `#DCEBFA`) |
| Bar pembanding | `#8AB4DF` (dark: `#4A78A8`) |
| Segmen donut utama | `#26599A` (dark: `#DCEBFA`) |
| Segmen donut lain | `#8AB4DF`, `#BBD4ED`, `#EDF4FB`; label/legenda wajib |
| Garis target | `#163E70`, putus-putus |
| Grid chart | `#EDF4FB` (dark: `#2D4763`) |

---

## 3. Typography

> **Tidak ada font serif di admin.** Seluruh antarmuka memakai sans-serif.

- **Judul halaman, judul kartu, navigasi, tombol:** `"Plus Jakarta Sans"`, bobot 600–700.
- **Body, tabel, form, metadata:** `"Inter"`, bobot 400–600; bobot 700 hanya untuk angka display. Tabel bobot per kanal ada di [spesifikasi visual](visual-design.md).
- **Fallback:** `ui-sans-serif, system-ui, -apple-system, sans-serif`.
- **Tabular numbers:** Inter mendukung `font-feature-settings: "tnum"`; aktifkan pada semua tabel, nominal, dan statistik agar kolom angka sejajar.
- **Label kontrol:** Inter 13–14px, weight 600, kapitalisasi normal; uppercase kecil hanya untuk kelompok navigasi. Jangan memakai `font-mono` untuk label atau nilai input.
- **Stabilo:** biru pucat `#DCEBFA` untuk satu frasa pada judul pengantar; jangan untuk angka, label tabel, atau isi sel. Jika kelas `.highlight-stabilo` yang ada masih kuning, ganti tokennya saat implementasi.

| Level | Size | Weight | Warna |
|---|---|---|---|
| Display number | 32–48px, Inter tabular | 700 | `--text-primary` |
| Page title | 24–32px, Plus Jakarta Sans | 700 | `--text-primary` |
| Eyebrow | 10–11px, uppercase, tracking 0.16em | 700 | `--text-secondary` |
| Section title | 17–20px, Plus Jakarta Sans | 600–700 | `--text-primary` |
| Section subtitle | 12px | 400 | `--text-muted` |
| Card label | 13–14px | 500 | `--text-secondary` |
| Body / table | 14px, Inter | 400–500 | `--text-primary` |
| Table body meta | 13px | 400 | `--text-secondary` |
| Table header | 11–12px, uppercase, tracking 0.06em | 600 | `--text-secondary` |
| Nav label | 12–13px | 600 | `--text-secondary` |
| Nav label aktif | 12–13px | 700 | `--text-primary` |
| Button / badge | 12–13px | 600–700 | Sesuai konteks |
| Link action | 13px | 600 | `--color-button` |

---

## 4. Layout & Navigation

### Penerjemahan gambar referensi ke CMS Albana

Gambar dashboard terlampir menunjukkan panel besar berbingkai, rail ikon, header sederhana, filter status berbentuk pil, dan kartu putih berjarak rapat. Adaptasikan susunannya untuk tugas Albana: **status pendaftar / batch / konten yang perlu ditindak**. Nama merek, contoh offer, hijau mint, dan angka pada gambar tidak dipindahkan ke CMS.

| Bagian | Aturan CMS |
|---|---|
| Bingkai aplikasi | Satu shell putih di atas halaman biru sangat muda; garis `1px #D8E4F0`, tanpa bayangan. Jangan menambah bingkai kedua di setiap modul. |
| Rail/sidebar | Desktop lebar boleh ringkas 64px dengan ikon dan tooltip yang dapat diakses keyboard. Untuk menu panjang atau ukuran menengah, sidebar 224px berlabel lebih jelas. |
| Header | Judul halaman dan breadcrumb kiri; aksi penting, notifikasi, profil kanan. Header tidak memuat banyak tombol setara. |
| Filter | Tab/pil menampilkan status dan jumlah yang nyata; keadaan aktif memakai biru pucat dengan teks biru tua. |
| Kartu daftar | Putih, radius 16px, border halus, padding 16–20px; metadata berkelompok; satu aksi primer per kartu. |
| Kepadatan | Tiga kolom hanya bila label dan aksi tetap terbaca pada lebar kartu sekitar 300px; selain itu dua atau satu. Tabel digunakan untuk data yang perlu perbandingan kolom. |
| Bayangan | Shell dan kartu memakai border, bukan bayangan. Bayangan hanya untuk dropdown, tooltip, dan dialog sesuai §7. |

Soft UI di sini berarti permukaan tenang, tepi lembut, kedalaman tipis, dan keadaan yang terbaca. Jangan membuat kontrol neumorphic dengan kontras rendah atau bayangan cekung yang menyamarkan batas.

### 4.1 Shell

Diagram di bawah menunjukkan hubungan area, bukan ukuran sidebar wajib; gunakan aturan responsif di atas untuk memilih rail ringkas atau sidebar berlabel.

```
+----------------------------------------------------------------------+
| TOPBAR h-18: logo | [ ADMIN ] / PROGRAM        tema  notifikasi  profil |
+----------------+-----------------------------------------------------+
| SIDEBAR        |  Eyebrow                                           |
|                |  Judul halaman                    [Aksi utama]      |
| PENDAFTARAN    |                                                     |
|   Data Pendaftar|  Filter / pencarian                               |
| KATALOG        |  ┌───────────────────────────────────────────────┐  |
|   Program      |  │ Tabel / daftar                                 │  |
|   Batch        |  │                                               │  |
|   Artikel      |  └───────────────────────────────────────────────┘  |
+----------------+-----------------------------------------------------+
```

- Sidebar dan topbar tetap terlihat saat konten panjang digulir; jangan membuat scroll bertingkat yang menjebak wheel atau keyboard.
- Mobile: sidebar menjadi drawer dengan backdrop; tombol menu ada di topbar.
- Padding konten 24–32px; ritme vertikal eyebrow → judul 4–8px, judul → filter 20px, filter → tabel 16px.
- Halaman ringkasan menempatkan metrik terpenting lebih dulu, lalu grafik dan daftar tindakan; grid 2–3 kolom hanya bila masing-masing panel tetap terbaca. Di bawah 1024px menjadi satu atau dua kolom sesuai isi.

### 4.2 Sidebar

- Grup menu mengikuti `privilege_groups`; fallback awal: **PENDAFTARAN** (Data Pendaftar) dan **KATALOG** (Program, Batch, Trainer, Artikel, Gallery).
- Grup label 10px uppercase, tracking 0.16em, warna `--text-muted`.
- Item setinggi 40px, padding horizontal 16px, ikon 16–18px, label 12–13px.
- Item aktif: latar `#DCEBFA`, teks `#163E70`, garis penanda biru 3px, weight 700, `aria-current="page"`. Saat sidebar ringkas, tampilkan nama item melalui tooltip saat hover/fokus.
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

- Filter berbentuk pill dalam satu kontainer; tab aktif memakai latar biru pucat `#DCEBFA` dengan teks `#163E70`, tab pasif transparan.
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
| Input, textarea, select form Soft UI | 12px — bidang terisi dan batas terlihat |
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

### 6.2 Form Controls — Soft UI admin

Wadah, menu, dan kontrol memakai primitif yang sudah tersedia (`input.tsx`, `textarea.tsx`, `select.tsx`, `dialog.tsx`, `popover.tsx`, `sonner.tsx`) sesuai kebutuhan datanya. Terapkan gaya pada scope admin agar kontrol publik tetap bergaris bawah. Folder `front/components/ui/style-line/` adalah pola untuk formulir academy, bukan acuan visual baru untuk admin. Migrasi komponen lama dilakukan per halaman saat bagian itu dikerjakan, tanpa mengganti logika validasi atau bentuk data.

| Data | Kontrol admin |
|---|---|
| Nama, angka, rupiah, jam | Input terisi; gunakan `type` dan `inputMode` yang sesuai. |
| Uraian | Textarea terisi dengan tinggi mengikuti kebutuhan. |
| Pilihan tunggal / jamak | Select atau popover terisi; daftar pilihan berada pada permukaan putih/gelap dengan border. |
| Tanggal, telepon, kota | Kontrol khusus yang tetap memakai bidang terisi dan radius 12px. |
| Boolean | Checkbox berlabel dengan area klik yang memadai. |

Bidang field memakai `--bg-well` atau putih bila berada di panel berwarna, border `1px --border-default`, radius 12px, dan tinggi minimum 44px. Pada tema gelap gunakan padanan permukaan §2.1. Label, nilai, petunjuk, dan galat memakai Inter; judul grup dan tombol memakai Plus Jakarta Sans. Soft UI di sini berarti permukaan lembut dengan batas yang jelas, bukan efek cekung atau bayangan ganda.

Anatomi satu field:

1. Label tetap dan dapat diklik, terhubung lewat `id`/`htmlFor`.
2. Penanda wajib (`*`) dan petunjuk singkat bila perlu.
3. Kontrol.
4. Pesan galat **tepat di bawah kontrol**, terhubung lewat `aria-describedby`.

Penempatan pesan:

- **Galat spesifik field:** di bawah field yang salah, border field menjadi `--destructive`; fokuskan field pertama yang salah.
- **Galat umum:** bila bukan milik satu field (simpan gagal, koneksi, konflik versi), satu banner **di bawah judul dan di atas field pertama** — bukan toast.
- **Berhasil:** toast (`sonner`) — satu toast per aksi, bukan banner. Toast tidak dipakai untuk galat validasi.
- Galat tidak pernah menghapus isian.

Aturan:

- `aria-invalid="true"` hanya saat field benar-benar galat.
- Fokus terlihat: border biru dan ring 2px dengan offset 2px; jangan `outline: none` tanpa pengganti.
- Tampilkan prefix “Rp” satu kali; simpan nilai sebagai integer.
- Tanggal dan jam sesi memakai WIB secara eksplisit.
- Di ponsel satu kolom. Di desktop pasangkan mulai/selesai sesi.
- Pertahankan nilai saat validasi gagal.
- Dialog yang dapat digulir: focus trap, Escape menutup, fokus kembali ke pemicu.
- Kontrol khusus (consent, file, editor) tetap memakai label, help, error, dan fokus yang setara.
- Jika komponen lama `style-line` masih digunakan oleh halaman admin, pertahankan perilakunya sampai halaman tersebut dialihkan ke kontrol Soft UI. Jangan mengubah komponen bersama hanya demi satu layar admin; periksa pemakaian di pendaftaran publik terlebih dahulu.

> `CmsCollectionClient` masih mengimpor sebagian kontrol `style-line`. Gaya Soft UI saat ini diterapkan pada scope `.admin-shell`; saat komponen tersebut disentuh lagi, pindahkan presentasinya ke kontrol admin tanpa mengubah validasi dan data. Jangan mengubah `style-line` bersama karena formulir publik tetap memerlukannya.

### 6.3 Tabel & Daftar

- Pakai `front/components/ui/table.tsx`; panel radius 20px, border `--border-default`, tanpa shadow, `overflow: hidden`.
- Header: latar putih, hanya border bawah, teks 11–12px uppercase weight 600, warna `--text-secondary`.
- Sel: padding 16–24px; garis pemisah tipis `--border-default`; jangan memakai border ganda di baris terakhir.
- Baris: minimal 72px, hanya border bawah; hover `--bg-page` tanpa mengubah tinggi baris.
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
| Program (materi berulang) | Halaman |
| Batch (sesi berulang + pratinjau) | Halaman |
| Artikel (BlockNote) | Halaman |
| Rekap pendaftar | Modal / panel samping |

- Aturan: jika form butuh lebih dari satu layar, punya baris berulang, editor blok, atau pratinjau → halaman. Selain itu modal.
- Modal: `max-w-lg`, judul + deskripsi, badan dapat digulir, footer aksi tetap terlihat.
- Radius 16–20px, shadow level 3, latar kartu.
- Muncul mengikuti §10: 200–300 ms, opacity + translasi 8–12px; hormati `prefers-reduced-motion` dengan keadaan akhir langsung.
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
- Status mengikuti apa yang diketahui sistem, bukan apa yang diharapkan. Membuka tautan WhatsApp tidak membuktikan pesan terkirim, jadi tidak mengubah status.

  | `invoice.status` | Label | Arti |
  |---|---|---|
  | `pending` | Menunggu pembayaran | Belum ada verifikasi admin; bukti mungkin sudah atau belum dikirim. |
  | `verified` | Terverifikasi | Admin sudah mencocokkan bukti dengan tagihan. |
  | `rejected` | Perlu ditinjau ulang | Admin menolak bukti; peserta diarahkan menghubungi admin. |

- Status “bukti diterima” belum ada di data. Jangan menampilkannya sebelum ada kolom dan aksi admin yang mencatatnya.
- Jangan menyimpan tangkapan bukti di storage publik dan jangan meminta peserta mengirim bukti dua kali.
- Bila peserta mengirim bukti sebelum menyelesaikan form, admin meminta ID pendaftaran dari tanda terima.

### 6.8 Program & Batch

**Daftar program**

- Program dikelola admin di `/admin/program`: buat, ubah, hapus. Sumber data tabel `programs`; tidak ada daftar program statis di kode.
- Kolom daftar: nama program, deskripsi, harga promo, harga coret, materi, aksi. Harga kosong tampil “—”, bukan Rp0.
- Satu aksi utama “Tambah Program” di header; di ponsel menjadi tombol mengambang dengan `aria-label`.
- Daftar kosong: “Belum ada program. Tambahkan program lalu isi detailnya.”
- Batch dibuat dalam konteks program; operator tidak memilih program dua kali.
- Hapus program meminta konfirmasi dan menyebut batch yang ikut terdampak.

**Form program**

- Halaman (`/admin/program/create`), bukan modal: memuat nama, deskripsi, harga, dan daftar materi berulang.
- Slug mengikuti nama program secara otomatis; operator tidak mengetiknya.
- Harga memakai aturan rupiah §6.2: prefix “Rp” satu kali, nilai disimpan sebagai integer.

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

- **Skeleton:** meniru layout akhir; header tabel `--border-default`, blok `--bg-well`; 5–6 baris; `aria-hidden="true"`, kontainer `aria-busy="true"`; pulse 1200 ms dan statis saat reduced motion. Jangan tampilkan jika data selesai di bawah ±300 ms.
- **Empty:** ikon/teks singkat + satu aksi yang relevan (mis. “Tambah batch” atau “Tambah Program”).
- **Error:** pesan eksplisit + aksi coba lagi; jangan menyamarkan galat baca sebagai daftar kosong.

### 6.12 Kartu Statistik

- Kontainer: radius 16px, latar `--bg-card`, border tipis `--border-default`, padding 20–24px. Tanpa gradient dan tanpa shadow ganda.
- Label di atas angka: 13px weight 500, `--text-secondary`.
- Angka utama: Inter tabular 32–48px, weight 700, `--text-primary`; satu angka utama per kartu.
- Badge pertumbuhan: pill 999px, 11px weight 600. Positif memakai §2.4 Berhasil, negatif §2.4 Galat, netral §2.4 Draf. Jangan memakai lime atau salmon.
- Sparkline opsional: garis `--color-button` 2,5px tanpa isi, atau isi biru 12–20%. Bukan dekorasi tanpa data.
- Ikon opsional 16–20px, `--text-muted`, di kanan atas; jangan mengganti angka dengan ikon.

### 6.13 Kartu Chart

- Kontainer: radius 20px, latar `--bg-card`, border `--border-default`, padding 24px.
- Header: judul 16–18px weight 600 + subteks 12px `--text-muted`; filter opsional memakai Select Shadcn.
- Seri utama biru aksi `#26599A`; pembanding `#8AB4DF`; segmen lain memakai turunan biru §2.5 dengan label yang jelas. Jangan memakai hijau mint atau lime hanya untuk meniru gambar referensi.
- Grid horizontal `#EDF4FB` (gelap `#2D4763`), hanya sumbu X yang diberi label; label 10–11px `--text-muted`.
- Bar radius 4px di atas. Area chart memakai garis biru 2,5px dan isi biru 12–20%.
- Tooltip memakai permukaan kartu + border, bukan panel hitam.
- Legend 12px `--text-secondary` dengan dot 8px; sediakan ringkasan teks untuk pembaca layar.
- Tanpa animasi masuk berulang saat data diperbarui; chart tidak mengubah tinggi panel.

### 6.14 Panel Ringkas

- Kontainer: radius 16px, latar `--bg-card`, border `--border-default`, header + daftar baris.
- Isi: batch berikutnya, pendaftar terbaru, atau ringkasan serupa; bukan produk e-commerce.
- Baris: identitas + meta di kiri, nilai/status di kanan; hover `--bg-page`, border bawah tipis.
- Maksimal 5 baris + tautan “Lihat semua”; status memakai pill §2.4.
- Angka rata kanan dan tabular; jangan memakai mini-chart dekoratif tanpa data nyata.

---

## 7. Elevation & Shadow

| Level | CSS | Penggunaan |
|---|---|---|
| 0 | `none` | Default |
| 1 | `0 1px 2px rgba(16,36,63,0.04)` | Kartu tanpa border |
| 2 | `0 4px 12px rgba(16,36,63,0.06)` | Dropdown, tooltip |
| 3 | `0 20px 60px rgba(16,36,63,0.10)` | Dialog |

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
| Hover baris | Latar `--bg-page`, 80 ms; tinggi tidak berubah |
| Hover nav | Latar `--bg-page`, teks `--text-primary` |
| Aktif nav | Latar biru pucat + garis kiri 3px, bold, `aria-current="page"` |
| Fokus input | Border biru + ring 2px, offset 2px; bidang tetap terisi |
| Klik tombol | `scale(0.98)`, 80 ms |
| Disabled | Opacity turun, tidak dapat diklik |
| Loading | Spinner pada aksi; konten lain tetap stabil |

---

## 10. Motion

Prinsip dari [animate](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md) dan [animation-performance](https://github.com/emilkowalski/skills/blob/main/skills/animation-performance/SKILL.md): gerak dipakai untuk umpan balik atau perubahan ruang yang perlu dijelaskan; aksi yang sering diulang harus terasa segera. Perintah `npx skills@latest add emilkowalski/skills` menyediakan sumber skill, bukan dependensi yang diperlukan untuk CMS.

| Interaksi | Gerak | Durasi awal |
|---|---|---:|
| Hover/press tombol | Warna, border, atau bayangan tipis; tidak menggeser layout | 100–160 ms |
| Filter/tab | Latar dan indikator aktif bergerak singkat | 150–220 ms |
| Tooltip/popover kecil | Fade + translasi maksimum 4px | 125–200 ms |
| Dropdown/select | Fade + translasi maksimum 6px | 150–250 ms |
| Dialog/drawer | Opacity + translasi 8–12px, fokus berpindah segera | 200–300 ms |
| Toast simpan berhasil | Fade ringan; status diumumkan ke pembaca layar. Galat memakai inline/banner §6.5, bukan toast | 150–220 ms |
| Skeleton/loading | Satu indikator stabil pada area yang berubah | Tanpa loop mencolok |

Masuk/keluar memakai `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`; perpindahan indikator memakai `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Gunakan CSS transition untuk kontrol yang bisa dipicu berulang. Jangan menganimasikan setiap baris tabel saat filter, input yang diketik, perubahan angka, atau tugas berfrekuensi tinggi. Tidak ada parallax, text reveal, atau scroll animation di area kerja. Hindari `transition: all`, gerak pada `width`/`height`/`top`/`left`, dan `will-change` pada seluruh kartu.

Untuk `prefers-reduced-motion: reduce`, hilangkan translasi dan smooth scroll; tampilkan keadaan akhir seketika atau fade singkat bila membantu pemahaman. Efek hover bergerak hanya untuk pointer yang benar-benar mendukung hover. Validasi rasa dan kelancaran di perangkat ponsel kelas menengah; respons simpan harus jelas meski animasi dimatikan.

---

## 11. Dark Mode Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#F4F8FC` | `#0D1B2D` |
| `--bg-card` | `#FFFFFF` | `#15263D` |
| `--bg-well` | `#EDF4FB` | `#1D3552` |
| `--bg-sidebar` | `#FFFFFF` | `#10243F` |
| `--text-primary` | `#10243F` | `#F4F8FC` |
| `--text-secondary` | `#425A73` | `#B8CBE0` |
| `--text-muted` | `#566B81` | `#9FB4CB` |
| `--border-default` | `#D8E4F0` | `#2D4763` |
| Aksi utama | `#26599A` | `#DCEBFA` |
| Fokus | `#26599A` | `#DCEBFA` |
| Stabilo | `#DCEBFA` | `#24486A` |
| `--chart-main` | `#26599A` | `#DCEBFA` |
| `--chart-secondary` | `#8AB4DF` | `#4A78A8` |

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
| **KATALOG** | Program, Batch, Trainer, Artikel, Galeri |

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
- [ ] Program dapat dibuat, diubah, dan dihapus; slug terisi otomatis; daftar kosong menampilkan aksi “Tambah Program”.
- [ ] Form pendek terbuka sebagai modal; program, batch, dan artikel membuka halaman.
- [ ] Galat field muncul di bawah field; galat umum di atas field pertama; sukses memunculkan toast.
- [ ] Tombol biru `#26599A`, stabilo biru pucat, dan label form memakai satu gaya; tidak ada aksen pastel lama atau gradient sisa.
- [ ] Kartu statistik dan chart memakai biru aksi; tidak ada lime `#BAFF6A`, navy `#1A1A2E`, atau tooltip hitam.
- [ ] Tanda terima menampilkan ID dan tombol WhatsApp berisi pesan terisi ke nomor `0857-1779-7637`.
- [ ] Bukti transfer tidak disimpan di storage aplikasi.
- [ ] Ukuran JS admin sebelum/sesudah dibandingkan.

---

## 15. Keputusan & Asumsi

- Brand: **Albana Speech Academy**.
- Font admin: Plus Jakarta Sans untuk judul dan kontrol utama; Inter untuk body/form/data dan angka tabular; tidak ada serif atau `font-mono` untuk label form.
- Aksi dan fokus: biru Albana `#26599A` (hover `#163E70`); stabilo `#DCEBFA`; permukaan biru lembut §2.3. Status: §2.4.
- Wadah form: modal untuk form pendek, halaman untuk program, batch, dan artikel.
- Komponen: primitif yang sudah ada untuk dialog/tabel/menu/toast; field admin memakai Soft UI terisi dengan radius 12px. `style-line` dipakai pada formulir academy.
- Dashboard: kartu statistik radius 16px, kartu chart radius 20px, panel ringkas radius 16px; seri chart utama biru aksi dan badge pertumbuhan mengikuti §2.4.
- Program: CRUD di `/admin/program`, data dari tabel `programs`.
- Bukti transfer: dikirim lewat WhatsApp admin `0857-1779-7637` (`wa.me/6285717797637`), bukan diunggah ke aplikasi.
- Shell: topbar 64–72px, sidebar 64px ringkas atau 224px berlabel, konten maksimum 1280px.
- Radius: kartu 16px, panel 20px.
- Bahasa antarmuka: Indonesia.
- Tema terang default; gelap opsional dan harus tetap kontras.
- Angka dan jadwal mengikuti data penawaran admin, bukan hardcode Batch 9.
- Perubahan visual tidak menambah dependensi animasi.
