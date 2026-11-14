export type RegistrationBanner = { message: string; showProgramLink?: boolean };

export function registrationFailure(status: number, message?: string): RegistrationBanner {
  if (status === 409) {
    return { message: message ?? "Batch atau biaya berubah. Periksa kembali detail program.", showProgramLink: true };
  }
  if (status === 422) return { message: "Isian belum diterima. Periksa kembali data dan persetujuanmu." };
  if (status === 429) return { message: message ?? "Terlalu banyak pendaftaran. Coba lagi dalam satu menit." };
  if (status === 413) return { message: "Isian terlalu panjang. Ringkas jawaban sebelum mengirim lagi." };
  if (status === 415 || status === 400) return { message: "Format kiriman tidak valid. Muat ulang halaman lalu coba lagi." };
  return { message: message ?? "Pendaftaran belum bisa diproses. Coba lagi." };
}
