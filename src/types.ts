export type TradeCategory =
  | 'gasista'
  | 'electricista'
  | 'plomero'
  | 'pintor'
  | 'cerrajero'
  | 'albanil'
  | 'aire_acondicionado'
  | 'jardineria'
  | 'carpinteria'
  | 'fletes'
  | string;

export interface CustomTradeOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number; // 1 to 5
  date: string;
  serviceType: string;
  comment: string;
  tags: string[];
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  trade: TradeCategory;
  tradeTitle: string; // e.g. "Gasista Matriculado Metrogas"
  matricula?: string; // e.g. "Matrícula N° 58392"
  phone: string; // e.g. "+5491155551234"
  whatsapp: string; // formatted e.g. "5491155551234"
  location: string; // e.g. "San Isidro, Zona Norte"
  zones: string[]; // e.g. ["San Isidro", "Vicente López", "Tigre", "Martínez"]
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean; // Verified by ServiGo / Ferretería Bruzzone
  ferreteroPartner: boolean; // Purchases at Ferretería Bruzzone & gives 10% labor discount
  hourlyRate: number; // ARS
  visitFee: number; // ARS
  availability: {
    days: string[]; // ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    hours: string; // "08:00 - 18:00"
    urgencies24h: boolean;
  };
  bio: string;
  services: string[];
  gallery: string[];
  reviews: Review[];
}

export interface BookingRequest {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerTrade: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  date: string;
  timeSlot: string;
  description: string;
  urgency: 'normal' | 'alta' | 'urgencia_24h';
  status: 'pendiente' | 'confirmado' | 'completado';
  createdAt: string;
}

export interface HardwareProduct {
  id: string;
  name: string;
  trade: TradeCategory | 'general';
  price: number;
  image: string;
  code: string;
  description: string;
  storeUrl: string;
}

export interface TabVisibilityConfig {
  search: boolean;     // "Buscar Oficio"
  register: boolean;   // "Soy Trabajador"
  sponsor: boolean;    // "Ferretería Bruzzone"
  ai: boolean;         // "Diagnóstico IA"
  bookings: boolean;   // "Mis Turnos"
}

export interface AppConfig {
  id: string;
  tabs: TabVisibilityConfig;
  customLogoUrl?: string;
  tagline?: string;
  customTrades?: CustomTradeOption[];
  updatedAt: string;
}

export interface PromotedBanner {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor?: 'orange' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  active: boolean;
  priority: number;
  createdAt: string;
  // Suscripciones y Pagos del Anunciante
  advertiserName?: string;
  advertiserPhone?: string;
  paymentStatus?: 'paid' | 'pending' | 'expired';
  subscriptionPlan?: 'mensual' | 'trimestral' | 'anual' | 'vip';
  pricePaid?: number;
  expirationDate?: string;
}

