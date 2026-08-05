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
    return [...TRADE_OPTIONS, ...customOptions];
  }, [customTrades]);

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

  return (
    <div className="bg-white border-b border-slate-200 p-4 sm:p-6 sticky top-[90px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Search Hero Box */}
        <div className="p-2 bg-slate-100 rounded-3xl border-2 border-slate-200/90 shadow-inner flex flex-col md:flex-row gap-2">
          {/* Text input */}
          <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-2.5 border border-slate-200/80 shadow-xs">
            <span className="text-orange-500 mr-2 text-lg">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué servicio o profesional buscas hoy? (ej. Gasista, termotanque)..."
              className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location input */}
          <div className="md:w-64 bg-white rounded-2xl flex items-center px-4 py-2.5 border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 mr-2 text-lg">📍</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent outline-none text-slate-700 font-medium text-sm w-full cursor-pointer"
            >
              <option value="all">Todas las Zonas</option>
              {availableZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                activeFilterCount > 0
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-600" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-orange-600 text-white rounded-full text-[10px] w-4 h-4 font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Trade Category Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {allTradeOptions.map((trade) => {
            const isSelected = selectedTrade === trade.id;
            return (
              <button
                key={trade.id}
                onClick={() => setSelectedTrade(trade.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 border-2 transition-all ${
                  isSelected
                    ? 'bg-white border-orange-500 text-orange-600 shadow-sm scale-105'
                    : 'bg-white border-transparent text-slate-700 hover:border-orange-200'
                }`}
              >
                <span className={`p-1 rounded-xl text-xs ${trade.color}`}>
                  {trade.icon}
                </span>
                <span>{trade.label}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Filters Accordion */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Filter Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Especialidad Requerida
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOnlyMatriculados(!onlyMatriculados)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    onlyMatriculados
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Matriculado Oficial</span>
                </button>

                <button
                  onClick={() => setOnly24h(!only24h)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    only24h
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Urgencias 24 hs</span>
                </button>

                <button
                  onClick={() => setOnlyBruzzonePartner(!onlyBruzzonePartner)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    onlyBruzzonePartner
                      ? 'bg-orange-100 text-orange-700 border-orange-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Tag className="w-4 h-4 text-orange-600" />
                  <span>Red Ferretería Bruzzone</span>
                </button>
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Ordenar Por
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    sortBy === 'rating'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  ⭐ Mejor Valorado
                </button>
                <button
                  onClick={() => setSortBy('jobs')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    sortBy === 'jobs'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  🏆 Más Trabajos
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    sortBy === 'price'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  💲 Menor Tarifa
                </button>
              </div>
            </div>

            {/* Clear All */}
            <div className="flex items-end justify-end">
              <button
                onClick={resetFilters}
                className="text-xs text-orange-600 hover:text-orange-700 underline font-bold py-2 px-3"
              >
                Restablecer todos los filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
