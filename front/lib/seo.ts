export const SITE_URL = "https://www.albanaspeechacademy.com";
export const SITE_NAME = "Albana Speech Academy";

export const HOME_TITLE = "Kelas Public Speaking Bandung | Albana Speech Academy";
export const HOME_DESCRIPTION =
  "Latihan presentasi langsung di Bandung dan dapatkan masukan dari trainer Albana Speech Academy. Lihat pilihan kelas, jadwal batch, dan biaya.";

export const HOME_OG_IMAGE = {
  url: "/seo/og-home.png",
  width: 1200,
  height: 630,
  alt: "Albana Speech Academy — Kelas Public Speaking Bandung berbasis praktik langsung",
} as const;

export const SITE_ICON = {
  url: "/seo/favicon-96.png",
  sizes: "96x96",
  type: "image/png",
} as const;

export const OFFICIAL_INSTAGRAM_URL = "https://www.instagram.com/albanaspeechacademy";

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        inLanguage: "id-ID",
        publisher: {
          "@id": `${SITE_URL}/#academy`,
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#academy`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/seo/logo-512.png`,
          width: 512,
          height: 512,
        },
        founder: {
          "@type": "Person",
          name: "Alan Albana",
        },
        parentOrganization: {
          "@type": "Organization",
          name: "CV Asa Albana",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jl. Diponegoro No. 61",
          addressLocality: "Bandung",
          addressRegion: "Jawa Barat",
          addressCountry: "ID",
        },
        sameAs: [OFFICIAL_INSTAGRAM_URL],
      },
    ],
  };
}

export function buildProgramJsonLd({
  slug,
  title,
  description,
  topics,
}: {
  slug: string;
  title: string;
  description: string;
  topics: string[];
}) {
  const pageUrl = `${SITE_URL}/program/${encodeURIComponent(slug)}`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: pageUrl,
      },
    ],
  };

  if (slug === "inhouse-training") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList,
        {
          "@type": "Service",
          "@id": `${pageUrl}#service`,
          name: title,
          description,
          url: pageUrl,
          serviceType: "Inhouse Public Speaking & Communication Training",
          provider: {
            "@id": `${SITE_URL}/#academy`,
          },
          areaServed: {
            "@type": "Country",
            name: "Indonesia",
          },
        },
      ],
    };
  }

  if (topics.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList,
        {
          "@type": "Course",
          "@id": `${pageUrl}#course`,
          name: title,
          description,
          url: pageUrl,
          inLanguage: "id-ID",
          provider: {
            "@id": `${SITE_URL}/#academy`,
          },
          teaches: topics,
        },
      ],
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbList,
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: title,
        description,
        url: pageUrl,
        inLanguage: "id-ID",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        breadcrumb: {
          "@id": breadcrumbId,
        },
      },
    ],
  };
}

export function deriveArticleSeoDescription(excerpt: string | null | undefined, body: string | null | undefined): string {
  const cleanExcerpt = (excerpt ?? "").replace(/\s+/g, " ").trim();
  if (cleanExcerpt) return cleanExcerpt.slice(0, 200);
  const cleanBody = (body ?? "").replace(/[#>*_`[\]()-]/g, " ").replace(/\s+/g, " ").trim();
  return cleanBody.slice(0, 160) || HOME_DESCRIPTION;
}

export function buildArticleSeoImage(thumbnailImageId: string | null | undefined) {
  if (thumbnailImageId) {
    return {
      url: `${SITE_URL}/api/article-images/${thumbnailImageId}`,
      width: 480,
      height: 360,
    };
  }
  return {
    url: `${SITE_URL}${HOME_OG_IMAGE.url}`,
    width: HOME_OG_IMAGE.width,
    height: HOME_OG_IMAGE.height,
  };
}

export function buildArticleJsonLd({
  slug,
  title,
  description,
  publishedAt,
  updatedAt,
  thumbnailImageId,
}: {
  slug: string;
  title: string;
  description: string;
  publishedAt: string | null;
  updatedAt?: string | null;
  thumbnailImageId?: string | null;
}) {
  const pageUrl = `${SITE_URL}/artikel/${encodeURIComponent(slug)}`;
  const imageUrl = thumbnailImageId ? `${SITE_URL}/api/article-images/${thumbnailImageId}` : null;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: title,
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    inLanguage: "id-ID",
    publisher: {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#academy`,
      name: SITE_NAME,
    },
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}
