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
  const radio = "mt-0.5 size-4 shrink-0 accent-accent";
  return (
    <fieldset className="border border-rule p-4 sm:p-5">
      <legend className="px-2 font-semibold">
        {offer.partnerIsCertification ? "Sekalian ambil sertifikasi?" : "Sekalian ambil pelatihan Speaker?"}
      </legend>
      <div className="grid gap-3">
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input type="radio" name="bundle-offer" className={radio} checked={!selected} onChange={() => onSelect(false)} />
          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span>Tidak, {baseProgramName} saja</span>
            <span className="tabular-nums">{formatRupiah(basePriceIdr)}</span>
          </span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input type="radio" name="bundle-offer" className={radio} checked={selected} onChange={() => onSelect(true)} />
          <span className="flex-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <strong>Tambah {offer.partner.programName}</strong>
              <span className="tabular-nums">+ {formatRupiah(offer.addOnIdr)}</span>
            </span>
            <span className="mt-1 block text-sm text-muted">
              {offer.partner.batchName} · {offer.partner.sessions.map((session) => session.dateLabel).join(" · ")} · {offer.partner.timeLabel}
            </span>
            {offer.partnerIsCertification ? (
              <span className="mt-1 block text-sm text-muted">Uji kompetensi BNSP. Paket tidak menjamin kelulusan.</span>
            ) : null}
            {offer.description ? <span className="mt-1 block text-sm text-muted">{offer.description}</span> : null}
            <span className="mt-1 block text-sm">
              Total paket <span className="tabular-nums">{formatRupiah(offer.packagePriceIdr)}</span>
              {offer.savingIdr > 0 ? <> (hemat <span className="tabular-nums">{formatRupiah(offer.savingIdr)}</span>)</> : null}
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
