"use client";

import Link from "next/link";
import { useApp, useT } from "@/lib/store";
import BarberCard from "@/components/BarberCard";
import { getBarbersForShop, shops } from "@/data/mockData";

export default function HomePage() {
  const t = useT();
  const { hydrated, getBarber } = useApp();

  return (
    <div className="space-y-8 pt-4">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-cream">
          {t("heroTitle")}
        </h1>
        <p className="text-lg text-muted">{t("heroSubtitle")}</p>
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-teal/10 border border-teal/30 text-teal">
            ✓ {t("noAppDownload")}
          </span>
          <span className="pill bg-gold/10 border border-gold/30 text-gold">
            💵 {t("payYourWay")}
          </span>
          <span className="pill bg-ink-soft border border-line text-cream/90">
            📲 {t("joinBeforePullUp")}
          </span>
        </div>
      </section>

      {/* Find your barber (search entry point) */}
      <Link
        href="/shop"
        className="card flex items-center gap-3 p-4 text-muted transition-colors hover:border-gold/50"
      >
        <span aria-hidden className="text-lg">
          🔍
        </span>
        <span className="text-base">{t("searchPlaceholder")}</span>
      </Link>

      {/* Featured shop's barbers */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-cream">
            {t("shopBarbersTitle", { shop: shops[0].name })}
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-gold">
            {t("findShopTitle")} →
          </Link>
        </div>
        {hydrated ? (
          <div className="space-y-3">
            {getBarbersForShop(shops[0].id).map((b) => (
              <BarberCard key={b.id} barber={getBarber(b.id)!} />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t("loading")}</p>
        )}
      </section>

      {/* For barbers */}
      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-bold text-gold">{t("forBarbers")}</h2>
        <p className="text-muted">{t("forBarbersPitch")}</p>
        <Link href="/dashboard" className="btn-secondary w-full">
          ✂️ {t("openDashboard")}
        </Link>
      </section>

      {/* For shop owners */}
      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-bold text-teal">{t("forOwners")}</h2>
        <p className="text-muted">{t("forOwnersPitch")}</p>
        <Link href="/owner" className="btn-secondary w-full">
          💈 {t("openOwnerView")}
        </Link>
      </section>
    </div>
  );
}
