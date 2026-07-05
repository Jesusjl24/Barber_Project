"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Appointment, PaymentMethod } from "@/types";
import { useApp, useT } from "@/lib/store";
import { getService, getServicesForBarber } from "@/data/mockData";
import { PaymentPicker, PAYMENT_LABEL_KEY } from "./PaymentChips";

const OPEN_HOUR = 10; // shop opens 10:00
const CLOSE_HOUR = 19; // last slot ends by 19:00
const SLOT_STEP_MINUTES = 30;
const DAYS_AHEAD = 7;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function BookingForm({ barberId }: { barberId: string }) {
  const t = useT();
  const { hydrated, getBarber, appointments, bookAppointment, cancelAppointment, lang } =
    useApp();

  const [serviceId, setServiceId] = useState("");
  const [dateOffset, setDateOffset] = useState(0);
  const [slot, setSlot] = useState<string | null>(null); // ISO start time
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      out.push(d);
    }
    return out;
  }, []);

  const selectedService = serviceId ? getService(serviceId) : undefined;

  // Open slots for the selected day: 30-min grid, service must fit before
  // close, must be in the future, and must not overlap an existing booking.
  const slots = useMemo(() => {
    if (!selectedService) return [];
    const day = days[dateOffset];
    const duration = selectedService.durationMinutes;
    const now = Date.now();

    const taken = appointments.filter(
      (a) =>
        a.barberId === barberId &&
        dayKey(new Date(a.startTime)) === dayKey(day) &&
        (a.status === "requested" || a.status === "confirmed" || a.status === "arrived")
    );

    const out: string[] = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_STEP_MINUTES) {
        const start = new Date(day);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + duration * 60_000);
        if (start.getTime() <= now) continue;
        if (end.getHours() + end.getMinutes() / 60 > CLOSE_HOUR) continue;
        const overlaps = taken.some((a) => {
          const aStart = new Date(a.startTime).getTime();
          const aEnd = new Date(a.endTime).getTime();
          return start.getTime() < aEnd && end.getTime() > aStart;
        });
        if (!overlaps) out.push(start.toISOString());
      }
    }
    return out;
  }, [selectedService, days, dateOffset, appointments, barberId]);

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const barber = getBarber(barberId);
  if (!barber) {
    return <p className="pt-10 text-center text-muted">{t("notFound")}</p>;
  }

  const services = getServicesForBarber(barberId);
  const locale = lang === "es" ? "es-US" : "en-US";

  // --- Confirmation state ---------------------------------------------------
  if (confirmed) {
    const svc = getService(confirmed.serviceId);
    const start = new Date(confirmed.startTime);
    return (
      <div className="space-y-6 pt-6">
        <div className="card space-y-4 p-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal/15 text-3xl">
            📅
          </div>
          <h1 className="text-2xl font-black text-cream">{t("bookingConfirmed")}</h1>
          <p className="text-muted">
            {t("bookingConfirmedBody", {
              name: barber.displayName,
              date: start.toLocaleDateString(locale, {
                weekday: "long",
                month: "short",
                day: "numeric",
              }),
              time: start.toLocaleTimeString(locale, {
                hour: "numeric",
                minute: "2-digit",
              }),
              payment: t(PAYMENT_LABEL_KEY[confirmed.paymentMethodSelected]),
            })}
          </p>
          {svc && (
            <p className="text-lg font-bold text-gold">
              {svc.name} · {svc.priceDisplay}
            </p>
          )}
        </div>

        <p className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold/90">
          {t("mvpSmsNote")}
        </p>

        <div className="grid gap-3">
          <Link href="/me" className="btn-primary">
            🎟️ {t("navMyVisits")}
          </Link>
          <Link href={`/b/${barberId}`} className="btn-secondary">
            {t("backToProfile")}
          </Link>
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              cancelAppointment(confirmed.id);
              setConfirmed(null);
              setSlot(null);
            }}
          >
            {t("cancelBooking")}
          </button>
        </div>
      </div>
    );
  }

  // --- Booking form ----------------------------------------------------------
  const canSubmit =
    !!selectedService && !!slot && name.trim() && phone.trim() && !!payment;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !selectedService || !slot || !payment) return;
    const end = new Date(
      new Date(slot).getTime() + selectedService.durationMinutes * 60_000
    ).toISOString();
    const appt = bookAppointment({
      barberId,
      customerName: name.trim(),
      phone: phone.trim(),
      serviceId: selectedService.id,
      startTime: slot,
      endTime: end,
      paymentMethodSelected: payment,
      notes: notes.trim() || undefined,
    });
    setConfirmed(appt);
  }

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">{t("bookingTitle")}</h1>
        <p className="mt-1 text-muted">{barber.displayName}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-4">
        {/* 1. Service */}
        <div>
          <span className="label">
            1 · {t("selectService")} <span className="text-coral">*</span>
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
                  onClick={() => {
                    setServiceId(s.id);
                    setSlot(null);
                  }}
                  className={`chip w-full justify-between min-h-12 ${
                    selected
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-line bg-ink-soft text-cream/80 hover:border-gold/40"
                  }`}
                >
                  <span>
                    {s.name}
                    <span className="ml-2 text-xs opacity-70">
                      {s.durationMinutes} {t("min")}
                    </span>
                  </span>
                  <span className="font-bold">{s.priceDisplay}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Date */}
        <div>
          <span className="label">
            2 · {t("selectDate")} <span className="text-coral">*</span>
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d, i) => {
              const selected = dateOffset === i;
              const label =
                i === 0
                  ? t("today")
                  : i === 1
                    ? t("tomorrow")
                    : d.toLocaleDateString(locale, { weekday: "short" });
              return (
                <button
                  key={dayKey(d)}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setDateOffset(i);
                    setSlot(null);
                  }}
                  className={`chip shrink-0 flex-col gap-0 px-4 py-2 ${
                    selected
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-line bg-ink-soft text-cream/80"
                  }`}
                >
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-base font-bold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Time */}
        <div>
          <span className="label">
            3 · {t("selectTime")} <span className="text-coral">*</span>
          </span>
          {!selectedService ? (
            <p className="text-sm text-muted">{t("selectService")} ↑</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted">{t("noSlots")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => {
                const selected = slot === s;
                const d = new Date(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSlot(s)}
                    className={`chip justify-center px-2 ${
                      selected
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-line bg-ink-soft text-cream/80"
                    }`}
                  >
                    {d.toLocaleTimeString(locale, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Contact */}
        <div className="grid gap-4">
          <div>
            <label className="label" htmlFor="b-name">
              {t("yourName")} <span className="text-coral">*</span>
            </label>
            <input
              id="b-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="b-phone">
              {t("phoneNumber")} <span className="text-coral">*</span>
            </label>
            <input
              id="b-phone"
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
        </div>

        {/* 5. Payment */}
        <div>
          <span className="label">
            4 · {t("preferredPayment")} <span className="text-coral">*</span>
          </span>
          <PaymentPicker
            methods={barber.paymentMethods}
            value={payment}
            onChange={setPayment}
          />
          <p className="mt-2 text-xs text-muted">{t("noPrepay")}</p>
        </div>

        {/* 6. Note */}
        <div>
          <label className="label" htmlFor="b-notes">
            {t("optionalNote")}
          </label>
          <textarea
            id="b-notes"
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
          {t("confirmBooking")}
        </button>
      </form>

      <Link href={`/b/${barberId}`} className="btn-ghost w-full">
        ← {t("backToProfile")}
      </Link>
    </div>
  );
}
