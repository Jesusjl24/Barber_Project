"use client";

import { useState } from "react";
import type { AvailabilityStatus } from "@/types";
import { useApp, useT } from "@/lib/store";
import { barbers, getService, getServicesForBarber } from "@/data/mockData";
import { trackEvent } from "@/lib/analytics";
import StatusPill from "./StatusPill";
import Avatar from "./Avatar";
import { PAYMENT_ICON } from "./PaymentChips";

const WAIT_PRESETS = [0, 15, 30, 45, 60, 90];

export default function BarberDashboard() {
  const t = useT();
  const {
    hydrated,
    getBarber,
    waitingQueue,
    queue,
    appointments,
    setQueueStatus,
    addWalkIn,
    setBarberStatus,
    setBarberWait,
    setAppointmentStatus,
    saveProfileEdits,
  } = useApp();

  const [barberId, setBarberId] = useState(barbers[0].id);
  const [walkInName, setWalkInName] = useState("");
  const [walkInServiceId, setWalkInServiceId] = useState("");
  const [copied, setCopied] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  // Profile edit fields, initialized when the form opens.
  const [editName, setEditName] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const barber = getBarber(barberId)!;
  const services = getServicesForBarber(barberId);
  const line = waitingQueue(barberId);
  const inChair = queue.filter(
    (q) => q.barberId === barberId && q.status === "in_chair"
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysBookings = appointments
    .filter(
      (a) =>
        a.barberId === barberId &&
        new Date(a.startTime).toISOString().slice(0, 10) === todayKey &&
        a.status !== "cancelled"
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/b/${barberId}`
      : `/b/${barberId}`;

  function openProfileForm() {
    setEditName(barber.displayName);
    setEditSpecialty(barber.specialty);
    setEditBio(barber.bio);
    setEditInstagram(barber.instagramUrl);
    setEditWhatsapp(barber.whatsappNumber);
    setProfileSaved(false);
    setShowProfileForm(true);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    saveProfileEdits(barberId, {
      displayName: editName.trim() || barber.displayName,
      specialty: editSpecialty.trim(),
      bio: editBio.trim(),
      instagramUrl: editInstagram.trim(),
      whatsappNumber: editWhatsapp.trim(),
    });
    setProfileSaved(true);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch {
      // Clipboard can be blocked in some webviews — the URL stays visible to
      // copy manually, so we still show the confirmation.
    }
    trackEvent("share_link_copied", { barberId });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAddWalkIn(e: React.FormEvent) {
    e.preventDefault();
    if (!walkInName.trim() || !walkInServiceId) return;
    addWalkIn(barberId, walkInName.trim(), walkInServiceId);
    setWalkInName("");
    setWalkInServiceId("");
  }

  const statusOptions: {
    value: AvailabilityStatus;
    label: string;
    activeClass: string;
  }[] = [
    {
      value: "available",
      label: t("statusAvailable"),
      activeClass: "border-teal bg-teal/15 text-teal",
    },
    {
      value: "busy",
      label: t("statusBusy"),
      activeClass: "border-gold bg-gold/15 text-gold",
    },
    {
      value: "off",
      label: t("statusOff"),
      activeClass: "border-coral bg-coral/15 text-coral",
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">{t("barberDashboard")}</h1>
        <p className="mt-1 text-muted">{t("dashboardSubtitle")}</p>
      </div>

      {/* Barber switcher (stands in for auth in the MVP) */}
      <div>
        <span className="label">{t("viewingAs")}</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {barbers.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={barberId === b.id}
              onClick={() => setBarberId(b.id)}
              className={`chip shrink-0 ${
                barberId === b.id
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line bg-ink-soft text-cream/80"
              }`}
            >
              {b.displayName.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Status toggle */}
      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-cream">{t("yourStatus")}</h2>
          <StatusPill status={barber.status} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={barber.status === opt.value}
              onClick={() => setBarberStatus(barberId, opt.value)}
              className={`chip min-h-14 justify-center text-center text-sm leading-tight ${
                barber.status === opt.value
                  ? opt.activeClass
                  : "border-line bg-ink-soft text-cream/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Wait time */}
      <section className="card space-y-3 p-4">
        <h2 className="font-bold text-cream">{t("waitTime")}</h2>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="-5 min"
            onClick={() => setBarberWait(barberId, barber.estimatedWaitMinutes - 5)}
            className="btn-secondary size-14 shrink-0 rounded-2xl p-0 text-2xl"
          >
            −
          </button>
          <p className="text-4xl font-black text-gold tabular-nums">
            {barber.estimatedWaitMinutes}
            <span className="ml-1 text-base font-semibold text-muted">
              {t("min")}
            </span>
          </p>
          <button
            type="button"
            aria-label="+5 min"
            onClick={() => setBarberWait(barberId, barber.estimatedWaitMinutes + 5)}
            className="btn-secondary size-14 shrink-0 rounded-2xl p-0 text-2xl"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {WAIT_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setBarberWait(barberId, m)}
              className={`chip px-3 py-1.5 text-xs ${
                barber.estimatedWaitMinutes === m
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line bg-ink-soft text-cream/70"
              }`}
            >
              {m} {t("min")}
            </button>
          ))}
        </div>
      </section>

      {/* Share link */}
      <section className="card space-y-3 p-4">
        <h2 className="font-bold text-cream">{t("shareProfile")}</h2>
        <p className="truncate rounded-2xl border border-line bg-ink-soft px-4 py-3 text-sm text-muted">
          {profileUrl}
        </p>
        <button type="button" onClick={handleCopyLink} className="btn-primary w-full">
          {copied ? `✓ ${t("linkCopied")}` : `🔗 ${t("copyLink")}`}
        </button>
        <p className="text-xs text-muted">{t("shareHint")}</p>
      </section>

      {/* Live queue */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-cream">
          {t("liveQueue")}{" "}
          <span className="text-muted">({line.length + inChair.length})</span>
        </h2>

        {[...inChair, ...line].length === 0 ? (
          <p className="card p-4 text-sm text-muted">{t("emptyQueue")}</p>
        ) : (
          <div className="space-y-3">
            {[...inChair, ...line].map((entry, idx) => {
              const svc = getService(entry.serviceId);
              const isInChair = entry.status === "in_chair";
              return (
                <div key={entry.id} className="card space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-cream">
                        {!isInChair && (
                          <span className="mr-1.5 text-gold">
                            #{idx - inChair.length + 1}
                          </span>
                        )}
                        {entry.customerName}
                      </p>
                      <p className="text-sm text-muted">
                        {svc?.name ?? "—"} · {PAYMENT_ICON[entry.paymentMethodSelected]}{" "}
                        {entry.source === "walk_in" ? "🚶" : "🔗"} ·{" "}
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {entry.notes && (
                        <p className="mt-1 text-xs italic text-muted">“{entry.notes}”</p>
                      )}
                    </div>
                    <span
                      className={`pill text-xs ${
                        isInChair
                          ? "bg-gold/15 border border-gold/40 text-gold"
                          : "bg-teal/10 border border-teal/30 text-teal"
                      }`}
                    >
                      {isInChair ? t("inChair") : t("waiting")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {isInChair ? (
                      <button
                        type="button"
                        onClick={() => setQueueStatus(entry.id, "completed")}
                        className="btn bg-teal/15 text-teal border border-teal/40 col-span-3 min-h-12 text-sm"
                      >
                        ✓ {t("markComplete")}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setQueueStatus(entry.id, "in_chair")}
                          className="btn bg-gold/15 text-gold border border-gold/40 min-h-12 px-2 text-sm"
                        >
                          💈 {t("markInChair")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQueueStatus(entry.id, "no_show")}
                          className="btn-danger min-h-12 px-2 text-sm"
                        >
                          {t("markNoShow")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQueueStatus(entry.id, "cancelled")}
                          className="btn-secondary min-h-12 px-2 text-sm"
                        >
                          {t("markCancelled")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add walk-in */}
        <form onSubmit={handleAddWalkIn} className="card space-y-3 p-4">
          <h3 className="font-bold text-cream">➕ {t("addWalkIn")}</h3>
          <input
            aria-label={t("walkInName")}
            className="input"
            placeholder={t("walkInName")}
            value={walkInName}
            onChange={(e) => setWalkInName(e.target.value)}
          />
          <select
            aria-label={t("serviceRequested")}
            className="input"
            value={walkInServiceId}
            onChange={(e) => setWalkInServiceId(e.target.value)}
          >
            <option value="">{t("serviceRequested")}…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.priceDisplay}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!walkInName.trim() || !walkInServiceId}
            className="btn-primary w-full disabled:opacity-40"
          >
            {t("add")}
          </button>
        </form>
      </section>

      {/* Today's bookings */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-cream">{t("todaysBookings")}</h2>
        {todaysBookings.length === 0 ? (
          <p className="card p-4 text-sm text-muted">{t("noBookingsToday")}</p>
        ) : (
          <div className="space-y-3">
            {todaysBookings.map((a) => {
              const svc = getService(a.serviceId);
              return (
                <div key={a.id} className="card space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-cream">
                        {new Date(a.startTime).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        — {a.customerName}
                      </p>
                      <p className="text-sm text-muted">
                        {svc?.name ?? "—"} · {PAYMENT_ICON[a.paymentMethodSelected]}
                      </p>
                      {a.notes && (
                        <p className="mt-1 text-xs italic text-muted">“{a.notes}”</p>
                      )}
                    </div>
                    <span className="pill bg-ink-soft border border-line text-xs text-cream/80">
                      {a.status === "requested" && `⏳ ${t("requested")}`}
                      {a.status === "confirmed" && `✓ ${t("confirmedStatus")}`}
                      {a.status === "arrived" && `📍 ${t("arrived")}`}
                      {a.status === "completed" && `✂ ${t("completed")}`}
                      {a.status === "no_show" && `⚠ ${t("noShow")}`}
                      {a.status === "cancelled" && t("cancelled")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {a.status === "requested" && (
                      <button
                        type="button"
                        onClick={() => setAppointmentStatus(a.id, "confirmed")}
                        className="btn bg-teal/15 text-teal border border-teal/40 min-h-12 px-2 text-sm"
                      >
                        {t("confirm")}
                      </button>
                    )}
                    {(a.status === "requested" || a.status === "confirmed") && (
                      <button
                        type="button"
                        onClick={() => setAppointmentStatus(a.id, "arrived")}
                        className="btn bg-gold/15 text-gold border border-gold/40 min-h-12 px-2 text-sm"
                      >
                        {t("arrived")}
                      </button>
                    )}
                    {a.status === "arrived" && (
                      <button
                        type="button"
                        onClick={() => setAppointmentStatus(a.id, "completed")}
                        className="btn bg-teal/15 text-teal border border-teal/40 min-h-12 px-2 text-sm"
                      >
                        ✓ {t("markComplete")}
                      </button>
                    )}
                    {a.status !== "completed" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAppointmentStatus(a.id, "no_show")}
                          className="btn-danger min-h-12 px-2 text-sm"
                        >
                          {t("markNoShow")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppointmentStatus(a.id, "cancelled")}
                          className="btn-secondary min-h-12 px-2 text-sm"
                        >
                          {t("markCancelled")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit profile */}
      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials={barber.initials} seed={barber.id} />
            <div>
              <p className="font-bold text-cream">{barber.displayName}</p>
              <p className="text-sm text-muted">{barber.specialty}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (showProfileForm ? setShowProfileForm(false) : openProfileForm())}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {showProfileForm ? t("close") : `✏️ ${t("editProfile")}`}
          </button>
        </div>

        {showProfileForm && (
          <form onSubmit={handleSaveProfile} className="space-y-3 border-t border-line pt-4">
            {profileSaved && (
              <p
                role="status"
                className="rounded-2xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal"
              >
                ✓ {t("profileSaved")}
              </p>
            )}
            <div>
              <label className="label" htmlFor="p-name">
                {t("displayName")}
              </label>
              <input
                id="p-name"
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-specialty">
                {t("specialtyLabel")}
              </label>
              <input
                id="p-specialty"
                className="input"
                value={editSpecialty}
                onChange={(e) => setEditSpecialty(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-bio">
                {t("bioLabel")}
              </label>
              <textarea
                id="p-bio"
                className="input min-h-24"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-ig">
                {t("instagramLabel")}
              </label>
              <input
                id="p-ig"
                className="input"
                value={editInstagram}
                onChange={(e) => setEditInstagram(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-wa">
                {t("whatsappLabel")}
              </label>
              <input
                id="p-wa"
                className="input"
                value={editWhatsapp}
                onChange={(e) => setEditWhatsapp(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {t("saveProfile")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
