import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { saveUserProfile } from '../../lib/deliveryService';

interface DeliveryUserProfileModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const DeliveryUserProfileModal: React.FC<DeliveryUserProfileModalProps> = ({
  userProfile,
  isOpen,
  onClose,
  onProfileUpdated,
  showToast,
}) => {
  const [name, setName] = useState<string>(userProfile.name || '');
  const [phone, setPhone] = useState<string>(userProfile.phone || '');
  const [email, setEmail] = useState<string>(userProfile.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    userProfile.deliveryAddress || ''
  );
  const [role, setRole] = useState<'client' | 'merchant' | 'admin'>(
    userProfile.role || 'client'
  );
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(
    userProfile.coordinates
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          if (showToast) showToast('📍 Coordenadas GPS detectadas');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          if (showToast) showToast('No se pudo acceder al GPS.');
        }
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: UserProfile = {
        ...userProfile,
        name,
        phone,
        email,
        role,
        deliveryAddress,
        coordinates,
      };

      await saveUserProfile(updated);
      onProfileUpdated(updated);
      if (showToast) showToast('✅ Datos de usuario guardados en Firestore (users)');
      onClose();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al guardar datos de usuario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Mi Perfil y Dirección de Envío
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Sincronizado con la colección <strong>users</strong> de Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none"
              placeholder="Tu nombre"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none"
                placeholder="+54 9 358 123-4567"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Rol Principal
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'client' | 'merchant')}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none bg-white"
              >
                <option value="client">🛍️ Cliente (Comprar)</option>
                <option value="merchant">🏪 Comercio (Recibir)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-orange-500 focus:outline-none"
              placeholder="tuemail@ejemplo.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 block">
                Dirección Predeterminada de Entrega
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>GPS Actual</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none"
              placeholder="Calle, altura, piso, depto, localidad"
            />
            {coordinates && (
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                📍 Coordenadas: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </span>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-all shadow-md shadow-orange-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Guardando...' : 'Guardar Datos de Envío'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
