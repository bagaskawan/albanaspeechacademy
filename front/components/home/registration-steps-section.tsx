import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { SectionIntro } from "./section-intro";
import { Accent } from "./ui/accent";

const steps = [
  ["Isi formulir", "Pilih program, isi data diri, lalu pilih bayar lunas atau DP."],
  ["Transfer sesuai tagihan", "Halaman konfirmasi menampilkan nominal persis, termasuk kode unik, dan rekening tujuan."],
  ["Kirim bukti lewat WhatsApp", "Admin memverifikasi pembayaranmu, lalu mengundangmu ke grup kelas."],
] as const;

export async function RegistrationStepsSection() {
  let whatsapp: string | undefined;
  try {
    const channel = (await readPublishedContacts()).find((item) => item.kind === "whatsapp");
    whatsapp = channel ? contactHref(channel) : undefined;
  } catch { /* Consultation link is optional. */ }

  return (
    <section id="daftar" className="tone-canvas home-section" aria-labelledby="daftar-title">
      <div className="home-container home-stack-head">
        <SectionIntro
          eyebrow="10 · Cara daftar"
          titleId="daftar-title"
          title={
            <>
              Tiga langkah, <Accent>lalu kita berlatih.</Accent>
            </>
          }
          description="Tidak ada proses berbelit. Kamu daftar, transfer sesuai tagihan, lalu kami sambut di grup kelas."
        />

        <ol className="grid border-t border-[var(--tone-ink)] lg:grid-cols-3">
          {steps.map(([title, description], index) => (
            <li
              key={title}
              data-motion="slide"
              className="flex flex-col gap-4 border-b border-[var(--tone-rule)] py-8 lg:border-b-0 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <span aria-hidden="true" className="type-mega italic text-[var(--tone-accent)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="type-title">{title}</h3>
              <p className="type-body text-[var(--tone-muted)] text-pretty">{description}</p>
            </li>
          ))}
        </ol>

        <p className="type-small text-[var(--tone-muted)]">
          Berhalangan hadir? Ajukan penjadwalan ulang lewat admin. Pembayaran tidak dikembalikan.
        </p>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex flex-col items-start justify-between gap-8 rounded-xs bg-[var(--tone-tile)] p-6 sm:p-8">
            <div>
              <p className="type-label text-[var(--tone-muted)]">Untuk individu</p>
              <h3 className="type-display mt-3">Public Training</h3>
              <p className="type-body mt-3 text-[var(--tone-muted)]">Ikut kelas terjadwal bersama peserta lain.</p>
            </div>
            <a className="button-primary" href="#jadwal">Lihat jadwal</a>
          </div>

          <div className="tone-night flex flex-col items-start justify-between gap-8 rounded-xs p-6 sm:p-8">
            <div>
              <p className="type-label text-[var(--tone-muted)]">Untuk organisasi</p>
              <h3 className="type-display mt-3">Inhouse Training</h3>
              <p className="type-body mt-3 text-[var(--tone-muted)]">Pelatihan untuk timmu, di tempatmu, dengan materi yang disesuaikan.</p>
            </div>
            {whatsapp ? (
              <a
                className="type-small inline-flex min-h-11 items-center rounded-xs bg-white px-6 py-3 font-display font-semibold text-[var(--color-accent-strong)] transition-colors hover:bg-white/90"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasi via WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
