# Dokumen Spesifikasi Revisi & Pengembangan Website

**Tanggal Catatan:** 11 November 2026  
**Target Selesai (Deploy):** Selasa, 17 November 2026 (Pagi)  
**Target Uji Coba (QA):** Senin, 16 November 2026 (Seluruh fitur & dokumentasi selesai)

---

## I. Kebutuhan Tampilan & Alur Pengunjung (Frontend)

### 1. Tema Tampilan (Theme Mode)
* Menyediakan fitur pengubah tema secara dinamis antara **Dark Mode** dan **Light Mode**.

### 2. Hero Section
* Menampilkan **Logo** sebagai elemen utama *personal branding* klien.
* Tata letak dibuat *UI/UX friendly* dengan proporsi yang seimbang (dilengkapi *tagline* singkat dan tombol ajakan/CTA utama).

### 3. Urutan Tata Letak Halaman (User Journey)
Alur halaman dimulai dari **Pengenalan Program** terlebih dahulu, lalu disusun secara berurutan berdasarkan prioritas informasi yang dicari pengunjung:

| Prioritas | Fokus Informasi | Pertanyaan Pengunjung |
| :---: | :--- | :--- |
| **1** | Manfaat Training | *"Apakah saya bisa lebih percaya diri berbicara?"* |
| **2** | Program Training | *"Materinya apa saja dan cocok untuk siapa?"* |
| **3** | Kredibilitas Lembaga | *"Apakah lembaga ini terpercaya?"* |
| **4** | Testimoni & Hasil | *"Apakah peserta sebelumnya benar-benar berkembang?"* |
| **5** | Trainer / Mentor | *"Siapa yang akan mengajari saya?"* |
| **6** | Harga & Jadwal | *"Berapa biayanya dan kapan kelas dimulai?"* |
| **7** | Cara Pendaftaran | *"Bagaimana cara ikut kelasnya?"* |

### 4. Struktur Halaman Program
Setiap program wajib memuat tiga komponen utama: **Detail Program**, **Foto Acara/Batch**, dan **Video Promosi/Testimoni** yang meyakinkan.

* **Public Training** *(Alur berbasis formulir pendaftaran)*:
  * **Series**
  * **Speaker** *(menyediakan opsi bundling dengan program Sertifikasi)*
  * **Sertifikasi** *(menyediakan opsi bundling dengan program Speaker)*
* **Inhouse Training** *(Alur bersifat private call / konsultasi langsung untuk klien swasta & korporat)*:
  * Menampilkan **Dokumentasi Kegiatan** dan daftar **Our Partner**.

### 5. Alur Pendaftaran & Konfirmasi Pembayaran (Public Training)
1. Pengunjung mengisi formulir pendaftaran langsung di website hingga selesai.
2. Setelah data berhasil disimpan ke sistem, pengunjung diarahkan ke halaman **Konfirmasi Pendaftaran & Pembayaran Manual** dengan tata letak dua kolom:
   * **Kolom Kiri:**
     * Notifikasi status pendaftaran berhasil diproses.
     * Rincian tagihan: Nama Program/Bundling, Subtotal, **Kode Unik**, dan **Total Transfer**.
     * Panduan 3 langkah pembayaran manual.
     * Tombol CTA **"Kirim Bukti Transfer ke WhatsApp"** yang mengarah ke WhatsApp Admin.
   * **Kolom Kanan:**
     * Menampilkan **Detail Akun Rekening Bank** (Logo/Nama Bank, Nomor Rekening lengkap dengan tombol salin/*copy*, dan Nama Pemilik Rekening) sebagai pengganti QRIS.

---

## II. Kebutuhan Sistem & Backend

### 1. Manajemen & Kompresi Media
* Menambahkan modul pengelolaan data **gambar dan video** di panel *backend*.
* **Validasi Batas Minimal (*Minimum Upload*):** Menerapkan syarat ukuran/resolusi minimal pada antarmuka unggah agar file sumber yang masuk tetap memenuhi standar kualitas tinggi (HD).
* **Kompresi Otomatis:** Sistem *backend* melakukan kompresi ukuran file gambar dan video secara otomatis saat proses unggah untuk menghemat kapasitas penyimpanan (*storage*) tanpa mengurangi ketajaman visual.

### 2. Restrukturisasi Database & Panel Admin
* Merancang ulang antarmuka (*UI*) dan alur penggunaan *backend* agar lebih rapi, intuitif, dan mudah dikelola.
* **Pemisahan Entitas:** Data **Trainer** dan **Batch** dibuat berdiri sendiri (*independen* dan dinamis) serta tidak saling dikaitkan/direlasikan terlebih dahulu.

---

## III. Evaluasi Teknis & Timeline Pengerjaan

### 1. Pembersihan Struktur Proyek
* Menghapus seluruh kode, file, dan folder sisa dari proyek *Panggung Kreator* yang tidak relevan.
* Menyusun ulang direktori proyek agar spesifik untuk website ini, dengan tetap mempertahankan komponen *UI* dasar yang relevan agar gaya desain selaras dengan referensi `panggungkreator.web.id` (minimalis, simpel, dan rapi).

### 2. Jadwal Target (Deadline)
* **Senin, 16 November 2026:** Seluruh pengembangan *frontend*, *backend*, pengisian konten dokumentasi, serta uji coba penuh (*QA*) selesai.
* **Selasa, 17 November 2026 (Pagi):** Website *full* revisi telah di-*deploy* dan siap digunakan oleh klien.