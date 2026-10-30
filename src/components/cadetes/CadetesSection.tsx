import React, { useState, useEffect, useMemo } from 'react';
import {
  Bike,
  Car,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Power,
  Sparkles,
  Filter,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { Cadete, CadeteVehicleType } from '../../types';
import { subscribeCadetes } from '../../lib/cadeteService';
import { INITIAL_CADETES } from '../../data/mockCadetes';
import { CadeteRequestModal } from './CadeteRequestModal';
import { CadeteDashboardModal } from './CadeteDashboardModal';
import { CadeteRegisterModal } from './CadeteRegisterModal';

interface CadetesSectionProps {
  showToast?: (msg: string) => void;
}

export const CadetesSection: React.FC<CadetesSectionProps> = ({ showToast }) => {
  const [cadetes, setCadetes] = useState<Cadete[]>(INITIAL_CADETES);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true); // Por defecto muestra los disponibles en el momento
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Modals state
  const [requestModalCadete, setRequestModalCadete] = useState<Cadete | null>(null);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Subscribe to real-time Cadetes from Firestore
  useEffect(() => {
    const unsub = subscribeCadetes((realtimeCadetes) => {
      if (realtimeCadetes && realtimeCadetes.length > 0) {
        setCadetes(realtimeCadetes);
      }
    });
    return () => unsub();
  }, []);

  // Compute available zones
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    cadetes.forEach((c) => {
      (c.zones || []).forEach((z) => {
        if (z) set.add(z);
      });
    });
    return Array.from(set);
  }, [cadetes]);

  // Filtered cadetes
  const filteredCadetes = useMemo(() => {
    return cadetes.filter((c) => {
      if (onlyAvailable && !c.isAvailable) return false;
      if (selectedVehicleType !== 'all' && c.vehicleType !== selectedVehicleType) return false;
      if (selectedZone !== 'all' && !(c.zones || []).includes(selectedZone)) return false;

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesVeh = (c.vehicleDescription || '').toLowerCase().includes(q);
        const matchesLoc = (c.baseLocation || '').toLowerCase().includes(q);
        if (!matchesName && !matchesVeh && !matchesLoc) return false;
      }

      return true;
    });
  }, [cadetes, onlyAvailable, selectedVehicleType, selectedZone, searchQuery]);

  const availableCount = cadetes.filter((c) => c.isAvailable).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* ================================================================ */}
      {/* HEADER BANNER */}
      {/* ================================================================ */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                MÓDULO DE CADETERÍA URBANA
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{availableCount} Cadetes Disponibles Ahora</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              🛵 Cadetes, Mandados & Envíos con Ubicación
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Encuentra al cadete que esté libre en este momento, contáctalo al instante o envíale tu ubicación GPS para que retire tu pedido o mandado en minutos.
            </p>
          </div>

          {/* Action buttons: Register vs Dashboard */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-orange-600" />
              <span>Registrarme como Cadete</span>
            </button>

            <button
              onClick={() => setIsDashboardModalOpen(true)}
              className="py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-all shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Power className="w-4 h-4" />
              <span>Panel del Cadete (Mis Notificaciones)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTER CONTROLS */}
      {/* ================================================================ */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        {/* Search bar & Availability quick toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cadete por nombre, vehículo (ej: Honda, Bici, Franco)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Availability switch pill */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border ${
              onlyAvailable
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
            <span>{onlyAvailable ? '🟢 Solo Disponibles en el Momento' : 'Mostrar Todos (Incluso Fuera de Turno)'}</span>
          </button>
        </div>

        {/* Vehicle type & Zone filters */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: '🛵 Todos los Rodados' },
              { id: 'moto', label: '🏍️ Motos' },
              { id: 'bicicleta', label: '🚲 Bicicletas' },
              { id: 'auto', label: '🚗 Autos' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleType(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedVehicleType === v.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Zones selector */}
          {availableZones.length > 0 && (
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">📍 Todas las Zonas</option>
              {availableZones.map((z) => (
                <option key={z} value={z}>
                  📍 {z}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* CADETES DIRECTORY GRID */}
      {/* ================================================================ */}
      {filteredCadetes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 space-y-3">
          <Bike className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-black text-slate-800">
            No se encontraron cadetes con los filtros seleccionados
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {onlyAvailable
              ? 'Prueba desactivando el filtro "Solo Disponibles" o busca en otra zona.'
              : 'Sé el primero en sumarte a la red como cadete independiente.'}
          </p>
          <button
            onClick={() => setOnlyAvailable(false)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Ver todos los cadetes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCadetes.map((cadete) => {
            return (
              <div
                key={cadete.id}
                className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 ${
                  cadete.isAvailable
                    ? 'border-emerald-200/90 ring-1 ring-emerald-500/20'
                    : 'border-slate-200/80 opacity-80'
                }`}
              >
                {/* Cadete Profile & Availability badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={cadete.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={cadete.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          cadete.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {cadete.name}
                        </h3>
                        {cadete.verified && (
                          <span title="Cadete Verificado">
                            <ShieldCheck className="w-4 h-4 text-orange-600" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <div className="flex items-center text-amber-500 font-black">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="ml-0.5">{cadete.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-bold">
                          {cadete.completedDeliveries} envíos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Availability pill */}
                  <div>
                    {cadete.isAvailable ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>DISPONIBLE</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                        FUERA DE TURNO
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicle & Coverage info */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    {cadete.vehicleType === 'moto' ? (
                      <Bike className="w-4 h-4 text-orange-600 shrink-0" />
                    ) : cadete.vehicleType === 'bicicleta' ? (
                      <Bike className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Car className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <span className="truncate">{cadete.vehicleDescription}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cadete.baseLocation}</span>
                    </span>
                    <span className="font-bold text-orange-600 shrink-0">
                      Tarifa: ~${(cadete.baseRate || 1200).toLocaleString('es-AR')} base
                    </span>
                  </div>

                  {/* Coverage chips */}
                  {cadete.zones && cadete.zones.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {cadete.zones.slice(0, 3).map((z, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded-md"
                        >
                          {z}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons: Solicitar Cadete con Ubicación vs WhatsApp */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setRequestModalCadete(cadete)}
                    className="py-2.5 px-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    title="Solicitar servicio y enviarle ubicación GPS"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Pedir / Enviar Ubicación</span>
                  </button>

                  <a
                    href={`https://wa.me/${(cadete.whatsapp || cadete.phone || '').replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(cadete.name || 'Cadete')},%20te%20contacto%20desde%20ServiGo%20Cadetes.%20%C2%BFEst%C3%A1s%20disponible%20para%20un%20env%C3%ADo%2Fmandado%3F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================ */}
      {/* MODALS */}
      {/* ================================================================ */}
      {/* Request Modal for sending live GPS location */}
      <CadeteRequestModal
        cadete={requestModalCadete}
        isOpen={!!requestModalCadete}
        onClose={() => setRequestModalCadete(null)}
        showToast={showToast}
      />

      {/* Cadete Dashboard Modal */}
      <CadeteDashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        showToast={showToast}
      />

      {/* Cadete Register Modal */}
      <CadeteRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        showToast={showToast}
        onCadeteRegistered={(newCadete) => {
          setCadetes((prev) => [newCadete, ...prev]);
        }}
      />
    </div>
  );
};
