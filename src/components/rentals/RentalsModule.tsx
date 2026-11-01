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
import { isPubliclyApproved, RentalItem, RentalCategory, RentalBooking, RentalOwner, RentalPayoutRequest, DamageReport } from '../../types';
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
  const openPublish = () =>
    requireAuth(() => setIsPublishModalOpen(true), 'Ingresá con tu cuenta para publicar tu herramienta.');

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
        if (!isPubliclyApproved(item)) return false;

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

  const pendingSignature = Boolean(
    currentUser &&
      bookings.some((b) => b.clientUid === currentUser.uid && b.status === 'entrega_pendiente' && b.entrega && !b.entrega.clientSignedAt)
  );
  const visibleCount = items.filter((i) => i.isAvailable !== false && isPubliclyApproved(i)).length;

  const openMyRentals = () =>
    currentUser ? setIsMyRentalsOpen(true) : requireAuth(() => setIsMyRentalsOpen(true), 'Ingresá para ver tus alquileres');
  const openMyVouchers = () =>
    currentUser
      ? setIsMyVouchersOpen(true)
      : requireAuth(() => setIsMyVouchersOpen(true), 'Ingresá para ver tus cupones de Ferretería Bruzzone');

  const quickActions: { label: string; icon: React.ElementType; onClick: () => void; dot?: boolean }[] = [
    { label: 'Cómo funciona', icon: Info, onClick: () => setHowItWorksTab('alquilar') },
    { label: 'Mis alquileres', icon: FileText, onClick: openMyRentals, dot: pendingSignature },
    { label: 'Mis cupones', icon: Sparkles, onClick: openMyVouchers },
    { label: 'Mi panel', icon: DollarSign, onClick: () => setIsOwnerDashboardOpen(true) },
  ];

  const selectCls =
    'h-11 bg-sg-navy-2 border border-white/15 text-white text-sm font-semibold px-3 rounded-xl focus:outline-hidden focus:border-sg-green cursor-pointer';

  return (
    <div className="min-h-screen bg-sg-navy text-white font-sans pb-36 sm:pb-16">
      <div className="max-w-6xl mx-auto px-5 pt-6 space-y-5">
        {/* Encabezado */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-sg-green flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-[#052e16]" strokeWidth={2.4} aria-hidden="true" />
            </span>
            <h1 className="m-0 text-[32px] sm:text-4xl font-black tracking-[-0.03em] leading-none">Alquiler</h1>
          </div>
          <p className="m-0 text-[15px] leading-snug text-[#c3cfea] max-w-2xl">
            Alquilá por día a vecinos de la zona. Pagás con Mercado Pago y la seña se devuelve al entregar.
          </p>
        </header>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-4 gap-2 max-w-xl">
          {quickActions.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.label}
                type="button"
                onClick={q.onClick}
                className="relative flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-sg-navy-2 hover:bg-[#1a3060] text-[12px] font-bold leading-tight text-center cursor-pointer"
              >
                <Icon className="w-5 h-5 text-sg-green" aria-hidden="true" />
                {q.label}
                {q.dot && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-sg-orange text-[#2a1300] text-[9px] font-black">
                    FIRMAR
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador y filtros */}
        <div className="space-y-2.5">
          <label htmlFor="rent-buscar" className="sr-only">Buscar producto para alquilar</label>
          <div className="flex items-center gap-2.5 h-[52px] px-4 rounded-2xl bg-white text-sg-navy">
            <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
            <input
              id="rent-buscar"
              type="search"
              placeholder="Hormigonera, hidrolavadora, gazebo…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none text-base font-medium placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="rent-zona">Localidad</label>
            <select id="rent-zona" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className={selectCls}>
              <option value="all">Todas las localidades</option>
              {availableZones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="rent-orden">Ordenar</label>
            <select id="rent-orden" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={selectCls}>
              <option value="rating">Mejor calificados</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="recent">Más recientes</option>
            </select>
            <label className="h-11 inline-flex items-center gap-2 px-3 rounded-xl border border-white/15 text-sm font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyWithDelivery}
                onChange={(e) => setOnlyWithDelivery(e.target.checked)}
                className="w-4 h-4 accent-[#3ccf6e] cursor-pointer"
              />
              <Truck className="w-4 h-4 text-sg-green" aria-hidden="true" />
              Con envío
            </label>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5" role="group" aria-label="Categorías">
          {[{ id: 'all' as const, name: 'Todo' }, ...RENTAL_CATEGORIES].map((cat) => {
            const on = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`shrink-0 h-10 px-4 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
                  on ? 'bg-sg-green text-[#052e16] font-extrabold' : 'border border-white/20 text-white font-semibold hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Listado */}
        {visibleCount === 0 ? (
          <div className="rounded-3xl bg-sg-navy-2 p-7 text-center space-y-3">
            <h3 className="m-0 text-xl font-black">Estamos arrancando</h3>
            <p className="m-0 text-sm text-[#c3cfea] max-w-md mx-auto">
              ¿Tenés una hormigonera, una hidrolavadora o un gazebo que usás poco? Publicalo gratis y cobrá cada vez que alguien lo alquile.
            </p>
            <button
              type="button"
              onClick={() => setHowItWorksTab('publicar')}
              className="text-sm font-extrabold text-sg-green hover:text-white cursor-pointer"
            >
              Ver cómo publicar →
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl bg-sg-navy-2 p-7 text-center space-y-3">
            <h3 className="m-0 text-lg font-black">No encontramos productos con esos filtros</h3>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedZone('all');
                setOnlyWithDelivery(false);
              }}
              className="h-11 px-5 rounded-xl bg-sg-green text-[#052e16] font-extrabold text-sm cursor-pointer"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemForDetail(item)}
                className="group text-left rounded-[18px] overflow-hidden bg-sg-navy-2 hover:bg-[#1a3060] transition-colors cursor-pointer flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] bg-[#1c3366] overflow-hidden">
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {item.featured && (
                    <span className="absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      Destacado
                    </span>
                  )}
                  {item.deliveryAvailable && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sg-navy/85 text-white inline-flex items-center gap-1">
                      <Truck className="w-3 h-3" aria-hidden="true" /> Envío
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <span className="text-[15px] font-extrabold leading-tight line-clamp-2">{item.title}</span>
                  <span className="text-xs text-[#a9b8db] inline-flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                    {item.location}
                    {item.ownerRating > 0 && (
                      <>
                        <Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
                        {item.ownerRating.toFixed(1)}
                      </>
                    )}
                  </span>
                  <span className="mt-auto pt-1.5 text-[17px] font-black text-sg-green">
                    ${item.dailyPrice.toLocaleString('es-AR')}
                    <span className="text-xs font-semibold text-[#c3cfea]"> /día</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Así de simple */}
        <section className="rounded-[20px] bg-sg-navy-2 p-5 grid gap-5 md:grid-cols-2">
          <div>
            <h2 className="m-0 text-[13px] font-extrabold uppercase tracking-[0.06em] text-sg-green">Si querés alquilar</h2>
            <ol className="m-0 mt-3 p-0 list-none flex flex-col gap-2.5">
              {['Elegís las fechas y pagás seguro', 'Firmás el acta con fotos al retirar', 'Devolvés y te reintegran la seña', 'Ganás un cupón en Ferretería Bruzzone'].map((t, i) => (
                <li key={t} className="flex items-center gap-3 text-sm font-semibold">
                  <span className="w-7 h-7 rounded-full bg-sg-navy flex items-center justify-center font-black shrink-0">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="m-0 text-[13px] font-extrabold uppercase tracking-[0.06em] text-sg-green">Si querés publicar</h2>
            <ol className="m-0 mt-3 p-0 list-none flex flex-col gap-2.5">
              {['Publicás gratis con fotos y precio por día', 'Vinculás tu Mercado Pago para cobrar', 'Hacés el acta de entrega y devolución', `Te quedás con el ${ownerPct}% (ServiGo cobra ${100 - ownerPct}% solo si se alquila)`].map((t, i) => (
                <li key={t} className="flex items-center gap-3 text-sm font-semibold">
                  <span className="w-7 h-7 rounded-full bg-sg-navy flex items-center justify-center font-black shrink-0">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-extrabold">
            <button type="button" onClick={() => setHowItWorksTab('alquilar')} className="text-sg-green hover:text-white cursor-pointer">Guía completa →</button>
            <button type="button" onClick={() => setHowItWorksTab('precios')} className="text-sg-green hover:text-white cursor-pointer">Precios y comisión →</button>
            <button type="button" onClick={() => setIsCalculatorOpen(true)} className="text-sg-green hover:text-white cursor-pointer inline-flex items-center gap-1">
              <Calculator className="w-4 h-4" aria-hidden="true" /> Calcular ganancias
            </button>
            <button type="button" onClick={() => setIsContractModalOpen(true)} className="text-sg-green hover:text-white cursor-pointer inline-flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Contrato y garantía
            </button>
          </div>
        </section>

        {/* Otros módulos */}
        {(onOpenServiciosModule || onOpenCadetesModule) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-[#a9b8db] w-full sm:w-auto">¿Necesitás a alguien que la use o la lleve?</span>
            {onOpenServiciosModule && (
              <button type="button" onClick={onOpenServiciosModule} className="h-11 px-4 rounded-xl bg-sg-blue text-white font-bold cursor-pointer">
                Contratar un profesional
              </button>
            )}
            {onOpenCadetesModule && (
              <button type="button" onClick={onOpenCadetesModule} className="h-11 px-4 rounded-xl bg-sg-orange text-[#2a1300] font-bold cursor-pointer">
                Pedir un cadete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botón principal: fijo sobre la barra inferior en celular */}
      <div className="fixed sm:static inset-x-0 bottom-[74px] z-30 px-5 sm:max-w-6xl sm:mx-auto sm:mt-6 pointer-events-none">
        <button
          type="button"
          onClick={openPublish}
          className="pointer-events-auto w-full sm:w-auto sm:px-8 h-[54px] rounded-2xl bg-sg-green text-[#052e16] font-black text-[17px] inline-flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" strokeWidth={2.8} aria-hidden="true" />
          Publicar mi herramienta gratis
        </button>
      </div>

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
        onOpenPublish={openPublish}
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
        onOpenPublish={openPublish}
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

