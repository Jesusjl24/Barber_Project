"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useApp, useT } from "@/lib/store";
import { getServicesForBarber, getShopForBarber } from "@/data/mockData";
import { trackEvent } from "@/lib/analytics";
import Avatar from "./Avatar";
import StatusPill from "./StatusPill";
import { PaymentBadges } from "./PaymentChips";

export default function BarberProfile({ barberId }: { barberId: string }) {
  const t = useT();
  const {
    hydrated,
    getBarber,
    queueCount,
    waitForNewJoiner,
    myQueueEntryIds,
    queue,
  } = useApp();

  // Count a profile view once per visit (after hydration, so it persists).
  const tracked = useRef(false);
  useEffect(() => {
    if (hydrated && !tracked.current) {
      tracked.current = true;
      trackEvent("profile_view", { barberId });
    }
  }, [hydrated, barberId]);

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const barber = getBarber(barberId);
  if (!barber) {
    return (
      <div className="pt-10 text-center">
        <p className="text-lg text-muted">{t("notFound")}</p>
        <Link href="/shop" className="btn-secondary mt-4">
          {t("browseShop")}
        </Link>
      </div>
    );
  }

  const services = getServicesForBarber(barberId);
  const shop = getShopForBarber(barberId);
  const count = queueCount(barberId);
  const joinWait = waitForNewJoiner(barberId);
  const working = barber.status !== "off";

  const myActiveEntry = queue.find(
    (q) =>
      q.barberId === barberId &&
      myQueueEntryIds.includes(q.id) &&
      (q.status === "waiting" || q.status === "notified")
  );

  const whatsappHref = `https://wa.me/${barber.whatsappNumber.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(`Hola ${barber.displayName}! 💈`)}`;

  return (
    <div className="space-y-6 pt-4">
      {/* Identity */}
      <section className="flex items-start gap-4">
        <Avatar initials={barber.initials} seed={barber.id} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black leading-tight text-cream">
              {barber.displayName}
            </h1>
            {barber.isVerified && (
              <span className="pill bg-teal/10 border border-teal/30 text-teal text-xs">
                ✔ {t("verified")}
              </span>
            )}
          </div>
          {shop && (
            <p className="mt-1 text-sm text-muted">
              <Link href={`/shop/${shop.id}`} className="hover:text-cream">
                {shop.name}
              </Link>{" "}
              · {shop.neighborhood}, {shop.city}
            </p>
          )}
          <p className="mt-1 text-sm text-muted">
            {t("languagesSpoken")}:{" "}
            {barber.languages
              .map((l) => (l === "en" ? t("langEnglish") : t("langSpanish")))
              .join(" · ")}
          </p>
        </div>
      </section>

      <p className="text-[15px] leading-relaxed text-cream/80">{barber.bio}</p>

      {/* Live status */}
      <section className="card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={barber.status} />
          {working && (
            <span className="pill bg-ink-soft border border-line text-cream/90">
              {count === 0
                ? t("noWait")
                : count === 1
                  ? t("onePersonWaiting")
                  : `${count} ${t("peopleWaiting")}`}
            </span>
          )}
        </div>
        {working && (
          <p className="text-2xl font-bold text-cream">
            {t("estimatedWait")}:{" "}
            <span className="text-gold">
              {joinWait} {t("min")}
            </span>
          </p>
        )}
        {myActiveEntry && (
          <Link
            href={`/b/${barberId}/queue`}
            className="block rounded-2xl border border-teal/40 bg-teal/10 px-4 py-3 font-semibold text-teal"
          >
            ✓ {t("youreInLine")} — {t("viewMySpot")} →
          </Link>
        )}
      </section>

      {/* Primary actions */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          href={`/b/${barberId}/queue`}
          className={working ? "btn-primary" : "btn-secondary opacity-60"}
          aria-disabled={!working}
        >
          {t("joinQueue")}
        </Link>
        <Link href={`/b/${barberId}/book`} className="btn-secondary">
          {t("bookLater")}
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          💬 {t("messageWhatsApp")}
        </a>
        <a href="#services" className="btn-secondary">
          {t("viewServices")}
        </a>
      </section>
      {!working && (
        <p className="text-sm text-muted">
          {t("queueClosedBody", { name: barber.displayName })}
        </p>
      )}

      {/* Payments */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {t("acceptedPayments")}
        </h2>
        <PaymentBadges methods={barber.paymentMethods} />
        <p className="text-xs text-muted">{t("noPrepay")}</p>
      </section>

      {/* Services */}
      <section id="services" className="space-y-3 scroll-mt-20">
        <h2 className="text-xl font-bold text-cream">{t("services")}</h2>
        <div className="card divide-y divide-line/60">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-cream">{s.name}</p>
                <p className="text-sm text-muted">
                  {s.description} · {s.durationMinutes} {t("min")}
                </p>
              </div>
              <span className="text-lg font-bold text-gold">{s.priceDisplay}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Social */}
      <section className="flex gap-3">
        <a
          href={barber.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost flex-1 border border-line"
        >
          📸 Instagram
        </a>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 border border-line">
          💬 WhatsApp
        </a>
      </section>

      <p className="pb-2 text-center text-xs text-muted">
        {t("followBarberNote", { name: barber.displayName.split(" ")[0] })}
      </p>
    </div>
  );
}
