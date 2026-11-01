import React, { useState } from 'react';
import { TabVisibilityConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Search,
  UserPlus,
  Sparkles,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Settings,
  FileText,
  Store,
  Car,
  Bike,
  Home,
  LayoutGrid,
  UtensilsCrossed,
  Utensils,
  Pizza,
  Clock,
  Briefcase,
  RotateCcw,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import servigoOfficialLogo from '../assets/images/servigo_official_logo_1785771884278.jpg';
import servigoDeliveryLogoImg from '../assets/images/servigo_delivery_logo.jpg';
import servigoIcon from '../assets/icon.jpg';

interface NavbarProps {
  activeTab: 'search' | 'shops' | 'jobs' | 'delivery' | 'cadetes' | 'remises' | 'register' | 'ai' | 'bruzzone' | 'bookings' | 'alquiler';
  setActiveTab: (tab: 'search' | 'shops' | 'jobs' | 'delivery' | 'cadetes' | 'remises' | 'register' | 'ai' | 'bruzzone' | 'bookings' | 'alquiler') => void;
  bookingCount: number;
  deliveryPendingCount?: number;
  rentalItemsCount?: number;
  tabConfig?: TabVisibilityConfig;
  customLogoUrl?: string;
  customTagline?: string;
  onOpenAdminPanel?: () => void;
  onOpenPdfGuide?: () => void;
  onOpenWelcomeHub?: () => void;
  onOpenShopDashboard?: () => void;
  onOpenPublishRental?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  deliveryPendingCount = 0,
  rentalItemsCount = 0,
  tabConfig = { search: true, shops: true, jobs: true, delivery: true, remises: true, register: true, sponsor: true, ai: true, bookings: true },
  customLogoUrl,
  customTagline,
  onOpenAdminPanel,
  onOpenPdfGuide,
  onOpenWelcomeHub,
  onOpenShopDashboard,
  onOpenPublishRental,
  isAdminAuthenticated = false,
}) => {
  const { currentUser, openAuthModal, logout } = useAuth();
  const [logoError, setLogoError] = React.useState(false);

  const isDeliveryActive = activeTab === 'delivery';
  const isAlquilerActive = activeTab === 'alquiler';
  const servigoAlquilerLogoImg = '/assets/aistudio/Gemini_Generated_Image_igtdraigtdraigtd_37ae301b.jpg';

  return (
    <header className="bg-sg-navy text-white sticky top-0 z-40 shadow-lg font-sans">
      {/* Barra superior: logo + módulo actual + acceso */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenWelcomeHub}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
          title="Ir al inicio"
        >
          <img src={servigoIcon} alt="" className="w-9 h-9 rounded-[10px] object-cover shrink-0" />
          <span className="font-black text-xl tracking-tight">ServiGo</span>
          <span
            className={`text-[11px] font-extrabold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full ${
              isAlquilerActive
                ? 'bg-sg-green text-[#052e16]'
                : isDeliveryActive || activeTab === 'cadetes'
                ? 'bg-sg-orange text-[#2a1300]'
                : 'bg-sg-blue text-white'
            }`}
          >
            {isAlquilerActive ? 'Alquiler' : isDeliveryActive ? 'Delivery' : activeTab === 'cadetes' ? 'Cadetes' : 'Servicios'}
          </span>
        </button>

        {/* Selector de módulos (pantallas grandes; en celular está la barra de abajo) */}
        <nav aria-label="Módulos" className="hidden sm:flex items-center gap-1.5">
          {([
            { id: 'search', label: 'Servicios', icon: Wrench, on: !isDeliveryActive && !isAlquilerActive && activeTab !== 'cadetes', cls: 'bg-sg-blue text-white' },
            { id: 'delivery', label: 'Delivery', icon: Utensils, on: isDeliveryActive || activeTab === 'cadetes', cls: 'bg-sg-orange text-[#2a1300]' },
            { id: 'alquiler', label: 'Alquiler', icon: RotateCcw, on: isAlquilerActive, cls: 'bg-sg-green text-[#052e16]' },
          ] as const).filter((m) => (m.id === 'delivery' ? tabConfig.delivery !== false : m.id === 'alquiler' ? tabConfig.alquiler !== false : true)).map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveTab(m.id)}
                aria-current={m.on ? 'page' : undefined}
                className={`h-10 px-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  m.on ? `${m.cls} font-extrabold` : 'text-[#c3cfea] hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {m.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenPdfGuide && (
            <button
              type="button"
              onClick={onOpenPdfGuide}
              aria-label="Guía para sumarte"
              title="Guía para sumarte"
              className="hidden sm:inline-flex w-10 h-10 rounded-full border border-white/25 items-center justify-center hover:bg-white/10 cursor-pointer"
            >
              <FileText className="w-4.5 h-4.5" aria-hidden="true" />
            </button>
          )}
          {isAdminAuthenticated && onOpenAdminPanel && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="h-10 px-3 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1 hover:bg-amber-300 cursor-pointer"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Creador
            </button>
          )}
          {currentUser ? (
            <div className="flex items-center gap-1 h-10 pl-3 pr-1 rounded-full bg-white/10 border border-white/15">
              <span className="text-xs font-bold truncate max-w-[90px] sm:max-w-[140px]" title={currentUser.email || currentUser.displayName || ''}>
                {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Cerrar sesión"
                className="w-8 h-8 rounded-full inline-flex items-center justify-center hover:bg-white/15 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('Inicia sesión para gestionar tus publicaciones, reservas y billetera.')}
              className="h-10 px-3.5 rounded-full border border-white/30 font-bold text-sm inline-flex items-center gap-1.5 hover:bg-white/10 cursor-pointer"
            >
              <LogIn className="w-4 h-4 hidden sm:block" aria-hidden="true" />
              Ingresar
            </button>
          )}
        </div>
      </div>

      {/* Sub-secciones de Servicios (Alquiler y Delivery tienen su propia navegación) */}
      {!isAlquilerActive && !isDeliveryActive && (
        <div className="bg-sg-navy border-t border-white/10">
          <nav
            aria-label="Secciones de Servicios"
            className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2.5"
          >
            {([
              { id: 'search', label: 'Profesionales', icon: Search, show: tabConfig.search },
              { id: 'register', label: 'Soy trabajador', icon: UserPlus, show: tabConfig.register },
              { id: 'jobs', label: 'Bolsa de trabajo', icon: Briefcase, show: tabConfig.jobs !== false },
              { id: 'shops', label: 'Comercios', icon: Store, show: tabConfig.shops },
              { id: 'cadetes', label: 'Cadetes', icon: Bike, show: tabConfig.cadetes !== false },
              { id: 'remises', label: 'Remises', icon: Car, show: tabConfig.remises !== false },
              { id: 'ai', label: 'Diagnóstico IA', icon: Sparkles, show: tabConfig.ai },
              { id: 'bruzzone', label: 'Ferretería Bruzzone', icon: ShoppingBag, show: tabConfig.sponsor },
              { id: 'bookings', label: 'Mis solicitudes', icon: Calendar, show: tabConfig.bookings, count: bookingCount },
            ] as const)
              .filter((t) => t.show)
              .map((t) => {
                const Icon = t.icon;
                const on = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    aria-current={on ? 'page' : undefined}
                    className={`shrink-0 h-10 px-3.5 rounded-full text-sm whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      on ? 'bg-white text-sg-navy font-extrabold' : 'text-[#c3cfea] font-semibold hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {t.label}
                    {'count' in t && t.count > 0 && (
                      <span className="bg-sg-orange text-[#2a1300] text-[11px] font-black px-1.5 rounded-full min-w-5 text-center">{t.count}</span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>
      )}
    </header>
  );
};

