import type {
  Appointment,
  BarberProfile,
  QueueEntry,
  Service,
  Shop,
} from "@/types";

// ---------------------------------------------------------------------------
// Seed data for the MVP. This is what a pilot shop would look like on day one.
// When Supabase is connected, this becomes the seed script.
// ---------------------------------------------------------------------------

export const shops: Shop[] = [
  {
    id: "shop-caribe",
    name: "Caribe Cuts",
    address: "1580 St. Nicholas Ave",
    neighborhood: "Washington Heights",
    city: "New York",
    state: "NY",
    zip: "10032",
    lat: 40.8417,
    lng: -73.9394,
    phone: "+1 (212) 555-0148",
    description:
      "Walk-ins welcome. Book your barber or join the line before you pull up.",
  },
  {
    id: "shop-quisqueya",
    name: "Quisqueya Barbershop",
    address: "420 Bergenline Ave",
    neighborhood: "Union City",
    city: "Union City",
    state: "NJ",
    zip: "07087",
    lat: 40.7795,
    lng: -74.0246,
    phone: "+1 (201) 555-0176",
    description:
      "Family-run since 2011. Every barber runs his own book — cash, Zelle, all good.",
  },
];

export const barbers: BarberProfile[] = [
  {
    id: "luis",
    userId: "user-luis",
    displayName: "Luis “Fade King” Ramirez",
    bio: "Dominican barber, 12 years behind the chair. Fades, tapers, y buen ambiente. Walk-ins y citas — ven como estás.",
    photoUrl: null,
    initials: "LR",
    specialty: "Skin fades & beard sculpting",
    languages: ["en", "es"],
    instagramUrl: "https://instagram.com/fadeking.luis",
    whatsappNumber: "+12125550111",
    paymentMethods: ["cash", "zelle", "cashapp"],
    isVerified: true,
    currentShopId: "shop-caribe",
    status: "available",
    estimatedWaitMinutes: 25,
  },
  {
    id: "manny",
    userId: "user-manny",
    displayName: "Manny Blendz",
    bio: "Blends so clean they look airbrushed. Kids welcome — first cut on the house playlist. English y español.",
    photoUrl: null,
    initials: "MB",
    specialty: "Blends & kids cuts",
    languages: ["en", "es"],
    instagramUrl: "https://instagram.com/mannyblendz",
    whatsappNumber: "+12125550122",
    paymentMethods: ["cash", "cashapp", "card"],
    isVerified: true,
    currentShopId: "shop-caribe",
    status: "busy",
    estimatedWaitMinutes: 45,
  },
  {
    id: "jay",
    userId: "user-jay",
    displayName: "Jay the Barber",
    bio: "Classic cuts done right. No rush, no shortcuts. By the chair Tuesday through Saturday.",
    photoUrl: null,
    initials: "JB",
    specialty: "Classic cuts & tapers",
    languages: ["en"],
    instagramUrl: "https://instagram.com/jaythebarber.nyc",
    whatsappNumber: "+12125550133",
    paymentMethods: ["cash", "zelle"],
    isVerified: false,
    currentShopId: "shop-caribe",
    status: "off",
    estimatedWaitMinutes: 0,
  },
  {
    id: "nando",
    userId: "user-nando",
    displayName: "Nando Estévez",
    bio: "18 años cortando en Union City. Fades, diseños, y buena conversación. Se habla español primero, inglés también.",
    photoUrl: null,
    initials: "NE",
    specialty: "Fades & line designs",
    languages: ["es", "en"],
    instagramUrl: "https://instagram.com/nandocuts",
    whatsappNumber: "+12015550144",
    paymentMethods: ["cash", "zelle"],
    isVerified: true,
    currentShopId: "shop-quisqueya",
    status: "available",
    estimatedWaitMinutes: 15,
  },
  {
    id: "bebo",
    userId: "user-bebo",
    displayName: "Bebo Cuts",
    bio: "Fast, clean, no wasted time. Tapers and beard lineups are the specialty. Text ahead on busy Saturdays.",
    photoUrl: null,
    initials: "BC",
    specialty: "Tapers & beard lineups",
    languages: ["en", "es"],
    instagramUrl: "https://instagram.com/bebocuts",
    whatsappNumber: "+12015550155",
    paymentMethods: ["cash", "cashapp", "card"],
    isVerified: false,
    currentShopId: "shop-quisqueya",
    status: "busy",
    estimatedWaitMinutes: 35,
  },
];

export const services: Service[] = [
  // Luis
  {
    id: "svc-luis-cut",
    barberId: "luis",
    name: "Men’s Cut",
    description: "Full haircut, lined up and styled.",
    durationMinutes: 30,
    priceDisplay: "$35",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-luis-skinfade",
    barberId: "luis",
    name: "Skin Fade",
    description: "Razor-sharp skin fade, blended to zero.",
    durationMinutes: 40,
    priceDisplay: "$45",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-luis-beard",
    barberId: "luis",
    name: "Beard Trim",
    description: "Shape, line, and hot towel finish.",
    durationMinutes: 15,
    priceDisplay: "$20",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-luis-combo",
    barberId: "luis",
    name: "Cut + Beard",
    description: "The full reset. Cut, beard, and lineup.",
    durationMinutes: 50,
    priceDisplay: "$55",
    depositRequired: false,
    active: true,
  },
  // Manny
  {
    id: "svc-manny-shapeup",
    barberId: "manny",
    name: "Shape Up",
    description: "Crisp edge-up in and out.",
    durationMinutes: 15,
    priceDisplay: "$20",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-manny-fade",
    barberId: "manny",
    name: "Fade",
    description: "Low, mid, or high — your call.",
    durationMinutes: 35,
    priceDisplay: "$40",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-manny-kids",
    barberId: "manny",
    name: "Kids Cut",
    description: "Ages 12 and under. Patience included.",
    durationMinutes: 25,
    priceDisplay: "$25",
    depositRequired: false,
    active: true,
  },
  // Jay
  {
    id: "svc-jay-classic",
    barberId: "jay",
    name: "Classic Cut",
    description: "Scissor or clipper cut, classic finish.",
    durationMinutes: 30,
    priceDisplay: "$30",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-jay-taper",
    barberId: "jay",
    name: "Taper",
    description: "Clean taper with a natural blend.",
    durationMinutes: 30,
    priceDisplay: "$35",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-jay-beard",
    barberId: "jay",
    name: "Beard Work",
    description: "Trim, shape, and razor detail.",
    durationMinutes: 20,
    priceDisplay: "$25",
    depositRequired: false,
    active: true,
  },
  // Nando
  {
    id: "svc-nando-cut",
    barberId: "nando",
    name: "Corte Regular",
    description: "Corte clásico, tijera y máquina.",
    durationMinutes: 30,
    priceDisplay: "$30",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-nando-fade",
    barberId: "nando",
    name: "Fade con Diseño",
    description: "Fade con línea o diseño a tu gusto.",
    durationMinutes: 45,
    priceDisplay: "$45",
    depositRequired: false,
    active: true,
  },
  // Bebo
  {
    id: "svc-bebo-taper",
    barberId: "bebo",
    name: "Taper",
    description: "Tight taper, clean neckline.",
    durationMinutes: 30,
    priceDisplay: "$32",
    depositRequired: false,
    active: true,
  },
  {
    id: "svc-bebo-beard",
    barberId: "bebo",
    name: "Beard Lineup",
    description: "Sharp beard edge-up and shape.",
    durationMinutes: 15,
    priceDisplay: "$18",
    depositRequired: false,
    active: true,
  },
];

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const seedQueue: QueueEntry[] = [
  {
    id: "q-seed-1",
    barberId: "luis",
    customerName: "Andres M.",
    phone: "(917) 555-0161",
    serviceId: "svc-luis-skinfade",
    status: "in_chair",
    quotedWaitMinutes: 0,
    position: 0,
    paymentMethodSelected: "cash",
    source: "walk_in",
    createdAt: minutesAgo(35),
  },
  {
    id: "q-seed-2",
    barberId: "luis",
    customerName: "Kelvin P.",
    phone: "(646) 555-0172",
    serviceId: "svc-luis-cut",
    status: "waiting",
    quotedWaitMinutes: 25,
    position: 1,
    paymentMethodSelected: "zelle",
    source: "link",
    createdAt: minutesAgo(20),
  },
  {
    id: "q-seed-3",
    barberId: "luis",
    customerName: "Papo",
    phone: "(347) 555-0183",
    serviceId: "svc-luis-combo",
    status: "waiting",
    quotedWaitMinutes: 55,
    position: 2,
    paymentMethodSelected: "cashapp",
    source: "walk_in",
    createdAt: minutesAgo(10),
  },
  {
    id: "q-seed-4",
    barberId: "manny",
    customerName: "Dariel S.",
    phone: "(917) 555-0144",
    serviceId: "svc-manny-fade",
    status: "in_chair",
    quotedWaitMinutes: 0,
    position: 0,
    paymentMethodSelected: "card",
    source: "walk_in",
    createdAt: minutesAgo(25),
  },
  {
    id: "q-seed-5",
    barberId: "manny",
    customerName: "Yohan + hijo",
    phone: "(718) 555-0195",
    serviceId: "svc-manny-kids",
    status: "waiting",
    quotedWaitMinutes: 45,
    position: 1,
    paymentMethodSelected: "cash",
    source: "link",
    createdAt: minutesAgo(12),
  },
  {
    id: "q-seed-6",
    barberId: "nando",
    customerName: "Freddy A.",
    phone: "(201) 555-0188",
    serviceId: "svc-nando-fade",
    status: "waiting",
    quotedWaitMinutes: 15,
    position: 1,
    paymentMethodSelected: "zelle",
    source: "link",
    createdAt: minutesAgo(8),
  },
];

export const seedAppointments: Appointment[] = [
  {
    id: "appt-seed-1",
    barberId: "luis",
    customerName: "Randy V.",
    phone: "(929) 555-0117",
    serviceId: "svc-luis-combo",
    startTime: todayAt(17, 0),
    endTime: todayAt(17, 50),
    status: "confirmed",
    paymentMethodSelected: "zelle",
    notes: "Same as last time, low fade.",
    createdAt: minutesAgo(60 * 26),
  },
  {
    id: "appt-seed-2",
    barberId: "luis",
    customerName: "Chris O.",
    phone: "(917) 555-0126",
    serviceId: "svc-luis-cut",
    startTime: todayAt(18, 30),
    endTime: todayAt(19, 0),
    status: "requested",
    paymentMethodSelected: "cash",
    createdAt: minutesAgo(60 * 3),
  },
  {
    id: "appt-seed-3",
    barberId: "manny",
    customerName: "Lisa T.",
    phone: "(646) 555-0139",
    serviceId: "svc-manny-kids",
    startTime: todayAt(16, 30),
    endTime: todayAt(16, 55),
    status: "confirmed",
    paymentMethodSelected: "card",
    notes: "Kids cut for Mateo (7).",
    createdAt: minutesAgo(60 * 20),
  },
];

export function getBarber(id: string): BarberProfile | undefined {
  return barbers.find((b) => b.id === id);
}

export function getServicesForBarber(barberId: string): Service[] {
  return services.filter((s) => s.barberId === barberId && s.active);
}

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getShop(id: string): Shop | undefined {
  return shops.find((s) => s.id === id);
}

export function getShopForBarber(barberId: string): Shop | undefined {
  const barber = getBarber(barberId);
  return barber ? getShop(barber.currentShopId) : undefined;
}

export function getBarbersForShop(shopId: string): BarberProfile[] {
  return barbers.filter((b) => b.currentShopId === shopId);
}

/** Matches a shop by name, neighborhood, city, state, or ZIP (fuzzy, case-insensitive). */
export function searchShops(query: string): Shop[] {
  const q = query.trim().toLowerCase();
  if (!q) return shops;
  return shops.filter((s) =>
    [s.name, s.neighborhood, s.city, s.state, s.zip]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
