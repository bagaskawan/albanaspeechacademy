import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/artikel", "/artikel/", "/api/article-images/"],
        disallow: ["/admin", "/admin/", "/api/admin/", "/register/konfirmasi/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
