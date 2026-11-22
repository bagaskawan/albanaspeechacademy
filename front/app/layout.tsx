import type { Metadata } from "next";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_ICON, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  icons: {
    icon: [SITE_ICON],
  },
};

import PageTransitionLoader from "@/components/ui/PageTransitionLoader";
import TopProgressBar from "@/components/ui/TopProgressBar";
import ThemeScript from "@/components/ui/ThemeScript";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TopProgressBar />
        <PageTransitionLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
