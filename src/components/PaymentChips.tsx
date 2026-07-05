"use client";

import type { PaymentMethod } from "@/types";
import { useT } from "@/lib/store";
import type { TranslationKey } from "@/lib/i18n";

export const PAYMENT_LABEL_KEY: Record<PaymentMethod, TranslationKey> = {
  cash: "cash",
  zelle: "zelle",
  cashapp: "cashapp",
  card: "card",
};

export const PAYMENT_ICON: Record<PaymentMethod, string> = {
  cash: "💵",
  zelle: "💜",
  cashapp: "💲",
  card: "💳",
};

/** Read-only list of accepted payment methods. */
export function PaymentBadges({ methods }: { methods: PaymentMethod[] }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {methods.map((m) => (
        <span
          key={m}
          className="pill bg-ink-soft border border-line text-cream/90"
        >
          <span aria-hidden>{PAYMENT_ICON[m]}</span>
          {t(PAYMENT_LABEL_KEY[m])}
        </span>
      ))}
    </div>
  );
}

/** Selectable payment method picker used in queue + booking forms. */
export function PaymentPicker({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethod[];
  value: PaymentMethod | null;
  onChange: (m: PaymentMethod) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("preferredPayment")}>
      {methods.map((m) => {
        const selected = value === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(m)}
            className={`chip justify-center min-h-12 ${
              selected
                ? "border-gold bg-gold/15 text-gold"
                : "border-line bg-ink-soft text-cream/80 hover:border-gold/40"
            }`}
          >
            <span aria-hidden>{PAYMENT_ICON[m]}</span>
            {m === "card" ? t("cardAtShop") : t(PAYMENT_LABEL_KEY[m])}
          </button>
        );
      })}
    </div>
  );
}
