"use client";

import type { AvailabilityStatus } from "@/types";
import { useT } from "@/lib/store";

const styles: Record<AvailabilityStatus, string> = {
  available: "bg-teal/15 text-teal border border-teal/30",
  busy: "bg-gold/15 text-gold border border-gold/30",
  off: "bg-muted/10 text-muted border border-line",
};

const dot: Record<AvailabilityStatus, string> = {
  available: "bg-teal animate-pulse",
  busy: "bg-gold",
  off: "bg-muted",
};

const labelKey = {
  available: "statusAvailable",
  busy: "statusBusy",
  off: "statusOff",
} as const;

export default function StatusPill({ status }: { status: AvailabilityStatus }) {
  const t = useT();
  return (
    <span className={`pill ${styles[status]}`}>
      <span aria-hidden className={`size-2 rounded-full ${dot[status]}`} />
      {t(labelKey[status])}
    </span>
  );
}
