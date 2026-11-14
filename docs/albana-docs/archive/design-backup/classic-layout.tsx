import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Albana Speech Academy",
  description:
    "Kelas public speaking untuk berlatih presentasi, diskusi, dan membawakan acara.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className={ibmPlexMono.variable}>
        <a
          className="fixed top-4 left-4 z-[100] -translate-y-[180%] bg-ink px-5 py-3 text-sm font-semibold text-canvas transition-transform duration-150 focus:translate-y-0"
          href="#main-content"
        >
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
