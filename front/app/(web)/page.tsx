import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import {
  HOME_DESCRIPTION,
  HOME_OG_IMAGE,
  HOME_TITLE,
  SITE_ICON,
  SITE_NAME,
  SITE_URL,
  buildHomeJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    url: "/",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
  icons: {
    icon: [SITE_ICON],
  },
};

export default function Page() {
  const jsonLd = serializeJsonLd(buildHomeJsonLd());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <HomePage />
    </>
  );
}
