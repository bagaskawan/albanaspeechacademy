"use client";

import { useState } from "react";
import { RegistrationForm } from "./registration-form";
import { RegistrationOverview } from "./registration-overview";
import type { RegistrationBatch } from "@/lib/registration";
import type { BundleOffer } from "@/lib/server/bundle-offer";

export function RegistrationChoice({ batch, offer }: { batch: RegistrationBatch; offer: BundleOffer | null }) {
  const [withBundle, setWithBundle] = useState(false);
  // Ringkasan di atas selalu menampilkan program yang didaftari; paket hanya
  // mengubah nilai yang dikirim dan ringkasan pembayaran di langkah terakhir.
  const selected: RegistrationBatch = withBundle && offer
    ? {
        ...batch,
        programName: offer.title,
        batchName: `${batch.batchName} + ${offer.partner.batchName}`,
        priceIdr: offer.packagePriceIdr,
        dpPercent: offer.dpPercent,
        normalPriceIdr: null,
      }
    : batch;

  return <>
    <RegistrationOverview batch={batch} />
    <RegistrationForm
      batch={selected}
      baseBatch={batch}
      offer={offer}
      withBundle={withBundle}
      onBundleChange={setWithBundle}
    />
  </>;
}
