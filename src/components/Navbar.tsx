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
            { id: 'delivery', label: 'Delivery', icon: Bike, on: isDeliveryActive || activeTab === 'cadetes', cls: 'bg-sg-orange text-[#2a1300]' },
            { id: 'alquiler', label: 'Alquiler', icon: RotateCcw, on: isAlquilerActive, cls: 'bg-sg-green text-[#052e16]' },
          ] as const).map((m) => {
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

      {/* Navigation Tabs Bar */}
      <div className={`${isAlquilerActive ? 'hidden' : ''} bg-white border-b border-slate-200/80 text-slate-700 px-2 sm:px-3 py-1 shadow-xs`}>
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* BOTÓN VOLVER AL COMIENZO (Siempre disponible) */}
          {onOpenWelcomeHub && (
            <button
              onClick={onOpenWelcomeHub}
              className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap shrink-0 bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer active:scale-95"
              title="Volver al menú de inicio y selector de módulos"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>Inicio</span>
            </button>
          )}

          {isAlquilerActive ? (
            /* ============================================================ */
            /* MÓDULO SERVIGO ALQUILER DE PRODUCTOS (ESTILO GIVY)           */
            /* ============================================================ */
            <>
              <button
                onClick={() => setActiveTab('alquiler')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap shrink-0 bg-emerald-600 text-white shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>🔄 Catálogo de Alquileres</span>
                {rentalItemsCount > 0 && (
                  <span className="bg-white text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {rentalItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (onOpenPublishRental) onOpenPublishRental();
                }}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-orange-700 hover:text-orange-900 hover:bg-orange-50 border border-orange-200 cursor-pointer"
              >
                <span>➕ Publicar mi Producto</span>
              </button>

              <button
                onClick={() => setActiveTab('cadetes')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                title="Cadetes para fletes o traslados de herramientas"
              >
                <Bike className="w-3.5 h-3.5 text-orange-600" />
                <span>🛵 Cadetes para Traslado</span>
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                title="Ir a Servicios y Profesionales"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>🛠️ Ir a Servicios</span>
              </button>

              <button
                onClick={() => setActiveTab('delivery')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-orange-700 hover:text-orange-900 hover:bg-orange-50 border border-orange-200 cursor-pointer"
                title="Ir a Delivery de Comida"
              >
                <Pizza className="w-3.5 h-3.5 text-orange-600" />
                <span>🍕 Ir a Delivery</span>
              </button>
            </>
          ) : isDeliveryActive ? (
            /* ============================================================ */
            /* MÓDULO SERVIGO DELIVERY: TABS EXCLUSIVOS DE COMERCIOS DE COMIDA */
            /* ============================================================ */
            <>
              <button
                onClick={() => setActiveTab('delivery')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap shrink-0 bg-orange-600 text-white shadow-md"
              >
                <Pizza className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>🍕 Comercios de Comida</span>
                {deliveryPendingCount > 0 && (
                  <span className="bg-white text-orange-700 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {deliveryPendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('alquiler')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                title="Alquiler de productos y herramientas"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>🔄 Alquileres</span>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Nuevo
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cadetes')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-orange-700 hover:text-orange-900 hover:bg-orange-50 border border-orange-200 cursor-pointer"
                title="Ver cadetes independientes disponibles para mandados y envíos"
              >
                <Bike className="w-3.5 h-3.5 text-orange-600" />
                <span>🛵 Cadetes Disponibles</span>
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                title="Ir al módulo de servicios y profesionales de oficios"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>🛠️ Ir a ServiGo Servicios</span>
              </button>
            </>
          ) : (
            /* ============================================================ */
            /* MÓDULO SERVIGO SERVICIOS: TABS DE OFICIOS, REMISES & BRUZZONE */
            /* ============================================================ */
            <>
              {tabConfig.search && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'search'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Buscar Oficio</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('alquiler')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                title="Alquiler de productos y herramientas"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>🔄 Alquileres</span>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Nuevo
                </span>
              </button>


              {tabConfig.shops && (
                <button
                  onClick={() => setActiveTab('shops')}
                  className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'shops'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Comercios & Negocios</span>
                </button>
              )}

              {tabConfig.jobs !== false && (
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'jobs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                  <span>Bolsa de Trabajo</span>
                  <span className="bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    CV
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('cadetes')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'cadetes'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                <span>🛵 Cadetes & Envíos</span>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  En Vivo
                </span>
              </button>

              {tabConfig.remises !== false && (
                <button
                  onClick={() => setActiveTab('remises')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'remises'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                  <span>Remises / Viajes</span>
                  <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    Nuevo
                  </span>
                </button>
              )}

              {tabConfig.ai && (
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'ai'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                  <span>Diagnóstico IA</span>
                </button>
              )}

              {tabConfig.register && (
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'register'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  <span>Soy Trabajador</span>
                </button>
              )}

              {tabConfig.sponsor && (
                <button
                  onClick={() => setActiveTab('bruzzone')}
                  className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'bruzzone'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                  <span>Ferretería Bruzzone</span>
                </button>
              )}

              {tabConfig.bookings && (
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`relative flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'bookings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Mis Solicitudes</span>
                  {bookingCount > 0 && (
                    <span className="bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                      {bookingCount}
                    </span>
                  )}
                </button>
              )}

              {tabConfig.delivery !== false && (
                <button
                  onClick={() => setActiveTab('delivery')}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 text-orange-700 hover:text-orange-900 hover:bg-orange-50 border border-orange-200 cursor-pointer ml-auto"
                >
                  <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                  <span>🛵 Ir a ServiGo Delivery</span>
                  {deliveryPendingCount > 0 && (
                    <span className="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                      {deliveryPendingCount}
                    </span>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

