import { Container } from "@/components/layout/container";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { SectionIntro } from "./section-intro";

const steps = [
  ["Isi formulir", "Pilih program, isi data diri, lalu pilih bayar lunas atau DP."],
  ["Transfer sesuai tagihan", "Halaman konfirmasi menampilkan nominal persis, termasuk kode unik, dan rekening tujuan."],
  ["Kirim bukti lewat WhatsApp", "Admin memverifikasi pembayaranmu, lalu mengundangmu ke grup kelas."],
] as const;

export async function RegistrationStepsSection() {
  let whatsapp: string | undefined;
  try { const channel = (await readPublishedContacts()).find((item) => item.kind === "whatsapp"); whatsapp = channel ? contactHref(channel) : undefined; } catch { /* Consultation link is optional. */ }
  return <section id="daftar" className="section" aria-labelledby="daftar-title"><Container className="max-w-7xl">
    <SectionIntro eyebrow="[ CARA DAFTAR ]" title={<>Tiga langkah, <mark className="bg-highlight text-ink">lalu kita berlatih</mark></>} titleId="daftar-title" />
    <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-0">{steps.map(([title, description], index) => <li key={title} data-motion="slide" className="border-t border-rule py-5 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
      <span className="font-display text-5xl font-semibold tabular-nums text-accent">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 leading-relaxed text-muted">{description}</p>
    </li>)}</ol>
    <p className="mt-5 text-sm text-muted">Berhalangan hadir? Ajukan penjadwalan ulang lewat admin. Pembayaran tidak dikembalikan.</p>
    <div className="mt-12 grid gap-4 md:grid-cols-2">
      <div data-motion="slide" className="rounded-card bg-panel-soft p-6 md:p-8"><h3 className="text-xl font-semibold">Public Training</h3><p className="mt-3 text-muted">Ikut kelas terjadwal bersama peserta lain.</p><a className="button-secondary mt-6" href="#jadwal">Lihat jadwal</a></div>
      <div data-motion="slide" className="rounded-card bg-panel-soft p-6 md:p-8"><h3 className="text-xl font-semibold">Inhouse Training</h3><p className="mt-3 text-muted">Pelatihan untuk timmu, di tempatmu, dengan materi yang disesuaikan.</p>{whatsapp ? <a className="button-secondary mt-6" href={whatsapp} target="_blank" rel="noopener noreferrer">Konsultasi via WhatsApp</a> : null}</div>
    </div>
  </Container></section>;
}
