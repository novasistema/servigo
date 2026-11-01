import React, { useState, useEffect } from 'react';
import { ChevronRight, Utensils } from 'lucide-react';
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
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  // Authenticated Merchant ID for private food merchant access
  const [loggedMerchantId, setLoggedMerchantId] = useState<string | null>(() => {
    return getSavedMerchantSession();
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_cliente_local',
    name: '',
    phone: '',
    email: '',
    role: 'client',
    deliveryAddress: '',
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
      setMerchants(realtimeMerchants || []);
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
    <div className="font-sans">
      {/* Encabezado de Delivery */}
      <div className="bg-sg-navy text-white">
        <div className="max-w-7xl mx-auto px-5 pt-6 pb-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-sg-orange flex items-center justify-center shrink-0">
                <Utensils className="w-6 h-6 text-[#2a1300]" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <h1 className="m-0 text-[32px] sm:text-4xl font-black tracking-[-0.03em] leading-none">Delivery</h1>
            </div>
            <p className="m-0 text-[15px] leading-snug text-[#c3cfea] max-w-2xl">
              {activeMode === 'client'
                ? 'Pedí comida a los locales de Alejandro Roca y te la llevan a tu casa.'
                : 'Panel para pizzerías, rotiserías y casas de comida: recibí pedidos al instante.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {activeMode === 'client' && (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex-1 sm:flex-none sm:min-w-72 flex items-center gap-3 h-[52px] px-4 rounded-2xl bg-sg-navy-2 hover:bg-[#1a3060] text-left cursor-pointer"
              >
                <MapPin className="w-5 h-5 text-sg-orange shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#a9b8db]">Enviar a</span>
                  <span className="block text-sm font-bold truncate">
                    {userProfile.deliveryAddress || 'Cargá tu dirección'}
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 text-[#a9b8db] shrink-0" aria-hidden="true" />
              </button>
            )}

            <div role="tablist" aria-label="Modo" className="flex gap-1 p-1 rounded-2xl bg-sg-navy-2 sm:ml-auto">
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'client'}
                onClick={() => setActiveMode('client')}
                className={`flex-1 h-11 px-4 rounded-xl text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'client' ? 'bg-sg-orange text-[#2a1300] font-extrabold' : 'text-[#c3cfea] font-semibold hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" /> Pedir comida
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'merchant'}
                onClick={() => setActiveMode('merchant')}
                className={`flex-1 h-11 px-4 rounded-xl text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'merchant' ? 'bg-white text-sg-navy font-extrabold' : 'text-[#c3cfea] font-semibold hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" aria-hidden="true" />
                <span className="truncate max-w-40">{loggedMerchant ? loggedMerchant.name : 'Soy un local'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-5 space-y-6">
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
    </div>
  );
};
