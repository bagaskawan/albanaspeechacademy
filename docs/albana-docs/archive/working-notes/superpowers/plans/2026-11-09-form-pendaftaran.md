# Form Pendaftaran On-Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti tautan Google Form di `/register` dengan formulir pendaftaran satu halaman di dalam situs yang mengirim ke `POST /api/registrations`, untuk ketiga varian batch (`series`, `exclusive`, `bnsp`).

**Architecture:** Satu komponen klien (`registration-form.tsx`) merender bagian A–E dan mengirim JSON; aturan bersama (label varian, daftar pilihan, validasi, pembentuk payload) hidup di modul murni `lib/registration-form.ts` dan diuji dengan `node --test`. Rute baru `app/register/[program]/page.tsx` meresolusi batch menerima dari data katalog (server-only); kartu program menautkan ke `/register/<slug-program>`.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS v4, `node --test` (`.mjs`, strip-types). Data: Supabase REST via `lib/server/academy-api.ts`. Tidak ada runner uji komponen.

**Spec:** `docs/archive/working-notes/superpowers/specs/2026-11-09-form-pendaftaran-design.md`

## Global Constraints

- Radius 0 px pada seluruh panel, kartu, tombol, dan input (`docs/design.md`).
- Font: Inter untuk judul/label/navigasi/tombol, Montserrat untuk isi. Token warna dari `web/app/globals.css`. Jangan mengarang nilai hex.
- Naskah Indonesia. Rupiah dan tanggal WIB lewat formatter bersama (`lib/format.ts`).
- Target sentuh ≥44 px; fokus terlihat; error selalu punya teks; tidak ada warna sebagai satu-satunya penanda.
- `parseRegistration` (`web/lib/registration-input.ts`) adalah otoritas validasi; jangan ubah kontraknya. Kiriman JSON ≤32 KiB.
- Tanpa upload/lampiran, tanpa tema gelap, tanpa menampilkan nomor rekening di halaman publik.
- Kontak WhatsApp resmi: `academyContactLinks.whatsapp` (`web/lib/academy-contact.ts`).
- Perintah dari `web/`: `node --test lib/*.test.mjs`, `npm run lint`, `npx --no-install tsc --noEmit`, `npm run build`.

## Review Focus

Kelas input/kegagalan yang paling mungkin menggigit pemakai; tiap baris punya uji di task yang memiliki kodenya:

1. Batch ditutup atau harga berubah antara saat halaman dimuat dan saat dikirim → server 409; isian tetap, pesan jelas, ada jalan kembali. (Task 5, Task 7)
2. Nomor WhatsApp ditulis dengan spasi/tanda kurung/strip atau petik satu di depan → diterima dan tersimpan sebagai digit. (Task 2)
3. Varian `bnsp` tanpa pertanyaan tantangan → terkirim; `series`/`exclusive` menolak tanpa tantangan. (Task 2)
4. Pilihan "Lainnya" pada sosial media atau sumber info tanpa keterangan teks → ditolak dengan pesan di field terkait. (Task 2)
5. Kirim ganda / email sama pada batch terbuka → hanya satu tersimpan; pesan wajar, isian tidak hilang. (Task 5, Task 7)

## File Structure

- `web/lib/registration.ts` — kontrak data (`RegistrationBatch` diperluas) + helper batch murni (`isAcceptingBatch`, `pickAcceptingBatch`). Menghapus `registrationFormUrl` setelah tak terpakai.
- `web/lib/server/registration-batch.ts` — membaca katalog (server-only); `toRegistrationBatch` memetakan field baru; `readProgramRegistration(programSlug)`.
- `web/lib/registration-form.ts` (baru) — aturan klien aman: naskah varian, daftar pilihan, `emptyRegistrationValues`, `validateRegistration`, `buildRegistrationPayload`.
- `web/lib/registration-form.test.mjs` (baru) — uji modul di atas.
- `web/lib/format.ts` — tambah `formatRupiah`.
- `web/lib/format.test.mjs` (baru) — uji `formatRupiah`.
- `web/lib/registration.test.mjs` (baru) — uji `isAcceptingBatch`/`pickAcceptingBatch`.
- `web/components/ui/field.tsx` (baru) — primitif field domain-free.
- `web/components/register/registration-form.tsx` (baru) — formulir klien.
- `web/components/register/register-page.tsx` — ganti kartu tautan jadi formulir/tanda terima.
- `web/app/register/[program]/page.tsx` (baru) — rute path.
- `web/app/register/page.tsx` — tanpa slug tetap seperti sekarang (keadaan `missing`).
- `web/lib/server/program-showcase.ts` — `registrationUrl` → `/register/<slug-program>`.
- `docs/home-content.md`, `docs/design.md` — perbarui bagian pendaftaran.
- SQL seed dev (Task 7) — dijalankan pemilik di Supabase, tidak dikomit.

---

### Task 1: Kontrak batch + pemilihan batch menerima

**Files:**
- Modify: `web/lib/registration.ts`
- Modify: `web/lib/server/registration-batch.ts`
- Test: `web/lib/registration.test.mjs`

**Interfaces:**
- Produces:
  - `type RegistrationFormKind = "series" | "exclusive" | "bnsp"`
  - `RegistrationBatch` = `{ batchSlug: string; programName: string; batchName: string; formatLabel: string; timeLabel: string; sessions: readonly BatchSession[]; venue: { name: string; address: string }; formKind: RegistrationFormKind; priceIdr: number; feeDetails: string | null; dpPercent: number | null }`
  - `isAcceptingBatch(batch: Record<string, unknown>): boolean`
  - `pickAcceptingBatch(batches: Record<string, unknown>[]): Record<string, unknown> | null` (pilih `accepting_registrations` benar; bila lebih dari satu, yang `sessions[0].starts_at` paling awal)
  - `readProgramRegistration(programSlug: string): Promise<RegistrationSelection>`

- [ ] **Step 1: Tulis uji yang gagal**

`web/lib/registration.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { isAcceptingBatch, pickAcceptingBatch } from "./registration.ts";

test("isAcceptingBatch memakai flag lalu fallback status", () => {
  assert.equal(isAcceptingBatch({ accepting_registrations: true, status: "closed" }), true);
  assert.equal(isAcceptingBatch({ status: "open" }), true);
  assert.equal(isAcceptingBatch({ status: "running" }), false);
});

test("pickAcceptingBatch memilih sesi paling awal di antara yang menerima", () => {
  const picked = pickAcceptingBatch([
    { slug: "b", accepting_registrations: true, sessions: [{ sequence_no: 1, starts_at: "2026-12-01T00:00:00Z" }] },
    { slug: "x", accepting_registrations: false, sessions: [{ sequence_no: 1, starts_at: "2026-11-01T00:00:00Z" }] },
    { slug: "a", accepting_registrations: true, sessions: [{ sequence_no: 1, starts_at: "2026-11-15T00:00:00Z" }] },
  ]);
  assert.equal(picked.slug, "a");
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `node --test lib/registration.test.mjs`
Expected: FAIL — `isAcceptingBatch` belum diekspor.

- [ ] **Step 3: Perluas `web/lib/registration.ts`**

Tambahkan `RegistrationFormKind`, perluas `RegistrationBatch` dengan `batchSlug`, `formKind`, `priceIdr`, `feeDetails`, `dpPercent`. Tambahkan `ACCEPTING_STATUSES` + `isAcceptingBatch` (pindahkan logika dari `registration-batch.ts` dan `program-showcase.ts`) dan `pickAcceptingBatch`. Biarkan `registrationFormUrl` tetap ada untuk sekarang — dihapus di Task 5 setelah importer terakhirnya hilang.

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `node --test lib/registration.test.mjs`
Expected: PASS (2).

- [ ] **Step 5: Petakan field baru di `toRegistrationBatch`**

Di `web/lib/server/registration-batch.ts`, baca `batchSlug` (`slug`), `form_kind`, `price_idr`, `fee_details`, `dp_percent`. Koersi `price_idr`/`dp_percent` ke `number` (`Number(...)`), karena PostgREST `numeric` bisa datang sebagai string. `formKind` di luar `series|exclusive|bnsp` → `null`. `priceIdr` tidak valid (bukan bilangan ≥0) → `null` (batch dianggap belum siap). `feeDetails`/`dpPercent` opsional (`null` bila kosong). Gunakan `isAcceptingBatch` bersama.

- [ ] **Step 6: Tambah `readProgramRegistration`**

`readProgramRegistration(programSlug)`: baca katalog, cari program dengan `slug` itu. Bila tidak ada → `{ status: "missing" }`. Bila ada, ambil `pickAcceptingBatch(batches)`; bila ada dan `toRegistrationBatch` menghasilkan batch → `{ status: "ready", batch }`, selain itu `{ status: "program", program: { slug, title } }`. Kegagalan baca → `{ status: "failed" }`.

- [ ] **Step 7: Cek tipe dan lint**

Run: `npx --no-install tsc --noEmit` lalu `npm run lint`
Expected: tanpa error.

- [ ] **Step 8: Commit**

```bash
git add web/lib/registration.ts web/lib/registration.test.mjs web/lib/server/registration-batch.ts
git commit -m "feat(register): baca formKind/harga/DP batch dan resolusi program"
```

---

### Task 2: Modul aturan formulir (murni, teruji)

**Files:**
- Create: `web/lib/registration-form.ts`
- Test: `web/lib/registration-form.test.mjs`
- Modify: `web/lib/server/program-showcase.ts` (pakai `isAcceptingBatch` bersama)

**Interfaces:**
- Consumes: `RegistrationBatch`, `RegistrationFormKind` (Task 1).
- Produces:
  - `type RegistrationValues = { fullName: string; nickname: string; domicile: string; whatsapp: string; email: string; gender: "" | "Perempuan" | "Laki-laki"; age: string; profession: string; institution: string; socials: string[]; socialOther: string; socialName: string; priorExperience: "" | "yes" | "no"; goal: string; challenge: string; source: "" | "instagram" | "whatsapp" | "referral" | "other"; sourceOther: string; attendance: "" | "yes" | "maybe"; paymentMethod: "" | "full" | "dp"; consent: boolean }`
  - `type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>`
  - `registrationVariantCopy(formKind): { priorExperienceLabel: string; goalLabel: string; challengeLabel: string | null; attendanceLabel: string }`
  - `genderOptions`, `socialOptions`, `sourceOptions` — `readonly { value: string; label: string }[]`
  - `emptyRegistrationValues(): RegistrationValues`
  - `validateRegistration(values, batch): RegistrationErrors`
  - `buildRegistrationPayload(values, batch): Record<string, unknown>`

- [ ] **Step 1: Tulis uji yang gagal**

`web/lib/registration-form.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { parseRegistration } from "./registration-input.ts";
import {
  buildRegistrationPayload, emptyRegistrationValues, registrationVariantCopy, validateRegistration,
} from "./registration-form.ts";

const batch = { batchSlug: "s1", programName: "P", batchName: "B", formatLabel: "4 pertemuan",
  timeLabel: "09.00–17.00 WIB", sessions: [], venue: { name: "V", address: "A" },
  formKind: "series", priceIdr: 1500000, feeDetails: null, dpPercent: 20 };

const filled = () => ({ ...emptyRegistrationValues(), fullName: "Budi", nickname: "Bud", domicile: "Bandung",
  whatsapp: "'0812-3456-7890", email: "budi@example.invalid", gender: "Laki-laki", age: "25",
  profession: "Karyawan", goal: "Tujuan", challenge: "Tantangan", source: "instagram",
  attendance: "yes", paymentMethod: "full", consent: true });

test("naskah bnsp menyembunyikan tantangan, series menampilkannya", () => {
  assert.equal(registrationVariantCopy("bnsp").challengeLabel, null);
  assert.match(registrationVariantCopy("series").challengeLabel, /tantangan/i);
});

test("nilai kurang menandai field wajib", () => {
  const errors = validateRegistration(emptyRegistrationValues(), batch);
  for (const key of ["fullName", "email", "whatsapp", "gender", "age", "profession", "goal", "challenge", "source", "attendance", "paymentMethod"]) {
    assert.ok(errors[key], `harus ada error untuk ${key}`);
  }
});

test("pilihan Lainnya butuh keterangan", () => {
  const errors = validateRegistration({ ...filled(), source: "other", sourceOther: "" }, batch);
  assert.ok(errors.sourceOther);
});

test("payload lolos parseRegistration untuk tiap varian", () => {
  for (const formKind of ["series", "exclusive", "bnsp"]) {
    const b = { ...batch, formKind };
    const payload = buildRegistrationPayload(filled(), b);
    const parsed = parseRegistration(payload);
    assert.ok(parsed, `gagal untuk ${formKind}`);
    if (formKind === "bnsp") assert.equal(parsed.participant.answers.challenge, null);
    else assert.equal(parsed.participant.answers.challenge, "Tantangan");
    assert.equal(parsed.participant.whatsapp, "081234567890");
  }
});

test("DP tanpa dpPercent batch ditolak klien", () => {
  const errors = validateRegistration({ ...filled(), paymentMethod: "dp" }, { ...batch, dpPercent: null });
  assert.ok(errors.paymentMethod);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `node --test lib/registration-form.test.mjs`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasikan `web/lib/registration-form.ts`**

Naskah varian persis dari spec §6.4. `validateRegistration` mengikuti aturan `parseRegistration` (email pola, WhatsApp 8–15 digit setelah membersihkan petik satu/spasi/`()`/`-`, usia bilangan bulat 1–150, `challenge` wajib kecuali `bnsp`, `sourceOther` bila `source === "other"`, `socialOther` bila `socials` memuat `other`, `dpPercent` harus ada bila `paymentMethod === "dp"`). `buildRegistrationPayload` menghasilkan objek bersih dengan bentuk `parseRegistration` (buang field kosong tak wajib; `whatsapp` dibersihkan; `age` jadi number; `priorExperience` jadi boolean; `socials` array; `formKind`/`priceIdr`/`dpPercent` dari batch; `consent: true`).

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `node --test lib/registration-form.test.mjs`
Expected: PASS (5).

- [ ] **Step 5: Pakai helper bersama di `program-showcase.ts`**

Ganti `isAccepting` lokal dengan `isAcceptingBatch` dari `lib/registration.ts`, dan ubah `registrationUrl` menjadi `/register/${encodeURIComponent(slug)}` (slug program, bukan batch).

- [ ] **Step 6: Cek tipe, lint, dan uji semua**

Run: `node --test lib/*.test.mjs && npx --no-install tsc --noEmit && npm run lint`
Expected: semua lulus.

- [ ] **Step 7: Commit**

```bash
git add web/lib/registration-form.ts web/lib/registration-form.test.mjs web/lib/server/program-showcase.ts
git commit -m "feat(register): aturan varian, validasi, dan payload formulir"
```

---

### Task 3: Formatter rupiah

**Files:**
- Modify: `web/lib/format.ts`
- Test: `web/lib/format.test.mjs`

**Interfaces:**
- Produces: `formatRupiah(value: number): string` → `"Rp1.500.000"` (id-ID, tanpa desimal).

- [ ] **Step 1: Tulis uji yang gagal**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { formatRupiah } from "./format.ts";

test("formatRupiah memakai titik ribuan tanpa desimal", () => {
  assert.equal(formatRupiah(1500000), "Rp1.500.000");
  assert.equal(formatRupiah(0), "Rp0");
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `node --test lib/format.test.mjs`
Expected: FAIL — `formatRupiah` belum ada.

- [ ] **Step 3: Implementasikan**

Tambahkan `formatRupiah` memakai `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })` di `web/lib/format.ts`.

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `node --test lib/format.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/lib/format.ts web/lib/format.test.mjs
git commit -m "feat(format): tambah formatRupiah"
```

---

### Task 4: Primitif field

**Files:**
- Create: `web/components/ui/field.tsx`

**Interfaces:**
- Produces: `TextField`, `TextArea`, `RadioGroup`, `CheckboxGroup` — props: `{ id, label, name?, value?, onChange, error?, hint?, required?, type?, autoComplete?, inputMode?, maxLength?, options? }`. Semua kontrol radius 0, `border-b` warna `Rule`, fokus `Accent`, target ≥44 px, `aria-invalid` + `aria-describedby` saat `error`.

- [ ] **Step 1: Implementasikan primitif**

Field teks/textarea memakai `<input>`/`<textarea>` tanpa border penuh (garis bawah). Label uppercase kecil (kelas `.eyebrow`). `RadioGroup`/`CheckboxGroup` merender `<fieldset>` + `<legend class="sr-only">`, tiap opsi `<label>` dengan kontrol 44 px. Error dirender di `<p id="{id}-error" role="alert">`.

- [ ] **Step 2: Cek tipe dan lint**

Run: `npx --no-install tsc --noEmit && npm run lint`
Expected: tanpa error.

- [ ] **Step 3: Commit**

```bash
git add web/components/ui/field.tsx
git commit -m "feat(ui): primitif field formulir"
```

---

### Task 5: Komponen formulir + penyambungan halaman

**Files:**
- Create: `web/components/register/registration-form.tsx`
- Modify: `web/components/register/register-page.tsx`

**Interfaces:**
- Consumes: `RegistrationBatch`, `RegistrationValues`, `validateRegistration`, `buildRegistrationPayload`, `registrationVariantCopy`, opsi & `formatRupiah` (Task 1–3), primitif (Task 4), `academyContactLinks` (WhatsApp resmi).
- Produces: `export function RegistrationForm({ batch }: { batch: RegistrationBatch })` — `"use client"`.

- [ ] **Step 1: Implementasikan `RegistrationForm`**

Render bagian **A Data diri**, **B Latar belakang & motivasi** (pakai `registrationVariantCopy(batch.formKind)`), **C Informasi teknis**, **D Investasi & konfirmasi** (tampilkan `formatRupiah(batch.priceIdr)` dan `batch.feeDetails`; opsi DP hanya bila `batch.dpPercent` bukan null, dengan nominal `formatRupiah(Math.round(batch.priceIdr * batch.dpPercent / 100))`), **E Persetujuan** (checkbox persetujuan + tombol "Kirim pendaftaran"). Sosial media dua kolom `md:grid-cols-2`. Validasi di klien lewat `validateRegistration` sebelum kirim; set error per field. Kirim `fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildRegistrationPayload(values, batch)) })`.

Tangani status: 200 → ganti dengan tanda terima (pesan diterima, langkah sisa, tombol `<a href={academyContactLinks.whatsapp}>Kirim bukti lewat WhatsApp</a>`, catatan penjadwalan ulang/pembayaran); 409 → banner + tautan `/#program-pilihan`, isian tetap; 422 → banner ringkasan dari `message`, isian tetap; 429 → banner "coba lagi satu menit"; 400/413/415/503 → banner pulih umum. Tombol menampilkan "Mengirim…" dan menahan klik saat berjalan; status diumumkan `aria-live="polite"`. Jangan kirim bila `validateRegistration` mengembalikan error.

- [ ] **Step 2: Sambungkan di `register-page.tsx`**

Ganti kartu "Formulir pendaftaran" (tautan `registrationFormUrl`) dengan `<RegistrationForm batch={batch} />` pada keadaan `ready`. Pertahankan `BatchCard` dan langkah "Setelah formulir dikirim" di kolom kiri. Hapus konstanta `registrationFormUrl` dari `web/lib/registration.ts` (importer terakhirnya hilang di sini).

- [ ] **Step 3: Cek tipe, lint, build**

Run: `npx --no-install tsc --noEmit && npm run lint && npm run build`
Expected: semua lulus.

- [ ] **Step 4: Verifikasi render**

Jalankan dev, buka rute dengan batch dev (Task 7), periksa 1440/834/390 px, navigasi keyboard, dan `prefers-reduced-motion`. Catat hasil.

- [ ] **Step 5: Commit**

```bash
git add web/components/register/registration-form.tsx web/components/register/register-page.tsx
git commit -m "feat(register): formulir pendaftaran satu halaman"
```

---

### Task 6: Rute `/register/[program]`

**Files:**
- Create: `web/app/register/[program]/page.tsx`
- Modify: `web/app/register/page.tsx` (tetap: tanpa slug → `{ status: "missing" }`)

**Interfaces:**
- Consumes: `readProgramRegistration` (Task 1), `RegisterPage` (Task 5).

- [ ] **Step 1: Implementasikan rute**

`async function ProgramRegistration({ params })`: `const { program } = await params;` → `const selection = await readProgramRegistration(program);` → `<RegisterPage selection={selection} />`. Bila `selection.status === "missing"` panggil `notFound()`. Bungkus `Suspense` dengan fallback `<RegisterPage selection={{ status: "loading" }} />`. Tambahkan `export const metadata` dan `generateStaticParams` bila perlu (opsional).

- [ ] **Step 2: Sederhanakan `/register` tanpa slug**

`web/app/register/page.tsx` merender `<RegisterPage selection={{ status: "missing" }} />` (buang pembacaan `?batch=`/`?program=`). Hapus `readRegistrationSelection` dari `web/lib/server/registration-batch.ts` bila sudah tak dipakai lagi, dan hapus impornya yang yatim.

- [ ] **Step 3: Cek tipe, lint, build**

Run: `npx --no-install tsc --noEmit && npm run lint && npm run build`
Expected: semua lulus; rute `/register/[program]` muncul di keluaran build.

- [ ] **Step 4: Commit**

```bash
git add web/app/register/[program]/page.tsx web/app/register/page.tsx
git commit -m "feat(register): rute /register/<program>"
```

---

### Task 7: Uji ujung-ke-ujung varian series

**Files:**
- Tidak ada berkas repo baru. SQL dijalankan pemilik di Supabase SQL editor.

**Interfaces:** Tidak ada.

- [ ] **Step 1: Jalankan SQL seed (pemilik, Supabase SQL editor)**

```sql
insert into public.batches(slug, program_slug, title, status, venue, address, price_idr, form_kind, dp_percent, proof_on_followup)
values ('dev-series-01','public-speaking-series','Public Speaking Series – Batch Dev','open',
        'Ruang Latihan ASA','Jl. Diponegoro No. 61 Bandung',1500000,'series',20,true);
insert into public.sessions(batch_slug, sequence_no, starts_at, ends_at) values
 ('dev-series-01',1, now()+interval '7 days', now()+interval '7 days 8 hours'),
 ('dev-series-01',2, now()+interval '14 days', now()+interval '14 days 8 hours');
```

> Peringatan: batch ini tampil publik di situs sampai dihapus. Jangan pakai data peserta nyata.

- [ ] **Step 2: Uji alur utama**

Buka `http://localhost:3000/register/public-speaking-series`. Isi semua field wajib, kirim. Expected: tanda terima muncul, tombol WhatsApp ada. Verifikasi via `view.cjs` (1440/390) dan keyboard.

- [ ] **Step 3: Uji kegagalan yang ditakdirkan**

- Kirim dengan WhatsApp berformat `'0812-3456-7890` → diterima.
- Batch ditutup di tengah: `update public.batches set status='closed' where slug='dev-series-01';` lalu kirim → 409, isian tetap, muncul tautan kembali. Batalkan (`status='open'`).
- Kirim email yang sama dua kali → hanya satu baris tersimpan.

- [ ] **Step 4: Bersihkan data uji**

```sql
delete from public.registrations where batch_slug='dev-series-01';
delete from public.sessions where batch_slug='dev-series-01';
delete from public.batches where slug='dev-series-01';
```

- [ ] **Step 5: Catat hasil**

Tulis di ringkasan tugas: URL yang diuji, lebar, status HTTP, dan sisa risiko. Tidak ada commit kode.

---

### Task 8: Perbarui dokumentasi

**Files:**
- Modify: `docs/home-content.md` (bagian "Daftar kelas", baris 199 dan 212)
- Modify: `docs/design.md` (baris tabel "Pendaftaran · /register")

- [ ] **Step 1: Perbarui `docs/home-content.md`**

Ganti butir "Tombol Buka formulir pendaftaran menuju formulir luar situs" dengan formulir di dalam situs; hapus kalimat "belum menyimpan data pendaftaran sendiri". Sebutkan URL `/register/<slug-program>`.

- [ ] **Step 2: Perbarui `docs/design.md`**

Sesuaikan baris "Pendaftaran · /register": halaman meresolusi batch menerima dari slug program dan menampilkan formulir satu halaman (bagian A–E, input garis bawah), bukan tautan keluar.

- [ ] **Step 3: Periksa diff dan tautan**

Run: `git diff --check`
Expected: bersih (kecuali peringatan LF/CRLF).

- [ ] **Step 4: Commit**

```bash
git add docs/home-content.md docs/design.md
git commit -m "docs: formulir pendaftaran di dalam situs"
```

---

## Catatan penutup

- Varian **exclusive (02)** dan **bnsp (03)** memakai komponen yang sama; setelah Task 7, ulangi uji singkat untuk tiap `form_kind` dengan batch dev berbeda (`form_kind='exclusive'` / `'bnsp'`, `bnsp` tanpa field tantangan).
- Jangan commit SQL seed dev.
- Bila `SUPABASE_URL`/`REGISTRATION_INTAKE_KEY` tidak tersedia di lingkungan, catat sebagai prasyarat yang hilang, bukan kegagalan uji.
