import type { HomeMedia } from "@/lib/home-data";
import { academyRequest } from "@/lib/server/academy-api";
import { AboutPortrait } from "./about-portrait";
import { SkeletonImage } from "./skeleton-image";
import { Accent } from "./ui/accent";

const missions = [
  "Mengembangkan pelatihan komunikasi dari dasar hingga lanjutan.",
  "Meningkatkan kepercayaan diri dan performa komunikasi.",
  "Menghadirkan pelatihan berbasis praktik nyata.",
  "Mendukung budaya komunikasi profesional di organisasi.",
];
const alanPoints = [
  "Penyiar Radio Republik Indonesia sejak 2015.",
  "Certified Master Trainer dan Certified Public Speaker BNSP.",
  "Pemateri untuk kementerian, BUMN, perbankan, dan korporasi.",
];

export async function AboutSection({ moments }: { moments: HomeMedia[] }) {
  let photo = "/images/alan-albana-profile-blue-background.png";
  let academyName = "Albana Speech Academy";
  try {
    const [trainerRows, academyRows] = await Promise.all([
      academyRequest("trainers?select=photo_url&slug=eq.alan-albana&limit=1"),
      academyRequest("academy?select=name&id=eq.1&limit=1"),
    ]);
    if (Array.isArray(trainerRows) && typeof trainerRows[0]?.photo_url === "string") photo = trainerRows[0].photo_url;
    if (Array.isArray(academyRows) && typeof academyRows[0]?.name === "string") academyName = academyRows[0].name;
  } catch { /* Static copy and the existing local portrait remain available. */ }
  const detail = moments[3] ?? null;

  return (
    <section id="tentang" className="tone-mist home-section" aria-labelledby="tentang-title">
      <div className="home-container home-stack-block">
        <div className="home-grid gap-y-10">
          {/* Kiri: judul dan cerita, dengan foto detail kecil di bawah */}
          <div className="col-span-4 flex flex-col justify-between gap-8 sm:col-span-8 lg:col-span-4">
            <div className="flex flex-col gap-4">
              <p className="type-label text-[var(--tone-muted)]">04 — Tentang kami</p>
              <h2 id="tentang-title" data-motion="heading" className="type-display text-balance">
                Dibangun oleh <Accent>praktisi panggung,</Accent> untuk orang yang harus bicara.
              </h2>
              <p data-motion="rise" className="type-lead text-pretty">
                {academyName} oleh CV Asa Albana melatih individu dan organisasi agar tampil lebih percaya diri, komunikatif, dan profesional — lewat praktik langsung, bukan teori panjang.
              </p>
            </div>
            {detail ? (
              <div data-motion="media" className="relative hidden aspect-[4/3] w-2/3 overflow-hidden rounded-xs bg-[var(--tone-tile)] lg:block">
                <SkeletonImage fill src={detail.src} alt={detail.alt} sizes="20vw" className="object-cover" />
              </div>
            ) : null}
          </div>

          {/* Tengah: potret pendiri */}
          <div className="col-span-4 sm:col-span-5 lg:col-span-4">
            <div data-motion="media" className="relative aspect-[3/4] overflow-hidden rounded-xs bg-[var(--tone-tile)]">
              <AboutPortrait
                src={photo}
                alt="Alan Albana, founder Albana Speech Academy."
              />
            </div>
          </div>

          {/* Kanan: siapa Alan, singkat */}
          <div className="col-span-4 flex flex-col justify-end gap-6 sm:col-span-3 lg:col-span-4">
            <p data-motion="rise" className="type-body text-[var(--tone-muted)] text-pretty">
              Albana lahir dari ruang siaran dan panggung acara. Karena itu kelasnya terasa seperti latihan sebelum tampil: ada naskah, ada audiens, ada evaluasi.
            </p>
            <div className="border-t border-[var(--tone-ink)] pt-4">
              <h3 className="type-title">Alan Albana, S.Kom.I., M.I.Kom.</h3>
              <p className="type-label mt-2 text-[var(--tone-muted)]">Founder · Trainer · MC · Penyiar RRI</p>
              <ul className="type-small mt-4 grid gap-2">
                {alanPoints.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--tone-accent)]">—</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <a href="#trainer" className="button-primary self-start">Kenali tim trainer</a>
          </div>
        </div>

        {/* Visi dan misi sebagai baris bernomor */}
        <div className="home-grid gap-y-8 border-t border-[var(--tone-rule)] pt-10">
          <div className="col-span-4 sm:col-span-8 lg:col-span-4">
            <p className="type-label text-[var(--tone-muted)]">Visi</p>
            <p className="type-title mt-3 text-pretty">
              Menjadi mitra terpercaya dalam pengembangan kompetensi komunikasi profesional dan kepemimpinan SDM yang berdaya saing tinggi.
            </p>
          </div>
          <ol className="col-span-4 grid gap-6 sm:col-span-8 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {missions.map((mission, index) => (
              <li key={mission} data-motion="rise" className="flex gap-4 border-t border-[var(--tone-rule)] pt-4">
                <span className="type-title italic text-[var(--tone-accent)]">{String(index + 1).padStart(2, "0")}</span>
                <span className="type-body">{mission}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
