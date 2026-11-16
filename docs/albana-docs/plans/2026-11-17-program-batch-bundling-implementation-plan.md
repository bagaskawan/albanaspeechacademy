# Program tetap, Batch ringkas, dan tawaran paket — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Program menjadi sumber tunggal harga, DP, dan jenis formulir; Batch hanya nama + jadwal sesi + sakelar buka; paket Speaker ⇄ Sertifikasi ditawarkan sekali di akhir formulir `/register/[program]`.

**Architecture:** Satu migrasi memindahkan harga/DP/jenis formulir ke `programs`, menyatukan `is_active` dengan `registration_open`, dan membuat RPC `receive_academy_registration` membaca dari Program serta menerima paket dari dua arah. Aturan hitung (tambahan paket, ringkasan bayar, placeholder nama batch, validasi sesi) hidup di dua modul murni yang dites dengan `node --test`. Pembaca publik, formulir daftar, dan layar admin memakai modul itu; tidak ada angka yang dihitung dua kali dengan rumus berbeda.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Supabase Postgres (proyek `clgjsekfnexmanjdxmqy`), `node --test`.

**Spec:** [`2026-11-16-program-batch-bundling-design.md`](2026-11-16-program-batch-bundling-design.md) (disetujui pemilik 17 November 2026). Pelaksana membaca keduanya.

## Global Constraints

- Semua perintah dijalankan dari `front/`. Baca `front/AGENTS.md` dan panduan terkait di `node_modules/next/dist/docs/` sebelum menulis kode Next.js.
- Slug tetap: `public-speaking-series`, `public-speaking-for-speakers`, `sertifikasi-pembicara-profesional`, `inhouse-training`. Slug paket: `paket-speaker-sertifikasi`.
- Nilai awal: Sertifikasi `price_idr = 2000000`, `form_kind = 'bnsp'`; Series `series`; Speaker `exclusive`; `dp_percent = 20` untuk ketiganya; Inhouse tanpa `form_kind` dan tanpa DP. Paket `price_idr = 2900000`, `dp_percent = 20`, `active = false` (admin yang menyalakan).
- Harga paket sah hanya bila **lebih besar** dari biaya masing-masing program dan **lebih kecil** dari jumlah keduanya.
- Tawaran bawaan "tidak". Series tidak pernah menampilkan tawaran.
- Kartu tawaran sertifikasi wajib memuat kalimat tetap: `Uji kompetensi BNSP. Paket tidak menjamin kelulusan.`
- DP dibulatkan `Math.round(harga × persen / 100)`, sama dengan `round()` di RPC.
- Sesi disimpan `YYYY-MM-DDTHH:MM` tanpa zona dan berarti WIB (+07:00); array `sessions` selalu diurutkan dari yang paling awal.
- Setiap halaman dan Server Action admin memanggil `requireAdminMember()`. `bundle_offers` tidak punya kebijakan tulis untuk admin: baca-tulisnya lewat `academyBillingClient()` **setelah** guard.
- Data peserta, tagihan, rekening, token tidak boleh masuk props client atau log.
- UI admin memakai `FormDialog`, `FieldGrid`, `Field`, `RowActions`, `StatusChip`, `EmptyState` dan token `--admin-*`; tanpa warna biru. Acuan: [`admin-ui-patterns.md`](../design/admin-ui-patterns.md) §6–§9.
- Satu tugas = satu commit; pesan menyebut `4.2.4-N`. Akhiri pesan commit dengan `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`.
- Pohon kerja berisi perubahan pemilik yang belum di-commit, termasuk di `app/(admin)/admin/program/page.tsx`, `app/(web)/register/[program]/page.tsx`, `app/(web)/register/konfirmasi/[token]/page.tsx`, `lib/server/program-showcase.ts`, `components/home/program-showcase-section.tsx`, dan `docs/albana-docs/data/database-schema.md`. Jangan dibuang. `git add` hanya berkas tugas itu, dan laporkan bila commit ikut membawa perubahan pemilik.
- Pemeriksaan tiap tugas: `npx tsc --noEmit`, `npx eslint <berkas yang disentuh>`, tes `.test.mjs` terkait. `npm run build` pada Tugas 4, 6, dan 7.
- Di luar cakupan: menghapus kolom lama `batches.price_idr|normal_price_idr|dp_percent|fee_details|form_kind|venue|address` dan `bundle_offers.show_on_*|*_batch_slug` (migrasi terpisah kelak); merapikan `CmsCollectionClient`.

## Keadaan saat rencana ditulis (17 November 2026, dibaca dari basis data)

- `programs`: empat baris; kolom `dp_percent`, `form_kind`, `fee_details` **belum ada**. Sertifikasi dan Inhouse `price_idr = 0`.
- `batches`: `batch-9-series` dan `batch-9-exclusive`, keduanya dibuka. Sertifikasi belum punya batch.
- `bundle_offers`: kosong. `academy_registrations`: 0 baris.
- Trigger `batches_single_active` memaksa `is_active = true` pada setiap INSERT. Dengan sakelar "Buka pendaftaran" bawaan mati, batch baru akan mematikan `is_active` batch lama yang masih dibuka, dan RPC menolak pendaftarnya. Tugas 1 mengganti trigger ini.

## Review Focus

1. **Batch pasangan ditutup setelah formulir dibuka.** Kiriman yang memilih paket harus ditolak 409, bukan diam-diam menjadi tagihan satu program. → asersi RPC Tugas 1, uji Tugas 7.
2. **Admin mengubah biaya program sehingga harga paket tidak lagi sah.** Tawaran harus hilang dan RPC menolak paket. → tes `bundlePriceValid` Tugas 2, asersi RPC Tugas 1, peringatan kartu Tugas 5.
3. **Sesi pertama sudah mulai, server berjalan di UTC.** `Date.parse("2026-11-22T08:30")` dibaca sebagai UTC sehingga formulir tetap terbuka 7 jam setelah RPC menolak. → tes `wibMs` dan `isAcceptingBatch` Tugas 2.
4. **Menghapus batch yang sudah punya pendaftar.** Harus ditolak dengan pesan, bukan menghapus butir pendaftaran. → `deleteBatch` Tugas 5.
5. **Nama batch tanpa angka atau dengan angka di tengah** ("Kelas Akhir Tahun", "Batch 2026 Gel. 3"). Placeholder tetap masuk akal. → tes `nextBatchName` Tugas 2.
6. **Membuka batch saat biaya program Rp0** (Sertifikasi sebelum migrasi data, atau admin mengosongkan biaya). Harus ditolak di `saveBatch`. → Tugas 5.

---

### Task 1: Migrasi — Program memegang harga, satu batch dibuka, RPC dua arah

**Files:**
- Create: `front/supabase/migrations/20261117100000_program_owns_price_and_bundle.sql`

**Interfaces:**
- Produces: kolom `programs.dp_percent smallint`, `programs.form_kind text`, `programs.fee_details text`; baris `bundle_offers.slug = 'paket-speaker-sertifikasi'`; invarian `batches.is_active = batches.registration_open` dan paling banyak satu batch dibuka per program; RPC `receive_academy_registration(request jsonb)` dengan bentuk permintaan dan status balasan **tidak berubah**.

- [ ] **Step 1: Tulis migrasi, bagian skema dan data**

```sql
alter table public.programs
  add column dp_percent smallint check (dp_percent is null or dp_percent between 1 and 99),
  add column form_kind text check (form_kind is null or form_kind in ('series', 'exclusive', 'bnsp')),
  add column fee_details text;

update public.programs set form_kind = 'series', dp_percent = 20 where slug = 'public-speaking-series';
update public.programs set form_kind = 'exclusive', dp_percent = 20 where slug = 'public-speaking-for-speakers';
update public.programs set form_kind = 'bnsp', dp_percent = 20, price_idr = 2000000
  where slug = 'sertifikasi-pembicara-profesional';

insert into public.bundle_offers
  (slug, title, speaker_program_slug, certification_program_slug, price_idr, dp_percent,
   active, show_on_speaker, show_on_certification, placement_scope)
values
  ('paket-speaker-sertifikasi', 'Paket Speaker + Sertifikasi', 'public-speaking-for-speakers',
   'sertifikasi-pembicara-profesional', 2900000, 20, false, false, false, 'program')
on conflict (slug) do nothing;
```

- [ ] **Step 2: Bagian trigger — satu batch dibuka per program**

Hapus trigger `batches_single_active` dan `batches_reactivate_old_program` beserta fungsi `enforce_single_active_batch()` dan `reactivate_old_program_batch()`. Buat `public.enforce_single_open_batch()` (`security definer`, `set search_path = public`) dan trigger `batches_single_open before insert or update of registration_open, is_active, program_slug on public.batches for each row`:

```sql
begin
  new.is_active := new.registration_open;
  if new.registration_open then
    update public.batches
       set registration_open = false, is_active = false
     where program_slug = new.program_slug
       and slug is distinct from new.slug
       and (registration_open or is_active);
  end if;
  return new;
end;
```

Sesudah trigger terpasang, samakan data lama: `update public.batches set is_active = registration_open where is_active is distinct from registration_open;`. Indeks unik `batches_one_active_per_program` dipertahankan.

- [ ] **Step 3: Bagian RPC**

`create or replace function public.receive_academy_registration(request jsonb)` — salin badan dari `20261116121000_bundle_scope_rpc_guard.sql`, lalu ubah tepat lima hal:

1. Baris `first_batch`: ambil `p.dp_percent`, `p.form_kind`, `p.price_idr` (tanpa `coalesce` ke kolom batch) dan `p.title`. Kolom `b.dp_percent`, `b.form_kind`, `b.price_idr` tidak dibaca lagi.
2. Deklarasikan `partner_slug text; partner_price bigint;`. Dalam cabang paket, ganti syarat `first_batch.program_slug <> offer.speaker_program_slug` dengan: `first_batch.program_slug` bukan salah satu dari `offer.speaker_program_slug` / `offer.certification_program_slug` → `unavailable`. `partner_slug` = slug program yang satunya.
3. Syarat batch kedua: `second_batch.program_slug <> partner_slug` → `unavailable` (menggantikan perbandingan ke `offer.certification_program_slug`).
4. Ambil `partner_price` dari `public.programs where slug = partner_slug for share`. Bila `offer.price_idr <= first_batch.price_idr` atau `offer.price_idr <= partner_price` atau `offer.price_idr >= first_batch.price_idr + partner_price` → `unavailable`.
5. `percent := coalesce(offer.dp_percent, first_batch.dp_percent);` pada cabang paket.

Sisanya (batas laju, idempotensi, pemeriksaan `changed`, rekening, tagihan, kode unik) tidak disentuh.

- [ ] **Step 4: Terapkan migrasi**

Terapkan ke proyek `clgjsekfnexmanjdxmqy` dengan `apply_migration` (nama `program_owns_price_and_bundle`). Ini mengubah basis data yang dipakai situs; lakukan hanya setelah pemilik menyetujui eksekusi rencana.

- [ ] **Step 5: Buktikan dengan satu blok `do` yang selalu dibatalkan**

Jalankan lewat `execute_sql` satu blok `do $$ … $$` yang memakai `assert` dan diakhiri `raise exception 'OK-ROLLBACK';` sehingga tidak ada data uji tersisa. Di dalamnya: sisipkan rekening aktif bila belum ada, sisipkan batch Sertifikasi dibuka (sesi 30 hari ke depan), nyalakan paket, lalu panggil RPC dengan `sourceHash` dan `idempotencyKey` yang berbeda tiap panggilan. Asersi:

| # | Keadaan | Hasil yang ditegaskan |
| --- | --- | --- |
| a | INSERT batch kedua pada Series dengan `registration_open = false` | `batch-9-series` tetap `registration_open` dan `is_active` |
| b | UPDATE batch kedua itu menjadi `registration_open = true` | `batch-9-series` menjadi tertutup; batch kedua `is_active = true` |
| c | Daftar Speaker tunggal, `expectedPriceIdr = 1300000`, `formKind = 'exclusive'`, lunas | `status = received`; tagihan `subtotal_idr = 1300000` |
| d | Daftar Speaker + paket, `expectedPriceIdr = 2900000`, DP, `expectedDpPercent = 20` | `received`; dua baris `academy_registration_items`; `subtotal_idr = 580000` |
| e | Daftar Sertifikasi + paket (batch kedua = `batch-9-exclusive`), `formKind = 'bnsp'`, lunas | `received`; `subtotal_idr = 2900000` |
| f | Seperti (d) setelah batch Sertifikasi ditutup | `status = unavailable` |
| g | Seperti (d) setelah `programs.price_idr` Speaker diubah menjadi `2900000` | `status = unavailable` |
| h | Daftar Series dengan `offerSlug` paket | `status = unavailable` |
| i | Daftar Speaker tunggal dengan `expectedPriceIdr = 1200000` | `status = changed` |

Expected: `execute_sql` gagal dengan pesan persis `OK-ROLLBACK`. Pesan lain berarti satu asersi gagal. Lalu pastikan `select count(*) from public.academy_registrations` masih `0`.

- [ ] **Step 6: Commit**

```bash
git add front/supabase/migrations/20261117100000_program_owns_price_and_bundle.sql
git commit -m "feat(db): program memegang harga dan DP, satu batch dibuka, paket dua arah (4.2.4-1)"
```

---

### Task 2: Aturan hitung murni dan tesnya

**Files:**
- Create: `front/lib/bundle.ts`, `front/lib/bundle.test.mjs`
- Create: `front/lib/program-batch.ts`, `front/lib/program-batch.test.mjs`
- Modify: `front/lib/registration.ts` (`firstSessionStart`), `front/lib/registration.test.mjs`

**Interfaces:**
- Produces, `lib/bundle.ts`:

```ts
export const BUNDLE_SLUG = "paket-speaker-sertifikasi";
export const SPEAKER_SLUG = "public-speaking-for-speakers";
export const CERTIFICATION_SLUG = "sertifikasi-pembicara-profesional";
export const INHOUSE_SLUG = "inhouse-training";
export function bundlePriceValid(packageIdr: number, speakerIdr: number, certificationIdr: number): boolean;
export function bundleAddOn(packageIdr: number, programIdr: number): number;
export function bundleSaving(packageIdr: number, speakerIdr: number, certificationIdr: number): number; // tidak pernah negatif
export function paymentSummary(priceIdr: number, dpPercent: number | null, method: "full" | "dp" | ""):
  { feeIdr: number; payNowIdr: number; remainingIdr: number };
```

- Produces, `lib/program-batch.ts`:

```ts
export type SessionInput = { date: string; start: string; end: string };      // "2026-12-14", "08:30", "18:00"
export type StoredSession = { starts_at: string; ends_at: string };           // "2026-12-14T08:30"
export type BatchStatus = "open" | "closed" | "done";
export function wibMs(value: string): number;                                 // NaN bila tidak terbaca
export function nextBatchName(titles: readonly string[]): string;
export function validateSessions(sessions: readonly SessionInput[]): string | null;
export function toStoredSessions(sessions: readonly SessionInput[]): StoredSession[];   // terurut, jam dipotong ke HH:MM
export function fromStoredSessions(value: unknown): SessionInput[];
export function batchStatus(batch: { registration_open: boolean; sessions: unknown }, nowMs: number): BatchStatus;
```

Impor antarmodul di `lib/` memakai akhiran `.ts` (seperti `registration-input.ts`) agar `node --test` dapat memuatnya.

- [ ] **Step 1: Tulis tes yang gagal — `lib/bundle.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { bundleAddOn, bundlePriceValid, bundleSaving, paymentSummary } from "./bundle.ts";

test("tambahan = paket − biaya asal, total sama dari dua arah", () => {
  assert.equal(bundleAddOn(2_900_000, 1_300_000), 1_600_000);
  assert.equal(bundleAddOn(2_900_000, 2_000_000), 900_000);
  assert.equal(1_300_000 + bundleAddOn(2_900_000, 1_300_000), 2_000_000 + bundleAddOn(2_900_000, 2_000_000));
});

test("harga paket sah hanya di antara biaya terbesar dan jumlah keduanya", () => {
  assert.equal(bundlePriceValid(2_900_000, 1_300_000, 2_000_000), true);
  assert.equal(bundlePriceValid(2_000_000, 1_300_000, 2_000_000), false);
  assert.equal(bundlePriceValid(3_300_000, 1_300_000, 2_000_000), false);
  assert.equal(bundlePriceValid(2_900_000, 0, 2_000_000), false);
  assert.equal(bundlePriceValid(Number.NaN, 1_300_000, 2_000_000), false);
});

test("hemat tidak pernah negatif", () => {
  assert.equal(bundleSaving(2_900_000, 1_300_000, 2_000_000), 400_000);
  assert.equal(bundleSaving(3_500_000, 1_300_000, 2_000_000), 0);
});

test("ringkasan lunas dan DP, dengan dan tanpa paket", () => {
  assert.deepEqual(paymentSummary(1_300_000, 20, "full"), { feeIdr: 1_300_000, payNowIdr: 1_300_000, remainingIdr: 0 });
  assert.deepEqual(paymentSummary(1_300_000, 20, "dp"), { feeIdr: 1_300_000, payNowIdr: 260_000, remainingIdr: 1_040_000 });
  assert.deepEqual(paymentSummary(2_900_000, 20, "dp"), { feeIdr: 2_900_000, payNowIdr: 580_000, remainingIdr: 2_320_000 });
  assert.deepEqual(paymentSummary(2_900_000, null, "dp"), { feeIdr: 2_900_000, payNowIdr: 2_900_000, remainingIdr: 0 });
  assert.deepEqual(paymentSummary(1_300_000, 20, ""), { feeIdr: 1_300_000, payNowIdr: 1_300_000, remainingIdr: 0 });
  assert.equal(paymentSummary(1_333_333, 20, "dp").payNowIdr, 266_667);
});
```

- [ ] **Step 2: Tulis tes yang gagal — `lib/program-batch.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { batchStatus, fromStoredSessions, nextBatchName, toStoredSessions, validateSessions, wibMs } from "./program-batch.ts";

test("placeholder menaikkan angka terakhir dari batch bernomor tertinggi", () => {
  assert.equal(nextBatchName(["ASA Batch 9"]), "ASA Batch 10");
  assert.equal(nextBatchName(["Batch 9", "Batch 10"]), "Batch 11");
  assert.equal(nextBatchName(["Batch 2026 Gel. 3"]), "Batch 2026 Gel. 4");
  assert.equal(nextBatchName([]), "ASA Batch 1");
  assert.equal(nextBatchName(["Kelas Akhir Tahun"]), "ASA Batch 1");
});

test("jadwal: wajib lengkap, selesai setelah mulai, tidak tumpang tindih", () => {
  const ok = { date: "2026-12-14", start: "08:30", end: "18:00" };
  assert.equal(validateSessions([ok]), null);
  assert.equal(validateSessions([]), "Setiap sesi wajib punya tanggal, waktu mulai, dan waktu selesai.");
  assert.equal(validateSessions([{ ...ok, end: "" }]), "Setiap sesi wajib punya tanggal, waktu mulai, dan waktu selesai.");
  assert.equal(validateSessions([{ ...ok, end: "08:30" }]), "Waktu selesai sesi harus setelah waktu mulai.");
  assert.equal(validateSessions([ok, { date: "2026-12-14", start: "17:00", end: "19:00" }]), "Jadwal sesi tidak boleh tumpang tindih.");
});

test("sesi disimpan terurut dengan jam HH:MM dan dapat dibaca kembali", () => {
  const stored = toStoredSessions([
    { date: "2026-12-21", start: "09:00:00", end: "12:00:00" },
    { date: "2026-12-14", start: "09:00", end: "12:00" },
  ]);
  assert.deepEqual(stored, [
    { starts_at: "2026-12-14T09:00", ends_at: "2026-12-14T12:00" },
    { starts_at: "2026-12-21T09:00", ends_at: "2026-12-21T12:00" },
  ]);
  assert.deepEqual(fromStoredSessions(stored)[0], { date: "2026-12-14", start: "09:00", end: "12:00" });
  assert.deepEqual(fromStoredSessions(null), []);
});

test("waktu tanpa zona dibaca sebagai WIB", () => {
  assert.equal(wibMs("2026-11-22T08:30"), Date.UTC(2026, 10, 22, 1, 30));
  assert.equal(wibMs("2026-11-22T08:30:00+07:00"), Date.UTC(2026, 10, 22, 1, 30));
  assert.ok(Number.isNaN(wibMs("bukan tanggal")));
});

test("status batch: dibuka, ditutup, selesai setelah sesi terakhir berakhir", () => {
  const sessions = [{ starts_at: "2026-11-21T09:00", ends_at: "2026-11-21T12:00" }, { starts_at: "2026-12-12T09:00", ends_at: "2026-12-12T12:00" }];
  const before = Date.UTC(2026, 11, 12, 4, 59); // 11.59 WIB
  const after = Date.UTC(2026, 11, 12, 5, 1);   // 12.01 WIB
  assert.equal(batchStatus({ registration_open: true, sessions }, before), "open");
  assert.equal(batchStatus({ registration_open: false, sessions }, before), "closed");
  assert.equal(batchStatus({ registration_open: true, sessions }, after), "done");
  assert.equal(batchStatus({ registration_open: false, sessions: [] }, after), "closed");
});
```

- [ ] **Step 3: Tambah tes zona waktu ke `lib/registration.test.mjs`**

```js
test("batch yang sesi pertamanya sudah mulai (WIB) tidak menerima pendaftaran", (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 10, 22, 2, 0) }); // 09.00 WIB
  const batch = { registration_open: true, sessions: [{ starts_at: "2026-11-22T08:30", ends_at: "2026-11-22T18:00" }] };
  assert.equal(isAcceptingBatch(batch), false);
});
```

- [ ] **Step 4: Jalankan, pastikan gagal**

Run: `node --test lib/bundle.test.mjs lib/program-batch.test.mjs lib/registration.test.mjs`
Expected: FAIL — modul `./bundle.ts` dan `./program-batch.ts` belum ada; tes zona waktu gagal pada mesin ber-zona UTC (pada mesin WIB tes itu sudah lulus sebelum perubahan; tetap wajib lulus sesudahnya).

- [ ] **Step 5: Implementasi**

- `lib/bundle.ts` dan `lib/program-batch.ts` sesuai antarmuka di atas.
- `wibMs`: bila string berbentuk `YYYY-MM-DDTHH:MM` atau `…:SS` tanpa zona, tambahkan `+07:00` sebelum `Date.parse`.
- `nextBatchName`: dari judul yang memuat angka, pilih yang angka **terakhirnya** paling besar, ganti angka terakhir itu dengan angka + 1; tanpa judul bernomor → `"ASA Batch 1"`.
- `batchStatus`: `"done"` bila ada sesi dan `wibMs(ends_at)` terbesar ≤ `nowMs`; selain itu mengikuti `registration_open`.
- `lib/registration.ts` → `firstSessionStart` memakai `wibMs` dari `./program-batch.ts` menggantikan `Date.parse(value)`.

- [ ] **Step 6: Jalankan, pastikan lulus**

Run: `node --test lib/bundle.test.mjs lib/program-batch.test.mjs lib/registration.test.mjs lib/registration-form.test.mjs`
Expected: PASS semua. `npx tsc --noEmit` tanpa galat baru.

- [ ] **Step 7: Commit**

```bash
git add front/lib/bundle.ts front/lib/bundle.test.mjs front/lib/program-batch.ts front/lib/program-batch.test.mjs front/lib/registration.ts front/lib/registration.test.mjs
git commit -m "feat(lib): aturan paket, ringkasan bayar, nama batch, dan waktu WIB (4.2.4-2)"
```

---

### Task 3: Pembaca publik membaca harga dari Program dan alamat dari Kontak

**Files:**
- Modify: `front/lib/server/catalog.ts`
- Modify: `front/lib/server/registration-batch.ts`
- Modify: `front/lib/server/program-showcase.ts` (`readBatchSummary`, `toCard`, `readProgramShowcase`, `readProgramDetail`)
- Modify: `front/lib/server/bundle-offer.ts` (ditulis ulang)
- Modify: `front/components/home/program-showcase-section.tsx` (kueri `bundle_offers`)

**Interfaces:**
- Consumes: `bundlePriceValid`, `bundleAddOn`, `bundleSaving`, `CERTIFICATION_SLUG` dari `@/lib/bundle`; `readPublishedContacts()` dari `./public-contacts`.
- Produces:

```ts
// lib/server/registration-batch.ts — tipe RegistrationBatch TIDAK berubah
export async function readProgramRegistration(programSlug: string): Promise<RegistrationSelection>;

// lib/server/bundle-offer.ts
export type BundleOffer = {
  slug: string; title: string; description: string | null;
  packagePriceIdr: number;
  dpPercent: number | null;        // DP paket; bila kosong, DP program asal
  addOnIdr: number;                // packagePriceIdr − biaya program asal
  savingIdr: number;               // 0 bila tidak hemat
  partner: RegistrationBatch;      // batch dibuka pada program pasangan
  partnerIsCertification: boolean;
};
export async function readBundleOffer(current: RegistrationBatch): Promise<BundleOffer | null>;
```

`readBundleChoice` dan tipe `BundleChoice` dihapus; pemakainya diganti pada Tugas 4.

- [ ] **Step 1: `catalog.ts`**

`PROGRAM_COLUMNS` menjadi: `slug,title,description,materials,price_idr,original_price_idr,dp_percent,form_kind,fee_details,form_prior_experience,form_goal,form_challenge,batches(slug,title,registration_open,is_active,sessions)`.

- [ ] **Step 2: `registration-batch.ts`**

`toRegistrationBatch(program, batch, address: string)`: `formKind`, `priceIdr`, `dpPercent`, `feeDetails` dibaca dari `program` (`form_kind`, `price_idr`, `dp_percent`, `fee_details`); `normalPriceIdr` dari `program.original_price_idr`; `venue = { name: address, address }`. Kembalikan `null` bila `priceIdr` bukan bilangan > 0 (sebelumnya `< 0`) atau `formKind` kosong. `readProgramRegistration` membaca program dan kontak bersamaan; `address` = nilai `contact_channels` ber-`kind` `address`, atau `"Tempat menyusul"` bila tidak ada **atau pembacaan kontak gagal** (kegagalan kontak tidak boleh menggagalkan pendaftaran).

- [ ] **Step 3: `program-showcase.ts`**

`readBatchSummary(program, batch, address)`: `priceIdr`, `normalPriceIdr`, `dpPercent` dari `program` dengan aturan yang sama seperti langkah 2; `venueLabel = address`. `readProgramShowcase` dan `readProgramDetail` mengambil alamat dengan cara yang sama (gagal → `"Tempat menyusul"`). Jangan mengubah bagian lain berkas ini; berkas memuat perubahan pemilik yang belum di-commit.

- [ ] **Step 4: `bundle-offer.ts`**

`readBundleOffer(current)`: baca `bundle_offers?select=slug,title,description,speaker_program_slug,certification_program_slug,price_idr,dp_percent&active=eq.true&placement_scope=eq.program&limit=1`. Kembalikan `null` bila: tidak ada baris; `current.programSlug` bukan salah satu dari pasangan; `readProgramRegistration(slug pasangan)` tidak `ready`; atau `bundlePriceValid(price, biaya speaker, biaya sertifikasi)` salah. `dpPercent = dp paket ?? current.dpPercent`. `partnerIsCertification = partner.programSlug === CERTIFICATION_SLUG`.

- [ ] **Step 5: `program-showcase-section.tsx`**

Kueri `bundle_offers` tidak lagi memilih atau memeriksa `show_on_speaker` / `show_on_certification`; catatan "Tersedia paket dengan …" tampil untuk kedua program pasangan bila ada baris aktif. Tanpa harga paket di kartu.

- [ ] **Step 6: Periksa**

Run: `npx tsc --noEmit`
Expected: galat hanya di `components/register/register-page.tsx`, `registration-choice.tsx`, `registration-form.tsx` (masih memakai `BundleChoice`), yang diselesaikan Tugas 4. Tidak ada galat lain.

Tugas ini di-commit bersama Tugas 4 (pohon tidak terkompilasi di antaranya).

---

### Task 4: `/register` — kartu tawaran di akhir formulir dan ringkasan bayar

**Files:**
- Create: `front/components/register/bundle-offer-card.tsx`
- Modify: `front/components/register/register-page.tsx`
- Modify: `front/components/register/registration-choice.tsx`
- Modify: `front/components/register/registration-form.tsx`
- Modify: `front/components/register/registration-steps.tsx` (langkah `payment`)
- Test: `front/lib/registration-form.test.mjs`

**Interfaces:**
- Consumes: `BundleOffer`, `readBundleOffer` (Tugas 3); `paymentSummary` (Tugas 2).
- Produces:

```ts
// bundle-offer-card.tsx ("use client")
export function BundleOfferCard(props: {
  offer: BundleOffer;
  baseProgramName: string;
  basePriceIdr: number;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}): React.JSX.Element;
```

- [ ] **Step 1: Tes yang gagal — kiriman paket membawa harga paket**

Tambahkan ke `lib/registration-form.test.mjs`, memakai fixture `batch` yang sudah ada:

```js
test("pilihan paket mengirim harga paket dan DP paket", () => {
  const bundled = { ...batch, formKind: "exclusive", priceIdr: 2_900_000, dpPercent: 20 };
  const payload = buildRegistrationPayload({ ...filled(), paymentMethod: "dp" }, bundled);
  assert.equal(payload.priceIdr, 2_900_000);
  assert.equal(payload.dpPercent, 20);
  assert.ok(parseRegistration(payload));
});
```

`filled()` dan `batch` adalah pembantu yang sudah ada di berkas tes itu. Run: `node --test lib/registration-form.test.mjs` → tes ini harus LULUS tanpa perubahan kode (mengunci perilaku yang diandalkan langkah berikut); bila gagal, perbaiki `buildRegistrationPayload` dulu.

- [ ] **Step 2: `register-page.tsx`**

Ganti `readBundleChoice` → `readBundleOffer`, tipe `BundleChoice` → `BundleOffer`, prop `bundle` → `offer`. Kegagalan pembacaan tawaran tetap ditelan (pendaftaran tunggal tetap tersedia).

- [ ] **Step 3: `registration-choice.tsx`**

Hapus fieldset "Pilih penawaran" di atas formulir. Simpan state `withBundle: boolean` (awal `false`). `RegistrationOverview` **selalu** menerima `batch` asli. Batch yang dipakai formulir saat `withBundle`:

```ts
{ ...batch, programName: offer.title, batchName: `${batch.batchName} + ${offer.partner.batchName}`,
  priceIdr: offer.packagePriceIdr, dpPercent: offer.dpPercent, normalPriceIdr: null }
```

Teruskan ke `RegistrationForm`: `batch` (pilihan), `baseBatch` (asli), `offer`, `withBundle`, `onBundleChange`.

- [ ] **Step 4: `bundle-offer-card.tsx`**

`fieldset` dengan dua radio (`name="bundle-offer"`), dirender tepat di atas isian metode pembayaran:

| Bagian | Naskah |
| --- | --- |
| `legend` | `Sekalian ambil sertifikasi?` bila `partnerIsCertification`; selain itu `Sekalian ambil pelatihan Speaker?` |
| Radio 1 | `Tidak, {baseProgramName} saja` · kanan: `formatRupiah(basePriceIdr)` |
| Radio 2 | `Tambah {offer.partner.programName}` · kanan: `+ {formatRupiah(offer.addOnIdr)}` |
| Di bawah radio 2 | `{offer.partner.batchName}` dan seluruh `offer.partner.sessions[].dateLabel`, lalu `offer.partner.timeLabel` |
| Bila `partnerIsCertification` | `Uji kompetensi BNSP. Paket tidak menjamin kelulusan.` |
| Bila `offer.description` | teks itu |
| Total | `Total paket {formatRupiah(offer.packagePriceIdr)}` + ` (hemat {formatRupiah(offer.savingIdr)})` hanya bila `savingIdr > 0` |

Target sentuh ≥ 44 px (`min-h-11`), gaya mengikuti kelas publik yang dipakai `registration-steps.tsx` (`border-rule`, `text-muted`, `accent-accent`).

- [ ] **Step 5: `registration-form.tsx`**

Props menjadi `{ batch, baseBatch, offer, withBundle, onBundleChange }`. Hapus fieldset "Tinjau pilihan sebelum membayar"; pada langkah terakhir render `<BundleOfferCard>` bila `offer` ada. Kiriman: `offerSlug: withBundle && offer ? offer.slug : null`, `secondaryBatchSlug: withBundle && offer ? offer.partner.batchSlug : null`. `choiceKey` dan efek pengosongan `idempotencyKey` bergantung pada `withBundle` dan `batch.priceIdr`.

- [ ] **Step 6: `registration-steps.tsx`, langkah `payment`**

Di bawah `RadioGroup` metode pembayaran, tampilkan `dl` dengan tiga baris dari `paymentSummary(priceIdr, dpPercent, values.paymentMethod)`: **Biaya**, **Transfer sekarang**, **Sisa** (baris Sisa disembunyikan bila `remainingIdr === 0`). Beri `aria-live="polite"` pada pembungkusnya. Label pilihan DP memakai `payNowIdr` dari fungsi yang sama, bukan hitungan sendiri.

- [ ] **Step 7: Periksa**

Run: `node --test lib/registration-form.test.mjs lib/academy-registration-input.test.mjs && npx tsc --noEmit && npx eslint components/register lib/server/bundle-offer.ts lib/server/registration-batch.ts lib/server/catalog.ts && npm run build`
Expected: tes PASS, tanpa galat tipe, build selesai.

Lalu di peramban (`preview_start` nama `front`), lebar 390 dan 1280:
- `/register/public-speaking-series` → tidak ada kartu tawaran; ringkasan Biaya Rp1.500.000.
- `/register/public-speaking-for-speakers` dengan paket mati atau Sertifikasi tanpa batch → tidak ada kartu.
- `/register/sertifikasi-pembicara-profesional` tanpa batch → pesan "Jadwal program ini belum tersedia".
- Tempat pada ringkasan = alamat dari menu Kontak.

Kartu tawaran yang tampil diuji pada Tugas 7, setelah admin dapat membuat batch Sertifikasi.

- [ ] **Step 8: Commit (Tugas 3 + 4)**

```bash
git add front/lib/server/catalog.ts front/lib/server/registration-batch.ts front/lib/server/program-showcase.ts front/lib/server/bundle-offer.ts front/components/home/program-showcase-section.tsx front/components/register front/lib/registration-form.test.mjs
git commit -m "feat(register): harga dari Program, alamat dari Kontak, tawaran paket di akhir formulir (4.2.4-3)"
```

Laporkan bahwa commit ini ikut membawa perubahan pemilik di `program-showcase.ts` dan `program-showcase-section.tsx`.

---

### Task 5: Admin — aksi dan layar "Program & Batch"

**Files:**
- Create: `front/app/(admin)/admin/program/actions.ts`
- Create: `front/components/admin/program/ProgramBatchBoard.tsx`
- Modify: `front/app/(admin)/admin/program/page.tsx` (ditulis ulang)
- Delete: `front/app/(admin)/admin/bundling/actions.ts`

**Interfaces:**
- Consumes: `SessionInput`, `validateSessions`, `toStoredSessions`, `fromStoredSessions`, `nextBatchName`, `batchStatus` (Tugas 2); `bundlePriceValid`, `bundleAddOn`, `BUNDLE_SLUG`, `SPEAKER_SLUG`, `CERTIFICATION_SLUG`, `INHOUSE_SLUG` (Tugas 2); `FormDialog`, `FieldGrid`, `Field`, `RowActions`, `StatusChip`, `EmptyState`.
- Produces:

```ts
// app/(admin)/admin/program/actions.ts ("use server"); semua memanggil requireAdminMember() lebih dulu
export async function saveBatch(input: {
  slug: string | null;          // null = batch baru
  programSlug: string;
  title: string;
  sessions: SessionInput[];
  open: boolean;
}): Promise<{ error?: string }>;
export async function deleteBatch(slug: string): Promise<{ error?: string }>;
export async function saveBundle(input: {
  active: boolean; priceIdr: number; dpPercent: number | null; description: string;
}): Promise<{ error?: string }>;

// components/admin/program/ProgramBatchBoard.tsx ("use client")
export type BoardProgram = { slug: string; title: string; price_idr: number; original_price_idr: number | null; dp_percent: number | null; form_kind: string | null };
export type BoardBatch = { slug: string; program_slug: string; title: string; registration_open: boolean; sessions: unknown };
export type BoardBundle = { active: boolean; price_idr: number | null; dp_percent: number | null; description: string | null };
export function ProgramBatchBoard(props: { programs: BoardProgram[]; batches: BoardBatch[]; bundle: BoardBundle | null; nowMs: number }): React.JSX.Element;
```

- [ ] **Step 1: `actions.ts` — aturan tiap aksi**

`saveBatch` (tulis lewat klien dari `requireAdminMember()`; RLS `batches_admin_write`):
- `programSlug` harus salah satu dari tiga slug Public Training → selain itu `"Program tidak valid."`
- `title.trim()` kosong atau > 160 karakter → `"Nama batch wajib diisi."`
- `validateSessions(sessions)` mengembalikan pesan → kembalikan pesan itu.
- `open` dan `programs.price_idr` program itu ≤ 0 → `"Isi biaya program dulu sebelum membuka pendaftaran."`
- Baru: `insert({ program_slug, title, sessions: toStoredSessions(sessions), registration_open: open })`; slug dibuat trigger `set_catalog_slug`. Ubah: `update({ title, sessions, registration_open: open }).eq("slug", slug).eq("program_slug", programSlug)`. `is_active` tidak pernah dikirim; trigger yang mengisinya.
- Sukses → `revalidatePath("/admin/program")`, `revalidatePath("/", "layout")`.

`deleteBatch`:
- `academyBillingClient().from("academy_registration_items").select("registration_id", { count: "exact", head: true }).eq("batch_slug", slug)`; hitungan > 0 → `"Batch yang sudah punya pendaftar tidak bisa dihapus."`
- Selain itu hapus baris, lalu revalidasi seperti di atas.

`saveBundle` (lewat `academyBillingClient()`):
- `dpPercent` bukan `null` dan bukan bilangan bulat 1–99 → `"DP paket harus 1–99%."`
- `description.trim()` > 300 karakter → `"Penjelasan paket maksimal 300 karakter."`
- Baca biaya Speaker dan Sertifikasi; `!bundlePriceValid(priceIdr, speaker, sertifikasi)` → `"Harga paket harus lebih besar dari biaya tiap program dan lebih kecil dari jumlah keduanya."`
- `upsert` baris `slug = BUNDLE_SLUG`: `title: "Paket Speaker + Sertifikasi"`, `speaker_program_slug`, `certification_program_slug`, `price_idr`, `dp_percent`, `description` (kosong → `null`), `active`, `show_on_speaker: active`, `show_on_certification: active`, `placement_scope: "program"`, `updated_at`.

- [ ] **Step 2: `page.tsx`**

Server component, `dynamic = "force-dynamic"`. Setelah `requireAdminMember()`: baca `programs` (`slug,title,price_idr,original_price_idr,dp_percent,form_kind`), `batches` (`slug,program_slug,title,registration_open,sessions`), dan baris paket lewat `academyBillingClient()` (`active,price_idr,dp_percent,description` untuk `slug = BUNDLE_SLUG`). Render `<ProgramBatchBoard … nowMs={Date.now()} />`. Tanpa toolbar cari/ekspor dan tanpa tombol tambah program (daftar tetap, empat baris).

- [ ] **Step 3: `ProgramBatchBoard.tsx` — susunan**

Urutan tetap: judul kelompok **Public Training** → kartu Series, Speaker, Sertifikasi → kartu **Paket Speaker + Sertifikasi** → kartu **Inhouse Training**.

Kartu program (`section`, `rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]`):
- Kepala: nama program; `Rp… · DP n%` (harga coret bila ada; `Tanpa DP` bila kosong); tautan ubah ke `/admin/program/{slug}/edit` (ikon pensil, `aria-label="Ubah {nama}"`).
- Daftar batch, terbaru dulu (urut sesi pertama menurun): nama · `{n} sesi · mulai {tanggal sesi pertama}` · `StatusChip` (`open` → tone `mint` "Dibuka"; `closed` → `neutral` "Ditutup"; `done` → `neutral` "Selesai") · `RowActions` (`onEdit` membuka modal, `onDelete` memanggil `deleteBatch`).
- Tanpa batch → `EmptyState` ringkas: "Belum ada batch".
- Tombol **Tambah batch** (pil sekunder, tinggi 44 px).
- Peringatan (`bg-admin-butter-soft text-admin-butter-ink`, satu baris per hal): biaya Rp0 → "Biaya belum diisi; pendaftaran tidak bisa dibuka."; tidak ada batch berstatus `open` → "Belum ada batch yang dibuka."

Modal batch (`FormDialog`, `size="md"`, satu kolom): `Nama batch` (wajib, `placeholder={nextBatchName(judul batch program itu)}`, tidak terisi otomatis); `Jadwal sesi (WIB)` — baris berulang tanggal / mulai / selesai dengan tombol "Tambah sesi" dan hapus per baris (minimal satu baris, tombol hapus nonaktif saat tinggal satu); sakelar `Buka pendaftaran` (bawaan mati) dengan petunjuk "Membuka batch ini menutup pendaftaran batch lain di program yang sama." Galat aksi tampil `role="alert"` di dalam modal; sukses menutup modal dan `router.refresh()`. Tiap kontrol baris sesi punya `aria-label` ("Tanggal sesi 1", …).

Kartu paket: `StatusChip` (`mint` "Ditawarkan" / `neutral` "Tidak ditawarkan"), harga paket, keterangan `Dari Speaker: + Rp… · Dari Sertifikasi: + Rp…` (dari `bundleAddOn`), tombol ubah → modal (`size="sm"`): sakelar `Tawarkan paket`, `Harga paket` (Rp), `DP paket (%)` (opsional), `Penjelasan` (satu kalimat, opsional). Peringatan: paket aktif tetapi `!bundlePriceValid(...)` → "Harga paket tidak lagi sah terhadap biaya program; tawaran tidak tampil."; paket aktif tetapi Speaker atau Sertifikasi tanpa batch `open` → "Tawaran tidak tampil sampai kedua program punya batch yang dibuka."

Kartu Inhouse: "Konsultasi langsung, tanpa batch" + tautan ubah.

Responsif: < 640 px baris batch menjadi dua baris (nama + chip, lalu keterangan + aksi); semua target sentuh ≥ 44 px; tidak ada gulir mendatar pada 360 px.

- [ ] **Step 4: Hapus `bundling/actions.ts`**

`saveProgramBundle` digantikan `saveBundle`. Pemakai terakhirnya (`ProgramForm.tsx`) dibersihkan pada Tugas 6; sampai saat itu `tsc` melaporkan satu galat impor di `ProgramForm.tsx`. Tugas ini di-commit bersama Tugas 6.

- [ ] **Step 5: Periksa**

Run: `npx eslint "app/(admin)/admin/program" components/admin/program`
Expected: tanpa galat.

---

### Task 6: Form Program, navigasi, pengalihan, ekspor

**Files:**
- Modify: `front/components/admin/ProgramForm.tsx`
- Modify: `front/app/(admin)/admin/program/[slug]/edit/page.tsx`
- Delete: `front/app/(admin)/admin/program/create/` (seluruh folder), `front/components/admin/ProgramRowActions.tsx`
- Modify: `front/app/(admin)/admin/batch/page.tsx` → pengalihan; Delete: `front/app/(admin)/admin/batch/loading.tsx`
- Modify: `front/lib/admin-nav.ts`, `front/lib/admin-nav.test.mjs`
- Modify: `front/app/api/admin/export/[module]/route.ts` (kasus `program` dan `batch`)

**Interfaces:**
- Consumes: `INHOUSE_SLUG` (Tugas 2).
- Produces: `ProgramForm` dengan props `{ initialData: ProgramInitial }` saja (tanpa `programOptions`, `initialBundle`); `ProgramInitial` bertambah `dp_percent: number | null`, `fee_details: string | null`, `form_kind: string | null`.

- [ ] **Step 1: Tes navigasi yang gagal**

Di `lib/admin-nav.test.mjs` tambahkan:

```js
test("Kelas berisi Program & Batch dan Trainer; /admin/batch bukan modul lagi", () => {
  const kelas = adminNavGroups.find((group) => group.id === "kelas");
  assert.deepEqual(kelas.modules.map((item) => item.label), ["Program & Batch", "Trainer"]);
  assert.equal(resolveAdminNav("/admin/batch").module, undefined);
  assert.equal(resolveAdminNav("/admin/program").module?.label, "Program & Batch");
});
```

Run: `node --test lib/admin-nav.test.mjs` → FAIL (label masih "Program", modul "Batch" masih ada).

- [ ] **Step 2: `admin-nav.ts`**

Kelompok `kelas`: modul pertama `{ label: "Program & Batch", href: "/admin/program", icon: "book", description: "Biaya dan isi tiap program, jadwal batch, dan tawaran paket." }`; hapus modul `Batch`. Run tes → PASS.

- [ ] **Step 3: `batch/page.tsx`**

Isi berkas menjadi: `await requireAdminMember(); redirect("/admin/program");` (pola `bundling/page.tsx`). Hapus `batch/loading.tsx`. `/admin/batch` tetap di `lib/albana-routes.ts` agar pengalihan terjangkau.

- [ ] **Step 4: `ProgramForm.tsx` dan halaman ubah**

- Hapus seluruh state, impor, dan bagian UI bundling (radio "Bundling", pasangan, judul, penjelasan, harga, DP bundling) serta pemanggilan `saveProgramBundle`.
- Hapus cabang "buat program": form hanya `update`; `initialData` wajib.
- Tambah di bagian biaya: `DP (%)` (`type="number"`, 1–99, petunjuk "Kosongkan bila DP tidak ditawarkan.") dan `Rincian biaya (opsional)` (textarea satu paragraf). Simpan sebagai `dp_percent` (kosong → `null`) dan `fee_details` (kosong → `null`).
- Validasi simpan: harga coret, bila diisi, harus > biaya → `"Harga coret harus lebih besar dari biaya."`; DP di luar 1–99 → `"DP harus 1–99%."`
- Bila `initialData.slug === INHOUSE_SLUG`: sembunyikan biaya, harga coret, DP, rincian biaya, dan naskah pertanyaan formulir; simpan hanya nama, deskripsi, materi; biaya tidak diwajibkan.
- Jenis formulir tidak ditampilkan sebagai isian.
- `edit/page.tsx`: `select` bertambah `dp_percent, fee_details, form_kind`; hapus kueri `programs` lain dan `bundle_offers`; render `<ProgramForm initialData={program} />`.
- Hapus folder `create/` dan `ProgramRowActions.tsx`.

- [ ] **Step 5: Ekspor**

`route.ts`, kasus `program`: `select` bertambah `dp_percent`; tambah kolom `{ header: "DP (%)", value: (row) => row.dp_percent }` setelah "Harga coret". Kasus `batch`: hapus `price_idr` dari `select` dan hapus kolom "Harga"; hapus kolom "Aktif" (kini selalu sama dengan "Pendaftaran dibuka").

- [ ] **Step 6: Periksa**

Run: `node --test lib/admin-nav.test.mjs lib/admin-export.test.mjs lib/albana-routes.test.mjs && npx tsc --noEmit && npx eslint "app/(admin)/admin/program" "app/(admin)/admin/batch" components/admin/program components/admin/ProgramForm.tsx lib/admin-nav.ts "app/api/admin/export/[module]/route.ts" && npm run build`
Expected: PASS, tanpa galat tipe, build selesai. `grep -rn "saveProgramBundle\|ProgramRowActions\|readBundleChoice\|admin/program/create" app components lib` → tanpa hasil.

Di peramban dengan sesi admin (pemilik yang login; jangan mengetik kredensial), lebar 1280 dan 390:
- `/admin/program` menampilkan lima kartu sesuai urutan; `/admin/batch` beralih ke sana.
- Tambah batch pada Sertifikasi: placeholder `ASA Batch 1`; pada Series: `Batch 11`. Simpan dengan nama + satu sesi → muncul berstatus "Ditutup"; batch lain program itu tetap "Dibuka".
- Nyalakan "Buka pendaftaran" pada batch baru Series → batch lama menjadi "Ditutup".
- Simpan dengan sesi tumpang tindih → pesan galat di modal, tidak tersimpan.
- Ubah paket dengan harga Rp2.000.000 → ditolak dengan pesan harga paket.
- < 640 px: modal menjadi bottom sheet; tidak ada gulir mendatar.

Kembalikan data uji Series ke keadaan semula (hapus batch uji, buka lagi `Batch 10`).

- [ ] **Step 7: Commit (Tugas 5 + 6)**

```bash
git add -A "front/app/(admin)/admin/program" "front/app/(admin)/admin/batch" "front/app/(admin)/admin/bundling" front/components/admin/program front/components/admin/ProgramForm.tsx front/components/admin/ProgramRowActions.tsx front/lib/admin-nav.ts front/lib/admin-nav.test.mjs "front/app/api/admin/export/[module]/route.ts"
git commit -m "feat(admin): satu layar Program & Batch, modal batch ringkas, kartu paket (4.2.4-4)"
```

Laporkan bahwa commit ini ikut membawa perubahan pemilik di `app/(admin)/admin/program/page.tsx`.

---

### Task 7: Uji ujung ke ujung dan dokumen

**Files:**
- Modify: `docs/albana-docs/plans/2026-11-16-program-batch-bundling-design.md` (baris status)
- Modify: `docs/albana-docs/registration/cms-program-batch-bundling.md` (baris status)
- Modify: `docs/albana-docs/data/database-schema.md` (`programs.dp_percent|form_kind|fee_details`; trigger `batches_single_open`; kolom batch yang tidak lagi diisi)
- Modify: `docs/albana-docs/design/admin-ui-patterns.md` (§8.2 matriks: baris "Program & Batch" tanpa toolbar; baris Batch dihapus)
- Modify: `docs/albana-docs/plans/2026-11-16-redesign-restructure-implementation-plan.md` (centang 4.2.4)
- Modify: `front/AGENTS.md` (baris "Admin Albana": `{program,trainer,media,tagihan}`; catatan `/admin/batch` dan `/admin/bundling` hanya pengalihan)

- [ ] **Step 1: Siapkan data uji lewat CMS**

Di `/admin/program`: buat batch Sertifikasi "ASA Batch 1" (satu sesi, ≥ 7 hari ke depan), buka pendaftarannya; nyalakan paket Rp2.900.000, DP 20%.

- [ ] **Step 2: Jalankan skenario rancangan §8 di peramban (390 dan 1280)**

| # | Langkah | Hasil yang harus terlihat |
| --- | --- | --- |
| 1 | `/register/public-speaking-for-speakers`, isi sampai langkah akhir | Kartu "Sekalian ambil sertifikasi?"; bawaan "Tidak"; ringkasan Biaya Rp1.300.000 |
| 2 | Pilih "Tambah Sertifikasi…", metode DP | `+ Rp1.600.000`; Total paket Rp2.900.000 (hemat Rp400.000); kalimat "tidak menjamin kelulusan"; Biaya Rp2.900.000 · Transfer sekarang Rp580.000 · Sisa Rp2.320.000 |
| 3 | Kirim | Halaman konfirmasi "Paket Speaker + Sertifikasi" dengan dua nama batch; tagihan Rp580.000 + kode unik |
| 4 | `/register/sertifikasi-pembicara-profesional`, pilih tambah Speaker, lunas, kirim (email lain) | `+ Rp900.000`; tagihan Rp2.900.000 + kode unik |
| 5 | Buka formulir Speaker, lalu ubah biaya Speaker di CMS menjadi Rp1.400.000, lalu kirim tanpa paket | Ditolak: "Harga atau pilihan kelas berubah…"; tombol kirim nonaktif; muat ulang menampilkan Rp1.400.000 |
| 6 | Buka formulir Speaker dan pilih paket, lalu tutup batch Sertifikasi di CMS, lalu kirim | Ditolak: "Kelas atau rekening pembayaran belum tersedia."; muat ulang → kartu tawaran hilang |
| 7 | `/register/public-speaking-series` | Tidak ada kartu tawaran |
| 8 | Beranda | Tiga kartu Public Training + Inhouse; tidak ada kartu paket |

Kiriman pada langkah 3 dan 4 memakai data uji buatan (nama "Uji Paket", email `uji+…@example.com`). Formulir publik boleh diisi agen; halaman admin memakai sesi pemilik.

- [ ] **Step 3: Bersihkan**

Kembalikan biaya Speaker ke Rp1.300.000 lewat CMS. Tunjukkan kepada pemilik baris uji di `academy_registrations` (cari `full_name = 'Uji Paket'`) dan **minta persetujuan sebelum menghapusnya**; penghapusan permanen tidak dilakukan tanpa "ya". Tanyakan juga apakah batch Sertifikasi uji dan sakelar paket dibiarkan atau dikembalikan.

- [ ] **Step 4: Perbarui dokumen**

- Rancangan: status → `disetujui pemilik 17 November 2026 · diterapkan`.
- `cms-program-batch-bundling.md`: hapus kalimat "menunggu persetujuan … belum diterapkan di kode" dan kalimat tentang kode lama.
- `database-schema.md`, `admin-ui-patterns.md` §8.2, `front/AGENTS.md`, dan centang 4.2.4 sesuai daftar berkas di atas. `database-schema.md` memuat perubahan pemilik yang belum di-commit; sunting hanya bagian `programs` / `batches` / `bundle_offers`.

- [ ] **Step 5: Pemeriksaan akhir**

Run: `node --test lib/*.test.mjs` — catat hasil sebenarnya; `lib/admin-list.test.mjs` sudah gagal sebelum pekerjaan ini (impor `./format` tanpa akhiran) dan bukan bagian rencana. Lalu `npx tsc --noEmit && npm run build`.
Expected: semua tes lain PASS; build selesai.

- [ ] **Step 6: Commit**

```bash
git add docs/albana-docs/plans/2026-11-16-program-batch-bundling-design.md docs/albana-docs/plans/2026-11-17-program-batch-bundling-implementation-plan.md docs/albana-docs/plans/2026-11-16-redesign-restructure-implementation-plan.md docs/albana-docs/registration/cms-program-batch-bundling.md docs/albana-docs/data/database-schema.md docs/albana-docs/design/admin-ui-patterns.md front/AGENTS.md
git commit -m "docs: Program & Batch dan tawaran paket diterapkan; skema dan pola UI diperbarui (4.2.4-5)"
```

---

## Cakupan rancangan

| Rancangan | Tugas |
| --- | --- |
| §5.1 Program tetap, isian biaya/DP/rincian | 1, 6 |
| §5.2 Batch ringkas, satu batch dibuka | 1, 2, 5 |
| §5.3 Layar Program & Batch, status, peringatan | 5, 6 |
| §5.4 Aturan tawaran paket | 1, 2, 3 |
| §5.5 `/register` | 3, 4 |
| §5.6 Landing dan halaman program | 3 |
| §6 Data | 1 (penghapusan kolom lama di luar cakupan) |
| §8 Pemeriksaan | 1, 2, 7 |
