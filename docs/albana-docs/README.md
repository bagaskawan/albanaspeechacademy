# Albana Speech Academy — dokumentasi

Peta dokumen proyek. Root hanya berisi indeks; dokumen dikelompokkan menurut fungsi.

## Mulai dari sini

Mulai dari dokumen berikut. Skema database diperbarui setelah pembersihan 15 November 2026; dokumen audit akses dan sebagian arsitektur masih merekam keadaan sebelumnya sampai diaudit ulang.

| Dokumen | Isi |
| --- | --- |
| [PRD](project/product-requirements.md) | Tujuan, pengguna, cakupan, kebutuhan berstatus, gerbang rilis. |
| [Arsitektur sistem](architecture/system-architecture.md) | Stack, struktur kode, tiga jalur akses data, alur pendaftaran dan media, utang arsitektur. |
| [Skema database](data/database-schema.md) | 18 tabel Albana setelah migrasi, relasi, kolom, fungsi, trigger, bucket. |
| [Kontrol akses](data/access-control.md) | Arsip audit RLS/grant sebelum pembersihan; perlu audit ulang. |
| [Struktur admin](architecture/admin-structure.md) | Sidebar sasaran, peran, modul → rute → tabel → jalur tulis, rute warisan. |
| [Referensi API](architecture/api-reference.md) | Route Handler, Server Actions, kontrak RPC. |
| [Lingkungan dan operasi](project/environment-setup.md) | Variabel lingkungan, migrasi, data awal, menambah admin, daftar periksa rilis. |

## Acuan utama

- [Brief proyek](project/project-brief.md) — tujuan, cakupan, dan keputusan produk.
- [Spesifikasi revisi website](project/website-revision-specification.md) — kebutuhan revisi terkini.
- [Audit rilis 13 November](project/2026-11-13-release-audit.md) — prioritas, risiko, dan gerbang rilis.
- [Implementation plan redesign dan restrukturisasi](plans/2026-11-16-redesign-restructure-implementation-plan.md) — **urutan kerja aktif**: 9 fase bernomor dengan checklist untuk database, pendaftaran, admin, landing page, pembersihan, QA, dan rilis.
- [Rencana implementasi 13 November](plans/2026-11-13-website-revision-implementation-plan.md) — urutan lama; digantikan rencana 16 November untuk pekerjaan redesign.
- [Status dan langkah berikutnya](plans/2026-11-13-status-and-next-steps.md) — kondisi pengerjaan yang tercatat.
- [Strategi prompt bertahap](plans/2026-11-13-staged-llm-prompt-strategy.md) — panduan pengerjaan bertahap.

## Dokumen per topik

- **Layout dan pola UI (16 November):** [layout landing page](design/academy-landing-layout.md) — susunan seksi beranda menurut tujuh prioritas spesifikasi revisi; [pola UI admin — Monochrome Soft](design/admin-ui-patterns.md) — arah visual admin terbaru (Poppins, monokrom + kuning), templat halaman, dialog, formulir, daftar data, skeleton, dan gerak CMS; [konten beranda](content/home-page-content.md) — naskah storytelling dan resep gerak scroll dua arah.
- **Desain:** [design system akademi biru-putih](design/academy-design-system.md) untuk arah publik terbaru, [aturan visual lintas kanal](design/visual-design.md) yang aktif untuk token, tipografi, dan gerak bersama, [design system admin](design/admin-design-system.md), [prompt Stitch untuk CMS](design/stitch-admin-cms-prompt.md).
- **Data dan arsitektur (riwayat MVP 10 November, sudah digantikan dokumen di atas):** [referensi database](data/database-reference.md), [skema SQL](data/albana-schema.sql), [data awal](data/seed-data.sql), [arsitektur sistem lama](data/system-architecture.md).
- **Peta menu dan alur backend:** [struktur menu, input CMS, dan pendaftaran](architecture/README.md) dengan tiga diagram HTML mandiri. Dokumen ini membedakan rute Albana yang aktif, rute warisan, dan usulan menu.
- **Pendaftaran:** [kontrak formulir](registration/registration-contract.md), [formulir per program](registration/forms/), [rancangan CMS Program, Batch, dan Bundling](registration/cms-program-batch-bundling.md).
- **Konten:** [konten beranda](content/home-page-content.md), [proposal akademi](content/academy-proposal.md).
- **Kandidat pembersihan kode:** [inventaris dan dependensi](project/cleanup-candidates.md).

## Arsip

Dokumen lama, rancangan yang telah digantikan, catatan kerja, dan cadangan disimpan di [archive/](archive/). Arsip adalah bahan rujukan historis, bukan instruksi aktif.
