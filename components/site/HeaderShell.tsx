"use client";

import { useState, type ReactNode } from "react";

/** Client shell for the header: owns the mobile menu state only. */
export function HeaderShell({
  brand,
  links,
  actions,
}: {
  brand: ReactNode;
  links: ReactNode;
  actions: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-void text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        {brand}
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {links}
        </nav>
        <div className="hidden items-center gap-4 md:flex">{actions}</div>
        <button
          type="button"
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="flex flex-col gap-4 border-t border-ash px-6 py-6 md:hidden"
        >
          {links}
          <div className="flex flex-col items-start gap-4 border-t border-ash pt-4">
            {actions}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
