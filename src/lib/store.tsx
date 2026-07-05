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
  Language,
  PaymentMethod,
  QueueEntry,
  QueueEntryStatus,
  Review,
} from "@/types";
import {
  barbers,
  getService,
  seedAppointments,
  seedQueue,
  seedReviews,
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
  reviews: Review[];
  myQueueEntryIds: string[];
  myAppointmentIds: string[];

  /** Mock profile merged with barber edits + live status/wait. */
  getBarber: (id: string) => BarberProfile | undefined;
  allBarbers: () => BarberProfile[];
  /** Waiting + notified entries, oldest first (position order). */
  waitingQueue: (barberId: string) => QueueEntry[];
  queueCount: (barberId: string) => number;
  /** Position (1-based) of a queue entry among the active line, or null. */
  positionOf: (entryId: string) => number | null;
  /** Estimated wait in minutes for someone joining the line right now. */
  waitForNewJoiner: (barberId: string) => number;
  reviewsFor: (barberId: string) => Review[];

  joinQueue: (input: JoinQueueInput) => QueueEntry;
  leaveQueue: (entryId: string) => void;
  setQueueStatus: (entryId: string, status: QueueEntryStatus) => void;
  addWalkIn: (barberId: string, customerName: string, serviceId: string) => void;

  bookAppointment: (input: BookAppointmentInput) => Appointment;
  cancelAppointment: (id: string) => void;
  setAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  addReview: (
    barberId: string,
    customerName: string,
    rating: number,
    text: string,
    serviceId: string | null
  ) => void;

  setBarberStatus: (barberId: string, status: AvailabilityStatus) => void;
  setBarberWait: (barberId: string, minutes: number) => void;
  saveProfileEdits: (barberId: string, edits: BarberProfileEdits) => void;

  resetDemo: () => void;
}

const AppContext = createContext<AppStore | null>(null);

const ACTIVE_QUEUE_STATUSES: QueueEntryStatus[] = ["waiting", "notified"];

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<Language>("en");
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [liveState, setLiveState] = useState<Record<string, BarberLiveState>>({});
  const [profileEdits, setProfileEdits] = useState<
    Record<string, BarberProfileEdits>
  >({});
  const [myQueueEntryIds, setMyQueueEntryIds] = useState<string[]>([]);
  const [myAppointmentIds, setMyAppointmentIds] = useState<string[]>([]);

  // Hydrate once on mount; seed demo data on first run.
  useEffect(() => {
    const seeded = loadJSON<boolean>(STORAGE_KEYS.seeded, false);
    if (!seeded) {
      saveJSON(STORAGE_KEYS.queue, seedQueue);
      saveJSON(STORAGE_KEYS.appointments, seedAppointments);
      saveJSON(STORAGE_KEYS.reviews, seedReviews);
      saveJSON(STORAGE_KEYS.seeded, true);
    }
    setQueue(loadJSON<QueueEntry[]>(STORAGE_KEYS.queue, seedQueue));
    setAppointments(
      loadJSON<Appointment[]>(STORAGE_KEYS.appointments, seedAppointments)
    );
    setReviews(loadJSON<Review[]>(STORAGE_KEYS.reviews, seedReviews));
    setLiveState(
      loadJSON<Record<string, BarberLiveState>>(STORAGE_KEYS.barberLiveState, {})
    );
    setProfileEdits(
      loadJSON<Record<string, BarberProfileEdits>>(
        STORAGE_KEYS.barberProfileEdits,
        {}
      )
    );
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
    if (hydrated) saveJSON(STORAGE_KEYS.reviews, reviews);
  }, [hydrated, reviews]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.barberLiveState, liveState);
  }, [hydrated, liveState]);
  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEYS.barberProfileEdits, profileEdits);
  }, [hydrated, profileEdits]);
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

  const reviewsFor = useCallback(
    (barberId: string) =>
      reviews
        .filter((r) => r.barberId === barberId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reviews]
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

  const addReview = useCallback(
    (
      barberId: string,
      customerName: string,
      rating: number,
      text: string,
      serviceId: string | null
    ) => {
      const review: Review = {
        id: generateId("rev"),
        barberId,
        customerName,
        rating,
        text,
        serviceId,
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [review, ...prev]);
      trackEvent("review_submitted", { barberId, rating });
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
      reviews,
      myQueueEntryIds,
      myAppointmentIds,
      getBarber,
      allBarbers,
      waitingQueue,
      queueCount,
      positionOf,
      waitForNewJoiner,
      reviewsFor,
      joinQueue,
      leaveQueue,
      setQueueStatus,
      addWalkIn,
      bookAppointment,
      cancelAppointment,
      setAppointmentStatus,
      addReview,
      setBarberStatus,
      setBarberWait,
      saveProfileEdits,
      resetDemo,
    }),
    [
      hydrated,
      lang,
      setLang,
      queue,
      appointments,
      reviews,
      myQueueEntryIds,
      myAppointmentIds,
      getBarber,
      allBarbers,
      waitingQueue,
      queueCount,
      positionOf,
      waitForNewJoiner,
      reviewsFor,
      joinQueue,
      leaveQueue,
      setQueueStatus,
      addWalkIn,
      bookAppointment,
      cancelAppointment,
      setAppointmentStatus,
      addReview,
      setBarberStatus,
      setBarberWait,
      saveProfileEdits,
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
