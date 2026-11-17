import Image from "next/image";
import { Container } from "@/components/layout/container";
import type { HomeMedia } from "@/lib/home-data";
import { academyRequest } from "@/lib/server/academy-api";
import { SectionIntro } from "./section-intro";

const approaches = [
  { value: 70, title: "Praktik & simulasi", description: "Praktik langsung, simulasi panggung, role play MC dan pembicara, presentasi kasus nyata." },
  { value: 20, title: "Coaching & feedback", description: "Evaluasi performa pribadi, tinjauan sesama peserta, masukan trainer." },
  { value: 10, title: "Konsep & kerangka", description: "Teori komunikasi profesional, struktur bicara, alat komunikasi praktis." },
] as const;
const levels = [
  ["Fundamental", "membangun percaya diri"], ["Professional", "komunikasi efektif"],
  ["Advance", "performa panggung"], ["Expert", "pembicara dan fasilitator"],
] as const;
const topics = ["Public Speaking", "Professional Presentation", "MC & Event Communication", "Moderator & Host", "Leadership Communication", "Service Excellence", "Training of Trainer"];
const defaultMethod = "70% praktik dan simulasi, 20% coaching dan feedback, 10% konsep dan kerangka.";

export async function LearningMethodChapter({ moments }: { moments: HomeMedia[] }) {
  let method: string | null = null;
  try {
    const rows = await academyRequest("academy?select=teaching_method&id=eq.1&limit=1");
    if (Array.isArray(rows) && typeof rows[0]?.teaching_method === "string") method = rows[0].teaching_method;
  } catch { /* Editorial copy remains available. */ }
  return <section id="cara-ngajar" className="section tone-sand" aria-labelledby="cara-ngajar-title"><Container className="max-w-7xl">
    <SectionIntro eyebrow="[ CARA BELAJAR ]" title={<>Kemampuan bicara tumbuh saat <em className="accent-serif">benar-benar dipraktikkan</em></>} titleId="cara-ngajar-title" description={method && method !== defaultMethod ? method : "Sebagian besar waktumu dipakai untuk berbicara, bukan mendengar. Masukan trainer menajamkannya; kerangka komunikasi merapikannya."} />
    <ol className="mt-8 grid gap-4">{approaches.map((item, index) => { const photo = moments[index]; return <li key={item.value} data-motion="rise" className="grid gap-4 border-t border-[var(--tone-rule)] py-6 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] md:gap-10">
      <div className="grid gap-3 md:grid-cols-[auto_1fr] md:gap-x-8">
        <strong data-motion="count" data-value={item.value} className="type-mega tabular-nums text-[var(--tone-accent)]">{item.value}%</strong>
        <div><h3 className="type-title">{item.title}</h3><p className="mt-3 text-[var(--tone-muted)]">{item.description}</p></div>
        <div className="h-1.5 bg-[var(--tone-tile)] md:col-span-2"><div data-motion="bar" className="h-full origin-left bg-[var(--tone-accent)]" style={{ width: `${item.value}%` }} /></div>
      </div>
      {photo ? <figure><div data-motion="media" className="relative aspect-[4/3] overflow-hidden bg-[var(--tone-tile)]"><Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 28vw, 90vw" className="object-cover" /></div><figcaption className="eyebrow mt-2">{photo.alt}</figcaption></figure> : null}
    </li>; })}</ol>
    <div className="mt-10 border-t border-[var(--tone-rule)] pt-6"><h3 className="eyebrow">Kerangka pengembangan</h3><ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{levels.map(([title, description]) => <li key={title} data-motion="slide" className="border-l-2 border-[var(--tone-accent)] pl-4"><strong className="block">{title}</strong><span className="text-sm text-[var(--tone-muted)]">{description}</span></li>)}</ol></div>
    <div className="mt-10"><h3 className="eyebrow">Bidang pelatihan</h3><p data-motion="rise" className="mt-3 max-w-4xl leading-loose text-[var(--tone-muted)]">{topics.join(" · ")}</p></div>
  </Container></section>;
}
