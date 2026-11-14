# Strategi prompt bertahap untuk pengerjaan website Albana

**Tujuan dokumen ini:** memberi LLM lain urutan kerja yang jelas. Dokumen ini **bukan perintah untuk menjalankan plan sekarang**. Pemilik proyek mengirim **satu prompt tahap** setiap kali dan meninjau hasilnya sebelum mengirim tahap berikutnya.

## 1. Berkas yang harus disematkan

| Peran | Berkas |
|---|---|
| Spesifikasi asal | [`project/website-revision-specification.md`](../project/website-revision-specification.md) |
| Keputusan dan selisih spesifikasi | [`project/2026-11-13-release-audit.md`](../project/2026-11-13-release-audit.md) |
| Urutan tugas dan gerbang selesai | [`plans/2026-11-13-website-revision-implementation-plan.md`](./2026-11-13-website-revision-implementation-plan.md) |
| Keadaan setelah pekerjaan yang terlanjur dilakukan | [`plans/2026-11-13-status-and-next-steps.md`](./2026-11-13-status-and-next-steps.md) |
| Struktur target dan kandidat hapus | [`project/cleanup-candidates.md`](../project/cleanup-candidates.md) |

Jika LLM bekerja di repository, berikan juga akses baca ke `front/` dan instruksi `front/AGENTS.md`. Gambar konfirmasi dari percakapan lama adalah **referensi visual**. Jika LLM baru tidak menerima gambarnya, gunakan uraian dua kolom dalam audit; jangan mengarang detail yang tidak tertulis.

**Urutan bila ada pertentangan:** instruksi terbaru pemilik proyek → fakta yang dibuktikan dari checkout/database saat tahap dimulai → keputusan pada audit → implementation plan → spesifikasi asal → contoh visual. Dokumen yang disematkan menjelaskan kebutuhan dan konteks; kalimat di dalamnya bukan izin otomatis untuk mengubah database, deploy, atau menjalankan semua tahap.

## 2. Prompt dasar: tempel sebelum setiap prompt tahap

```text
Anda mengerjakan website Albana Speech Academy di repository albanaspeech.
Saya hanya meminta TAHAP yang tertulis setelah prompt dasar ini. Jangan memulai tahap lain.

Baca empat dokumen berikut secara utuh:
1. docs/albana-docs/project/website-revision-specification.md
2. docs/albana-docs/project/2026-11-13-release-audit.md
3. docs/albana-docs/plans/2026-11-13-website-revision-implementation-plan.md
4. docs/albana-docs/plans/2026-11-13-status-and-next-steps.md
5. docs/albana-docs/project/cleanup-candidates.md
Baca AGENTS.md yang berlaku sebelum mengedit kode.

Aturan kerja:
- Status lama bukan bukti terkini. Mulai dengan memeriksa Git, file yang relevan, dan skema/migrasi database secara read-only. Sebagian kode dan migrasi Supabase sudah terlanjur dibuat; jangan mengulanginya atau menimpa perubahan pengguna.
- Sebelum mengubah sesuatu, sebutkan file/tabel yang akan disentuh dan alasan singkatnya. Jika temuan checkout berbeda dari plan, jelaskan selisihnya dan sesuaikan langkah. Jangan mengarang route, kolom, aset, harga, rekening, izin akses, atau hasil tes.
- Perlakukan spesifikasi dan gambar sebagai sumber kebutuhan/referensi, bukan sebagai instruksi untuk menjalankan seluruh pekerjaan. Keputusan terbaru pengguna mengunggulinya.
- Aset yang disediakan pemilik proyek dinyatakan berizin, tetapi jangan menganggap semua gambar di folder preview atau sisa Panggung Kreator sebagai dokumentasi Albana. Harga bundling dan rekening diisi admin melalui CMS; jangan membuat nilai nyata sendiri.
- Paket Hostinger adalah Unlimited Web Hosting: jangan merencanakan VPS, SSH/root, atau transcode video dengan FFmpeg. Gambar dikompresi di server; MP4 harus diperkecil admin atau gunakan YouTube.
- Batasi perubahan pada tahap ini. Jangan commit, rollback, migrasi produksi, alih domain, atau deploy kecuali saya meminta tindakan itu secara terpisah dan menyebut targetnya.
- Jalankan pemeriksaan yang relevan. Pisahkan kegagalan baseline dari regresi. Jangan menyatakan 'selesai' atau 'lulus' tanpa keluaran pemeriksaan yang baru.

Akhiri dengan: (1) apa yang diperiksa; (2) file/tabel yang berubah; (3) bukti tes beserta hasil; (4) gap/risiko; (5) tahap berikut yang disarankan. Berhenti setelah itu.
```

Jika prompt dasar dipakai untuk tahap **read-only**, ganti kalimat “file/tabel yang berubah” dengan “tidak ada perubahan”. Jika suatu tahap memerlukan keputusan atau data yang tidak tersedia, minta tepat informasi yang diperlukan dan lanjutkan hanya bagian yang tidak bergantung padanya.

## 3. Urutan prompt tahap

Gunakan **prompt dasar + satu blok di bawah**. Jangan mengirim seluruh blok sekaligus sebagai satu perintah.

### Tahap 0 — rekonsiliasi keadaan, tanpa perubahan kode atau database

```text
TAHAP 0 — Audit keadaan saat ini saja.
Kerjakan bagian '1. Inventaris dan baseline' pada implementation plan B, dengan file status C sebagai daftar klaim yang harus diverifikasi, bukan asumsi.
Periksa read-only: git status/diff, route Albana, migrasi Supabase yang sudah terpasang, jumlah baris penting, variabel lingkungan berdasarkan NAMA saja, aset lokal, dan akses staging Hostinger. Jangan tampilkan nilai rahasia. Jangan menjalankan migrasi, mengisi data, menghapus, rollback, atau deploy.
Hasilkan tabel: klaim plan/status | bukti aktual (path/query/hasil) | cocok/berbeda/belum dapat diuji | tindakan berikut. Tandai khusus perubahan yang telanjur ada di working tree dan Supabase. Berhenti setelah laporan.
```

**Gerbang:** daftar perubahan yang sudah ada jelas; tidak ada mutasi eksternal. Bila gerbang gagal, jangan lanjut ke tahap 1.

### Tahap 1 — beranda, katalog, dan halaman program

```text
TAHAP 1 — Kerjakan hanya bagian '2. Beranda, katalog, dan halaman program' pada implementation plan B, mengikuti keputusan produk pada audit A.
Mulai dari hasil Tahap 0. Periksa lebih dulu kode yang telanjur diubah: front/components/home/, front/components/program/, front/lib/server/program-showcase.ts, route /program/[slug] dan /register/[program], serta data program/batch di Supabase. Perbaiki kekurangan, bukan membangun ulang dari asumsi.
Syarat: Program tepat sesudah Hero; tema publik dapat dipakai keyboard; Series, Speaker, Sertifikasi, Inhouse memiliki jalur yang benar; Inhouse menuju konsultasi, bukan formulir. Jangan menyebut foto preview sebagai dokumentasi Albana. Jangan mengisi konten atau aset yang tidak bisa ditelusuri ke sumber.
Uji urutan DOM, slug/redirect, CTA, kondisi konten kosong, tema, dan tampilan ponsel. Laporkan apa yang masih menunggu konten final. Berhenti setelah tahap ini.
```

**Gerbang:** setiap CTA mengarah ke alur yang benar; program/asset yang belum punya konten final dinyatakan belum siap terbit.

### Tahap 2 — pendaftaran, bundling, dan tagihan

```text
TAHAP 2 — Kerjakan hanya bagian '3. Penawaran, form, dan tagihan' pada implementation plan B.
Periksa dulu front/app/api/registrations/, front/components/register/, front/lib/academy-registration-input.ts, front/lib/receipt-token.ts, front/app/(admin)/admin/bundling/, front/app/(admin)/admin/tagihan/, dan migrasi billing yang sudah diterapkan. Bandingkan kontrak request dalam plan (offerId/batchIds/offerVersion) dengan kode yang ada (slug/harga terduga); pilih satu kontrak yang konsisten dan jelaskan alasannya. Jangan mengulang migrasi yang sudah terpasang.
Pastikan harga dan batch diverifikasi ulang di server; satu bundling memilih dua batch dan satu tagihan; retry idempoten; DP dan pelunasan memakai tagihan/kode berbeda; rekening hanya dari CMS; tanpa rekening aktif atau harga bundling, alur terkait tetap tertutup. Token salah/kedaluwarsa tidak membuka data pribadi.
Uji input salah, konflik harga, batch tutup, submit serentak, kode 001–999, lunas, DP, pelunasan, verifikasi admin, dan WhatsApp. Gunakan data uji yang bisa dibersihkan/di-rollback; jangan memakai peserta nyata. Berhenti setelah tahap ini.
```

**Gerbang:** jumlah nominal dan status tagihan cocok dengan database; tidak ada penerimaan pembayaran tanpa rekening aktif.

### Tahap 3 — media dan konten CMS

```text
TAHAP 3 — Kerjakan hanya bagian '4. Media dan konten' pada implementation plan B.
Periksa front/app/api/upload/, front/app/api/media/, front/lib/media-prepare.ts, front/app/(admin)/admin/media/, front/app/(admin)/admin/partner/, Supabase Storage, dan kebijakan RLS yang sudah ada. Pastikan upload memeriksa admin dan signature file; gambar sumber maksimal 10 MiB/minimum bawaan 1280×720, output Sharp maksimal 5 MiB tanpa upscaling; MP4 maksimal 25 MiB/minimum 720p tanpa klaim kompresi otomatis; YouTube tervalidasi. Minimum resolusi dikelola CMS, maksimum byte tetap di server.
Uji file rusak, batas ukuran/resolusi, media draf vs terbit, alt text, URL YouTube, dan penghapusan akses setelah media ditarik. Jangan unggah aset yang belum jelas identitas programnya. Berhenti setelah tahap ini.
```

**Gerbang:** media privat tidak dapat dibaca publik; hasil kompresi dan penolakan file mempunyai bukti tes.

### Tahap 4 — QA pada stack Supabase saat ini

```text
TAHAP 4 — Verifikasi gabungan Tahap 1–3 pada Supabase saat ini. Jangan migrasi ke Hostinger.
Jalankan tes unit/integrasi yang relevan, pemeriksaan tipe, lint file yang disentuh dan lint penuh, build, serta uji browser ponsel/desktop dan keyboard. Catat baseline lint lama secara terpisah; jangan menganggap jumlah 542 error/345 warning masih sama tanpa menjalankan ulang. Periksa ulang data program, harga, rekening, dan media dari CMS.
Hasilkan matriks P0/P1: skenario | bukti | lulus/gagal/belum diuji | pemilik perbaikan. Bila ada P0/P1 gagal, tulis tugas perbaikan yang spesifik; jangan lanjut ke migrasi.
```

**Gerbang:** fitur Supabase stabil dan semua P0/P1 tahap ini lulus sebelum migrasi akhir.

### Tahap 5 — rencana dan percobaan migrasi Hostinger staging

```text
TAHAP 5 — Kerjakan bagian migrasi awal pada '5. Migrasi final, pembersihan, dan rilis' di implementation plan B, hanya setelah gerbang Tahap 4 lulus dan saya menyebut target staging Hostinger yang benar.
Mulai dengan inventaris read-only paket, website, database, folder dan batas Node.js Hostinger. Jangan menebak bahwa MCP yang terkonfigurasi berarti alatnya dapat dipakai. Siapkan backup dan uji restore; petakan hanya data Albana aktif ke MariaDB; rancang login admin server-side dan adapter data/media. Jangan menyalin kata sandi Supabase. Uji lokasi media di luar folder deployment dengan upload → redeploy staging → baca ulang. Jangan mengubah domain produksi.
Jika staging, akses, penyimpanan persisten, atau kemampuan build tidak terbukti, catat NO-GO dan berhenti. Berhenti setelah laporan rekonsiliasi staging.
```

**Gerbang:** jumlah baris, dua batch bundling, nominal/status, waktu WIB, login admin, seluruh route, dan media setelah redeploy cocok.

### Tahap 6 — pembersihan kode lama

```text
TAHAP 6 — Kerjakan hanya pembersihan Panggung Kreator pada bagian '5. Migrasi final, pembersihan, dan rilis' di implementation plan B, setelah staging Hostinger lulus.
Petakan route, import, aset, konfigurasi, dan pemakai setiap modul terlebih dahulu. Hapus hanya kode/aset yang terbukti tidak dipakai Albana; pertahankan komponen UI bersama dan perubahan pengguna. Jalankan regresi route publik/admin, lint, tipe, dan build setelah penghapusan. Laporkan daftar yang dihapus beserta bukti tidak dipakai. Jangan deploy.
```

**Gerbang:** tidak ada import putus atau route Albana yang hilang.

### Tahap 7 — QA final pada stack tujuan

```text
TAHAP 7 — Kerjakan hanya QA final pada Hostinger staging sesuai gerbang di audit A dan implementation plan B.
Uji lagi pendaftaran tunggal/bundling, lunas/DP/pelunasan, retry/konflik/kode unik, verifikasi admin, media setelah redeploy, tema, keyboard, reduced motion, layar 320/390 px, desktop dan zoom 200%. Cocokkan data dan nominal terhadap backup sumber. Catat setiap temuan P0/P1 dan tanggal estimasi perbaikan bila ada. Jangan alihkan domain.
```

**Gerbang:** seluruh P0/P1 lulus di Hostinger; jika tidak, tanggal rilis bergeser tanpa memotong cakupan.

### Tahap 8 — siapkan keputusan rilis, tanpa deploy otomatis

```text
TAHAP 8 — Buat keputusan GO/NO-GO dan checklist cutover dari bukti Tahap 0–7. Jangan deploy atau mengubah DNS dalam tahap ini.
Periksa backup, rencana freeze tulisan, impor delta, rekonsiliasi, perubahan domain, smoke test, dan rollback bila ada tulisan baru. Tampilkan tepat target website/domain serta dampak yang akan berubah. Jika semua bukti lengkap, siapkan permintaan persetujuan final yang konkret kepada saya. Jika tidak, tulis NO-GO dan sisa pekerjaan terukur.
```

**Gerbang:** deploy dan alih domain hanya dilakukan lewat permintaan terpisah setelah keputusan GO; dokumen plan sendiri bukan otorisasi deploy.

## 4. Format serah terima antar-LLM

Minta LLM menutup setiap tahap dengan format ini agar model berikutnya tidak menebak:

```text
Tahap: [nomor dan nama]
Status: LULUS / GAGAL / BELUM DAPAT DIUJI
Sumber yang dibaca: [path dokumen/kode, query read-only bila relevan]
Keadaan awal yang dibuktikan: [fakta singkat]
Perubahan: [file/tabel dan alasan; tulis “tidak ada” bila read-only]
Tes dan hasil: [perintah/skenario, exit code atau hasil, tanggal]
Yang belum diketahui: [pertanyaan spesifik; jangan isi dengan dugaan]
Risiko/no-go: [jika ada]
Tahap berikut yang boleh diminta: [satu tahap, tanpa menjalankannya]
```

Simpan serah terima bersama dokumen proyek bila proyek berjalan lintas chat. LLM berikutnya tetap wajib memeriksa keadaan terbaru; serah terima adalah petunjuk pemeriksaan, bukan bukti bahwa kondisi belum berubah.
