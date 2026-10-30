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

export interface Shop {
  id: string;
  name: string;
  category: 'ferreteria' | 'taller_mecanico' | 'electricidad' | 'sanitarios_plomeria' | 'corralon_materiales' | 'pintureria' | 'repuestos' | 'servicios_tecnicos' | string;
  categoryTitle: string; // e.g. "Ferretería & Materiales", "Taller Mecánico & GNC"
  description: string;
  address: string;
  location: string; // e.g. "Alejandro Roca"
  zones: string[]; // e.g. ["Alejandro Roca", "Río Cuarto", "La Carlota"]
  phone: string;
  whatsapp: string; // formatted e.g. "5493584123456"
  email?: string;
  hours: string; // e.g. "Lun a Vie 08:00 - 12:30 / 16:00 - 20:00"
  rating: number;
  reviewCount: number;
  verified: boolean;
  discountPartner: boolean;
  discountText?: string;
  imageUrl: string;
  featured?: boolean;
  servicesOrProducts: string[];
  mapUrl?: string;
  createdAt?: string;
}

export interface TabVisibilityConfig {
  search: boolean;     // "Buscar Oficio"
  shops: boolean;      // "Comercios & Negocios"
  jobs?: boolean;      // "Bolsa de Trabajo" (CVs y RRHH)
  delivery?: boolean;  // "ServiGo Delivery" (Envíos & Pedidos)
  cadetes?: boolean;   // "Cadetes & Envíos" (Mandados y Mensajería)
  remises?: boolean;   // "Remises & Viajes"
  register: boolean;   // "Soy Trabajador"
  sponsor: boolean;    // "Ferretería Bruzzone"
  ai: boolean;         // "Diagnóstico IA"
  bookings: boolean;   // "Mis Turnos"
}

export interface RemisDriver {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  vehicle: {
    make: string;      // e.g. "Toyota"
    model: string;     // e.g. "Corolla"
    year: string;      // e.g. "2022"
    color: string;     // e.g. "Gris Plata"
    plate: string;     // e.g. "AF 123 CD"
  };
  photoUrl?: string;
  baseLocation: string; // e.g. "Alejandro Roca"
  zones: string[];      // e.g. ["Alejandro Roca", "Río Cuarto", "La Carlota"]
  status: 'disponible' | 'en_viaje' | 'fuera_de_servicio';
  baseRate: number;     // Bajada de bandera (ARS) e.g. 1500
  pricePerKm: number;   // Precio por km (ARS) e.g. 800
  acceptsPets: boolean;
  hasAirConditioning: boolean;
  largeTrunk: boolean;
  rating: number;
  totalTrips: number;
  verified: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
}

export interface RideRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  origin: string;
  destination: string;
  passengers: number;
  estimatedDistanceKm: number;
  estimatedFare: number;
  selectedDriverId?: string;
  selectedDriverName?: string;
  status: 'pendiente' | 'aceptado' | 'en_camino' | 'completado' | 'cancelado';
  notes?: string;
  createdAt: string;
}

export interface AppConfig {
  id: string;
  tabs: TabVisibilityConfig;
  customLogoUrl?: string;
  tagline?: string;
  ferreteroPartnerTitle?: string;
  ferreteroPartnerDiscountText?: string;
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

export interface SystemCoupon {
  id: string;
  codePrefix: string; // e.g. "FERRE15", "SERVIGO"
  title: string; // e.g. "15% OFF en Ferretería Bruzzone"
  discountType: 'percentage' | 'fixed'; // percentage: %, fixed: $ ARS
  discountValue: number; // e.g. 15 or 5000
  targetType: 'all_shops' | 'ferreteria_bruzzone' | 'specific_shop';
  targetShopId?: string;
  targetShopName?: string;
  minSpend?: number; // Minimum purchase amount in ARS (0 if none)
  description: string;
  termsAndConditions?: string;
  active: boolean;
  validDays: number; // Duration in days (e.g. 30)
  createdAt: string;
}

export interface IssuedVoucher {
  id: string;
  voucherCode: string; // e.g. "BRUZZONE15-8492-JUAN"
  couponId: string;
  couponTitle: string;
  discountText: string; // e.g. "15% OFF" or "$5.000 Descuento"
  targetShopName: string; // e.g. "Ferretería Bruzzone", "Comercios Adheridos"
  workerId: string;
  workerName: string;
  workerTrade: string;
  clientName: string;
  clientPhone?: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'redeemed' | 'expired';
  redeemedAt?: string;
  redeemedByShop?: string;
}

// -------------------------------------------------------------
// MÓDULO SERVIGO DELIVERY (COMERCIOS & CLIENTES)
// -------------------------------------------------------------

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'SEARCHING_DRIVER'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'EFECTIVO' | 'MERCADO_PAGO';

export type DispatchMethod = 'PROPIO' | 'SERVIGO_REMIS';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'client' | 'merchant' | 'admin';
  deliveryAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  merchantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MerchantBusinessType =
  | 'food'
  | 'clothing'
  | 'pharmacy'
  | 'grocery'
  | 'hardware'
  | 'pets'
  | 'tech'
  | 'other';

export interface MerchantProduct {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  businessType?: MerchantBusinessType;
  description?: string;
  address: string;
  location: string;
  phone: string;
  whatsapp: string;
  imageUrl: string;
  isOpen: boolean;
  deliveryTimeEstimate: string; // e.g. "25 - 40 min"
  deliveryFee: number; // e.g. 800 (ARS) Costo base de entrega
  extraDeliveryFee?: number; // Monto extra que el comercio cobra/suma al pedido por delivery o despacho
  minOrder: number;
  rating: number;
  reviewCount: number;
  hasOwnDelivery: boolean;
  products: MerchantProduct[];
  ownerUserId?: string;
  // Account authentication credentials for private portal
  accountEmail?: string;
  accountUsername?: string;
  accountPassword?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface OrderMessage {
  id: string;
  sender: 'merchant' | 'client';
  senderName: string;
  text: string;
  timestamp: string; // ISO string
}

export interface Order {
  id: string;
  orderNumber: string;
  merchantId: string;
  merchantName: string;
  merchantAddress?: string;
  merchantPhone?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  clientCoordinates?: {
    lat: number;
    lng: number;
  };
  items: OrderItem[];
  itemsTotal: number;
  deliveryFee: number;
  extraDeliveryFee?: number; // Extra de dinero sumado por el comercio para el delivery
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: OrderStatus;
  dispatchMethod?: DispatchMethod;
  driverName?: string;
  driverPhone?: string;
  messages?: OrderMessage[]; // Mensajería interna entre cliente y comercio
  createdAt: string; // ISO string for client serialization
  updatedAt?: string;
}

export interface WorkExperienceItem {
  id: string;
  role: string;
  companyOrProject: string;
  period: string; // e.g. "2021 - 2024"
  description: string;
}

export interface EducationItem {
  id: string;
  title: string;
  institution: string;
  year?: string;
}

export interface JobProfile {
  id: string;
  fullName: string;
  trade: TradeCategory | string;
  desiredTitle: string; // e.g. "Electricista Matriculado e Instalador Industrial"
  phone: string;
  whatsapp: string;
  email?: string;
  location: string;
  zones: string[];
  yearsOfExperience: number;
  availability: 'inmediata' | 'jornada_completa' | 'medio_tiempo' | 'por_proyecto';
  hasOwnVehicle: boolean;
  hasOwnTools: boolean;
  isMatriculado: boolean;
  matriculaNumber?: string;
  salaryExpectation?: string; // e.g. "$650.000 / mes o a convenir"
  photoUrl?: string;
  summary: string; // Resumen profesional
  skills: string[]; // e.g. ["Termofusión", "Soldadura TIG", "Planos eléctricos"]
  experience: WorkExperienceItem[];
  education: EducationItem[];
  certifications: string[]; // Cursos, carnets, certificados
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// MÓDULO SERVIGO CADETES (CADETERÍA, MANDADOS & MENSAJERÍA)
// -------------------------------------------------------------

export type CadeteVehicleType = 'moto' | 'bicicleta' | 'auto';

export interface Cadete {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  vehicleType: CadeteVehicleType; // 'moto' | 'bicicleta' | 'auto'
  vehicleDescription: string; // e.g. "Honda Wave 110cc Roja con caja térmica", "Bici MTB Rodado 29", "Fiat Uno blanco"
  plateOrDetails?: string; // e.g. "A123BCD"
  photoUrl?: string;
  baseLocation: string; // e.g. "Alejandro Roca"
  zones: string[]; // e.g. ["Alejandro Roca", "Zona Centro", "Barrio Norte"]
  isAvailable: boolean; // TRUE: Disponible en el momento / FALSE: No disponible
  baseRate?: number; // Tarifa base sugerida (ARS) e.g. 1200
  rating: number;
  completedDeliveries: number;
  verified: boolean;
  pinCode?: string; // Para acceder a su panel de control privado
  accountUsername?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export type CadeteRequestStatus = 'pendiente' | 'aceptado' | 'en_camino' | 'entregado' | 'cancelado';

export interface CadeteRequest {
  id: string;
  cadeteId: string;
  cadeteName: string;
  clientName: string;
  clientPhone: string;
  taskType: 'mandado' | 'retiro_comida' | 'paquete' | 'farmacia' | 'tramite' | 'otro';
  description: string;
  originAddress: string;
  destinationAddress: string;
  clientLocation?: {
    lat: number;
    lng: number;
    mapsUrl: string;
  };
  notes?: string;
  status: CadeteRequestStatus;
  estimatedFee?: number;
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// MÓDULO SERVIGO ALQUILER DE PRODUCTOS (ESTILO GIVY.AR)
// -------------------------------------------------------------

export type RentalCategory =
  | 'herramientas'
  | 'eventos_fiestas'
  | 'tecnologia_audio'
  | 'camping_aire_libre'
  | 'limpieza_hogar'
  | 'movilidad_rodados'
  | 'salud_ortopedia'
  | 'jardineria'
  | string;

export interface RentalCategoryMeta {
  id: RentalCategory;
  name: string;
  icon: string;
  description: string;
  popularCount?: number;
}

export type RentalItemCondition = 'nuevo' | 'excelente' | 'muy_bueno' | 'bueno';

export interface RentalOwner {
  id: string;
  name: string;
  dni: string;
  phone: string;
  whatsapp: string;
  email?: string;
  location: string;
  address?: string;
  payoutInfo: {
    cbuOrAlias: string;
    bankOrMp: string;
    accountHolderName: string;
  };
  walletBalance: number; // Saldo disponible para retirar (ARS)
  pendingBalance: number; // Saldo retenido por alquileres en curso (ARS)
  totalEarned: number; // Histórico ganado (ARS)
  registeredAt: string;
}

export interface RentalItem {
  id: string;
  ownerId?: string;
  title: string;
  category: RentalCategory;
  categoryLabel: string;
  description: string;
  dailyPrice: number; // ARS por día
  weeklyPrice?: number; // ARS con descuento semanal
  depositAmount: number; // Depósito de seguridad / Garantía reembolsable
  minRentalDays: number;
  location: string;
  zones: string[];
  images: string[]; // Hasta 3 imágenes
  condition: RentalItemCondition;
  includedAccessories: string[];
  ownerName: string;
  ownerDni?: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  ownerCbuOrAlias?: string;
  ownerRating: number;
  ownerReviewsCount: number;
  ownerVerified: boolean;
  isAvailable: boolean;
  deliveryAvailable: boolean; // Si se puede enviar con cadete o solo retiro en persona
  requirements?: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type RentalBookingStatus = 'pendiente' | 'confirmado' | 'en_curso' | 'devuelto' | 'cancelado';
export type RentalPaymentStatus = 'pendiente_pago' | 'pagado_en_custodia' | 'liquidado_a_dueno' | 'reembolsado';
export type RentalDepositStatus = 'en_custodia' | 'devuelto_a_cliente' | 'retenido_por_dano';

export interface DamageReport {
  reportedAt: string;
  damageType: 'rotura_parcial' | 'mal_uso' | 'falta_accesorios' | 'no_devuelto_perdida';
  description: string;
  estimatedCost: number;
  depositRetained: number;
  extraAmountClaimed?: number;
}

export interface RentalBooking {
  id: string;
  rentalItemId: string;
  rentalItemTitle: string;
  rentalItemImage: string;
  dailyPrice: number;
  ownerId?: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  ownerCbuOrAlias?: string;
  clientName: string;
  clientPhone: string;
  clientWhatsapp?: string;
  clientDni?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalSubtotal: number; // Costo bruto del alquiler (ARS)
  platformFeeRate: number; // Tasa de comisión ServiGo (ej: 0.10 = 10%)
  platformFeeAmount: number; // Comisión retenida por ServiGo (ARS)
  ownerNetAmount: number; // Ganancia neta para el dueño (ARS, 90%)
  depositAmount: number; // Garantía en custodia reembolsable (ARS)
  totalPrice: number; // Total a pagar por el cliente = rentalSubtotal + depositAmount
  deliveryMethod: 'retiro_dueno' | 'envio_cadete';
  deliveryAddress?: string;
  notes?: string;
  status: RentalBookingStatus;
  paymentStatus: RentalPaymentStatus;
  depositStatus: RentalDepositStatus;
  contractAccepted?: boolean;
  contractAcceptedAt?: string;
  contractSignerDni?: string;
  contractSignerName?: string;
  damageReport?: DamageReport;
  createdAt: string;
  updatedAt?: string;
}

export interface RentalPayoutRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerDni?: string;
  cbuOrAlias: string;
  bankOrMp: string;
  amount: number;
  status: 'pendiente' | 'procesando' | 'transferido' | 'rechazado';
  requestedAt: string;
  paidAt?: string;
  processedAt?: string;
  notes?: string;
}

