import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { RegisterPage } from "@/components/register/register-page";
import { readProgramDetail } from "@/lib/server/program-showcase";
import { readProgramRegistration } from "@/lib/server/registration-batch";

export const metadata: Metadata = {
  title: "Daftar kelas · Albana Speech Academy",
  description: "Formulir pendaftaran kelas Albana Speech Academy.",
};

async function ProgramRegistration({ params }: { params: Promise<{ program: string }> }) {
  const { program } = await params;
  if (program === "inhouse-training") permanentRedirect("/program/inhouse-training");
  if (program === "basic-to-advance") permanentRedirect("/register/public-speaking-for-speakers");

  const selection = await readProgramRegistration(program);
  if (selection.status === "missing") notFound();

  let programPhoto: { src: string; alt: string } | null = null;
  if (selection.status === "ready" || selection.status === "program") {
    try {
      const detail = await readProgramDetail(program);
      if (detail.status === "ready") {
        const firstImage = detail.media.find((item) => item.kind === "image");
        if (firstImage) programPhoto = { src: firstImage.src, alt: firstImage.alt };
      }
    } catch { /* Program panel remains available without photo. */ }
  }

  return <RegisterPage selection={selection} programPhoto={programPhoto} />;
}

export default function Page({ params }: { params: Promise<{ program: string }> }) {
  return (
    <Suspense fallback={<RegisterPage selection={{ status: "loading" }} />}>
      <ProgramRegistration params={params} />
    </Suspense>
  );
}
