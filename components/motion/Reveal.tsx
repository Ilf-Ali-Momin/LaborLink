"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal: fires once, at 20% into the viewport (DESIGN.md).
 * The hidden initial state lives inside the no-preference media query in
 * globals.css, so reduced-motion users simply see the content.
 */
export function Reveal({
  children,
  variant = "rise",
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  variant?: "rise" | "mask";
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${variant === "mask" ? "reveal-mask" : "reveal-rise"} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
