import React from 'react';
import { Wrench, Search, UserPlus, Sparkles, ShoppingBag, Calendar, ShieldCheck, ChevronRight, Settings, Lock } from 'lucide-react';
import { TabVisibilityConfig } from '../types';
import servigoOfficialLogo from '../assets/logo.jpg';
import servigoIcon from '../assets/icon.jpg';

interface NavbarProps {
  activeTab: 'search' | 'register' | 'ai' | 'bruzzone' | 'bookings';
  setActiveTab: (tab: 'search' | 'register' | 'ai' | 'bruzzone' | 'bookings') => void;
  bookingCount: number;
  tabConfig?: TabVisibilityConfig;
  customLogoUrl?: string;
  customTagline?: string;
  onOpenAdminPanel?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  tabConfig = { search: true, register: true, sponsor: true, ai: true, bookings: true },
  customLogoUrl,
  customTagline,
  onOpenAdminPanel,
  isAdminAuthenticated = false,
}) => {
  const [logoError, setLogoError] = React.useState(false);

  const isValidCustomUrl =
    Boolean(customLogoUrl) &&
    typeof customLogoUrl === 'string' &&
    (customLogoUrl.startsWith('http://') ||
      customLogoUrl.startsWith('https://') ||
      customLogoUrl.startsWith('data:') ||
      customLogoUrl.startsWith('/'));

  return (
    <header className="bg-orange-600 text-white sticky top-0 z-40 shadow-lg">
      {/* Sponsor Top Strip */}
      <div className="bg-orange-700 text-orange-100 text-xs font-bold py-1.5 px-4 flex items-center justify-between border-b border-orange-500/40">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-white text-orange-700 text-[10px] px-2 py-0.5 rounded-full tracking-wide uppercase font-black shadow-xs">
            AUSPICIADOR OFICIAL
          </span>
          <span className="truncate">Ferretería Bruzzone • Red de Profesionales y Descuentos en Materiales</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://ferreteriabruzzone.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-white hover:underline transition-colors whitespace-nowrap"
          >
            ferreteriabruzzone.com.ar <ChevronRight className="w-3.5 h-3.5" />
          </a>

          {/* Admin Creator Trigger Link */}
          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-amber-300 font-extrabold text-[10px] transition-all border border-amber-400/30 shadow-xs"
              title="Panel Administrador del Creador"
            >
              <Settings className="w-3 h-3 text-amber-400" />
              <span>{isAdminAuthenticated ? '👑 Admin Activo' : '⚙️ Modo Creador'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand & Logo Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {isValidCustomUrl && !logoError ? (
            <img
              src={customLogoUrl}
              alt="ServiGo Logo"
              onError={() => setLogoError(true)}
              className="h-10 sm:h-12 w-auto object-contain rounded-xl max-w-[220px]"
            />
          ) : (
            <div className="flex items-center gap-3">
              {/* Dynamic Brand Logo Emblem */}
              <div className="relative w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-sky-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/30 via-sky-400/20 to-emerald-400/30" />
                  <svg
                    className="w-6 h-6 relative z-10 text-white"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 20C12 15.5817 15.5817 12 20 12C23.5 12 26.5 14.2 27.5 17.3"
                      stroke="#f97316"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 20C28 24.4183 24.4183 28 20 28C16.5 28 13.5 25.8 12.5 22.7"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 22L16 28L30 11"
                      stroke="#34d399"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M24 11H30V17"
                      stroke="#34d399"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Brand Name Typography */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                    Servi
                    <span className="bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
                      Go
                    </span>
                  </span>
                  <span className="bg-orange-500/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-400 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-amber-200" />
                    Bruzzone Network
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-orange-100 font-semibold tracking-wide mt-0.5">
                  {customTagline || 'La solución que buscas, está aquí.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {tabConfig.ai && (
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                activeTab === 'ai'
                  ? 'bg-white text-orange-600 shadow-md scale-105'
                  : 'bg-orange-500/90 text-white hover:bg-orange-500'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Diagnóstico IA
            </button>
          )}

          {tabConfig.register && (
            <button
              onClick={() => setActiveTab('register')}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white text-orange-600 shadow-md hover:bg-orange-50 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-orange-600" />
              ¿Eres Profesional?
            </button>
          )}

          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-950 text-amber-300 transition-all border border-amber-400/30 shadow-md"
              title="Panel Administrador del Creador"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200/80 text-slate-700 px-3 py-1 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-around md:justify-start md:gap-2 overflow-x-auto no-scrollbar">
          {tabConfig.search && (
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'search'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Buscar Oficio</span>
            </button>
          )}

          {tabConfig.ai && (
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Diagnóstico IA</span>
            </button>
          )}

          {tabConfig.register && (
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>Soy Trabajador</span>
            </button>
          )}

          {tabConfig.sponsor && (
            <button
              onClick={() => setActiveTab('bruzzone')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'bruzzone'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Ferretería Bruzzone</span>
            </button>
          )}

          {tabConfig.bookings && (
            <button
              onClick={() => setActiveTab('bookings')}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mis Solicitudes</span>
              {bookingCount > 0 && (
                <span className="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {bookingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

