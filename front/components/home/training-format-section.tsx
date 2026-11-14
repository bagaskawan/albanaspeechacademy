import { Container } from "@/components/layout/container";
import { SectionIntro } from "./section-intro";

const trainingFormats = [
  {
    title: "Public training",
    description: "Pelatihan dengan jadwal dan lokasi sesuai penawaran yang diterbitkan.",
    action: { href: "/#program", label: "Lihat program" },
  },
  {
    title: "In-house training",
    description:
      "Pelatihan untuk organisasi; materi, silabus, tanggal, dan waktu disesuaikan dengan kebutuhan perusahaan.",
    action: { href: "#kontak", label: "Hubungi kami" },
  },
] as const;

export function TrainingFormatSection() {
  return (
    <section
      id="format"
      className="section"
      aria-labelledby="format-title"
    >
      <Container className="max-w-5xl">
        <SectionIntro
          className="max-w-[42rem]"
          description="Ikuti kelas terjadwal sebagai individu, atau diskusikan pelatihan yang disesuaikan untuk kebutuhan organisasi."
          eyebrow="Cara mengikuti"
          title="Datang sebagai peserta atau ajak timmu berlatih"
          titleId="format-title"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trainingFormats.map((format) => (
            <div
              key={format.title}
              className="rounded-panel bg-panel-soft p-6 md:p-8"
            >
              <h3 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
                {format.title}
              </h3>
              <p className="mt-2 max-w-[36em] leading-[1.6] text-muted">{format.description}</p>
              <a
                className="mt-5 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
                href={format.action.href}
              >
                {format.action.label}
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
