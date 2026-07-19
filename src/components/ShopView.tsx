"use client";

import Link from "next/link";
import { useApp, useT } from "@/lib/store";
import { getBarbersForShop } from "@/data/mockData";
import BarberCard from "./BarberCard";

// A shop's public front door: the shop's identity up top, then its barbers —
// each one a door to their own page, line, and bookings.
export default function ShopView({ shopId }: { shopId: string }) {
  const t = useT();
  const { hydrated, getBarber, getShopResolved } = useApp();

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const shop = getShopResolved(shopId);
  if (!shop) {
    return (
      <div className="pt-10 text-center">
        <p className="text-lg text-muted">{t("notFound")}</p>
        <Link href="/shop" className="btn-secondary mt-4">
          {t("findShopTitle")}
        </Link>
      </div>
    );
  }

  const shopBarbers = getBarbersForShop(shopId).map((b) => getBarber(b.id)!);

  return (
    <div className="space-y-6 pt-4">
      {/* Shop header */}
      <section className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-gold/30 via-coral/20 to-teal/25" />
        <div className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              💈
            </span>
            <h1 className="text-2xl font-black text-cream">{shop.name}</h1>
          </div>
          <p className="text-sm text-muted">
            {shop.address} · {shop.neighborhood}, {shop.city}, {shop.state}{" "}
            {shop.zip}
          </p>
          <p className="text-sm text-muted">{shop.phone}</p>
          <p className="text-[15px] text-cream/80">{shop.description}</p>
          <span className="pill bg-teal/10 border border-teal/30 text-teal">
            ✓ {t("walkInsWelcome")}
          </span>
        </div>
      </section>

      {/* Barbers */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-cream">
          {t("shopBarbersTitle", { shop: shop.name })}
        </h2>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {shopBarbers.map((b) => (
            <BarberCard key={b.id} barber={b} />
          ))}
        </div>
      </section>

      <p className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold/90">
        💡 {t("shopFollowNote")}
      </p>
    </div>
  );
}
