import React, { useState } from 'react';
import { ShoppingBag, ExternalLink, ShieldCheck, Tag, Sparkles, CheckCircle2, Search, Globe, Store, RefreshCw } from 'lucide-react';
import { HardwareProduct, TradeCategory } from '../types';

interface FerreteriaSponsorBannerProps {
  products: HardwareProduct[];
  onSelectTradeFilter: (trade: TradeCategory) => void;
}

export const FerreteriaSponsorBanner: React.FC<FerreteriaSponsorBannerProps> = ({
  products,
  onSelectTradeFilter,
}) => {
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState<'catalog' | 'iframe'>('catalog');
  const [iframeKey, setIframeKey] = useState(0);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedProductCategory === 'all' || p.trade === selectedProductCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.code.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Sponsor Banner */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-sm text-white">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>AUSPICIADOR OFICIAL SERVIGO</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Ferretería <span className="text-orange-400">Bruzzone</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Potenciamos a la comunidad local uniendo a los mejores profesionales de la zona con insumos, herramientas y repuestos de máxima calidad para tu hogar o comercio.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://ferreteriabruzzone.com.ar/tienda"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Store className="w-4 h-4" />
                <span>Abrir ferreteriabruzzone.com.ar/tienda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="py-2.5 px-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-orange-300 font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-400" />
                <span>15% OFF en Materiales con Código: SERVIGO15</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              Beneficios Comunidad
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Para Clientes:</strong> 10% de descuento en mano de obra con los profesionales adheridos a ServiGo.</span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Para Trabajadores:</strong> Cuenta corriente profesional y asesoramiento técnico directo.</span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>Envíos inmediatos:</strong> Entregas en el día en obras o domicilios de la zona.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Header with View Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-200">
                ferreteriabruzzone.com.ar/tienda
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-1">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              Productos de Ferretería Bruzzone
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Explora el catálogo interactivo o la tienda web oficial en <strong className="text-slate-800">ferreteriabruzzone.com.ar/tienda</strong>
            </p>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode('catalog')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'catalog'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Catálogo Destacado</span>
            </button>

            <button
              onClick={() => setViewMode('iframe')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'iframe'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Navegador Web Tienda</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Catalog Grid */}
        {viewMode === 'catalog' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'Todos los Productos' },
                  { id: 'gasista', label: '🔥 Gas' },
                  { id: 'electricista', label: '⚡ Electricidad' },
                  { id: 'plomero', label: '🚰 Plomería' },
                  { id: 'pintor', label: '🎨 Pinturería' },
                  { id: 'cerrajero', label: '🔑 Cerrajería' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedProductCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                      selectedProductCategory === cat.id
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 border border-slate-200 hover:border-orange-500 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:bg-white hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-xl bg-white h-44 flex items-center justify-center border border-slate-200">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                        {p.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Precio especial</span>
                      <span className="text-base font-black text-slate-900">
                        ${p.price.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <a
                      href={p.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>Comprar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: Web Store Embedded Viewer */}
        {viewMode === 'iframe' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-slate-800">
                  Navegando: https://ferreteriabruzzone.com.ar/tienda
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="Recargar página"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recargar</span>
                </button>

                <a
                  href="https://ferreteriabruzzone.com.ar/tienda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-xl bg-orange-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-orange-700 transition-colors"
                >
                  <span>Abrir en Nueva Pestaña</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Embedded Iframe Box */}
            <div className="relative w-full h-[650px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                key={iframeKey}
                src="https://ferreteriabruzzone.com.ar/tienda"
                title="Tienda Ferretería Bruzzone"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
