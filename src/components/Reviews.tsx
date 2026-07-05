"use client";

import { useState } from "react";
import type { Review } from "@/types";
import { useApp, useT } from "@/lib/store";
import { getService, getServicesForBarber } from "@/data/mockData";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} / 5`} className="text-gold tracking-tight">
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/** Read-only list of reviews. */
export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const t = useT();
  if (reviews.length === 0) {
    return <p className="text-sm text-muted">{t("noReviews")}</p>;
  }
  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const svc = r.serviceId ? getService(r.serviceId) : undefined;
        return (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-cream">{r.customerName}</p>
              <Stars rating={r.rating} />
            </div>
            {svc && (
              <p className="mt-0.5 text-xs font-medium text-teal">{svc.name}</p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-cream/80">{r.text}</p>
            <p className="mt-2 text-xs text-muted">
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Review submission form; appends to the barber's reviews on submit. */
export function ReviewForm({ barberId }: { barberId: string }) {
  const t = useT();
  const { addReview } = useApp();
  const services = getServicesForBarber(barberId);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [serviceId, setServiceId] = useState<string>("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    addReview(barberId, name.trim(), rating, text.trim(), serviceId || null);
    setSubmitted(true);
    setName("");
    setText("");
    setServiceId("");
    setRating(5);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-4">
      {submitted && (
        <p
          role="status"
          className="rounded-2xl border border-teal/40 bg-teal/10 px-4 py-3 font-semibold text-teal"
        >
          ✓ {t("reviewThanks")}
        </p>
      )}

      <div>
        <label className="label" htmlFor="rev-name">
          {t("yourName")} <span className="text-coral">*</span>
        </label>
        <input
          id="rev-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <span className="label">{t("ratingLabel")}</span>
        <div className="flex gap-1" role="radiogroup" aria-label={t("ratingLabel")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} / 5`}
              onClick={() => setRating(n)}
              className={`text-3xl transition-transform active:scale-90 ${
                n <= rating ? "text-gold" : "text-line"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="rev-service">
          {t("serviceReceived")}
        </label>
        <select
          id="rev-service"
          className="input"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">—</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="rev-text">
          {t("commentLabel")} <span className="text-coral">*</span>
        </label>
        <textarea
          id="rev-text"
          className="input min-h-24"
          placeholder={t("commentPlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        {t("submitReview")}
      </button>
    </form>
  );
}
