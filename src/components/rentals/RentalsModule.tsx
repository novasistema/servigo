import React, { useState, useMemo } from 'react';
import { RentalHowItWorksModal } from './RentalHowItWorksModal';
import { MyVouchersModal } from './MyVouchersModal';
import { MyRentalsModal } from './MyRentalsModal';
import { subscribeRentalPlatformFee } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  Calculator,
  ShieldCheck,
  Filter,
  Sparkles,
  Truck,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  FileText,
  RotateCcw,
  Star,
  Info
} from 'lucide-react';
import { RentalItem, RentalCategory, RentalBooking, RentalOwner, RentalPayoutRequest, DamageReport } from '../../types';
import { RENTAL_CATEGORIES } from '../../data/mockRentals';
import { RentalDetailModal } from './RentalDetailModal';
import { PublishRentalModal } from './PublishRentalModal';
import { RentalEarningsCalculatorModal } from './RentalEarningsCalculatorModal';
import { RentalAgreementModal } from './RentalAgreementModal';
import { RentalOwnerDashboardModal } from './RentalOwnerDashboardModal';

interface RentalsModuleProps {
  items: RentalItem[];
  bookings: RentalBooking[];
  owners?: RentalOwner[];
  onSaveRentalItem: (item: RentalItem, owner?: RentalOwner) => Promise<void>;
  onDeleteRentalItem?: (itemId: string) => Promise<void>;
  onBookRental: (booking: RentalBooking) => Promise<void>;
  onRequestPayout?: (payout: RentalPayoutRequest) => Promise<void>;
  onConfirmItemReturned?: (bookingId: string) => Promise<void>;
  onReportDamage?: (bookingId: string, damageReport: DamageReport) => Promise<void>;
  showToast: (msg: string) => void;
  onOpenCadetesModule?: () => void;
  onOpenDeliveryModule?: () => void;
  onOpenServiciosModule?: () => void;
}

export const RentalsModule: React.FC<RentalsModuleProps> = ({
  items,
  bookings,
  owners = [],
  onSaveRentalItem,
  onDeleteRentalItem,
  onBookRental,
  onRequestPayout,
  onConfirmItemReturned,
  onReportDamage,
  showToast,
  onOpenCadetesModule,
  onOpenDeliveryModule,
  onOpenServiciosModule,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RentalCategory | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [onlyWithDelivery, setOnlyWithDelivery] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'recent'>('rating');

  // Modals state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<RentalItem | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [contractItem, setContractItem] = useState<RentalItem | null>(null);
  const [howItWorksTab, setHowItWorksTab] = useState<null | 'alquilar' | 'publicar' | 'precios' | 'preguntas'>(null);
  const [isMyVouchersOpen, setIsMyVouchersOpen] = useState(false);
  const [isMyRentalsOpen, setIsMyRentalsOpen] = useState(false);
  const [feeRate, setFeeRate] = useState(0.05);
  React.useEffect(() => subscribeRentalPlatformFee(setFeeRate), []);
  const ownerPct = 100 - Math.round(feeRate * 100);
  const { currentUser, requireAuth } = useAuth();

  // Available unique zones
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.location) set.add(item.location);
      if (item.zones) item.zones.forEach((z) => set.add(z));
    });
    return Array.from(set);
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Publicaciones pausadas por el dueño o el creador
        if (item.isAvailable === false) return false;

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Zone filter
        if (selectedZone !== 'all') {
          const matchLocation = item.location.toLowerCase() === selectedZone.toLowerCase();
          const matchZone = item.zones.some((z) => z.toLowerCase() === selectedZone.toLowerCase());
          if (!matchLocation && !matchZone) return false;
        }

        // Delivery filter
        if (onlyWithDelivery && !item.deliveryAvailable) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchOwner = item.ownerName.toLowerCase().includes(q);
          const matchCat = item.categoryLabel.toLowerCase().includes(q);
          const matchAcc = item.includedAccessories?.some((a) => a.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchOwner && !matchCat && !matchAcc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
        if (sortBy === 'rating') {
          return (b.ownerRating || 0) - (a.ownerRating || 0);
        }
        if (sortBy === 'price_asc') {
          return a.dailyPrice - b.dailyPrice;
        }
        if (sortBy === 'price_desc') {
          return b.dailyPrice - a.dailyPrice;
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [items, selectedCategory, selectedZone, onlyWithDelivery, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Auspiciador Strip */}
      <div className="bg-orange-800 text-orange-100 text-xs font-bold py-1.5 px-4 flex items-center justify-between border-b border-orange-600/40">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-white text-orange-800 text-[10px] px-2 py-0.5 rounded-full tracking-wide uppercase font-black shadow-xs">
            ALQUILERES SEGUROS
          </span>
          <span className="truncate">Alquilá herramientas y artículos entre vecinos de la zona, con pago seguro y garantía</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsContractModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-white cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garantías & Contrato Legal</span>
          </button>
        </div>
      </div>

      {/* Hero Banner with Official Logo */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-8 pb-10 px-4 border-b border-slate-800 relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            {/* Logo and Pitch */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-28 sm:w-36 h-28 sm:h-36 rounded-3xl bg-white p-2 shadow-2xl border-2 border-orange-500/50 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_igtdraigtdraigtd_37ae301b.jpg"
                  alt="ServiGo Alquiler de Productos"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Economía Circular & P2P • No lo compres, alquilalo</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  ServiGo <span className="text-orange-500">Alquiler</span> de Productos
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  ¿Por qué comprar una hormigonera, un proyector o un gazebo si solo lo usas un fin de semana? Alquilalo por día a un vecino de la zona, pagá seguro con Mercado Pago y recuperá tu garantía al devolverlo. Y si tenés algo guardado sin usar, <strong>publicalo gratis y generá ingresos</strong>.
                </p>
              </div>
            </div>

            {/* Quick Action Cards / CTA */}
            <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-center">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Producto (+ 3 Fotos)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOwnerDashboardOpen(true)}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
              >
                <span>💼 Mi Billetera & Ganancias ({ownerPct}%)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculadora de Ganancias</span>
              </button>

              <button
                type="button"
                onClick={() => setHowItWorksTab('alquilar')}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>❓ ¿Cómo funciona? Guía completa</span>
              </button>

              <button
                type="button"
                onClick={() => (currentUser ? setIsMyRentalsOpen(true) : requireAuth(() => setIsMyRentalsOpen(true), 'Ingresá para ver tus alquileres'))}
                className="relative flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>📋 Mis alquileres</span>
                {currentUser && bookings.some((b) => b.clientUid === currentUser.uid && b.status === 'entrega_pendiente' && b.entrega && !b.entrega.clientSignedAt) && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black">FIRMAR</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => (currentUser ? setIsMyVouchersOpen(true) : requireAuth(() => setIsMyVouchersOpen(true), 'Ingresá para ver tus cupones de Ferretería Bruzzone'))}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🎟️ Mis cupones Bruzzone</span>
              </button>

              <button
                type="button"
                onClick={() => setIsContractModalOpen(true)}
                className="w-full sm:w-auto py-1.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <FileText className="w-3 h-3 text-orange-400" />
                <span>Modelo de Contrato & Garantía</span>
              </button>
            </div>
          </div>


          {/* Search Bar in Hero */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="¿Qué producto buscas alquilar? (ej: hormigonera, hidrolavadora, gazebo, parlante...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/70 text-white placeholder-slate-400 text-xs sm:text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-hidden focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold py-3 px-3 rounded-xl focus:outline-hidden focus:border-orange-500 w-full sm:w-auto cursor-pointer"
              >
                <option value="all">📍 Todas las localidades</option>
                {availableZones.map((z) => (
                  <option key={z} value={z}>
                    📍 {z}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold py-3 px-3 rounded-xl focus:outline-hidden focus:border-orange-500 w-full sm:w-auto cursor-pointer"
              >
                <option value="rating">★ Mejor Calificados</option>
                <option value="price_asc">💵 Menor Precio / día</option>
                <option value="price_desc">💵 Mayor Precio / día</option>
                <option value="recent">🕒 Recientes</option>
              </select>
            </div>
          </div>

          {/* Quick Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Todos ({items.length})
            </button>
            {RENTAL_CATEGORIES.map((cat) => {
              const count = items.filter((it) => it.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter and stats row */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium">
          <span>Mostrando <strong>{filteredItems.length}</strong> artículos disponibles</span>
          {selectedCategory !== 'all' && (
            <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Categoría filtrada
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 font-bold cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              checked={onlyWithDelivery}
              onChange={(e) => setOnlyWithDelivery(e.target.checked)}
              className="w-3.5 h-3.5 text-orange-600 rounded-sm accent-orange-600 cursor-pointer"
            />
            <Truck className="w-3.5 h-3.5 text-orange-600" />
            <span>Con Envío a Domicilio (Cadete ServiGo)</span>
          </label>
        </div>
      </div>

      {/* Main Grid of Rental Products */}
      <div className="max-w-6xl mx-auto px-4">
        {items.filter((i) => i.isAvailable !== false).length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl">📦</div>
            <h3 className="text-lg font-black text-slate-900">¡Estamos arrancando! Sé de los primeros en publicar</h3>
            <p className="text-sm text-slate-500">
              ¿Tenés una hormigonera, una hidrolavadora, un gazebo o equipo de sonido que usás poco? Publicalo gratis y cobrá cada vez que alguien lo alquile.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <button onClick={() => setIsPublishModalOpen(true)} className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-500">
                Publicar mi producto
              </button>
              <button onClick={() => setHowItWorksTab('publicar')} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200">
                ¿Cómo funciona?
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl font-black">
              🔍
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                No encontramos productos con esos filtros
              </h3>
              <p className="text-xs text-slate-500">
                Probá cambiando la categoría, borrando el término de búsqueda o cambiando la localidad.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedZone('all');
                  setOnlyWithDelivery(false);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 transition-colors cursor-pointer"
              >
                Ver todos los productos
              </button>
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Publicar este artículo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-orange-500/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                        {item.categoryLabel}
                      </span>
                    </div>

                    {item.deliveryAvailable && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-md flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5" /> Envío disponible
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Con Garantía
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Owner & Location */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                        👤 {item.ownerName}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.ownerRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Accessories count */}
                    {item.includedAccessories && item.includedAccessories.length > 0 && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <span className="font-bold text-orange-600">✓ Incluye:</span>
                        <span className="truncate">{item.includedAccessories.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Price and CTA */}
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-3 mt-2">
                  <div className="flex items-baseline justify-between pt-3">
                    <div>
                      <span className="text-2xl font-black text-orange-600">
                        ${item.dailyPrice.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase"> / día</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Garantía reembolsable:</span>
                      <span className="text-xs font-bold text-slate-700">${item.depositAmount.toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedItemForDetail(item)}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all cursor-pointer active:scale-98"
                  >
                    <span>Ver Detalles & Alquilar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ¿Cómo funciona? */}
      <section className="max-w-6xl mx-auto px-4 mt-14">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              ¿CÓMO FUNCIONA EL ALQUILER EN SERVIGO?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Simple, con pago seguro y garantía</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Vecinos y comercios de la zona alquilan lo que tienen guardado. ServiGo cobra el pago por Mercado Pago y cuida la garantía hasta que el producto vuelve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-black text-base text-white">🛒 Si querés alquilar</h4>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Ingresá con Google o email (es gratis).</li>
                <li>Elegí el producto y las fechas.</li>
                <li>Pagá alquiler + garantía con Mercado Pago.</li>
                <li>Retiralo o pedí envío con un cadete.</li>
                <li>Devolvelo bien y recuperás la garantía, más un cupón de descuento en Ferretería Bruzzone.</li>
              </ol>
              <button onClick={() => setHowItWorksTab('alquilar')} className="text-xs font-black text-orange-400 hover:text-orange-300">Ver guía completa →</button>
            </div>
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-black text-base text-white">💰 Si querés publicar</h4>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Publicar es gratis: subí fotos, precio por día y garantía.</li>
                <li>Vinculá tu Mercado Pago para cobrar directo.</li>
                <li>Entregá el producto y sacale fotos.</li>
                <li>Cuando vuelve, confirmalo o reportá daños.</li>
                <li>Te quedás con el {ownerPct}% del alquiler. ServiGo cobra {100 - ownerPct}% solo si se alquila.</li>
              </ol>
              <div className="flex gap-3">
                <button onClick={() => setHowItWorksTab('publicar')} className="text-xs font-black text-orange-400 hover:text-orange-300">Ver guía completa →</button>
                <button onClick={() => setHowItWorksTab('precios')} className="text-xs font-black text-emerald-400 hover:text-emerald-300">Precios y comisión →</button>
              </div>
            </div>
          </div>

          {/* Cross link to other modules */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              ¿Precisas a alguien que use la herramienta o mandados urgentes?
            </span>
            <div className="flex gap-2">
              {onOpenServiciosModule && (
                <button
                  onClick={onOpenServiciosModule}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer"
                >
                  🛠️ Contratar Albañil o Gasista
                </button>
              )}
              {onOpenCadetesModule && (
                <button
                  onClick={onOpenCadetesModule}
                  className="px-3 py-1.5 rounded-xl bg-orange-600/80 hover:bg-orange-600 text-white font-bold transition-colors cursor-pointer"
                >
                  🛵 Pedir Cadete para Traslado
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <RentalDetailModal
        item={selectedItemForDetail}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={() => setSelectedItemForDetail(null)}
        onBookRental={onBookRental}
        onOpenContract={(item) => {
          setContractItem(item);
          setIsContractModalOpen(true);
        }}
        showToast={showToast}
      />

      <PublishRentalModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSaveRentalItem={onSaveRentalItem}
        showToast={showToast}
      />

      <RentalEarningsCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
      />

      <RentalAgreementModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        itemTitle={contractItem?.title}
        dailyPrice={contractItem?.dailyPrice}
        depositAmount={contractItem?.depositAmount}
      />

      <RentalHowItWorksModal
        isOpen={Boolean(howItWorksTab)}
        initialTab={howItWorksTab || 'alquilar'}
        onClose={() => setHowItWorksTab(null)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
      />

      <MyRentalsModal isOpen={isMyRentalsOpen} onClose={() => setIsMyRentalsOpen(false)} bookings={bookings} uid={currentUser?.uid} showToast={showToast} />

      <MyVouchersModal isOpen={isMyVouchersOpen} onClose={() => setIsMyVouchersOpen(false)} showToast={showToast} />

      <RentalOwnerDashboardModal
        isOpen={isOwnerDashboardOpen}
        onClose={() => setIsOwnerDashboardOpen(false)}
        items={items}
        bookings={bookings}
        owners={owners}
        onRequestPayout={onRequestPayout || (async () => {})}
        onConfirmItemReturned={onConfirmItemReturned || (async () => {})}
        onReportDamage={onReportDamage}
        showToast={showToast}
      />
    </div>
  );
};

