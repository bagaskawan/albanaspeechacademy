"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RegistrationStepFields } from "@/components/register/registration-steps";
import type { RegistrationBatch } from "@/lib/registration";
import { BundleOfferCard } from "@/components/register/bundle-offer-card";
import { ConfirmRegistrationDialog } from "@/components/register/confirm-registration-dialog";
import type { BundleOffer } from "@/lib/server/bundle-offer";
import { registrationFailure, type RegistrationBanner } from "@/lib/registration-feedback";
import {
  REGISTRATION_STEPS,
  buildRegistrationPayload,
  confirmationSummary,
  emptyRegistrationValues,
  registrationFormCopy,
  validateRegistration,
  validateRegistrationStep,
  type RegistrationErrors,
  type RegistrationValues,
} from "@/lib/registration-form";

type SubmitState = "idle" | "submitting" | "success";

export function RegistrationForm({ batch, baseBatch, offer, withBundle = false, onBundleChange, overview, onStepChange }: {
  /** Batch yang nilainya dikirim: program saja, atau paket bila peserta memilihnya. */
  batch: RegistrationBatch;
  /** Program yang sedang didaftari, untuk naskah kartu tawaran. */
  baseBatch?: RegistrationBatch;
  offer?: BundleOffer | null;
  withBundle?: boolean;
  onBundleChange?: (selected: boolean) => void;
  overview?: React.ReactNode;
  onStepChange?: (step: number) => void;
}) {
  const copy = registrationFormCopy(batch);
  const [values, setValues] = useState<RegistrationValues>(emptyRegistrationValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [banner, setBanner] = useState<RegistrationBanner | null>(null);
  const [step, setStep] = useState(0);
  const [staleKey, setStaleKey] = useState<string | null>(null);
  const choiceKey = `${withBundle ? offer?.slug ?? "bundle" : "single"}:${batch.priceIdr}`;
  const isStale = staleKey === choiceKey;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusFieldRef = useRef<keyof RegistrationValues | null>(null);
  const didMount = useRef(false);
  const submittingRef = useRef(false);
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => { idempotencyKey.current = null; }, [batch.priceIdr, withBundle]);

  useEffect(() => {
    if (batch.dpPercent === null && values.paymentMethod === "dp") {
      setValues((previous) => ({ ...previous, paymentMethod: "full" }));
    }
  }, [batch.dpPercent, values.paymentMethod]);

  useEffect(() => { onStepChange?.(step); }, [step, onStepChange]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (focusFieldRef.current) {
      const field = document.getElementById(focusFieldRef.current);
      if (field) field.focus();
      else headingRef.current?.focus();
      focusFieldRef.current = null;
    } else {
      headingRef.current?.focus();
    }
  }, [step, errors]);

  const currentStep = REGISTRATION_STEPS[step];
  const isLastStep = step === REGISTRATION_STEPS.length - 1;
  const update = <K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => {
    idempotencyKey.current = null;
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key] && !(key === "professionCategory" && previous.profession) && !(key === "source" && previous.sourceOther)) {
        return previous;
      }
      const next = { ...previous };
      delete next[key];
      if (key === "professionCategory") delete next.profession;
      if (key === "source") delete next.sourceOther;
      return next;
    });
  };

  function showErrors(nextErrors: RegistrationErrors, targetStep: number) {
    focusFieldRef.current = REGISTRATION_STEPS[targetStep].fields.find((field) => nextErrors[field]) ?? null;
    setErrors(nextErrors);
    setBanner({ message: "Periksa kembali bagian yang ditandai." });
    setStep(targetStep);
  }

  function goNext() {
    const nextErrors = validateRegistrationStep(values, batch, currentStep.id);
    if (Object.keys(nextErrors).length) {
      showErrors(nextErrors, step);
      return;
    }
    setErrors({});
    setBanner(null);
    setStep((current) => current + 1);
  }

  function goBack() {
    setErrors({});
    setBanner(null);
    setStep((current) => current - 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }
    if (submittingRef.current || isStale) return;

    const nextErrors = validateRegistration(values, batch);
    if (Object.keys(nextErrors).length) {
      const firstInvalidStep = REGISTRATION_STEPS.findIndex((item) =>
        item.fields.some((field) => nextErrors[field]),
      );
      showErrors(nextErrors, firstInvalidStep < 0 ? step : firstInvalidStep);
      return;
    }

    setConfirmOpen(true);
  }

  async function submitRegistration() {
    if (submittingRef.current || isStale) return;

    submittingRef.current = true;
    setSubmitState("submitting");
    setBanner(null);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildRegistrationPayload(values, batch), idempotencyKey: idempotencyKey.current,
          offerSlug: withBundle && offer ? offer.slug : null,
          secondaryBatchSlug: withBundle && offer ? offer.partner.batchSlug : null }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const message = payload && typeof payload === "object" && "message" in payload &&
        typeof payload.message === "string" ? payload.message : undefined;
      if (response.ok) {
        if (!payload || typeof payload !== "object" || !("redirectUrl" in payload) ||
          typeof payload.redirectUrl !== "string" || !/^\/register\/konfirmasi\/[0-9]+\.[0-9]{10}\.[A-Za-z0-9_-]{43}$/.test(payload.redirectUrl)) {
          throw new Error("Respons konfirmasi tidak valid.");
        }
        setSubmitState("success");
        window.location.assign(payload.redirectUrl);
        return;
      }
      setConfirmOpen(false);
      setSubmitState("idle");
      if (response.status === 409) setStaleKey(choiceKey);
      if (response.status === 409 || response.status === 423) idempotencyKey.current = null;
      setBanner(registrationFailure(response.status, message));
    } catch {
      setConfirmOpen(false);
      setSubmitState("idle");
      setBanner({ message: "Pendaftaran belum bisa diproses. Periksa koneksi lalu coba lagi." });
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form id="form-pendaftaran" onSubmit={handleSubmit} noValidate aria-busy={submitState === "submitting"}>
      {step === 0 && overview ? <div className="mb-8">{overview}</div> : null}
      <p className="eyebrow text-[var(--tone-muted)]">
        Langkah {step + 1} dari {REGISTRATION_STEPS.length}
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="type-title mt-2">
        Bagian {step + 1}: {currentStep.title}
      </h2>
      <p className="type-small mt-2 text-[var(--tone-muted)]">Pertanyaan bertanda * wajib diisi.</p>

      {banner ? (
        <div role="alert" className="mt-6 border-l-4 border-danger bg-[var(--tone-tile)] px-4 py-3">
          <p className="type-small font-medium">{banner.message}</p>
          {banner.showProgramLink ? (
            <Link className="type-small mt-2 inline-block font-semibold text-[var(--tone-accent)] underline" href="/#program">
              Periksa pilihan program terbaru
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6">
        {isLastStep && offer && baseBatch && onBundleChange ? (
          <BundleOfferCard
            offer={offer}
            baseProgramName={baseBatch.programName}
            basePriceIdr={baseBatch.priceIdr}
            selected={withBundle}
            onSelect={onBundleChange}
          />
        ) : null}
        <RegistrationStepFields
          stepId={currentStep.id}
          values={values}
          errors={errors}
          copy={copy}
          priceIdr={batch.priceIdr}
          dpPercent={batch.dpPercent}
          onUpdate={update}
        />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--tone-rule)] pt-6 max-lg:sticky max-lg:bottom-0 max-lg:bg-[var(--tone-bg)] max-lg:px-4 max-lg:py-3">
        {step > 0 ? (
          <button
            type="button"
            className="type-small inline-flex min-h-11 cursor-pointer items-center rounded-xs border border-[var(--tone-rule)] bg-transparent px-6 py-2.5 font-display font-semibold text-[var(--tone-ink)]"
            onClick={goBack}
          >
            Kembali
          </button>
        ) : <span />}
        <button type="submit" className="button-primary ml-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-60" disabled={submitState === "submitting" || isStale}>
          {submitState === "submitting" ? "Mengirim…" : isLastStep ? "Tinjau & kirim" : "Lanjut →"}
        </button>
      </div>
      <ConfirmRegistrationDialog
        open={confirmOpen}
        rows={confirmOpen ? confirmationSummary(values, batch, withBundle && offer ? offer.title : null) : []}
        submitting={submitState === "submitting"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submitRegistration}
      />
      <span className="sr-only" role="status">{submitState === "submitting" ? "Mengirim pendaftaran" : ""}</span>
    </form>
  );
}
