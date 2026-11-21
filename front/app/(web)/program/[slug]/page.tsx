import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ProgramDetailFailure,
  ProgramDetailPage,
  type ProgramPartnerItem,
} from "@/components/program/program-detail-page";
import {
  resolveProgramMetaDescription,
  resolveProgramTopics,
} from "@/lib/program-editorial";
import {
  HOME_OG_IMAGE,
  SITE_ICON,
  SITE_NAME,
  SITE_URL,
  buildProgramJsonLd,
  serializeJsonLd,
} from "@/lib/seo";
import { academyRequest } from "@/lib/server/academy-api";
import { readProgramDetail } from "@/lib/server/program-showcase";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";

export const dynamic = "force-dynamic";

function resolveCanonicalSlug(slug: string): string {
  return slug === "basic-to-advance" ? "public-speaking-for-speakers" : slug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = resolveCanonicalSlug(rawSlug);
  const program = await readProgramDetail(slug);

  if (program.status === "missing") {
    return {
      metadataBase: new URL(SITE_URL),
      title: `Program tidak ditemukan | ${SITE_NAME}`,
      robots: { index: false, follow: false },
      icons: { icon: [SITE_ICON] },
    };
  }

  if (program.status === "failed") {
    return {
      metadataBase: new URL(SITE_URL),
      title: `Program belum bisa dimuat | ${SITE_NAME}`,
      robots: { index: false, follow: false },
      icons: { icon: [SITE_ICON] },
    };
  }

  const title = `${program.card.title} | ${SITE_NAME}`;
  const description = resolveProgramMetaDescription(
    program.card.slug,
    program.card.summary,
  );
  const canonicalPath = `/program/${encodeURIComponent(program.card.slug)}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITE_NAME,
      url: canonicalPath,
      title,
      description,
      images: [HOME_OG_IMAGE],
    },
    icons: {
      icon: [SITE_ICON],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "basic-to-advance") {
    permanentRedirect("/program/public-speaking-for-speakers");
  }

  const program = await readProgramDetail(slug);

  if (program.status === "missing") notFound();
  if (program.status === "failed") return <ProgramDetailFailure />;

  let consultationHref: string | undefined;
  let partners: ProgramPartnerItem[] = [];

  if (slug === "inhouse-training") {
    try {
      const contacts = await readPublishedContacts();
      const whatsapp = contacts.find((item) => item.kind === "whatsapp");
      consultationHref = whatsapp ? contactHref(whatsapp) : undefined;
      const rows = await academyRequest(
        "academy_partners?select=id,name,logo_url&published=eq.true&order=sort_order,id",
      );
      if (Array.isArray(rows)) partners = rows as ProgramPartnerItem[];
    } catch {
      /* Inhouse information remains visible without contacts or partners. */
    }
  }

  const description = resolveProgramMetaDescription(
    program.card.slug,
    program.card.summary,
  );
  const resolvedTopics = resolveProgramTopics(
    program.card.slug,
    program.card.topics,
  );
  const jsonLd = serializeJsonLd(
    buildProgramJsonLd({
      slug: program.card.slug,
      title: program.card.title,
      description,
      topics: resolvedTopics,
    }),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ProgramDetailPage
        card={program.card}
        media={program.media}
        consultationHref={consultationHref}
        partners={partners}
      />
    </>
  );
}
