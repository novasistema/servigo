import React from 'react';
import { Search, MapPin, Flame, ShieldCheck, Tag, Filter, X, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { TradeCategory, CustomTradeOption } from '../types';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTrade: TradeCategory | 'all';
  setSelectedTrade: (trade: TradeCategory | 'all') => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  onlyMatriculados: boolean;
  setOnlyMatriculados: (val: boolean) => void;
  only24h: boolean;
  setOnly24h: (val: boolean) => void;
  onlyBruzzonePartner: boolean;
  setOnlyBruzzonePartner: (val: boolean) => void;
  sortBy: 'rating' | 'jobs' | 'price';
  setSortBy: (sort: 'rating' | 'jobs' | 'price') => void;
  availableZones: string[];
  customTrades?: CustomTradeOption[];
}

export const TRADE_OPTIONS: { id: TradeCategory | 'all'; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'Todos los Oficios', icon: '🛠️', color: 'bg-slate-100 text-slate-800' },
  { id: 'gasista', label: 'Gasistas', icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  { id: 'electricista', label: 'Electricistas', icon: '⚡', color: 'bg-blue-100 text-blue-700' },
  { id: 'plomero', label: 'Plomeros', icon: '🚰', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'pintor', label: 'Pintores', icon: '🎨', color: 'bg-green-100 text-green-700' },
  { id: 'cerrajero', label: 'Cerrajeros', icon: '🔑', color: 'bg-amber-100 text-amber-700' },
  { id: 'aire_acondicionado', label: 'Aire Acondicionado', icon: '❄️', color: 'bg-sky-100 text-sky-700' },
  { id: 'albanil', label: 'Albañiles / Obras', icon: '🧱', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'jardineria', label: 'Jardinería', icon: '🌿', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'carpinteria', label: 'Carpintería', icon: '🪚', color: 'bg-stone-100 text-stone-700' },
  { id: 'fletes', label: 'Fletes y Mudanzas', icon: '🚚', color: 'bg-rose-100 text-rose-700' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTrade,
  setSelectedTrade,
  selectedZone,
  setSelectedZone,
  onlyMatriculados,
  setOnlyMatriculados,
  only24h,
  setOnly24h,
  onlyBruzzonePartner,
  setOnlyBruzzonePartner,
  sortBy,
  setSortBy,
  availableZones,
  customTrades = [],
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const allTradeOptions = React.useMemo(() => {
    const customOptions = customTrades.map((ct) => ({
      id: ct.id,
      label: ct.label,
      icon: ct.icon || '🛠️',
      color: ct.color || 'bg-purple-100 text-purple-700',
    }));
    const combined = [...TRADE_OPTIONS, ...customOptions];
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [customTrades]);

  const uniqueZones = React.useMemo(() => {
    return Array.from(new Set(availableZones));
  }, [availableZones]);

  const activeFilterCount =
    (selectedTrade !== 'all' ? 1 : 0) +
    (selectedZone !== 'all' ? 1 : 0) +
    (onlyMatriculados ? 1 : 0) +
    (only24h ? 1 : 0) +
    (onlyBruzzonePartner ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTrade('all');
    setSelectedZone('all');
    setOnlyMatriculados(false);
    setOnly24h(false);
    setOnlyBruzzonePartner(false);
  };

  const chip = (on: boolean) =>
    `shrink-0 h-10 px-4 rounded-full text-sm whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
      on ? 'bg-sg-blue text-white font-extrabold' : 'border border-white/20 text-white font-semibold hover:bg-white/10'
    }`;

  return (
    <div className="font-sans text-white">
      <div className="max-w-7xl mx-auto px-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <label htmlFor="serv-buscar" className="sr-only">Buscar servicio o profesional</label>
          <div className="md:flex-1 shrink-0 flex items-center gap-2.5 h-[52px] px-4 rounded-2xl bg-white text-sg-navy">
            <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
            <input
              id="serv-buscar"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Gasista, electricista, plomero…"
              className="flex-1 min-w-0 bg-transparent outline-none text-base font-medium placeholder:text-slate-500"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label="Borrar búsqueda" className="w-9 h-9 rounded-full inline-flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <label htmlFor="serv-zona" className="sr-only">Localidad</label>
            <div className="relative flex-1 md:w-60">
              <MapPin className="w-4 h-4 text-[#6aa8ff] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <select
                id="serv-zona"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full h-[52px] md:h-[52px] bg-sg-navy-2 border border-white/15 text-white text-sm font-semibold pl-9 pr-3 rounded-2xl focus:outline-hidden focus:border-sg-blue cursor-pointer"
              >
                <option value="all">Todas las localidades</option>
                {uniqueZones.map((zone, idx) => (
                  <option key={`${zone}-${idx}`} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className={`h-[52px] px-4 rounded-2xl text-sm font-bold inline-flex items-center gap-2 shrink-0 cursor-pointer ${
                activeFilterCount > 0 ? 'bg-sg-blue text-white' : 'bg-sg-navy-2 border border-white/15 text-white hover:bg-[#1a3060]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="bg-white text-sg-navy rounded-full text-[11px] w-5 h-5 font-black inline-flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Rubros */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5" role="group" aria-label="Rubros">
          {allTradeOptions.map((trade, idx) => (
            <button
              key={`${trade.id}-${idx}`}
              type="button"
              aria-pressed={selectedTrade === trade.id}
              onClick={() => setSelectedTrade(trade.id)}
              className={chip(selectedTrade === trade.id)}
            >
              {trade.id === 'all' ? 'Todos' : trade.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="rounded-2xl bg-sg-navy-2 p-4 grid gap-4 md:grid-cols-3 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-sg-muted uppercase tracking-[0.06em] block">Mostrar solo</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={onlyMatriculados} onClick={() => setOnlyMatriculados(!onlyMatriculados)} className={chip(onlyMatriculados)}>
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Matriculados
                </button>
                <button type="button" aria-pressed={only24h} onClick={() => setOnly24h(!only24h)} className={chip(only24h)}>
                  <Flame className="w-4 h-4" aria-hidden="true" /> Urgencias 24 h
                </button>
                <button type="button" aria-pressed={onlyBruzzonePartner} onClick={() => setOnlyBruzzonePartner(!onlyBruzzonePartner)} className={chip(onlyBruzzonePartner)}>
                  <Tag className="w-4 h-4" aria-hidden="true" /> Red Bruzzone
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-sg-muted uppercase tracking-[0.06em] block">Ordenar por</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={sortBy === 'rating'} onClick={() => setSortBy('rating')} className={chip(sortBy === 'rating')}>Mejor valorados</button>
                <button type="button" aria-pressed={sortBy === 'jobs'} onClick={() => setSortBy('jobs')} className={chip(sortBy === 'jobs')}>Más trabajos</button>
                <button type="button" aria-pressed={sortBy === 'price'} onClick={() => setSortBy('price')} className={chip(sortBy === 'price')}>Menor tarifa</button>
              </div>
            </div>
            <div className="flex items-end md:justify-end">
              <button type="button" onClick={resetFilters} className="h-10 text-sm font-extrabold text-[#6aa8ff] hover:text-white cursor-pointer">
                Borrar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
