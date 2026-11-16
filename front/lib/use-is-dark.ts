"use client";

import { useSyncExternalStore } from "react";

// The theme lives in the `dark` class on <html> (ThemeScript, ThemeToggle); next-themes is not mounted.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
}
