"use client";

import Link from "next/link";
import type { BarberProfile } from "@/types";
import { useApp, useT } from "@/lib/store";
import Avatar from "./Avatar";
import StatusPill from "./StatusPill";

export default function BarberCard({ barber }: { barber: BarberProfile }) {
  const t = useT();
  const { queueCount, waitForNewJoiner } = useApp();
  const count = queueCount(barber.id);
  const wait = waitForNewJoiner(barber.id);

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <Avatar initials={barber.initials} seed={barber.id} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-bold text-cream">
              {barber.displayName}
            </h3>
            {barber.isVerified && (
              <span aria-label={t("verified")} title={t("verified")} className="text-teal">
                ✔
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted">{barber.specialty}</p>
          <p className="mt-0.5 text-xs text-muted">
            {t("languagesSpoken")}:{" "}
            {barber.languages
              .map((l) => (l === "en" ? t("langEnglish") : t("langSpanish")))
              .join(" · ")}
          </p>
        </div>
        <span aria-hidden className="text-gold text-sm font-bold">
          ★ {barber.ratingAverage.toFixed(1)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill status={barber.status} />
        {barber.status !== "off" && (
          <>
            <span className="pill bg-ink-soft border border-line text-cream/90">
              ⏱ {wait} {t("min")}
            </span>
            <span className="pill bg-ink-soft border border-line text-cream/90">
              {count === 1 ? t("onePersonWaiting") : `${count} ${t("peopleWaiting")}`}
            </span>
          </>
        )}
      </div>

      <Link href={`/b/${barber.id}`} className="btn-primary mt-4 w-full">
        {t("viewBarber")}
      </Link>
    </div>
  );
}
