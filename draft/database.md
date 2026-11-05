# Model Database — Albana Speech Academy

Rancangan MySQL untuk [tech.md](tech.md). Semua ID menggunakan BIGINT autoincrement; tanggal memakai DATETIME(3) dan disimpan sebagai UTC oleh aplikasi, lalu ditampilkan dalam WIB. Nominal rupiah memakai DECIMAL(12,0). Isi formulir final harus dicocokkan dengan formulir klien yang tautannya ada di [brief](Brief.md).

## Relasi

~~~mermaid
erDiagram
    ADMINS ||--o{ MEDIA_ASSETS : mengunggah
    ADMINS ||--o{ ARTICLES : menulis
    ADMINS ||--o{ PAYMENTS : memverifikasi
    ADMINS ||--o{ RESCHEDULE_REQUESTS : memutuskan
    MEDIA_ASSETS ||--o{ TRAINERS : foto
    MEDIA_ASSETS ||--o{ PROGRAMS : sampul
    MEDIA_ASSETS ||--o{ DOCUMENTATIONS : berkas
    MEDIA_ASSETS ||--o{ TESTIMONIALS : berkas
    MEDIA_ASSETS ||--o{ ARTICLES : sampul
    LOCATIONS ||--o{ CLASS_BATCHES : tempat
    LOCATIONS ||--o| SITE_CONTENT : lokasi_utama
    TRAINERS ||--o{ PROGRAMS : mengajar
    PROGRAMS ||--o{ CLASS_BATCHES : memiliki
    PROGRAMS ||--o{ TESTIMONIALS : terkait
    CLASS_BATCHES ||--o{ CLASS_SESSIONS : terdiri_dari
    CLASS_BATCHES ||--o{ DOCUMENTATIONS : didokumentasikan
    CLASS_BATCHES ||--o{ REGISTRATIONS : dipilih
    CLASS_BATCHES ||--o{ RESCHEDULE_REQUESTS : asal
    CLASS_BATCHES ||--o{ RESCHEDULE_REQUESTS : tujuan
    REGISTRATIONS ||--o{ PAYMENTS : dibayar
    REGISTRATIONS ||--o{ RESCHEDULE_REQUESTS : mengajukan
~~~

## Tabel konten

| Tabel | Kolom inti | Relasi dan aturan |
| --- | --- | --- |
| admins | id; email VARCHAR(254) unik; name VARCHAR(120); password_hash VARCHAR(255); created_at | Satu akun awal untuk Alan. Tidak ada akun peserta. |
| site_content | id TINYINT tetap 1; intro TEXT; teaching_method TEXT; contact_whatsapp VARCHAR(30); payment_instructions TEXT; reschedule_policy TEXT; primary_location_id BIGINT NULL; updated_at | Konten beranda, Metode Pengajaran, kontak, dan petunjuk Pembayaran. primary_location_id → locations.id; boleh NULL sampai lokasi disetujui. |
| locations | id; name VARCHAR(160); address TEXT; maps_url VARCHAR(500) NULL; is_published BOOLEAN | Satu lokasi dapat dipakai banyak batch. Alamat dipublikasikan hanya setelah diverifikasi. |
| media_assets | id; provider ENUM(CLOUDINARY,YOUTUBE); kind ENUM(IMAGE,VIDEO); provider_id VARCHAR(255); public_url VARCHAR(1000); alt_text VARCHAR(255) NULL; uploaded_by BIGINT; created_at | uploaded_by → admins.id. Simpan ID media dan URL, bukan data biner. provider_id unik per provider. YouTube hanya untuk VIDEO. |
| trainers | id; slug VARCHAR(160) unik; name VARCHAR(160); bio TEXT; credentials TEXT NULL; photo_asset_id BIGINT NULL; is_published BOOLEAN; updated_at | photo_asset_id → media_assets.id. Profil Alan berada di sini. |
| programs | id; trainer_id BIGINT; cover_asset_id BIGINT NULL; slug VARCHAR(160) unik; title VARCHAR(200); summary TEXT; description TEXT; status ENUM(DRAFT,PUBLISHED,ARCHIVED); updated_at | trainer_id → trainers.id; cover_asset_id → media_assets.id. Hanya program PUBLISHED tampil publik. |
| class_batches | id; program_id BIGINT; location_id BIGINT; title VARCHAR(200); capacity INT NULL; price_idr DECIMAL(12,0) NULL; registration_closes_at DATETIME(3) NULL; status ENUM(DRAFT,OPEN,CLOSED,CANCELLED); created_at | program_id → programs.id; location_id → locations.id. Harga NULL berarti belum siap dipublikasikan. Buka pendaftaran hanya setelah detail yang wajib lengkap. |
| class_sessions | id; batch_id BIGINT; sequence_no SMALLINT; starts_at DATETIME(3); ends_at DATETIME(3) | batch_id → class_batches.id. Unik (batch_id, sequence_no); ends_at harus sesudah starts_at. Satu batch dapat terdiri dari beberapa pertemuan. |
| documentations | id; batch_id BIGINT NULL; media_asset_id BIGINT; title VARCHAR(200); caption TEXT NULL; consent_at DATETIME(3) NULL; is_published BOOLEAN; sort_order INT | batch_id → class_batches.id; media_asset_id → media_assets.id. Hanya terbit bila hak publikasi sudah tercatat. |
| testimonials | id; program_id BIGINT NULL; media_asset_id BIGINT NULL; person_name VARCHAR(160); quote TEXT; consent_at DATETIME(3) NULL; is_published BOOLEAN; sort_order INT | program_id → programs.id; media_asset_id → media_assets.id. Kutipan asli, izin publikasi wajib sebelum tayang. |
| articles | id; author_id BIGINT; cover_asset_id BIGINT NULL; slug VARCHAR(200) unik; title VARCHAR(250); excerpt TEXT; body TEXT; status ENUM(DRAFT,PUBLISHED); published_at DATETIME(3) NULL; updated_at | author_id → admins.id; cover_asset_id → media_assets.id. Isi dirender aman; artikel DRAFT tidak terlihat publik. |

## Tabel pendaftaran dan pembayaran

| Tabel | Kolom inti | Relasi dan aturan |
| --- | --- | --- |
| registrations | id; batch_id BIGINT; full_name VARCHAR(160); email VARCHAR(254); phone VARCHAR(30); price_idr_at_signup DECIMAL(12,0); consent_at DATETIME(3); status ENUM(PENDING,CONFIRMED,CANCELLED); created_at; updated_at | batch_id → class_batches.id. Harga saat mendaftar disalin agar perubahan harga batch tidak mengubah catatan lama. Data formulir minimal sementara; tambah kolom hanya setelah isi formulir klien dikonfirmasi. Unik (batch_id, email) untuk mencegah pendaftaran ganda pada batch yang sama. |
| payments | id; registration_id BIGINT; amount_idr DECIMAL(12,0); method VARCHAR(80); reference VARCHAR(160) NULL; status ENUM(PENDING,VERIFIED,REJECTED); recorded_at; verified_at DATETIME(3) NULL; verified_by BIGINT NULL | registration_id → registrations.id; verified_by → admins.id. Beberapa percobaan pembayaran dapat dicatat tanpa menghapus riwayat yang ditolak. Bukti dapat diverifikasi di luar situs, misalnya melalui WhatsApp; situs tidak menyimpan data kartu. |
| reschedule_requests | id; registration_id BIGINT; from_batch_id BIGINT; to_batch_id BIGINT; status ENUM(PENDING,APPROVED,REJECTED); requested_at; resolved_at DATETIME(3) NULL; resolved_by BIGINT NULL; note TEXT NULL | registration_id → registrations.id; from_batch_id/to_batch_id → class_batches.id; resolved_by → admins.id. Simpan riwayat setiap permintaan, termasuk yang ditolak. |

## Aturan konsistensi

1. Form hanya dapat memilih batch OPEN yang belum melewati batas pendaftaran. Harga, jadwal, dan lokasi yang belum disetujui tidak ditampilkan sebagai fakta.
2. Simpan pendaftaran dan periksa kapasitas dalam transaksi agar pendaftar serentak tidak melebihi kuota. Status pendaftaran mana yang menahan kursi dan kapan kursi dilepas masih perlu keputusan klien. Jika capacity NULL atau aturannya belum jelas, jangan menampilkan angka sisa kursi.
3. Pendaftaran menjadi CONFIRMED hanya bila ada pembayaran berstatus VERIFIED. Hanya satu pembayaran boleh VERIFIED per pendaftaran; periksa dalam transaksi. Verifikasi menyimpan admin dan waktu. Semua perubahan status pembayaran memerlukan otorisasi admin.
4. Saat penjadwalan ulang disetujui, periksa program, status, dan kapasitas batch tujuan dalam satu transaksi; ubah registrations.batch_id dan simpan riwayat. Pembayaran tetap terkait pendaftaran yang sama; selisih harga antarbatch harus diputuskan klien sebelum alur ini diaktifkan. Syarat operasional penjadwalan ulang juga menunggu keputusan klien.
5. Jangan hapus fisik pendaftaran, pembayaran, atau riwayat penjadwalan ulang. Arsipkan program dan tutup batch untuk mempertahankan relasi. Hapus media hanya setelah tidak direferensikan dan hak hapusnya jelas.
6. Gunakan foreign key dan indeks pada semua kolom relasi; tambahkan indeks class_batches(program_id, status), class_sessions(batch_id, starts_at), registrations(batch_id, status), registrations(email), payments(registration_id, status), articles(status, published_at), dan documentations(is_published, sort_order).
7. Data pendaftar hanya tersedia bagi admin. Tetapkan masa simpan dan prosedur penghapusan bersama klien; jangan mengarang kebijakan retensi dalam aplikasi.

## Pemetaan kebutuhan klien

Dokumentasi → documentations + media_assets; Metode Pengajaran → site_content.teaching_method; Program → programs; Jadwal Kelas → class_batches + class_sessions; Trainer → trainers; Lokasi → locations; Pendaftaran → registrations; Pembayaran → payments + site_content.payment_instructions; Artikel → articles. Testimoni dan penjadwalan ulang tetap tercakup karena sudah dikonfirmasi di brief sebelumnya.
