# Admin Image Replace & Storage Cleanup Implementation Plan

> **Goal:** Memastikan setiap gambar yang diedit/diganti atau dihapus pada seluruh menu Admin (baik *single image* maupun *multiple gallery images*) otomatis menghapus file lama di Supabase Storage dan menggantinya dengan yang baru, sehingga tidak ada file menumpuk (*orphan files / storage bloat*) di storage.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Storage (`@supabase/supabase-js` & `@supabase/ssr`), Sharp, `node --test`.

---

## 1. Peta Menu Admin & Celah Storage Saat Ini

| Menu Admin | Komponen / Action | Tipe Gambar | Bucket Storage | Celah Saat Ini |
| :--- | :--- | :--- | :--- | :--- |
| **Dokumentasi In House** (`/admin/galeri`)<br>**Trainer** (`/admin/trainer`)<br>**Testimoni** (`/admin/testimoni`) | `components/admin/cms/CmsCollectionClient.tsx` | Single (`type: "gallery"`) | `gallery`, `testimonials` | Mengganti/menghapus foto atau membatalkan dialog tidak menghapus file lama/sementara dari storage; hapus baris tidak menghapus file di storage. |
| **Galeri & Dokumentasi Program** (`/admin/program/[slug]` & `/admin/settings?tab=inhouse-training`) | `components/admin/program/ProgramMediaEditor.tsx`<br>`app/api/upload/route.ts`<br>`app/(admin)/admin/program/actions.ts` | **Multiple** (10–20 foto) | `public-speaking-series`, `public-speaking-for-speakers`, `sertifikasi-pembicara-profesional`, `academy-media` | Belum ada fitur **Ganti (Replace)** untuk 1 foto maupun **Multiple Replace**; belum ada **Multiple Delete**. |
| **Our Partner** (`/admin/partner`) | `app/(admin)/admin/partner/PartnerClient.tsx`<br>`app/(admin)/admin/partner/actions.ts` | Single (`logo_url`) | `gallery` | `savePartner` & `deletePartner` tidak menghapus `logo_url` lama/terhapus dari storage. |
| **Pengaturan → Legalitas** (`/admin/settings?tab=legalitas`) | `app/(admin)/admin/settings/LegalityClient.tsx`<br>`app/(admin)/admin/settings/legality-actions.ts` | **Multiple Slot** (5 dokumen) | `legality` | `saveAcademyLegality` tidak menghapus file dokumen lama yang diganti/dihapus dari bucket `legality`. |
| **Venue** (`/admin/venue/addVenue`) | `app/(admin)/admin/venue/addVenue/AddVenueClient.tsx`<br>`lib/actions/venue-actions.ts` | **Multiple** (`photo_urls[]`) | `venues` | Belum ada tombol Ganti per foto; `deleteVenueAction` tidak menghapus `photo_urls` dari storage. |
| **Galeri Album, Acara, Partner & Resources** | `lib/actions/gallery-actions.ts`<br>`AddGalleryClient.tsx`, `EventGalleryModal.tsx`, `AcaraEditForm.tsx`<br>`lib/actions/partner-actions.ts`, `lib/actions/resource-actions.ts` | Single & **Multiple Delete** | `gallery`, `partners`, `resources` | `deleteMultipleGalleryAlbumsAction`, `deleteGalleryAlbumAction`, `deletePartnerAction`, `deleteResourceAction` tidak membersihkan storage. |

---

## 2. Prinsip Implementasi

1. **Upload Baru → Update DB → Hapus File Lama:** Penghapusan file lama di storage hanya dilakukan setelah update database berhasil. Jika update database gagal, file baru yang di-rollback/dihapus.
2. **Pencegahan Orphan File pada Form/Dialog:** URL sementara yang diunggah selama sesi dialog terbuka dilacak dan otomatis dihapus jika ditimpa lagi sebelum simpan atau jika admin menekan **Batal / Reset**.
3. **Dukungan Single & Multiple Replace pada Galeri Program:**
   - **Single Replace:** Tombol **Ganti** pada tiap kartu foto memanggil `POST /api/upload` dengan `replaceAssetId`.
   - **Multiple Replace & Multiple Delete:** Checkbox multi-select pada grid foto memungkinkan penggantian beberapa foto terpilih sekaligus (menghapus semua file lama terkait) serta penghapusan beberapa foto sekaligus.

---

## 3. Daftar Tugas (Tasks)

### Task 1: Perkuat Utilitas Cleanup Storage & Unit Test
- [ ] Update `front/lib/supabase/storage-cleanup.ts`:
  - Tambahkan bucket `"testimonials"`, `"legality"`, `"academy-media"`, `"public-speaking-series"`, `"public-speaking-for-speakers"`, `"sertifikasi-pembicara-profesional"`, `"payment-proofs"` ke `KNOWN_BUCKETS`.
  - Tambahkan helper `getRemovedStorageUrls(oldUrls, newUrls)` untuk menghitung daftar URL lama yang diganti atau dihapus (mendukung query `?t=...` dan array/multiple URLs).
- [ ] Buat `front/lib/supabase/storage-cleanup.test.mjs` dan verifikasi dengan `node --test`.

### Task 2: Replace & Cleanup Otomatis di `CmsCollectionClient`
- [ ] Update `front/components/admin/cms/CmsCollectionClient.tsx`:
  - Lacak URL unggahan sementara per sesi dialog (`sessionUploadedUrlsRef`).
  - Saat admin klik **Ganti foto** atau **Hapus foto** di dalam dialog, bersihkan URL sementara sesi yang tidak terpakai; saat klik **Batal**, bersihkan semua URL sementara sesi.
  - Setelah `update` berhasil di `handleSubmit`, hapus file lama dari storage jika URL field `"gallery"` berubah atau dikosongkan.
  - Setelah `handleDelete` berhasil, hapus semua file field `"gallery"` milik baris tersebut dari storage.

### Task 3: Single & Multiple Replace/Delete di Galeri Program (`ProgramMediaEditor` & `/api/upload`)
- [ ] Update `front/app/api/upload/route.ts`:
  - Tambahkan dukungan `replaceAssetId` pada `purpose === "program"` (melewati cek batas 20 foto, mengunggah file WebP baru, memperbarui `media_assets`, dan menghapus `object_key` lama dari bucket program / `academy-media`).
  - Tambahkan handler `DELETE /api/upload` (khusus admin) untuk membersihkan file sementara yang dibatalkan dari client (`PartnerClient`, `LegalityClient`).
- [ ] Update `front/app/(admin)/admin/program/actions.ts`:
  - Tambahkan `removeMultipleProgramMedia(ids: number[])` untuk menghapus banyak foto sekaligus dari `media_assets` dan storage bucket.
- [ ] Update `front/components/admin/program/ProgramMediaEditor.tsx`:
  - Tambahkan tombol **Ganti** per kartu foto (single replace).
  - Tambahkan mode seleksi multi-foto (checkbox + bilah aksi) untuk **Ganti N foto terpilih** (multiple replace) dan **Hapus N foto terpilih** (multiple delete).

### Task 4: Cleanup Storage pada `PartnerClient` & `LegalityClient`
- [ ] Update `front/app/(admin)/admin/partner/actions.ts` (`savePartner` & `deletePartner`) agar menghapus `logo_url` lama/terhapus dari storage via `academyBillingClient()`.
- [ ] Update `front/app/(admin)/admin/partner/PartnerClient.tsx` untuk membersihkan logo sementara jika diganti berulang atau dibatalkan sebelum simpan.
- [ ] Update `front/app/(admin)/admin/settings/legality-actions.ts` (`saveAcademyLegality`) agar membandingkan `legality` lama dan baru, lalu menghapus file yang diganti/dihapus dari bucket `legality`.
- [ ] Update `front/app/(admin)/admin/settings/LegalityClient.tsx` untuk membersihkan file sementara jika diganti berulang atau di-reset sebelum simpan.

### Task 5: Perbaikan Replace & Multiple Cleanup pada Venue, Galeri Album, Acara, Partner & Resources
- [ ] Update `front/app/(admin)/admin/venue/addVenue/AddVenueClient.tsx` & `front/lib/actions/venue-actions.ts` (tombol ganti per foto, cleanup setelah save, dan cleanup semua `photo_urls` saat `deleteVenueAction`).
- [ ] Update `front/lib/actions/gallery-actions.ts` (cleanup `hero_image_url` pada `saveGalleryAlbumAction`, `deleteGalleryAlbumAction`, dan `deleteMultipleGalleryAlbumsAction`).
- [ ] Sederhanakan cleanup di `AddGalleryClient.tsx`, `EventGalleryModal.tsx`, dan `AcaraEditForm.tsx` agar memakai `deleteStorageFile` dari `@/lib/supabase/storage-cleanup`.
- [ ] Update `front/lib/actions/partner-actions.ts` dan `front/lib/actions/resource-actions.ts` untuk membersihkan `logo_url` / `file_url` lama saat update dan delete.

### Task 6: Verifikasi Akhir
- [ ] Jalankan `node --test lib/supabase/storage-cleanup.test.mjs` dan `node --test lib/program-media.test.mjs`.
- [ ] Jalankan `npx tsc --noEmit`.
- [ ] Jalankan `npx eslint` pada seluruh berkas yang diubah.
