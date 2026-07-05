import type { Language } from "@/types";

// ---------------------------------------------------------------------------
// Minimal bilingual dictionary. Keys are stable identifiers; both languages
// must define every key (enforced by the TranslationKey type below).
// ---------------------------------------------------------------------------

const en = {
  // Brand / global
  appName: "MiBarbero",
  tagline: "Live queue, bookings, and availability for community barbers.",
  heroTitle: "Know before you go.",
  heroSubtitle:
    "See if your barber is working, how long the wait is, and join the line — right from their link.",
  noAppDownload: "No app download required",
  payYourWay: "Pay your way: cash, Zelle, Cash App, or card",
  joinBeforePullUp: "Join the line before you pull up",
  forBarbers: "For barbers",
  forBarbersPitch:
    "Let your clients know when you’re available without answering DMs all day.",
  viewDemoProfile: "View a live barber profile",
  openDashboard: "Open the barber dashboard",
  browseShop: "See the whole shop",

  // Navigation
  navHome: "Home",
  navShop: "Shop",
  navMyVisits: "My Visits",
  navDashboard: "Dashboard",
  navMetrics: "Metrics",

  // Status
  statusAvailable: "Available now",
  statusBusy: "Busy",
  statusOff: "Not working",
  verified: "Verified",

  // Profile
  estimatedWait: "Estimated wait",
  peopleWaiting: "people waiting",
  onePersonWaiting: "1 person waiting",
  noWait: "No wait right now",
  services: "Services",
  viewServices: "View Services",
  joinQueue: "Join Queue",
  bookLater: "Book Later",
  messageWhatsApp: "Message on WhatsApp",
  leaveReview: "Leave Review",
  reviews: "Reviews",
  languagesSpoken: "Speaks",
  acceptedPayments: "Accepted payments",
  min: "min",
  at: "at",
  followBarberNote:
    "This is {name}’s personal page. Your barber, your line — wherever they work.",

  // Languages
  langEnglish: "English",
  langSpanish: "Spanish",

  // Payments
  cash: "Cash",
  zelle: "Zelle",
  cashapp: "Cash App",
  card: "Card",
  cardAtShop: "Card at shop",
  noPrepay: "No online payment needed. Pay at the shop.",

  // Queue form
  joinQueueTitle: "Join the line",
  yourName: "Your name",
  phoneNumber: "Phone number",
  serviceRequested: "Service",
  preferredPayment: "How you’ll pay",
  notesOptional: "Notes (optional)",
  notesPlaceholder: "e.g. Low fade, same as last time",
  confirmJoinQueue: "Join Queue",
  youreInLine: "You’re in line",
  inLineFor: "You’re in line for {name}. We’ll let you know when you’re next.",
  yourPosition: "Your spot in line",
  positionOf: "#{pos} of {total}",
  mvpSmsNote:
    "MVP note: SMS/WhatsApp reminders will be connected later. For now, this prototype simulates queue confirmation.",
  leaveQueue: "Leave the line",
  leftQueue: "You left the line.",
  queueClosedTitle: "The line is closed right now",
  queueClosedBody:
    "{name} isn’t taking walk-ins at the moment. You can book a slot for later instead.",
  backToProfile: "Back to profile",
  alreadyInLine: "You’re already in this line.",
  viewMySpot: "View my spot",

  // Booking
  bookingTitle: "Book a slot",
  selectService: "Choose a service",
  selectDate: "Pick a day",
  selectTime: "Pick a time",
  optionalNote: "Anything the barber should know? (optional)",
  confirmBooking: "Confirm Booking",
  bookingConfirmed: "Booking confirmed",
  bookingConfirmedBody:
    "{name} has your request for {date} at {time}. Pay at the shop — {payment}.",
  today: "Today",
  tomorrow: "Tomorrow",
  noSlots: "No open slots this day. Try another day.",
  upcomingBooking: "Upcoming booking",
  cancelBooking: "Cancel booking",
  bookingCancelled: "Booking cancelled.",

  // My visits
  myVisitsTitle: "My visits",
  myVisitsEmpty:
    "Nothing yet. Join a line or book a slot and it will show up here.",
  currentQueue: "In line now",
  pastActivity: "Past activity",

  // Dashboard
  barberDashboard: "Barber Dashboard",
  dashboardSubtitle: "Update your status and line in seconds.",
  viewingAs: "Managing",
  yourStatus: "Your status",
  waitTime: "Wait time",
  liveQueue: "Live queue",
  emptyQueue: "Nobody in line. Share your link to fill the chair.",
  addWalkIn: "Add walk-in",
  walkInName: "Walk-in name",
  add: "Add",
  markInChair: "In chair",
  markComplete: "Mark Complete",
  markNoShow: "No-show",
  markCancelled: "Cancel",
  waiting: "Waiting",
  inChair: "In chair",
  completed: "Completed",
  noShow: "No-show",
  cancelled: "Cancelled",
  notified: "Notified",
  todaysBookings: "Today’s bookings",
  noBookingsToday: "No bookings today.",
  editProfile: "Edit profile",
  saveProfile: "Save profile",
  profileSaved: "Profile saved.",
  displayName: "Display name",
  bioLabel: "Bio",
  specialtyLabel: "Specialty",
  instagramLabel: "Instagram URL",
  whatsappLabel: "WhatsApp number",
  shareProfile: "Share your link",
  copyLink: "Copy link",
  linkCopied: "Link copied!",
  shareHint: "Drop it in your Instagram bio, WhatsApp status, or texts.",
  confirm: "Confirm",
  arrived: "Arrived",
  requested: "Requested",
  confirmedStatus: "Confirmed",

  // Shop
  shopTitle: "The shop",
  shopBarbersTitle: "Barbers at {shop}",
  viewBarber: "View Barber",
  shopFollowNote:
    "Follow your barber, not just the shop. Every barber keeps their own line, bookings, and reviews — even if they move.",
  walkInsWelcome: "Walk-ins welcome",

  // Reviews
  reviewsFor: "Reviews for {name}",
  ratingLabel: "Rating",
  commentLabel: "Comment",
  commentPlaceholder: "How was the cut?",
  serviceReceived: "Service received",
  submitReview: "Submit review",
  reviewThanks: "Thanks! Your review is live.",
  noReviews: "No reviews yet. Be the first.",
  reviewNote: "Leave a review after your cut — it helps the barber grow.",

  // Metrics
  metricsTitle: "Pilot Metrics",
  metricsSubtitle: "Live validation data from this device’s activity.",
  profileViews: "Profile views",
  queueJoins: "Queue joins",
  bookings: "Bookings",
  completedCuts: "Completed cuts",
  noShows: "No-shows",
  repeatCustomers: "Repeat customers",
  topPayment: "Top payment method",
  barberActivation: "Barber activation",
  active: "Active",
  inactive: "Inactive",
  pilotCriteriaTitle: "Pilot success criteria",
  pilotCriteria1: "5 barbers agree to pilot",
  pilotCriteria2: "3 barbers use it 3+ days/week",
  pilotCriteria3: "10+ customer interactions per active barber/week",
  pilotCriteria4: "2+ barbers say they would pay $10–$20/month",
  resetDemoData: "Reset demo data",
  resetDemoConfirm: "Reset all demo data on this device?",

  // Misc
  required: "Required",
  close: "Close",
  loading: "Loading…",
  notFound: "Barber not found.",
} as const;

export type TranslationKey = keyof typeof en;

const es: Record<TranslationKey, string> = {
  appName: "MiBarbero",
  tagline: "Fila en vivo, reservas y disponibilidad para barberos de comunidad.",
  heroTitle: "Entérate antes de llegar.",
  heroSubtitle:
    "Mira si tu barbero está trabajando, cuánto es la espera, y apúntate en la fila — directo desde su link.",
  noAppDownload: "No hay que descargar ninguna app",
  payYourWay: "Paga como quieras: efectivo, Zelle, Cash App o tarjeta",
  joinBeforePullUp: "Apúntate en la fila antes de llegar",
  forBarbers: "Para barberos",
  forBarbersPitch:
    "Tus clientes pueden ver si estás disponible, apuntarse en la fila, y reservar sin escribirte todo el día.",
  viewDemoProfile: "Ver un perfil de barbero en vivo",
  openDashboard: "Abrir el panel del barbero",
  browseShop: "Ver toda la barbería",

  navHome: "Inicio",
  navShop: "Barbería",
  navMyVisits: "Mis visitas",
  navDashboard: "Panel",
  navMetrics: "Métricas",

  statusAvailable: "Disponible ahora",
  statusBusy: "Ocupado",
  statusOff: "No está trabajando",
  verified: "Verificado",

  estimatedWait: "Tiempo estimado",
  peopleWaiting: "personas esperando",
  onePersonWaiting: "1 persona esperando",
  noWait: "Sin espera ahora mismo",
  services: "Servicios",
  viewServices: "Ver servicios",
  joinQueue: "Apuntarme en la fila",
  bookLater: "Reservar después",
  messageWhatsApp: "Escribir por WhatsApp",
  leaveReview: "Dejar reseña",
  reviews: "Reseñas",
  languagesSpoken: "Habla",
  acceptedPayments: "Métodos de pago",
  min: "min",
  at: "a las",
  followBarberNote:
    "Esta es la página personal de {name}. Tu barbero, tu fila — donde sea que trabaje.",

  langEnglish: "Inglés",
  langSpanish: "Español",

  cash: "Efectivo",
  zelle: "Zelle",
  cashapp: "Cash App",
  card: "Tarjeta",
  cardAtShop: "Tarjeta en la barbería",
  noPrepay: "No hay que pagar en línea. Pagas en la barbería.",

  joinQueueTitle: "Apúntate en la fila",
  yourName: "Tu nombre",
  phoneNumber: "Número de teléfono",
  serviceRequested: "Servicio",
  preferredPayment: "Cómo vas a pagar",
  notesOptional: "Notas (opcional)",
  notesPlaceholder: "ej. Low fade, igual que la última vez",
  confirmJoinQueue: "Apuntarme en la fila",
  youreInLine: "Estás en la fila",
  inLineFor: "Estás en la fila de {name}. Te avisamos cuando seas el próximo.",
  yourPosition: "Tu puesto en la fila",
  positionOf: "#{pos} de {total}",
  mvpSmsNote:
    "Nota MVP: los recordatorios por SMS/WhatsApp se conectan más adelante. Por ahora, este prototipo simula la confirmación de la fila.",
  leaveQueue: "Salir de la fila",
  leftQueue: "Saliste de la fila.",
  queueClosedTitle: "La fila está cerrada ahora",
  queueClosedBody:
    "{name} no está recibiendo walk-ins en este momento. Puedes reservar para más tarde.",
  backToProfile: "Volver al perfil",
  alreadyInLine: "Ya estás en esta fila.",
  viewMySpot: "Ver mi puesto",

  bookingTitle: "Reserva tu turno",
  selectService: "Elige un servicio",
  selectDate: "Elige un día",
  selectTime: "Elige una hora",
  optionalNote: "¿Algo que el barbero deba saber? (opcional)",
  confirmBooking: "Confirmar reserva",
  bookingConfirmed: "Reserva confirmada",
  bookingConfirmedBody:
    "{name} tiene tu reserva para el {date} {time}. Pagas en la barbería — {payment}.",
  today: "Hoy",
  tomorrow: "Mañana",
  noSlots: "No hay turnos ese día. Prueba otro día.",
  upcomingBooking: "Próxima reserva",
  cancelBooking: "Cancelar reserva",
  bookingCancelled: "Reserva cancelada.",

  myVisitsTitle: "Mis visitas",
  myVisitsEmpty:
    "Nada todavía. Apúntate en una fila o haz una reserva y aparecerá aquí.",
  currentQueue: "En fila ahora",
  pastActivity: "Actividad pasada",

  barberDashboard: "Panel del barbero",
  dashboardSubtitle: "Actualiza tu estado y tu fila en segundos.",
  viewingAs: "Administrando",
  yourStatus: "Tu estado",
  waitTime: "Tiempo de espera",
  liveQueue: "Fila en vivo",
  emptyQueue: "Nadie en fila. Comparte tu link para llenar la silla.",
  addWalkIn: "Agregar walk-in",
  walkInName: "Nombre del walk-in",
  add: "Agregar",
  markInChair: "En la silla",
  markComplete: "Marcar completado",
  markNoShow: "No llegó",
  markCancelled: "Cancelar",
  waiting: "Esperando",
  inChair: "En la silla",
  completed: "Completado",
  noShow: "No llegó",
  cancelled: "Cancelado",
  notified: "Avisado",
  todaysBookings: "Reservas de hoy",
  noBookingsToday: "No hay reservas hoy.",
  editProfile: "Editar perfil",
  saveProfile: "Guardar perfil",
  profileSaved: "Perfil guardado.",
  displayName: "Nombre",
  bioLabel: "Bio",
  specialtyLabel: "Especialidad",
  instagramLabel: "URL de Instagram",
  whatsappLabel: "Número de WhatsApp",
  shareProfile: "Comparte tu link",
  copyLink: "Copiar link",
  linkCopied: "¡Link copiado!",
  shareHint: "Ponlo en tu bio de Instagram, estado de WhatsApp o mensajes.",
  confirm: "Confirmar",
  arrived: "Llegó",
  requested: "Solicitada",
  confirmedStatus: "Confirmada",

  shopTitle: "La barbería",
  shopBarbersTitle: "Barberos en {shop}",
  viewBarber: "Ver barbero",
  shopFollowNote:
    "Sigue a tu barbero, no solo a la barbería. Cada barbero mantiene su propia fila, reservas y reseñas — aunque cambie de local.",
  walkInsWelcome: "Walk-ins bienvenidos",

  reviewsFor: "Reseñas de {name}",
  ratingLabel: "Calificación",
  commentLabel: "Comentario",
  commentPlaceholder: "¿Cómo quedó el corte?",
  serviceReceived: "Servicio recibido",
  submitReview: "Enviar reseña",
  reviewThanks: "¡Gracias! Tu reseña ya está publicada.",
  noReviews: "Aún no hay reseñas. Sé el primero.",
  reviewNote: "Deja una reseña después de tu corte — ayuda al barbero a crecer.",

  metricsTitle: "Métricas del piloto",
  metricsSubtitle: "Datos de validación en vivo de la actividad en este dispositivo.",
  profileViews: "Vistas de perfil",
  queueJoins: "Entradas a la fila",
  bookings: "Reservas",
  completedCuts: "Cortes completados",
  noShows: "No llegaron",
  repeatCustomers: "Clientes repetidos",
  topPayment: "Método de pago más usado",
  barberActivation: "Activación de barberos",
  active: "Activo",
  inactive: "Inactivo",
  pilotCriteriaTitle: "Criterios de éxito del piloto",
  pilotCriteria1: "5 barberos aceptan el piloto",
  pilotCriteria2: "3 barberos lo usan 3+ días/semana",
  pilotCriteria3: "10+ interacciones de clientes por barbero activo/semana",
  pilotCriteria4: "2+ barberos dicen que pagarían $10–$20/mes",
  resetDemoData: "Restablecer datos de demo",
  resetDemoConfirm: "¿Restablecer todos los datos de demo en este dispositivo?",

  required: "Obligatorio",
  close: "Cerrar",
  loading: "Cargando…",
  notFound: "Barbero no encontrado.",
};

const dictionaries: Record<Language, Record<TranslationKey, string>> = {
  en,
  es,
};

/**
 * Translate a key, with optional {placeholder} interpolation.
 * Example: translate("es", "inLineFor", { name: "Luis" })
 */
export function translate(
  lang: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let text: string = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
