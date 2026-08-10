import React, { useState, useMemo } from 'react';
import {
  Car,
  MapPin,
  Navigation,
  Users,
  DollarSign,
  Phone,
  MessageCircle,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Wind,
  Dog,
  Luggage,
  Compass,
  ArrowRight,
  Radio,
  Check,
  ChevronRight
} from 'lucide-react';
import { RemisDriver, RideRequest } from '../types';
import { RemisMap } from './RemisMap';
import { RemisRegisterModal } from './RemisRegisterModal';
import { getMergedLocalities } from '../lib/zoneUtils';

interface RemisesSectionProps {
  remises: RemisDriver[];
  onAddRemis: (remis: RemisDriver) => void;
  onUpdateRemisStatus: (remisId: string, status: 'disponible' | 'en_viaje' | 'fuera_de_servicio') => void;
  onRequestRide: (request: RideRequest) => void;
  showToast: (msg: string) => void;
}

// Distance matrix approximation between key towns in region (in km)
const ESTIMATED_DISTANCES: Record<string, number> = {
  'Alejandro Roca-Río Cuarto': 75,
  'Río Cuarto-Alejandro Roca': 75,
  'Alejandro Roca-La Carlota': 35,
  'La Carlota-Alejandro Roca': 35,
  'Alejandro Roca-Los Cisnes': 15,
  'Los Cisnes-Alejandro Roca': 15,
  'Alejandro Roca-General Deheza': 48,
  'General Deheza-Alejandro Roca': 48,
  'Alejandro Roca-General Cabrera': 42,
  'General Cabrera-Alejandro Roca': 42,
  'Alejandro Roca-Ucacha': 52,
  'Ucacha-Alejandro Roca': 52,
  'Alejandro Roca-Reducción': 28,
  'Reducción-Alejandro Roca': 28,
  'Río Cuarto-La Carlota': 110,
  'La Carlota-Río Cuarto': 110,
};

export const RemisesSection: React.FC<RemisesSectionProps> = ({
  remises,
  onAddRemis,
  onUpdateRemisStatus,
  onRequestRide,
  showToast,
}) => {
  const localities = getMergedLocalities();

  // Ride Requester State
  const [origin, setOrigin] = useState('Alejandro Roca');
  const [destination, setDestination] = useState('Río Cuarto');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [needAir, setNeedAir] = useState(false);
  const [needPets, setNeedPets] = useState(false);
  const [needTrunk, setNeedTrunk] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Filters & Modals
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'disponible'>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  // Filtered drivers
  const filteredRemises = useMemo(() => {
    return remises.filter((r) => {
      if (statusFilter === 'disponible' && r.status !== 'disponible') {
        return false;
      }
      if (selectedZoneFilter !== 'all') {
        const matchesBase = r.baseLocation.toLowerCase() === selectedZoneFilter.toLowerCase();
        const matchesZones = r.zones.some(
          (z) => z.toLowerCase() === selectedZoneFilter.toLowerCase()
        );
        if (!matchesBase && !matchesZones) return false;
      }
      if (needAir && !r.hasAirConditioning) return false;
      if (needPets && !r.acceptsPets) return false;
      if (needTrunk && !r.largeTrunk) return false;
      return true;
    });
  }, [remises, statusFilter, selectedZoneFilter, needAir, needPets, needTrunk]);

  // Estimate distance and fare
  const estimatedKm = useMemo(() => {
    if (!origin || !destination || origin === destination) return 5;
    const key = `${origin.trim()}-${destination.trim()}`;
    return ESTIMATED_DISTANCES[key] || 18; // Default 18km for unknown routes
  }, [origin, destination]);

  // Selected driver object
  const selectedDriver = useMemo(() => {
    if (selectedDriverId) {
      return remises.find((r) => r.id === selectedDriverId) || filteredRemises[0] || remises[0];
    }
    return filteredRemises.find((r) => r.status === 'disponible') || remises[0];
  }, [selectedDriverId, remises, filteredRemises]);

  // Calculate fare
  const calculatedFare = useMemo(() => {
    if (!selectedDriver) return 3500;
    const base = selectedDriver.baseRate || 1500;
    const perKm = selectedDriver.pricePerKm || 750;
    return Math.round(base + estimatedKm * perKm);
  }, [selectedDriver, estimatedKm]);

  const handleRequestRide = (driver: RemisDriver) => {
    if (!clientName.trim()) {
      showToast('⚠️ Por favor ingresá tu nombre antes de solicitar el viaje.');
      return;
    }

    const newRequest: RideRequest = {
      id: `req-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || 'No especificado',
      origin,
      destination,
      passengers,
      estimatedDistanceKm: estimatedKm,
      estimatedFare: calculatedFare,
      selectedDriverId: driver.id,
      selectedDriverName: driver.name,
      status: 'pendiente',
      notes: `Req: ${needAir ? 'Aire, ' : ''}${needPets ? 'Mascota, ' : ''}${needTrunk ? 'Baúl' : ''}`,
      createdAt: new Date().toISOString(),
    };

    onRequestRide(newRequest);
    setIsRequestSent(true);

    const whatsappMessage = encodeURIComponent(
      `🚕 *SOLICITUD DE VIAJE SERVIGO REMISES*\n\n` +
        `👤 *Pasajero:* ${clientName}\n` +
        `📞 *Teléfono:* ${clientPhone || 'No especificado'}\n` +
        `📍 *Origen:* ${origin}\n` +
        `🏁 *Destino:* ${destination}\n` +
        `👥 *Pasajeros:* ${passengers}\n` +
        `📏 *Distancia Estimada:* ${estimatedKm} km\n` +
        `💰 *Tarifa Estimada:* $${calculatedFare.toLocaleString('es-AR')}\n\n` +
        `¿Hola ${driver.name}, tenés disponibilidad para realizar este viaje?`
    );

    showToast(`🚕 Viaje registrado. Abriendo WhatsApp con ${driver.name}...`);
    window.open(`https://wa.me/${driver.whatsapp}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner Uber/Cabify Style */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-zinc-900 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 text-xs font-black tracking-wide uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-orange-400" />
              Red de Movilidad & Remises en Vivo
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Pedí tu Remis al Instante en <span className="text-orange-400">ServiGo</span> 🚕
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Visualizá los remiseros disponibles en tu zona, cotizá tu viaje con tarifa transparente y conectá directamente por WhatsApp sin intermediarios ni comisiones ocultas.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" /> Sumarme como Conductor / Remisero
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <div className="text-2xl font-black text-amber-400">
                {remises.filter((r) => r.status === 'disponible').length}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                🟢 Disponibles
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <div className="text-2xl font-black text-white">{remises.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                🚗 Flota Total
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Directo WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Ride Requester & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ride Requester Card (Pedir Viaje) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Cotizar & Pedir Viaje</h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  Ingresá origen y destino
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Cotización Directa
            </span>
          </div>

          {/* Passenger Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tu Nombre *</label>
              <input
                type="text"
                placeholder="Ej. María López"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono (Opcional)</label>
              <input
                type="tel"
                placeholder="Ej. 3584123388"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 relative">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Origen del Viaje
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs shadow-md">
                ↓
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-orange-600" /> Destino
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    🏁 {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Passengers & Comfort */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pasajeros</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    👤 {num} {num === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Filtros Confort</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNeedAir(!needAir)}
                  title="Aire Acondicionado"
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    needAir ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNeedPets(!needPets)}
                  title="Acepta Mascotas"
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    needPets ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Dog className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNeedTrunk(!needTrunk)}
                  title="Baúl Grande"
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    needTrunk ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Luggage className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Fare Estimation Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Distancia Estimada:</span>
              <span className="text-amber-400">{estimatedKm} km</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Tarifa Estimada
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  ${calculatedFare.toLocaleString('es-AR')}
                </span>
              </div>
              {selectedDriver && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Conductor:</span>
                  <span className="text-xs font-bold text-white">{selectedDriver.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {selectedDriver ? (
            <button
              onClick={() => handleRequestRide(selectedDriver)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              Pedir Remis a {selectedDriver.name.split(' ')[0]} por WhatsApp
            </button>
          ) : (
            <div className="text-center p-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              No hay remises disponibles con los filtros seleccionados.
            </div>
          )}
        </div>

        {/* Interactive Map & Fleet Radar */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-200/80 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Mapa Interactivo de Remises
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Hacé clic en un auto para seleccionarlo
              </span>
            </div>

            <div className="flex-1 min-h-[360px]">
              <RemisMap
                drivers={filteredRemises}
                selectedDriverId={selectedDriver?.id}
                onSelectDriver={(driver) => setSelectedDriverId(driver.id)}
                origin={origin}
                destination={destination}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Driver Fleet Filter & List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-orange-600" /> Flota de Remiseros Disponibles
            </h2>
            <p className="text-xs text-slate-500">
              Elegí con quién viajar y comunicate directo sin comisiones
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter(statusFilter === 'all' ? 'disponible' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'disponible'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Solo Disponibles
            </button>

            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">📍 Todas las Localidades</option>
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drivers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRemises.map((driver) => {
            const isSelected = selectedDriver?.id === driver.id;
            const isAvailable = driver.status === 'disponible';
            const isInTrip = driver.status === 'en_viaje';

            const whatsappMessage = encodeURIComponent(
              `Hola ${driver.name}, te contacto desde ServiGo Remises. Quisiera consultar disponibilidad para un viaje.`
            );

            return (
              <div
                key={driver.id}
                onClick={() => setSelectedDriverId(driver.id)}
                className={`relative bg-slate-50/50 rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isInTrip
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-emerald-500' : isInTrip ? 'bg-amber-500' : 'bg-slate-500'
                      }`}
                    ></span>
                    {isAvailable ? 'DISPONIBLE' : isInTrip ? 'EN VIAJE' : 'FUERA DE SERVICIO'}
                  </span>

                  {/* Simulator / Toggle status */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={driver.status}
                      onChange={(e) =>
                        onUpdateRemisStatus(
                          driver.id,
                          e.target.value as 'disponible' | 'en_viaje' | 'fuera_de_servicio'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
                      title="Cambiar estado del conductor"
                    >
                      <option value="disponible">🟢 Disponible</option>
                      <option value="en_viaje">🟡 En Viaje</option>
                      <option value="fuera_de_servicio">🔴 Offline</option>
                    </select>
                  </div>
                </div>

                {/* Driver Info Header */}
                <div className="flex items-start gap-3">
                  <img
                    src={driver.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={driver.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1">
                      {driver.name}
                      {driver.verified && (
                        <ShieldCheck className="w-4 h-4 text-orange-600" title="Conductor Verificado" />
                      )}
                    </h3>
                    <p className="text-xs font-bold text-slate-700">
                      🚗 {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color})
                    </p>
                    <p className="text-[10px] font-bold text-slate-500">
                      Patente: <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-900">{driver.vehicle.plate}</span>
                    </p>
                  </div>
                </div>

                {/* Base & Rates */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Base:</span>
                    <span className="font-bold text-slate-800">📍 {driver.baseLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tarifa Base / Km:</span>
                    <span className="font-bold text-slate-900">${driver.baseRate} / ${driver.pricePerKm}km</span>
                  </div>
                </div>

                {/* Features Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {driver.hasAirConditioning && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Aire
                    </span>
                  )}
                  {driver.acceptsPets && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                      <Dog className="w-3 h-3" /> Mascotas
                    </span>
                  )}
                  {driver.largeTrunk && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1">
                      <Luggage className="w-3 h-3" /> Baúl
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${driver.whatsapp}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${driver.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all"
                    title="Llamar directamente"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register Modal */}
      <RemisRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={(newRemis) => {
          onAddRemis(newRemis);
          showToast(`🚗 ¡Bienvenido! Te registraste como remisero en ServiGo.`);
        }}
      />
    </div>
  );
};
