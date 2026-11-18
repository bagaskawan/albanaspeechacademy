# Implementation plan — Dashboard, Kalender & Analitik Demografi

**Tanggal:** 18 November 2026
> **Status eksekusi (18 Nov 2026):** F0–F4 dikerjakan dengan penyederhanaan berikut.
> - **Tanpa view & RPC (§2.2–2.4 tidak dibuat).** Logika statistik tetap di `lib/server/admin-dashboard.ts` (sudah teruji); batas 1000 baris ditutup dengan fetch berhalaman di `app/(admin)/admin/page.tsx`. Kalender menurunkan sesi dari `batches.sessions` lewat `lib/server/admin-calendar.ts` (memakai `fromStoredSessions`/`wibMs`). Database hanya mendapat migrasi index `20261118063011_dashboard_indexes` (sudah diterapkan ke proyek live).
> - **`batches.capacity` tidak ditambahkan** (keputusan pemilik), jadi KPI keterisian tidak ada.
> - **Formulir:** domisili memakai daftar 514 kab/kota + "Luar Indonesia" (`lib/demographics.ts`), disimpan di `answers.domicile` yang sama (bukan kunci baru); profesi memakai `answers.professionCategory`, dan kategori "Lainnya" membuka isian bebas.
> - **Feed `.ics` ditunda.**

**Cakupan:** `/admin` (dashboard), halaman kalender baru, analitik demografi peserta.
**Sumber audit:** katalog Postgres live proyek `clgjsekfnexmanjdxmqy` (`pg_indexes`, `information_schema.columns`, `pg_stat_user_tables`, 18 Nov 2026), migrasi `front/supabase/migrations/`, [`database-schema.md`](../data/database-schema.md), `front/lib/server/admin-dashboard.ts`, `front/app/(admin)/admin/page.tsx`, `front/components/admin/stats/*`, `front/lib/program-batch.ts`, `front/lib/registration-form.ts`.

---

## 1. Hasil audit sistem & database

### 1.1 Alur kerja saat ini

```
Formulir publik ──► POST /api/registrations ──► RPC receive_academy_registration (service role)
   │                                             ├─ academy_registrations (+ answers jsonb)
   │                                             ├─ academy_registration_items (1 baris / batch; bundling = 2)
   │                                             └─ academy_invoices stage=initial (pending, kode unik)
   ▼
Admin /tagihan ──► record_invoice_payment (bukti transfer → academy_invoice_payments)
              └──► resolve_academy_invoice (verified/rejected; DP → buat invoice stage=remaining)
              └──► academy_email_deliveries (instruksi, konfirmasi, penolakan)

Dashboard /admin ──► 5 query PostgREST (limit 1000) ──► buildDashboardStats() di Node ──► DashboardView
```

Katalog: `programs` (4, tetap) → `batches` (jadwal di `sessions` jsonb, WIB tanpa zona). `trainers` sengaja tidak berelasi dengan batch (`batch_trainers` dihapus migrasi `20261113090000`).

### 1.2 Snapshot data (live)

| Tabel | Baris | Catatan |
| --- | ---: | --- |
| `programs` | 4 | |
| `batches` | 3 | |
| `academy_registrations` / `_items` / `academy_invoices` | 0 | **Belum ada data transaksi** → perubahan skema & formulir sekarang paling murah (tanpa backfill). |
| `media_assets` | 22 | |
| `gallery` | 13 | |

### 1.3 Temuan — skema & relasi

| # | Temuan | Dampak | Prioritas |
| --- | --- | --- | --- |
| S1 | Jadwal sesi disimpan sebagai `batches.sessions` jsonb (`[{starts_at, ends_at}]` naif WIB, atau `[{starts_at, ends_at, start_only, session_count}]`). Tidak ada tabel/relasi sesi. | Kalender tidak bisa di-query per rentang tanggal tanpa `jsonb_array_elements`. Mode *start_only* hanya tahu tanggal mulai. | Tinggi (Kalender) |
| S2 | Tidak ada kapasitas/kuota batch. Kolom `capacity` hanya tersisa di `lib/cms-fields.ts` (editor generik lama), tidak ada di tabel. | KPI *fill rate* / sisa kursi tidak mungkin. | Sedang |
| S3 | Demografi hanya di `academy_registrations.answers` jsonb: `gender` (enum terkontrol), `age` (angka), `domicile`, `profession`, `institution` (**teks bebas**), `priorExperience`, `source`, `sourceOther`, `attendance`. | Gender/usia/sumber bisa diagregasi; domisili & profesi teks bebas → tidak bisa dikelompokkan dengan andal ("Bdg", "Kota Bandung", "bandung"). | Tinggi (Demografi) |
| S4 | Tidak ada status keikutsertaan/kehadiran per peserta per batch. "Peserta" hanya bisa diturunkan dari status invoice (lunas = semua invoice `verified`). | Tidak ada metrik kehadiran/penyelesaian. Diterima untuk fase ini (lihat §5 keputusan). | Rendah |
| S5 | `batches` & `programs` tidak punya `created_at`/`updated_at`. | Tidak ada jejak kapan batch dibuka; *lead time* pendaftaran harus pakai tanggal sesi pertama. | Rendah |
| S6 | Kolom warisan `batches.venue, address, price_idr, normal_price_idr, fee_details, form_kind, dp_percent` masih ada tetapi tidak dibaca. | Kebingungan saat menambah lokasi kalender. Jangan dipakai ulang; hapus di migrasi terpisah (sudah direncanakan di `database-schema.md`). | Rendah |
| S7 | `lib/server/registration-batch.ts:84` membaca `program.format`, kolom yang tidak ada di `programs`. Selalu jatuh ke fallback `"N pertemuan"`. | Bukan bug fungsional, tapi kontrak palsu. | Rendah |
| S8 | Bundling: satu registrasi → 2 baris `academy_registration_items`. | Agregasi per batch harus menghitung dari *items*, per orang dari *registrations*; jangan menjumlah keduanya. Kode sekarang sudah benar (`perProgram` pakai `Set` id). | Info |

### 1.4 Temuan — indexing (live `pg_indexes`)

Index yang ada di tabel transaksi hanya PK, `idempotency_key`, `(registration_id, stage)`, `academy_invoice_active_code`, `academy_invoice_payments_invoice_idx`. **Tidak ada** index untuk filter dashboard:

| Query | Kolom filter | Index yang diusulkan |
| --- | --- | --- |
| Pendaftar per periode | `academy_registrations.received_at` | `academy_registrations_received_at_idx (received_at)` |
| Pendaftar per batch | `academy_registration_items.batch_slug` (PK diawali `registration_id`) | `academy_registration_items_batch_idx (batch_slug)` |
| FK registrasi → batch | `academy_registrations.primary_batch_slug` | `academy_registrations_primary_batch_idx (primary_batch_slug)` |
| Pendapatan terverifikasi | `academy_invoices (status, reviewed_at)` | `academy_invoices_verified_idx (reviewed_at) where status = 'verified'` |
| Antrean tagihan | `academy_invoices (status, created_at)` | `academy_invoices_pending_idx (created_at) where status = 'pending'` |
| Lock pendaftaran ganda (`registration_pending_lock`) | `academy_registrations.email` + join pending | `academy_registrations_email_idx (email)` |

Volume kini 0 baris, jadi ini pencegahan, bukan perbaikan kinerja yang terukur.

### 1.5 Temuan — lapisan aplikasi dashboard

| # | Temuan | Dampak |
| --- | --- | --- |
| A1 | Agregasi di Node (`buildDashboardStats`) atas hasil `select … limit(1000)`. Komentar `shortcut:` di `page.tsx` sudah mengakui batas ini. | Angka diam-diam salah setelah >1000 registrasi/invoice dalam jendela periode. Filter program/batch akan memperbesar masalah. |
| A2 | Tidak ada filter program/batch; hanya periode (`30d`/`90d`/`ytd`). | Permintaan "demografi per program/batch" belum didukung. |
| A3 | Komposisi demografi: sumber, usia, gender, pengalaman, metode bayar. Domisili & profesi tidak divisualisasikan (karena S3). Ambang `n ≥ 5` sudah ada — pertahankan (privasi). | |
| A4 | UI (tangkapan layar): pill `n = 0` di kartu "Sumber informasi" pecah dua baris; ada elemen bulat terpotong di tepi kanan sekitar baris grafik; grafik kosong menampilkan sumbu 0–4 penuh alih-alih *empty state*. | Kosmetik, perbaiki di Fase 2. |
| A5 | Folder `front/components/admin/dashboard/**` (StreakLeaderboard, MonetizationInterests, dll.) tidak diimpor dari mana pun — sisa dashboard komunitas. | Kode mati. Disebut saja; hapus hanya bila disetujui. |
| A6 | Library tersedia: `recharts` 3.9, `react-day-picker` 10, `date-fns` 4. Tidak perlu dependensi baru untuk kalender bulanan/agenda. | |

---

## 2. Rekomendasi perbaikan skema

Prinsip: **turunkan, jangan duplikasi.** Kalender dan demografi dibaca dari sumber yang sudah ada lewat *view*, sehingga "tersinkronisasi otomatis" tanpa trigger/sinkronisasi.

### 2.1 Migrasi `…_dashboard_indexes.sql` (wajib)

Enam index di §1.4. Aman, tanpa perubahan data.

### 2.2 View `batch_sessions_v` (wajib, untuk Kalender)

```sql
create view public.batch_sessions_v with (security_invoker = true) as
select b.slug as batch_slug, b.program_slug, b.title as batch_title, p.title as program_title,
       b.registration_open,
       s.ordinality::int as sequence,
       ((s.value->>'starts_at')::timestamp at time zone 'Asia/Jakarta') as starts_at,
       ((s.value->>'ends_at')::timestamp   at time zone 'Asia/Jakarta') as ends_at,
       coalesce((s.value->>'start_only')::boolean, false) as start_only,
       (s.value->>'session_count')::int as session_count
from public.batches b
join public.programs p on p.slug = b.program_slug
cross join lateral jsonb_array_elements(b.sessions) with ordinality s(value, ordinality);
```

- Mengubah jadwal di CMS batch langsung mengubah kalender — tidak ada tabel kedua.
- `start_only`: kalender menampilkan satu event "Mulai · N pertemuan".
- Grant: `select` untuk `service_role` saja (sejalan dengan tabel billing); halaman admin membaca lewat `academyBillingClient()`.
- **Kenapa bukan tabel `batch_sessions`?** Volume kecil (≤ puluhan batch), validasi `valid_session_schedule()` sudah ada, dan editor CMS menulis jsonb. Normalisasi baru layak bila nanti perlu kehadiran per sesi (S4) — lihat §5.

### 2.3 View `registration_facts_v` (wajib, untuk Demografi & KPI)

Satu baris per (registrasi × batch), dengan field demografi bertipe:

```sql
create view public.registration_facts_v with (security_invoker = true) as
select r.id as registration_id, r.received_at, r.payment_method, r.offer_slug,
       i.batch_slug, b.program_slug,
       nullif(r.answers->>'gender','')                         as gender,
       case when (r.answers->>'age') ~ '^\d{1,3}$' then (r.answers->>'age')::int end as age,
       nullif(lower(btrim(r.answers->>'domicile')),'')          as domicile_raw,
       r.answers->>'domicileCity'                               as domicile_city,      -- §2.5
       r.answers->>'professionCategory'                         as profession_category, -- §2.5
       nullif(r.answers->>'source','')                          as source,
       (r.answers->>'priorExperience')                          as prior_experience,
       inv.status_summary                                       -- 'settled' | 'partial' | 'pending' | 'void'
from public.academy_registrations r
join public.academy_registration_items i on i.registration_id = r.id
join public.batches b on b.slug = i.batch_slug
cross join lateral (
  select case
    when bool_or(v.status in ('rejected','cancelled')) then 'void'
    when count(*) > 0 and bool_and(v.status = 'verified') then 'settled'
    when bool_or(v.status = 'verified') then 'partial'
    else 'pending' end as status_summary
  from public.academy_invoices v where v.registration_id = r.id
) inv;
```

Status turunan menyamai `isActive`/`isSettled` di `admin-dashboard.ts` sehingga angka lama tidak berubah.

### 2.4 RPC agregasi `admin_dashboard_stats(...)` (wajib, menutup A1/A2)

```
admin_dashboard_stats(period_start timestamptz, period_end timestamptz,
                      prev_start timestamptz,
                      program_filter text default null, batch_filter text default null) returns jsonb
```

Mengembalikan blok `kpi`, `trend`, `topBatches`, `composition` (semua grup sudah dihitung `count`), memakai view §2.3. `security invoker`, `execute` hanya `service_role`. Batas WIB dihitung di TS (fungsi `periodRange`/`trendStarts` yang sudah teruji) dan dikirim sebagai parameter — logika tanggal tetap satu tempat.

### 2.5 Perubahan formulir pendaftaran (disarankan, mumpung 0 data)

Tetap di `answers` jsonb (konvensi proyek; tidak menambah kolom tabel):

| Field baru | Tipe UI | Nilai | Menggantikan |
| --- | --- | --- | --- |
| `domicileCity` | combobox kota/kabupaten (daftar statis di `lib/`) + "Lainnya" | nama kab/kota baku, mis. `Kota Bandung` | agregasi dari `domicile` teks bebas (teks bebas tetap disimpan untuk alamat detail) |
| `professionCategory` | radio | `pelajar_mahasiswa`, `karyawan_swasta`, `asn_bumn`, `wirausaha`, `pengajar`, `profesional_mandiri`, `lainnya` | agregasi dari `profession` teks bebas (tetap disimpan) |

Validasi di `registration-form.ts` + `academy-registration-input` + uji `registration-form.test.mjs`. RPC `receive_academy_registration` tidak perlu diubah (menyimpan `answers` apa adanya) — verifikasi saat implementasi.

### 2.6 Kapasitas batch (opsional — butuh keputusan)

```sql
alter table public.batches add column capacity int check (capacity is null or capacity > 0);
```

`NULL` = tanpa batas (perilaku sekarang). Membuka KPI *fill rate* dan peringatan "batch hampir penuh / sepi menjelang mulai". Ditampilkan di editor batch (`ProgramBatchBoard`). **Tidak** menolak pendaftaran saat penuh pada fase ini — hanya informasi (penolakan otomatis = perubahan RPC terpisah).

### 2.7 Kebersihan (opsional)

- `created_at timestamptz default now()` pada `batches`.
- Hapus fallback `program.format` (S7).
- Hapus `components/admin/dashboard/**` (A5) — dengan persetujuan.

---

## 3. Blueprint Dashboard

### 3.1 Pertanyaan yang harus dijawab dashboard (urut prioritas)

1. **Apa yang perlu saya kerjakan hari ini?** (tagihan menunggu, pelunasan jatuh tempo, batch mulai minggu ini)
2. **Bagaimana pendaftaran & uang masuk dibanding periode lalu?**
3. **Batch mana yang ramai / sepi, dan seberapa lunas?**
4. **Siapa peserta kita?** (demografi, sumber informasi)
5. **Apa jadwal ke depan?** (kalender)

### 3.2 KPI utama

| KPI | Definisi | Sumber | Pembanding |
| --- | --- | --- | --- |
| Pendaftar | registrasi aktif (`status_summary <> 'void'`) dengan `received_at` di periode | view §2.3 (distinct `registration_id`) | periode sebelumnya, Δ absolut |
| Pendapatan terverifikasi | Σ `received_idr` (fallback `total_idr`) invoice `verified` dengan `reviewed_at` di periode | `academy_invoices` | Δ % |
| Tagihan menunggu | jumlah & Σ invoice `pending` (semua waktu) + umur tertua (hari) | `academy_invoices` | — (aksi) |
| Piutang pelunasan | Σ invoice `stage='remaining'` berstatus `pending` | `academy_invoices` | — |
| Tingkat pelunasan | % registrasi periode dengan `status_summary='settled'` | view §2.3 | Δ poin |
| Keterisian batch *(bila §2.6)* | peserta aktif ÷ `capacity` untuk batch buka | view + `batches` | — |

Catatan: "Pendapatan" memakai `received_idr` (diisi oleh `resolve_academy_invoice` sejak `20261118120000`), sehingga konsisten dengan uang yang benar-benar diterima.

### 3.3 Tata letak (desktop 12 kolom; mobile tumpuk berurutan)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard                          [Program ▾] [Batch ▾]   [30h|90h|Tahun ini]│  R0 header + filter
├──────────────────────────────────────────────────────────────────────────────┤
│ ⚑ Perlu tindakan: 3 tagihan menunggu (tertua 2 hari) · Batch X mulai 4 hari  │  R1 action strip
│   lagi, 6/20 kursi · 2 pelunasan belum dibayar                    [Buka →]    │  (sembunyi bila kosong)
├────────────┬────────────┬────────────┬────────────┬──────────────────────────┤
│ Pendaftar  │ Pendapatan │ Menunggu   │ Pelunasan  │ Keterisian (opsional)     │  R2 KPI cards
├────────────┴────────────┴────────────┴────────────┼──────────────────────────┤
│ Tren pendaftar & pendapatan (12 minggu / bulanan)  │ Agenda 14 hari           │  R3
│ (TrendChart yang ada + empty state)                │ (mini-kalender + list)   │
├────────────────────────────────────────────────────┴──────────────────────────┤
│ Kinerja batch: Batch · Program · Mulai · Pendaftar · DP · Lunas · Kursi · %   │  R4 tabel (ganti
│                                                                              │  "Batch teratas")
├───────────────────────────┬───────────────────────────┬──────────────────────┤
│ Gender                    │ Usia                      │ Sumber informasi      │  R5 Demografi
├───────────────────────────┼───────────────────────────┼──────────────────────┤  (terikat filter R0)
│ Domisili (top 8 + lain)   │ Profesi                   │ Pengalaman · Bayar    │
└───────────────────────────┴───────────────────────────┴──────────────────────┘
```

### 3.4 Spesifikasi widget

| ID | Widget | Visualisasi | Filter yang berlaku | Empty state |
| --- | --- | --- | --- | --- |
| W0 | Filter bar | `Select` Program → Batch (batch disaring program); periode tetap `PeriodSwitch`. Disimpan di URL (`?periode=&program=&batch=`). | — | — |
| W1 | Action strip | Daftar ≤ 3 baris dengan tautan ke `/admin/tagihan`, detail batch | tidak (selalu global) | disembunyikan |
| W2 | KPI cards | `StatCard` yang ada; Δ dengan warna netral/positif/negatif + teks, bukan warna saja | periode + program/batch | "—" + "Belum ada pembanding" |
| W3 | Tren | `TrendChart` (recharts) — bar pendaftar, garis pendapatan, sumbu kanan Rp | semua | ilustrasi teks "Belum ada pendaftar pada 12 minggu terakhir" (tanpa sumbu kosong) |
| W4 | Agenda 14 hari | daftar sesi dari `batch_sessions_v` (tanggal, jam WIB, program, batch, sesi ke-n) + tautan "Buka kalender" | program/batch | "Tidak ada sesi 14 hari ke depan" |
| W5 | Kinerja batch | tabel; progress bar keterisian bila ada `capacity`; urut tanggal mulai | periode tidak membatasi batch buka | "Belum ada batch" |
| W6 | Demografi | bar horizontal 100% per kategori (lebih mudah dibaca daripada pie); label `n = x` pada pill satu baris (perbaiki A4) | semua | `n < 5` → "Data belum cukup (perlu minimal 5 jawaban)" |

Implementasi chart wajib memuat skill `dataviz` lebih dulu (palet, mode gelap, aksesibilitas).

### 3.5 Halaman Kalender `/admin/kalender`

- **Navigasi:** item sidebar baru di grup "Pendaftaran" (atau di atasnya) — `lib/admin-nav.ts`.
- **Tampilan:** Bulan (grid, `react-day-picker` dengan custom day content) dan Agenda (list per minggu). Minggu/hari ditunda (YAGNI).
- **Event:** satu per baris `batch_sessions_v`; warna per program (4 program tetap → 4 warna tetap dari palet dataviz); label `Batch · Sesi n/N · 09.00–12.00`. Batch `start_only` → satu event "Mulai · N pertemuan".
- **Detail popover:** program, batch, jam WIB, status (`open`/`closed`/`done` dari `batchStatus()`), pendaftar aktif / lunas / kapasitas, tautan ke editor batch dan daftar pendaftar tersaring batch.
- **Filter:** program (multi), sembunyikan batch selesai.
- **Sinkronisasi:** tidak ada mekanisme sinkron; halaman dinamis (`force-dynamic`) membaca view. Edit jadwal di CMS → tampil di render berikutnya.
- **Opsional (Fase 5):** feed `.ics` read-only `/api/admin/calendar.ics?token=…` untuk Google Calendar admin. Butuh token rahasia di `system_settings`; tunda sampai diminta.

### 3.6 Demografi — dimensi & filter

| Dimensi | Sumber | Kelompok |
| --- | --- | --- |
| Gender | `answers.gender` | Perempuan, Laki-laki |
| Usia | `answers.age` | < 25, 25–34, 35–44, ≥ 45 (sama dengan `ageBucket`) |
| Domisili | `answers.domicileCity` (§2.5); data lama → `domicile_raw` | Top 8 + "Lainnya" |
| Profesi | `answers.professionCategory` (§2.5) | 7 kategori |
| Pengalaman | `answers.priorExperience` | Pernah / Belum |
| Sumber informasi | `answers.source` | Instagram, WhatsApp, Teman/Kerabat, Lainnya |
| Metode bayar | `payment_method` | Lunas, DP |

Filter: periode, program, batch, status pembayaran (semua / lunas saja). Ambang privasi `n ≥ 5` per kartu dipertahankan; tidak ada daftar nama di widget demografi. Opsional: tombol ekspor CSV memakai rute `api/admin/export/[module]` yang sudah ada.

---

## 4. Tahapan eksekusi

Setiap fase bisa di-*merge* sendiri. Urutan F0 → F1 wajib; F2, F3, F4 independen setelah F1.

### F0 — Fondasi database (½ hari)

| Langkah | Berkas | Verifikasi |
| --- | --- | --- |
| Migrasi index §2.1 | `supabase/migrations/2026111x_dashboard_indexes.sql` | `pg_indexes` memuat 6 index baru |
| View `batch_sessions_v` §2.2 + grant | `…_batch_sessions_view.sql` | `select * from batch_sessions_v` = jumlah sesi di 3 batch live; jam WIB benar (bandingkan `fromStoredSessions`) |
| View `registration_facts_v` §2.3 + grant | `…_registration_facts_view.sql` | seed 3 registrasi uji (tunggal, bundling, DP) di branch → status `settled/partial/pending` sesuai |
| (Bila disetujui) `batches.capacity` §2.6 | `…_batch_capacity.sql` | kolom nullable; editor batch tetap tersimpan |
| Pastikan `anon`/`authenticated` tidak bisa `select` view | — | uji via kunci anon → 401/permission denied |

### F1 — Agregasi di SQL + filter (1 hari)

| Langkah | Berkas | Verifikasi |
| --- | --- | --- |
| RPC `admin_dashboard_stats` §2.4 | migrasi baru | `select admin_dashboard_stats(...)` pada data seed = output `buildDashboardStats` untuk input sama |
| Ganti 5 query + `limit(1000)` di `page.tsx` dengan satu `rpc()`; hapus komentar `shortcut:` | `app/(admin)/admin/page.tsx` | halaman memuat; angka sama dengan sebelum perubahan pada seed |
| Sederhanakan `admin-dashboard.ts` menjadi helper periode/WIB + pemetaan hasil RPC; uji `node --test` yang ada disesuaikan | `lib/server/admin-dashboard.ts`, `*.test.mjs` | `npm test` hijau |
| Parsing `?program=&batch=` (whitelist dari daftar slug) | `page.tsx` | slug tak dikenal → diabaikan, bukan error |

### F2 — Redesain widget dashboard (1–1½ hari)

| Langkah | Berkas | Verifikasi |
| --- | --- | --- |
| Muat skill `dataviz`; filter bar W0 | `components/admin/stats/DashboardFilters.tsx` | URL berubah, data terfilter |
| Action strip W1 | `components/admin/stats/ActionStrip.tsx` | muncul hanya bila ada item |
| KPI W2 (tambah Piutang, Keterisian) | `DashboardView.tsx` | — |
| Empty state tren W3 | `TrendChart.tsx` | 0 data → teks, bukan sumbu kosong |
| Tabel kinerja batch W5 (gantikan "Batch teratas") | `BatchPerformanceTable.tsx` | bundling dihitung di kedua batch |
| Perbaiki A4 (pill `n =` satu baris, elemen terpotong kanan) | `DashboardView.tsx` | screenshot 1920 px & 375 px, terang & gelap |

### F3 — Kalender (1½ hari)

| Langkah | Berkas | Verifikasi |
| --- | --- | --- |
| Loader server `lib/server/admin-calendar.ts` (rentang bulan → `batch_sessions_v` + hitungan pendaftar) + uji `node --test` untuk batas bulan WIB dan `start_only` | baru | uji hijau |
| Halaman `app/(admin)/admin/kalender/page.tsx` + `loading.tsx` | baru | sesi 3 batch live tampil di tanggal/jam benar |
| Komponen `AdminCalendar` (Bulan/Agenda, popover) | `components/admin/calendar/*` | navigasi bulan, keyboard, mobile |
| Widget agenda W4 di dashboard (pakai loader yang sama) | `DashboardView.tsx` | — |
| Item sidebar | `lib/admin-nav.ts` | tautan aktif |
| Uji sinkron: ubah jadwal batch di CMS → muat ulang kalender | — | jadwal baru tampil tanpa langkah lain |

### F4 — Demografi (1–1½ hari)

| Langkah | Berkas | Verifikasi |
| --- | --- | --- |
| (Bila disetujui) field `domicileCity`, `professionCategory` §2.5 + daftar kab/kota statis | `lib/registration-form.ts`, komponen formulir, `lib/indonesia-cities.ts`, uji formulir | `registration-form.test.mjs` hijau; kiriman tersimpan di `answers` |
| Komposisi domisili & profesi di RPC | migrasi RPC | — |
| Kartu W6 + filter status bayar | `components/admin/stats/Demographics*.tsx` | n < 5 → pesan; n ≥ 5 → bar % benar |
| Ekspor CSV (opsional) | `api/admin/export/[module]` | — |

### F5 — Penutupan (½ hari)

- Perbarui `docs/albana-docs/data/database-schema.md` (index, view, RPC, `capacity`).
- `npm run lint`, `npm test`, `tsc --noEmit`, build.
- Verifikasi visual di browser pane: dashboard (kosong & berisi seed), kalender, mobile, mode gelap.
- `get_advisors` Supabase (security & performance) setelah migrasi.
- Opsional: feed `.ics`, hapus `components/admin/dashboard/**`, hapus kolom warisan `batches` (S6).

**Estimasi total:** ±6–7 hari kerja.

---

## 5. Keputusan yang dibutuhkan sebelum eksekusi

1. **Kapasitas batch (§2.6)** — tambahkan `batches.capacity`? Tanpa ini KPI keterisian & peringatan "batch sepi" tidak ada.
2. **Field formulir baru (§2.5)** — tambahkan pilihan kota/kabupaten dan kategori profesi? Tanpa ini domisili/profesi tidak bisa divisualisasikan dengan andal.
3. **Kehadiran per sesi (S4)** — di luar cakupan rencana ini. Bila nanti dibutuhkan, `batch_sessions_v` diganti tabel `batch_sessions` + `session_attendance`; rencana ini tidak menghalanginya.
4. **Trainer di kalender** — relasi batch–trainer sengaja dihapus. Tampilkan trainer di kalender hanya bila relasinya dihidupkan kembali.
5. **Feed `.ics`** — perlu atau cukup halaman kalender admin?

## 6. Risiko

| Risiko | Mitigasi |
| --- | --- |
| Konversi zona waktu jsonb naif → `timestamptz` berbeda dengan `wibMs()` di TS | Uji F0 membandingkan view dengan `fromStoredSessions` untuk 3 batch live |
| RPC menggeser angka dashboard | Uji kesetaraan F1 dengan `buildDashboardStats` pada seed yang sama sebelum menghapus kode lama |
| View terbuka ke `anon` lewat PostgREST | `security_invoker` + revoke eksplisit + uji kunci anon |
| Demografi menjadi data pribadi teridentifikasi pada batch kecil | Ambang `n ≥ 5` per kartu; tanpa daftar nama |
