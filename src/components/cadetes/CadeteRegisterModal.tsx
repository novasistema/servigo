import React, { useState } from 'react';
import {
  X,
  Bike,
  Car,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Camera,
  CheckCircle2,
  DollarSign,
  Lock,
  User,
  Info
} from 'lucide-react';
import { Cadete, CadeteVehicleType } from '../../types';
import { saveCadete } from '../../lib/cadeteService';

interface CadeteRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
  onCadeteRegistered?: (newCadete: Cadete) => void;
}

export const CadeteRegisterModal: React.FC<CadeteRegisterModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onCadeteRegistered,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<CadeteVehicleType>('moto');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [plateOrDetails, setPlateOrDetails] = useState('');
  const [baseLocation, setBaseLocation] = useState('Alejandro Roca');
  const [zonesInput, setZonesInput] = useState('Alejandro Roca, Zona Centro, Barrio Norte');
  const [baseRate, setBaseRate] = useState<number>(1200);
  const [pinCode, setPinCode] = useState('1234');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Default avatars
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !vehicleDescription.trim()) {
      if (showToast) showToast('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const zones = zonesInput
        .split(',')
        .map((z) => z.trim())
        .filter((z) => z.length > 0);

      const newCadeteId = `cadete-${Date.now()}`;
      const newCadete: Cadete = {
        id: newCadeteId,
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: phone.replace(/[^0-9]/g, ''),
        vehicleType,
        vehicleDescription: vehicleDescription.trim(),
        plateOrDetails: plateOrDetails.trim() || undefined,
        baseLocation: baseLocation.trim(),
        zones: zones.length > 0 ? zones : [baseLocation.trim()],
        isAvailable: true, // Se registra y arranca disponible
        baseRate: Number(baseRate) || 1200,
        rating: 5.0,
        completedDeliveries: 0,
        verified: true,
        pinCode: pinCode.trim() || '1234',
        accountUsername: name.toLowerCase().replace(/\s+/g, '_'),
        photoUrl: photoUrl || defaultAvatars[0],
        createdAt: new Date().toISOString(),
      };

      await saveCadete(newCadete);

      if (showToast) {
        showToast(`🎉 ¡Bienvenido ${newCadete.name}! Ya estás registrado como cadete disponible.`);
      }

      if (onCadeteRegistered) {
        onCadeteRegistered(newCadete);
      }

      onClose();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al registrar cadete');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Registro de Cadete / Repartidor
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Únete a la red urbana de ServiGo para recibir pedidos y mandados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Franco Gómez"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +54 9 358 411-2233"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Vehicle Type selector */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">
              Tipo de Vehículo *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'moto', label: '🏍️ Moto', desc: 'Ideal para rapidez' },
                { id: 'bicicleta', label: '🚲 Bicicleta', desc: 'Económico y ágil' },
                { id: 'auto', label: '🚗 Auto', desc: 'Paquetes grandes' },
              ].map((veh) => (
                <button
                  key={veh.id}
                  type="button"
                  onClick={() => setVehicleType(veh.id as CadeteVehicleType)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    vehicleType === veh.id
                      ? 'bg-orange-50 border-orange-500 text-orange-950 ring-1 ring-orange-500 font-black'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <span className="text-sm block">{veh.label}</span>
                  <span className="text-[10px] text-slate-400 block">{veh.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle description & Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Descripción del Rodado *
              </label>
              <input
                type="text"
                required
                value={vehicleDescription}
                onChange={(e) => setVehicleDescription(e.target.value)}
                placeholder="Ej: Honda Wave 110cc Roja con caja"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Patente o Detalles
              </label>
              <input
                type="text"
                value={plateOrDetails}
                onChange={(e) => setPlateOrDetails(e.target.value)}
                placeholder="Ej: A094KLL / Rodado 29"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Zones & Base Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Zonas de Cobertura
              </label>
              <input
                type="text"
                value={zonesInput}
                onChange={(e) => setZonesInput(e.target.value)}
                placeholder="Separadas por coma: Centro, Norte, etc."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Tarifa Base Sugerida ($ ARS)
              </label>
              <input
                type="number"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value))}
                placeholder="1200"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* PIN Code for access */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
              PIN de Acceso a tu Panel de Cadete (4 dígitos)
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="1234"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">
              Foto de Perfil
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {defaultAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="avatar"
                  onClick={() => setPhotoUrl(url)}
                  className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all border-2 ${
                    (photoUrl || defaultAvatars[0]) === url
                      ? 'border-orange-500 ring-2 ring-orange-500/40 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando cadete...' : 'Completar Registro y Activarme'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
