import React, { useState, useMemo } from 'react';
import {
  Store,
  MapPin,
  Search,
  Tag,
  ShieldCheck,
  Star,
  Phone,
  MessageCircle,
  Clock,
  Plus,
  Building2,
  Wrench,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Share2,
  Check
} from 'lucide-react';
import { Shop } from '../types';
import { extractUniqueZones, normalizeZoneKey } from '../lib/zoneUtils';
import { ShopDetailModal } from './ShopDetailModal';
import { ShopRegisterModal } from './ShopRegisterModal';
import { shareContent } from '../utils/share';

interface ShopsSectionProps {
  shops: Shop[];
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
  onSaveShop?: (newShop: Shop) => Promise<void> | void;
}

export const ShopsSection: React.FC<ShopsSectionProps> = ({
  shops,
  selectedZone,
  onZoneSelect,
  onSaveShop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyDiscount, setOnlyDiscount] = useState<boolean>(false);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [selectedShopForModal, setSelectedShopForModal] = useState<Shop | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [copiedShopId, setCopiedShopId] = useState<string | null>(null);

  const handleShareShop = async (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    const res = await shareContent({
      title: `${shop.name} - ${shop.categoryTitle || shop.category} | ServiGo`,
      text: `Conoce ${shop.name} en ServiGo. Dirección: ${shop.address}, ${shop.location}. ¡Contactalos en ServiGo!`,
    });
    if (res.method === 'clipboard') {
      setCopiedShopId(shop.id);
      setTimeout(() => setCopiedShopId(null), 2200);
    }
  };

  // Extract all available unique zones from shops
  const allZones = useMemo(() => {
    const rawZones = shops.flatMap((s) => [s.location, ...s.zones]);
    // Ensure standard regional zones are included
    rawZones.push('Alejandro Roca', 'Río Cuarto', 'La Carlota');
    return extractUniqueZones(rawZones);
  }, [shops]);

  // Categories config
  const categories = [
    { id: 'todos', label: 'Todos los Rubros', icon: Store },
    { id: 'ferreteria', label: 'Ferreterías', icon: Wrench },
    { id: 'taller_mecanico', label: 'Talleres Mecánicos', icon: Building2 },
    { id: 'sanitarios_plomeria', label: 'Sanitarios & Plomería', icon: Wrench },
    { id: 'electricidad', label: 'Electricidad & LED', icon: Sparkles },
    { id: 'corralon_materiales', label: 'Corralones & Materiales', icon: Building2 },
    { id: 'pintureria', label: 'Pinturerías', icon: Tag },
    { id: 'repuestos', label: 'Repuestos & Accesorios', icon: Tag },
    { id: 'servicios_tecnicos', label: 'Servicios Técnicos', icon: Wrench },
  ];

  // Filter & sort shops
  const filteredShops = useMemo(() => {
    const list = shops.filter((shop) => {
      // Zone filter
      if (selectedZone && selectedZone !== 'todas') {
        const zoneKey = normalizeZoneKey(selectedZone);
        const locationMatches = normalizeZoneKey(shop.location).includes(zoneKey);
        const zonesMatch = shop.zones.some((z) => normalizeZoneKey(z).includes(zoneKey));
        if (!locationMatches && !zonesMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'todos') {
        if (shop.category !== selectedCategory) return false;
      }

      // Discount filter
      if (onlyDiscount && !shop.discountPartner) return false;

      // Verified filter
      if (onlyVerified && !shop.verified) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = normalizeZoneKey(searchQuery);
        const nameMatch = normalizeZoneKey(shop.name).includes(q);
        const descMatch = normalizeZoneKey(shop.description).includes(q);
        const catMatch = normalizeZoneKey(shop.categoryTitle || shop.category).includes(q);
        const addressMatch = normalizeZoneKey(shop.address).includes(q);
        const prodMatch = shop.servicesOrProducts.some((p) => normalizeZoneKey(p).includes(q));

        if (!nameMatch && !descMatch && !catMatch && !addressMatch && !prodMatch) {
          return false;
        }
      }

      return true;
    });

    // Sort: featured first, then newest created date first
    return list.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [shops, selectedZone, selectedCategory, onlyDiscount, onlyVerified, searchQuery]);

  const handleRegisterNewShop = async (newShop: Shop) => {
    // Reset filters so the new shop is immediately visible
    setSearchQuery('');
    setOnlyDiscount(false);
    setOnlyVerified(false);
    setSelectedCategory('todos');
    if (onZoneSelect) onZoneSelect('todas');

    if (onSaveShop) {
      await onSaveShop(newShop);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
              <Store className="w-3.5 h-3.5 text-orange-400" />
              Guía de Comercios & Negocios Cercanos
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Encuentra Ferreterías, Talleres y Comercios en tu Zona
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Insumos de ferretería, repuestos para vehículos, materiales de construcción, electricidad y servicios técnicos. Compra en comercios locales adheridos con descuentos exclusivos.
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="shrink-0 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Sumar mi Comercio / Taller</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ferretería, taller mecánico, repuestos, dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Zone Selector */}
          <div className="md:col-span-6 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 shrink-0">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Zona:</span>
            </div>
            <select
              value={selectedZone}
              onChange={(e) => onZoneSelect(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all cursor-pointer flex-1"
            >
              <option value="todas">📍 Todas las Zonas</option>
              {allZones.map((z) => (
                <option key={z} value={z}>
                  📍 {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Rubro:
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Checkbox Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              checked={onlyDiscount}
              onChange={(e) => setOnlyDiscount(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
            />
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Solo Socios con Descuentos
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Solo Verificados
            </span>
          </label>

          <span className="ml-auto text-xs text-slate-400 font-medium">
            Mostrando <strong>{filteredShops.length}</strong> comercio(s)
          </span>
        </div>
      </div>

      {/* Grid of Shops */}
      {filteredShops.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-slate-800">
              No se encontraron comercios con los filtros aplicados
            </h3>
            <p className="text-xs text-slate-500">
              Prueba cambiar la zona seleccionada, limpiar la búsqueda o registrar un nuevo comercio.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
              setOnlyDiscount(false);
              setOnlyVerified(false);
              onZoneSelect('todas');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => {
            const whatsappMsg = encodeURIComponent(
              `Hola ${shop.name}, los encontré en ServiGo. Quisiera consultar sobre sus productos.`
            );

            return (
              <div
                key={shop.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Shop Cover Image */}
                <div className="relative h-32 sm:h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={shop.imageUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Top Badges & Share */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs">
                      {shop.categoryTitle || shop.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {shop.verified && (
                        <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3" />
                          Verificado
                        </span>
                      )}

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => handleShareShop(e, shop)}
                          className="p-1.5 rounded-full bg-slate-900/80 hover:bg-orange-600 text-white transition-all shadow-md cursor-pointer flex items-center justify-center"
                          title="Compartir comercio"
                          aria-label="Compartir comercio"
                        >
                          {copiedShopId === shop.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>
                        {copiedShopId === shop.id && (
                          <span className="absolute top-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap animate-fadeIn z-20">
                            ¡Enlace copiado!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Discount Tag */}
                  {shop.discountPartner && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-amber-500/95 text-slate-950 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-sm backdrop-blur-xs">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{shop.discountText || 'Socio con Descuento'}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Title & Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span className="text-xs font-black text-amber-900">{shop.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Address & Zone */}
                    <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="truncate">{shop.address}, <strong>{shop.location}</strong></span>
                    </p>

                    {/* Hours */}
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{shop.hours}</span>
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 font-normal pt-1">
                      {shop.description}
                    </p>

                    {/* Products tags preview */}
                    {shop.servicesOrProducts && shop.servicesOrProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {shop.servicesOrProducts.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                        {shop.servicesOrProducts.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{shop.servicesOrProducts.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${shop.whatsapp}?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => setSelectedShopForModal(shop)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all"
                      >
                        <span>Ver Detalle</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                    </div>

                    {shop.mapUrl && (
                      <a
                        href={shop.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold border border-orange-200/80 transition-all text-center"
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>Ver en Mapa / GPS</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 text-orange-500" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <ShopDetailModal
        shop={selectedShopForModal}
        isOpen={!!selectedShopForModal}
        onClose={() => setSelectedShopForModal(null)}
      />

      {/* Register Shop Modal */}
      <ShopRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmitShop={handleRegisterNewShop}
        availableZones={allZones}
      />
    </div>
  );
};
