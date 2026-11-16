import { Poppins } from "next/font/google";

// Admin + auth only; the public site keeps Plus Jakarta Sans + Inter.
export const adminFont = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-admin",
});
