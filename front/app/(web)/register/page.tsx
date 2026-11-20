import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgramSelectorView } from "@/components/register/program-selector-dialog";
import { readProgramShowcase } from "@/lib/server/program-showcase";

export const metadata: Metadata = {
  title: "Pilih program · Daftar kelas · Albana Speech Academy",
  description: "Pilih program Public Training Albana Speech Academy untuk melanjutkan pendaftaran.",
};

async function PublicTrainingSelector() {
  const showcase = await readProgramShowcase();
  if (showcase.status === "failed") {
    return <ProgramSelectorView programs={[]} status="failed" />;
  }

  const publicPrograms = showcase.cards.filter((card) => card.slug !== "inhouse-training");
  return <ProgramSelectorView programs={publicPrograms} status="ready" />;
}

export default function Page() {
  return (
    <Suspense fallback={<ProgramSelectorView programs={[]} status="loading" />}>
      <PublicTrainingSelector />
    </Suspense>
  );
}
