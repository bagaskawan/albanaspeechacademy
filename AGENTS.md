# AGENTS.md

Panduan untuk semua agen AI (Codex, Cursor, Copilot, Gemini, Claude, dan lainnya) yang bekerja di repo ini.

## Implementation Plans (Albana)

Saat diminta membuat implementation plan:

- Gunakan skill `superpowers:writing-plans` bila tersedia. Jika tidak tersedia, ikuti strukturnya secara manual: Goal, Architecture, Tech Stack, lalu task bernomor dengan langkah dan verifikasi.
- Simpan hasilnya di `docs/albana-docs/plans/`, bukan `docs/superpowers/plans/`.
- Nama berkas: `YYYY-MM-DD-<topik>.md`. Gunakan tanggal hari ini. Topik memakai kebab-case huruf kecil, tanpa spasi.
- Setelah berkas dibuat, tambahkan tautannya ke `docs/albana-docs/README.md` jika indeks dokumentasi memuat daftar plan.
- Tulis plan dalam Bahasa Indonesia, sesuai dokumen lain di `docs/albana-docs/`.

## Dokumentasi proyek

Indeks dokumentasi ada di `docs/albana-docs/README.md`. Baca indeks itu sebelum mengerjakan tugas yang menyentuh dokumentasi. Untuk pekerjaan di `front/`, lihat juga `front/AGENTS.md`.
