"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp, useT } from "@/lib/store";
import { getBarbersForShop, shops } from "@/data/mockData";
import Avatar from "./Avatar";
import StatusPill from "./StatusPill";

// Shop Owner surface (PRD 1.5): aggregate visibility across every chair in
// the shop — who's booked, who's in line, total volume — plus shop-profile
// editing. Deliberately view-only on barber activity: owners see totals,
// never a barber's client book, and never control a barber's line.
export default function OwnerDashboard() {
  const t = useT();
  const {
    hydrated,
    getBarber,
    getShopResolved,
    waitingQueue,
    queue,
    appointments,
    saveShopEdits,
  } = useApp();

  // Shop switcher stands in for owner auth, same pattern as the barber
  // switcher in BarberDashboard.
  const [shopId, setShopId] = useState(shops[0].id);
  const [showShopForm, setShowShopForm] = useState(false);
  const [shopSaved, setShopSaved] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPhone, setEditPhone] = useState("");

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const shop = getShopResolved(shopId)!;
  const roster = getBarbersForShop(shopId).map((b) => getBarber(b.id)!);
  const rosterIds = new Set(roster.map((b) => b.id));
  const todayKey = new Date().toISOString().slice(0, 10);

  const inLineNow = roster.reduce(
    (sum, b) => sum + waitingQueue(b.id).length,
    0
  );
  const bookingsToday = appointments.filter(
    (a) =>
      rosterIds.has(a.barberId) &&
      new Date(a.startTime).toISOString().slice(0, 10) === todayKey &&
      a.status !== "cancelled"
  );
  const cutsToday =
    queue.filter(
      (q) =>
        rosterIds.has(q.barberId) &&
        q.status === "completed" &&
        q.createdAt.slice(0, 10) === todayKey
    ).length +
    bookingsToday.filter((a) => a.status === "completed").length;

  function openShopForm() {
    setEditName(shop.name);
    setEditDescription(shop.description);
    setEditPhone(shop.phone);
    setShopSaved(false);
    setShowShopForm(true);
  }

  function handleSaveShop(e: React.FormEvent) {
    e.preventDefault();
    saveShopEdits(shopId, {
      name: editName.trim() || shop.name,
      description: editDescription.trim(),
      phone: editPhone.trim(),
    });
    setShopSaved(true);
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">💈 {t("ownerDashboard")}</h1>
        <p className="mt-1 text-muted">{t("ownerSubtitle")}</p>
      </div>

      {/* Shop switcher (stands in for owner auth) */}
      <div>
        <span className="label">{t("managingShop")}</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shops.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={shopId === s.id}
              onClick={() => setShopId(s.id)}
              className={`chip shrink-0 ${
                shopId === s.id
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line bg-ink-soft text-cream/80"
              }`}
            >
              {getShopResolved(s.id)!.name}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate stats across chairs */}
      <section className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-3xl font-black text-teal tabular-nums">{inLineNow}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("inLineNow")}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-black text-gold tabular-nums">
            {bookingsToday.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("bookingsToday")}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-black text-cream tabular-nums">{cutsToday}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("cutsToday")}
          </p>
        </div>
      </section>

      {/* Roster */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-cream">
          {t("chairs")} <span className="text-muted">({roster.length})</span>
        </h2>
        <div className="space-y-3">
          {roster.map((b) => {
            const line = waitingQueue(b.id).length;
            const barberBookingsToday = bookingsToday.filter(
              (a) => a.barberId === b.id
            ).length;
            return (
              <div key={b.id} className="card flex items-center gap-3 p-4">
                <Avatar initials={b.initials} seed={b.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-cream">{b.displayName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <StatusPill status={b.status} />
                    <span className="pill bg-ink-soft border border-line text-xs text-cream/80">
                      {line} {t("peopleWaiting")}
                    </span>
                    <span className="pill bg-ink-soft border border-line text-xs text-cream/80">
                      {barberBookingsToday} {t("bookings").toLowerCase()}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/b/${b.id}`}
                  className="btn-secondary shrink-0 px-4 py-2 text-sm"
                >
                  {t("viewBarber")}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold/90">
          🤝 {t("ownerRosterNote")}
        </p>
      </section>

      {/* Shop profile */}
      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-bold text-cream">{t("shopProfile")}</h2>
            <p className="truncate text-sm text-muted">
              {shop.name} · {shop.neighborhood}, {shop.city}
            </p>
          </div>
          <button
            type="button"
            onClick={() => (showShopForm ? setShowShopForm(false) : openShopForm())}
            className="btn-secondary shrink-0 px-4 py-2 text-sm"
          >
            {showShopForm ? t("close") : `✏️ ${t("editProfile")}`}
          </button>
        </div>

        {showShopForm && (
          <form onSubmit={handleSaveShop} className="space-y-3 border-t border-line pt-4">
            {shopSaved && (
              <p
                role="status"
                className="rounded-2xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal"
              >
                ✓ {t("shopSaved")}
              </p>
            )}
            <div>
              <label className="label" htmlFor="s-name">
                {t("shopNameLabel")}
              </label>
              <input
                id="s-name"
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="s-desc">
                {t("shopDescriptionLabel")}
              </label>
              <textarea
                id="s-desc"
                className="input min-h-24"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="s-phone">
                {t("shopPhoneLabel")}
              </label>
              <input
                id="s-phone"
                className="input"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {t("saveShop")}
            </button>
          </form>
        )}

        <Link href={`/shop/${shopId}`} className="btn-ghost w-full border border-line">
          👀 {t("viewPublicShopPage")}
        </Link>
      </section>
    </div>
  );
}
