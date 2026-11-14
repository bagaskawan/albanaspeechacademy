# Sidebar Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan pengaturan global untuk menampilkan atau menyembunyikan modul pada sidebar admin desktop dan mobile.

**Architecture:** Simpan slug modul tersembunyi pada kolom array teks di baris tunggal `public.academy`, lalu akses melalui helper server dan Route Handler khusus admin. Layout admin membaca konfigurasi pada server dan meneruskannya sebagai props ke navigasi; halaman `/admin/sidebar-layout` menyimpan perubahan dan me-refresh layout setelah berhasil.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, PostgreSQL/Supabase REST dan RLS, Node test runner.

**Spec:** `docs/archive/working-notes/superpowers/specs/2026-11-10-sidebar-visibility-design.md`

## Global Constraints

- Konfigurasi berlaku global untuk semua admin, bukan per akun atau perangkat.
- Ringkasan dan Pengaturan selalu terlihat dan tidak memiliki switch.
- Input server hanya menerima slug yang terdaftar pada `adminModules`.
- Kegagalan membaca konfigurasi tidak boleh memutus shell admin; sidebar kembali menampilkan semua modul.
- Tidak menambah tabel, dependency, pengurutan menu, grup menu, atau permission per modul.
- Perubahan database harus expand-only dan dapat diabaikan aplikasi saat rollback.
- Gunakan bahasa Indonesia, kontrol native, fokus terlihat, target sentuh minimal 44 px, dan pola visual admin yang sudah ada.

## Review Focus

- Kolom database belum diterapkan: shell tetap tampil lengkap dan halaman pengaturan menunjukkan pemulihan, bukan crash.
- Payload berisi slug asing, tipe selain array, atau anggota selain string: server menolak dengan status 422 dan tidak menulis data.
- Payload berisi slug ganda atau urutan acak: konfigurasi dinormalisasi mengikuti urutan `adminModules`.
- Semua modul dimatikan: Ringkasan, Tampilan sidebar, dan Pengaturan tetap dapat dicapai pada desktop maupun mobile.
- Penyimpanan gagal atau koneksi terputus: pilihan pengguna tetap berada di layar dan dapat dicoba kembali.

---

### Task 1: Kontrak modul dan migrasi expand-only

**Files:**
- Create: `web/lib/admin-sidebar.test.mjs`
- Create: `web/lib/admin-sidebar.ts`
- Create: `web/db/admin-sidebar-settings.sql`

**Interfaces:**
- Consumes: `adminModules: AdminModule[]` dari `web/lib/admin-modules.ts`.
- Produces: `parseHiddenAdminModules(value: unknown): string[] | null`, `hiddenAdminModulesFromStorage(value: unknown): string[]`, dan `visibleAdminModules(hiddenModuleSlugs: readonly string[]): AdminModule[]`.

- [ ] **Step 1: Tulis tes gagal untuk parsing dan filtering**

  Tambahkan tes Node yang memastikan array valid dinormalisasi ke urutan modul, duplikat dibuang, nilai non-array/non-string/slug asing menghasilkan `null`, dan `visibleAdminModules` menghapus hanya slug yang dipilih.

- [ ] **Step 2: Jalankan tes dan pastikan gagal**

  Run: `cd web; node --test lib/admin-sidebar.test.mjs`
  Expected: FAIL karena `admin-sidebar.ts` belum ada.

- [ ] **Step 3: Implementasikan helper domain minimal**

  Buat `parseHiddenAdminModules(value: unknown): string[] | null`, `hiddenAdminModulesFromStorage(value: unknown): string[]`, dan `visibleAdminModules(hiddenModuleSlugs: readonly string[]): AdminModule[]`. Parser strict menolak payload asing; pembaca storage mengubah data lama atau rusak menjadi `[]`. Gunakan daftar `adminModules` sebagai satu-satunya sumber slug yang sah.

- [ ] **Step 4: Tambahkan migrasi SQL idempotent**

  `admin-sidebar-settings.sql` menambahkan `public.academy.hidden_admin_modules text[] not null default '{}'`, memakai transaksi, dan memverifikasi kolom tersedia. Jangan membuat tabel atau kebijakan baru karena tabel `academy` sudah memakai kebijakan CMS admin.

- [ ] **Step 5: Jalankan tes dan pastikan lulus**

  Run: `cd web; node --test lib/admin-sidebar.test.mjs`
  Expected: seluruh tes PASS.

- [ ] **Step 6: Commit terarah**

  ```bash
  git add web/lib/admin-sidebar.ts web/lib/admin-sidebar.test.mjs web/db/admin-sidebar-settings.sql
  git commit -m "feat: add global sidebar visibility contract"
  ```

### Task 2: Persistensi tervalidasi dan navigasi bersama

**Files:**
- Create: `web/lib/server/admin-sidebar.ts`
- Create: `web/app/api/admin/sidebar/route.ts`
- Modify: `web/components/admin/admin-module-layout.tsx`
- Modify: `web/components/admin/admin-shell.tsx`
- Modify: `web/components/admin/admin-sidebar.tsx`
- Modify: `web/components/admin/admin-topbar.tsx`
- Modify: `web/components/admin/admin-nav.tsx`
- Modify: `web/lib/admin-modules.ts`
- Test: `web/lib/admin-sidebar.test.mjs`

**Interfaces:**
- Consumes: `parseHiddenAdminModules` dan `visibleAdminModules` dari Task 1; `findCmsRow` dan `writeCmsRow` dari `web/lib/server/cms-data.ts`.
- Produces: `readHiddenAdminModules(accessToken: string): Promise<string[]>`, `writeHiddenAdminModules(accessToken: string, hiddenModuleSlugs: string[]): Promise<string[]>`, dan prop `hiddenModuleSlugs: string[]` pada shell serta navigasi.

- [ ] **Step 1: Tambahkan tes gagal untuk fallback dan menu yang selalu terlihat**

  Perluas tes agar `hiddenAdminModulesFromStorage` mengubah nilai database rusak menjadi daftar kosong, `visibleAdminModules` dapat menghasilkan daftar modul kosong, dan `adminSidebarMenu` serta `adminSettingsMenu` tidak menjadi bagian dari `adminModules` yang dapat disembunyikan.

- [ ] **Step 2: Jalankan tes dan pastikan gagal**

  Run: `cd web; node --test lib/admin-sidebar.test.mjs`
  Expected: FAIL pada helper fallback yang belum tersedia.

- [ ] **Step 3: Implementasikan akses server**

  Buat helper server yang membaca dan menulis kolom `hidden_admin_modules` pada `academy.id = 1`. Pembacaan nilai tidak valid kembali ke `[]`; hasil tulis kosong atau baris akademi yang hilang melempar error.

- [ ] **Step 4: Implementasikan Route Handler PATCH**

  Buat `/api/admin/sidebar` yang memeriksa same-origin, `application/json`, sesi dan allowlist admin, lalu memvalidasi `{ hiddenModuleSlugs: unknown }` dengan parser Task 1. Balas 422 untuk payload tidak valid, 200 dengan nilai tersimpan, dan 503 untuk kegagalan database tanpa membocorkan detail.

- [ ] **Step 5: Alirkan konfigurasi dari layout ke kedua navigasi**

  `AdminModuleLayout` membaca konfigurasi dengan fallback `[]`, lalu meneruskannya melalui `AdminShell`, `AdminSidebar`, dan `AdminTopbar` ke `AdminNav`. `AdminNav` memakai `visibleAdminModules` sebelum mengelompokkan modul.

- [ ] **Step 6: Tambahkan tautan permanen ke halaman pengaturan sidebar**

  Ekspor `adminSidebarMenu` dari `admin-modules.ts`, render tautannya bersama `adminSettingsMenu`, dan perbarui label topbar agar `/admin/sidebar-layout` dibaca sebagai `Tampilan sidebar`. Kedua tautan pengaturan tidak ikut filtering.

- [ ] **Step 7: Jalankan tes dan pemeriksaan tipe terfokus**

  Run: `cd web; node --test lib/admin-sidebar.test.mjs; npx --no-install tsc --noEmit`
  Expected: PASS tanpa error.

- [ ] **Step 8: Commit terarah**

  ```bash
  git add web/lib/server/admin-sidebar.ts web/app/api/admin/sidebar/route.ts web/components/admin/admin-module-layout.tsx web/components/admin/admin-shell.tsx web/components/admin/admin-sidebar.tsx web/components/admin/admin-topbar.tsx web/components/admin/admin-nav.tsx web/lib/admin-modules.ts web/lib/admin-sidebar.test.mjs
  git commit -m "feat: apply sidebar visibility to admin navigation"
  ```

### Task 3: Halaman pengaturan, dokumentasi, dan verifikasi

**Files:**
- Create: `web/components/admin/sidebar-visibility-editor.tsx`
- Modify: `web/app/(admin)/admin/sidebar-layout/page.tsx`
- Modify: `web/app/globals.css`
- Modify: `docs/data/database-reference.md`
- Modify: `docs/archive/working-notes/superpowers/specs/2026-11-10-sidebar-visibility-design.md`

**Interfaces:**
- Consumes: `adminModules`, `readHiddenAdminModules`, dan `PATCH /api/admin/sidebar` dari Task 2.
- Produces: halaman `/admin/sidebar-layout` dengan switch per modul dan penyimpanan global.

- [ ] **Step 1: Buat halaman server dengan state gagal yang dapat dipulihkan**

  Ganti redirect dengan halaman bermetadata `Tampilan sidebar | CMS Albana`. Otorisasi memakai `requireAdminAccess`; pembacaan konfigurasi yang gagal diteruskan sebagai `null` agar editor menampilkan pesan dan tautan muat ulang.

- [ ] **Step 2: Implementasikan editor client**

  Render daftar satu baris per `adminModules` dengan nama, grup, status teks, dan checkbox native berperan sebagai switch. Simpan hanya saat ada perubahan; pertahankan draft pada kegagalan; tampilkan status menyimpan, berhasil, atau gagal; panggil `router.refresh()` setelah berhasil.

- [ ] **Step 3: Lengkapi affordance aksesibel tanpa token baru**

  Gunakan kelas admin yang ada, target setiap baris dan switch minimal 44 px, `focus-visible` yang sudah tersedia, serta status yang tidak bergantung pada warna. Tambahkan hanya aturan cursor untuk `.admin-btn:not(:disabled)` bila belum tercakup.

- [ ] **Step 4: Perbarui dokumentasi sumber kebenaran**

  Catat kolom `academy.hidden_admin_modules`, sifat global, fallback kosong, dan file migrasi di `docs/data/database-reference.md`. Ubah status spesifikasi menjadi `Selesai` setelah seluruh pemeriksaan lulus.

- [ ] **Step 5: Jalankan pemeriksaan otomatis penuh**

  Run from `web/`: `node --test lib/admin-sidebar.test.mjs`, `npm run lint`, `npx --no-install tsc --noEmit`, `npm run build`.
  Expected: semua perintah exit 0.

- [ ] **Step 6: Terapkan migrasi pada Supabase dev dan uji alur nyata**

  Terapkan hanya `web/db/admin-sidebar-settings.sql` pada project dev yang terhubung. Buka halaman sebagai admin, matikan satu modul, simpan, verifikasi modul hilang di sidebar desktop dan menu mobile, buka URL modul secara langsung untuk memastikan otorisasi tidak berubah, lalu tampilkan kembali modul. Ulangi pada 1440, 834, 390, dan 320 CSS px serta keyboard-only; periksa console browser.

- [ ] **Step 7: Jalankan pemeriksaan diff**

  Run: `git diff --check; git status --short`
  Expected: tidak ada whitespace error dan hanya file dalam cakupan yang berubah oleh implementasi ini.

- [ ] **Step 8: Commit terarah**

  ```bash
  git add web/components/admin/sidebar-visibility-editor.tsx web/app/\(admin\)/admin/sidebar-layout/page.tsx web/app/globals.css docs/data/database-reference.md docs/archive/working-notes/superpowers/specs/2026-11-10-sidebar-visibility-design.md
  git commit -m "feat: add global sidebar visibility settings"
  ```
