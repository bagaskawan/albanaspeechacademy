import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
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
