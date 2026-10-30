import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Send,
  MessageCircle,
  Navigation,
  Bike,
  Car,
  Package,
  UtensilsCrossed,
  Pill,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Cadete, CadeteRequest } from '../../types';
import { createCadeteRequest } from '../../lib/cadeteService';

interface CadeteRequestModalProps {
  cadete: Cadete | null;
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

export const CadeteRequestModal: React.FC<CadeteRequestModalProps> = ({
  cadete,
  isOpen,
  onClose,
  showToast,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [taskType, setTaskType] = useState<CadeteRequest['taskType']>('mandado');
  const [description, setDescription] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // GPS Location state
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; mapsUrl: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !cadete) return null;

  // Handle capturing browser GPS location
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setGpsLocation({ lat, lng, mapsUrl });
        setIsGettingLocation(false);
        if (showToast) {
          showToast('📍 Ubicación GPS capturada con éxito');
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMsg = 'No se pudo obtener la ubicación GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permiso de ubicación denegado en tu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Ubicación GPS no disponible actualmente.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Tiempo de espera agotado al buscar satélites GPS.';
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Submit in-app digital request to Firestore
  const handleSubmitInApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !description.trim()) {
      if (showToast) showToast('Por favor completa tu nombre, teléfono y descripción');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCadeteRequest({
        cadeteId: cadete.id,
        cadeteName: cadete.name,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        taskType,
        description: description.trim(),
        originAddress: originAddress.trim() || 'Coordinar con cadete',
        destinationAddress: destinationAddress.trim() || (gpsLocation ? 'Ver ubicación GPS enviada' : 'A convenir'),
        clientLocation: gpsLocation || undefined,
        status: 'pendiente',
        estimatedFee: cadete.baseRate || 1200,
      });

      if (showToast) {
        showToast(`🚀 Solicitud enviada a ${cadete.name}. ¡Le llegó la notificación!`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al enviar la solicitud al cadete');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open WhatsApp directly with formatted message including GPS location link
  const handleSendWhatsApp = () => {
    if (!clientName.trim()) {
      if (showToast) showToast('Ingresa tu nombre para enviar el WhatsApp');
      return;
    }

    let message = `🛵 *HOLA ${cadete.name.toUpperCase()}*, necesito tu servicio de cadetería a través de ServiGo:\n\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    if (clientPhone) message += `📞 *Teléfono:* ${clientPhone}\n`;
    message += `📋 *Tipo de encargo:* ${taskType.toUpperCase()}\n`;
    if (description) message += `📝 *Detalle:* ${description}\n`;
    if (originAddress) message += `📦 *Retirar en:* ${originAddress}\n`;
    if (destinationAddress) message += `🏁 *Entregar en:* ${destinationAddress}\n`;

    if (gpsLocation) {
      message += `\n📍 *MI UBICACIÓN GPS EN VIVO:*\n${gpsLocation.mapsUrl}\n`;
    }

    message += `\n¿Estás disponible en este momento para realizar el viaje? Gracias!`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = cadete.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={cadete.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={cadete.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  cadete.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={cadete.isAvailable ? 'Disponible Ahora' : 'No disponible'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{cadete.name}</h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    cadete.isAvailable
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cadete.isAvailable ? '🟢 Disponible' : '🔴 Fuera de turno'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {cadete.vehicleType === 'moto' ? '🏍️ Moto' : cadete.vehicleType === 'bicicleta' ? '🚲 Bicicleta' : '🚗 Auto'} • {cadete.vehicleDescription}
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
        <form onSubmit={handleSubmitInApp} className="space-y-4">
          {/* Client contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Tu Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Mariano Rodríguez"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Tu Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej: +54 9 358 512-9988"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Task Type selector */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">
              ¿Qué tipo de encargo necesitas?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'mandado', label: '🛵 Mandado / Trámite', icon: Package },
                { id: 'retiro_comida', label: '🍔 Retiro de Comida', icon: UtensilsCrossed },
                { id: 'farmacia', label: '💊 Farmacia & Salud', icon: Pill },
                { id: 'paquete', label: '📦 Paquete / Caja', icon: Package },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTaskType(item.id as CadeteRequest['taskType'])}
                  className={`p-2 rounded-xl border text-left font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                    taskType === item.id
                      ? 'bg-orange-50 border-orange-500 text-orange-900 ring-1 ring-orange-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-orange-600" />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
              Detalle del Mandado / Instrucciones *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Retirar pedido pagado en Pizzería Don Antonio y traer a mi casa. Avisar cuando salgas."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                📍 Dónde retira (Origen)
              </label>
              <input
                type="text"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                placeholder="Ej: Local Don Antonio / Belgrano 234"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                🏁 Dónde entrega (Destino)
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Ej: San Martín 820, timbre 2B"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* BOTÓN DESTACADO: ENVIAR UBICACIÓN GPS EN VIVO */}
          {/* ================================================================ */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Enviar mi Ubicación GPS al Cadete</span>
              </span>
              {gpsLocation && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  GPS Activado
                </span>
              )}
            </div>
            <p className="text-[11px] text-blue-800">
              Captura las coordenadas de tu celular o computadora para que el cadete navegue directamente con Google Maps o Waze hasta tu puerta.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isGettingLocation}
                onClick={handleGetLiveLocation}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Buscando satélites GPS...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{gpsLocation ? '📍 Actualizar Ubicación GPS' : '📍 Capturar Mi Ubicación GPS Ahora'}</span>
                  </>
                )}
              </button>

              {gpsLocation && (
                <a
                  href={gpsLocation.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Ver en Google Maps</span>
                </a>
              )}
            </div>

            {locationError && (
              <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{locationError}</span>
              </p>
            )}
          </div>

          {/* Tarifa base info */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center justify-between">
            <span>Tarifa base estimada del cadete:</span>
            <span className="font-black text-orange-700 text-sm">
              ${(cadete.baseRate || 1200).toLocaleString('es-AR')}
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* WhatsApp option */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp con GPS</span>
            </button>

            {/* In-app digital submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando notificación...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Notificar al Panel del Cadete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
