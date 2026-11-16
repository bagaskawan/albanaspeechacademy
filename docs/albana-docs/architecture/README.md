# Peta menu dan alur data Albana Speech Academy

**Status:** rancangan navigasi dan pembacaan kode sebelum pembersihan 15 November 2026. Bagian yang menyebut rute komunitas, `members`, atau `privilege_*` adalah catatan historis. Skema dan akses admin terkini ada di [skema database](../data/database-schema.md) dan `front/lib/albana-routes.ts`. Diagram bukan bukti bahwa deployment atau semua alur browser telah diverifikasi.

## Diagram

1. [Struktur menu](menu-structure.html) — peta kanal publik dan kelompok kerja CMS.
2. [Struktur menu backend yang disarankan](admin-menu-structure.html) — kelompok sidebar khusus Albana.
3. [Alur input konten dan media](cms-data-flow.html) — jalur tulis langsung melalui SDK, jalur unggah server, status terbit, dan pembacaan publik.
4. [Flowchart backend pendaftaran](registration-backend-flow.html) — validasi, RPC transaksional, respons gagal, dan tanda terima.

Keempatnya berupa HTML mandiri dengan SVG yang dapat diperbesar tanpa kehilangan ketajaman. Buka di browser; pada layar sempit, gulir **di dalam** diagram. Warna dan font mengacu ke [spesifikasi visual Albana](../design/visual-design.md): biru `#26599A`, navy `#10243F`, putih, Plus Jakarta Sans untuk judul, Inter untuk isi.

## Menu publik

| Kelompok | Halaman atau bagian | Tujuan | Keadaan kode |
|---|---|---|---|
| Beranda | `/` — hero, program, proses latihan, cara ngajar, Alan, trainer, dokumentasi, format, kontak | Memahami manfaat, bukti visual, dan pilihan tindakan | Ada; foto hero dan beberapa seksi masih dummy berlabel. |
| Program | `/#program-pilihan`, `/program/[slug]` | Membandingkan program, materi, status batch, jadwal, dan biaya terbit | Ada. Header saat ini hanya menautkan Program, Trainer, dan Kontak. |
| Pendaftaran | `/register/[program]` | Mengisi formulir academy bergaris bawah untuk batch yang dipilih server | Ada; `/register` mengarah ke program awal. |
| Konfirmasi | `/register/konfirmasi/[token]` | Melihat tagihan dan petunjuk mengirim bukti lewat WhatsApp | Ada; penerimaan formulir belum berarti pembayaran terverifikasi. |
| Bacaan | `/artikel`, `/artikel/[slug]` | Membaca artikel yang diterbitkan | Ada; tautan Artikel masih disembunyikan di header. |
| Kontak | `/#kontak` | Konsultasi kelas individu atau in-house | Ada. |

**Usulan navigasi publik yang ringkas:** Program · Cara belajar · Trainer · Dokumentasi · Artikel · Kontak, dengan satu CTA **Lihat jadwal**. Tautan Artikel muncul setelah konten terbit tersedia. Menu ponsel memuat tujuan yang sama. Hero memakai media statis sementara; **tidak ada menu CMS hero** sampai pemilik meminta media dinamis. Usulan ini belum mengubah kode navigasi.

## Menu CMS Albana

Peta di bawah adalah **susunan yang disarankan**, bukan klaim bahwa semua tautannya sudah berada di sidebar. [Sidebar kode](<../../../front/app/(admin)/admin/layout.tsx>) saat ini hanya mengelompokkan **Pendaftaran** dan **Katalog**; beberapa rute lama dari proyek komunitas masih ada dalam aplikasi. Visibilitas menu tidak menggantikan pemeriksaan otorisasi pada route, action, API, dan database.

### Struktur sidebar yang disarankan

1. **Dashboard** — ringkasan yang dapat ditindaklanjuti: batch mendatang, pendaftar baru, tagihan menunggu pemeriksaan, dan konten yang belum terbit. Tampilkan data nyata saja; grafik analitik bukan kebutuhan awal.
2. **Operasional**
   - **Pendaftar Albana** — daftar, detail jawaban, program/batch pilihan, dan status tindak lanjut. Harus dialihkan dari tabel `registrations` lama ke `academy_registrations` sebelum dianggap siap.
   - **Tagihan & pembayaran** — tagihan awal/pelunasan, nominal transfer dengan kode unik, keputusan verifikasi/tolak setelah bukti WhatsApp diperiksa. Jangan membuat tombol “lunas” hanya berdasarkan unggahan atau pesan masuk.
3. **Kelas & penawaran**
   - **Program** — deskripsi, manfaat, materi, harga dasar, dan status terbit.
   - **Batch & jadwal** — sesi, lokasi, harga/DP yang berlaku, serta status buka pendaftaran. Sesi tetap diedit **di dalam** Batch; tidak perlu menu Sesi terpisah.
   - **Bundling** — pasangan penawaran dan harga; tampil hanya bila benar-benar dipakai.
   - **Trainer** — profil, keahlian, dan foto yang disetujui.
4. **Konten website**
   - **Profil akademi** — identitas, metode belajar, dan keterangan yang muncul di beranda; usulan layar khusus setelah struktur data aktif diaudit. Profil Alan tetap dikelola pada Trainer agar tidak ada dua sumber bio.
   - **Artikel** — daftar, editor, draf/terbit.
   - **Media & dokumentasi** — satu label navigasi dengan dua tampilan: **Galeri beranda** (`/admin/galeri`) dan **Media per program/batch** (`/admin/media`). Data dan proses unggahnya tetap berbeda sampai ada desain migrasi; pengelompokan ini hanya mengurangi kebingungan sidebar. Video YouTube berada di tampilan Media.
   - **Testimoni** dan **Partner** — tampilkan masing-masing sebagai menu bila konten tersebut aktif dan sudah layak terbit.
5. **Pengaturan**
   - **Kontak publik** — nomor WhatsApp, email, Instagram, dan alamat yang benar-benar dipakai situs.
   - **Rekening pembayaran** — data privat yang dipakai saat membuat tagihan; akses dan perubahan harus diaudit. Pisahkan dari Kontak publik agar nomor rekening tidak terbit tanpa sengaja.
   - **Akun & hak akses** — pengelola CMS dan izin modul; usulan Albana setelah rute `admins`/`roles` warisan diaudit. **Profil saya, tema, dan keluar** cukup di menu akun/topbar, bukan tiga entri sidebar.

Urutan sidebar mengikuti pekerjaan harian, sedangkan urutan **setup pertama kali** adalah Kontak/Rekening → Program/Trainer → Batch/Bundling → Konten/Media → buka pendaftaran. Jangan menambahkan menu hero untuk saat ini: media hero masih dummy statis sampai ada instruksi menjadikannya dinamis. Menu komunitas lama, payment gateway, bot, sertifikasi sebagai produk, dan laporan analitik lanjutan tidak termasuk struktur Albana awal.

| Kelompok sasaran | Menu | Rute / sumber | Input utama dan keluaran | Status |
|---|---|---|---|---|
| Ringkasan | Dashboard Albana | `/admin` | Batch mendatang, pendaftaran baru, tagihan perlu tinjau | Rute ada, isi perlu diaudit agar hanya menampilkan metrik Albana. |
| Operasional | Pendaftar Albana | `/admin/pendaftar` | Identitas, program/batch, status tindak lanjut | **Belum selaras:** halaman saat ini membaca tabel lama `registrations`, bukan `academy_registrations`. |
| Operasional | Tagihan & pembayaran | `/admin/tagihan` | Tagihan awal/pelunasan, nominal berkode unik, verifikasi atau tolak setelah bukti WhatsApp dicek | Ada; membaca `academy_registrations` dan `academy_invoices`. |
| Kelas & penawaran | Program | `/admin/program` | Nama, slug, isi, harga dasar, status terbit | Ada. `ProgramForm` menulis lewat Supabase client; RLS wajib benar. |
| Kelas & penawaran | Batch & jadwal | `/admin/batch` | Program, jadwal sesi WIB, lokasi, harga/DP, buka-tutup pendaftaran | Ada. Batch belum layak tidak boleh menerima kiriman. |
| Kelas & penawaran | Bundling | `/admin/bundling` | Pasangan program/batch, harga dan DP penawaran | Ada; hanya aktif bila harga dan batch valid. |
| Kelas & penawaran | Trainer | `/admin/trainer` | Profil dan potret yang disetujui | Ada. |
| Konten website | Profil akademi | Belum ditentukan khusus | Identitas lembaga dan metode belajar | **Usulan:** audit sumber `academy` dan editor yang ada sebelum memberi rute baru. |
| Konten website | Artikel | `/admin/artikel` | Judul, isi, draf/terbit | Ada. |
| Konten website | Media & dokumentasi | `/admin/galeri`, `/admin/media` | Galeri beranda; aset program/batch, MP4/YouTube, alt, draf/terbit | Dua rute ada; **usulan** satu label sidebar dengan dua tampilan, tanpa mencampur tabel. |
| Konten website | Partner In-house | `/admin/partner` | Profil dan logo mitra yang telah disetujui | Ada. |
| Konten website | Testimoni | `/admin/testimoni` | Kutipan dan atribusi yang disetujui | Ada. |
| Pengaturan | Kontak publik | Belum ditentukan khusus | Kanal publik untuk beranda dan tanda terima | **Usulan:** audit sumber kontak aktif. |
| Pengaturan | Rekening pembayaran | Belum ditentukan khusus | Rekening aktif untuk tagihan | **Usulan:** pisahkan dari kontak publik, batasi akses. |
| Pengaturan | Akun & hak akses | Rute warisan `/admin/admins`, `/admin/roles` | Pengelola CMS dan izin | **Usulan Albana:** audit kedua rute sebelum masuk sidebar baru. |

**Batas penyederhanaan:** menu komunitas lama (`members`, `attendance`, `referral`, `revenue`, dan sejenisnya) tidak termasuk peta Albana. Jangan menghapus rute tersebut hanya dari diagram; telusuri pemakaian sebelum pembersihan. Halaman `/admin/pendaftar` dan `/admin/tagihan` perlu disatukan pada model Albana sebelum label “Pendaftar Albana” dianggap selesai.

## Urutan input data pengelola

| Tahap | Admin mengisi | Validasi / ketergantungan | Dipakai oleh |
|---|---|---|---|
| 1. Identitas dan kontak | Deskripsi akademi, kanal WhatsApp/email, rekening aktif | Rekening diperlukan sebelum RPC dapat menerima pendaftaran. Kanal dan rekening tidak boleh tertukar aksesnya. | Beranda, tanda terima, tagihan. |
| 2. Katalog | Program dan slug; trainer; penawaran bundling bila ada | Terbitkan hanya konten yang benar. Bundling memerlukan program dan harga yang disetujui. | Kartu program, detail, pilihan pendaftaran. |
| 3. Batch | Program, sesi WIB, lokasi, harga/DP, status buka | Sesi mendatang, harga valid, dan rekening aktif diperiksa ulang oleh RPC saat kirim. | Jadwal dan formulir. |
| 4. Media/editorial | Foto/MP4/YouTube, alt, program/batch, artikel, galeri, partner, testimoni | Ukuran/tipe/resolusi gambar dan MP4 diperiksa server; status terbit serta izin/konteks media diperiksa sebelum tampil. | Beranda dan halaman detail. |
| 5. Operasional | Periksa pendaftaran baru, cocokkan bukti WhatsApp dengan nomor tagihan dan nominal tepat, verifikasi/tolak | Hanya admin berwenang; verifikasi DP membuat tagihan pelunasan. | Status tagihan dan tindak lanjut peserta. |

### Dua jalur simpan CMS yang ada

- **Konten katalog tertentu** (`ProgramForm`, `CmsCollectionClient`): browser admin memakai Supabase client untuk `insert`/`update`/`delete`. Validasi antarmuka ada, tetapi batas akses akhir berada pada sesi Auth, grant, dan **RLS**. Jangan menggambar jalur ini seolah setiap simpan selalu melalui Server Action.
- **Operasi terprivileg** (tagihan dan media Albana): halaman/action/API memeriksa admin di server; operasi database khusus memakai service role sesudah guard. `POST /api/upload` memeriksa origin, sesi dan `members.role`, ukuran/format/resolusi; gambar diproses menjadi WebP. MP4 hanya divalidasi lalu disimpan, **tidak** dikompresi ulang di server. Media program masuk bucket privat dan metadata `media_assets` sebagai draf. Cabang `purpose=landing` menulis gambar ke bucket `gallery` dan mengembalikan URL publik; itu jalur berbeda dari aset program.
- **Baca publik:** Server Components membaca katalog/konten yang memenuhi aturan terbit. `GET /api/media/[id]` mengarahkan media terbit atau admin sah ke signed URL bucket privat. Media dummy statis di hero, proses, dan galeri tetap berlabel sampai diganti; saat ini tidak berasal dari menu CMS hero.

## Flowchart backend pendaftaran

1. Halaman `/register/[program]` memilih batch yang menerima di server. Browser mengirim JSON ke `POST /api/registrations` dengan kunci idempotensi. Form publik memakai **line style**; bentuk kontrol tidak mengubah kontrak API.
2. Route memeriksa `Content-Type`, origin, batas 20.000 karakter, JSON, dan `parseAcademySubmission`. Kesalahan menjadi 415/403/413/422. Kunci rahasia tanda terima harus tersedia.
3. Route menghitung hash sumber dan kiriman, lalu memanggil RPC `receive_academy_registration` melalui client server berhak. RPC membatasi laju, mengunci kunci idempotensi, memeriksa batch/offer/DP/harga/rekening **lagi**, lalu menyimpan `academy_registrations`, `academy_registration_items`, dan `academy_invoices` dalam satu transaksi. Harga dan DP disimpan sebagai snapshot; kode unik dipilih untuk rekening aktif.
4. Hasil `changed`, `unavailable`, atau `duplicate` menjadi 409; `busy` menjadi 429; gangguan layanan menjadi 503. Retry dengan kunci dan isi yang sama dapat kembali sebagai `received` tanpa menggandakan pendaftaran.
5. Pada `received`, route membuat token tanda terima dan mengarahkan ke `/register/konfirmasi/[token]`. Peserta mengirim bukti transfer sendiri melalui WhatsApp. Admin memeriksa bukti dan nominal persis sebelum `resolve_academy_invoice`; keputusan `verified` pada DP awal membuat tagihan pelunasan baru. Tidak ada payment gateway atau verifikasi otomatis.

## Batas kepercayaan dan pekerjaan terbuka

- Data peserta, jawaban formulir, rekening, tagihan, token, dan service role tetap privat. Proxy/subdomain bukan pengganti guard endpoint. Jalur client CMS membutuhkan RLS; jalur service role membutuhkan pemeriksaan admin pada setiap action/API.
- `front/supabase/migrations/20261113043955_albana_registration_billing.sql` adalah kontrak RPC kode saat ini; [arsitektur sistem lama](../data/system-architecture.md) dan [kontrak formulir MVP lama](../registration/registration-contract.md) masih menyebut `receive_registration` dan beberapa menu/status historis. Untuk pendaftaran/tagihan baru, ikuti route dan migrasi yang ditautkan di bawah.
- Pendaftar Albana belum memakai sumber yang sama dengan Tagihan Albana. Ini pekerjaan integrasi, bukan sekadar perubahan label menu.
- Media hero dinamis CMS, unggahan video ke hero, serta pemindahan stack penyimpanan/database belum diminta dan tidak digambarkan sebagai keadaan aktif.

### Titik masuk kode

| Area | Sumber implementasi |
|---|---|
| Navigasi publik | [`site-header.tsx`](../../../front/components/layout/site-header.tsx), [`home-page.tsx`](../../../front/components/home/home-page.tsx) |
| Sidebar CMS | [`admin/layout.tsx`](<../../../front/app/(admin)/admin/layout.tsx>) |
| CMS tulis langsung | [`ProgramForm.tsx`](../../../front/components/admin/ProgramForm.tsx), [`CmsCollectionClient.tsx`](../../../front/components/admin/cms/CmsCollectionClient.tsx) |
| Media | [`upload/route.ts`](../../../front/app/api/upload/route.ts), [`admin/media/actions.ts`](<../../../front/app/(admin)/admin/media/actions.ts>) |
| Pendaftaran | [`registrations/route.ts`](../../../front/app/api/registrations/route.ts), [migrasi RPC](../../../front/supabase/migrations/20261113043955_albana_registration_billing.sql) |
| Tagihan | [`admin/tagihan/actions.ts`](<../../../front/app/(admin)/admin/tagihan/actions.ts>), [`admin/tagihan/page.tsx`](<../../../front/app/(admin)/admin/tagihan/page.tsx>) |
