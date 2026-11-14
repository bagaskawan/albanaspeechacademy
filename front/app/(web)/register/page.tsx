import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Daftar kelas · Albana Speech Academy",
  description: "Formulir pendaftaran kelas Albana Speech Academy.",
};

export default function Page() {
  redirect("/register/public-speaking-for-speakers");
}
