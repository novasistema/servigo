import React, { useState } from 'react';
import { Wrench, Bike, RotateCcw, Search, ChevronRight, Gift, FileText, Crown } from 'lucide-react';
import servigoIcon from '../assets/icon.jpg';

type HubModule = 'servicios' | 'delivery' | 'alquiler' | 'cadetes';

interface WelcomeHubScreenProps {
  onSelectModule: (module: HubModule) => void;
  onSearch?: (query: string) => void;
  onOpenPdfGuide?: () => void;
  onOpenAdminPanel?: () => void;
  isAdminAuthenticated?: boolean;
}

// Palabras que llevan la búsqueda al módulo correcto
const DELIVERY_WORDS = ['pizza', 'lomo', 'lomito', 'hambur', 'burger', 'empanada', 'helado', 'comida', 'rotiser', 'sushi', 'delivery', 'pedido', 'kiosco', 'almacen', 'almacén', 'super', 'farmacia', 'bebida', 'cerveza'];
const RENTAL_WORDS = ['alquil', 'hormigonera', 'hidrolavadora', 'gazebo', 'carpa', 'andamio', 'taladro', 'amoladora', 'proyector', 'sonido', 'mesa', 'silla', 'generador', 'motosierra', 'cortadora', 'escalera', 'herramienta'];
const CADETE_WORDS = ['cadete', 'mandado', 'envío', 'envio', 'traslado', 'remis'];

function routeQuery(q: string): HubModule {
  const t = q.toLowerCase();
  if (RENTAL_WORDS.some((w) => t.includes(w))) return 'alquiler';
  if (DELIVERY_WORDS.some((w) => t.includes(w))) return 'delivery';
  if (CADETE_WORDS.some((w) => t.includes(w))) return 'cadetes';
  return 'servicios';
}

const MODULES: {
  id: HubModule;
  title: string;
  text: string;
  icon: React.ElementType;
  className: string;
  iconBg: string;
  badge?: string;
}[] = [
  {
    id: 'servicios',
    title: 'Servicios',
    text: 'Gasistas, electricistas, plomeros y más',
    icon: Wrench,
    className: 'bg-sg-blue text-white',
    iconBg: 'bg-white/20',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    text: 'Comercios de tu zona, a tu puerta',
    icon: Bike,
    className: 'bg-sg-orange text-[#2a1300]',
    iconBg: 'bg-white/30',
  },
  {
    id: 'alquiler',
    title: 'Alquiler',
    text: 'Herramientas por día, con seña segura',
    icon: RotateCcw,
    className: 'bg-sg-green text-[#052e16]',
    iconBg: 'bg-white/30',
    badge: 'NUEVO',
  },
];

export const WelcomeHubScreen: React.FC<WelcomeHubScreenProps> = ({
  onSelectModule,
  onSearch,
  onOpenPdfGuide,
  onOpenAdminPanel,
  isAdminAuthenticated = false,
}) => {
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const target = routeQuery(q);
    if (target === 'servicios' && onSearch) onSearch(q);
    else onSelectModule(target);
  };

  return (
    <div className="min-h-screen bg-sg-navy text-white flex flex-col font-sans">
      {/* Barra superior */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <img src={servigoIcon} alt="" className="w-9 h-9 rounded-[10px] object-cover" />
          <span className="font-black text-[21px] tracking-tight">ServiGo</span>
        </div>
        {isAdminAuthenticated && onOpenAdminPanel ? (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="h-11 px-4 rounded-full bg-amber-400 text-slate-950 font-extrabold text-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-amber-300"
          >
            <Crown className="w-4 h-4" aria-hidden="true" />
            Creador
          </button>
        ) : onOpenPdfGuide ? (
          <button
            type="button"
            onClick={onOpenPdfGuide}
            className="h-11 px-4 rounded-full border border-white/30 text-white font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-white/10"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Cómo sumarme
          </button>
        ) : null}
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-5 pt-3 pb-8 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-sg-muted">
          <span className="w-2 h-2 rounded-full bg-sg-green" aria-hidden="true" />
          Alejandro Roca y zona
        </div>

        <h1 className="m-0 text-[38px] sm:text-5xl leading-[1.02] font-black tracking-[-0.035em]">
          ¿Qué necesitás
          <br />
          hoy?
        </h1>

        <form onSubmit={submit} role="search">
          <label htmlFor="hub-buscar" className="sr-only">
            Buscar en ServiGo
          </label>
          <div className="flex items-center gap-2.5 h-14 pl-4 pr-1.5 rounded-2xl bg-white text-sg-navy">
            <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
            <input
              id="hub-buscar"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gasista, pizza, hormigonera…"
              className="flex-1 min-w-0 bg-transparent outline-none text-base font-medium text-sg-navy placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-xl bg-sg-navy text-white font-extrabold text-sm cursor-pointer hover:bg-sg-navy-2"
            >
              Buscar
            </button>
          </div>
        </form>

        <nav aria-label="Módulos" className="flex flex-col gap-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModule(m.id)}
                className={`w-full text-left flex items-center gap-4 p-[18px] rounded-[22px] cursor-pointer transition-transform hover:scale-[1.015] active:scale-[0.99] ${m.className}`}
              >
                <span className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                  <Icon className="w-7 h-7" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 text-[22px] font-black tracking-tight">
                    {m.title}
                    {m.badge && (
                      <span className="text-[11px] font-extrabold tracking-[0.06em] px-2 py-0.5 rounded-full bg-[#052e16] text-sg-green">
                        {m.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-sm font-semibold mt-0.5 opacity-95">{m.text}</span>
                </span>
                <ChevronRight className="w-6 h-6 shrink-0" strokeWidth={2.4} aria-hidden="true" />
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => onSelectModule('cadetes')}
          className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-[18px] border border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer"
        >
          <Bike className="w-6 h-6 text-sg-orange shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm text-[#d6def0]">
            ¿Un mandado o traslado? <b className="text-white">Cadetes de la zona</b>
          </span>
          <ChevronRight className="w-5 h-5 text-sg-muted" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] border border-white/15 bg-white/5">
          <Gift className="w-6 h-6 text-[#ffb547] shrink-0" aria-hidden="true" />
          <span className="text-sm leading-snug text-[#d6def0]">
            Cerrá un trato y ganá un <b className="text-white">cupón de Ferretería Bruzzone</b>
          </span>
        </div>
      </main>

      <footer className="w-full max-w-xl mx-auto px-5 pb-28 sm:pb-8 text-xs text-sg-muted flex flex-wrap items-center justify-between gap-2">
        <span>
          Auspicia <b className="text-white">Ferretería Bruzzone</b>
        </span>
        {!isAdminAuthenticated && onOpenAdminPanel && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="text-sg-muted hover:text-white underline-offset-2 hover:underline cursor-pointer"
          >
            Acceso creador
          </button>
        )}
      </footer>
    </div>
  );
};
