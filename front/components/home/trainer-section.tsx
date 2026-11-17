import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";
import { TrainerGallery, type Trainer } from "./trainer-gallery";

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
    <section
      id="trainer"
      className="section tone-canvas"
      aria-labelledby="trainer-title"
    >
      <Container className="max-w-7xl">
        <p className="eyebrow">[ TRAINER ]</p>
        <h2
          id="trainer-title"
          className="mt-3 max-w-[24ch] type-display text-balance"
        >
          Kenali <em className="accent-serif">yang akan mendampingimu</em>
        </h2>
        <p className="mt-3 max-w-[42em] leading-[1.6] text-[var(--tone-muted)]">
          Praktisi yang sehari-hari berbicara di depan audiens — di radio, panggung, ruang kelas, dan ruang rapat.
        </p>

        <TrainerGallery trainers={trainers} />
      </Container>
    </section>
  );
}
