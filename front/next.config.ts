import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/api/media/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/logo-white.png", search: "" },
      { pathname: "/logo-dark.png", search: "" },
      { pathname: "/logo-light.png", search: "" },
      { pathname: "/assets/**", search: "" },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  env: {
    USERNAME_ADMIN: process.env.USERNAME_ADMIN || process.env.NEXT_PUBLIC_USERNAME_ADMIN || "adminpangkreas",
    NEXT_PUBLIC_USERNAME_ADMIN: process.env.NEXT_PUBLIC_USERNAME_ADMIN || process.env.USERNAME_ADMIN || "adminpangkreas",
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "panggungkreator.idn@gmail.com",
  },
};

export default nextConfig;
