export type BillingRegistration = {
  id: number;
  full_name: string;
  email: string;
  whatsapp: string;
  offer_title: string;
  received_at: string;
  academy_registration_items: { batch_slug: string }[];
  academy_invoices: {
    id: number;
    stage: string;
    subtotal_idr: number | string;
    unique_code: number | string;
    total_idr: number | string;
    status: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
  }[];
};

export type BillingRow = {
  invoiceId: number | null;
  registration: BillingRegistration;
  stageLabel: string;
  totalIdr: number | null;
  status: string;
  createdAt: string;
};

/** Satu baris per tagihan, terbaru dulu. Pendaftaran tanpa tagihan tetap mendapat satu baris. */
export function invoiceRows(registrations: readonly BillingRegistration[]): BillingRow[] {
  const rows: BillingRow[] = [];

  for (const registration of registrations) {
    if (!registration.academy_invoices.length) {
      rows.push({
        invoiceId: null,
        registration,
        stageLabel: "—",
        totalIdr: null,
        status: "belum ada tagihan",
        createdAt: registration.received_at,
      });
      continue;
    }

    for (const invoice of registration.academy_invoices) {
      rows.push({
        invoiceId: invoice.id,
        registration,
        stageLabel: invoice.stage === "remaining" ? "Pelunasan" : "Awal",
        totalIdr: Number(invoice.total_idr),
        status: invoice.status,
        createdAt: invoice.created_at,
      });
    }
  }

  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
