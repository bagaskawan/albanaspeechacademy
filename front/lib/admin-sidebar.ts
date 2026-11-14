import { adminModules, type AdminModule } from "./admin-modules";

export function parseHiddenAdminModules(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((slug) => typeof slug !== "string")) return null;

  const requested = new Set(value);
  if ([...requested].some((slug) => !adminModules.some((module) => module.slug === slug))) return null;

  return adminModules.filter((module) => requested.has(module.slug)).map((module) => module.slug);
}

export function hiddenAdminModulesFromStorage(value: unknown): string[] {
  return parseHiddenAdminModules(value) ?? [];
}

export function visibleAdminModules(hiddenModuleSlugs: readonly string[]): AdminModule[] {
  const hidden = new Set(hiddenModuleSlugs);
  return adminModules.filter((module) => !hidden.has(module.slug));
}
