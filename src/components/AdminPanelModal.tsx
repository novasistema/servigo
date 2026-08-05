import React, { useState } from 'react';
import { TabVisibilityConfig, PromotedBanner, AppConfig, Worker } from '../types';
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
  Users,
  Search,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  UserX,
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
  onDeleteWorker: (workerId: string) => Promise<void>;
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
  onDeleteWorker,
  onClearAllData,
  onResetToDefaults,
  showToast,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'tabs' | 'banners' | 'subscriptions' | 'workers' | 'reset'>('tabs');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'paid' | 'pending' | 'expired'>('all');
  
  // Custom Logo and Branding states
  const [logoUrlInput, setLogoUrlInput] = useState(appConfig?.customLogoUrl || '');
  const [taglineInput, setTaglineInput] = useState(appConfig?.tagline || '');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Sync state when appConfig loads
  React.useEffect(() => {
    if (appConfig) {
      setLogoUrlInput(appConfig.customLogoUrl || '');
      setTaglineInput(appConfig.tagline || '');
    }
  }, [appConfig]);

  // Worker Management States
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [isDeletingWorker, setIsDeletingWorker] = useState(false);

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
    if (pinInput === '1234' || pinInput === 'admin') {
      setIsAdminAuthenticated(true);
      setPinError(false);
      setLocalTabs(tabConfig);
      showToast('¡Modo Administrador Creador activado exitosamente!');
    } else {
      setPinError(true);
    }
  };

  const handleToggleTab = (tabKey: keyof TabVisibilityConfig) => {
    const updated = { ...localTabs, [tabKey]: !localTabs[tabKey] };
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
              <h3 className="text-lg font-black text-white">Ingresa el PIN de Creador</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Esta sección es exclusiva para el creador de la aplicación. Ingresa tu Clave PIN de administrador para continuar.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Introduce tu PIN"
                  className={`w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-slate-950 border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${
                    pinError
                      ? 'border-rose-500 focus:ring-rose-500/50'
                      : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/30'
                  }`}
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-400 font-bold mt-2 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    PIN incorrecto. Intenta nuevamente.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Modo Administrador</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED PANEL BODY */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Tab Navigation Switches */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('tabs')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
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
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'banners'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>2. Banners ({banners.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'subscriptions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>3. Pagos</span>
                {(pendingPaymentsCount > 0 || expiredPaymentsCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('workers')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'workers'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>4. Trabajadores ({workers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reset')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'reset'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>5. Borrar Todo</span>
              </button>
            </div>

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
                              customTrades: appConfig?.customTrades,
                              updatedAt: new Date().toISOString(),
                            };
                            if (onSaveAppConfig) {
                              await onSaveAppConfig(updatedConfig);
                            }
                            showToast('🎨 ¡Logo y eslogan actualizados correctamente!');
                          } catch (err) {
                            showToast('❌ Error al guardar el logo.');
                          } finally {
                            setIsSavingBranding(false);
                          }
                        }}
                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        {isSavingBranding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Guardar Logo y Eslogan</span>
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
                    { key: 'register', label: '👷 Soy Trabajador (Publicar Perfil)', desc: 'Formulario de registro para nuevos prestadores' },
                    { key: 'sponsor', label: '🏬 Ferretería Bruzzone (Tienda Oficial)', desc: 'Espacio patrocinado con catálogo de materiales' },
                    { key: 'ai', label: '🤖 Diagnóstico IA (Asistente Técnico)', desc: 'Evaluador automatizado de presupuestos e insumos' },
                    { key: 'bookings', label: '📅 Mis Turnos (Solicitudes Enviadas)', desc: 'Historial de reservas e interactividad' },
                  ].map((item) => {
                    const k = item.key as keyof TabVisibilityConfig;
                    const isVisible = localTabs[k];

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
                          <label className="block text-slate-300 font-bold mb-1">URL Imagen de Fondo / Foto</label>
                          <input
                            type="url"
                            value={editingBanner.imageUrl || ''}
                            onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/photo-..."
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
                      Busca y administra a los prestadores de servicio. Puedes eliminar perfiles obsoletos o falsos de Firestore.
                    </p>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={workerSearchTerm}
                      onChange={(e) => setWorkerSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, oficio o teléfono..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
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
                            src={w.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={w.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-black text-white truncate">{w.name}</h4>
                              {w.verified && (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Verificado
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1 truncate">
                              <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                              {w.trade}
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
                            <span>{w.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({w.reviewsCount})</span>
                          </div>

                          <button
                            onClick={() => setWorkerToDelete(w)}
                            className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Trabajador</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: REINICIAR Y BORRAR DATOS */}
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
                  src={workerToDelete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
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
    </>
  );
};

