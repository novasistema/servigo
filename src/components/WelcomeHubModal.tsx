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
  X,
  Briefcase,
  RotateCcw,
  Hammer,
  PartyPopper,
  DollarSign
} from 'lucide-react';
import servigoServiciosImg from '../assets/images/servigo_official_logo_1785771884278.jpg';
import servigoDeliveryImg from '../assets/images/servigo_delivery_logo.jpg';

interface WelcomeHubModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSelectHub: (hub: 'servicios' | 'delivery' | 'alquiler' | 'cadetes') => void;
  canDismiss?: boolean;
}

export const WelcomeHubModal: React.FC<WelcomeHubModalProps> = ({
  isOpen,
  onClose,
  onSelectHub,
  canDismiss = true,
}) => {
  if (!isOpen) return null;

  const servigoAlquilerImg = '/assets/aistudio/Gemini_Generated_Image_igtdraigtdraigtd_37ae301b.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-5 sm:p-7 text-white relative shadow-2xl my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Cerrar y continuar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Ecosistema Oficial ServiGo</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ¿A qué plataforma deseas ingresar?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Elige el módulo que necesitas. Puedes alternar entre ellos libremente desde la barra superior.
          </p>
        </div>

        {/* 3 Modular Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: SERVIGO SERVICIOS */}
          <div
            onClick={() => onSelectHub('servicios')}
            className="group relative bg-slate-800/90 hover:bg-slate-800 rounded-3xl p-5 border-2 border-slate-700/80 hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between hover:scale-[1.02]"
          >
            <div className="space-y-3.5">
              <div className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-[#0A3B7B] border border-blue-400/30 flex items-center justify-center p-2.5 group-hover:shadow-lg transition-shadow">
                <img
                  src={servigoServiciosImg}
                  alt="ServiGo Servicios Oficial"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  OFICIOS & TRABAJOS
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors">
                  ServiGo Servicios
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
                  Profesionales calificados, Bolsa de Trabajo (RRHH con CV), remises, talleres y compras en Ferretería Bruzzone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl">
                  <Briefcase className="w-3 h-3 text-indigo-400" /> Bolsa RRHH
                </span>
                <span className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl">
                  <Wrench className="w-3 h-3 text-blue-400" /> Gasistas & 24h
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-700/60">
              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Entrar a Servicios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: SERVIGO DELIVERY */}
          <div
            onClick={() => onSelectHub('delivery')}
            className="group relative bg-slate-800/90 hover:bg-slate-800 rounded-3xl p-5 border-2 border-slate-700/80 hover:border-orange-500 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between hover:scale-[1.02]"
          >
            <div className="space-y-3.5">
              <div className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-white border border-orange-400/30 flex items-center justify-center p-2.5 group-hover:shadow-lg transition-shadow">
                <img
                  src={servigoDeliveryImg}
                  alt="ServiGo Delivery Oficial"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-full">
                  COMIDAS & LOCALES
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1 group-hover:text-orange-400 transition-colors">
                  ServiGo Delivery
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
                  Pide comida en tus restaurantes y rotiserías favoritos: pizzas, lomitos, burgers, helados y seguimiento en vivo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl">
                  <Bike className="w-3 h-3 text-orange-400" /> Cadetes
                </span>
                <span className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl">
                  <Clock className="w-3 h-3 text-emerald-400" /> Envíos Rápidos
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-700/60">
              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Entrar a Delivery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: SERVIGO ALQUILER DE PRODUCTOS (ESTILO GIVY) */}
          <div
            onClick={() => onSelectHub('alquiler')}
            className="group relative bg-slate-800/90 hover:bg-slate-800 rounded-3xl p-5 border-2 border-slate-700/80 hover:border-emerald-500 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between hover:scale-[1.02]"
          >
            <div className="space-y-3.5">
              <div className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-white border border-emerald-400/30 flex items-center justify-center p-2 group-hover:shadow-lg transition-shadow">
                <img
                  src={servigoAlquilerImg}
                  alt="ServiGo Alquiler de Productos"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  ALQUILER TEMPORAL
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1 group-hover:text-emerald-400 transition-colors">
                  ServiGo Alquiler
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
                  Alquiler de cosas por día entre vecinos: hormigoneras, hidrolavadoras, gazebos, sonido, carpas y proyectores.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl">
                  <Hammer className="w-3 h-3 text-amber-400" /> Herramientas
                </span>
                <span className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Con Garantía
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-700/60">
              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Entrar a Alquileres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Cadetes Direct Access Banner */}
        <div
          onClick={() => onSelectHub('cadetes')}
          className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-800 to-orange-950/40 border border-orange-500/40 hover:border-orange-500 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:scale-[1.01]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-white">🛵 Cadetería Urbana & Mandados</h4>
                <span className="text-[9px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full">
                  🟢 Disponibles
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Contacta cadetes en vivo para traslados, comida o retiro de herramientas alquiladas.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shrink-0 self-start sm:self-auto">
            <span>Ver Cadetes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
