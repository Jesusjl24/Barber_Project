"use client";

import Link from "next/link";
import { useApp, useT } from "@/lib/store";
import { getService } from "@/data/mockData";

// "My Visits" — the customer-side summary of everything created on this
// device: active queue spots, upcoming bookings, and past activity.
export default function MyVisitsPage() {
  const t = useT();
  const {
    hydrated,
    queue,
    appointments,
    myQueueEntryIds,
    myAppointmentIds,
    getBarber,
    positionOf,
    waitingQueue,
    leaveQueue,
    cancelAppointment,
    lang,
  } = useApp();

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const locale = lang === "es" ? "es-US" : "en-US";
  const myQueue = queue.filter((q) => myQueueEntryIds.includes(q.id));
  const myAppointments = appointments.filter((a) => myAppointmentIds.includes(a.id));

  const activeQueue = myQueue.filter(
    (q) => q.status === "waiting" || q.status === "notified"
  );
  const upcoming = myAppointments
    .filter(
      (a) =>
        (a.status === "requested" || a.status === "confirmed") &&
        new Date(a.endTime).getTime() > Date.now()
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const past = [
    ...myQueue.filter((q) => q.status !== "waiting" && q.status !== "notified"),
    ...myAppointments.filter((a) => !upcoming.includes(a)),
  ];

  const empty =
    activeQueue.length === 0 && upcoming.length === 0 && past.length === 0;

  return (
    <div className="space-y-6 pt-4">
      <h1 className="text-2xl font-black text-cream">{t("myVisitsTitle")}</h1>

      {empty && (
        <div className="card space-y-4 p-6 text-center">
          <span className="text-4xl" aria-hidden>
            💈
          </span>
          <p className="text-muted">{t("myVisitsEmpty")}</p>
          <Link href="/shop" className="btn-primary">
            {t("browseShop")}
          </Link>
        </div>
      )}

      {/* Active queue spots */}
      {activeQueue.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-teal">⏳ {t("currentQueue")}</h2>
          {activeQueue.map((q) => {
            const barber = getBarber(q.barberId);
            const svc = getService(q.serviceId);
            const pos = positionOf(q.id);
            const total = waitingQueue(q.barberId).length;
            return (
              <div key={q.id} className="card space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-cream">{barber?.displayName}</p>
                  <span className="pill bg-teal/10 border border-teal/30 text-teal text-xs">
                    {t("youreInLine")}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {svc?.name} · {t("yourPosition")}:{" "}
                  <span className="font-bold text-gold">
                    {pos ? t("positionOf", { pos, total }) : "—"}
                  </span>{" "}
                  · {t("estimatedWait")}:{" "}
                  <span className="font-bold text-gold">
                    {q.quotedWaitMinutes} {t("min")}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/b/${q.barberId}/queue`} className="btn-secondary text-sm">
                    {t("viewMySpot")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => leaveQueue(q.id)}
                    className="btn-danger text-sm"
                  >
                    {t("leaveQueue")}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Upcoming bookings */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gold">📅 {t("upcomingBooking")}</h2>
          {upcoming.map((a) => {
            const barber = getBarber(a.barberId);
            const svc = getService(a.serviceId);
            const start = new Date(a.startTime);
            return (
              <div key={a.id} className="card space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-cream">{barber?.displayName}</p>
                  <span className="pill bg-gold/10 border border-gold/30 text-gold text-xs">
                    {a.status === "requested" ? t("requested") : t("confirmedStatus")}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {start.toLocaleDateString(locale, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  ·{" "}
                  <span className="font-bold text-gold">
                    {start.toLocaleTimeString(locale, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>{" "}
                  · {svc?.name} {svc && `(${svc.priceDisplay})`}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/b/${a.barberId}`} className="btn-secondary text-sm">
                    {t("backToProfile")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => cancelAppointment(a.id)}
                    className="btn-danger text-sm"
                  >
                    {t("cancelBooking")}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Past activity */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-muted">{t("pastActivity")}</h2>
          {past
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((item) => {
              const barber = getBarber(item.barberId);
              const svc = getService(item.serviceId);
              const isQueueEntry = "position" in item;
              const statusLabel =
                item.status === "completed"
                  ? t("completed")
                  : item.status === "no_show"
                    ? t("noShow")
                    : item.status === "cancelled"
                      ? t("cancelled")
                      : item.status;
              return (
                <div
                  key={item.id}
                  className="card flex items-center justify-between gap-2 p-4 opacity-75"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-cream">
                      {barber?.displayName} · {svc?.name}
                    </p>
                    <p className="text-xs text-muted">
                      {isQueueEntry ? t("liveQueue") : t("bookings")} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <span
                    className={`pill shrink-0 text-xs ${
                      item.status === "completed"
                        ? "bg-teal/10 border border-teal/30 text-teal"
                        : "bg-ink-soft border border-line text-muted"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              );
            })}
        </section>
      )}
    </div>
  );
}
