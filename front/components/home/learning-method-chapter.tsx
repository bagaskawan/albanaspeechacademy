import { Container } from "@/components/layout/container";
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

export async function LearningMethodChapter() {
  let method: string | null = null;
  try {
    const rows = await academyRequest("academy?select=teaching_method&id=eq.1&limit=1");
    if (Array.isArray(rows) && typeof rows[0]?.teaching_method === "string") method = rows[0].teaching_method;
  } catch { /* Editorial copy remains available. */ }
  return <section id="cara-ngajar" className="section bg-panel-soft" aria-labelledby="cara-ngajar-title"><Container className="max-w-7xl">
    <SectionIntro eyebrow="[ CARA BELAJAR ]" title={<>Kemampuan bicara tumbuh saat <mark className="bg-highlight text-ink">benar-benar dipraktikkan</mark></>} titleId="cara-ngajar-title" description={method && method !== defaultMethod ? method : "Sebagian besar waktumu dipakai untuk berbicara, bukan mendengar. Masukan trainer menajamkannya; kerangka komunikasi merapikannya."} />
    <ol className="mt-8 grid gap-4">{approaches.map((item) => <li key={item.value} data-motion="rise" className="grid gap-3 border-t border-rule py-5 md:grid-cols-[7rem_14rem_1fr] md:items-start md:gap-6">
      <strong data-motion="count" data-value={item.value} className="font-display text-4xl tabular-nums text-accent">{item.value}%</strong>
      <h3 className="text-xl font-semibold">{item.title}</h3>
      <p className="text-muted">{item.description}</p>
      <div className="h-1.5 bg-card md:col-span-3"><div data-motion="bar" className="h-full origin-left bg-accent" style={{ width: `${item.value}%` }} /></div>
    </li>)}</ol>
    <div className="mt-10 border-t border-rule pt-6"><h3 className="eyebrow">Kerangka pengembangan</h3><ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{levels.map(([title, description]) => <li key={title} data-motion="slide" className="border-l-2 border-accent pl-4"><strong className="block">{title}</strong><span className="text-sm text-muted">{description}</span></li>)}</ol></div>
    <div className="mt-10"><h3 className="eyebrow">Bidang pelatihan</h3><p data-motion="rise" className="mt-3 max-w-4xl leading-loose text-muted">{topics.join(" · ")}</p></div>
  </Container></section>;
}
