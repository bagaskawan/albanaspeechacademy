# Backup gaya — Albana Speech Academy

Snapshot tanggal **8 November 2026**, dibuat sebelum redesign opsi B
(meniru referensi "smooth" + menghapus `font-mono`).

Alasan backup ada: seluruh berkas gaya (`web/app/globals.css`,
`web/app/layout.tsx`, `docs/design.md`) **belum masuk git**, jadi gaya lama
tidak bisa dipulihkan dari riwayat commit. Salinan di folder ini adalah
satu-satunya jalan pulang ke gaya lama.

## Isi folder

| Berkas | Menggantikan | Isi |
|---|---|---|
| `classic-globals.css` | `web/app/globals.css` | Token warna, radius, skala, dan kelas komponen gaya lama |
| `classic-layout.tsx` | `web/app/layout.tsx` | Pemuatan font IBM Plex Mono (dihapus di gaya baru) |
| `classic-design.md` | `docs/design.md` | Spesifikasi visual gaya lama |

## Ringkasan gaya lama (Classic · `asa-box-minimalist`)

- Warna: kertas hangat `#F4F2ED`, surface `#E9E6DF`, card `#FBFAF7`,
  tinta `#191918` / `#0F1108`, aksen `#1F4E7A`, highlight `#D7E6F4`,
  rule `#D9D4CB`.
- Bentuk: seluruh kartu, panel, tombol, sudut **0 px**, batas garis 1 px,
  tanpa shadow.
- Tipografi: Franklin Gothic ATF (fallback Arial) untuk semua teks +
  IBM Plex Mono untuk metadata (eyebrow, tanggal, nomor).

## Cara memulihkan gaya lama

Dari akar repo:

```powershell
Copy-Item docs/archive/design-backup/classic-globals.css web/app/globals.css -Force
Copy-Item docs/archive/design-backup/classic-layout.tsx   web/app/layout.tsx   -Force
Copy-Item docs/archive/design-backup/classic-design.md    docs/design.md       -Force
```

Lalu dari `web/`: `npm run lint`, `npx --no-install tsc --noEmit`, `npm run build`.

## Varian A (jika dipilih)

A = warna lembut + hapus mono, **tanpa** mengubah tata letak. Nilai token
dan perubahan minimumnya ada di bagian *Varian A* pada
`docs/archive/working-notes/superpowers/specs/2026-11-08-redesign-referensi-smooth-design.md`.
