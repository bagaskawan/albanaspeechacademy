"use client";

import { createContext, useContext, useEffect, useRef } from "react";

export type SettingsFormEntry = { dirty: boolean; save: () => Promise<boolean>; reset: () => void };
type Registry = { set: (id: string, entry: SettingsFormEntry | null) => void };

export const SettingsFormsContext = createContext<Registry | null>(null);

/**
 * Lets a module form join the settings page's shared save bar. Returns true inside /admin/settings,
 * so the form can hide its own submit button; on its standalone page it keeps working as before.
 */
export function useSettingsForm(id: string, entry: SettingsFormEntry) {
  const registry = useContext(SettingsFormsContext);
  const latest = useRef(entry);
  useEffect(() => { latest.current = entry; });
  useEffect(() => {
    registry?.set(id, { dirty: entry.dirty, save: () => latest.current.save(), reset: () => latest.current.reset() });
  }, [registry, id, entry.dirty]);
  useEffect(() => () => registry?.set(id, null), [registry, id]);
  return registry !== null;
}
