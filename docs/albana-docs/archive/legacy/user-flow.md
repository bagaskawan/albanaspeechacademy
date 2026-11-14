# Alur sistem Albana

Dokumen ini merangkum alur **frontend pendaftaran** dan **backend admin** dari [rencana implementasi 11 November 2026](../plans/2026-11-11-admin-program-batch-article-registration.md). Diagram memakai Mermaid, sehingga tampil di Obsidian dan GitHub.

Beberapa langkah adalah **target rencana** dan belum ada di checkout saat ini: `POST /api/registrations`, tampilan rekening di wizard, tombol bukti WhatsApp, editor blok artikel, dan aksi verifikasi di admin. Status tiap bagian dicatat di [§7](#7-status-implementasi).

## 1. Peta alur

```mermaid
flowchart LR
  subgraph ADMIN["Admin"]
    A1["Program & Batch"] --> A2["Buka pendaftaran"]
    A3["Artikel"] --> A4["Terbitkan"]
    A5["Pendaftar"] --> A6["Verifikasi bukti WhatsApp"]
  end
  subgraph DB["Supabase"]
    D1[("programs / batches / sessions")]
    D2[("articles")]
    D3[("registrations")]
  end
  subgraph PUB["Situs publik"]
    P1["Beranda & detail program"] --> P2["Register"]
    P3["Daftar & baca artikel"]
  end
  A1 --> D1
  A2 --> D1
  D1 --> P1
  A3 --> D2
  D2 --> P3
  P2 --> D3
  D3 --> A5
```

Satu sumber data: admin menulis ke Supabase, lalu katalog publik dan halaman register membaca data yang sama. Tidak ada data contoh terpisah untuk kartu program.

## 2. Frontend registrasi

### 2.1 Titik masuk

- Kartu di beranda (`/#program-pilihan`) dan halaman detail `/program/[slug]`.
- Menu atau footer ke `/register`, lalu peserta memilih kelas.
- Tautan langsung `/register/[program]`, termasuk slug lama yang dipetakan ke slug kanonis.

Batch **tidak** dipilih lewat URL. Server memilih batch yang menerima pendaftaran: varian harus cocok, batch terbuka, dan sesi awal terdekat. Peserta melihat batch terpilih pada ringkasan sebelum mulai mengisi.

```mermaid
flowchart TD
  START(["Pengunjung"]) --> ENTRY{"Masuk dari mana?"}
  ENTRY -->|"Kartu beranda"| HOME["/#program-pilihan"]
  ENTRY -->|"Detail program"| DETAIL["/program/[slug]"]
  ENTRY -->|"Menu / footer"| REG["/register"]
  ENTRY -->|"Tautan langsung / lama"| DEEP["/register/[program]"]

  HOME --> DETAIL
  DETAIL --> DEEP
  REG --> PICK["Pilih kelas<br/>Series atau Eksklusif"]
  PICK --> DEEP

  DEEP --> RESOLVE["Server: readCatalog()<br/>readProgramRegistration()"]
  RESOLVE --> FOUND{"Program ditemukan?"}
  FOUND -->|"tidak"| NF["404"]
  FOUND -->|"ya"| BATCH{"pickAcceptingBatch()<br/>varian cocok · terbuka ·<br/>sesi terdekat"}
  BATCH -->|"katalog gagal"| FAIL["Pesan galat + Coba lagi"]
  BATCH -->|"tidak ada batch"| NOBATCH["Jadwal belum tersedia<br/>+ tautan detail program"]
  BATCH -->|"siap"| OVERVIEW["Ringkasan penawaran<br/>jadwal · venue · harga · DP"]
```

### 2.2 Wizard empat langkah

Peserta yang sudah login dapat memperoleh isian awal identitas dari profil member, tetapi login tidak wajib. Semua jawaban tetap dapat dikoreksi dan disimpan pada pendaftaran kelas, bukan pada profil.

```mermaid
flowchart TD
  OVERVIEW(["Batch siap"]) --> S1["Langkah 1 · Data diri<br/>identitas · kontak · sosial media"]
  S1 -->|"valid"| S2["Langkah 2 · Latar belakang & motivasi"]
  S2 -->|"valid"| S3["Langkah 3 · Informasi teknis & kesediaan"]
  S3 -->|"valid"| S4["Langkah 4 · Pembayaran<br/>lunas / DP · rekening · instruksi WhatsApp"]

  S2 -->|"kembali"| S1
  S3 -->|"kembali"| S2
  S4 -->|"kembali"| S3

  S1 -->|"tidak valid"| E1["Tandai field<br/>fokus field pertama"]
  S2 -->|"tidak valid"| E2["Tandai field<br/>fokus field pertama"]
  S3 -->|"tidak valid"| E3["Tandai field<br/>fokus field pertama"]
  S4 -->|"tidak valid"| E4["Pesan di bawah field<br/>fokus field pertama"]
  E1 --> S1
  E2 --> S2
  E3 --> S3
  E4 --> S4

  S4 --> SUBMIT["POST /api/registrations"]
  SUBMIT --> RESULT{"Respons"}
  RESULT -->|"200"| RECEIPT["Tanda terima<br/>ID · batch · nominal · menunggu verifikasi<br/>tombol kirim bukti WhatsApp"]
  RESULT -->|"409"| STALE["Muat ulang penawaran<br/>peserta periksa nominal"]
  RESULT -->|"422"| INVALID["Arahkan ke field bermasalah"]
  RESULT -->|"429 / jaringan"| RETRY["Isian tetap di memori<br/>coba lagi"]
  STALE --> S4
  RETRY --> SUBMIT
  RECEIPT --> WA["WhatsApp admin<br/>pesan berisi ID · nama · nominal"]
```

| Langkah | Inti isian | Catatan |
|---|---|---|
| 1 · Data diri | Nama, panggilan, domisili, WA, email, jenis kelamin, usia, profesi, instansi | Instansi menerima “Tidak ada”; sosial media opsional di akhir bagian |
| 2 · Latar belakang | Pernah mengikuti pelatihan, tujuan, tantangan | Redaksi mengikuti varian `series` / `exclusive` |
| 3 · Informasi teknis | Sumber informasi, kesediaan hadir | Jadwal aktual tampil di atas pilihan hadir |
| 4 · Pembayaran | Lunas / DP 20%, rekening tujuan, instruksi WhatsApp | Nominal dihitung ulang di server sebelum simpan; tidak ada unggah file |

Galat spesifik tampil di bawah field yang salah, galat umum di atas field pertama, dan sukses memakai toast.

### 2.3 Pembayaran dan tanda terima

- Rekening tujuan ditampilkan sebelum tombol kirim, dengan aksi salin nomor.
- Bukti **tidak diunggah** di aplikasi. Bukti dikirim ke WhatsApp admin Albana (**0857-1779-7637**, `wa.me/6285717797637`) setelah tanda terima.
- Tanda terima menampilkan ID pendaftaran dan tombol “Kirim bukti via WhatsApp” dengan pesan terisi (ID, nama, program/batch, metode, nominal).
- Admin mencocokkan ID pada pesan dengan rekap, lalu menandai terverifikasi. Status “menunggu verifikasi” berarti bukti belum diperiksa.

## 3. Backend admin · program dan batch

Operator masuk ke shell admin lewat guard `requireAdminMember()`. Semua halaman admin berbagi topbar, sidebar, dan area konten yang sama.

Alur target: **Program (dua statis) → Tambah batch → Periksa jadwal & biaya → Buka pendaftaran**. Operator tidak memilih program dua kali dan tidak membuat program baru.

```mermaid
flowchart TD
  LOGIN(["Operator"]) --> GUARD{"requireAdminMember()"}
  GUARD -->|"belum login"| LOGINPAGE["/login"]
  GUARD -->|"bukan admin"| PROFILE["/myprofile"]
  GUARD -->|"admin"| SHELL["Shell admin<br/>topbar + sidebar + konten"]

  SHELL --> NAV{"Menu sidebar"}
  NAV -->|"PENDAFTARAN"| PENDAFTAR["/admin/pendaftar"]
  NAV -->|"KATALOG"| PROGRAM["/admin/program"]
  NAV -->|"KATALOG"| BATCH["/admin/batch"]
  NAV -->|"KATALOG"| ARTIKEL["/admin/artikel"]
  NAV -->|"KATALOG"| LAIN["Trainer · Galeri"]

  PROGRAM --> PLIST["Daftar 2 program statis<br/>Public Speaking Series · Basic to Advance<br/>batch · sesi berikutnya · harga · status"]
  PLIST -->|"Tambah batch"| BCON["Program terpilih<br/>harga dasar dari sumber statis"]

  BCON --> BCREATE["Form batch<br/>nama · lokasi · sesi pertama WIB"]
  BCREATE --> KIND{"Varian"}
  KIND -->|"series"| WEEK["Isi 4 pertemuan mingguan<br/>+7 hari, jam disalin"]
  KIND -->|"exclusive"| DAY["08.30–18.00 WIB<br/>tanggal & jumlah hari manual"]
  WEEK --> PREVIEW["Pratinjau jadwal · harga · DP"]
  DAY --> PREVIEW

  PREVIEW --> VALID{"Validasi server/DB<br/>selesai > mulai · berurutan ·<br/>tidak tumpang tindih"}
  VALID -->|"gagal"| BCREATE
  VALID -->|"lolos"| SAVE["Simpan seluruh jadwal<br/>dalam satu transaksi"]
  SAVE --> READY{"Rincian publik lengkap?"}
  READY -->|"belum"| CLOSED["Simpan batch tertutup"]
  READY -->|"ya"| OPEN["Buka pendaftaran"]
  CLOSED -->|"lengkapi"| BCREATE
  OPEN --> PUBLIC["Katalog publik<br/>beranda · detail · /register"]

  ARTIKEL --> AFLOW["Alur artikel → §4"]
  PENDAFTAR --> RFLOW["Alur pendaftar → §5"]
```

Aturan buka yang sama dipakai tombol admin, kartu beranda, detail program, dan halaman register. Batch tertutup tidak boleh muncul sebagai penawaran yang bisa didaftari.

Program bersifat statis sampai ada kebutuhan CRUD. Form pendek (trainer, galeri, venue, partner) memakai modal; batch dan artikel memakai halaman.

## 4. Backend admin · artikel

Penulis menyusun artikel dalam blok, mempratinjau dengan renderer publik, lalu menyimpan draf atau menerbitkan.

```mermaid
flowchart TD
  A0(["Penulis"]) --> A1["/admin/artikel"]
  A1 --> A2{"Mulai dari"}
  A2 -->|"Tulis baru"| A3["Halaman tulis/edit"]
  A2 -->|"Buka draf"| A3

  A3 --> A4["Judul + ringkasan"]
  A4 --> A5["Blok: paragraf · heading · daftar<br/>kutipan · tautan · penekanan"]
  A5 --> A6["Pratinjau renderer publik"]
  A6 --> A7{"Simpan atau terbitkan"}

  A7 -->|"simpan draf"| A8["body_blocks + proyeksi body<br/>dalam satu transaksi"]
  A7 -->|"terbitkan"| A9["Tanggal terbit pertama dipertahankan"]

  A8 --> A1
  A9 --> A10["/artikel & /artikel/[slug]"]
  A9 --> A1
  A10 --> A11["Pembaca tetap jalan tanpa JS"]

  A5 -.->|"meninggalkan editor"| A12["Peringatan belum tersimpan"]
  A12 --> A5
```

Artikel lama tanpa blok tetap dibaca lewat renderer teks lama. Artikel yang dikembalikan ke draf hilang dari daftar dan URL publik.

## 5. Backend admin · pendaftar

```mermaid
flowchart TD
  R0(["Admin"]) --> R1["/admin/pendaftar"]
  R1 --> R2["Daftar pendaftar terbaru<br/>batch · nominal · waktu masuk"]
  R2 --> R3["Buka satu baris"]
  R3 --> R4["Jawaban lengkap<br/>identitas · tujuan · sumber · kesediaan"]
  R3 --> R5["Bukti di WhatsApp<br/>cocokkan ID pendaftaran"]
  R4 --> R6["Cocokkan dengan penawaran<br/>harga saat daftar · metode · sisa"]
  R5 --> R6
  R6 --> R7{"Cocok?"}
  R7 -->|"ya"| R8["Tandai terverifikasi<br/>catat admin + waktu"]
  R7 -->|"tidak"| R9["Hubungi peserta<br/>rekonsiliasi"]
```

Bukti transfer tidak disimpan di aplikasi. Admin mencocokkan pesan WhatsApp dengan ID pendaftaran di rekap. Rekap lama tanpa bukti tetap ditampilkan apa adanya.

## 6. Urutan kirim pendaftaran

```mermaid
sequenceDiagram
  autonumber
  participant U as Peserta
  participant W as Wizard
  participant API as /api/registrations
  participant R as receive-registration
  participant DB as Supabase
  participant WA as WhatsApp admin

  U->>W: isi 4 langkah
  W->>W: validasi per langkah
  W->>API: POST jawaban + versi penawaran
  API->>R: parse dan validasi
  R->>DB: baca batch dan harga aktif

  alt harga atau batch berubah
    DB-->>R: versi berbeda
    R-->>W: 409
    W-->>U: muat ulang penawaran
  else valid
    R->>DB: transaksi: insert pendaftaran
    DB-->>R: id atau duplikat
    R-->>W: 200 tanda terima + ID
    W-->>U: toast sukses + tombol WhatsApp
    U->>WA: kirim bukti + ID
    WA-->>U: konfirmasi admin
  end
```

Retry pengajuan yang sama mengembalikan tanda terima dan ID yang sama. Duplikat dari pengajuan lain tidak menimpa data atau membuka identitas pendaftar lama.

## 7. Status implementasi

| Bagian | Di checkout saat ini | Target rencana |
|---|---|---|
| Program & batch | Dua daftar dan dua dialog `CmsCollectionClient` terpisah | Dua program statis; batch dikelola dalam konteks program dengan sesi berurutan |
| Katalog publik | `catalog.ts` membaca relasi; beranda masih memakai `DUMMY_PROGRAM_CARDS` | Sumber statis dua program + batch dipakai beranda, detail, dan register |
| Wizard registrasi | 4 langkah; langkah bayar hanya metode + persetujuan | Rekening, salin nomor, sisa, instruksi WhatsApp, toast sukses |
| Intake | Form memanggil `POST /api/registrations`, handler belum ada | Handler + insert pendaftaran + ID untuk pesan WhatsApp |
| Artikel | `CmsCollectionClient` dengan textarea `body` | Halaman tulis/edit + editor blok + pembaca blok |
| Bukti transfer | Belum ada tampilan rekening/verifikasi | Dikirim lewat WhatsApp; admin menandai terverifikasi dari rekap |
| Form admin | Semua form di dialog generik | Modal untuk form pendek; halaman untuk batch dan artikel |

---

**Baca berikutnya:** [rencana implementasi](../plans/2026-11-11-admin-program-batch-article-registration.md) · [form 01 · Public Speaking Series](../../registration/forms/01-public-speaking-series.md) · [form 02 · Basic to Advance Eksklusif](../../registration/forms/02-speaker-training.md)
