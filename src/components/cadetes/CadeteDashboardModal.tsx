import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bike,
  Car,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Navigation,
  MessageCircle,
  AlertCircle,
  Power,
  ShieldCheck,
  Search,
  Check,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Package,
  UtensilsCrossed,
  Pill,
  DollarSign
} from 'lucide-react';
import { Cadete, CadeteRequest, CadeteRequestStatus } from '../../types';
import {
  subscribeCadetes,
  subscribeCadeteRequests,
  updateCadeteAvailability,
  updateCadeteRequestStatus,
  getSavedCadeteSession,
  setSavedCadeteSession,
} from '../../lib/cadeteService';
import { INITIAL_CADETES } from '../../data/mockCadetes';
import { soundNotifier } from '../../utils/audioAlert';

interface CadeteDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCadeteId?: string;
  showToast?: (msg: string) => void;
}

export const CadeteDashboardModal: React.FC<CadeteDashboardModalProps> = ({
  isOpen,
  onClose,
  initialCadeteId,
  showToast,
}) => {
  const [cadetes, setCadetes] = useState<Cadete[]>(INITIAL_CADETES);
  const [selectedCadeteId, setSelectedCadeteId] = useState<string | null>(() => {
    return initialCadeteId || getSavedCadeteSession() || INITIAL_CADETES[0].id;
  });

  const [requests, setRequests] = useState<CadeteRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'profile' | 'rates'>('notifications');
  const [isChangingProfile, setIsChangingProfile] = useState(false);
  const [searchCadeteQuery, setSearchCadeteQuery] = useState('');
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  // Keep track of known requests to trigger sound chime on new ones
  const previousRequestsCountRef = useRef<number>(0);

  // Subscribe to all cadetes in real-time
  useEffect(() => {
    const unsub = subscribeCadetes((realtimeCadetes) => {
      if (realtimeCadetes && realtimeCadetes.length > 0) {
        setCadetes(realtimeCadetes);
      }
    });
    return () => unsub();
  }, []);

  const currentCadete =
    cadetes.find((c) => c.id === selectedCadeteId) ||
    cadetes[0] ||
    INITIAL_CADETES[0];

  // Subscribe to requests directed to the current cadete in real-time
  useEffect(() => {
    if (!isOpen || !currentCadete?.id) return;

    const unsub = subscribeCadeteRequests(currentCadete.id, (realtimeRequests) => {
      // If new requests arrived while modal is open, play notification sound!
      if (
        previousRequestsCountRef.current > 0 &&
        realtimeRequests.length > previousRequestsCountRef.current
      ) {
        soundNotifier.playOrderIncomingChime();
        if (showToast) {
          showToast('🔔 ¡Nueva solicitud de cadetería recibida!');
        }
      }
      previousRequestsCountRef.current = realtimeRequests.length;
      setRequests(realtimeRequests);
    });

    return () => unsub();
  }, [isOpen, currentCadete?.id]);

  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === 'pendiente');
  const activeRequests = requests.filter(
    (r) => r.status === 'aceptado' || r.status === 'en_camino'
  );
  const completedRequests = requests.filter(
    (r) => r.status === 'entregado' || r.status === 'cancelado'
  );

  // Toggle availability in Firestore
  const handleToggleAvailability = async () => {
    if (!currentCadete || isTogglingAvailability) return;
    setIsTogglingAvailability(true);
    const newStatus = !currentCadete.isAvailable;

    try {
      await updateCadeteAvailability(currentCadete.id, newStatus);
      if (showToast) {
        showToast(
          newStatus
            ? '🟢 ¡Ahora estás DISPONIBLE para recibir viajes!'
            : '🔴 Te has puesto FUERA DE TURNO (No disponible)'
        );
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al cambiar disponibilidad');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  // Change active cadete profile
  const handleSelectCadete = (cadeteId: string) => {
    setSelectedCadeteId(cadeteId);
    setSavedCadeteSession(cadeteId);
    setIsChangingProfile(false);
    if (showToast) {
      const found = cadetes.find((c) => c.id === cadeteId);
      showToast(`Conectado como ${found?.name || 'Cadete'}`);
    }
  };

  // Change request status
  const handleUpdateStatus = async (requestId: string, status: CadeteRequestStatus) => {
    try {
      await updateCadeteRequestStatus(requestId, status);
      const labels: Record<CadeteRequestStatus, string> = {
        pendiente: 'Marcado como pendiente',
        aceptado: '✅ ¡Solicitud aceptada! Comunícate con el cliente',
        en_camino: '🛵 ¡Viaje en camino!',
        entregado: '🏁 ¡Envío completado con éxito!',
        cancelado: '❌ Solicitud rechazada o cancelada',
      };
      if (showToast) showToast(labels[status]);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al actualizar estado');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative animate-scaleUp">
        {/* ================================================================ */}
        {/* MODAL HEADER WITH PROFILE SWITCHER */}
        {/* ================================================================ */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentCadete.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={currentCadete.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  currentCadete.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {currentCadete.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Panel de Cadete
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentCadete.vehicleType === 'moto' ? '🏍️ Moto' : currentCadete.vehicleType === 'bicicleta' ? '🚲 Bici' : '🚗 Auto'} • {currentCadete.vehicleDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangingProfile(!isChangingProfile)}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 hidden sm:inline-flex items-center gap-1"
            >
              <span>Cambiar Perfil</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Switcher overlay */}
        {isChangingProfile && (
          <div className="bg-slate-950 p-4 border-b border-slate-800 text-white space-y-3 animate-fadeIn shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-400">
                Seleccionar perfil de cadete:
              </span>
              <button
                onClick={() => setIsChangingProfile(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {cadetes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCadete(c.id)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    c.id === currentCadete.id
                      ? 'bg-orange-600/30 border-orange-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <img src={c.photoUrl} alt={c.name} className="w-8 h-8 rounded-xl object-cover" />
                  <div className="truncate text-xs">
                    <strong className="block truncate">{c.name}</strong>
                    <span className="text-[10px] text-slate-400">{c.vehicleType}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* INTERRUPTOR GIGANTE DE DISPONIBILIDAD (ONLINE / OFFLINE) */}
        {/* ================================================================ */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Estado en Tiempo Real
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    currentCadete.isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {currentCadete.isAvailable ? '🟢 ACTIVO & DISPONIBLE' : '🔴 FUERA DE TURNO'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {currentCadete.isAvailable
                  ? 'Los clientes y comercios te ven como DISPONIBLE y pueden enviarte solicitudes con su ubicación.'
                  : 'Estás oculto como no disponible. Toca el botón para activarte y empezar a recibir pedidos.'}
              </p>
            </div>

            {/* BIG TOGGLE BUTTON */}
            <button
              onClick={handleToggleAvailability}
              disabled={isTogglingAvailability}
              className={`py-3 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                currentCadete.isAvailable
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 animate-pulse'
              }`}
            >
              <Power className="w-5 h-5" />
              <span>
                {currentCadete.isAvailable
                  ? 'Pausar Turno (Desactivar)'
                  : '🟢 ACTIVAR DISPONIBILIDAD'}
              </span>
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-slate-900 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notificaciones & Pedidos ({requests.length})</span>
              {pendingRequests.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                  {pendingRequests.length} nuevos
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Mi Vehículo & Zonas</span>
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* BODY: NOTIFICACIONES Y SOLICITUDES EN VIVO */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fadeIn">
              {requests.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 space-y-2">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-700">
                    No tienes notificaciones o pedidos pendientes
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Cuando un cliente o comercio solicite tus servicios y envíe su ubicación, sonará una alerta y aparecerá la tarjeta aquí de inmediato.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => {
                    const isPending = req.status === 'pendiente';
                    const isAccepted = req.status === 'aceptado';
                    const isOnTheWay = req.status === 'en_camino';
                    const isDone = req.status === 'entregado';
                    const isCancelled = req.status === 'cancelado';

                    return (
                      <div
                        key={req.id}
                        className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-xs transition-all space-y-3 ${
                          isPending
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : isAccepted
                            ? 'border-blue-300'
                            : isOnTheWay
                            ? 'border-purple-300'
                            : isDone
                            ? 'border-emerald-300 opacity-80'
                            : 'border-slate-200 opacity-70'
                        }`}
                      >
                        {/* Request Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded-lg">
                              {req.taskType.toUpperCase()}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {req.createdAt
                                ? new Date(req.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Reciente'}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isPending && (
                              <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                                🟡 NUEVA SOLICITUD PENDIENTE
                              </span>
                            )}
                            {isAccepted && (
                              <span className="text-xs font-black bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                                🔵 VIAJE ACEPTADO
                              </span>
                            )}
                            {isOnTheWay && (
                              <span className="text-xs font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                                🟣 EN CAMINO / EN CURSO
                              </span>
                            )}
                            {isDone && (
                              <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                                🟢 ENTREGADO & FINALIZADO
                              </span>
                            )}
                            {isCancelled && (
                              <span className="text-xs font-black bg-rose-100 text-rose-900 px-3 py-1 rounded-full">
                                🔴 CANCELADO / RECHAZADO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Request Body */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Left: Client & Description */}
                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 text-sm">
                                👤 {req.clientName}
                              </span>
                              <a
                                href={`https://wa.me/${req.clientPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(req.clientName)},%20te%20escribo%20por%20tu%20solicitud%20de%20cadeter%C3%ADa.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                            <p className="text-slate-600 font-semibold">
                              📞 {req.clientPhone}
                            </p>
                            <p className="text-slate-700 bg-white p-2 rounded-xl border border-slate-200 font-medium leading-relaxed">
                              "{req.description}"
                            </p>
                          </div>

                          {/* Right: Origin, Destination & GPS Location */}
                          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 block">
                                📦 Retiro en:
                              </span>
                              <p className="font-bold text-slate-800">{req.originAddress}</p>
                            </div>

                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 block">
                                🏁 Entrega en:
                              </span>
                              <p className="font-bold text-slate-800">{req.destinationAddress}</p>
                            </div>

                            {/* GPS Location Link if provided by client */}
                            {req.clientLocation && (
                              <div className="pt-1 border-t border-slate-200">
                                <a
                                  href={req.clientLocation.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  <span>Abrir Ubicación GPS en Google Maps / Waze</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Action Buttons for Cadete */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end flex-wrap gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'cancelado')}
                                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                              >
                                Rechazar
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'aceptado')}
                                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Aceptar Solicitud</span>
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'en_camino')}
                              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Bike className="w-4 h-4" />
                              <span>Marcar "En Camino"</span>
                            </button>
                          )}

                          {isOnTheWay && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'entregado')}
                              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Marcar "Entregado / Finalizado"</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 animate-fadeIn max-w-xl mx-auto">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Bike className="w-5 h-5 text-orange-600" />
                <span>Datos del Cadete & Vehículo</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Nombre</span>
                  <p className="font-bold text-slate-800 text-sm">{currentCadete.name}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Vehículo</span>
                  <p className="font-bold text-slate-800">{currentCadete.vehicleDescription}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Teléfono / WhatsApp</span>
                  <p className="font-bold text-slate-800">{currentCadete.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Tarifa base sugerida</span>
                  <p className="font-bold text-orange-600 text-sm">${(currentCadete.baseRate || 1200).toLocaleString('es-AR')}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Zonas de cobertura</span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {currentCadete.zones.map((z, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                        📍 {z}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
