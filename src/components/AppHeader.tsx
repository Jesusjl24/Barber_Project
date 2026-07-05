"use client";

import Link from "next/link";
import LanguageToggle from "./LanguageToggle";

export default function AppHeader() {
  return (
    <header className="pt-safe sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-line/60">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="MiBarbero home">
          {/* Wordmark: scissors glyph + name */}
          <span className="grid size-9 place-items-center rounded-xl bg-gold text-ink text-lg font-black">
            ✂
          </span>
          <span className="text-xl font-extrabold tracking-tight text-cream">
            Mi<span className="text-gold">Barbero</span>
          </span>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
