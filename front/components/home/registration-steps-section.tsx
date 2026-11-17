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
  return <section id="daftar" className="section tone-canvas" aria-labelledby="daftar-title"><Container className="max-w-7xl">
    <SectionIntro eyebrow="[ CARA DAFTAR ]" title={<>Tiga langkah, <em className="accent-serif">lalu kita berlatih</em></>} titleId="daftar-title" />
    <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-0">{steps.map(([title, description], index) => <li key={title} data-motion="slide" className="border-t border-[var(--tone-rule)] py-5 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
      <span className="font-display text-5xl font-semibold tabular-nums text-[var(--tone-accent)]">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 leading-relaxed text-[var(--tone-muted)]">{description}</p>
    </li>)}</ol>
    <p className="mt-5 text-sm text-[var(--tone-muted)]">Berhalangan hadir? Ajukan penjadwalan ulang lewat admin. Pembayaran tidak dikembalikan.</p>
    <div className="mt-12 grid gap-4 md:grid-cols-2">
      <div data-motion="slide" className="rounded-card bg-[var(--tone-tile)] p-6 md:p-8"><h3 className="text-xl font-semibold">Public Training</h3><p className="mt-3 text-[var(--tone-muted)]">Ikut kelas terjadwal bersama peserta lain.</p><a className="button-primary mt-6" href="#jadwal">Lihat jadwal</a></div>
      <div data-motion="slide" className="rounded-card bg-[var(--tone-tile)] p-6 md:p-8"><h3 className="text-xl font-semibold">Inhouse Training</h3><p className="mt-3 text-[var(--tone-muted)]">Pelatihan untuk timmu, di tempatmu, dengan materi yang disesuaikan.</p>{whatsapp ? <a className="mt-6 inline-flex min-h-11 items-center border border-[var(--tone-rule)] bg-transparent px-6 py-2.5 font-display text-sm font-semibold text-[var(--tone-ink)]" href={whatsapp} target="_blank" rel="noopener noreferrer">Konsultasi via WhatsApp</a> : null}</div>
    </div>
  </Container></section>;
}
