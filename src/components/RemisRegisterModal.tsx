import React, { useState } from 'react';
import {
  X,
  Car,
  User,
  Phone,
  MessageCircle,
  MapPin,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Check,
  Dog,
  Wind,
  Luggage,
  CheckCircle2
} from 'lucide-react';
import { RemisDriver } from '../types';
import { getMergedLocalities } from '../lib/zoneUtils';

interface RemisRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newRemis: RemisDriver) => void;
}

const LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Alejandro Roca': { lat: -33.3534, lng: -63.7176 },
  'Río Cuarto': { lat: -33.1232, lng: -64.3492 },
  'La Carlota': { lat: -33.4215, lng: -63.2980 },
  'General Deheza': { lat: -32.7550, lng: -63.7883 },
  'General Cabrera': { lat: -32.8133, lng: -63.8717 },
  'Ucacha': { lat: -33.0315, lng: -63.5082 },
  'Los Cisnes': { lat: -33.3888, lng: -63.5333 },
  'Reducción': { lat: -33.1970, lng: -63.8640 },
  'Villa María': { lat: -32.4075, lng: -63.2403 },
  'Córdoba Capital': { lat: -31.4201, lng: -64.1888 },
};

export const RemisRegisterModal: React.FC<RemisRegisterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const localitiesList = getMergedLocalities();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    make: 'Toyota',
    model: 'Corolla',
    year: '2022',
    color: 'Gris Plata',
    plate: '',
    baseLocation: 'Alejandro Roca',
    zonesInput: 'Alejandro Roca, Río Cuarto, La Carlota, Los Cisnes',
    baseRate: 1500,
    pricePerKm: 750,
    acceptsPets: true,
    hasAirConditioning: true,
    largeTrunk: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const zonesArray = formData.zonesInput
      .split(',')
      .map((z) => z.trim())
      .filter((z) => z.length > 0);

    const cleanPhone = formData.phone.trim();
    const rawDigits = cleanPhone.replace(/\D/g, '');
    const cleanWhatsapp = formData.whatsapp
      ? formData.whatsapp.replace(/\D/g, '')
      : rawDigits.startsWith('549')
      ? rawDigits
      : rawDigits.startsWith('54')
      ? rawDigits
      : `549${rawDigits}`;

    const baseCoords = LOCALITY_COORDS[formData.baseLocation] || {
      lat: -33.3534 + (Math.random() * 0.02 - 0.01),
      lng: -63.7176 + (Math.random() * 0.02 - 0.01),
    };

    const newDriver: RemisDriver = {
      id: `remis-${Date.now()}`,
      name: formData.name,
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      vehicle: {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        plate: formData.plate.toUpperCase(),
      },
      photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      baseLocation: formData.baseLocation,
      zones: zonesArray.length > 0 ? zonesArray : [formData.baseLocation],
      status: 'disponible',
      baseRate: Number(formData.baseRate) || 1500,
      pricePerKm: Number(formData.pricePerKm) || 750,
      acceptsPets: formData.acceptsPets,
      hasAirConditioning: formData.hasAirConditioning,
      largeTrunk: formData.largeTrunk,
      rating: 5.0,
      totalTrips: 1,
      verified: true,
      coordinates: baseCoords,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSubmit(newDriver);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30 mb-3">
            <Car className="w-3.5 h-3.5" /> Registro de Conductor / Remisero
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Sumate como Remisero a ServiGo 🚕
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Aparecé en el mapa interactivo de tu zona, recibí pedidos directos por WhatsApp y elegí tu disponibilidad.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Datos Personales */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" /> 1. Datos del Conductor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Benítez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Móvil / Llamadas *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. +54 9 358 412-3388"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Vehículo */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3 flex items-center gap-1.5">
              <Car className="w-4 h-4" /> 2. Datos del Vehículo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Toyota"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modelo *</label>
                <input
                  type="text"
                  required
                  placeholder="Corolla"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Año</label>
                <input
                  type="text"
                  placeholder="2022"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patente *</label>
                <input
                  type="text"
                  required
                  placeholder="AF 123 CD"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-orange-500 bg-amber-50/50 border-amber-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color del Vehículo</label>
                <input
                  type="text"
                  placeholder="Gris Plata, Blanco, etc."
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Foto o Avatar (URL Opcional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Cobertura & Tarifas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> 3. Base, Cobertura y Tarifas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Localidad Base Principal *</label>
                <select
                  required
                  value={formData.baseLocation}
                  onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50 cursor-pointer"
                >
                  {localitiesList.map((loc) => (
                    <option key={loc} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Zonas de Cobertura (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.zonesInput}
                  onChange={(e) => setFormData({ ...formData, zonesInput: e.target.value })}
                  placeholder="Alejandro Roca, Río Cuarto, La Carlota, Los Cisnes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bajada de Bandera / Tarifa Mínima ($ ARS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    required
                    value={formData.baseRate}
                    onChange={(e) => setFormData({ ...formData, baseRate: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Precio Estimado por Km ($ ARS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    required
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Opciones de Confort */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
              4. Opciones del Servicio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-orange-50/50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.hasAirConditioning}
                  onChange={(e) => setFormData({ ...formData, hasAirConditioning: e.target.checked })}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <Wind className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-bold text-slate-700">Aire Acond.</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-orange-50/50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.acceptsPets}
                  onChange={(e) => setFormData({ ...formData, acceptsPets: e.target.checked })}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <Dog className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-700">Acepta Mascotas</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-orange-50/50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.largeTrunk}
                  onChange={(e) => setFormData({ ...formData, largeTrunk: e.target.checked })}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <Luggage className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-700">Baúl Grande</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Registrando...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Registrarme como Conductor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
