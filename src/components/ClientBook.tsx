"use client";

import { useApp, useT } from "@/lib/store";
import { trackEvent } from "@/lib/analytics";

function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replace(/"/g, '""');
          return /[",\n]/.test(cell) ? `"${escaped}"` : escaped;
        })
        .join(",")
    )
    .join("\r\n");
}

// The barber's portable client book (PRD G3): a rollup of who's visited,
// how often, and when — always exportable client-side, with no dependency
// on a backend or on staying at the same shop.
export default function ClientBook({ barberId }: { barberId: string }) {
  const t = useT();
  const { clientsFor } = useApp();
  const clients = clientsFor(barberId);

  function handleExport() {
    const header = ["Name", "Phone", "Visits", "Last Visit", "Last Service"];
    const rows = clients.map((c) => [
      c.name,
      c.phone,
      String(c.visitCount),
      new Date(c.lastVisitAt).toLocaleDateString(),
      c.lastServiceName,
    ]);
    const csv = toCsv([header, ...rows]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mibarbero-clients-${barberId}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackEvent("client_list_exported", { barberId, count: clients.length });
  }

  return (
    <section className="card space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-cream">
          👥 {t("myClients")} <span className="text-muted">({clients.length})</span>
        </h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={clients.length === 0}
          className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          ⬇️ {t("exportCsv")}
        </button>
      </div>
      <p className="text-xs text-muted">{t("clientBookNote")}</p>

      {clients.length === 0 ? (
        <p className="text-sm text-muted">{t("noClientsYet")}</p>
      ) : (
        <div className="-mx-4 max-h-80 divide-y divide-line/60 overflow-y-auto px-4">
          {clients.map((c) => (
            <div
              key={c.phone}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-cream">{c.name}</p>
                <p className="truncate text-xs text-muted">
                  {c.phone}
                  {c.lastServiceName ? ` · ${c.lastServiceName}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-gold">
                  {c.visitCount === 1 ? t("oneVisit") : `${c.visitCount} ${t("visits")}`}
                </p>
                <p className="text-xs text-muted">
                  {t("lastVisit")}: {new Date(c.lastVisitAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
