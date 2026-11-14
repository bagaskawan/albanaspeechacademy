import "server-only";

import { hiddenAdminModulesFromStorage } from "@/lib/admin-sidebar";
import { findCmsRow, writeCmsRow } from "./cms-data";

export async function readHiddenAdminModules(accessToken: string): Promise<string[]> {
  const academy = await findCmsRow("academy", accessToken, { id: 1 });
  if (!academy) throw new Error("Profil akademi tidak ditemukan.");
  return hiddenAdminModulesFromStorage(academy.hidden_admin_modules);
}

export async function writeHiddenAdminModules(
  accessToken: string,
  hiddenModuleSlugs: string[],
): Promise<string[]> {
  const rows = await writeCmsRow(
    "academy",
    accessToken,
    { hidden_admin_modules: hiddenModuleSlugs },
    { id: 1 },
  );
  if (!rows[0]) throw new Error("Pengaturan sidebar tidak tersimpan.");
  return hiddenAdminModulesFromStorage(rows[0].hidden_admin_modules);
}
