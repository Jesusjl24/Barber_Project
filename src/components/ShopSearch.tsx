"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp, useT } from "@/lib/store";
import { getBarbersForShop, searchShops } from "@/data/mockData";
import StatusPill from "./StatusPill";

// Customer entry point: find a shop (and its barbers) by city, neighborhood,
// or ZIP. Discovery surfaces facts only — open/closed, queue length, location —
// never ratings or rankings (PRD: relationship-stateful, not extractive).
export default function ShopSearch() {
  const t = useT();
  const { hydrated, getBarber, queueCount } = useApp();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = useMemo(() => searchShops(query), [query]);

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">{t("findShopTitle")}</h1>
        <p className="mt-1 text-muted">{t("findShopSubtitle")}</p>
      </div>

      <input
        type="search"
        className="input"
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t("findShopTitle")}
      />

      {results.length === 0 ? (
        <p className="card p-5 text-center text-muted">{t("noShopsFound")}</p>
      ) : (
        <div className="space-y-3">
          {results.map((shop) => {
            // Merge each barber with live status for the availability summary.
            const shopBarbers = getBarbersForShop(shop.id).map(
              (b) => getBarber(b.id)!
            );
            const availableCount = shopBarbers.filter(
              (b) => b.status === "available"
            ).length;
            const inLine = shopBarbers.reduce(
              (sum, b) => sum + queueCount(b.id),
              0
            );
            return (
              <div key={shop.id} className="card space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-cream">
                      💈 {shop.name}
                    </h2>
                    <p className="text-sm text-muted">
                      {shop.neighborhood}, {shop.city}, {shop.state} {shop.zip}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="pill bg-ink-soft border border-line text-cream/90">
                    {t("barbersCount", { n: shopBarbers.length })}
                  </span>
                  {availableCount > 0 && (
                    <span className="pill bg-teal/10 border border-teal/30 text-teal">
                      ● {t("availableNowCount", { n: availableCount })}
                    </span>
                  )}
                  {inLine > 0 && (
                    <span className="pill bg-gold/10 border border-gold/30 text-gold">
                      {inLine} {t("peopleWaiting")}
                    </span>
                  )}
                </div>

                {/* Barber name strip — the shop card still leads with people */}
                <p className="truncate text-sm text-muted">
                  {shopBarbers.map((b) => b.displayName).join(" · ")}
                </p>

                <Link href={`/shop/${shop.id}`} className="btn-primary w-full">
                  {t("viewShop")}
                </Link>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
