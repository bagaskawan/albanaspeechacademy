import { requireAdminMember } from "@/lib/server/admin-guard";
import RekeningClient, { BankAccount } from "./RekeningClient";

export const dynamic = "force-dynamic";

export default async function RekeningPage() {
  const supabase = await requireAdminMember();

  const { data, error } = await supabase
    .from("bank_accounts")
    .select("id, bank, account_number, holder, active")
    .order("active", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    throw new Error("Data rekening belum bisa dimuat: " + error.message);
  }

  const accounts = (data || []) as BankAccount[];
  const isAdminSuper = supabase.adminUser.role === "adminsuper";

  return <RekeningClient accounts={accounts} isAdminSuper={isAdminSuper} />;
}
