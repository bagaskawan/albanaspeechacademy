# Desain data CMS dan pendaftaran — Albana Speech Academy

## Maksud dan pilihan

Alan perlu mengelola konten dan batch tanpa membuka draf, rekening, atau data peserta kepada pengunjung. Tiga varian formulir harus dapat direkam dengan arti jawaban dan biaya pada waktu pendaftaran. Project dev sudah memakai PostgreSQL/Supabase, bukan model MySQL dalam `docs/database.md`.

Pendekatan yang dipilih bersama: perluas skema Supabase saat ini secara aditif, lalu jadikan `docs/database.md` dokumen kontrak aktual. Alternatif migrasi penuh ke model MySQL lama akan mengganti slug/FK, REST katalog, dan RPC penerimaan yang sudah dipakai; itu tidak sepadan untuk CMS ini. Supabase Dashboard tetap bisa dipakai mengisi data dev, tetapi CMS situs harus mengotorisasi setiap baca privat dan mutasi di server.

## Batas dan sumber data

- Pertahankan semua tabel di schema `public`: `academy`, `trainers`, `programs`, `batches`, `sessions`, `batch_trainers`, `gallery`, `testimonials`, `contact_details`, `bank_accounts`, `registrations`, `payments`, `intake_key`, serta RPC penerimaan.
- Jangan menerbitkan harga, DP, tanggal, rekening, testimoni, foto, atau hak publikasi dari contoh ketiga formulir. Rekening dan bukti transfer pada formulir lama bukan instruksi publik saat ini; bukti disampaikan ke admin melalui WhatsApp, bukan diunggah ke situs.
- `docs/tech.md` masih mengusulkan Auth.js/MySQL/Cloudinary. Keputusan implementasi baru untuk dev adalah Supabase Auth bagi admin tunggal dengan allowlist ID admin di `public.admin_users` dan Supabase Storage untuk media sementara. Integrasi Auth.js/MySQL/Cloudinary tidak ditambahkan. Saat pindah ke Hostinger, provider penyimpanan dapat diganti tanpa mengganti ID relasi konten. Tidak membuat akun admin atau konten atas nama pemilik.
- Tidak mengubah status keanggotaan atau memulai pembayaran otomatis. Kapasitas tetap tidak aktif untuk pendaftaran sampai aturan kursi disetujui.

## Perubahan skema bertahap

1. Aktifkan RLS tanpa kebijakan browser pada tabel internal `public.contact_details`, `public.bank_accounts`, `public.registrations`, `public.payments`, `public.intake_key`, dan `public.admin_users` sebagai pertahanan berlapis. Tidak ada grant tabel bagi `anon`/`authenticated`; pertahankan grant eksekusi RPC dan uji penerimaan ulang. Batasi default privileges untuk objek baru, bukan mengubah grant katalog yang sedang dipakai.
2. `public.admin_users(user_id uuid primary key references auth.users, created_at)`: hanya ID yang disetujui pemilik dapat masuk CMS. Sesi Supabase Auth diverifikasi ulang di server pada setiap baca privat dan mutasi. Rate limit login pada batas layanan/aplikasi; tidak menaruh service role di browser. Pengisian akun pertama menunggu identitas pemilik.
3. Konten publik yang belum ada: `public.articles` (slug stabil, judul, ringkasan, body Markdown, status draft/published, published_at) dengan RLS baca hanya terbit; `public.contact_channels` (jenis, nilai, published) untuk proyeksi kanal yang disetujui. Nilai historis di `public.contact_details` tidak otomatis diterbitkan. Rekening tetap hanya di `public.bank_accounts` tanpa grant browser. Artikel dirender aman; Markdown/HTML dari CMS tidak langsung disisipkan sebagai HTML tepercaya.
4. `public.media_assets` mencatat provider (`supabase_storage` untuk dev), kind, object key, alt, consent_at, published, dan metadata dasar. Galeri, foto trainer, dan sampul artikel/program dapat mengacu ke asset secara bertahap; URL yang ada tetap bekerja selama transisi. Bucket unggahan draf bersifat privat. Server hanya memberi URL baca singkat untuk asset yang izin dan status terbitnya valid, setelah memeriksa metadata; penarikan terbit menghentikan penerbitan URL baru. Unggahan hanya lewat jalur admin bertanda tangan dan tervalidasi jenis/ukuran di server. URL Supabase Storage tidak menjadi FK atau identitas permanen agar migrasi Hostinger tidak merusak relasi.
5. Pertahankan konten program `curriculum`/`faq` JSONB dan slug stabil. Editor memvalidasi daftar `materi` terurut, FAQ, dan field wajib sebelum `published=true`. Batch memakai status, `form_kind`, `price_idr`, `fee_details`, `dp_percent`, `closes_at`, sesi `timestamptz`, dan penugasan trainer yang ada; validasi publikasi menuntut data benar sebelum membuka pendaftaran. WIB adalah format tampilan, bukan zona penyimpanan.

## Kontrak pendaftaran tiga formulir

`public.registrations` sudah menyimpan batch, nama, email ternormalisasi, WhatsApp sebagai teks, `form_kind`, `answers` JSONB, pilihan pembayaran, snapshot harga/DP/rincian biaya, dan waktu persetujuan. Ini dipertahankan agar histori biaya tak berubah saat batch diedit. `answers` berisi nama panggilan, domisili, gender, usia, profesi, instansi opsional, sosial opsional, pengalaman terdahulu, tujuan, sumber informasi, dan kesiapan hadir. `challenge` wajib untuk `series` dan `exclusive`, `null` untuk `bnsp`; pertanyaan pengalaman/tujuan/kesiapan memiliki naskah berbeda menurut `form_kind`. Simpan versi formulir ketika naskah pertanyaan mulai bisa diubah lewat CMS, supaya jawaban lama tetap dapat ditafsirkan.

Formulir BNSP memuat dua pos biaya contoh; jangan menyimpulkan total atau janji sertifikasi. Untuk semua varian, `price_idr` adalah angka final batch yang disahkan, `fee_details` adalah uraian yang disahkan, dan DP hanya tampil bila `dp_percent` disetujui. Intake RPC tetap mengunci batch dan memeriksa ulang harga, varian, status, serta duplikasi `(batch_slug,email)`. Persetujuan diproses di batas server, bukan dari klaim browser saja. Rekening, bukti pembayaran, dan data peserta tidak masuk katalog.

## Keamanan, verifikasi, dan pemulihan

- Migrasi expand-only dan idempoten; tidak menghapus tabel/kolom maupun mengisi konten nyata. Urutan: audit grant/RLS, SQL lokal dan uji rollback, terapkan dev, uji ulang baca katalog/pendaftaran, lalu implementasi editor dan jalur upload privat. Rollback untuk tabel baru adalah menonaktifkan fitur dan membiarkan data tetap tersimpan; perubahan RLS dapat dibalik terpisah hanya bila jalur penerimaan benar-benar terblokir.
- Uji sebagai `anon` melalui API langsung: draf program/artikel, batch batal, sesi terkait program tersembunyi, galeri/testimoni tanpa izin, tabel sensitif di `public`, dan mutasi admin harus tertutup. Uji admin sah untuk edit→terbit→tarik serta pengunjung melihat transisi. Periksa advisory, grant efektif, dan hasil RPC setelah migrasi.
- Penulisan CMS memakai otorisasi server pada setiap operasi, validasi input, dan transaksi untuk perubahan berkaitan. Tidak ada route mutasi publik dengan service role tanpa sesi admin yang diverifikasi. Data registrasi tidak disalin ke fixture publik.

## Keputusan pemilik yang masih diperlukan

ID akun admin, kanal kontak yang boleh terbit, rekening aktif, izin tiap aset/kutipan, materi artikel, dan detail batch nyata (biaya termasuk dua pos BNSP, DP, jadwal, kuota). Konfigurasi akun/bucket Supabase Storage diperlukan sebelum unggahan diuji end-to-end. Tanpa keputusan konten, sistem menyediakan draf/kondisi kosong; tidak mengisi contoh sebagai fakta.
