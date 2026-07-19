// ---------------------------------------------------------------------------
// LocalStorage persistence layer.
// Every read/write goes through here so the whole layer can be swapped for
// Supabase later (see notes at the bottom) without touching components.
// ---------------------------------------------------------------------------

const PREFIX = "mibarbero:";

export const STORAGE_KEYS = {
  language: `${PREFIX}language`,
  queue: `${PREFIX}queue`,
  appointments: `${PREFIX}appointments`,
  barberLiveState: `${PREFIX}barberLiveState`,
  barberProfileEdits: `${PREFIX}barberProfileEdits`,
  shopEdits: `${PREFIX}shopEdits`,
  analytics: `${PREFIX}analytics`,
  /** IDs of queue entries / appointments created on this device (the "customer") */
  myQueueEntryIds: `${PREFIX}myQueueEntryIds`,
  myAppointmentIds: `${PREFIX}myAppointmentIds`,
  seeded: `${PREFIX}seeded-v1`,
} as const;

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode) — MVP degrades to in-memory state.
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Supabase migration path:
// 1. Create tables mirroring src/types (queue_entries, appointments,
//    barbers, services, shops, analytics_events).
// 2. Replace loadJSON/saveJSON call sites in lib/store.tsx with a small async
//    repository (getQueue(barberId), addQueueEntry(entry), ...) backed by
//    @supabase/supabase-js, and subscribe to realtime changes for live queue.
// 3. Keep this file as the offline/anonymous fallback.
// ---------------------------------------------------------------------------
