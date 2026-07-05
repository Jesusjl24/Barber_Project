import type { AnalyticsEvent } from "@/types";
import { STORAGE_KEYS, generateId, loadJSON, saveJSON } from "./storage";

// ---------------------------------------------------------------------------
// Lightweight analytics for pilot validation. Events land in localStorage and
// power the /admin metrics view. Swap the sink for Supabase/PostHog later.
// ---------------------------------------------------------------------------

export type EventName =
  | "profile_view"
  | "queue_join"
  | "queue_leave"
  | "booking_created"
  | "booking_cancelled"
  | "queue_status_change"
  | "barber_status_change"
  | "barber_wait_change"
  | "review_submitted"
  | "walk_in_added"
  | "share_link_copied";

const MAX_EVENTS = 2000;

export function trackEvent(
  eventName: EventName,
  properties: AnalyticsEvent["properties"] = {}
): void {
  if (typeof window === "undefined") return;
  const events = loadJSON<AnalyticsEvent[]>(STORAGE_KEYS.analytics, []);
  events.push({
    id: generateId("evt"),
    eventName,
    properties,
    createdAt: new Date().toISOString(),
  });
  // Keep the log bounded so localStorage never fills up.
  saveJSON(STORAGE_KEYS.analytics, events.slice(-MAX_EVENTS));
}

export function getEvents(): AnalyticsEvent[] {
  return loadJSON<AnalyticsEvent[]>(STORAGE_KEYS.analytics, []);
}

export function countEvents(events: AnalyticsEvent[], name: EventName): number {
  return events.filter((e) => e.eventName === name).length;
}
