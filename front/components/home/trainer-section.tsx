import { academyRequest } from "@/lib/server/academy-api";
import { TrainerGallery, type Trainer } from "./trainer-gallery";
import { Accent } from "./ui/accent";

type TrainerRow = {
  slug: string;
  name: string;
  expertise: string[] | null;
  bio: string | null;
  photo_url: string | null;
};

const roles: Record<string, string> = {
  "alan-albana": "Founder · Master Trainer BNSP",
  nurachman: "Motivator · Penulis 50 buku",
  "andhan-indah": "Trainer Public Speaking · MC",
  "abo-priatna": "Trainer MC · Host",
};

export async function TrainerSection() {
  let trainers: Trainer[] = [];
  try {
    const rows = await academyRequest("trainers?select=slug,name,expertise,bio,photo_url&order=name");
    if (Array.isArray(rows)) {
      trainers = (rows as TrainerRow[]).map((trainer) => ({
        slug: trainer.slug,
        name: trainer.name,
        role: roles[trainer.slug] ?? (trainer.expertise?.length ? trainer.expertise.join(" · ") : "Trainer"),
        bio: trainer.bio ?? undefined,
        image: trainer.photo_url ?? undefined,
      }));
    }
  } catch { /* Section stays available when the catalog is offline. */ }

  if (!trainers.length) return null;

  return (
    <section id="trainer" className="tone-canvas home-section" aria-labelledby="trainer-title">
      <div className="home-container">
        <TrainerGallery
          trainers={trainers}
          intro={
            <>
              <div className="flex flex-col gap-4">
                <p className="type-label text-[var(--tone-muted)]">08 · Trainer</p>
                <h2 id="trainer-title" data-motion="heading" className="type-display text-balance">
                  Kenali <Accent>yang akan mendampingimu.</Accent>
                </h2>
              </div>
              <p data-motion="rise" className="type-body text-[var(--tone-muted)] text-pretty">
                Praktisi yang sehari-hari berbicara di depan audiens: di radio, panggung, ruang kelas, dan ruang rapat. Mereka akan menilai latihanmu dari pengalaman, bukan dari buku.
              </p>
            </>
          }
          cta={
            <>
              <p className="type-title text-balance">Butuh trainer untuk timmu?</p>
              <p className="type-small text-[var(--tone-muted)]">Susun pelatihan khusus untuk organisasimu.</p>
              <a href="#inhouse-training" className="button-primary">Lihat Inhouse Training</a>
            </>
          }
        />
      </div>
    </section>
  );
}
