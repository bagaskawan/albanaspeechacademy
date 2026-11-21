import type { EmailKind } from "@/lib/registration-email";

export type InvoiceEmailStatus = {
  kind: EmailKind;
  status: "sending" | "sent" | "failed";
  attempts: number;
};

export type InvoicePaymentItem = {
  id: number;
  amountIdr: number;
  balanceAfterIdr: number;
  note: string | null;
  recordedAt: string;
  recordedBy: string;
  voided: boolean;
};

export type BillingInvoice = {
  id: number;
  invoice_number: string;
  stage: string;
  subtotal_idr: number | string;
  unique_code: number | string;
  total_idr: number | string;
  received_idr?: number | string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  academy_email_deliveries?: InvoiceEmailStatus[];
  academy_invoice_payments?: {
    id: number;
    amount_idr: number | string;
    balance_after_idr: number | string;
    note: string | null;
    recorded_at: string;
    recorded_by: string;
    voided_at: string | null;
  }[];
};

export type BillingRegistration = {
  id: number;
  full_name: string;
  email: string;
  whatsapp: string;
  offer_title: string;
  payment_method?: string;
  price_idr_at_signup?: number | string;
  dp_percent_at_signup?: number | string | null;
  received_at: string;
  academy_registration_items: { batch_slug: string }[];
  academy_invoices: BillingInvoice[];
};

export type BillingRow = {
  invoiceId: number | null;
  invoiceNumber: string | null;
  registration: BillingRegistration;
  stageLabel: string;
  totalIdr: number | null;
  status: string;
  createdAt: string;
  emails: InvoiceEmailStatus[];
  payments: InvoicePaymentItem[];
};

export function mapInvoicePayments(invoice: BillingInvoice): InvoicePaymentItem[] {
  const raw = invoice.academy_invoice_payments ?? [];
  return [...raw]
    .sort((a, b) => Date.parse(a.recorded_at) - Date.parse(b.recorded_at))
    .map((p) => ({
      id: p.id,
      amountIdr: Number(p.amount_idr),
      balanceAfterIdr: Number(p.balance_after_idr),
      note: p.note ?? null,
      recordedAt: p.recorded_at,
      recordedBy: p.recorded_by,
      voided: Boolean(p.voided_at),
    }));
}

/** Satu baris per tagihan, terbaru dulu. Pendaftaran tanpa tagihan tetap mendapat satu baris. */
export function invoiceRows(registrations: readonly BillingRegistration[]): BillingRow[] {
  const rows: BillingRow[] = [];

  for (const registration of registrations) {
    if (!registration.academy_invoices.length) {
      rows.push({
        invoiceId: null,
        invoiceNumber: null,
        registration,
        stageLabel: "—",
        totalIdr: null,
        status: "belum ada tagihan",
        createdAt: registration.received_at,
        emails: [],
        payments: [],
      });
      continue;
    }

    for (const invoice of registration.academy_invoices) {
      rows.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        registration,
        stageLabel: invoice.stage === "remaining" ? "Pelunasan" : "Awal",
        totalIdr: Number(invoice.total_idr),
        status: invoice.status,
        createdAt: invoice.created_at,
        emails: invoice.academy_email_deliveries ?? [],
        payments: mapInvoicePayments(invoice),
      });
    }
  }

  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
