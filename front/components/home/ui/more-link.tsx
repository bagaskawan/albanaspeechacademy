import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function MoreLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group type-small inline-flex min-h-11 items-center gap-1.5 font-medium underline-offset-4 hover:underline ${className}`}
      >
        <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
        <span>{children}</span>
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`group type-small inline-flex min-h-11 items-center gap-1.5 font-medium underline-offset-4 hover:underline ${className}`}
    >
      <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
