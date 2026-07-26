import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "signal" | "outline-void" | "outline-paper";
type Size = "md" | "lg";

// Buttons invert on hover rather than dim (DESIGN.md).
const variantClasses: Record<Variant, string> = {
  signal:
    "bg-signal text-void border border-void hover:bg-void hover:text-signal",
  "outline-void":
    "bg-transparent text-paper border border-paper hover:bg-paper hover:text-void",
  "outline-paper":
    "bg-transparent text-void border border-void hover:bg-void hover:text-paper",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-body-l",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-r font-medium transition-colors duration-200 select-none";

export function Button({
  variant = "signal",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "signal",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
