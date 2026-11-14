import { academyRequest } from "./academy-api";
import { parseRegistration } from "../registration-input";

export async function receiveRegistration(data: unknown) {
  const submission = parseRegistration(data);
  if (!submission) return { status: 422, message: "Periksa data formulir dan persetujuan." };
  const token = process.env.REGISTRATION_INTAKE_KEY;
  if (!token) throw new Error("Pendaftaran belum dikonfigurasi.");
  const result = await academyRequest("rpc/receive_registration", { ...submission, token });
  switch (result) {
    case "received": return { status: 200, message: "Formulir diterima. Admin akan menindaklanjuti pendaftaran." };
    case "changed": return { status: 409, message: "Biaya atau formulir berubah. Periksa kembali detail batch." };
    case "unavailable": return { status: 409, message: "Batch tidak menerima pendaftaran." };
    case "busy": return { status: 429, message: "Terlalu banyak pendaftaran. Coba lagi dalam satu menit." };
    default: throw new Error("Respons pendaftaran tidak valid.");
  }
}
