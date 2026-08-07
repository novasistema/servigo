import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  Tag,
  ShoppingBag,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';
import { Worker, HardwareProduct } from '../types';
import { shareContent } from '../utils/share';

interface WorkerDetailModalProps {
  worker: Worker | null;
  onClose: () => void;
  onOpenBooking: (worker: Worker) => void;
  onOpenReviewModal: (worker: Worker) => void;
  bruzzoneProducts: HardwareProduct[];
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  onClose,
  onOpenBooking,
  onOpenReviewModal,
  bruzzoneProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'gallery'>('info');
  const [copied, setCopied] = useState(false);

  if (!worker) return null;

  const handleShare = async () => {
    const res = await shareContent({
      title: `${worker.name} - ${worker.tradeTitle} | ServiGo`,
      text: `Te recomiendo a ${worker.name} (${worker.tradeTitle}) en ${worker.location}. Calificación: ★ ${worker.rating.toFixed(1)}. ¡Contactalo en ServiGo!`,
    });
    if (res.method === 'clipboard') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const whatsappUrl = `https://wa.me/${worker.whatsapp}?text=${encodeURIComponent(
    `Hola ${worker.name}, vi tu perfil verificado en la app ServiGo (auspiciada por Ferretería Bruzzone) y quisiera consultar por tu disponibilidad para un trabajo de ${worker.tradeTitle}.`
  )}`;

  // Filter hardware products relevant to this worker's trade
  const relatedHardware = bruzzoneProducts.filter(
    (p) => p.trade === worker.trade || p.trade === 'general'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 relative">
        {/* Modal Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-start justify-between gap-3 sticky top-0 z-10 text-white">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-black text-white">{worker.name}</h2>
                {worker.verified && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    Verificado
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-orange-400">{worker.tradeTitle}</p>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-orange-400" />
                {worker.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Compartir publicación"
                aria-label="Compartir publicación"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              </button>
              {copied && (
                <span className="absolute top-11 right-0 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap animate-fadeIn z-20">
                  ¡Enlace copiado!
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Cerrar modal"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-orange-600 text-orange-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Información & Tarifas
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'reviews'
                ? 'border-orange-600 text-orange-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Opiniones</span>
            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-1.5 rounded-full font-black">
              ★ {worker.rating.toFixed(1)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-orange-600 text-orange-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Galería ({worker.gallery.length})
          </button>
        </div>

        {/* Modal Body Scroll Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-white">
          {/* TAB 1: INFO & RATES */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Matrícula Banner */}
              {worker.matricula && (
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-center gap-3">
                  <Award className="w-7 h-7 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold block">
                      Habilitación Profesional
                    </span>
                    <span className="text-sm font-black text-slate-900">{worker.matricula}</span>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Sobre el Profesional
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{worker.bio}</p>
              </div>

              {/* Rates & Schedule Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-orange-600" />
                    Valores y Presupuesto
                  </h4>
                  <div className="flex justify-between items-center text-xs border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Tarifa por hora:</span>
                    <span className="font-black text-slate-900 text-sm">
                      ${worker.hourlyRate.toLocaleString('es-AR')} /hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Visita / Diagnóstico:</span>
                    <span className="font-black text-slate-900 text-sm">
                      ${worker.visitFee.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    Disponibilidad Horaria
                  </h4>
                  <p className="text-xs font-bold text-slate-800">
                    {worker.availability.days.join(', ')}
                  </p>
                  <p className="text-xs text-slate-500">Horario: {worker.availability.hours}</p>
                  {worker.availability.urgencies24h && (
                    <span className="inline-block text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full mt-1">
                      🚨 Guardia Urgencias 24 hs
                    </span>
                  )}
                </div>
              </div>

              {/* Ferretería Bruzzone Partner Benefit */}
              {worker.ferreteroPartner && (
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      BENEFICIO BRUZZONE
                    </span>
                  </div>
                  <p className="text-xs text-orange-900 leading-relaxed font-medium">
                    Si compras tus materiales en <strong>Ferretería Bruzzone</strong> (ferreteriabruzzone.com.ar), {worker.name} te otorga un <strong>10% de descuento directo</strong> en la mano de obra.
                  </p>
                </div>
              )}

              {/* Services List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Servicios y Especialidades
                </h4>
                <div className="space-y-1.5">
                  {worker.services.map((service, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Zonas de Cobertura Atendidas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {worker.zones.map((zone, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-xl font-bold shadow-xs"
                    >
                      📍 {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Ratings Summary Header */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {worker.rating.toFixed(1)}
                    </span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(worker.rating)
                              ? 'fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Basado en {worker.reviewCount} opiniones de clientes verificados
                  </p>
                </div>

                <button
                  onClick={() => onOpenReviewModal(worker)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Calificar Servicio
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {worker.reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Aún no hay opiniones escritas para este profesional. ¡Sé el primero en calificarlo!
                  </p>
                ) : (
                  worker.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{rev.clientName}</span>
                        <span className="text-slate-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-500 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-orange-600 font-bold">
                          {rev.serviceType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{rev.comment}</p>

                      {rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rev.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold"
                            >
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY */}
          {activeTab === 'gallery' && (
            <div>
              {worker.gallery.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  El trabajador no ha subido fotos aún a su galería.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {worker.gallery.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Trabajo realizado ${i + 1}`}
                      className="w-full h-40 object-cover rounded-2xl border border-slate-200 hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Sticky Actions */}
        <div className="bg-slate-100 p-3 sm:p-3.5 border-t border-slate-200 flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenBooking(worker)}
            className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Agendar</span>
          </button>

          <button
            onClick={() => onOpenReviewModal(worker)}
            className="py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Calificar experiencia y escribir reseña"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Opinión</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Compartir esta publicación"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Share2 className="w-4 h-4 text-slate-700 shrink-0" />}
            <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
