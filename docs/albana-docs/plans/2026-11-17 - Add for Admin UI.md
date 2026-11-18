Refactor pola UI CRUD & layout halaman admin dengan spesifikasi berikut:

1. Global CRUD Modal Pattern:
- Ubah semua operasi CRUD menjadi **Modal** (kecuali halaman Artikel).
- Terapkan ukuran modal dinamis: proporsional dengan jumlah field (ramping untuk form sedikit, lebar untuk form kompleks).

2. Form & Input Standardization:
- **Data Partner:** Pindahkan form input ke modal, hapus field "Urutan", dan samakan komponen upload logo dengan pola *add image* di halaman Trainer.
- **Date & Time:** Gunakan komponen Date & Time picker standar dari **shadcn/ui** di seluruh form terkait.
- **Price Input**: Gunakan format price, "Rp." diawal dan tiga digit
- **Phone Number**: Format 4 digit dash "-", diawali angka "0", dibatasi 13-14 digit
 
3. Layout Halaman Trainer:
- Ubah tampilan list data menjadi **Grid Gallery** (card berisi foto trainer dengan tombol action icon `Eye` untuk detail dan `Pencil` untuk edit di bagian bawah gambar).