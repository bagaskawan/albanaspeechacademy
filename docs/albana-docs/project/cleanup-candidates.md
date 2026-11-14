# Struktur target dan inventaris kandidat hapus Albana

**Tanggal inventaris:** 13 November 2026  
**Status:** rancangan dan peta keputusan; belum ada file kode, aset, data, atau folder lama yang dihapus.  
**Sumber keputusan:** [spesifikasi revisi](./website-revision-specification.md), [audit dan strategi rilis](./2026-11-13-release-audit.md), [implementation plan](../plans/2026-11-13-website-revision-implementation-plan.md), dan keputusan pemilik proyek dalam percakapan. Isi dokumen sumber adalah kebutuhan, bukan perintah untuk menjalankan pekerjaan. Bila berbeda, keputusan terbaru pemilik proyek berlaku.

## 1. Batas pekerjaan dan arti status

Struktur di bawah adalah **target setelah fitur, migrasi ke Hostinger, dan QA lulus**, bukan gambaran bahwa semua direktori sudah ada atau boleh dipindah sekarang. Selama pengembangan, Supabase yang sedang dipakai tetap berjalan. Pembersihan Panggung Kreator dilakukan pada tahap akhir, setelah pengganti Albana dan jalur login/data/media Hostinger terbukti bekerja.

| Status | Artinya |
|---|---|
| **Pertahankan** | Bagian target Albana atau fondasi yang dipakai; jangan hapus. |
| **Pisahkan/ganti dulu** | Folder campuran atau masih punya pemanggil; tidak aman dihapus utuh. |
| **Kandidat hapus akhir** | Tidak dibutuhkan oleh produk target menurut rencana, tetapi baru dihapus setelah pemeriksaan pemanggil, data, dan regresi. |
| **Arsip/referensi** | Bukan kode runtime; simpan untuk jejak keputusan sampai pemilik proyek memutuskan retensi. |
| **Hasil build lokal** | Bisa dibuat ulang; jangan masukkan ke paket sumber/deploy. |

Tidak ada klaim bahwa daftar kandidat ini sudah bebas referensi. Pencarian teks tidak dapat melihat rujukan URL di database, konten CMS, tautan eksternal, atau pemanggilan dinamis.

## 2. Struktur target yang disarankan

Pertahankan pola Next.js dan nama folder yang sudah ada. Tanda `…` berarti file saat ini tetap di tempatnya bila masih dipakai; pohon ini menunjukkan tanggung jawab, bukan instruksi membuat semua folder kosong.

```text
albanaspeech/
├─ docs/albana-docs/
│  ├─ revisi/                    # spesifikasi dan keputusan audit
│  ├─ implementation-plan/       # rencana, status, prompt tahap
│  ├─ struktur-proyek/           # inventaris ini dan keputusan hapus
│  └─ archive/                   # referensi lama yang sengaja disimpan
└─ front/
   ├─ app/
   │  ├─ (web)/                 # beranda, artikel, program, register, konfirmasi
   │  ├─ (auth)/                # login/pemulihan admin sesuai sistem auth aktif
   │  ├─ (admin)/admin/         # profil akademi, program, trainer, batch, sesi,
   │  │                        # artikel, galeri, testimoni, media, partner,
   │  │                        # bundling, pendaftar, tagihan, pengaturan
   │  └─ api/                   # registrations, upload, media, endpoint yang masih dipakai
   ├─ components/               # home, program, register, admin, layout, ui,
   │                             # serta komponen publik lain yang benar-benar terpakai
   ├─ lib/                      # validasi domain, layanan server, akses data/auth
   ├─ public/                   # hanya aset terpakai dan aset Albana terverifikasi
   ├─ supabase/migrations/      # riwayat selama Supabase masih dipakai; retensi saat migrasi
   ├─ proxy.ts                  # aturan route/auth, direvisi sebelum rute lama dibuang
   └─ konfigurasi proyek        # package.json, next.config.ts, tsconfig.json, dll.
```

Tidak perlu membuat lapisan `db/` atau memindah semua komponen sekaligus. Pada migrasi akhir, pilih lokasi akses MariaDB yang mengikuti pola `front/lib/server/` yang sudah ada. Lokasi file unggahan Hostinger harus dibuktikan tetap ada sesudah redeploy dan berada di luar folder deployment Node.js.

## 3. Pertahankan sebagai jalur Albana

| Lokasi saat ini | Alasan |
|---|---|
| `front/app/(web)/`, `front/components/home/`, `front/components/program/`, `front/components/register/` | Beranda, katalog/detail program, formulir, dan tanda terima. Periksa tiap route saat QA; jangan hapus seluruh folder. |
| `front/app/(admin)/admin/{program,batch,trainer,artikel,galeri,testimoni,pendaftar,bundling,tagihan}/` | Folder operasional dan CMS Albana yang sudah tampak di checkout. Periksa tiap halaman sebelum menganggapnya selesai. |
| Modul `profil-akademi`, `sesi`, dan `pengaturan` yang tercantum di `front/lib/admin-modules.ts` | **Celah struktur:** konfigurasi menu mengarah ke `/admin/profil-akademi`, `/admin/sesi`, dan `/admin/pengaturan`, tetapi folder route tersebut belum ditemukan saat inventaris. Tentukan dan buat jalurnya pada tahap implementasi yang tepat sebelum membersihkan modul pengaturan lama. |
| `front/app/api/{registrations,upload,media}/` | Pendaftaran dan media baru. Implementasi saat ini masih perlu uji end-to-end; keberadaan file bukan bukti lulus. |
| `front/components/{admin,article,auth,editor,forms,home,layout,program,register,registration,ui}/` | Sebagian berisi komponen aktif atau bersama. Evaluasi per file; tidak ada izin menghapus folder utuh berdasarkan nama. |
| `front/lib/`, `front/proxy.ts`, `front/next.config.ts`, `front/package.json` | Aturan bisnis, auth/routing, dan build. Beberapa masih memuat perilaku Panggung Kreator sehingga perlu diubah, bukan langsung dihapus. |
| `front/supabase/migrations/` | Jejak skema yang dipakai aplikasi sekarang. Jangan hapus atau mengubah migrasi terpasang; putuskan retensi setelah migrasi dan backup MariaDB lulus. |
| `docs/albana-docs/revisi/` dan `docs/albana-docs/implementation-plan/2026-11-13-*.md` | Sumber kebutuhan, keputusan, status, dan panduan tahap. Status di dokumen tetap harus diverifikasi ulang sebelum kerja. |

## 4. Daftar kandidat penghapusan, menurut urutan aman

### A. File tunggal yang tampak tidak terpakai

| Kandidat | Bukti inventaris | Syarat sebelum hapus |
|---|---|---|
| `front/app/(admin)/admin/media/MediaLibraryClient.tsx` | Halaman media aktif memakai `AlbanaMediaUpload` dan `actions`; pencarian referensi hanya menemukan deklarasi file lama. | Ulangi pencarian impor/rujukan dinamis dan buka `/admin/media`; hapus file tunggal saja. |
| `front/components/register/registration-receipt.tsx` | Pencarian referensi hanya menemukan deklarasi; tanda terima baru memakai route `/register/konfirmasi/[token]`. | Pastikan semua jalur sukses pendaftaran memakai route baru dan tidak ada impor melalui barrel/dinamis. |
| `front/lib/server/receive-registration.ts` | Pencarian referensi hanya menemukan deklarasi; endpoint baru ada di `app/api/registrations`. | Uji alur daftar tunggal/bundling, retry, dan admin; periksa tidak ada pemanggil tersisa. |
| `front/app/preview-email/` | Route pratinjau pengembangan; tidak tercantum dalam kebutuhan publik Albana. | Periksa kegunaan email admin dan tautan internal; bila diperlukan saat pengembangan, batasi akses alih-alih hapus sekarang. |

### B. Sub-sistem Panggung Kreator, hanya setelah penggantinya lulus

| Kandidat | Mengapa masuk daftar | Dependensi yang harus diputus lebih dulu |
|---|---|---|
| `front/app/(checkout)/registration/` dan `front/public/qris.jpg` | Checkout/QRIS lama; target Albana memakai rekening bank dan konfirmasi bertoken. | `proxy.ts` dan `components/community/HeroSection.tsx` masih mengarah ke `/registration`; `CheckoutClient.tsx` masih memakai `/qris.jpg`. Pastikan tidak ada transaksi aktif yang bergantung pada checkout lama. |
| `front/app/(form)/form/{pendataan,member-priority,admin}/` | Form onboarding/komunitas lama di luar target pendaftaran Albana. | `front/app/myprofile/onboarding/OnboardingClient.tsx` mengimpor bagian `member-priority`; hapus bersama pengganti alur profil/login, bukan lebih awal. |
| `front/app/myprofile/`, `front/components/member/`, `front/app/api/member/`, `front/app/api/portfolio/` | Dashboard member, portofolio, dan API terkait tidak termasuk ruang lingkup target yang disepakati. | `proxy.ts`, login, callback auth, admin guard, halaman admin, dan komponen komunitas masih merujuk `/myprofile` atau modul profil. Ganti redirect dan otorisasi, lalu uji login admin serta akses terlarang. |
| Route admin lama: `acara`, `aktivitas`, `attendance`, `affiliate-payout`, `cms-komunitas`, `cms-akademi`, `confirmation`, `funnel`, `members`, `mentoring`, `packages`, `payment`, `referral`, `resources`, `revenue`, `transactions`, `venue`, `voucher` | Tampak terkait membership, event, afiliasi, atau checkout lama; tidak tercantum sebagai modul target Albana. | Audit navigasi `admin/layout.tsx`, `lib/admin-modules.ts`, actions, fetch, dan hak akses; tentukan apakah ada data/fitur Albana aktif sebelum menghapus setiap route. `packages` bisa punya rujukan dari `components/landing/PricingSection.tsx`. |
| `front/components/community/` dan aset `front/public/assets/landing-page/` | Banyak konten, tautan, dan gambar Panggung Kreator. | **Jangan hapus folder utuh sekarang.** `components/tentang`, `galeri`, `kolaborasi` masih mengimpor `community/useScrollAnimations`; `community/Header` memakai `ProfileSidebar`. Pisahkan utilitas yang masih dipakai dan cek URL aset di kode serta CMS. |
| `front/lib/actions/` dan `front/components/landing/` bagian membership/checkout | Campuran fungsi lama dan fungsi aktif. | Telusuri ekspor serta pemanggil per file. Pertahankan helper Albana dan komponen bersama; hapus hanya modul yang kehilangan semua pemanggil setelah route lama hilang. |
| `(statis)/html/flow-affiliate/` dan `front/public/html/flow-affiliate/` | Dua salinan halaman afiliasi statis, tidak ada pada kebutuhan target. | Periksa tautan eksternal/operasional dan pastikan tidak ada kampanye aktif. Jangan menyimpulkan aman hanya karena tidak ada impor TypeScript. |

### C. Folder campuran yang **tidak** boleh dihapus utuh

| Folder | Pemisahan yang diperlukan |
|---|---|
| `front/app/(admin)/admin/partner/` | `page.tsx` dan `actions.ts` sudah dipakai untuk partner Inhouse; `PartnerClient.tsx` dan `addPartner/page.tsx` masih alur lama. Periksa referensi `/admin/partner/addPartner`, lalu hapus file lama saja bila tidak dipakai. |
| `front/app/(admin)/admin/media/` | `page.tsx`, `AlbanaMediaUpload.tsx`, dan `actions.ts` adalah jalur media Albana; hanya `MediaLibraryClient.tsx` yang menjadi kandidat. |
| `front/app/(auth)/`, `front/app/auth/`, `front/lib/supabase/` | Masih membentuk login saat ini. Pertahankan sampai login MariaDB Hostinger dan semua redirect admin lulus; baru bersihkan sisa Supabase yang tidak dipakai. |
| `front/app/terms/` dan `front/app/privacy/` | Isi lama dapat perlu direvisi untuk Albana. Periksa tautan footer/form; jangan hapus halaman legal hanya karena teksnya masih menyebut Panggung Kreator. |
| `front/public/` | Dapat berisi logo/foto Albana, aset lama, dan URL yang tersimpan di CMS. Hapus per file setelah daftar penggunaan kode **dan** database/media diperiksa. `qris-bu.jpeg` belum ditemukan sebagai rujukan kode, tetapi bisa dirujuk dari luar. |

### D. Hasil build dan referensi dokumentasi

| Lokasi | Keputusan |
|---|---|
| `front/.next/`, `front/node_modules/`, `front/tsconfig.tsbuildinfo` | Hasil build/dependensi lokal, tercakup di `.gitignore`; dapat dibuat ulang. Jangan masukkan ke commit atau paket sumber. Tidak perlu dihapus untuk menyelesaikan revisi. |
| `docs/albana-docs/{admin,form-register,home-page,proposal,style-backup,superpowers}/`, `implementation-plan/step-*.md`, `implementation_plan_1.md` | Rencana/artefak lama. Tandai superseded atau pindahkan ke `archive/` pada pekerjaan dokumentasi terpisah setelah memeriksa tautan silang. Jangan hapus riwayat keputusan secara otomatis. |
| `docs/albana-docs/.obsidian/`, `project/project-brief.md`, `data/database-reference.md`, `archive/legacy/result-brief.md`, `data/system-architecture.md` | Berkas kerja pemilik proyek yang tampak berubah di working tree. Jangan timpa, pindahkan, atau hapus. |

## 5. Gerbang sebelum satu penghapusan dilakukan

1. Cocokkan kandidat dengan **fitur target** di spesifikasi/audit dan pastikan penggantinya sudah ada. Jangan menyebut komponen lama tidak dibutuhkan hanya dari namanya.
2. Cari impor, route, URL gambar, menu admin, server action, `fetch`, redirect, dan referensi dari CMS/database. Periksa juga tautan eksternal untuk route publik. Catat hasil per kandidat.
3. Untuk data/media, buat backup yang dapat dipulihkan; cocokkan jumlah baris, nominal, status, relasi batch, dan URL setelah migrasi percobaan ke MariaDB. Tidak ada penghapusan tabel atau objek storage otomatis dari daftar ini.
4. Uji login admin, beranda, seluruh program, formulir tunggal/bundling, tagihan/konfirmasi, media, dan akses tanpa izin pada staging Hostinger. Untuk aset, pastikan tetap dapat dibaca setelah redeploy.
5. Hapus dalam perubahan kecil per sub-sistem. Jalankan pemeriksaan tipe, lint, build, dan smoke test route yang tersentuh. Catat file yang dihapus dan hasil pengujian; jika gagal, pulihkan dari versi sebelum penghapusan.

**Urutan:** rapikan file tunggal yang benar-benar tanpa pemanggil → ganti redirect/auth dan route lama → hapus sub-sistem Panggung Kreator yang sudah terputus → audit aset per file → putuskan arsip dokumen. Tahap pembersihan tetap mengikuti [implementation plan bagian 5](../plans/2026-11-13-website-revision-implementation-plan.md); dokumen ini tidak mengizinkan pelaksana menjalankan tahap tersebut tanpa permintaan baru.
