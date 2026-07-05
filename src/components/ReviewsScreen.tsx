"use client";

import Link from "next/link";
import { useApp, useT } from "@/lib/store";
import ReviewList, { ReviewForm } from "./Reviews";

export default function ReviewsScreen({ barberId }: { barberId: string }) {
  const t = useT();
  const { hydrated, getBarber, reviewsFor } = useApp();

  if (!hydrated) return <p className="pt-6 text-muted">{t("loading")}</p>;

  const barber = getBarber(barberId);
  if (!barber) {
    return <p className="pt-10 text-center text-muted">{t("notFound")}</p>;
  }

  const reviews = reviewsFor(barberId);

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-2xl font-black text-cream">
          {t("reviewsFor", { name: barber.displayName })}
        </h1>
        <p className="mt-1 text-muted">
          <span className="font-bold text-gold">★ {barber.ratingAverage.toFixed(1)}</span>{" "}
          · {reviews.length} {t("reviews").toLowerCase()}
        </p>
      </div>

      <p className="text-sm text-muted">{t("reviewNote")}</p>

      <ReviewForm barberId={barberId} />

      <ReviewList reviews={reviews} />

      <Link href={`/b/${barberId}`} className="btn-ghost w-full">
        ← {t("backToProfile")}
      </Link>
    </div>
  );
}
