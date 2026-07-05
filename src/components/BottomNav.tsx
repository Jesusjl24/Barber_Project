"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp, useT } from "@/lib/store";

const tabs = [
  { href: "/", key: "navHome", icon: "🏠" },
  { href: "/shop", key: "navShop", icon: "💈" },
  { href: "/me", key: "navMyVisits", icon: "🎟️" },
  { href: "/dashboard", key: "navDashboard", icon: "✂️" },
  { href: "/admin", key: "navMetrics", icon: "📊" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const { hydrated } = useApp();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-ink/95 backdrop-blur pb-safe"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between md:max-w-2xl">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-gold" : "text-muted hover:text-cream"
              }`}
            >
              <span aria-hidden className="text-lg leading-none">
                {tab.icon}
              </span>
              {/* Suppress label until hydration so SSR/client text matches */}
              <span>{hydrated ? t(tab.key) : " "}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
