import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  grid?: boolean;
};

export function Container({
  children,
  grid = false,
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      className={`site-wrapper ${grid ? "site-grid" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

