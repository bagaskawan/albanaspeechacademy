"use client";

import { useState } from "react";
import { NumberChip } from "@/components/home/ui/number-chip";
import { Tile } from "@/components/home/ui/tile";
import { RegisterBrandBar } from "@/components/register/register-brand-bar";
import { REGISTRATION_STEPS } from "@/lib/registration-form";
import type { RegistrationBatch } from "@/lib/registration";
import type { BundleOffer } from "@/lib/server/bundle-offer";
import { RegistrationForm } from "./registration-form";
import { RegistrationOverview } from "./registration-overview";

export function RegistrationChoice({
  batch,
  offer,
}: {
  batch: RegistrationBatch;
  offer: BundleOffer | null;
}) {
  const [withBundle, setWithBundle] = useState(false);
  const [step, setStep] = useState(0);

  const selected: RegistrationBatch =
    withBundle && offer
      ? {
          ...batch,
          programName: offer.title,
          batchName: `${batch.batchName} + ${offer.partner.batchName}`,
          priceIdr: offer.packagePriceIdr,
          dpPercent: offer.dpPercent,
          normalPriceIdr: null,
        }
      : batch;

  const currentStep = REGISTRATION_STEPS[step];

  return (
    <div className="home-grid gap-y-8">
      <aside className="hidden lg:sticky lg:top-8 lg:col-span-4 lg:flex lg:flex-col lg:gap-6 lg:self-start">
        <RegisterBrandBar />

        <div>
          <p className="eyebrow text-[var(--tone-muted)]">Kamu mendaftar untuk</p>
          <p className="type-title mt-1">{batch.programName}</p>
        </div>

        <ol className="grid gap-3 border-t border-[var(--tone-rule)] pt-4">
          {REGISTRATION_STEPS.map((item, index) => {
            const isActive = index === step;
            const isDone = index < step;
            return (
              <li key={item.id} className="flex items-center gap-3">
                {isActive ? (
                  <NumberChip n={index + 1} />
                ) : isDone ? (
                  <span className="type-micro inline-flex h-5 items-center rounded-xs bg-[var(--tone-ink)] px-1.5 text-[var(--tone-bg)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ) : (
                  <span className="type-micro inline-flex h-5 items-center rounded-xs border border-[var(--tone-rule)] px-1.5 text-[var(--tone-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
                <span
                  className={`type-small ${
                    isActive
                      ? "font-semibold text-[var(--tone-ink)]"
                      : "text-[var(--tone-muted)]"
                  }`}
                >
                  {item.title}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="col-span-4 sm:col-span-8 lg:col-span-8">
        <Tile tone="plain" className="tone-canvas p-5 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--tone-rule)] pb-6 lg:hidden">
            <RegisterBrandBar />
            <div>
              <p className="eyebrow text-[var(--tone-muted)]">
                Langkah {step + 1} dari {REGISTRATION_STEPS.length} · {currentStep.title}
              </p>
              <div
                className="mt-2 h-1 bg-[var(--tone-rule)]"
                role="progressbar"
                aria-label="Kemajuan pendaftaran"
                aria-valuemin={1}
                aria-valuemax={REGISTRATION_STEPS.length}
                aria-valuenow={step + 1}
              >
                <div
                  className="h-full bg-[var(--tone-sun)]"
                  style={{ width: `${((step + 1) / REGISTRATION_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <RegistrationForm
            batch={selected}
            baseBatch={batch}
            offer={offer}
            withBundle={withBundle}
            onBundleChange={setWithBundle}
            onStepChange={setStep}
            overview={<RegistrationOverview batch={batch} />}
          />
        </Tile>
      </div>
    </div>
  );
}
