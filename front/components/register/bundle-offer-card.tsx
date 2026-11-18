"use client";

import { formatRupiah } from "@/lib/format";
import type { BundleOffer } from "@/lib/server/bundle-offer";

// Tawaran paket muncul sekali, di akhir formulir, saat peserta sudah tahu biaya
// program yang dipilih. Bawaannya "tidak": paket hanya ditambahkan bila dipilih.
export function BundleOfferCard({ offer, baseProgramName, basePriceIdr, selected, onSelect }: {
  offer: BundleOffer;
  baseProgramName: string;
  basePriceIdr: number;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}) {
  const radio = "mt-0.5 size-4 shrink-0 accent-[var(--tone-accent)]";
  const optionClass = (active: boolean) =>
    `flex min-h-12 cursor-pointer items-start gap-3 rounded-xs p-3.5 transition-colors ${
      active
        ? "border-2 border-[var(--tone-accent)] bg-[var(--tone-tile)]"
        : "border border-[var(--tone-rule)] bg-[var(--tone-bg)]"
    }`;
  return (
    <fieldset className="rounded-xs border border-[var(--tone-rule)] p-4 sm:p-5">
      <legend className="px-2 font-semibold text-[var(--tone-ink)]">
        {offer.partnerIsCertification ? "Sekalian ambil sertifikasi?" : "Sekalian ambil pelatihan Speaker?"}
      </legend>
      <div className="grid gap-3">
        <label className={optionClass(!selected)}>
          <input type="radio" name="bundle-offer" className={radio} checked={!selected} onChange={() => onSelect(false)} />
          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className={!selected ? "font-semibold text-[var(--tone-ink)]" : "text-[var(--tone-ink)]"}>
              Tidak, {baseProgramName} saja
            </span>
            <span className="font-medium tabular-nums text-[var(--tone-ink)]">{formatRupiah(basePriceIdr)}</span>
          </span>
        </label>
        <label className={optionClass(selected)}>
          <input type="radio" name="bundle-offer" className={radio} checked={selected} onChange={() => onSelect(true)} />
          <span className="flex-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <strong className={selected ? "font-semibold text-[var(--tone-ink)]" : "font-medium text-[var(--tone-ink)]"}>
                Tambah {offer.partner.programName}
              </strong>
              <span className="font-medium tabular-nums text-[var(--tone-ink)]">{formatRupiah(offer.packagePriceIdr)}</span>
            </span>
            {offer.description ? <span className="mt-1 block text-sm text-[var(--tone-muted)]">{offer.description}</span> : null}
            <span className="mt-1 block text-sm text-[var(--tone-muted)]">
              + <span className="tabular-nums">{formatRupiah(offer.addOnIdr)}</span>
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
