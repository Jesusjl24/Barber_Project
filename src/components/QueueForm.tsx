"use client";

import Link from "next/link";
import { useState } from "react";
import type { PaymentMethod } from "@/types";
import { useApp, useT } from "@/lib/store";
import { getService, getServicesForBarber } from "@/data/mockData";
import { PaymentPicker } from "./PaymentChips";

export default function QueueForm({ barberId }: { barberId: string }) {
  const t = useT();
  const {
    hydrated,
    getBarber,
    queue,
    myQueueEntryIds,
    positionOf,
    waitingQueue,
    waitForNewJoiner,
    joinQueue,
    leaveQueue,
  } = useApp();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState("");
  const [justJoinedId, setJustJoinedId] = useState<string | null>(null);

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const barber = getBarber(barberId);
  if (!barber) {
    return <p className="pt-10 text-center text-muted">{t("notFound")}</p>;
  }

  const services = getServicesForBarber(barberId);

  // An entry created on this device that is still active in this barber's line.
  const myEntry = queue.find(
    (q) =>
      q.barberId === barberId &&
      myQueueEntryIds.includes(q.id) &&
      (q.status === "waiting" || q.status === "notified")
  );

  // --- State 1: already in line (or just joined) → confirmation screen -----
  if (myEntry) {
    const pos = positionOf(myEntry.id) ?? 1;
    const total = waitingQueue(barberId).length;
    const svc = getService(myEntry.serviceId);
    const justJoined = myEntry.id === justJoinedId;

    return (
      <div className="space-y-6 pt-6">
        <div className="card space-y-4 p-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal/15 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-black text-cream">{t("youreInLine")}</h1>
          <p className="text-muted">
            {t("inLineFor", { name: barber.displayName })}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl bg-ink-soft border border-line p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                {t("yourPosition")}
              </p>
              <p className="mt-1 text-2xl font-black text-gold">
                {t("positionOf", { pos, total })}
              </p>
            </div>
            <div className="rounded-2xl bg-ink-soft border border-line p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                {t("estimatedWait")}
              </p>
              <p className="mt-1 text-2xl font-black text-gold">
                {myEntry.quotedWaitMinutes} {t("min")}
              </p>
            </div>
          </div>

          {svc && (
            <p className="text-sm text-muted">
              {svc.name} · {svc.priceDisplay}
            </p>
          )}
          {!justJoined && (
            <p className="text-sm text-teal font-semibold">{t("alreadyInLine")}</p>
          )}
        </div>

        <p className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold/90">
          {t("mvpSmsNote")}
        </p>

        <div className="grid grid-cols-1 gap-3">
          <Link href={`/b/${barberId}`} className="btn-secondary">
            {t("backToProfile")}
          </Link>
          <button
            type="button"
            onClick={() => leaveQueue(myEntry.id)}
            className="btn-danger"
          >
            {t("leaveQueue")}
          </button>
        </div>
      </div>
    );
  }

  // --- State 2: barber not working → line closed ---------------------------
  if (barber.status === "off") {
    return (
      <div className="space-y-5 pt-10 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-card text-3xl">
          🌙
        </div>
        <h1 className="text-2xl font-black text-cream">{t("queueClosedTitle")}</h1>
        <p className="text-muted">
          {t("queueClosedBody", { name: barber.displayName })}
        </p>
        <div className="grid gap-3 pt-2">
          <Link href={`/b/${barberId}/book`} className="btn-primary">
            {t("bookLater")}
          </Link>
          <Link href={`/b/${barberId}`} className="btn-secondary">
            {t("backToProfile")}
          </Link>
        </div>
      </div>
    );
  }

  // --- State 3: join form ---------------------------------------------------
  const canSubmit =
    name.trim().length > 0 && phone.trim().length > 0 && serviceId && payment;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !payment) return;
    const entry = joinQueue({
      barberId,
      customerName: name.trim(),
      phone: phone.trim(),
      serviceId,
      paymentMethodSelected: payment,
      notes: notes.trim() || undefined,
    });
    setJustJoinedId(entry.id);
  }

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">{t("joinQueueTitle")}</h1>
        <p className="mt-1 text-muted">
          {barber.displayName} · {t("estimatedWait")}:{" "}
          <span className="font-semibold text-gold">
            {waitForNewJoiner(barberId)} {t("min")}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-4">
        <div>
          <label className="label" htmlFor="q-name">
            {t("yourName")} <span className="text-coral">*</span>
          </label>
          <input
            id="q-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="q-phone">
            {t("phoneNumber")} <span className="text-coral">*</span>
          </label>
          <input
            id="q-phone"
            className="input"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="(555) 555-5555"
            required
          />
        </div>

        <div>
          <span className="label">
            {t("serviceRequested")} <span className="text-coral">*</span>
          </span>
          <div className="space-y-2">
            {services.map((s) => {
              const selected = serviceId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setServiceId(s.id)}
                  className={`chip w-full justify-between min-h-12 ${
                    selected
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-line bg-ink-soft text-cream/80 hover:border-gold/40"
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="font-bold">{s.priceDisplay}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="label">
            {t("preferredPayment")} <span className="text-coral">*</span>
          </span>
          <PaymentPicker
            methods={barber.paymentMethods}
            value={payment}
            onChange={setPayment}
          />
          <p className="mt-2 text-xs text-muted">{t("noPrepay")}</p>
        </div>

        <div>
          <label className="label" htmlFor="q-notes">
            {t("notesOptional")}
          </label>
          <textarea
            id="q-notes"
            className="input min-h-20"
            placeholder={t("notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("confirmJoinQueue")}
        </button>
      </form>

      <Link href={`/b/${barberId}`} className="btn-ghost w-full">
        ← {t("backToProfile")}
      </Link>
    </div>
  );
}
