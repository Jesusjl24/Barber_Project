// ---------------------------------------------------------------------------
// MiBarbero data model.
// Shaped like the future Supabase schema so the localStorage layer can be
// swapped for real tables without touching UI code.
// ---------------------------------------------------------------------------

export type Language = "en" | "es";

export type PaymentMethod = "cash" | "zelle" | "cashapp" | "card";

export type AvailabilityStatus = "available" | "busy" | "off";

export type QueueEntryStatus =
  | "waiting"
  | "notified"
  | "in_chair"
  | "completed"
  | "no_show"
  | "cancelled";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";

export type QueueSource = "walk_in" | "link" | "admin";

export type UserRole = "customer" | "barber" | "shop_owner" | "admin";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  languagePreference: Language;
  createdAt: string;
}

export interface BarberProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  photoUrl: string | null;
  /** Short initials used for the avatar placeholder */
  initials: string;
  specialty: string;
  languages: Language[];
  instagramUrl: string;
  whatsappNumber: string;
  paymentMethods: PaymentMethod[];
  ratingAverage: number;
  isVerified: boolean;
  currentShopId: string;
  status: AvailabilityStatus;
  estimatedWaitMinutes: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  description: string;
}

export interface Service {
  id: string;
  barberId: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceDisplay: string;
  depositRequired: boolean;
  active: boolean;
}

export interface QueueEntry {
  id: string;
  barberId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  status: QueueEntryStatus;
  quotedWaitMinutes: number;
  position: number;
  paymentMethodSelected: PaymentMethod;
  source: QueueSource;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  barberId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  /** ISO datetime */
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paymentMethodSelected: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  barberId: string;
  customerName: string;
  rating: number;
  text: string;
  serviceId: string | null;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  properties: Record<string, string | number | boolean | null>;
  createdAt: string;
}

/** Live per-barber state the barber controls from the dashboard. */
export interface BarberLiveState {
  status: AvailabilityStatus;
  estimatedWaitMinutes: number;
}

/** Editable profile fields the barber can change from the dashboard. */
export interface BarberProfileEdits {
  displayName?: string;
  bio?: string;
  specialty?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
}
