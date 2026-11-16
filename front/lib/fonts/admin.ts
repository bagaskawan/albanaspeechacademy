import { Plus_Jakarta_Sans } from "next/font/google";

// Admin + auth: Plus Jakarta Sans, self-hosted via next/font and exposed as --font-admin.
export const adminFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-admin",
});
