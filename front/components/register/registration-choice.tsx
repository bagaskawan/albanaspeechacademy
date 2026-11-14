"use client";

import { useState } from "react";
import { RegistrationForm } from "./registration-form";
import { RegistrationOverview } from "./registration-overview";
import type { RegistrationBatch } from "@/lib/registration";
import type { BundleChoice } from "@/lib/server/bundle-offer";

const rupiah = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export function RegistrationChoice({ batch, bundle }: { batch: RegistrationBatch; bundle: BundleChoice | null }) {
  const [selected, setSelected] = useState<"single" | "bundle">("single");
  const bundledBatch: RegistrationBatch | null = bundle ? {
    ...bundle.primary, programName: bundle.title,
    batchName: `${bundle.primary.batchName} + ${bundle.secondary.batchName}`,
    priceIdr: bundle.priceIdr, dpPercent: bundle.dpPercent,
    normalPriceIdr: bundle.primary.priceIdr + bundle.secondary.priceIdr,
  } : null;
  const choice = selected === "bundle" && bundledBatch ? bundledBatch : batch;
  return <>
    {bundle ? <fieldset className="mt-9 border border-rule p-5" aria-label="Pilihan pendaftaran">
      <legend className="px-2 font-semibold">Pilih penawaran</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`flex min-h-24 cursor-pointer gap-3 border p-4 ${selected === "single" ? "border-accent" : "border-rule"}`}>
          <input type="radio" name="offer" value="single" checked={selected === "single"} onChange={() => setSelected("single")} />
          <span><strong className="block">{batch.programName}</strong><span className="text-sm">{rupiah(batch.priceIdr)}</span></span>
        </label>
        <label className={`flex min-h-24 cursor-pointer gap-3 border p-4 ${selected === "bundle" ? "border-accent" : "border-rule"}`}>
          <input type="radio" name="offer" value="bundle" checked={selected === "bundle"} onChange={() => setSelected("bundle")} />
          <span><strong className="block">{bundle.title}</strong><span className="text-sm">{rupiah(bundle.priceIdr)} · dua batch, satu tagihan</span></span>
        </label>
      </div>
    </fieldset> : null}
    <RegistrationOverview batch={choice} />
    <RegistrationForm key={selected} batch={choice} offer={selected === "bundle" && bundle ? {
      slug: bundle.slug, secondaryBatchSlug: bundle.secondary.batchSlug,
    } : null} />
  </>;
}
