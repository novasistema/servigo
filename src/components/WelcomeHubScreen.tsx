import React from 'react';
import {
  Wrench,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Store,
  Car,
  UtensilsCrossed,
  Pizza,
  Zap,
  ShoppingBag,
  ExternalLink,
  Briefcase,
  RotateCcw,
  Hammer,
  PartyPopper,
  DollarSign
} from 'lucide-react';
import servigoServiciosImg from '../assets/images/servigo_official_logo_1785771884278.jpg';
import servigoDeliveryImg from '../assets/images/servigo_delivery_logo.jpg';

interface WelcomeHubScreenProps {
  onSelectModule: (module: 'servicios' | 'delivery' | 'alquiler' | 'cadetes') => void;
  onOpenPdfGuide?: () => void;
  onOpenAdminPanel?: () => void;
  isAdminAuthenticated?: boolean;
}

export const WelcomeHubScreen: React.FC<WelcomeHubScreenProps> = ({
  onSelectModule,
  onOpenPdfGuide,
  onOpenAdminPanel,
  isAdminAuthenticated = false,
}) => {
  const servigoAlquilerImg = '/assets/aistudio/Gemini_Generated_Image_igtdraigtdraigtd_37ae301b.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between selection:bg-orange-600 selection:text-white">
      {/* Top Auspiciador Strip */}
      <div className="bg-orange-700 text-orange-100 text-xs font-bold py-2 px-4 flex items-center justify-between border-b border-orange-500/40">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-white text-orange-700 text-[10px] px-2 py-0.5 rounded-full tracking-wide uppercase font-black shadow-xs">
            AUSPICIADOR OFICIAL
          </span>
          <span className="truncate">Ferretería Bruzzone • Red de Profesionales, Comercios, Alquileres y Envíos</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPdfGuide && (
            <button
              onClick={onOpenPdfGuide}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] hover:bg-amber-300 transition-all shadow-xs cursor-pointer"
            >
              <span>📄 Guía de Registro</span>
            </button>
          )}

          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-amber-300 font-extrabold text-[10px] hover:bg-slate-950 transition-all border border-amber-400/30 cursor-pointer"
            >
              <span>{isAdminAuthenticated ? '👑 Admin' : '⚙️ Creador'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Hub Body */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center space-y-8 sm:space-y-10">
        {/* Welcome Hero Typography */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Bienvenido al Ecosistema ServiGo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ¿A qué módulo deseas ingresar?
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Hemos organizado ServiGo en <strong>3 plataformas independientes</strong> para darte la mejor experiencia: profesionales de oficios, pedidos de comida a domicilio o alquiler de productos y herramientas.
          </p>
        </div>

        {/* The 3 Separated Modules Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 max-w-7xl mx-auto w-full">
          {/* MÓDULO 1: SERVIGO SERVICIOS & OFICIOS */}
          <div
            onClick={() => onSelectModule('servicios')}
            className="group relative bg-slate-900/90 hover:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border-2 border-blue-500/40 hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-2xl flex flex-col justify-between hover:scale-[1.02] hover:shadow-blue-500/20"
          >
            <div className="space-y-4">
              {/* Logo Official Banner */}
              <div className="w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-[#0A3B7B] border border-blue-400/40 flex items-center justify-center p-3 shadow-inner group-hover:scale-102 transition-transform">
                <img
                  src={servigoServiciosImg}
                  alt="ServiGo Servicios Oficial"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    🛠️ SERVICIOS & OFICIOS
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    <ShieldCheck className="w-3 h-3" />
                    Bruzzone
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                  ServiGo Servicios
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Red oficial de profesionales, Bolsa de Trabajo (RRHH) para contratar personal con CV y crear tu perfil laboral con IA Gemini, talleres y compras en Ferretería Bruzzone.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-semibold pt-1">
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Bolsa RRHH</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>CV con IA</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Gasistas & 24h</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Remises & Taller</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-5 mt-4 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 group-hover:gap-3 cursor-pointer"
              >
                <span>Entrar a Servicios</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MÓDULO 2: SERVIGO DELIVERY & COMERCIOS */}
          <div
            onClick={() => onSelectModule('delivery')}
            className="group relative bg-slate-900/90 hover:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border-2 border-orange-500/40 hover:border-orange-500 transition-all duration-300 cursor-pointer shadow-2xl flex flex-col justify-between hover:scale-[1.02] hover:shadow-orange-500/20"
          >
            <div className="space-y-4">
              {/* Logo Official Banner */}
              <div className="w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-white border border-orange-400/40 flex items-center justify-center p-3 shadow-inner group-hover:scale-102 transition-transform">
                <img
                  src={servigoDeliveryImg}
                  alt="ServiGo Delivery Oficial"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    🍕 COMIDA & COMERCIOS
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                    <Clock className="w-3 h-3" />
                    Envíos Rápidos
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-400 transition-colors">
                  ServiGo Delivery
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Pide comida rica en tus restaurantes locales: pizzerías, lomitos, hamburgueserías, rotiserías, empanadas y helados con seguimiento en vivo y pedidos directos.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-semibold pt-1">
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Pizza className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Pizzas & Lomitos</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Burgers & Helados</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Bike className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Cadetes Urbanos</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Panel Negocios</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-5 mt-4 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/30 group-hover:gap-3 cursor-pointer"
              >
                <span>Entrar a Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MÓDULO 3: SERVIGO ALQUILER DE PRODUCTOS (ESTILO GIVY) */}
          <div
            onClick={() => onSelectModule('alquiler')}
            className="group relative bg-slate-900/90 hover:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/40 hover:border-emerald-500 transition-all duration-300 cursor-pointer shadow-2xl flex flex-col justify-between hover:scale-[1.02] hover:shadow-emerald-500/20"
          >
            <div className="space-y-4">
              {/* Logo Official Banner (User Provided Image) */}
              <div className="w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-white border border-emerald-400/40 flex items-center justify-center p-2.5 shadow-inner group-hover:scale-102 transition-transform">
                <img
                  src={servigoAlquilerImg}
                  alt="ServiGo Alquiler de Productos Oficial"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    🔄 ALQUILER DE COSAS
                  </span>
                  <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1 bg-orange-400/10 px-2 py-0.5 rounded-md border border-orange-400/20">
                    <Sparkles className="w-3 h-3" />
                    Pagá seguro
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  ServiGo Alquiler
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ¿Por qué comprar lo que usas una sola vez? Alquilá hormigoneras, hidrolavadoras, gazebos, proyectores, carpas y sonido por día con garantía reembolsable.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-semibold pt-1">
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <Hammer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Herramientas Obra</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <PartyPopper className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Gazebos & Fiestas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Depósito Seguro</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <DollarSign className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Ganá Alquilando</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-5 mt-4 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 group-hover:gap-3 cursor-pointer"
              >
                <span>Entrar a Alquileres</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Extra Quick Access: Cadetes & Mandados */}
        <div className="max-w-7xl mx-auto w-full">
          <div
            onClick={() => onSelectModule('cadetes')}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-orange-950/40 to-slate-900 border-2 border-orange-500/40 hover:border-orange-500 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shadow-lg shadow-orange-600/30 shrink-0">
                <Bike className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase bg-orange-600 text-white px-2 py-0.5 rounded-full">
                    MANDADOS & TRASLADOS
                  </span>
                  <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                    🟢 Cadetes en Vivo
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  🛵 Cadetería Urbana & Retiro de Productos
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ¿Necesitas que retiren tu comida, mandado o trasladen una herramienta alquilada? Conecta al instante con cadetes locales.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shrink-0 shadow-md shadow-orange-600/30 transition-all self-start sm:self-auto cursor-pointer">
              <span>Ver Cadetes</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Reassurance text */}
        <p className="text-center text-xs text-slate-500 font-medium">
          💡 En cualquier momento puedes pulsar <strong>"🏠 Volver al Comienzo"</strong> en la barra superior para cambiar entre Servicios, Delivery y Alquileres.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>ServiGo • Red de Servicios, Delivery y Alquiler de Productos • Auspiciado por Ferretería Bruzzone</p>
      </footer>
    </div>
  );
};
