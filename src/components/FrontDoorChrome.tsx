"use client";

import Link from "next/link";
import LanguageToggle from "./LanguageToggle";

// Chrome for barber/shop-facing "front door" pages (/shop, /b/[barberId]/*).
// Per the product principle "barber-brand-first": MiBarbero's own identity
// recedes to a small icon + footer credit here, so the barber's or shop's
// name (rendered large within the page itself) is what actually dominates
// the screen — the opposite of (app)/layout.tsx's full app-shell chrome.

export function FrontDoorHeader() {
  return (
    <header className="pt-safe sticky top-0 z-40 bg-ink/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link
          href="/"
          aria-label="MiBarbero home"
          className="grid size-8 place-items-center rounded-lg bg-gold/90 text-ink text-sm font-black opacity-80 transition-opacity hover:opacity-100"
        >
          ✂
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}

export function FrontDoorFooter() {
  return (
    <footer className="px-4 py-6 text-center">
      <Link
        href="/"
        className="text-xs font-medium text-muted/70 hover:text-muted"
      >
        Powered by <span className="font-semibold">MiBarbero</span>
      </Link>
    </footer>
  );
}
