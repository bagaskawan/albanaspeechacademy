import Image from "next/image";
import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";

type Partner = { id: number; name: string; logo_url: string | null };

export async function PartnersStrip() {
  let partners: Partner[] = [];
  try {
    const rows = await academyRequest("academy_partners?select=id,name,logo_url&published=eq.true&order=sort_order,id");
    if (Array.isArray(rows)) partners = rows as Partner[];
  } catch { /* Partners are omitted when unavailable. */ }
  if (!partners.length) return null;
  return <section className="bg-panel-soft pb-12 md:pb-16" aria-label="Pernah melatih"><Container className="max-w-7xl"><h2 className="eyebrow">Pernah melatih</h2><ul className="mt-5 flex flex-wrap items-center gap-8">
    {partners.map((partner) => <li key={partner.id} data-motion="rise" className="flex min-h-16 items-center gap-3">{partner.logo_url ? <Image src={partner.logo_url} alt="" width={120} height={64} unoptimized className="h-14 w-auto max-w-28 object-contain grayscale transition-[filter] hover:grayscale-0" /> : null}<span className="text-sm font-medium">{partner.name}</span></li>)}
  </ul></Container></section>;
}
