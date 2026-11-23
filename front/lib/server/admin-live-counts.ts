import "server-only";

import { academyBillingClient } from "./academy-billing";

export type AdminLiveCounts = {
  pendingInvoices: number;
  verifiedRegistrants: number;
};

/** Counts pending invoices and distinct verified registrations for live sidebar badges. */
export async function readAdminLiveCounts(): Promise<AdminLiveCounts> {
  try {
    const db = academyBillingClient();
    const [pendingResult, verifiedResult] = await Promise.all([
      db
        .from("academy_invoices")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      db
        .from("academy_invoices")
        .select("registration_id")
        .eq("status", "verified"),
    ]);

    const pendingInvoices = pendingResult.count ?? 0;
    const verifiedIds = new Set<number>();
    for (const row of verifiedResult.data ?? []) {
      if (typeof row.registration_id === "number") {
        verifiedIds.add(row.registration_id);
      }
    }

    return {
      pendingInvoices,
      verifiedRegistrants: verifiedIds.size,
    };
  } catch {
    return { pendingInvoices: 0, verifiedRegistrants: 0 };
  }
}
