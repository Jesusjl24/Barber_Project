"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityStatus,
  BarberLiveState,
  BarberProfile,
  BarberProfileEdits,
  ClientRecord,
  Language,
  PaymentMethod,
  QueueEntry,
  QueueEntryStatus,
  Shop,
  ShopEdits,
} from "@/types";
import {
  barbers,
  getService,
  getShop,
  seedAppointments,
  seedQueue,
} from "@/data/mockData";
import { STORAGE_KEYS, generateId, loadJSON, saveJSON } from "./storage";
import { trackEvent } from "./analytics";
import { translate, type TranslationKey } from "./i18n";

// ---------------------------------------------------------------------------
// Global app store. Hydrates from localStorage on mount (seeding demo data on
// first run) and persists every mutation. This is the single write path — the
// future Supabase repository replaces the bodies of these actions.
// ---------------------------------------------------------------------------

interface JoinQueueInput {
  barberId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  paymentMethodSelected: PaymentMethod;
  notes?: string;
  source?: QueueEntry["source"];
}

interface BookAppointmentInput {
  barberId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  paymentMethodSelected: PaymentMethod;
  notes?: string;
}

interface AppStore {
  hydrated: boolean;
  lang: Language;
  setLang: (lang: Language) => void;

  queue: QueueEntry[];
  appointments: Appointment[];
  myQueueEntryIds: string[];
  myAppointmentIds: string[];

  /** Mock profile merged with barber edits + live status/wait. */
  getBarber: (id: string) => BarberProfile | undefined;
  allBarbers: () => BarberProfile[];
  /** Mock shop merged with any owner edits. */
  getShopResolved: (id: string) => Shop | undefined;
  /** Waiting + notified entries, oldest first (position order). */
  waitingQueue: (barberId: string) => QueueEntry[];
  queueCount: (barberId: string) => number;
  /** Position (1-based) of a queue entry among the active line, or null. */
  positionOf: (entryId: string) => number | null;
  /** Estimated wait in minutes for someone joining the line right now. */
  waitForNewJoiner: (barberId: string) => number;
  /** The barber's own portable client book, most recent visit first. */
  clientsFor: (barberId: string) => ClientRecord[];

  joinQueue: (input: JoinQueueInput) => QueueEntry;
  leaveQueue: (entryId: string) => void;
  setQueueStatus: (entryId: string, status: QueueEntryStatus) => void;
  addWalkIn: (barberId: string, customerName: string, serviceId: string) => void;

  bookAppointment: (input: BookAppointmentInput) => Appointment;
  cancelAppointment: (id: string) => void;
  setAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  setBarberStatus: (barberId: string, status: AvailabilityStatus) => void;
  setBarberWait: (barberId: string, minutes: number) => void;
  saveProfileEdits: (barberId: string, edits: BarberProfileEdits) => void;
  saveShopEdits: (shopId: string, edits: ShopEdits) => void;

  resetDemo: () => void;
}

const AppContext = createContext<AppStore | null>(null);

const ACTIVE_QUEUE_STATUSES: QueueEntryStatus[] = ["waiting", "notified"];

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<Language>("en");
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [liveState, setLiveState] = useState<Record<string, BarberLiveState>>({});
  const [profileEdits, setProfileEdits] = useState<
    Record<string, BarberProfileEdits>
  >({});
  const [shopEdits, setShopEdits] = useState<Record<string, ShopEdits>>({});
  const [myQueueEntryIds, setMyQueueEntryIds] = useState<string[]>([]);
  const [myAppointmentIds, setMyAppointmentIds] = useState<string[]>([]);

  // Hydrate once on mount; seed demo data on first run.
  useEffect(() => {
    const seeded = loadJSON<boolean>(STORAGE_KEYS.seeded, false);
    if (!seeded) {
      saveJSON(STORAGE_KEYS.queue, seedQueue);
      saveJSON(STORAGE_KEYS.appointments, seedAppointments);
      saveJSON(STORAGE_KEYS.seeded, true);
    }
    setQueue(loadJSON<QueueEntry[]>(STORAGE_KEYS.queue, seedQueue));
    setAppointments(
      loadJSON<Appointment[]>(STORAGE_KEYS.appointments, seedAppointments)
    );
    setLiveState(
      loadJSON<Record<string, BarberLiveState>>(STORAGE_KEYS.barberLiveState, {})
    );
    setProfileEdits(
      loadJSON<Record<string, BarberProfileEdits>>(
        STORAGE_KEYS.barberProfileEdits,
        {}
      )
    );
    setShopEdits(loadJSON<Record<string, ShopEdits>>(STORAGE_KEYS.shopEdits, {}));
    setMyQueueEntryIds(loadJSON<string[]>(STORAGE_KEYS.myQueueEntryIds, []));
    setMyAppointmentIds(loadJSON<string[]>(STORAGE_KEYS.myAppointmentIds, []));
    setLangState(loadJSON<Language>(STORAGE_KEYS.language, "en"));
    setHydrated(true);
  }, []);

  // Persist each slice after hydration.
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.queue, queue);
  }, [hydrated, queue]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.appointments, appointments);
  }, [hydrated, appointments]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.barberLiveState, liveState);
  }, [hydrated, liveState]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.barberProfileEdits, profileEdits);
  }, [hydrated, profileEdits]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.shopEdits, shopEdits);
  }, [hydrated, shopEdits]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.myQueueEntryIds, myQueueEntryIds);
  }, [hydrated, myQueueEntryIds]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.myAppointmentIds, myAppointmentIds);
  }, [hydrated, myAppointmentIds]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    saveJSON(STORAGE_KEYS.language, next);
  }, []);

  const getBarber = useCallback(
    (id: string): BarberProfile | undefined => {
      const base = barbers.find((b) => b.id === id);
      if (!base) return undefined;
      const live = liveState[id];
      const edits = profileEdits[id];
      return {
        ...base,
        ...edits,
        status: live?.status ?? base.status,
        estimatedWaitMinutes:
          live?.estimatedWaitMinutes ?? base.estimatedWaitMinutes,
      };
    },
    [liveState, profileEdits]
  );

  const allBarbers = useCallback(
    () => barbers.map((b) => getBarber(b.id)!).filter(Boolean),
    [getBarber]
  );

  const getShopResolved = useCallback(
    (id: string): Shop | undefined => {
      const base = getShop(id);
      if (!base) return undefined;
      return { ...base, ...shopEdits[id] };
    },
    [shopEdits]
  );

  const waitingQueue = useCallback(
    (barberId: string) =>
      queue
        .filter(
          (q) =>
            q.barberId === barberId && ACTIVE_QUEUE_STATUSES.includes(q.status)
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [queue]
  );

  const queueCount = useCallback(
    (barberId: string) => waitingQueue(barberId).length,
    [waitingQueue]
  );

  const positionOf = useCallback(
    (entryId: string): number | null => {
      const entry = queue.find((q) => q.id === entryId);
      if (!entry || !ACTIVE_QUEUE_STATUSES.includes(entry.status)) return null;
      const line = waitingQueue(entry.barberId);
      const idx = line.findIndex((q) => q.id === entryId);
      return idx === -1 ? null : idx + 1;
    },
    [queue, waitingQueue]
  );

  const waitForNewJoiner = useCallback(
    (barberId: string): number => {
      const barber = getBarber(barberId);
      if (!barber) return 0;
      const line = waitingQueue(barberId);
      // Barber's quoted wait covers the person currently up next; each person
      // already in line adds their service duration on top.
      const lineMinutes = line.reduce((sum, entry) => {
        const svc = getService(entry.serviceId);
        return sum + (svc?.durationMinutes ?? 30);
      }, 0);
      return barber.estimatedWaitMinutes + lineMinutes;
    },
    [getBarber, waitingQueue]
  );

  const clientsFor = useCallback(
    (barberId: string): ClientRecord[] => {
      // Walk-ins added without a phone number can't be deduped/tracked as a
      // returning client — they're excluded from the book, same as a real
      // barber wouldn't have a way to recognize a repeat walk-in by name alone.
      const visits: {
        phone: string;
        name: string;
        serviceId: string;
        at: string;
      }[] = [];
      for (const q of queue) {
        if (q.barberId !== barberId || !q.phone.trim()) continue;
        if (q.status === "cancelled" || q.status === "no_show") continue;
        visits.push({
          phone: q.phone,
          name: q.customerName,
          serviceId: q.serviceId,
          at: q.createdAt,
        });
      }
      for (const a of appointments) {
        if (a.barberId !== barberId || !a.phone.trim()) continue;
        if (a.status === "cancelled" || a.status === "no_show") continue;
        visits.push({
          phone: a.phone,
          name: a.customerName,
          serviceId: a.serviceId,
          at: a.startTime,
        });
      }

      const byPhone = new Map<string, ClientRecord>();
      for (const v of visits) {
        const key = v.phone.replace(/\D/g, "");
        if (!key) continue;
        const existing = byPhone.get(key);
        const svc = getService(v.serviceId);
        if (!existing || v.at > existing.lastVisitAt) {
          byPhone.set(key, {
            phone: v.phone,
            name: v.name,
            visitCount: (existing?.visitCount ?? 0) + 1,
            lastVisitAt: v.at,
            lastServiceName: svc?.name ?? "",
          });
        } else {
          existing.visitCount += 1;
        }
      }
      return [...byPhone.values()].sort((a, b) =>
        b.lastVisitAt.localeCompare(a.lastVisitAt)
      );
    },
    [queue, appointments]
  );

  const joinQueue = useCallback(
    (input: JoinQueueInput): QueueEntry => {
      const quoted = waitForNewJoiner(input.barberId);
      const entry: QueueEntry = {
        id: generateId("q"),
        barberId: input.barberId,
        customerName: input.customerName,
        phone: input.phone,
        serviceId: input.serviceId,
        status: "waiting",
        quotedWaitMinutes: quoted,
        position: queueCount(input.barberId) + 1,
        paymentMethodSelected: input.paymentMethodSelected,
        source: input.source ?? "link",
        notes: input.notes,
        createdAt: new Date().toISOString(),
      };
      setQueue((prev) => [...prev, entry]);
      if (entry.source === "link") {
        setMyQueueEntryIds((prev) => [...prev, entry.id]);
      }
      trackEvent("queue_join", {
        barberId: input.barberId,
        serviceId: input.serviceId,
        payment: input.paymentMethodSelected,
        source: entry.source,
      });
      return entry;
    },
    [queueCount, waitForNewJoiner]
  );

  const setQueueStatus = useCallback(
    (entryId: string, status: QueueEntryStatus) => {
      setQueue((prev) =>
        prev.map((q) => (q.id === entryId ? { ...q, status } : q))
      );
      trackEvent("queue_status_change", { entryId, status });
    },
    []
  );

  const leaveQueue = useCallback(
    (entryId: string) => {
      setQueue((prev) =>
        prev.map((q) => (q.id === entryId ? { ...q, status: "cancelled" } : q))
      );
      trackEvent("queue_leave", { entryId });
    },
    []
  );

  const addWalkIn = useCallback(
    (barberId: string, customerName: string, serviceId: string) => {
      joinQueue({
        barberId,
        customerName,
        phone: "",
        serviceId,
        paymentMethodSelected: "cash",
        source: "walk_in",
      });
      trackEvent("walk_in_added", { barberId });
    },
    [joinQueue]
  );

  const bookAppointment = useCallback(
    (input: BookAppointmentInput): Appointment => {
      const appt: Appointment = {
        id: generateId("appt"),
        ...input,
        status: "requested",
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [...prev, appt]);
      setMyAppointmentIds((prev) => [...prev, appt.id]);
      trackEvent("booking_created", {
        barberId: input.barberId,
        serviceId: input.serviceId,
        payment: input.paymentMethodSelected,
      });
      return appt;
    },
    []
  );

  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
    trackEvent("booking_cancelled", { id });
  }, []);

  const setAppointmentStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    },
    []
  );

  const setBarberStatus = useCallback(
    (barberId: string, status: AvailabilityStatus) => {
      setLiveState((prev) => {
        const base = barbers.find((b) => b.id === barberId);
        return {
          ...prev,
          [barberId]: {
            status,
            estimatedWaitMinutes:
              prev[barberId]?.estimatedWaitMinutes ??
              base?.estimatedWaitMinutes ??
              0,
          },
        };
      });
      trackEvent("barber_status_change", { barberId, status });
    },
    []
  );

  const setBarberWait = useCallback((barberId: string, minutes: number) => {
    const clamped = Math.max(0, Math.min(240, minutes));
    setLiveState((prev) => {
      const base = barbers.find((b) => b.id === barberId);
      return {
        ...prev,
        [barberId]: {
          status: prev[barberId]?.status ?? base?.status ?? "off",
          estimatedWaitMinutes: clamped,
        },
      };
    });
    trackEvent("barber_wait_change", { barberId, minutes: clamped });
  }, []);

  const saveProfileEdits = useCallback(
    (barberId: string, edits: BarberProfileEdits) => {
      setProfileEdits((prev) => ({
        ...prev,
        [barberId]: { ...prev[barberId], ...edits },
      }));
    },
    []
  );

  const saveShopEdits = useCallback((shopId: string, edits: ShopEdits) => {
    setShopEdits((prev) => ({
      ...prev,
      [shopId]: { ...prev[shopId], ...edits },
    }));
  }, []);

  const resetDemo = useCallback(() => {
    if (typeof window === "undefined") return;
    for (const key of Object.values(STORAGE_KEYS)) {
      window.localStorage.removeItem(key);
    }
    window.location.reload();
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      hydrated,
      lang,
      setLang,
      queue,
      appointments,
      myQueueEntryIds,
      myAppointmentIds,
      getBarber,
      allBarbers,
      getShopResolved,
      waitingQueue,
      queueCount,
      positionOf,
      waitForNewJoiner,
      clientsFor,
      joinQueue,
      leaveQueue,
      setQueueStatus,
      addWalkIn,
      bookAppointment,
      cancelAppointment,
      setAppointmentStatus,
      setBarberStatus,
      setBarberWait,
      saveProfileEdits,
      saveShopEdits,
      resetDemo,
    }),
    [
      hydrated,
      lang,
      setLang,
      queue,
      appointments,
      myQueueEntryIds,
      myAppointmentIds,
      getBarber,
      allBarbers,
      getShopResolved,
      waitingQueue,
      queueCount,
      positionOf,
      waitForNewJoiner,
      clientsFor,
      joinQueue,
      leaveQueue,
      setQueueStatus,
      addWalkIn,
      bookAppointment,
      cancelAppointment,
      setAppointmentStatus,
      setBarberStatus,
      setBarberWait,
      saveProfileEdits,
      saveShopEdits,
      resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/** Convenience translation hook bound to the current language. */
export function useT() {
  const { lang } = useApp();
  return useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang]
  );
}
