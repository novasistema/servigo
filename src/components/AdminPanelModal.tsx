import React, { useState, useMemo } from 'react';
import { TabVisibilityConfig, PromotedBanner, AppConfig, Worker, Shop, RemisDriver, CustomTradeOption, SystemCoupon, IssuedVoucher, RentalBooking, RentalPayoutRequest, RentalItem, RentalOwner } from '../types';
import { getMergedLocalities } from '../lib/zoneUtils';
import { getAllTradeOptions, slugifyTradeName, BASE_TRADES } from '../lib/tradeUtils';
import { subscribeRentalPlatformFee, saveRentalPlatformFeeToFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AdminRentalItemsPanel } from './admin/AdminRentalItemsPanel';
import { AdminConvenioPanel } from './admin/AdminConvenioPanel';
import { AdminApprovalsPanel } from './admin/AdminApprovalsPanel';
import { AdminListingsPanel } from './admin/AdminListingsPanel';
import { compressImageFile } from '../utils/imageCompression';
import {
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  Megaphone,
  Sparkles,
  Save,
  ShieldAlert,
  Layers,
  Link as LinkIcon,
  Image as ImageIcon,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  UserCheck,
  RefreshCw,
  Store,
  Users,
  Search,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  UserX,
  UserPlus,
  Car,
  Ticket,
  Wallet,
  ArrowDownToLine,
  HandCoins,
  Package,
  AlertCircle,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
  tabConfig: TabVisibilityConfig;
  appConfig?: AppConfig | null;
  onSaveAppConfig?: (config: AppConfig) => Promise<void>;
  onSaveTabConfig: (newTabs: TabVisibilityConfig) => Promise<void>;
  banners: PromotedBanner[];
  onSaveBanner: (banner: PromotedBanner) => Promise<void>;
  onDeleteBanner: (bannerId: string) => Promise<void>;
  workers: Worker[];
  onSaveWorker?: (worker: Worker) => Promise<void>;
  onDeleteWorker: (workerId: string) => Promise<void>;
  onAddNewTrade?: (newTrade: CustomTradeOption) => Promise<void>;
  shops?: Shop[];
  onSaveShop?: (shop: Shop) => Promise<void>;
  onDeleteShop?: (shopId: string) => Promise<void>;
  remises?: RemisDriver[];
  onSaveRemis?: (remis: RemisDriver) => Promise<void>;
  onDeleteRemis?: (remisId: string) => Promise<void>;
  coupons?: SystemCoupon[];
  onSaveCoupon?: (coupon: SystemCoupon) => Promise<void>;
  onDeleteCoupon?: (couponId: string) => Promise<void>;
  issuedVouchers?: IssuedVoucher[];
  onSaveIssuedVoucher?: (voucher: IssuedVoucher) => Promise<void>;
  rentalBookings?: RentalBooking[];
  rentalPayouts?: RentalPayoutRequest[];
  rentalItems?: RentalItem[];
  rentalOwners?: RentalOwner[];
  onUpdatePayoutStatus?: (payoutId: string, status: 'procesando' | 'transferido' | 'rechazado') => Promise<void>;
  onConfirmRentalReturn?: (bookingId: string) => Promise<void>;
  onClearAllData?: () => Promise<void>;
  onResetToDefaults?: () => Promise<void>;
  showToast: (msg: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  tabConfig,
  appConfig,
  onSaveAppConfig,
  onSaveTabConfig,
  banners,
  onSaveBanner,
  onDeleteBanner,
  workers,
  onSaveWorker,
  onDeleteWorker,
  onAddNewTrade,
  shops = [],
  onSaveShop,
  onDeleteShop,
  remises = [],
  onSaveRemis,
  onDeleteRemis,
  coupons = [],
  onSaveCoupon,
  onDeleteCoupon,
  issuedVouchers = [],
  onSaveIssuedVoucher,
  rentalBookings = [],
  rentalPayouts = [],
  rentalItems = [],
  rentalOwners = [],
  onUpdatePayoutStatus,
  onConfirmRentalReturn,
  onClearAllData,
  onResetToDefaults,
  showToast,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'approvals' | 'listings' | 'tabs' | 'banners' | 'coupons' | 'subscriptions' | 'workers' | 'shops' | 'remises' | 'rentals_wallet' | 'rental_items' | 'convenio' | 'reset'>('approvals');
  const [pendingCount, setPendingCount] = useState(0);
  const { currentUser, isAdmin, loginWithGoogle, logout } = useAuth();
  const creatorVerified = Boolean(isAdmin && currentUser?.emailVerified);
  React.useEffect(() => {
    setIsAdminAuthenticated(creatorVerified);
  }, [creatorVerified]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'paid' | 'pending' | 'expired'>('all');
  
  // Custom Logo and Branding states
  const [logoUrlInput, setLogoUrlInput] = useState(appConfig?.customLogoUrl || '');
  const [taglineInput, setTaglineInput] = useState(appConfig?.tagline || '');
  const [ferreteroTitleInput, setFerreteroTitleInput] = useState(appConfig?.ferreteroPartnerTitle || 'Socio Ferretería Bruzzone');
  const [ferreteroDiscountInput, setFerreteroDiscountInput] = useState(appConfig?.ferreteroPartnerDiscountText || '10% OFF en mano de obra con insumos Bruzzone');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Rental platform fee rate state (app_config/rentals.platformFeeRate, default 0.05 = 5%)
  const [rentalFeePercent, setRentalFeePercent] = useState<number>(5);
  const [isSavingFeeRate, setIsSavingFeeRate] = useState<boolean>(false);

  React.useEffect(() => {
    const unsub = subscribeRentalPlatformFee((rate) => {
      setRentalFeePercent(Math.round(rate * 100));
    });
    return () => unsub();
  }, []);

  // Sync state when appConfig loads
  React.useEffect(() => {
    if (appConfig) {
      setLogoUrlInput(appConfig.customLogoUrl || '');
      setTaglineInput(appConfig.tagline || '');
      setFerreteroTitleInput(appConfig.ferreteroPartnerTitle || 'Socio Ferretería Bruzzone');
      setFerreteroDiscountInput(appConfig.ferreteroPartnerDiscountText || '10% OFF en mano de obra con insumos Bruzzone');
    }
  }, [appConfig]);

  // Worker Management States
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [isDeletingWorker, setIsDeletingWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isSavingWorker, setIsSavingWorker] = useState(false);
  const [isCreatingNewWorker, setIsCreatingNewWorker] = useState(false);
  const [isCreatingTradeInWorkerModal, setIsCreatingTradeInWorkerModal] = useState(false);
  const [newTradeNameInput, setNewTradeNameInput] = useState('');
  const [newTradeIconInput, setNewTradeIconInput] = useState('🛠️');
  const [isSavingNewTrade, setIsSavingNewTrade] = useState(false);

  // Available Trade Options (Base + Custom + Active Workers)
  const allTradeOptions = useMemo(() => {
    return getAllTradeOptions(appConfig?.customTrades || [], workers);
  }, [appConfig?.customTrades, workers]);

  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isSavingShop, setIsSavingShop] = useState(false);

  // Remis Management States
  const [remisSearchTerm, setRemisSearchTerm] = useState('');
  const [remisToDelete, setRemisToDelete] = useState<RemisDriver | null>(null);
  const [isDeletingRemis, setIsDeletingRemis] = useState(false);
  const [editingRemis, setEditingRemis] = useState<RemisDriver | null>(null);
  const [isSavingRemis, setIsSavingRemis] = useState(false);

  // Coupon & Voucher Management States
  const [editingCoupon, setEditingCoupon] = useState<Partial<SystemCoupon> | null>(null);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');

  // Reset Confirmation States
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isResettingDefaults, setIsResettingDefaults] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<'none' | 'all' | 'defaults'>('none');

  // Local state for tabs config editing
  const [localTabs, setLocalTabs] = useState<TabVisibilityConfig>(tabConfig);

  // Form state for creating/editing banner
  const [editingBanner, setEditingBanner] = useState<Partial<PromotedBanner> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Handle PIN verification (Default PIN: 1234)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (false) {
      setIsAdminAuthenticated(true);
      setPinError(false);
      setLocalTabs(tabConfig);
      showToast('¡Modo Administrador Creador activado exitosamente!');
    } else {
      setPinError(true);
    }
  };

  const handleToggleTab = (tabKey: keyof TabVisibilityConfig) => {
    const updated = { ...localTabs, [tabKey]: localTabs[tabKey] === false };
    setLocalTabs(updated);
  };

  const handleSaveTabChanges = async () => {
    setIsSaving(true);
    try {
      await onSaveTabConfig(localTabs);
      showToast('¡Configuración de solapas actualizada en la nube!');
    } catch (err) {
      console.error(err);
      showToast('Error al guardar configuración de solapas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartNewBanner = () => {
    // Default 30 days expiration date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const defaultDateStr = futureDate.toISOString().split('T')[0];

    setEditingBanner({
      id: `banner-${Date.now()}`,
      title: '',
      subtitle: '',
      badgeText: 'SUSCRIPCIÓN VIP',
      badgeColor: 'amber',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200',
      linkUrl: 'https://wa.me/5491133334444',
      buttonText: 'Contactar por WhatsApp',
      active: true,
      priority: banners.length + 1,
      createdAt: new Date().toISOString(),
      advertiserName: '',
      advertiserPhone: '',
      paymentStatus: 'paid',
      subscriptionPlan: 'mensual',
      pricePaid: 10000,
      expirationDate: defaultDateStr,
    });
  };

  const handleStartNewWorker = () => {
    setIsCreatingNewWorker(true);
    setIsCreatingTradeInWorkerModal(false);
    const defaultTrade = allTradeOptions[0] || { id: 'gasista', defaultTitle: 'Gasista Matriculado', label: 'Gasista' };
    setEditingWorker({
      id: `worker-${Date.now()}`,
      name: '',
      trade: defaultTrade.id,
      tradeTitle: defaultTrade.defaultTitle || defaultTrade.label || '',
      matricula: '',
      phone: '',
      whatsapp: '',
      location: 'Alejandro Roca',
      zones: ['Alejandro Roca'],
      rating: 5.0,
      reviewCount: 1,
      completedJobs: 0,
      verified: true,
      ferreteroPartner: false,
      hourlyRate: 18000,
      visitFee: 12000,
      availability: {
        days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        hours: '08:00 - 18:00',
        urgencies24h: false,
      },
      bio: '',
      services: [],
      gallery: [],
      reviews: [],
      avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=250',
    });
  };

  const handleStartEditWorker = (w: Worker) => {
    setIsCreatingNewWorker(false);
    setIsCreatingTradeInWorkerModal(false);
    setEditingWorker({ ...w });
  };

  const handleSaveNewTrade = async () => {
    const trimmed = newTradeNameInput.trim();
    if (!trimmed) {
      showToast('Por favor escribe el nombre del nuevo rubro');
      return;
    }
    const slugId = slugifyTradeName(trimmed);
    if (!slugId) {
      showToast('El nombre ingresado no es válido');
      return;
    }

    const newOption: CustomTradeOption = {
      id: slugId,
      label: trimmed,
      icon: newTradeIconInput.trim() || '🛠️',
    };

    setIsSavingNewTrade(true);
    try {
      if (onAddNewTrade) {
        await onAddNewTrade(newOption);
      } else if (onSaveAppConfig && appConfig) {
        const existing = appConfig.customTrades || [];
        if (!existing.some((t) => t.id === slugId)) {
          await onSaveAppConfig({
            ...appConfig,
            customTrades: [...existing, newOption],
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (editingWorker) {
        setEditingWorker({
          ...editingWorker,
          trade: slugId,
          tradeTitle: editingWorker.tradeTitle || trimmed,
        });
      }

      setNewTradeNameInput('');
      setNewTradeIconInput('🛠️');
      setIsCreatingTradeInWorkerModal(false);
      showToast(`¡Rubro "${trimmed}" creado y asignado con éxito!`);
    } catch (err) {
      console.error('Error saving trade:', err);
      showToast('Error al crear el nuevo rubro');
    } finally {
      setIsSavingNewTrade(false);
    }
  };

  const handleDeleteCustomTrade = async (tradeId: string) => {
    if (!appConfig?.customTrades) return;
    const existsInWorkers = workers.some((w) => w.trade?.toLowerCase() === tradeId.toLowerCase());
    if (existsInWorkers) {
      showToast('⚠️ No se puede eliminar: hay trabajadores asignados a este rubro');
      return;
    }
    const updated = appConfig.customTrades.filter((t) => t.id !== tradeId);
    if (onSaveAppConfig) {
      await onSaveAppConfig({
        ...appConfig,
        customTrades: updated,
        updatedAt: new Date().toISOString(),
      });
      showToast('🗑️ Rubro personalizado eliminado');
    }
  };

  const handleStartNewCoupon = () => {
    setEditingCoupon({
      id: `coupon-${Date.now()}`,
      codePrefix: 'DESC15',
      title: '',
      discountType: 'percentage',
      discountValue: 15,
      targetType: 'all_shops',
      targetShopName: 'Comercios y Talleres Adheridos',
      minSpend: 0,
      description: 'Beneficio exclusivo por contratar profesionales verificados en ServiGo.',
      termsAndConditions: 'Presentar el código del cupón oficial en caja al momento de abonar en el comercio.',
      active: true,
      validDays: 30,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSaveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.title || !editingCoupon.codePrefix) {
      showToast('Por favor completa el título y el código del cupón');
      return;
    }
    setIsSavingCoupon(true);
    try {
      if (onSaveCoupon) {
        await onSaveCoupon(editingCoupon as SystemCoupon);
      }
      setEditingCoupon(null);
      showToast(`¡Cupón "${editingCoupon.title}" guardado!`);
    } catch (err) {
      console.error(err);
      showToast('Error al guardar el cupón');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDeleteCouponConfirm = async (couponId: string) => {
    if (confirm('¿Eliminar este cupón de beneficio?')) {
      try {
        if (onDeleteCoupon) {
          await onDeleteCoupon(couponId);
        }
        showToast('Cupón eliminado correctamente');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar cupón');
      }
    }
  };

  const handleToggleCouponActive = async (c: SystemCoupon) => {
    if (onSaveCoupon) {
      const updated = { ...c, active: !c.active };
      await onSaveCoupon(updated);
      showToast(`Cupón "${c.title}" ${updated.active ? 'activado' : 'desactivado'}`);
    }
  };

  const handleSaveBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title || !editingBanner.linkUrl) {
      showToast('Por favor completa el título y el enlace del banner.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveBanner(editingBanner as PromotedBanner);
      setEditingBanner(null);
      showToast('¡Banner y estado de suscripción guardados!');
    } catch (err) {
      console.error(err);
      showToast('Error al guardar el banner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBannerConfirm = async (bannerId: string) => {
    if (confirm('¿Estás seguro de eliminar este banner?')) {
      try {
        await onDeleteBanner(bannerId);
        showToast('Banner eliminado correctamente.');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar banner.');
      }
    }
  };

  const handleQuickTogglePayment = async (banner: PromotedBanner, newStatus: 'paid' | 'pending' | 'expired') => {
    const isPaidNow = newStatus === 'paid';
    const updatedBanner: PromotedBanner = {
      ...banner,
      paymentStatus: newStatus,
      active: isPaidNow, // Auto activate if paid, deactivate if unpaid
    };

    try {
      await onSaveBanner(updatedBanner);
      showToast(
        isPaidNow
          ? `✅ Banner de "${banner.advertiserName || banner.title}" marcado como PAGADO y ACTIVADO.`
          : `⚠️ Banner de "${banner.advertiserName || banner.title}" marcado como ${
              newStatus === 'pending' ? 'PENDIENTE / IMPAGO' : 'VENCIDO'
            } y PAUSADO.`
      );
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar el pago del banner.');
    }
  };

  // Subscription Stats calculations
  const totalRevenue = banners
    .filter((b) => (b.paymentStatus || 'paid') === 'paid')
    .reduce((acc, b) => acc + (b.pricePaid || 0), 0);

  const pendingPaymentsCount = banners.filter((b) => b.paymentStatus === 'pending').length;
  const expiredPaymentsCount = banners.filter((b) => b.paymentStatus === 'expired').length;
  const activeBannersCount = banners.filter((b) => b.active).length;

  const filteredBanners = banners.filter((b) => {
    if (subscriptionFilter === 'all') return true;
    return (b.paymentStatus || 'paid') === subscriptionFilter;
  });

  const filteredWorkers = workers.filter((w) => {
    const term = workerSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      w.name.toLowerCase().includes(term) ||
      w.trade.toLowerCase().includes(term) ||
      w.location.toLowerCase().includes(term) ||
      w.phone.includes(term)
    );
  });

  const filteredRemises = remises.filter((r) => {
    const term = remisSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      r.name.toLowerCase().includes(term) ||
      r.baseLocation.toLowerCase().includes(term) ||
      r.vehicle.make.toLowerCase().includes(term) ||
      r.vehicle.model.toLowerCase().includes(term) ||
      r.vehicle.plate.toLowerCase().includes(term) ||
      r.phone.includes(term)
    );
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Panel Administrador del Creador
                {isAdminAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                    Autenticado
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Control de solapas, publicidad en carrusel y cobro de suscripciones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN LOGIN STEP IF NOT AUTHENTICATED */}
        {!isAdminAuthenticated ? (
          <div className="p-6 sm:p-8 space-y-6 text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Acceso del Creador</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {currentUser
                  ? `Estás conectado como ${currentUser.email}. Este panel es solo para la cuenta del creador.`
                  : 'Iniciá sesión con la cuenta de Google del creador para administrar ServiGo.'}
              </p>
            </div>
            {currentUser ? (
              <button
                onClick={() => logout()}
                className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm"
              >
                Cerrar sesión y entrar con otra cuenta
              </button>
            ) : (
              <button
                onClick={() => loginWithGoogle().catch(() => showToast('No se pudo iniciar sesión'))}
                className="w-full py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Ingresar con Google</span>
              </button>
            )}
          </div>
        ) : (
          /* AUTHENTICATED PANEL BODY */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Tab Navigation Switches */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'approvals' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-emerald-300 hover:text-emerald-200'
                }`}
              >
                <span>✅ Para aprobar</span>
                {pendingCount > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black inline-flex items-center justify-center">{pendingCount}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'listings' ? 'bg-sky-400 text-slate-950 shadow-md' : 'text-sky-300 hover:text-sky-200'
                }`}
              >
                <span>📋 Publicaciones</span>
              </button>

              <button
                onClick={() => setActiveTab('tabs')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'tabs'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Solapas</span>
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'banners'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>2. Banners ({banners.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'coupons'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>3. Cupones ({coupons.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'subscriptions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>4. Pagos</span>
                {(pendingPaymentsCount > 0 || expiredPaymentsCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('workers')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'workers'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>5. Perfiles ({workers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('shops')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'shops'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>6. Comercios ({shops.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('remises')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'remises'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-amber-500" />
                <span>7. Remises ({remises.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('rentals_wallet')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'rentals_wallet'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>8. Billetera Alquileres ({rentalBookings.length})</span>
                {rentalPayouts.some((p) => p.status === 'pendiente') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('rental_items')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'rental_items' ? 'bg-orange-500 text-slate-950 shadow-md' : 'text-orange-300 hover:text-orange-200'
                }`}
              >
                <span>📦 Alquileres ({rentalItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('convenio')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'convenio' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-300 hover:text-amber-200'
                }`}
              >
                <span>🎟️ Convenio Bruzzone</span>
              </button>

              <button
                onClick={() => setActiveTab('reset')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'reset'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>9. Borrar</span>
              </button>
            </div>

            {/* Mantener montado para que el contador se actualice */}
            <div hidden={activeTab !== 'approvals'}>
              <AdminApprovalsPanel showToast={showToast} onCountChange={setPendingCount} />
            </div>

            {activeTab === 'listings' && <AdminListingsPanel showToast={showToast} />}

            {/* TAB 1: VISIBILIDAD DE SOLAPAS Y LOGO */}
            {activeTab === 'tabs' && (
              <div className="space-y-6">
                {/* LOGO & BRAND CUSTOMIZATION CARD */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        Logo Oficial y Eslogan de la Web
                      </h3>
                      <p className="text-xs text-slate-400">
                        Carga una imagen de logo personalizada o mantén el Logo Oficial de ServiGo.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        URL de Imagen del Logo (deja vacío para usar el Logo Oficial ServiGo)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoUrlInput}
                          onChange={(e) => setLogoUrlInput(e.target.value)}
                          placeholder="Ej: https://miservidor.com/mi-logo.png"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        {logoUrlInput && (
                          <button
                            type="button"
                            onClick={() => setLogoUrlInput('')}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                          >
                            Restablecer a Oficial
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Eslogan o Subtítulo del Encabezado
                      </label>
                      <input
                        type="text"
                        value={taglineInput}
                        onChange={(e) => setTaglineInput(e.target.value)}
                        placeholder="La solución que buscas, está aquí."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-3">
                      <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Store className="w-3.5 h-3.5 text-orange-400" />
                        Auspiciador Oficial: Socio Ferretería Bruzzone (FB)
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Título de la Insignia de Socio
                        </label>
                        <input
                          type="text"
                          value={ferreteroTitleInput}
                          onChange={(e) => setFerreteroTitleInput(e.target.value)}
                          placeholder="Socio Ferretería Bruzzone"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Descripción del Descuento
                        </label>
                        <input
                          type="text"
                          value={ferreteroDiscountInput}
                          onChange={(e) => setFerreteroDiscountInput(e.target.value)}
                          placeholder="10% OFF en mano de obra con insumos Bruzzone"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isSavingBranding}
                        onClick={async () => {
                          try {
                            setIsSavingBranding(true);
                            const updatedConfig: AppConfig = {
                              id: 'settings',
                              tabs: localTabs,
                              customLogoUrl: logoUrlInput.trim() || undefined,
                              tagline: taglineInput.trim() || undefined,
                              ferreteroPartnerTitle: ferreteroTitleInput.trim() || undefined,
                              ferreteroPartnerDiscountText: ferreteroDiscountInput.trim() || undefined,
                              customTrades: appConfig?.customTrades,
                              updatedAt: new Date().toISOString(),
                            };
                            if (onSaveAppConfig) {
                              await onSaveAppConfig(updatedConfig);
                            }
                            showToast('🎨 ¡Marca y parámetros de Ferretería Bruzzone actualizados!');
                          } catch (err) {
                            showToast('❌ Error al guardar la configuración.');
                          } finally {
                            setIsSavingBranding(false);
                          }
                        }}
                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        {isSavingBranding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Guardar Ajustes de Marca y Ferretería</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <p className="font-bold text-amber-400">💡 Instrucciones de Solapas:</p>
                  <p>
                    Activa o desactiva los interruptores para ocultar o mostrar las solapas del menú principal a todos los usuarios en tiempo real.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'search', label: '🔍 Buscar Oficios (Index / Catálogo)', desc: 'Vista principal con el buscador de profesionales' },
                    { key: 'shops', label: '🏪 Comercios & Negocios (Ferreterías, Talleres, Corralones)', desc: 'Guía comercial de la zona con mapa, WhatsApp y descuentos' },
                    { key: 'jobs', label: '💼 Bolsa de Trabajo (RRHH & Currículums Vitae)', desc: 'Módulo de publicación y búsqueda de CVs clasificados por oficio con Asistente IA' },
                    { key: 'delivery', label: '🛵 ServiGo Delivery (Envíos & Pedidos)', desc: 'Recepción de pedidos en tiempo real para comercios y flujo de compra para clientes' },
                    { key: 'alquiler', label: '🔄 ServiGo Alquiler', desc: 'Módulo de alquiler de herramientas y productos entre vecinos' },
                    { key: 'cadetes', label: '🛵 Cadetes & Mandados', desc: 'Cadetes de la zona para mandados, retiros y traslados' },
                    { key: 'remises', label: '🚕 Remises & Viajes', desc: 'Red de remiseros con mapa interactivo en vivo y pedidos directos' },
                    { key: 'register', label: '👷 Soy Trabajador (Publicar Perfil)', desc: 'Formulario de registro para nuevos prestadores' },
                    { key: 'sponsor', label: '🏬 Ferretería Bruzzone (Tienda Oficial)', desc: 'Espacio patrocinado con catálogo de materiales' },
                    { key: 'ai', label: '🤖 Diagnóstico IA (Asistente Técnico)', desc: 'Evaluador automatizado de presupuestos e insumos' },
                    { key: 'bookings', label: '📅 Mis Turnos (Solicitudes Enviadas)', desc: 'Historial de reservas e interactividad' },
                  ].map((item) => {
                    const k = item.key as keyof TabVisibilityConfig;
                    const isVisible = localTabs[k] !== false;

                    return (
                      <div
                        key={k}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-white flex items-center gap-2">
                            {item.label}
                            {isVisible ? (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                                Visible
                              </span>
                            ) : (
                              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                                Oculta
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={isVisible}
                          aria-label={`Mostrar ${item.label}`}
                          onClick={() => handleToggleTab(k)}
                          className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                            isVisible ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-transform ${
                              isVisible ? 'bg-slate-950 text-amber-400' : 'bg-slate-500 text-slate-300'
                            }`}
                          >
                            {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveTabChanges}
                  disabled={isSaving}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando en la Nube...' : 'Guardar Configuración de Solapas'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: BANNERS Y PUBLICIDAD */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                {/* Form Editor Modal / Block if editing */}
                {editingBanner ? (
                  <form onSubmit={handleSaveBannerSubmit} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {editingBanner.id ? 'Editar Banner Publicitario' : 'Nuevo Banner Publicitario'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingBanner(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* SECTION 1: PUBLIC CONTENT */}
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                        <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                          📢 Contenido Público del Banner
                        </span>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Título Principal (Trabajador o Promo)*</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.title || ''}
                            onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                            placeholder="ej: 🔥 Roberto Gómez - Gasista VIP (24hs)"
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Descripción / Subtítulo*</label>
                          <textarea
                            rows={2}
                            required
                            value={editingBanner.subtitle || ''}
                            onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                            placeholder="ej: Suscripción VIP • Guardia permanente de emergencias y 15% de descuento en mano de obra."
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Etiqueta Insignia (Badge)</label>
                            <input
                              type="text"
                              value={editingBanner.badgeText || ''}
                              onChange={(e) => setEditingBanner({ ...editingBanner, badgeText: e.target.value })}
                              placeholder="ej: SUSCRIPCIÓN VIP"
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Color de Insignia</label>
                            <select
                              value={editingBanner.badgeColor || 'amber'}
                              onChange={(e) =>
                                setEditingBanner({
                                  ...editingBanner,
                                  badgeColor: e.target.value as PromotedBanner['badgeColor'],
                                })
                              }
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="amber">Dorado / Amber</option>
                              <option value="emerald">Verde / Emerald</option>
                              <option value="orange">Naranja / Orange</option>
                              <option value="blue">Azul / Blue</option>
                              <option value="purple">Púrpura / Purple</option>
                              <option value="rose">Rosa / Rose</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">URL Enlace Botón (WhatsApp / Web)*</label>
                            <input
                              type="url"
                              required
                              value={editingBanner.linkUrl || ''}
                              onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                              placeholder="https://wa.me/54911..."
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Texto del Botón</label>
                            <input
                              type="text"
                              value={editingBanner.buttonText || ''}
                              onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                              placeholder="ej: Contactar por WhatsApp"
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-slate-300 font-bold mb-1">Imagen del banner</span>
                          <div className="flex flex-wrap items-center gap-3">
                            {editingBanner.imageUrl && (
                              <img src={editingBanner.imageUrl} alt="" className="w-24 h-14 rounded-lg object-cover bg-slate-800" />
                            )}
                            <label className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer">
                              <ImageIcon className="w-4 h-4" aria-hidden="true" />
                              Subir foto desde el celular
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  try {
                                    const dataUrl = await compressImageFile(f, 1200, 0.75);
                                    setEditingBanner((prev: any) => ({ ...prev, imageUrl: dataUrl }));
                                  } catch (err) {
                                    console.error(err);
                                    showToast('No se pudo cargar la imagen.');
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <label htmlFor="banner-img-url" className="block text-slate-400 text-[11px] font-semibold mt-2 mb-1">o pegá el enlace de una imagen</label>
                          <input
                            id="banner-img-url"
                            type="url"
                            value={editingBanner.imageUrl?.startsWith('data:') ? '' : editingBanner.imageUrl || ''}
                            onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* SECTION 2: ADVERTISER & SUBSCRIPTION DETAILS */}
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                        <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>💳 Datos de Suscripción y Cobro (Administrador)</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Nombre del Anunciante / Trabajador</label>
                            <input
                              type="text"
                              value={editingBanner.advertiserName || ''}
                              onChange={(e) => setEditingBanner({ ...editingBanner, advertiserName: e.target.value })}
                              placeholder="ej: Roberto Gómez"
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">WhatsApp / Teléfono Anunciante</label>
                            <input
                              type="text"
                              value={editingBanner.advertiserPhone || ''}
                              onChange={(e) => setEditingBanner({ ...editingBanner, advertiserPhone: e.target.value })}
                              placeholder="ej: 5491133334444"
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Plan de Suscripción</label>
                            <select
                              value={editingBanner.subscriptionPlan || 'mensual'}
                              onChange={(e) =>
                                setEditingBanner({
                                  ...editingBanner,
                                  subscriptionPlan: e.target.value as PromotedBanner['subscriptionPlan'],
                                })
                              }
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="mensual">Mensual</option>
                              <option value="trimestral">Trimestral</option>
                              <option value="anual">Anual</option>
                              <option value="vip">Destacado VIP</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Monto Cobrado (ARS $)</label>
                            <input
                              type="number"
                              value={editingBanner.pricePaid ?? 10000}
                              onChange={(e) => setEditingBanner({ ...editingBanner, pricePaid: Number(e.target.value) })}
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Estado del Pago *</label>
                            <select
                              value={editingBanner.paymentStatus || 'paid'}
                              onChange={(e) => {
                                const newStatus = e.target.value as PromotedBanner['paymentStatus'];
                                setEditingBanner({
                                  ...editingBanner,
                                  paymentStatus: newStatus,
                                  // Auto disable if unpaid
                                  active: newStatus === 'paid' ? (editingBanner.active ?? true) : false,
                                });
                              }}
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold"
                            >
                              <option value="paid" className="text-emerald-400 font-bold">🟢 PAGADO</option>
                              <option value="pending" className="text-rose-400 font-bold">🔴 PENDIENTE / IMPAGO</option>
                              <option value="expired" className="text-amber-400 font-bold">🟡 VENCIDO</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Fecha de Vencimiento de Suscripción</label>
                          <input
                            type="date"
                            value={editingBanner.expirationDate || ''}
                            onChange={(e) => setEditingBanner({ ...editingBanner, expirationDate: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                          <input
                            type="checkbox"
                            checked={editingBanner.active ?? true}
                            onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-800"
                          />
                          <span>Mostrar Banner en Carrusel (Activo)</span>
                        </label>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Guardando...' : 'Publicar Banner'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={handleStartNewBanner}
                    className="w-full py-3 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/10 text-amber-400 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all hover:bg-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Nuevo Banner de Suscripción / Publicidad</span>
                  </button>
                )}

                {/* Banners List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    Banners Creados en la Nube ({banners.length})
                  </h3>

                  {banners.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                      No hay banners registrados aún.
                    </div>
                  ) : (
                    banners.map((b) => {
                      const isPaid = (b.paymentStatus || 'paid') === 'paid';

                      return (
                        <div
                          key={b.id}
                          className={`bg-slate-950 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            isPaid ? 'border-slate-800 hover:border-slate-700' : 'border-rose-500/40 bg-rose-950/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={b.imageUrl}
                              alt={b.title}
                              className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-900"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    b.active
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {b.active ? 'Activo en Carrusel' : 'Pausado'}
                                </span>

                                {isPaid ? (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    PAGADO (${b.pricePaid?.toLocaleString() || 0})
                                  </span>
                                ) : b.paymentStatus === 'pending' ? (
                                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 animate-pulse">
                                    <XCircle className="w-3 h-3 text-rose-400" />
                                    IMPAGO / PENDIENTE
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    VENCIDO
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-black text-white line-clamp-1">{b.title}</h4>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                Anunciante: <strong className="text-slate-200">{b.advertiserName || 'Sin especificar'}</strong> • Vence: {b.expirationDate || 'N/D'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => onSaveBanner({ ...b, active: !b.active })}
                              className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                                b.active
                                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              }`}
                              title={b.active ? 'Pausar Banner' : 'Activar Banner'}
                            >
                              {b.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => setEditingBanner(b)}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-colors"
                              title="Editar Banner y Pago"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteBannerConfirm(b.id)}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Eliminar Banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: CUPONES DE BENEFICIO CREADOS POR EL ADMINISTRADOR */}
            {activeTab === 'coupons' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Top header bar */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-400" />
                      Cupones de Beneficio del Sistema ({coupons.length})
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Crea cupones con descuentos para que los trabajadores entreguen a sus clientes. Válidos para usar en Ferretería Bruzzone o comercios adheridos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartNewCoupon}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Crear Nuevo Cupón</span>
                  </button>
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cupones Creados</span>
                    <p className="text-xl font-black text-white mt-1">{coupons.length}</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cupones Activos</span>
                    <p className="text-xl font-black text-amber-400 mt-1">
                      {coupons.filter((c) => c.active).length}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vouchers Emitidos</span>
                    <p className="text-xl font-black text-blue-400 mt-1">{issuedVouchers.length}</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vouchers Canjeados</span>
                    <p className="text-xl font-black text-emerald-400 mt-1">
                      {issuedVouchers.filter((v) => v.status === 'redeemed').length}
                    </p>
                  </div>
                </div>

                {/* Coupon Editor Modal/Form */}
                {editingCoupon && (
                  <form onSubmit={handleSaveCouponSubmit} className="bg-slate-950 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>{editingCoupon.id && coupons.some((c) => c.id === editingCoupon.id) ? 'Editar Cupón de Beneficio' : 'Nuevo Cupón de Beneficio'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(null)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Title */}
                      <div className="sm:col-span-2">
                        <label className="block text-slate-300 font-bold mb-1">Título del Cupón *</label>
                        <input
                          type="text"
                          required
                          value={editingCoupon.title || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, title: e.target.value })}
                          placeholder="Ej: 15% OFF en Ferretería Bruzzone"
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>

                      {/* Code Prefix */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Prefijo de Código *</label>
                        <input
                          type="text"
                          required
                          value={editingCoupon.codePrefix || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, codePrefix: e.target.value.toUpperCase() })}
                          placeholder="Ej: BRUZZONE15, RED10"
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                        />
                      </div>

                      {/* Target Shop */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">¿Dónde se puede canjear? *</label>
                        <select
                          value={editingCoupon.targetType || 'all_shops'}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            let targetShopName = 'Comercios y Talleres Adheridos';
                            if (val === 'ferreteria_bruzzone') targetShopName = 'Ferretería Bruzzone (Sponsor Oficial)';
                            setEditingCoupon({
                              ...editingCoupon,
                              targetType: val,
                              targetShopName,
                            });
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="ferreteria_bruzzone">🏬 Ferretería Bruzzone (Sponsor Oficial)</option>
                          <option value="all_shops">🏪 Todos los Comercios y Talleres Adheridos</option>
                          <option value="specific_shop">🏢 Un Comercio Específico de la Guía</option>
                        </select>
                      </div>

                      {editingCoupon.targetType === 'specific_shop' && (
                        <div className="sm:col-span-2">
                          <label className="block text-slate-300 font-bold mb-1">Comercio Específico</label>
                          <select
                            value={editingCoupon.targetShopId || ''}
                            onChange={(e) => {
                              const shop = shops.find((s) => s.id === e.target.value);
                              setEditingCoupon({
                                ...editingCoupon,
                                targetShopId: e.target.value,
                                targetShopName: shop ? shop.name : 'Comercio Adherido',
                              });
                            }}
                            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">Selecciona un comercio registrado...</option>
                            {shops.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.location})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Discount Type */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Tipo de Descuento</label>
                        <select
                          value={editingCoupon.discountType || 'percentage'}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="percentage">Porcentaje (% OFF)</option>
                          <option value="fixed">Monto Fijo ($ ARS Descuento)</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Valor {editingCoupon.discountType === 'percentage' ? '(%)' : '($ ARS)'} *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={editingCoupon.discountValue || 10}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) || 0 })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Min Spend */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Compra Mínima en Comercio ($ ARS, 0 si no aplica)</label>
                        <input
                          type="number"
                          min={0}
                          value={editingCoupon.minSpend || 0}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, minSpend: Number(e.target.value) || 0 })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Validity days */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Días de Validez del Cupón emitido</label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={editingCoupon.validDays || 30}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, validDays: Number(e.target.value) || 30 })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-2">
                        <label className="block text-slate-300 font-bold mb-1">Descripción del Beneficio</label>
                        <textarea
                          rows={2}
                          value={editingCoupon.description || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                          placeholder="Beneficio exclusivo por contratar profesionales verificados en ServiGo."
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      {/* Active Toggle */}
                      <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div>
                          <p className="font-bold text-white text-xs">Cupón Habilitado para Trabajadores</p>
                          <p className="text-[11px] text-slate-400">Si está activo, los trabajadores podrán seleccionarlo y entregarlo a clientes.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingCoupon.active ?? true}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                          className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(null)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingCoupon}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                      >
                        {isSavingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Guardar Cupón de Beneficio</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* System Coupons List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Cupones Habilitados para Entrega ({coupons.length})
                  </h4>

                  {coupons.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <Ticket className="w-8 h-8 text-slate-700 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">No hay cupones creados aún.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {coupons.map((c) => (
                        <div
                          key={c.id}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black px-2.5 py-1 rounded-xl">
                                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue.toLocaleString('es-AR')}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleCouponActive(c)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                                  c.active
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {c.active ? '● Activo' : '○ Pausado'}
                              </button>
                            </div>

                            <div>
                              <h5 className="text-xs font-black text-white">{c.title}</h5>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Store className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{c.targetShopName}</span>
                              </p>
                              {c.description && (
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-900">
                              <span>Prefijo: <strong className="text-slate-300">{c.codePrefix}</strong></span>
                              <span>Validez: <strong className="text-slate-300">{c.validDays} días</strong></span>
                              {c.minSpend ? <span>Mín: <strong className="text-slate-300">${c.minSpend.toLocaleString('es-AR')}</strong></span> : null}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-900">
                            <button
                              type="button"
                              onClick={() => setEditingCoupon({ ...c })}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCouponConfirm(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Borrar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Issued Vouchers Log Table */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>Vouchers y Cupones Entregados a Clientes ({issuedVouchers.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Historial de beneficios generados por trabajadores para sus clientes.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={voucherSearchTerm}
                        onChange={(e) => setVoucherSearchTerm(e.target.value)}
                        placeholder="Buscar por cliente o código..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {issuedVouchers.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <Ticket className="w-8 h-8 text-slate-700 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">Aún no se han emitido cupones a clientes.</p>
                      <p className="text-[11px] text-slate-500">
                        Los trabajadores pueden entregarlos desde su perfil al ser contratados.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {issuedVouchers
                        .filter((v) => {
                          const s = voucherSearchTerm.toLowerCase();
                          return (
                            v.clientName?.toLowerCase().includes(s) ||
                            v.workerName?.toLowerCase().includes(s) ||
                            v.voucherCode?.toLowerCase().includes(s) ||
                            v.couponTitle?.toLowerCase().includes(s)
                          );
                        })
                        .map((v) => (
                          <div
                            key={v.id}
                            className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                  {v.voucherCode}
                                </span>
                                <span className="font-black text-white">{v.discountText}</span>
                                <span className="text-slate-400">• {v.targetShopName}</span>
                              </div>
                              <p className="text-[11px] text-slate-300">
                                Cliente: <strong className="text-white">{v.clientName}</strong>
                                {v.clientPhone ? ` (${v.clientPhone})` : ''} • Entregado por:{' '}
                                <strong className="text-amber-300">{v.workerName}</strong> ({v.workerTrade})
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Emitido: {new Date(v.issuedAt).toLocaleDateString('es-AR')} • Vence:{' '}
                                {new Date(v.expiresAt).toLocaleDateString('es-AR')}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {v.status === 'redeemed' ? (
                                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3 text-blue-400" />
                                  Canjeado en {v.redeemedByShop || 'Comercio'}
                                </span>
                              ) : new Date(v.expiresAt).getTime() < Date.now() ? (
                                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                  Vencido
                                </span>
                              ) : (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-emerald-400" />
                                  Activo / Vigente
                                </span>
                              )}

                              {onSaveIssuedVoucher && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const isRedeemed = v.status === 'redeemed';
                                    const updated: IssuedVoucher = {
                                      ...v,
                                      status: isRedeemed ? 'active' : 'redeemed',
                                      redeemedAt: isRedeemed ? undefined : new Date().toISOString(),
                                      redeemedByShop: isRedeemed ? undefined : (v.targetShopName || 'Ferretería Bruzzone'),
                                    };
                                    await onSaveIssuedVoucher(updated);
                                    showToast(
                                      isRedeemed
                                        ? `Voucher "${v.voucherCode}" reactivado a estado Vigente.`
                                        : `¡Voucher "${v.voucherCode}" marcado como CANJEADO!`
                                    );
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                                    v.status === 'redeemed'
                                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                  }`}
                                  title={v.status === 'redeemed' ? 'Reactivar voucher' : 'Marcar cupón como canjeado'}
                                >
                                  {v.status === 'redeemed' ? '↺ Reactivar' : '✓ Marcar Canjeado'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SUSCRIPCIONES Y GESTIÓN DE PAGOS */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Recaudado Total
                    </span>
                    <p className="text-xl font-black text-emerald-400 flex items-center gap-1">
                      <span>${totalRevenue.toLocaleString('es-AR')}</span>
                      <span className="text-xs font-medium text-slate-500">ARS</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">De anuncios con pago confirmado</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Sin Pagar / Impagos
                    </span>
                    <p className="text-xl font-black text-rose-400 flex items-center gap-1">
                      <span>{pendingPaymentsCount + expiredPaymentsCount}</span>
                      <span className="text-xs font-medium text-slate-500">anuncios</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Banners pausados por falta de pago</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Banners Activos
                    </span>
                    <p className="text-xl font-black text-amber-400 flex items-center gap-1">
                      <span>{activeBannersCount}</span>
                      <span className="text-xs font-medium text-slate-500">en carrusel</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Visibles actualmente para usuarios</p>
                  </div>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 flex-wrap">
                  <span className="text-xs font-bold text-slate-300 pl-2">Filtrar Suscripciones:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'paid', label: '🟢 Pagados' },
                      { id: 'pending', label: '🔴 Impagos / Pendientes' },
                      { id: 'expired', label: '🟡 Vencidos' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSubscriptionFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          subscriptionFilter === f.id
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscription Cards List */}
                <div className="space-y-4">
                  {filteredBanners.length === 0 ? (
                    <div className="text-center py-10 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                      No hay suscripciones que coincidan con el filtro seleccionado.
                    </div>
                  ) : (
                    filteredBanners.map((b) => {
                      const isPaid = (b.paymentStatus || 'paid') === 'paid';
                      const isPending = b.paymentStatus === 'pending';
                      const isExpired = b.paymentStatus === 'expired';

                      return (
                        <div
                          key={b.id}
                          className={`bg-slate-950 border rounded-2xl p-5 space-y-4 transition-all ${
                            isPaid
                              ? 'border-slate-800 hover:border-slate-700'
                              : 'border-rose-500/50 bg-rose-950/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white">
                                  {b.advertiserName || b.title}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400 uppercase">
                                  Plan {b.subscriptionPlan || 'Mensual'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium">
                                Banner: <span className="text-slate-300 font-semibold">{b.title}</span>
                              </p>
                            </div>

                            {/* Status Indicator */}
                            <div>
                              {isPaid ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span>SUSCRIPCIÓN AL DÍA (PAGADO)</span>
                                </span>
                              ) : isPending ? (
                                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black flex items-center gap-1.5 animate-pulse">
                                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                                  <span>FALTA DE PAGO (NO PAGÓ)</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-amber-400" />
                                  <span>SUSCRIPCIÓN VENCIDA</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Data Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Monto del Plan</span>
                              <span className="font-black text-white text-sm">
                                ${b.pricePaid?.toLocaleString('es-AR') || 0} ARS
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Vencimiento</span>
                              <span className="font-bold text-slate-200">
                                {b.expirationDate || 'Sin fecha'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Estado Carrusel</span>
                              <span
                                className={`font-black ${
                                  b.active ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                {b.active ? 'Visible en Pantalla' : 'Pausado / Oculto'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block">Contacto Anunciante</span>
                              <span className="font-mono text-slate-300">{b.advertiserPhone || 'N/D'}</span>
                            </div>
                          </div>

                          {/* Control Action Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              {b.advertiserPhone && (
                                <a
                                  href={`https://wa.me/${b.advertiserPhone}?text=${encodeURIComponent(
                                    `Hola ${b.advertiserName || ''}, te contacto desde la administración de ServiGo respecto a la suscripción de tu banner publicitario "${b.title}".`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-700 transition-colors"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp Anunciante</span>
                                </a>
                              )}

                              <button
                                onClick={() => setEditingBanner(b)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold inline-flex items-center gap-1 border border-slate-700 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar Datos</span>
                              </button>
                            </div>

                            {/* Quick Activation / Deactivation Buttons */}
                            <div className="flex items-center gap-2">
                              {!isPaid ? (
                                <button
                                  onClick={() => handleQuickTogglePayment(b, 'paid')}
                                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Marcar como PAGADO y Activar Banner</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleQuickTogglePayment(b, 'pending')}
                                  className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95"
                                >
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                  <span>Suspender por Falta de Pago</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: GESTIÓN Y BORRADO DE TRABAJADORES */}
            {activeTab === 'workers' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      Gestión de Trabajadores Registrados ({workers.length})
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Busca y administra a los prestadores de servicio. Carga nuevos perfiles o edita sus rubros de forma organizada.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Search input */}
                    <div className="relative w-full sm:w-60">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={workerSearchTerm}
                        onChange={(e) => setWorkerSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, oficio o teléfono..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Cargar Nuevo Trabajador Button */}
                    <button
                      type="button"
                      onClick={handleStartNewWorker}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Cargar Nuevo</span>
                    </button>
                  </div>
                </div>

                {/* Rubros activos summary bar */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Rubros organizados ({allTradeOptions.length}):
                  </span>
                  {allTradeOptions.map((t) => {
                    const count = workers.filter((w) => w.trade?.toLowerCase() === t.id.toLowerCase()).length;
                    const isCustom = !BASE_TRADES.some((bt) => bt.id.toLowerCase() === t.id.toLowerCase());
                    return (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        <span>{t.icon}</span>
                        <span className="font-semibold">{t.label}</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {count}
                        </span>
                        {isCustom && count === 0 && (
                          <button
                            type="button"
                            title="Eliminar rubro personalizado sin trabajadores"
                            onClick={() => handleDeleteCustomTrade(t.id)}
                            className="text-slate-500 hover:text-rose-400 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {filteredWorkers.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <Users className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-sm text-slate-400 font-bold">
                      {workerSearchTerm
                        ? 'No se encontraron trabajadores que coincidan con la búsqueda.'
                        : 'No hay trabajadores registrados en la base de datos.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredWorkers.map((w) => (
                      <div
                        key={w.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={w.avatar || (w as any).photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={w.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <h4 className="text-xs font-black text-white truncate">{w.name}</h4>
                              <div className="flex items-center gap-1 flex-wrap">
                                {w.ferreteroPartner && (
                                  <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    FB 10% OFF
                                  </span>
                                )}
                                {w.verified && (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Verificado
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1 truncate">
                              <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                              {w.tradeTitle || w.trade}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                              <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              {w.location}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                              <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              {w.phone}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{w.rating ? w.rating.toFixed(1) : '5.0'}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({w.reviewCount ?? (w as any).reviewsCount ?? 1})</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEditWorker(w)}
                              className="py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => setWorkerToDelete(w)}
                              className="py-1.5 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Borrar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: COMERCIOS Y NEGOCIOS DE LA ZONA */}
            {activeTab === 'shops' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-400" />
                        Gestión de Comercios, Ferreterías y Talleres ({shops.length})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Administra negocios adheridos, edita sus datos, aprueba/verifica publicaciones y activa banderas de descuento.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingShop({
                          id: `shop-${Date.now()}`,
                          name: '',
                          category: 'ferreteria',
                          categoryTitle: 'Ferretería & Insumos',
                          description: 'Comercio o taller registrado en la red ServiGo.',
                          address: '',
                          location: 'Río Cuarto',
                          zones: ['Río Cuarto'],
                          phone: '',
                          whatsapp: '',
                          email: '',
                          hours: 'Lun a Vie 08:00 - 18:00',
                          rating: 5.0,
                          reviewCount: 1,
                          verified: true,
                          discountPartner: false,
                          discountText: '10% OFF para usuarios ServiGo',
                          imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
                          featured: false,
                          servicesOrProducts: ['Herramientas', 'Materiales', 'Asesoramiento'],
                          createdAt: new Date().toISOString(),
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Agregar Comercio</span>
                    </button>
                  </div>
                </div>

                {shops.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <Store className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-sm text-slate-400 font-bold">
                      No hay comercios registrados en la base de datos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shops.map((s) => (
                      <div
                        key={s.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={s.imageUrl || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150'}
                            alt={s.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <h4 className="text-xs font-black text-white truncate">{s.name}</h4>
                              <div className="flex items-center gap-1 flex-wrap">
                                {s.discountPartner && (
                                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                                    % Descuento
                                  </span>
                                )}
                                {s.verified && (
                                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Verificado
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] font-bold text-orange-400 truncate">
                              {s.categoryTitle || s.category} • {s.location}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              📍 {s.address} | 📞 {s.phone}
                            </p>
                          </div>
                        </div>

                        {/* Quick action toggles for Admin */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setEditingShop(s)}
                              className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-600 hover:text-white border border-orange-500/30 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              title="Editar datos del comercio"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (onSaveShop) {
                                  await onSaveShop({ ...s, verified: !s.verified });
                                  showToast(
                                    !s.verified
                                      ? `✅ ${s.name} marcado como Verificado.`
                                      : `ℹ️ Verificación removida de ${s.name}.`
                                  );
                                }
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                s.verified
                                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {s.verified ? '✓ Verificado' : '+ Verificar'}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (onSaveShop) {
                                  await onSaveShop({
                                    ...s,
                                    discountPartner: !s.discountPartner,
                                    discountText: !s.discountPartner ? '10% OFF para usuarios ServiGo' : undefined,
                                  });
                                  showToast(`Insignia de Descuento actualizada para ${s.name}`);
                                }
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                s.discountPartner
                                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {s.discountPartner ? '🏷️ Socio OFF' : '+ Beneficio OFF'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`¿Eliminar el comercio "${s.name}"?`) && onDeleteShop) {
                                await onDeleteShop(s.id);
                                showToast(`Comercio "${s.name}" eliminado.`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                            title="Eliminar comercio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: GESTIÓN DE REMISES & CONDUCTORES */}
            {activeTab === 'remises' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Car className="w-4 h-4 text-amber-500" />
                        Gestión de Remises & Conductores ({remises.length})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Administra conductores, ajusta tarifas, modifica vehículos, cambia disponibilidad en vivo o elimina registros.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingRemis({
                          id: `remis-${Date.now()}`,
                          name: '',
                          phone: '',
                          whatsapp: '',
                          vehicle: {
                            make: 'Chevrolet',
                            model: 'Corsa Classic',
                            year: '2020',
                            color: 'Blanco',
                            plate: 'AA 000 AA',
                          },
                          photoUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
                          baseLocation: 'Río Cuarto',
                          zones: ['Río Cuarto', 'Las Higueras'],
                          status: 'disponible',
                          baseRate: 1500,
                          pricePerKm: 800,
                          acceptsPets: true,
                          hasAirConditioning: true,
                          largeTrunk: true,
                          rating: 5.0,
                          totalTrips: 0,
                          verified: true,
                          coordinates: {
                            lat: -33.123,
                            lng: -64.349,
                          },
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Registrar Conductor</span>
                    </button>
                  </div>

                  {/* Search bar */}
                  <div className="relative w-full sm:w-72 pt-2">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={remisSearchTerm}
                      onChange={(e) => setRemisSearchTerm(e.target.value)}
                      placeholder="Buscar por chofer, auto, patente o zona..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {filteredRemises.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <Car className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-sm text-slate-400 font-bold">
                      {remisSearchTerm
                        ? 'No se encontraron conductores con ese criterio de búsqueda.'
                        : 'No hay remiseros registrados en la base de datos.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredRemises.map((r) => (
                      <div
                        key={r.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={r.photoUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=150'}
                            alt={r.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <h4 className="text-xs font-black text-white truncate">{r.name}</h4>
                              <div className="flex items-center gap-1 flex-wrap">
                                {r.verified && (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Verificado
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border ${
                                    r.status === 'disponible'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : r.status === 'en_viaje'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {r.status === 'disponible' ? '🟢 Disponible' : r.status === 'en_viaje' ? '🟡 En Viaje' : '⚪ Fuera de Servicio'}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] font-bold text-amber-400 truncate">
                              🚗 {r.vehicle.make} {r.vehicle.model} ({r.vehicle.year}) • {r.vehicle.color}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              🪪 Patente: <span className="font-mono text-white font-bold">{r.vehicle.plate}</span> | 📍 {r.baseLocation}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              📞 Tel: {r.phone} | 💵 Bajada: ${r.baseRate} | Km: ${r.pricePerKm}
                            </p>
                          </div>
                        </div>

                        {/* Quick action controls for Admin */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setEditingRemis(r)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              title="Editar datos del conductor"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                const nextStatus =
                                  r.status === 'disponible'
                                    ? 'en_viaje'
                                    : r.status === 'en_viaje'
                                    ? 'fuera_de_servicio'
                                    : 'disponible';
                                if (onSaveRemis) {
                                  await onSaveRemis({ ...r, status: nextStatus });
                                  showToast(`Estado de ${r.name} actualizado a: ${nextStatus}`);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all text-[10px] font-bold cursor-pointer"
                              title="Alternar estado de disponibilidad"
                            >
                              🔄 Cambio Estado
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRemisToDelete(r)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                            title="Eliminar conductor de la red"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: BILLETERA CENTRAL Y COMISIONES DE ALQUILERES (GIVY / MERCADOLIBRE MODEL) */}
            {activeTab === 'rental_items' && (
              <AdminRentalItemsPanel rentalItems={rentalItems} rentalBookings={rentalBookings} showToast={showToast} />
            )}

            {activeTab === 'convenio' && <AdminConvenioPanel showToast={showToast} />}

            {activeTab === 'rentals_wallet' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-emerald-500/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                          Billetera Central ServiGo
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                            Escrow & {rentalFeePercent}% Comisión
                          </span>
                        </h3>
                        <p className="text-xs text-slate-300">
                          Control de pagos en custodia, comisiones retenidas por ServiGo y transferencias a dueños de productos (CBU / Alias).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Configuración de Tasa de Comisión (app_config/rentals.platformFeeRate) */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">⚙️ Tasa de Comisión de ServiGo Alquileres</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                          app_config/rentals.platformFeeRate: {(rentalFeePercent / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Define la tasa de comisión retenida en cada alquiler (valor inicial 5% = 0.05). El servidor calcula automáticamente comisiones y neto al liquidar.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          step={1}
                          value={rentalFeePercent}
                          onChange={(e) => setRentalFeePercent(Math.max(1, Math.min(50, Number(e.target.value))))}
                          className="w-20 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-black text-sm text-center focus:border-orange-500 focus:outline-hidden"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      </div>

                      <button
                        type="button"
                        disabled={isSavingFeeRate}
                        onClick={async () => {
                          try {
                            setIsSavingFeeRate(true);
                            await saveRentalPlatformFeeToFirestore(rentalFeePercent / 100);
                            showToast(`✅ Tasa de comisión guardada al ${rentalFeePercent}% (${rentalFeePercent / 100}) en app_config/rentals`);
                          } catch (err: any) {
                            showToast('Error al guardar la tasa de comisión');
                          } finally {
                            setIsSavingFeeRate(false);
                          }
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isSavingFeeRate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Guardar Comisión</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/20 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
                        <span>Comisión ServiGo ({rentalFeePercent}%)</span>
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-lg font-black text-emerald-400">
                        ${rentalBookings.reduce((acc, b) => acc + (b.platformFeeAmount || 0), 0).toLocaleString('es-AR')}
                      </p>
                      <p className="text-[10px] text-slate-400">Ganancia neta retenida</p>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-500/20 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
                        <span>En Custodia (Escrow)</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <p className="text-lg font-black text-blue-400">
                        ${rentalBookings
                          .filter((b) => b.paymentStatus === 'pagado_en_custodia' || b.depositStatus === 'en_custodia')
                          .reduce((acc, b) => {
                            const rentInCustody = b.paymentStatus === 'pagado_en_custodia' ? b.ownerNetAmount : 0;
                            const depositInCustody = b.depositStatus === 'en_custodia' ? b.depositAmount : 0;
                            return acc + rentInCustody + depositInCustody;
                          }, 0)
                          .toLocaleString('es-AR')}
                      </p>
                      <p className="text-[10px] text-slate-400">Garantías + Alquileres activos</p>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/20 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
                        <span>Retiros Pendientes</span>
                        <ArrowDownToLine className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-lg font-black text-amber-400">
                        ${rentalPayouts
                          .filter((p) => p.status === 'pendiente')
                          .reduce((acc, p) => acc + p.amount, 0)
                          .toLocaleString('es-AR')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {rentalPayouts.filter((p) => p.status === 'pendiente').length} solicitudes pendientes
                      </p>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
                        <span>Total Facturado</span>
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-lg font-black text-white">
                        ${rentalBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0).toLocaleString('es-AR')}
                      </p>
                      <p className="text-[10px] text-slate-400">{rentalBookings.length} operaciones</p>
                    </div>
                  </div>
                </div>

                {/* Section 1: Solicitudes de Retiro de Fondos de Dueños (Payouts) */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <HandCoins className="w-4 h-4 text-amber-400" />
                        Solicitudes de Retiro de Fondos a CBU/CVU/Alias
                      </h4>
                      <p className="text-xs text-slate-400">
                        Los dueños que acumularon saldo por alquileres finalizados solicitan la transferencia a su cuenta bancaria o Mercado Pago.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      Total: {rentalPayouts.length}
                    </span>
                  </div>

                  {rentalPayouts.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                      No hay solicitudes de retiro registradas todavía. Cuando los dueños soliciten liquidar su saldo disponible aparecerán aquí.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rentalPayouts.map((payout) => {
                        const isPending = payout.status === 'pendiente';
                        const isTransferred = payout.status === 'transferido';

                        return (
                          <div
                            key={payout.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isPending
                                ? 'bg-amber-950/20 border-amber-500/40'
                                : isTransferred
                                ? 'bg-slate-900/60 border-emerald-500/30'
                                : 'bg-slate-900/40 border-slate-800'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-white">{payout.ownerName}</span>
                                  {payout.ownerDni && (
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                                      DNI: {payout.ownerDni}
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                      isPending
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                        : isTransferred
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    }`}
                                  >
                                    {payout.status}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                                  <span className="font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 font-bold">
                                    CBU / Alias: {payout.cbuOrAlias}
                                  </span>
                                  <span className="text-slate-400">
                                    Solicitado: {new Date(payout.requestedAt).toLocaleDateString('es-AR')}
                                  </span>
                                  {payout.ownerPhone && (
                                    <a
                                      href={`https://wa.me/549${payout.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                        `Hola ${payout.ownerName}, te escribimos desde ServiGo respecto a tu solicitud de retiro por $${payout.amount.toLocaleString('es-AR')}.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      WhatsApp
                                    </a>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-xs text-slate-400">Monto Solicitado</div>
                                  <div className="text-lg font-black text-emerald-400">
                                    ${payout.amount.toLocaleString('es-AR')}
                                  </div>
                                </div>

                                {isPending && onUpdatePayoutStatus && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await onUpdatePayoutStatus(payout.id, 'transferido');
                                        showToast(`✅ Transferencia por $${payout.amount.toLocaleString('es-AR')} a ${payout.ownerName} confirmada.`);
                                      } catch (err) {
                                        showToast('Error al actualizar estado del retiro.');
                                      }
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Marcar Transferido</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 2: Registro de Alquileres, Custodia y Garantías */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        Operaciones de Alquiler y Estado de Fondos
                      </h4>
                      <p className="text-xs text-slate-400">
                        Auditoría en tiempo real de cada alquiler pactado: desglose de la comisión de ServiGo, el neto del dueño y la garantía.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      Total: {rentalBookings.length}
                    </span>
                  </div>

                  {rentalBookings.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                      Aún no hay alquileres confirmados en la plataforma.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rentalBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div>
                              <h5 className="font-black text-sm text-white flex items-center gap-2">
                                {b.rentalItemTitle}
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md font-mono">
                                  {b.totalDays} {b.totalDays === 1 ? 'día' : 'días'} ({b.startDate} al {b.endDate})
                                </span>
                              </h5>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Inquilino: <strong className="text-slate-200">{b.clientName}</strong> ({b.clientPhone}) | Locador: <strong className="text-slate-200">{b.ownerName}</strong>
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {b.clientDni && (
                                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono font-bold">
                                  ✍️ Contrato DNI: {b.clientDni}
                                </span>
                              )}

                              <span
                                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                  b.paymentStatus === 'pagado_en_custodia'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                Pago: {b.paymentStatus === 'pagado_en_custodia' ? 'En Custodia' : 'Liquidado a Dueño'}
                              </span>

                              <span
                                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                  b.depositStatus === 'en_custodia'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : b.depositStatus === 'retenido_por_dano'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                                }`}
                              >
                                Garantía: {b.depositStatus === 'en_custodia' ? 'En Custodia' : b.depositStatus === 'retenido_por_dano' ? 'Retenida por Daño' : 'Devuelta'}
                              </span>
                            </div>
                          </div>

                          {/* Damage incident report banner if present */}
                          {b.depositStatus === 'retenido_por_dano' && (
                            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1 text-xs text-rose-200">
                              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                Daño o Rotura Reportada por el Dueño:
                              </span>
                              <p className="text-[11px] text-rose-100">
                                {b.damageReport?.description || 'Daño constatado. Depósito de caución retenido a favor del locador.'}
                              </p>
                              {b.damageReport?.extraAmountClaimed && b.damageReport.extraAmountClaimed > 0 ? (
                                <p className="text-[10px] font-bold text-rose-400">
                                  Diferencia reclamada al cliente bajo Cláusula 4ta del contrato: ${b.damageReport.extraAmountClaimed.toLocaleString('es-AR')}
                                </p>
                              ) : null}
                            </div>
                          )}

                          {/* Breakdown row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Total Pagado Inquilino</span>
                              <span className="font-black text-white text-sm">
                                ${(b.totalPrice + b.depositAmount).toLocaleString('es-AR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-400 block font-bold">10% ServiGo (Retenido)</span>
                              <span className="font-black text-emerald-400 text-sm">
                                ${b.platformFeeAmount.toLocaleString('es-AR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-amber-400 block font-bold">Neto Dueño</span>
                              <span className="font-black text-amber-400 text-sm">
                                ${b.ownerNetAmount.toLocaleString('es-AR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-blue-400 block font-bold">Caución Garantía</span>
                              <span className="font-black text-blue-400 text-sm">
                                ${b.depositAmount.toLocaleString('es-AR')}
                              </span>
                            </div>
                          </div>

                          {/* Action if item is active and return needed */}
                          {(b.status === 'confirmado' || b.status === 'en_curso') && onConfirmRentalReturn && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={async () => {
                                  try {
                                    await onConfirmRentalReturn(b.id);
                                    showToast(`🎉 ¡Devolución de "${b.rentalItemTitle}" confirmada! Garantía reintegrada y saldo acreditado al dueño.`);
                                  } catch (err) {
                                    showToast('Error al confirmar devolución.');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirmar Devolución Conforme & Reintegrar Garantía</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 9: REINICIAR Y BORRAR DATOS */}
            {activeTab === 'reset' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-3xl p-5 sm:p-6 space-y-4 text-rose-100">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-rose-300">
                        Zona de Peligro - Reinicio y Limpieza Total de Datos
                      </h3>
                      <p className="text-xs text-rose-200/80 leading-relaxed mt-1">
                        Esta herramienta permite al Creador vaciar la base de datos de la aplicación y empezar completamente desde cero o restablecer los datos de fábrica de demostración.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* OPTION 1: CLEAR EVERYTHING TO BLANK */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/30 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                          <Trash2 className="w-4 h-4" />
                          <span>1. Borrar Todos los Datos (Base Vacía)</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          Elimina <b>definitivamente</b> todos los trabajadores registrados, contrataciones/turnos y banners de publicidad. Deja la base de datos limpia en 0 registros.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setConfirmDeleteInput('');
                          setShowConfirmModal('all');
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>BORRAR TODO Y EMPEZAR DE CERO</span>
                      </button>
                    </div>

                    {/* OPTION 2: RESET TO DEMO FACTORY DEFAULTS */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                          <RefreshCw className="w-4 h-4" />
                          <span>2. Restablecer Datos de Fábrica</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          Borra los datos actuales y vuelve a cargar los <b>trabajadores y banners iniciales de prueba</b>. Ideal para reiniciar demostraciones.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowConfirmModal('defaults')}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>RESTABLECER VALORES DE FÁBRICA</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Nota para el Administrador:
                  </span>
                  <p>
                    Las acciones ejecutadas en esta pestaña se sincronizan de inmediato en tiempo real con Cloud Firestore y se reflejan en todos los usuarios conectados a ServiGo.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* CONFIRMATION MODAL FOR CLEARING DATA */}
      {showConfirmModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 text-white space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">
                {showConfirmModal === 'all'
                  ? '¿Confirmas borrar TODOS los datos?'
                  : '¿Restablecer datos de fábrica?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {showConfirmModal === 'all'
                  ? 'Esta acción eliminará de forma irreversible todos los trabajadores, turnos y banners cargados.'
                  : 'Se eliminarán las modificaciones actuales y se volverán a cargar los trabajadores y banners de prueba iniciales.'}
              </p>
            </div>

            {showConfirmModal === 'all' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block text-center">
                  Escribe la palabra <span className="text-rose-400 font-black">BORRAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmDeleteInput}
                  onChange={(e) => setConfirmDeleteInput(e.target.value)}
                  placeholder="Escribe BORRAR aquí"
                  className="w-full text-center tracking-widest font-mono text-sm px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal('none');
                  setConfirmDeleteInput('');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                disabled={isDeletingAll || isResettingDefaults}
              >
                Cancelar
              </button>

              {showConfirmModal === 'all' ? (
                <button
                  onClick={async () => {
                    if (!onClearAllData) return;
                    setIsDeletingAll(true);
                    try {
                      await onClearAllData();
                      setShowConfirmModal('none');
                      setConfirmDeleteInput('');
                    } catch (err) {
                      console.error(err);
                      showToast('Error al borrar los datos');
                    } finally {
                      setIsDeletingAll(false);
                    }
                  }}
                  disabled={confirmDeleteInput.toUpperCase() !== 'BORRAR' || isDeletingAll}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isDeletingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Borrando...</span>
                    </>
                  ) : (
                    <span>Sí, Borrar Todo</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!onResetToDefaults) return;
                    setIsResettingDefaults(true);
                    try {
                      await onResetToDefaults();
                      setShowConfirmModal('none');
                    } catch (err) {
                      console.error(err);
                      showToast('Error al restablecer valores por defecto');
                    } finally {
                      setIsResettingDefaults(false);
                    }
                  }}
                  disabled={isResettingDefaults}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isResettingDefaults ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Restableciendo...</span>
                    </>
                  ) : (
                    <span>Sí, Restablecer</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETING A SINGLE WORKER */}
      {workerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">¿Eliminar Trabajador?</h3>
                <p className="text-xs text-slate-400">Confirmación de borrado permanente</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={workerToDelete.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={workerToDelete.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{workerToDelete.name}</h4>
                  <p className="text-xs text-amber-400 font-medium">{workerToDelete.trade}</p>
                  <p className="text-[10px] text-slate-400">{workerToDelete.location} • {workerToDelete.phone}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-3 border-t border-slate-900">
                Esta acción eliminará definitivamente el perfil de <b>{workerToDelete.name}</b> de la base de datos de Cloud Firestore. Ya no aparecerá en el catálogo ni en las búsquedas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setWorkerToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                disabled={isDeletingWorker}
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  try {
                    setIsDeletingWorker(true);
                    await onDeleteWorker(workerToDelete.id);
                    showToast(`🗑️ Trabajador "${workerToDelete.name}" eliminado correctamente.`);
                    setWorkerToDelete(null);
                  } catch (err) {
                    showToast('❌ Error al eliminar el trabajador.');
                  } finally {
                    setIsDeletingWorker(false);
                  }
                }}
                disabled={isDeletingWorker}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg"
              >
                {isDeletingWorker ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Sí, Eliminar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WORKER MODAL */}
      {editingWorker && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 text-white shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                {isCreatingNewWorker ? <UserPlus className="w-5 h-5 text-amber-400" /> : <Edit2 className="w-5 h-5 text-amber-400" />}
                {isCreatingNewWorker
                  ? 'Cargar Nuevo Perfil de Trabajador'
                  : `Editar Perfil de Trabajador: ${editingWorker.name || 'Sin nombre'}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={editingWorker.name}
                  onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                  placeholder="Ej: Fabricio Ivan Bosio"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Trade Selection (Organized Rubros with Creation Option) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-300">Rubro Principal *</label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingTradeInWorkerModal((prev) => !prev)}
                    className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 hover:underline transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isCreatingTradeInWorkerModal ? 'Ver Lista' : '+ Crear Nuevo Rubro'}</span>
                  </button>
                </div>
                <select
                  value={isCreatingTradeInWorkerModal ? '__CREATE_NEW__' : editingWorker.trade}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__CREATE_NEW__') {
                      setIsCreatingTradeInWorkerModal(true);
                    } else {
                      setIsCreatingTradeInWorkerModal(false);
                      const matched = allTradeOptions.find((t) => t.id === val);
                      setEditingWorker({
                        ...editingWorker,
                        trade: val,
                        tradeTitle:
                          !editingWorker.tradeTitle ||
                          allTradeOptions.some((t) => t.defaultTitle === editingWorker.tradeTitle)
                            ? matched?.defaultTitle || matched?.label || editingWorker.tradeTitle
                            : editingWorker.tradeTitle,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                >
                  {allTradeOptions.map((t, idx) => (
                    <option key={`${t.id}-${idx}`} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                  <option value="__CREATE_NEW__">➕ ¿No está en la lista? Crear nuevo rubro...</option>
                </select>
              </div>

              {/* Inline Custom Trade Creator Card */}
              {isCreatingTradeInWorkerModal && (
                <div className="sm:col-span-2 p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-3 animate-fadeIn shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Crear Nuevo Rubro / Oficio Organizado</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsCreatingTradeInWorkerModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-tight">
                    Este nuevo rubro quedará registrado en el sistema para que todos los trabajadores puedan organizarse bajo esta categoría.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nombre del Nuevo Rubro *
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={newTradeNameInput}
                        onChange={(e) => setNewTradeNameInput(e.target.value)}
                        placeholder="Ej: Herrería, Fumigaciones, Marmolería..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Icono / Emoji
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newTradeIconInput}
                          onChange={(e) => setNewTradeIconInput(e.target.value)}
                          className="w-9 text-center py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-base text-white"
                          maxLength={2}
                        />
                        <div className="flex flex-wrap gap-1">
                          {['🛠️', '⚙️', '🔨', '🧰', '🛋️', '💻', '🧹', '🚗', '🛡️', '📦', '🏠', '🔒', '📱', '📹'].slice(0, 7).map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setNewTradeIconInput(emoji)}
                              className={`w-7 h-7 text-xs rounded-lg flex items-center justify-center transition-transform ${
                                newTradeIconInput === emoji
                                  ? 'bg-amber-500 text-slate-950 font-bold scale-110 shadow-sm'
                                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-500/20">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTradeInWorkerModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isSavingNewTrade || !newTradeNameInput.trim()}
                      onClick={handleSaveNewTrade}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      {isSavingNewTrade ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Guardar y Asignar Rubro</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Trade Title */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtítulo / Especialidad</label>
                <input
                  type="text"
                  value={editingWorker.tradeTitle || ''}
                  onChange={(e) => setEditingWorker({ ...editingWorker, tradeTitle: e.target.value })}
                  placeholder="Ej: Electricista Matriculado e Industrial"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Matricula */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Matrícula (opcional)</label>
                <input
                  type="text"
                  value={editingWorker.matricula || ''}
                  onChange={(e) => setEditingWorker({ ...editingWorker, matricula: e.target.value })}
                  placeholder="Ej: Matrícula N° 84920"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editingWorker.phone}
                  onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">WhatsApp (Números con prefijo)</label>
                <input
                  type="text"
                  value={editingWorker.whatsapp}
                  onChange={(e) => setEditingWorker({ ...editingWorker, whatsapp: e.target.value })}
                  placeholder="Ej: 5493584123456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Localidad Principal *</label>
                <select
                  value={editingWorker.location}
                  onChange={(e) => setEditingWorker({ ...editingWorker, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {getMergedLocalities([editingWorker.location]).map((loc, idx) => (
                    <option key={`${loc}-${idx}`} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zones */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Zonas Cobertura (Separadas por coma)</label>
                <input
                  type="text"
                  value={(editingWorker.zones || []).join(', ')}
                  onChange={(e) => setEditingWorker({
                    ...editingWorker,
                    zones: e.target.value.split(',').map((z) => z.trim()).filter((z) => z.length > 0)
                  })}
                  placeholder="Ej: Alejandro Roca, Río Cuarto, Los Cisnes"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tarifa por Hora ($ ARS)</label>
                <input
                  type="number"
                  value={editingWorker.hourlyRate || 0}
                  onChange={(e) => setEditingWorker({ ...editingWorker, hourlyRate: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Visit Fee */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Visita / Presupuesto ($ ARS)</label>
                <input
                  type="number"
                  value={editingWorker.visitFee || 0}
                  onChange={(e) => setEditingWorker({ ...editingWorker, visitFee: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Avatar URL */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">URL Foto de Perfil</label>
                <input
                  type="text"
                  value={editingWorker.avatar || ''}
                  onChange={(e) => setEditingWorker({ ...editingWorker, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Biografía / Presentación</label>
                <textarea
                  rows={2}
                  value={editingWorker.bio || ''}
                  onChange={(e) => setEditingWorker({ ...editingWorker, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checkboxes Section */}
              <div className="sm:col-span-2 space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Insignias y Estados Especiales
                </h4>

                {/* Socio Ferreteria Bruzzone FB */}
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-black text-orange-300 flex items-center gap-1.5">
                      <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black">FB</span>
                      Socio Ferretería Bruzzone (10% OFF Mano de Obra)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Otorga 10% de descuento en mano de obra con la compra de insumos en Ferretería Bruzzone.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingWorker.ferreteroPartner || false}
                    onChange={(e) => setEditingWorker({ ...editingWorker, ferreteroPartner: e.target.checked })}
                    className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                {/* Verified */}
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-black text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Verificado por ServiGo
                    </span>
                    <p className="text-[11px] text-slate-400">Muestra la tilde de perfil verificado.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingWorker.verified || false}
                    onChange={(e) => setEditingWorker({ ...editingWorker, verified: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {/* 24h urgencies */}
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-black text-rose-400 flex items-center gap-1.5">
                      🚨 Guardia y Urgencias 24hs
                    </span>
                    <p className="text-[11px] text-slate-400">Destaca al profesional en los filtros de urgencias.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingWorker.availability?.urgencies24h || false}
                    onChange={(e) => setEditingWorker({
                      ...editingWorker,
                      availability: {
                        ...editingWorker.availability,
                        urgencies24h: e.target.checked
                      }
                    })}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingWorker}
                onClick={async () => {
                  if (!editingWorker.name.trim()) {
                    showToast('El nombre del trabajador no puede estar vacío');
                    return;
                  }
                  if (!editingWorker.trade || editingWorker.trade === '__CREATE_NEW__') {
                    showToast('Por favor selecciona o crea un rubro válido');
                    return;
                  }
                  try {
                    setIsSavingWorker(true);
                    if (onSaveWorker) {
                      await onSaveWorker(editingWorker);
                    }
                    setEditingWorker(null);
                    showToast(
                      isCreatingNewWorker
                        ? `¡Trabajador "${editingWorker.name}" registrado correctamente!`
                        : `¡Perfil de "${editingWorker.name}" guardado correctamente!`
                    );
                  } catch (err) {
                    console.error(err);
                    showToast('❌ Error al guardar los datos del trabajador.');
                  } finally {
                    setIsSavingWorker(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                {isSavingWorker ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isCreatingNewWorker ? 'Guardar y Publicar Trabajador' : 'Guardar Cambios del Trabajador'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SHOP MODAL */}
      {editingShop && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 text-white shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-orange-400 flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-400" />
                {shops.some((s) => s.id === editingShop.id)
                  ? `Editar Comercio: ${editingShop.name || 'Sin Nombre'}`
                  : 'Nuevo Comercio en la Red'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Nombre del Comercio / Negocio *</label>
                <input
                  type="text"
                  value={editingShop.name}
                  onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
                  placeholder="Ej: Ferretería Bruzzone Central"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Rubro / Categoría */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Rubro / Categoría *</label>
                <input
                  type="text"
                  list="shop-categories-list"
                  value={editingShop.categoryTitle || editingShop.category}
                  onChange={(e) =>
                    setEditingShop({
                      ...editingShop,
                      categoryTitle: e.target.value,
                      category: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  placeholder="Ej: Ferretería & Materiales"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
                <datalist id="shop-categories-list">
                  <option value="Ferretería & Herramientas" />
                  <option value="Taller Mecánico & Autos" />
                  <option value="Sanitarios, Plomería & Gas" />
                  <option value="Electricidad & Iluminación" />
                  <option value="Corralón & Materiales" />
                  <option value="Pinturería & Revestimientos" />
                  <option value="Repuestos & Accesorios" />
                  <option value="Servicios Técnicos & Reparaciones" />
                </datalist>
              </div>

              {/* Dirección */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Dirección Física *</label>
                <input
                  type="text"
                  value={editingShop.address}
                  onChange={(e) => setEditingShop({ ...editingShop, address: e.target.value })}
                  placeholder="Ej: Av. Marconi 450"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Localidad / Ciudad *</label>
                <select
                  value={editingShop.location}
                  onChange={(e) => setEditingShop({ ...editingShop, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
                >
                  {getMergedLocalities([editingShop.location]).map((loc, idx) => (
                    <option key={`${loc}-${idx}`} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zones */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Zonas de Cobertura (Separadas por coma)</label>
                <input
                  type="text"
                  value={(editingShop.zones || []).join(', ')}
                  onChange={(e) =>
                    setEditingShop({
                      ...editingShop,
                      zones: e.target.value
                        .split(',')
                        .map((z) => z.trim())
                        .filter((z) => z.length > 0),
                    })
                  }
                  placeholder="Ej: Río Cuarto, Las Higueras, Holmberg"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Teléfono Fijo / Móvil</label>
                <input
                  type="text"
                  value={editingShop.phone}
                  onChange={(e) => setEditingShop({ ...editingShop, phone: e.target.value })}
                  placeholder="Ej: 0358 4620000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">WhatsApp (con código de país)</label>
                <input
                  type="text"
                  value={editingShop.whatsapp}
                  onChange={(e) => setEditingShop({ ...editingShop, whatsapp: e.target.value })}
                  placeholder="Ej: 5493584123456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email de Contacto (Opcional)</label>
                <input
                  type="email"
                  value={editingShop.email || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, email: e.target.value })}
                  placeholder="Ej: ventas@comercio.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Hours */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Horarios de Atención</label>
                <input
                  type="text"
                  value={editingShop.hours || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, hours: e.target.value })}
                  placeholder="Ej: Lun a Vie 08:00 - 18:30 | Sáb 08:30 - 13:00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Image URL */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">URL Foto de Portada / Local</label>
                <input
                  type="text"
                  value={editingShop.imageUrl || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Services or Products */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Productos / Servicios Destacados (Separados por coma)</label>
                <input
                  type="text"
                  value={(editingShop.servicesOrProducts || []).join(', ')}
                  onChange={(e) =>
                    setEditingShop({
                      ...editingShop,
                      servicesOrProducts: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    })
                  }
                  placeholder="Ej: Herramientas, Materiales Durlock, Griferías, Insumos Electricidad"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Descripción del Comercio</label>
                <textarea
                  rows={2}
                  value={editingShop.description || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, description: e.target.value })}
                  placeholder="Resumen del comercio, promociones especiales, historia, etc."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Badges / Checkboxes */}
              <div className="sm:col-span-2 space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-orange-400 uppercase tracking-wider text-[11px]">
                  Banderas, Verificaciones y Beneficios Exclusivos
                </h4>

                {/* Verified */}
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-black text-blue-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Comercio Verificado por ServiGo
                    </span>
                    <p className="text-[11px] text-slate-400">Muestra la insignia azul de negocio verificado.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingShop.verified || false}
                    onChange={(e) => setEditingShop({ ...editingShop, verified: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                  />
                </label>

                {/* Discount Partner */}
                <div className="p-2 rounded-xl hover:bg-slate-900 transition-colors space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-black text-amber-400 flex items-center gap-1.5">
                        🏷️ Beneficio / Descuento Exclusivo
                      </span>
                      <p className="text-[11px] text-slate-400">Ofrece promociones o descuentos especiales para clientes ServiGo.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingShop.discountPartner || false}
                      onChange={(e) => setEditingShop({ ...editingShop, discountPartner: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {editingShop.discountPartner && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Texto del Descuento / Promoción</label>
                      <input
                        type="text"
                        value={editingShop.discountText || ''}
                        onChange={(e) => setEditingShop({ ...editingShop, discountText: e.target.value })}
                        placeholder="Ej: 10% OFF en compras con ServiGo"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-xs font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Featured */}
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-black text-purple-400 flex items-center gap-1.5">
                      ⭐ Comercio Destacado en Portada
                    </span>
                    <p className="text-[11px] text-slate-400">Aparece prioritariamente en la sección de comercios.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingShop.featured || false}
                    onChange={(e) => setEditingShop({ ...editingShop, featured: e.target.checked })}
                    className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingShop}
                onClick={async () => {
                  if (!editingShop.name.trim()) {
                    showToast('El nombre del comercio no puede estar vacío');
                    return;
                  }
                  try {
                    setIsSavingShop(true);
                    if (onSaveShop) {
                      await onSaveShop(editingShop);
                    }
                    setEditingShop(null);
                    showToast(`¡Comercio "${editingShop.name}" guardado exitosamente!`);
                  } catch (err) {
                    console.error(err);
                    showToast('❌ Error al guardar los datos del comercio.');
                  } finally {
                    setIsSavingShop(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {isSavingShop ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Cambios del Comercio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REMIS MODAL */}
      {editingRemis && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 text-white shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-400" />
                {remises.some((r) => r.id === editingRemis.id)
                  ? `Editar Conductor: ${editingRemis.name || 'Sin Nombre'}`
                  : 'Nuevo Conductor de Remis'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRemis(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo del Chofer *</label>
                <input
                  type="text"
                  value={editingRemis.name}
                  onChange={(e) => setEditingRemis({ ...editingRemis, name: e.target.value })}
                  placeholder="Ej: Marcelo Fernández"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Teléfono Llamadas *</label>
                <input
                  type="text"
                  value={editingRemis.phone}
                  onChange={(e) => setEditingRemis({ ...editingRemis, phone: e.target.value })}
                  placeholder="Ej: 0358 154123456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">WhatsApp Directo (549...)</label>
                <input
                  type="text"
                  value={editingRemis.whatsapp}
                  onChange={(e) => setEditingRemis({ ...editingRemis, whatsapp: e.target.value })}
                  placeholder="Ej: 5493584123456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Base Location */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Localidad Base *</label>
                <select
                  value={editingRemis.baseLocation}
                  onChange={(e) => setEditingRemis({ ...editingRemis, baseLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                >
                  {getMergedLocalities([editingRemis.baseLocation]).map((loc, idx) => (
                    <option key={`${loc}-${idx}`} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zones */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Zonas de Cobertura (Separadas por coma)</label>
                <input
                  type="text"
                  value={(editingRemis.zones || []).join(', ')}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      zones: e.target.value
                        .split(',')
                        .map((z) => z.trim())
                        .filter((z) => z.length > 0),
                    })
                  }
                  placeholder="Ej: Río Cuarto, Las Higueras, Holmberg"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Vehicle Specs Header */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  Datos del Vehículo
                </h4>
              </div>

              {/* Make */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Marca *</label>
                <input
                  type="text"
                  value={editingRemis.vehicle.make}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      vehicle: { ...editingRemis.vehicle, make: e.target.value },
                    })
                  }
                  placeholder="Ej: Toyota, Chevrolet, Renault"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Modelo *</label>
                <input
                  type="text"
                  value={editingRemis.vehicle.model}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      vehicle: { ...editingRemis.vehicle, model: e.target.value },
                    })
                  }
                  placeholder="Ej: Corolla, Classic, Logan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Año</label>
                <input
                  type="text"
                  value={editingRemis.vehicle.year}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      vehicle: { ...editingRemis.vehicle, year: e.target.value },
                    })
                  }
                  placeholder="Ej: 2021"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Color</label>
                <input
                  type="text"
                  value={editingRemis.vehicle.color}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      vehicle: { ...editingRemis.vehicle, color: e.target.value },
                    })
                  }
                  placeholder="Ej: Gris Plata, Blanco, Negro"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Plate */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Patente / Dominio *</label>
                <input
                  type="text"
                  value={editingRemis.vehicle.plate}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      vehicle: { ...editingRemis.vehicle, plate: e.target.value.toUpperCase() },
                    })
                  }
                  placeholder="Ej: AA 123 CD"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono uppercase font-bold"
                />
              </div>

              {/* Tarifas Header */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  💵 Tarifas y Disponibilidad
                </h4>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Estado de Servicio</label>
                <select
                  value={editingRemis.status}
                  onChange={(e) =>
                    setEditingRemis({
                      ...editingRemis,
                      status: e.target.value as 'disponible' | 'en_viaje' | 'fuera_de_servicio',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                >
                  <option value="disponible">🟢 Disponible</option>
                  <option value="en_viaje">🟡 En Viaje</option>
                  <option value="fuera_de_servicio">⚪ Fuera de Servicio</option>
                </select>
              </div>

              {/* Base Rate */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Bajada de Bandera ($ ARS)</label>
                <input
                  type="number"
                  value={editingRemis.baseRate}
                  onChange={(e) =>
                    setEditingRemis({ ...editingRemis, baseRate: Number(e.target.value) || 0 })
                  }
                  placeholder="Ej: 1500"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Price Per Km */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Precio por Km ($ ARS)</label>
                <input
                  type="number"
                  value={editingRemis.pricePerKm}
                  onChange={(e) =>
                    setEditingRemis({ ...editingRemis, pricePerKm: Number(e.target.value) || 0 })
                  }
                  placeholder="Ej: 800"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Foto de Perfil / Vehículo URL</label>
                <input
                  type="text"
                  value={editingRemis.photoUrl || ''}
                  onChange={(e) => setEditingRemis({ ...editingRemis, photoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Features / Checkboxes */}
              <div className="sm:col-span-2 space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Equipamiento y Atributos Especiales
                </h4>

                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-black text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Conductor Verificado por ServiGo
                    </span>
                    <p className="text-[11px] text-slate-400">Muestra la insignia verde de chofer verificado.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingRemis.verified || false}
                    onChange={(e) => setEditingRemis({ ...editingRemis, verified: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sky-300">❄️ Posee Aire Acondicionado</span>
                    <p className="text-[11px] text-slate-400">Ideal para viajes largos en verano.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingRemis.hasAirConditioning}
                    onChange={(e) =>
                      setEditingRemis({ ...editingRemis, hasAirConditioning: e.target.checked })
                    }
                    className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-300">🐶 Acepta Mascotas (Pet Friendly)</span>
                    <p className="text-[11px] text-slate-400">Permite traslado de animales domésticos.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingRemis.acceptsPets}
                    onChange={(e) =>
                      setEditingRemis({ ...editingRemis, acceptsPets: e.target.checked })
                    }
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-bold text-purple-300">🧳 Baúl Amplio para Valijas / Cargas</span>
                    <p className="text-[11px] text-slate-400">Apto para viajes a terminales o aeropuertos.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingRemis.largeTrunk}
                    onChange={(e) =>
                      setEditingRemis({ ...editingRemis, largeTrunk: e.target.checked })
                    }
                    className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRemis(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingRemis}
                onClick={async () => {
                  if (!editingRemis.name.trim()) {
                    showToast('El nombre del conductor no puede estar vacío');
                    return;
                  }
                  if (!editingRemis.phone.trim()) {
                    showToast('El teléfono no puede estar vacío');
                    return;
                  }
                  try {
                    setIsSavingRemis(true);
                    if (onSaveRemis) {
                      await onSaveRemis(editingRemis);
                    }
                    setEditingRemis(null);
                    showToast(`¡Conductor "${editingRemis.name}" guardado exitosamente!`);
                  } catch (err) {
                    console.error(err);
                    showToast('❌ Error al guardar datos del conductor.');
                  } finally {
                    setIsSavingRemis(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {isSavingRemis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Cambios del Conductor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE REMIS MODAL */}
      {remisToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-white">
                ¿Eliminar conductor {remisToDelete.name}?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Esta acción dará de baja al chofer con vehículo <span className="font-bold text-amber-400">{remisToDelete.vehicle.make} {remisToDelete.vehicle.model} ({remisToDelete.vehicle.plate})</span> de la plataforma.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRemisToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingRemis}
                onClick={async () => {
                  try {
                    setIsDeletingRemis(true);
                    if (onDeleteRemis) {
                      await onDeleteRemis(remisToDelete.id);
                    }
                    setRemisToDelete(null);
                    showToast(`🗑️ Conductor "${remisToDelete.name}" eliminado.`);
                  } catch (err) {
                    console.error(err);
                    showToast('❌ Error al eliminar el remis.');
                  } finally {
                    setIsDeletingRemis(false);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {isDeletingRemis ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Eliminar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

