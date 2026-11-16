<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-ruless -->

## Dokumentasi proyek

Sebelum mengerjakan tugas di `front/`, baca [`../docs/albana-docs/README.md`](../docs/albana-docs/README.md) sebagai indeks dan petunjuk dokumentasi proyek. Buka dokumen terkini yang relevan dari indeks tersebut sesuai bagian yang dikerjakan.

## Peta arsitektur cepat

Dokumen ini adalah **peta lokasi kode yang ada**, bukan daftar fitur yang sudah siap produksi. Mulai dari bagian yang sesuai tugas; baca berkas rinci hanya saat akan mengubah alurnya. Jika peta ini berbeda dengan kode, **kode dan migrasi yang terpasang adalah keadaan implementasi**; cocokkan maksud produk dengan [brief](../docs/albana-docs/project/project-brief.md), [spesifikasi revisi](../docs/albana-docs/project/website-revision-specification.md), [audit rilis](../docs/albana-docs/project/2026-11-13-release-audit.md), dan [kontrak pendaftaran](../docs/albana-docs/registration/registration-contract.md). Sebagian dokumen arsitektur lama masih menyebut folder `web/`; root aplikasi yang benar di checkout ini adalah `front/`.

### Bentuk aplikasi

- Satu aplikasi **Next.js 16 App Router + React 19 + TypeScript**. Route, API, CMS, dan UI publik ada di sini; tidak ada server API terpisah. Tailwind CSS 4 dan token global berada di `app/globals.css`. Alias `@/` menunjuk root `front/` (`tsconfig.json`).
- `app/layout.tsx` memasang CSS, tema, scroll, progress, transisi halaman, dan toast. Route group dalam tanda kurung **tidak** muncul pada URL.
- `proxy.ts` hanya meneruskan rute Albana dari `lib/albana-routes.ts`, termasuk API yang diizinkan; rute komunitas lama mendapat 404. Proxy hanya memeriksa sesi (`getClaims()`) untuk `/admin`; `admin_users` diperiksa sekali per permintaan oleh `requireAdminMember()` (React `cache()`) di layout, halaman, dan action admin. Route handler/server action tetap wajib memiliki guard sendiri.
- Supabase PostgreSQL, Auth, dan Storage masih menjadi dependensi implementasi saat ini. Migrasi ada di `supabase/migrations/`; `supabase/config.toml` untuk lingkungan lokal. Rencana perpindahan ke Hostinger/MariaDB pada audit rilis adalah **rencana**, bukan bukti bahwa kode sudah berpindah.
- Berkas komunitas lama masih ada di `app/myprofile/`, `app/(form)/`, sebagian `app/(admin)/admin/`, `components/member/`, dan `lib/actions/`, tetapi rutenya dipensiunkan oleh daftar izin proxy. Tabel komunitas sudah dihapus dari proyek Supabase Albana; jangan membuka kembali rute lama tanpa migrasi data dan audit akses.

### Mulai dari kebutuhan ini

| Kebutuhan | Titik masuk kode | Dokumen terkait |
|---|---|---|
| Beranda dan konten publik | `app/(web)/page.tsx` → `components/home/home-page.tsx` → komponen seksi di `components/home/`; header/footer di `components/layout/` | [Konten beranda](../docs/albana-docs/content/home-page-content.md), [desain publik terbaru](../docs/albana-docs/design/academy-design-system.md) |
| Program dan penawaran | `app/(web)/program/[slug]/page.tsx`, `components/program/program-detail-page.tsx`, `lib/server/program-showcase.ts`, `lib/server/catalog.ts`, `lib/server/bundle-offer.ts` | [Revisi website](../docs/albana-docs/project/website-revision-specification.md), [referensi data](../docs/albana-docs/data/database-reference.md) |
| Form dan batch | `app/(web)/register/[program]/page.tsx`, `components/register/`, `lib/server/registration-batch.ts`, `lib/registration*.ts`, `lib/academy-registration-input.ts` | [Kontrak pendaftaran](../docs/albana-docs/registration/registration-contract.md), `docs/albana-docs/registration/forms/` |
| Simpan pendaftaran dan tagihan | `app/api/registrations/route.ts` → RPC `receive_academy_registration` dalam migrasi `20261113043955_albana_registration_billing.sql`; tanda terima di `app/(web)/register/konfirmasi/[token]/page.tsx` | [Audit rilis](../docs/albana-docs/project/2026-11-13-release-audit.md), [model data](../docs/albana-docs/data/database-reference.md) |
| Admin Albana | `app/(admin)/admin/{program,batch,trainer,bundling,media,tagihan}/`; aksi tulis lazimnya `actions.ts` di folder modul | [Spesifikasi revisi](../docs/albana-docs/project/website-revision-specification.md), [desain admin](../docs/albana-docs/design/admin-design-system.md) |
| Media | `app/(admin)/admin/media/`, `app/api/upload/route.ts`, `app/api/media/[id]/route.ts`, `lib/media-prepare.ts` | [Audit rilis](../docs/albana-docs/project/2026-11-13-release-audit.md) |
| Artikel dan kontak | `app/(web)/artikel/`, `lib/server/public-articles.ts`, `lib/server/public-contacts.ts`; editor di `components/admin/article/` | [Konten beranda](../docs/albana-docs/content/home-page-content.md) |
| Auth dan akses | `proxy.ts`, `lib/supabase/{client,server,service-role}.ts`, `lib/server/{admin-guard,admin-auth}.ts`, `app/(auth)/` | [Arsitektur sistem](../docs/albana-docs/data/system-architecture.md); verifikasi terhadap kode karena dokumen ini memuat keadaan lama |

### Alur data dan batas kepercayaan

1. **Baca publik:** halaman server memakai `lib/server/academy-api.ts` (`fetch` ke Supabase REST) melalui `catalog.ts`, `program-showcase.ts`, dan modul `public-*`. Komponen client menangani interaksi. Perlakukan `lib/server/` sebagai batas server; `academy-api.ts` sendiri memakai `server-only`. Jangan impor akses data/rahasia server ke client. Konten yang diterbitkan dan data pratinjau punya aturan berbeda.
2. **Pilih kelas:** `registration-batch.ts` memilih batch yang menerima pendaftaran **di server** berdasarkan slug program. `program-showcase.ts` menentukan kartu/status/tautan. Tidak ada batch/harga yang dipercaya hanya karena dikirim browser.
3. **Terima pendaftaran:** `POST /api/registrations` memeriksa origin, ukuran dan bentuk JSON, lalu `parseAcademySubmission`. Handler memakai `SUPABASE_SERVICE_ROLE_KEY` melalui `academyBillingClient()` dan memanggil RPC transaksional `receive_academy_registration`. RPC menyimpan pendaftaran, item, snapshot harga, dan tagihan/kode unik, serta menangani idempotensi dan konflik. Perubahan validasi harus diselaraskan antara client, handler, dan SQL; jangan menulis langsung ke tabel privat dari browser.
4. **Tanda terima:** respons memberi URL `/register/konfirmasi/[token]`. Halaman memvalidasi token lewat `lib/receipt-token.ts`, membaca tagihan dan rekening di server, lalu menawarkan pengiriman bukti melalui WhatsApp. Form diterima **belum berarti pembayaran terverifikasi**. Verifikasi dilakukan admin di `app/(admin)/admin/tagihan/actions.ts` melalui RPC `resolve_academy_invoice`.
5. **Admin:** `requireAdminMember()`, proxy, login CMS, unggah, dan pembacaan media privat kini memakai allowlist `admin_users`. `admin-auth.ts` adalah jalur lama yang belum dipakai rute CMS aktif. Service role hanya boleh berjalan setelah autentikasi dan otorisasi server.
6. **Media:** `POST /api/upload` mewajibkan admin, validasi tipe/ukuran/resolusi, memproses gambar dengan Sharp, lalu menulis ke Storage. Media program direkam sebagai draf di `media_assets`; admin menerbitkannya melalui aksi modul media. `GET /api/media/[id]` mengembalikan redirect ke signed URL bucket privat untuk media terbit atau admin yang sah. Jalur unggah `purpose=landing` memakai bucket `gallery` dan URL publik; periksa kedua cabang sebelum mengubah perilaku penyimpanan.

Data peserta, tagihan, rekening, token, dan kunci layanan adalah privat. Jangan memindahkannya ke props client, `NEXT_PUBLIC_*`, log, halaman publik, atau contoh dokumentasi. RLS/migrasi dan guard server sama-sama bagian dari batas akses. Perubahan skema dilakukan lewat migrasi baru, bukan hanya mengubah tipe atau query aplikasi.

### Konvensi kerja yang menghemat pencarian

- Untuk route baru, cari `page.tsx` atau `route.ts` di `app/` lalu telusuri **satu langkah impor** ke komponen dan `lib/server/`. Untuk perubahan data, mulai dari query/RPC yang dipakai, lalu migrasi dan caller. Jangan membaca seluruh `components/` atau seluruh migrasi tanpa alasan.
- Halaman publik memakai `components/home/`, `components/program/`, `components/register/`, dan `components/layout/`. `components/ui/` adalah komponen bersama. Tampilan publik mengikuti [design system akademi](../docs/albana-docs/design/academy-design-system.md); admin mengikuti dokumennya sendiri. Salin naskah terbit dari [konten beranda](../docs/albana-docs/content/home-page-content.md), bukan teks merek Panggung Kreator di kode lama.
- `app/(web)/register/preview` dan beberapa gambar di `public/images/preview/` adalah pratinjau. Jangan menyajikannya sebagai dokumentasi/testimoni nyata. Slug lama `basic-to-advance` memiliki redirect di route program dan register; pertahankan kompatibilitasnya ketika mengubah slug.
- Gunakan variabel lingkungan sesuai lapisan: `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk client, `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` untuk pembacaan server tertentu, `SUPABASE_SERVICE_ROLE_KEY` untuk operasi terprivileg, `REGISTRATION_RECEIPT_SECRET` untuk token tanda terima. Cari pemakai sebelum mengubah nama atau fallback. Jangan menulis nilai rahasia ke repo.
- Pemeriksaan dari `front/`: `npm run build`, `npx tsc --noEmit`, `npx eslint <berkas-yang-disentuh>`, dan `node --test` untuk tes `.test.mjs` yang relevan di `lib/`. `package.json` belum menyediakan skrip `test`. Lint seluruh repo dapat gagal karena kode lama; laporkan hasil aktual, jangan menyebutnya lulus tanpa menjalankan.

### Hal yang harus diverifikasi sebelum menyimpulkan

- Keadaan produksi/deploy, migrasi database yang sudah diterapkan, isi CMS, izin media, dan status batch tidak dapat dipastikan hanya dari file repo.
- [Dokumen arsitektur sistem](../docs/albana-docs/data/system-architecture.md) dan sebagian rencana masih menggambarkan struktur `web/`, RPC `receive_registration`, atau admin lama. Untuk alur penagihan Albana saat ini, cek `front/app/api/registrations/route.ts` dan migrasi `receive_academy_registration` terlebih dahulu.
- Banyak berkas komunitas lama masih terkompilasi meskipun rutenya mendapat 404. Perubahan pada `proxy.ts`, auth, `globals.css`, root layout, atau Supabase tetap perlu pemeriksaan alur Albana dan daftar rute yang diizinkan.
