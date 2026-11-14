import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ProgramDetailFailure,
  ProgramDetailLoading,
  ProgramDetailPage,
} from "@/components/program/program-detail-page";
import { readProgramDetail } from "@/lib/server/program-showcase";
import { academyRequest } from "@/lib/server/academy-api";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";

export const instant = false;

async function ProgramContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "basic-to-advance") permanentRedirect("/program/public-speaking-for-speakers");
  const program = await readProgramDetail(slug);

  if (program.status === "missing") notFound();
  if (program.status === "failed") return <ProgramDetailFailure />;
  let consultationHref: string | undefined;
  let partners: { id: number; name: string; logo_url: string | null }[] = [];
  if (slug === "inhouse-training") {
    try {
      const contacts = await readPublishedContacts();
      const whatsapp = contacts.find((item) => item.kind === "whatsapp");
      consultationHref = whatsapp ? contactHref(whatsapp) : undefined;
      const rows = await academyRequest("academy_partners?select=id,name,logo_url&published=eq.true&order=sort_order,id");
      if (Array.isArray(rows)) partners = rows as typeof partners;
    } catch { /* Inhouse information remains visible without contacts or partners. */ }
  }
  return <ProgramDetailPage card={program.card} media={program.media} consultationHref={consultationHref} partners={partners} />;
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProgramDetailLoading />}>
      <ProgramContent params={params} />
    </Suspense>
  );
}
