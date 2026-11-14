# Langkah 2 — Form pendaftaran per batch

## Hasil yang dituju dan kondisi saat ini

Calon peserta memilih program dan batch yang menerima pendaftaran, membaca jadwal, tempat, serta biaya, lalu mengisi formulir empat langkah di situs. Respons sukses berarti **formulir diterima**, bukan kepesertaan sudah dikonfirmasi. Admin mengirim instruksi pembayaran dan memverifikasinya secara manual.

Rute yang digunakan adalah `/register/<slug-program>`; server memilih batch program yang menerima pendaftaran dengan sesi pertama paling awal. `/register` mengarahkan pengunjung ke `/register/public-speaking-for-speakers`. Komponen form, validator klien, `POST /api/registrations`, serta penyimpanan melalui RPC sudah ada. Tahap ini mengaudit isi **[Series (01)](../form%20register/01_pelatihan_public_speaking_series_registration_registration/registration-contract.md)** dan merapikan alur serta tampilannya. Varian [Eksklusif (02)](../form%20register/02_Pelatihan_Basic_to_Advance_Eksklusif.md) dan [BNSP (03)](../form%20register/03_Sertifikasi_Professional_Speakers_by_BNSP.md) tetap memakai komponen bersama, tetapi audit isi masing-masing menyusul.

## Prasyarat dan sumber keputusan

- Data program dan batch harus terbit, memiliki sesi, tempat, harga, `form_kind`, serta `accepting_registrations` benar. Backend mengunci dan memeriksa ulang batch saat menerima kiriman. Batch berkuota tetap belum dibuka sampai aturan penahanan kursi ditetapkan.
- Dokumen 01 adalah sumber **pertanyaan**, bukan bukti bahwa harga Batch 9, rekening, tenggat, atau tanggal di dalamnya masih berlaku. Nilai publik berasal dari batch terbit. Instansi diperlakukan opsional karena sumber menyebut “jika ada”, meski juga memberi tanda bintang.
- Pembayaran tetap lewat admin: formulir hanya menanyakan metode `full` atau `dp` jika DP dikonfigurasi pada batch. Tidak ada nomor rekening atau unggah bukti di form. Setelah membayar, peserta mengirim bukti ke [WhatsApp resmi](../../web/lib/academy-contact.ts). Jangan menayangkan harga, DP, atau fasilitas contoh dari rute pratinjau sebagai data nyata.
- Ikuti [brief](../../project/project-brief.md), [desain](../design.md), [konten](../home-content.md), [arsitektur](../tech.md), dan [model data](../database.md). Kontrak penerimaan saat ini memakai [validator server](../../web/lib/registration-input.ts), [route](../../web/app/api/registrations/route.ts), dan [RPC](../../web/db/registration-intake.sql); jangan menyimpulkan bahwa Prisma/MySQL sudah terpasang dari dokumen rancangan lama.

## Alur dan rancangan layar

1. Pada semua keadaan, halaman memakai satu panel terpusat: logo ASA menuju beranda, nama halaman yang tersedia bagi pembaca layar, lalu isi sesuai keadaan. Judul pengantar dan tautan kembali di bagian atas tidak ditampilkan. Panel bersudut persegi, tanpa header/footer situs, bayangan, atau pengalih tema. Gunakan Inter/Montserrat, token CSS ASA, label uppercase, input bergaris bawah, dan satu aksi utama.
2. Untuk batch siap, tampilkan ringkasan singkat **sebelum field pertama**: program dan batch, jadwal WIB, tempat, biaya final, serta rincian biaya bila ada. Tidak ada layar pembuka yang memerlukan klik Lanjut.
3. Form memiliki empat langkah dengan judul, “Langkah n dari 4”, dan bilah progres yang punya nama serta nilai aksesibel: **Data diri**, **Latar belakang dan motivasi**, **Informasi teknis**, **Pembayaran dan persetujuan**. Lanjut memvalidasi langkah aktif; Kembali mempertahankan semua isian. Enter pada langkah 1–3 berlaku seperti Lanjut, bukan mengirim ke server.
4. Saat ada error, tampilkan pesan di dekat field dan ringkasan di atas isian, lalu fokus ke field pertama yang salah. Pada langkah akhir, validasi seluruh isian dan kembali ke langkah paling awal yang bermasalah. Setelah kirim, tahan kiriman ganda, tampilkan “Mengirim…”, lalu tanda terima atau pesan pemulihan tanpa menghapus isian.
5. Ponsel memakai satu kolom, termasuk pilihan media sosial; dua kolom hanya bila lebar cukup. Kontrol dan tautan minimal 44 px, fokus terlihat, teks/garis kontrol cukup kontras, urutan baca sama dengan urutan fokus. Uji 1440, 834, 390, 320 CSS px, teks 200%, dan reflow pada zoom 400% dari 1280 px.

## Peta pertanyaan Series (01)

| Bagian dan nomor sumber | Field UI / payload | Wajib dan perilaku |
| --- | --- | --- |
| A1–A2 nama lengkap, panggilan | `fullName`, `answers.nickname` | Wajib; masing-masing ≤160 karakter. |
| A3 domisili | `answers.domicile` | Wajib; ≤500 karakter. |
| A4 WhatsApp, A5 email | `whatsapp`, `email` | Wajib; WhatsApp disimpan sebagai teks, dibersihkan dari petik awal/spasi/tanda hubung, lalu harus 8–15 digit dengan opsional `+`. Email ≤254 karakter. Peserta tidak perlu mengetik petik satu dari petunjuk spreadsheet lama. |
| A6 jenis kelamin, A7 usia | `answers.gender`, `answers.age` | Wajib; pilihan sumber Perempuan/Laki-laki, usia bilangan bulat 1–150. |
| A8 profesi, A9 instansi | `answers.profession`, `answers.institution` | Profesi wajib; instansi opsional. Masing-masing ≤500 karakter. |
| A10–A11 media sosial dan nama akun | `answers.socials`, `answers.socialOther`, `answers.socialName` | Pilihan media sosial dan nama akun opsional. Memilih “Lainnya” mewajibkan keterangan; isian teks ≤500 karakter. |
| B12 pengalaman, B13 tujuan, B14 tantangan | `answers.priorExperience`, `answers.goal`, `answers.challenge` | Wajib; Ya/Tidak menjadi boolean, jawaban panjang masing-masing ≤2000 karakter. |
| C15 sumber informasi, C16 kesiapan | `answers.source`, `answers.sourceOther`, `answers.attendance` | Wajib; “Lainnya” perlu keterangan ≤500 karakter. Kesiapan mengikuti empat pertemuan menerima Ya atau Mungkin sesuai sumber. |
| D17–D20 investasi dan bukti | `priceIdr`, `paymentMethod`, `dpPercent` | Biaya dan DP berasal dari batch aktif; DP hanya muncul bila tersedia. Rekening dan unggah bukti dari formulir lama tidak ditayangkan. |
| Persetujuan data | `consent: true` | Persetujuan eksplisit sebelum kirim; jelaskan data dipakai untuk tindak lanjut pendaftaran. |

Payload juga membawa `batch` dan `formKind` dari batch server. Kirim JSON maksimal 32 KiB. Validasi klien melengkapi validasi server; status dan biaya selalu diperiksa lagi oleh backend.

## Keadaan dan pemulihan

| Keadaan / respons | Yang tampil dan tindakan peserta |
| --- | --- |
| Memuat, program tidak dikenal, tak ada batch, katalog gagal | Tampilkan pesan di panel yang sama; sediakan tautan ke program atau Coba lagi bila gagal. Form hanya tampil untuk batch siap. |
| 200 | Ganti form dengan tanda terima, langkah pembayaran manual, tautan WhatsApp resmi, dan penjelasan bahwa admin belum mengonfirmasi kepesertaan. |
| 409 batch ditutup atau biaya/form berubah | Pertahankan isian, hentikan kirim ulang dengan data lama, dan arahkan ke pilihan program terbaru. |
| 422 data ditolak | Pertahankan isian; tampilkan ringkasan dan error field yang diketahui validator klien. Server saat ini mengirim pesan agregat. |
| 429 terlalu banyak kiriman | Pertahankan isian; beri petunjuk coba lagi dalam satu menit. |
| 400/413/415 format atau ukuran salah | Pertahankan isian; jelaskan format atau panjang isian dan langkah pemulihan. |
| 503 atau gangguan jaringan | Pertahankan isian dan sediakan percobaan ulang. |

## Urutan kerja dan kriteria selesai

1. Cocokkan field Series dengan tabel di atas; selaraskan batas panjang klien dan server tanpa mengubah kontrak API. Perbarui uji aturan form untuk field wajib, “Lainnya”, DP, batas panjang, kepemilikan field per langkah, dan payload ketiga varian.
2. Ubah halaman menjadi panel tunggal dan wizard empat langkah dengan progres; pertahankan rute dan state yang sudah ada. Perbaiki tautan dari kartu serta detail program agar membawa slug program.
3. Jalankan uji unit, `npm run lint`, `npx --no-install tsc --noEmit`, dan `npm run build`. Periksa diff untuk perubahan di luar tugas.
4. Uji lewat kartu, `/register`, dan URL langsung. Latih semua langkah dengan keyboard, Enter, Kembali, error, respons 200/409/422/429/503, klik ganda, serta perubahan batch/harga saat form terbuka. Pastikan tidak ada data hilang setelah kegagalan yang dapat dipulihkan.
5. Bandingkan render dengan referensi gambar pada lebar dan zoom di atas. Uji kontras teks minimal 4,5:1 dan batas kontrol/fokus minimal 3:1. Jalankan [uji transaksi rollback](../../web/db/verify-registration.sql) hanya di lingkungan dev yang memang memiliki database.

## Keputusan yang masih terbuka

Sebelum batch nyata diaktifkan, pemilik perlu mengesahkan pemetaan varian, total biaya, jam mulai 08.00 atau 08.30 WIB, DP 20% dan ketentuan pelunasannya, tenggat transfer, serta waktu masuk grup (H-2 pada formulir lama). Audit isi Eksklusif (02) dan BNSP (03) menjadi tahap terpisah; jangan menerbitkan harga atau janji sertifikasi dari dokumen sumber tanpa persetujuan.
