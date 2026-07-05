"use client";

import { useEffect, useState } from "react";
import type { AnalyticsEvent } from "@/types";
import { useApp, useT } from "@/lib/store";
import { countEvents, getEvents } from "@/lib/analytics";
import { barbers } from "@/data/mockData";
import { PAYMENT_ICON, PAYMENT_LABEL_KEY } from "./PaymentChips";
import type { PaymentMethod } from "@/types";

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-black tabular-nums ${accent ? "text-gold" : "text-cream"}`}>
        {value}
      </p>
    </div>
  );
}

export default function MetricsDashboard() {
  const t = useT();
  const { hydrated, queue, appointments, resetDemo } = useApp();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (hydrated) setEvents(getEvents());
  }, [hydrated, queue, appointments]);

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  // --- Compute pilot metrics from persisted data + event log ----------------
  const profileViews = countEvents(events, "profile_view");
  const queueJoins = queue.length;
  const bookings = appointments.length;
  const completedCuts =
    queue.filter((q) => q.status === "completed").length +
    appointments.filter((a) => a.status === "completed").length;
  const noShows =
    queue.filter((q) => q.status === "no_show").length +
    appointments.filter((a) => a.status === "no_show").length;

  // Repeat customers: same phone number appears in 2+ interactions.
  const phoneCounts = new Map<string, number>();
  for (const item of [...queue, ...appointments]) {
    const phone = item.phone.replace(/\D/g, "");
    if (!phone) continue;
    phoneCounts.set(phone, (phoneCounts.get(phone) ?? 0) + 1);
  }
  const repeatCustomers = [...phoneCounts.values()].filter((n) => n > 1).length;

  // Most selected payment method across all interactions.
  const payCounts = new Map<PaymentMethod, number>();
  for (const item of [...queue, ...appointments]) {
    payCounts.set(
      item.paymentMethodSelected,
      (payCounts.get(item.paymentMethodSelected) ?? 0) + 1
    );
  }
  const topPayment = [...payCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  // A barber counts as "activated" once they've touched the dashboard
  // (status/wait change or manual walk-in) on this device.
  const activatedIds = new Set(
    events
      .filter((e) =>
        ["barber_status_change", "barber_wait_change", "walk_in_added"].includes(
          e.eventName
        )
      )
      .map((e) => String(e.properties.barberId))
  );

  const pilotCriteria = [
    t("pilotCriteria1"),
    t("pilotCriteria2"),
    t("pilotCriteria3"),
    t("pilotCriteria4"),
  ];

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">📊 {t("metricsTitle")}</h1>
        <p className="mt-1 text-muted">{t("metricsSubtitle")}</p>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <StatTile label={t("profileViews")} value={profileViews} accent />
        <StatTile label={t("queueJoins")} value={queueJoins} accent />
        <StatTile label={t("bookings")} value={bookings} />
        <StatTile label={t("completedCuts")} value={completedCuts} />
        <StatTile label={t("noShows")} value={noShows} />
        <StatTile label={t("repeatCustomers")} value={repeatCustomers} />
      </section>

      {/* Top payment method */}
      <section className="card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("topPayment")}
        </p>
        <p className="mt-1 text-2xl font-black text-cream">
          {topPayment
            ? `${PAYMENT_ICON[topPayment[0]]} ${t(PAYMENT_LABEL_KEY[topPayment[0]])} (${topPayment[1]})`
            : "—"}
        </p>
      </section>

      {/* Barber activation */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-cream">{t("barberActivation")}</h2>
        <div className="card divide-y divide-line/60">
          {barbers.map((b) => {
            const active = activatedIds.has(b.id);
            return (
              <div key={b.id} className="flex items-center justify-between p-4">
                <p className="font-semibold text-cream">{b.displayName}</p>
                <span
                  className={`pill text-xs ${
                    active
                      ? "bg-teal/10 border border-teal/30 text-teal"
                      : "bg-ink-soft border border-line text-muted"
                  }`}
                >
                  {active ? `✓ ${t("active")}` : t("inactive")}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pilot success criteria */}
      <section className="card space-y-3 border-gold/40 p-5">
        <h2 className="text-lg font-bold text-gold">🎯 {t("pilotCriteriaTitle")}</h2>
        <ul className="space-y-2">
          {pilotCriteria.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-cream/85">
              <span aria-hidden className="mt-0.5 text-gold">
                ◆
              </span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("resetDemoConfirm"))) resetDemo();
        }}
        className="btn-danger w-full"
      >
        {t("resetDemoData")}
      </button>
    </div>
  );
}
