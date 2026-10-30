import React from 'react';
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
  RotateCcw
} from 'lucide-react';
import { TabVisibilityConfig } from '../types';
import servigoOfficialLogo from '../assets/images/servigo_official_logo_1785771884278.jpg';
import servigoDeliveryLogoImg from '../assets/images/servigo_delivery_logo.jpg';

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
  const [logoError, setLogoError] = React.useState(false);

  const isDeliveryActive = activeTab === 'delivery';
  const isAlquilerActive = activeTab === 'alquiler';
  const servigoAlquilerLogoImg = '/assets/aistudio/Gemini_Generated_Image_igtdraigtdraigtd_37ae301b.jpg';

  return (
    <header className="bg-orange-600 text-white sticky top-0 z-40 shadow-lg">
      {/* Sponsor Top Strip & Module Quick Hub */}
      <div className="bg-orange-700 text-orange-100 text-xs font-bold py-1.5 px-3 sm:px-4 flex items-center justify-between border-b border-orange-500/40">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-white text-orange-700 text-[10px] px-2 py-0.5 rounded-full tracking-wide uppercase font-black shadow-xs">
            AUSPICIADOR OFICIAL
          </span>
          <span className="truncate hidden sm:inline">Ferretería Bruzzone • Red de Profesionales y Comercios</span>
        </div>

        {/* Action triggers in top strip */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {onOpenWelcomeHub && (
            <button
              onClick={onOpenWelcomeHub}
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white text-orange-950 hover:bg-orange-50 border border-orange-300 font-black text-[11px] transition-all shadow-xs cursor-pointer active:scale-95"
              title="Volver a la pantalla de selección inicial"
            >
              <Home className="w-3.5 h-3.5 text-orange-600" />
              <span>🏠 Volver al Comienzo</span>
            </button>
          )}

          {onOpenPdfGuide && (
            <button
              onClick={onOpenPdfGuide}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] hover:bg-amber-300 transition-all shadow-xs cursor-pointer"
              title="Descargar o ver la guía en PDF de cómo registrarse"
            >
              <FileText className="w-3 h-3 text-slate-950" />
              <span className="hidden xs:inline">📄 Guía PDF</span>
            </button>
          )}

          {onOpenShopDashboard && (
            <button
              onClick={onOpenShopDashboard}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] transition-all shadow-xs cursor-pointer"
              title="Abrir el ShopDashboardModal para dueños de comercios"
            >
              <Store className="w-3 h-3 text-white" />
              <span>🏪 Dueños Comercios</span>
            </button>
          )}

          {/* Admin Creator Trigger Link */}
          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-amber-300 font-extrabold text-[10px] transition-all border border-amber-400/30 shadow-xs cursor-pointer"
              title="Panel Administrador del Creador"
            >
              <Settings className="w-3 h-3 text-amber-400" />
              <span>{isAdminAuthenticated ? '👑 Admin' : '⚙️ Creador'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand & Logo Header */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        {/* Logo Section: Differentiates ServiGo Alquiler vs ServiGo Delivery vs ServiGo Servicios */}
        <div className="flex items-center gap-2 sm:gap-3 select-none min-w-0">
          {isAlquilerActive ? (
            /* BRAND FOR ALQUILER (ESTILO GIVY) */
            <div
              onClick={() => setActiveTab('alquiler')}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="ServiGo Alquiler de Productos Oficial - Estilo Givy"
            >
              <img
                src={servigoAlquilerLogoImg}
                alt="ServiGo Alquiler de Productos"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-md bg-white p-0.5 border border-emerald-400 shrink-0"
              />
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    Servi<span className="text-amber-300">Go</span>
                  </span>
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-emerald-400 uppercase">
                    Alquiler
                  </span>
                </div>
                <p className="text-[10px] text-orange-100 font-semibold mt-0.5 truncate max-w-[200px] sm:max-w-none">
                  Alquiler de cosas & herramientas • Estilo Givy
                </p>
              </div>
            </div>
          ) : isDeliveryActive ? (
            /* BRAND FOR DELIVERY */
            <div
              onClick={() => setActiveTab('delivery')}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="ServiGo Delivery Oficial - Comercios de Comida"
            >
              <img
                src={servigoDeliveryLogoImg}
                alt="ServiGo Delivery"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-md bg-white p-0.5 border border-orange-400 shrink-0"
              />
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    Servi<span className="text-amber-300">Go</span>
                  </span>
                  <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-orange-300 uppercase">
                    Delivery
                  </span>
                </div>
                <p className="text-[10px] text-orange-100 font-semibold mt-0.5 truncate max-w-[200px] sm:max-w-none">
                  Comercios de comida & envíos en minutos
                </p>
              </div>
            </div>
          ) : (
            /* BRAND FOR SERVICIOS */
            <div
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="ServiGo Servicios Oficial - Oficios y Reparaciones"
            >
              <img
                src={servigoOfficialLogo}
                alt="ServiGo Servicios"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-md bg-white p-0.5 border border-blue-400 shrink-0"
              />
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    Servi<span className="text-amber-300">Go</span>
                  </span>
                  <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-blue-400 uppercase">
                    Servicios
                  </span>
                </div>
                <p className="text-[10px] text-orange-100 font-semibold mt-0.5 truncate max-w-[200px] sm:max-w-none">
                  {customTagline || 'La solución que buscas, está aquí.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3 Pillars Direct Switcher: Servicios, Delivery, Alquiler */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Module 1: Servicios */}
          <button
            onClick={() => setActiveTab('search')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              !isDeliveryActive && !isAlquilerActive
                ? 'bg-white text-blue-700 shadow-md font-black'
                : 'bg-orange-700/80 hover:bg-orange-700 text-orange-100'
            }`}
            title="Ir a Servicios & Profesionales"
          >
            <Wrench className="w-3 h-3 text-blue-500" />
            <span className="hidden sm:inline">Servicios</span>
          </button>

          {/* Module 2: Delivery */}
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isDeliveryActive
                ? 'bg-white text-orange-700 shadow-md font-black'
                : 'bg-orange-700/80 hover:bg-orange-700 text-orange-100'
            }`}
            title="Ir a Delivery & Comidas"
          >
            <Bike className="w-3 h-3 text-orange-500" />
            <span className="hidden sm:inline">Delivery</span>
          </button>

          {/* Module 3: Alquiler */}
          <button
            onClick={() => setActiveTab('alquiler')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isAlquilerActive
                ? 'bg-white text-emerald-700 shadow-md font-black'
                : 'bg-emerald-700/80 hover:bg-emerald-700 text-white'
            }`}
            title="Ir a Alquiler de Productos (Givy)"
          >
            <RotateCcw className="w-3 h-3 text-emerald-300" />
            <span className="font-black">Alquiler</span>
          </button>
        </div>
      </div>


      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200/80 text-slate-700 px-2 sm:px-3 py-1 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* BOTÓN VOLVER AL COMIENZO (Siempre disponible) */}
          {onOpenWelcomeHub && (
            <button
              onClick={onOpenWelcomeHub}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap shrink-0 bg-slate-900 text-amber-300 hover:bg-slate-800 shadow-xs cursor-pointer active:scale-95"
              title="Volver al menú de inicio y selector de módulos"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>🏠 Volver al Comienzo</span>
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
                  Givy
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
                title="Alquiler de productos y herramientas estilo Givy"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>🔄 Alquileres</span>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Givy
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

