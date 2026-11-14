# Form Wizard Empat Langkah Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah formulir pendaftaran `/register/<slug-program>` dari satu halaman menjadi wizard empat langkah; langkah dengan error tidak bisa dilanjutkan, pengguna bisa kembali.

**Architecture:** Model langkah (judul + daftar field) dan gerbang validasi per langkah hidup di modul murni `web/lib/registration-form.ts` dan diuji dengan `node --test`. Komponen klien `registration-form.tsx` menyimpan satu state `values` (seperti sekarang), menambah state `step`, dan hanya merender field langkah aktif. Kirim ke `POST /api/registrations` tetap terjadi sekali, di langkah terakhir. Tidak ada rute atau state URL baru.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS v4, `node --test` (`.mjs`, strip-types). Tidak ada runner uji komponen.

**Design Read (RYUX):** Dibaca sebagai UI tugas pendaftaran untuk calon peserta, bahasa editorial Swiss mengikuti `docs/design.md`, dial **ENERGY 1 / RHYTHM 1 / MOTION 1**. Fokus satu per layar di judul langkah aktif; aksen satu (tombol primary); motif identitas = nomor tabular `01`–`04` seperti daftar bernomor yang sudah dipakai situs. Tidak ada animasi baru, jadi MOTION tetap 1.

**Spec:** `docs/archive/working-notes/superpowers/specs/2026-11-09-form-pendaftaran-design.md` (lihat catatan **Revisi** yang ditambahkan Task 3)

## Global Constraints

- Ini revisi keputusan spec (dulu "satu halaman") atas permintaan pemilik; catat sebagai revisi, bukan ubah diam-diam.
- Empat langkah tetap: 1 **Data diri**, 2 **Latar belakang dan motivasi**, 3 **Informasi teknis**, 4 **Pembayaran dan persetujuan**.
- Langkah dengan `validateRegistration` error pada field miliknya **tidak boleh** maju. Tombol Kembali tersedia dari langkah 2 ke atas.
- `parseRegistration` (`web/lib/registration-input.ts`) tetap otoritas validasi server; kontrak `POST /api/registrations` dan `buildRegistrationPayload` **tidak berubah**. Kirim hanya di langkah 4.
- Radius 0 px, token dari `web/app/globals.css`, target sentuh ≥44 px, fokus terlihat, error selalu bertekst, tidak ada warna sebagai satu-satunya penanda (`docs/design.md`).
- Naskah Indonesia. Rupiah lewat `formatRupiah` bersama.
- **R-02 (Hard Gate): tidak ada em dash `—` pada teks.** Ganti dengan tanda kurung. Berlaku juga untuk komentar berkas yang ditulis agen.
- Perintah dari `web/`: `node --test lib/*.test.mjs`, `npm run lint`, `npx --no-install tsc --noEmit`, `npm run build`.

## Review Focus

Kelas input/kegagalan paling mungkin menggigit; tiap baris punya uji atau langkah verifikasi di task yang memiliki kodenya:

1. Varian `bnsp` tidak punya field tantangan; langkah 2 harus tetap lolos dengan `challenge` kosong. (Task 1)
2. Field muncul kondisional (`socialOther` saat "Lainnya" dipilih, `sourceOther` saat sumber "Lainnya") harus tetap memblokir langkah-nya sendiri, bukan langkah lain. (Task 1)
3. Setiap field `RegistrationValues` dimiliki tepat satu langkah; tidak ada field yatim, tidak ada yang dobel. (Task 1)
4. Enter di dalam input teks pada langkah 1–3 tidak boleh mengirim formulir; harus maju seperti tombol Lanjut dan tetap diblokir bila error. (Task 2)
5. Fokus keyboard berpindah ke judul langkah baru setelah Lanjut; kembali tidak mengosongkan isian. (Task 2, Task 4)
6. Server menolak saat kirim (409/422/429) di langkah 4: isian tetap, banner tampil, ada jalan kembali. (Task 4)

## File Structure

- `web/lib/registration-form.ts`: tambah `RegistrationStepId`, `RegistrationStep`, `REGISTRATION_STEPS`, `validateRegistrationStep`. Tidak mengubah `validateRegistration`/`buildRegistrationPayload`.
- `web/lib/registration-form.test.mjs`: tambah uji langkah & gerbang.
- `web/components/register/registration-form.tsx`: wizard: state `step`, gerbang maju, tombol Lanjut/Kembali, indikator langkah, fokus ke judul; perbaiki em dash.
- `web/app/register/preview/page.tsx`: ganti em dash di komentar (berkas dev, tidak dikomit).
- `docs/home-content.md`, `docs/design.md`, `docs/archive/working-notes/superpowers/specs/2026-11-09-form-pendaftaran-design.md`: catat bentuk wizard.

---

### Task 1: Model langkah + gerbang validasi per langkah

**Files:**
- Modify: `web/lib/registration-form.ts`
- Test: `web/lib/registration-form.test.mjs`

**Interfaces:**
- Consumes: `RegistrationValues`, `RegistrationErrors`, `validateRegistration` (sudah ada).
- Produces:
  - `type RegistrationStepId = "identity" | "background" | "technical" | "payment"`
  - `type RegistrationStep = { id: RegistrationStepId; title: string; fields: readonly (keyof RegistrationValues)[] }`
  - `REGISTRATION_STEPS: readonly RegistrationStep[]` (4 entri, urut; judul: `"Data diri"`, `"Latar belakang dan motivasi"`, `"Informasi teknis"`, `"Pembayaran dan persetujuan"`)
  - `validateRegistrationStep(values: RegistrationValues, batch: RegistrationBatch, stepId: RegistrationStepId): RegistrationErrors`: jalankan `validateRegistration` penuh, kembalikan hanya error untuk field milik langkah itu.

**Pembagian field (tepat satu langkah per field):**

| id | fields |
|---|---|
| `identity` | `fullName`, `nickname`, `domicile`, `whatsapp`, `email`, `gender`, `age`, `profession`, `institution` |
| `background` | `priorExperience`, `goal`, `challenge` |
| `technical` | `socials`, `socialOther`, `socialName`, `source`, `sourceOther`, `attendance` |
| `payment` | `paymentMethod`, `consent` |

- [ ] **Step 1: Tulis uji yang gagal**

Tambahkan ke `web/lib/registration-form.test.mjs` (impor `REGISTRATION_STEPS`, `validateRegistrationStep` dari `./registration-form.ts`; `batch` dan `filled` sudah ada di berkas ini):

```js
test("setiap field dimiliki tepat satu langkah", () => {
  const owned = REGISTRATION_STEPS.flatMap((step) => step.fields);
  assert.equal(new Set(owned).size, owned.length, "ada field dobel antar langkah");
  assert.deepEqual([...owned].sort(), Object.keys(emptyRegistrationValues()).sort());
});

test("validateRegistrationStep hanya mengembalikan error langkah itu", () => {
  const errors = validateRegistrationStep(emptyRegistrationValues(), batch, "identity");
  assert.ok(errors.fullName);
  assert.ok(errors.email);
  assert.equal(errors.goal, undefined);
  assert.equal(errors.paymentMethod, undefined);
});

test("langkah terisi lolos untuk tiap varian, termasuk bnsp tanpa tantangan", () => {
  for (const formKind of ["series", "exclusive", "bnsp"]) {
    const values = { ...filled(), challenge: formKind === "bnsp" ? "" : "Tantangan" };
    const variantBatch = { ...batch, formKind };
    for (const step of REGISTRATION_STEPS) {
      assert.deepEqual(validateRegistrationStep(values, variantBatch, step.id), {}, `${formKind}/${step.id}`);
    }
  }
});

test("field kondisional memblokir langkahnya sendiri", () => {
  const errors = validateRegistrationStep({ ...filled(), source: "other", sourceOther: "" }, batch, "technical");
  assert.ok(errors.sourceOther);
  assert.equal(errors.goal, undefined);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `node --test lib/registration-form.test.mjs`
Expected: FAIL: `REGISTRATION_STEPS`/`validateRegistrationStep` belum ada.

- [ ] **Step 3: Implementasikan di `web/lib/registration-form.ts`**

Tambah `RegistrationStepId`, `RegistrationStep`, `REGISTRATION_STEPS` (judul dan urutan persis tabel di atas). `validateRegistrationStep` memanggil `validateRegistration(values, batch)` sekali, lalu menyalin hanya key yang ada di `step.fields` milik langkah yang diminta. Langkah tak dikenal → objek kosong.

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `node --test lib/registration-form.test.mjs`
Expected: PASS (9). Lalu `node --test lib/*.test.mjs` → 16 lulus, 0 gagal.

- [ ] **Step 5: Cek tipe dan lint**

Run: `npx --no-install tsc --noEmit && npm run lint`
Expected: tanpa error.

- [ ] **Step 6: Commit**

```bash
git add web/lib/registration-form.ts web/lib/registration-form.test.mjs
git commit -m "feat(register): model langkah dan gerbang validasi per langkah"
```

---

### Task 2: Komponen wizard

**Files:**
- Modify: `web/components/register/registration-form.tsx`
- Modify: `web/app/register/preview/page.tsx` (komentar saja, berkas dev)

**Interfaces:**
- Consumes: `REGISTRATION_STEPS`, `validateRegistrationStep`, `RegistrationStepId` (Task 1); `validateRegistration` tetap untuk kirim akhir.
- Produces: `RegistrationForm` yang sama (`{ batch }`), kini bertahap. `id="form-pendaftaran"` dan `id="pembayaran"` tetap agar tautan `register-page.tsx` tidak berubah.

- [ ] **Step 1: Tambah state langkah dan handler**

Impor `REGISTRATION_STEPS`, `validateRegistrationStep`. Tambah `useEffect`, `useRef` ke impor `react` (kini hanya `useState`). Tambah `const [step, setStep] = useState(0)` dan `const currentStep = REGISTRATION_STEPS[step]`.

```tsx
const headingRef = useRef<HTMLHeadingElement>(null);
const skipInitialFocus = useRef(true);
useEffect(() => {
  if (skipInitialFocus.current) { skipInitialFocus.current = false; return; }
  headingRef.current?.focus();
}, [step]);

function goNext() {
  const nextErrors = validateRegistrationStep(values, batch, currentStep.id);
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) {
    setBanner({ message: "Periksa kembali bagian yang ditandai." });
    document.getElementById(Object.keys(nextErrors)[0])?.focus();
    return;
  }
  setBanner(null);
  setStep((index) => index + 1);
}

function goBack() {
  setErrors({});
  setBanner(null);
  setStep((index) => index - 1);
}
```

- [ ] **Step 2: Jaga Enter agar tidak mengirim di langkah awal**

Di awal `handleSubmit`, sebelum validasi penuh:

```tsx
if (step < REGISTRATION_STEPS.length - 1) {
  goNext();
  return;
}
```

Sisa `handleSubmit` (validasi penuh + `fetch`) tidak berubah.

- [ ] **Step 3: Render indikator langkah, judul, field langkah aktif, dan navigasi**

Ganti blok `<div className="mt-6 grid gap-8">` + empat `<Section>`. Hapus komponen `Section` (judulnya kini dari langkah). Struktur:

```tsx
<div className="mt-6">
  <ol aria-label="Langkah pendaftaran" className="flex flex-wrap gap-x-5 gap-y-2">
    {REGISTRATION_STEPS.map((item, index) => (
      <li key={item.id} aria-current={index === step ? "step" : undefined}
          className={index === step ? "text-ink font-semibold" : "text-muted"}>
        <span aria-hidden="true" className="text-xs tabular-nums">{String(index + 1).padStart(2, "0")}</span>{" "}
        {item.title}
      </li>
    ))}
  </ol>

  <h3 ref={headingRef} tabIndex={-1} className="mt-5 text-lg font-semibold tracking-[-0.015em]">
    {currentStep.title}
  </h3>

  <div className="mt-4 grid gap-5">
    {currentStep.id === "identity" ? (/* field A seperti sekarang, tanpa <Section> */) : null}
    {currentStep.id === "background" ? (/* field B */) : null}
    {currentStep.id === "technical" ? (/* field C */) : null}
    {currentStep.id === "payment" ? (/* field D + E: RadioGroup paymentMethod, checkbox consent, pesan error consent */) : null}
  </div>

  <div className="mt-8 flex flex-wrap items-center gap-3">
    {step > 0 ? <button type="button" className="button-secondary" onClick={goBack}>Kembali</button> : null}
    {step < REGISTRATION_STEPS.length - 1 ? (
      <button type="button" className="button-primary" onClick={goNext}>Lanjut</button>
    ) : (
      <button type="submit" className="button-primary" disabled={isSubmitting}>
        {isSubmitting ? "Mengirim…" : "Kirim pendaftaran"}
      </button>
    )}
  </div>
</div>
```

Field di tiap blok dipindahkan apa adanya dari `<Section>` lama (buang wrapper `<fieldset>`/`<legend>`) dengan `label`/`hint`/`required`/`error` yang sama. Judul `<h3>` jangan diberi `outline-none`: biarkan gaya fokus global berlaku (R-32).

- [ ] **Step 4: Perbaiki em dash (R-02)**

Di langkah `payment`, ganti label:
- `` `Bayar penuh — ${formatRupiah(batch.priceIdr)}` `` → `` `Bayar penuh (${formatRupiah(batch.priceIdr)})` ``
- `` `DP ${batch.dpPercent}% — ${formatRupiah(dpAmount)}` `` → `` `DP ${batch.dpPercent}% (${formatRupiah(dpAmount)})` ``

Di `web/app/register/preview/page.tsx` baris komentar, ganti em dash dengan `:`.

- [ ] **Step 5: Cek em dash habis**

Run: `rg "—" web/components/register web/app/register`
Expected: tidak ada hasil (kecuali `count-up.tsx` di luar tugas ini, yang tidak disentuh).

- [ ] **Step 6: Cek tipe, lint, build**

Run: `npx --no-install tsc --noEmit && npm run lint && npm run build`
Expected: semua lulus; tidak ada `useRef`/`useEffect` yang tak terpakai.

- [ ] **Step 7: Commit**

```bash
git add web/components/register/registration-form.tsx
git commit -m "feat(register): formulir pendaftaran wizard empat langkah"
```

---

### Task 3: Perbarui dokumentasi dan spec

**Files:**
- Modify: `docs/home-content.md` (baris 199)
- Modify: `docs/design.md` (baris 211)
- Modify: `docs/archive/working-notes/superpowers/specs/2026-11-09-form-pendaftaran-design.md` (§4, §5, §7.2)

- [ ] **Step 1: `docs/home-content.md`**

Ganti butir 199 "Formulir pendaftaran satu halaman di dalam situs (bagian A–E) yang mengirim langsung ke sistem akademi." menjadi "Formulir pendaftaran empat langkah di dalam situs (Data diri, Latar belakang dan motivasi, Informasi teknis, Pembayaran dan persetujuan) yang mengirim langsung ke sistem akademi. Langkah dengan error tidak bisa dilanjutkan; tombol Kembali tersedia." Sisanya (URL `/register/<slug-program>`, pemilihan batch server) tidak berubah.

- [ ] **Step 2: `docs/design.md`**

Di baris 211, ganti "formulir pendaftaran satu halaman (bagian A–E, input garis bawah) di kolom kanan" menjadi "formulir pendaftaran empat langkah (bagian A–E: Data diri, Latar belakang dan motivasi, Informasi teknis, Pembayaran dan persetujuan; input garis bawah, indikator langkah, tombol Lanjut tertahan bila ada error, tombol Kembali) di kolom kanan".

- [ ] **Step 3: `docs/.../2026-11-09-form-pendaftaran-design.md`**

Tambahkan tepat di bawah baris `Status:` catatan revisi:

> Revisi 9 November 2026: bentuk formulir berubah dari satu halaman menjadi wizard empat langkah atas permintaan pemilik; lihat `docs/archive/working-notes/superpowers/plans/2026-11-09-form-wizard.md`.

§4 butir "Bentuk: satu halaman…" → "**Bentuk: wizard empat langkah.** Bagian A–E dipetakan ke empat langkah; langkah dengan error tidak bisa dilanjutkan (lihat Revisi)."

§5: tandai opsi A "Tidak dipilih." dan opsi B "**Wizard bertahap (dipilih pengguna pada revisi).** Empat langkah dengan tombol Lanjut dan Kembali."

§7 butir 2 "Bangun primitif field + formulir satu halaman." → "…formulir wizard empat langkah."

- [ ] **Step 4: Periksa diff**

Run: `git diff --check`
Expected: bersih (kecuali peringatan LF/CRLF). Pastikan tidak ada kalimat "satu halaman" yang tersisa di berkas yang menyatakan perilaku saat ini.

- [ ] **Step 5: Commit**

```bash
git add docs/home-content.md docs/design.md docs/archive/working-notes/superpowers/specs/2026-11-09-form-pendaftaran-design.md
git commit -m "docs: formulir pendaftaran menjadi wizard empat langkah"
```

---

### Task 4: Verifikasi render dan alur (butuh batch dev)

**Files:**
- Tidak ada berkas baru. Butuh batch menerima di Supabase (SQL di plan `2026-11-09-form-pendaftaran.md`, Task 7).

**Prasyarat:** batch dev (`public-speaking-series`) dengan `status='open'` sudah di-seed. Bila belum, catat sebagai prasyarat yang hilang, jangan klaim lulus.

- [ ] **Step 1: Jalankan dev dan buka rute**

Run: `npm run dev`, buka `http://localhost:3000/register/public-speaking-series`.

- [ ] **Step 2: Uji gerbang tiap langkah**

- Langkah 1 kosong → klik Lanjut: tidak pindah, field pertama difokuskan, ada pesan.
- Isi langkah 1 benar → Lanjut: pindah ke langkah 2, fokus di judul langkah 2.
- Langkah 2 kosong → Lanjut: tetap di langkah 2.
- Kembali dari langkah 2 → isian langkah 1 masih ada.
- Tekan Enter di input teks langkah 1 → sama seperti Lanjut (maju bila valid, tertahan bila error), tidak terkirim.
- Sampai langkah 4 → tombol "Kirim pendaftaran" muncul; isi lengkap → terkirim, tanda terima tampil.

- [ ] **Step 3: Uji lebar dan keyboard**

Render 1440, 834, 390, 320: indikator langkah membungkus rapi, tanpa overflow horizontal. Tab urut lewat indikator, field, Lanjut/Kembali; fokus terlihat. Uji `prefers-reduced-motion` tidak mengubah apa pun (tidak ada animasi baru).

- [ ] **Step 4: Uji kegagalan kirim di langkah 4**

- Tutup batch (`status='closed'`) lalu kirim → banner 409, isian tetap, tautan kembali; buka lagi.
- Kirim email yang sama dua kali → hanya satu tersimpan.
- Tambahkan label pembayaran: pastikan tampil `Bayar penuh (Rp1.500.000)` tanpa em dash.

- [ ] **Step 5: Catat hasil**

Tulis URL, lebar, status HTTP, dan sisa risiko di ringkasan. Tidak ada commit kode. Bersihkan baris data uji seperti Task 7 plan sebelumnya.

---

## Catatan penutup

- `RegistrationForm` semakin panjang (mendekati batas tinjau 200 baris AGENTS). Bila melewati jauh, pecah perender field tiap langkah jadi komponen bernama di berkas yang sama; jangan buat lapisan state baru.
- Em dash di `web/components/ui/count-up.tsx` sudah ada sebelum tugas ini dan di luar cakupan; jangan disentuh.
- Bila `SUPABASE_URL`/kunci tidak tersedia di lingkungan, catat sebagai prasyarat hilang, bukan kegagalan.
