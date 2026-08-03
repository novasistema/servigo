import React from 'react';
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, Tag, Calendar, ChevronRight, Wrench, Clock, Award } from 'lucide-react';
import { Worker } from '../types';

interface WorkerCardProps {
  worker: Worker;
  onSelectWorker: (worker: Worker) => void;
  onOpenBooking: (worker: Worker) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onSelectWorker, onOpenBooking }) => {
  const whatsappUrl = `https://wa.me/${worker.whatsapp}?text=${encodeURIComponent(
    `Hola ${worker.name}, te contacto desde la app ServiGo (auspiciada por Ferretería Bruzzone) para consultar por tus servicios de ${worker.tradeTitle}.`
  )}`;

  return (
    <div className="bg-white border border-slate-200 hover:border-orange-300 rounded-[32px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Avatar & Online status */}
          <div className="relative">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
            />
            {worker.availability.urgencies24h && (
              <span
                title="Atiende Urgencias 24hs"
                className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white flex items-center gap-0.5 animate-pulse"
              >
                24hs
              </span>
            )}
          </div>

          {/* Title & Ratings */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                {worker.name}
              </h3>
              {worker.verified && (
                <span
                  title="Profesional Verificado ServiGo"
                  className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Verificado
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-orange-600 mt-0.5 truncate">
              {worker.tradeTitle}
            </p>

            {worker.matricula && (
              <p className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">{worker.matricula}</span>
              </p>
            )}

            {/* Stars & Completed Jobs */}
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                <span>{worker.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({worker.reviewCount})</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium text-[11px]">
                {worker.completedJobs} trabajos
              </span>
            </div>
          </div>
        </div>

        {/* Location & Coverage */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="font-bold text-slate-800">{worker.location}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 truncate">Zonas: {worker.zones.join(', ')}</span>
        </div>

        {/* Ferretería Bruzzone Partner Badge */}
        {worker.ferreteroPartner && (
          <div className="mb-3 bg-orange-50/80 p-2.5 rounded-2xl border border-orange-200 text-xs flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 font-black text-[11px] shadow-xs">
              FB
            </div>
            <div className="min-w-0">
              <span className="font-bold text-orange-900 block text-[11px] leading-tight">
                Socio Ferretería Bruzzone
              </span>
              <span className="text-[10px] text-orange-700 block truncate">
                10% OFF en mano de obra con insumos Bruzzone
              </span>
            </div>
          </div>
        )}

        {/* Rates & Schedule Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Tarifa estim.</span>
            <span className="text-sm font-black text-slate-900">
              ${worker.hourlyRate.toLocaleString('es-AR')}{' '}
              <span className="text-[10px] text-slate-500 font-normal">/hr</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Visita / Diag.</span>
            <span className="text-sm font-black text-slate-900">
              ${worker.visitFee.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {worker.bio}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Book / Request Quote */}
          <button
            onClick={() => onOpenBooking(worker)}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar</span>
          </button>
        </div>

        {/* Full Profile Link */}
        <button
          onClick={() => onSelectWorker(worker)}
          className="w-full py-1 text-center text-xs text-slate-500 hover:text-orange-600 font-bold flex items-center justify-center gap-1 group/btn transition-colors"
        >
          <span>Ver perfil completo, fotos y servicios</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-orange-500" />
        </button>
      </div>
    </div>
  );
};
