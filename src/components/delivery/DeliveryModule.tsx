import React, { useState, useEffect } from 'react';
import {
  Bike,
  Store,
  User,
  ShoppingBag,
  Bell,
  Sparkles,
  ShieldCheck,
  MapPin,
  RefreshCw,
  HelpCircle,
  FileCode2,
  CheckCircle2,
  Clock,
  Home,
  Wrench,
  UtensilsCrossed
} from 'lucide-react';
import { Merchant, UserProfile, Order } from '../../types';
import {
  subscribeMerchants,
  subscribeUserProfile,
  subscribeClientOrders,
  getSavedMerchantSession,
  setSavedMerchantSession,
  clearSavedMerchantSession,
} from '../../lib/deliveryService';
import { INITIAL_MERCHANTS } from '../../data/mockMerchants';
import { ClientDeliveryView } from './ClientDeliveryView';
import { MerchantOrdersPanel } from './MerchantOrdersPanel';
import { MerchantLoginRegisterView } from './MerchantLoginRegisterView';
import { DeliveryUserProfileModal } from './DeliveryUserProfileModal';
import { ShopDashboardModal } from './ShopDashboardModal';
import { ServiGoDeliveryLogo } from '../logos/ServiGoDeliveryLogo';
import { ErrorBoundary } from '../ErrorBoundary';

interface DeliveryModuleProps {
  showToast?: (msg: string) => void;
  onNavigateToHome?: () => void;
  onSwitchToServicios?: () => void;
  onSwitchToCadetes?: () => void;
}

export const DeliveryModule: React.FC<DeliveryModuleProps> = ({
  showToast,
  onNavigateToHome,
  onSwitchToServicios,
  onSwitchToCadetes,
}) => {
  // Mode: 'client' (Customer ordering food) vs 'merchant' (Restaurant receiving orders)
  const [activeMode, setActiveMode] = useState<'client' | 'merchant'>('client');
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);

  // Authenticated Merchant ID for private food merchant access
  const [loggedMerchantId, setLoggedMerchantId] = useState<string | null>(() => {
    return getSavedMerchantSession();
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_cliente_demo',
    name: 'Mariano Rodríguez',
    phone: '+54 9 358 512-9988',
    email: 'mariano.rodriguez@gmail.com',
    role: 'client',
    deliveryAddress: 'Av. San Martín 820, Alejandro Roca',
    coordinates: {
      lat: -33.3524,
      lng: -63.7214,
    },
  });
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isShopDashboardModalOpen, setIsShopDashboardModalOpen] = useState<boolean>(false);
  const [showVercelNotes, setShowVercelNotes] = useState<boolean>(false);

  // Subscribe to merchants in Firestore
  useEffect(() => {
    const unsubMerchants = subscribeMerchants((realtimeMerchants) => {
      if (realtimeMerchants && realtimeMerchants.length > 0) {
        setMerchants(realtimeMerchants);
      }
    });

    const unsubUser = subscribeUserProfile(userProfile.id, (realtimeUser) => {
      setUserProfile(realtimeUser);
    });

    const unsubClientOrders = subscribeClientOrders(userProfile.id, (orders) => {
      setClientOrders(orders);
    });

    return () => {
      unsubMerchants();
      unsubUser();
      unsubClientOrders();
    };
  }, [userProfile.id]);

  const loggedMerchant = loggedMerchantId
    ? merchants.find((m) => m.id === loggedMerchantId) || null
    : null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Top Header & Role Switcher Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              MÓDULO DELIVERY OFICIAL
            </span>
            <span className="bg-slate-900 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <Store className="w-3 h-3 text-orange-400" />
              Comercios Multi-Rubro
            </span>
          </div>
          <ServiGoDeliveryLogo size="md" />
          <p className="text-xs text-slate-500 font-medium">
            Pide en comidas, farmacias, tiendas de ropa, kioscos y comercios locales con entrega a domicilio.
          </p>
        </div>

        {/* Action Controls: Volver al Inicio, Ir a Servicios & Dual Role Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2">
            {onNavigateToHome && (
              <button
                onClick={onNavigateToHome}
                className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all border border-slate-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Volver a la pantalla de selección inicial"
              >
                <Home className="w-4 h-4 text-orange-600" />
                <span>🏠 Volver al Inicio</span>
              </button>
            )}

            {onSwitchToServicios && (
              <button
                onClick={onSwitchToServicios}
                className="px-3 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-black transition-all border border-blue-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Ir al módulo de oficios y reparaciones"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Ir a</span>
                <span>🛠️ Servicios</span>
              </button>
            )}

            {onSwitchToCadetes && (
              <button
                onClick={onSwitchToCadetes}
                className="px-3 py-2 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-black transition-all border border-orange-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Ir al módulo de cadetes y mandados urbanos"
              >
                <Bike className="w-3.5 h-3.5 text-orange-600" />
                <span>🛵 Cadetes</span>
              </button>
            )}

            <button
              onClick={() => setIsShopDashboardModalOpen(true)}
              className="px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Abrir ShopDashboardModal para dueños de comercios"
            >
              <Store className="w-4 h-4 text-slate-950" />
              <span>🏪 Shop Dashboard (Modal)</span>
            </button>
          </div>

          {/* Dual Role Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveMode('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeMode === 'client'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>🛍️ Comprar / Catálogo</span>
            </button>

            <button
              onClick={() => setActiveMode('merchant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeMode === 'merchant'
                  ? 'bg-slate-950 text-amber-300 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>
                {loggedMerchant ? `🏪 ${loggedMerchant.name}` : '🔐 Acceso Comercios'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Sub-nav & Helper Info */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          {activeMode === 'client' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 font-extrabold text-xs">
              <User className="w-3.5 h-3.5 text-orange-600" />
              <span>Cliente Activo: <strong>{userProfile.name}</strong> ({userProfile.deliveryAddress})</span>
            </span>
          ) : loggedMerchant ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 font-extrabold text-xs">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestionando local: <strong>{loggedMerchant.name}</strong></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Acceso Seguro para Casas de Comida</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-orange-600" />
            <span>Editar Datos de Envío</span>
          </button>

          <button
            onClick={() => setShowVercelNotes(!showVercelNotes)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Guía Despliegue Vercel</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner for Vercel Deployment & Architecture */}
      {showVercelNotes && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-amber-400" />
              Integración con Firebase Modular v9+ & Vercel
            </h4>
            <button
              onClick={() => setShowVercelNotes(false)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕ Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
              <strong className="text-amber-300 block">1. Colección 'users'</strong>
              <p className="text-[11px] leading-relaxed">
                Almacena el perfil del cliente, su teléfono de contacto, dirección de entrega y geolocalización GPS. En el checkout se autocompleta automáticamente.
              </p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
              <strong className="text-amber-300 block">2. Panel del Comercio en Vivo</strong>
              <p className="text-[11px] leading-relaxed">
                Utiliza <code>onSnapshot</code> filtrando por <code>merchantId</code>. Al llegar un pedido <code>PENDING</code>, activa el timbre de alerta Web Audio API y permite despachar con cadete propio o solicitar un remis de ServiGo.
              </p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
              <strong className="text-amber-300 block">3. Despliegue en Vercel</strong>
              <p className="text-[11px] leading-relaxed">
                Todo el código utiliza Firebase v9+ cliente modular. Solo necesitas configurar las variables de entorno en Vercel Project Settings y el build <code>npm run build</code> funciona de forma inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT VIEW */}
      {activeMode === 'client' ? (
        <ClientDeliveryView
          merchants={merchants}
          userProfile={userProfile}
          activeOrders={clientOrders}
          showToast={showToast}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />
      ) : !loggedMerchant ? (
        <MerchantLoginRegisterView
          allMerchants={merchants}
          onLoginSuccess={(merchant) => {
            setLoggedMerchantId(merchant.id);
            setSavedMerchantSession(merchant.id);
          }}
          onCancelToClientMode={() => setActiveMode('client')}
          showToast={showToast}
        />
      ) : (
        <MerchantOrdersPanel
          merchant={loggedMerchant}
          onLogout={() => {
            setLoggedMerchantId(null);
            clearSavedMerchantSession();
            if (showToast) showToast('Sesión de comercio cerrada.');
          }}
          showToast={showToast}
        />
      )}

      {/* User Shipping & Profile Modal */}
      {isProfileModalOpen && (
        <DeliveryUserProfileModal
          userProfile={userProfile}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={setUserProfile}
          showToast={showToast}
        />
      )}

      {/* ShopDashboardModal for Store Owners */}
      <ErrorBoundary fallbackTitle="Error al abrir el panel de control del comercio">
        <ShopDashboardModal
          isOpen={isShopDashboardModalOpen}
          onClose={() => setIsShopDashboardModalOpen(false)}
          initialMerchantId={loggedMerchantId || undefined}
          showToast={showToast}
        />
      </ErrorBoundary>
    </div>
  );
};
