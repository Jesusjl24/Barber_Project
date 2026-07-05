"use client";

import { useApp } from "@/lib/store";

export default function LanguageToggle() {
  const { lang, setLang } = useApp();

  return (
    <div
      className="flex rounded-full border border-line bg-ink-soft p-1 text-sm font-semibold"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "en" ? "bg-gold text-ink" : "text-muted hover:text-cream"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("es")}
        aria-pressed={lang === "es"}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "es" ? "bg-gold text-ink" : "text-muted hover:text-cream"
        }`}
      >
        ES
      </button>
    </div>
  );
}
