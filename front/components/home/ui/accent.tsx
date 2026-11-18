import type { ReactNode } from "react";

/** Satu frasa per judul: serif miring berwarna aksen nada. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="accent-italic">{children}</em>;
}
