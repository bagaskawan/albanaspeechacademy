import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { RegisterPage } from "@/components/register/register-page";
import { readProgramRegistration } from "@/lib/server/registration-batch";

export const instant = false;

export const metadata: Metadata = {
  title: "Daftar kelas · Albana Speech Academy",
  description: "Formulir pendaftaran kelas Albana Speech Academy.",
};

async function ProgramRegistration({ params }: { params: Promise<{ program: string }> }) {
  const { program } = await params;
  if (program === "basic-to-advance") permanentRedirect("/register/public-speaking-for-speakers");
  const selection = await readProgramRegistration(program);
  if (selection.status === "missing") notFound();
  return <RegisterPage selection={selection} />;
}

export default function Page({ params }: { params: Promise<{ program: string }> }) {
  return (
    <Suspense fallback={<RegisterPage selection={{ status: "loading" }} />}>
      <ProgramRegistration params={params} />
    </Suspense>
  );
}
