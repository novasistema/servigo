import React, { useState } from 'react';
import { Star, MapPin, MessageCircle, ShieldCheck, Calendar, ChevronRight, Award, MessageSquare, Share2, Check, Ticket } from 'lucide-react';
import { Worker } from '../types';
import { shareContent } from '../utils/share';

interface WorkerCardProps {
  worker: Worker;
  onSelectWorker: (worker: Worker) => void;
  onOpenBooking: (worker: Worker) => void;
  onOpenReviewModal?: (worker: Worker) => void;
  onOpenCouponModal?: (worker: Worker) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onSelectWorker,
  onOpenBooking,
  onOpenReviewModal,
  onOpenCouponModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    `Hola ${worker.name}, te contacto desde la app ServiGo (auspiciada por Ferretería Bruzzone) para consultar por tus servicios de ${worker.tradeTitle}.`
  )}`;

  return (
    <article className="rounded-[20px] bg-sg-navy-2 text-white p-4 flex flex-col gap-3 font-sans">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img src={worker.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover bg-[#1c3366]" />
          {worker.availability.urgencies24h && (
            <span className="absolute -bottom-1 -right-1 bg-sg-orange text-[#2a1300] text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-sg-navy-2">24h</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="m-0 text-[17px] font-extrabold leading-tight truncate flex items-center gap-1.5">
            <span className="truncate">{worker.name}</span>
            {worker.verified && <ShieldCheck className="w-4 h-4 text-[#6aa8ff] shrink-0" aria-label="Verificado" />}
          </h3>
          <p className="m-0 mt-0.5 text-sm font-bold text-[#6aa8ff] truncate">{worker.tradeTitle}</p>
          <p className="m-0 mt-1 text-xs text-[#a9b8db] flex items-center gap-1 truncate">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
            <b className="text-white">{worker.rating.toFixed(1)}</b> ({worker.reviewCount})
            <MapPin className="w-3.5 h-3.5 ml-1.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{worker.location}</span>
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir"
            className="w-10 h-10 rounded-full border border-white/20 inline-flex items-center justify-center hover:bg-white/10 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-sg-green" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
          </button>
          {copied && (
            <span className="absolute top-11 right-0 bg-white text-sg-navy text-[11px] font-extrabold px-2 py-1 rounded-lg whitespace-nowrap z-20">Enlace copiado</span>
          )}
        </div>
      </div>

      {worker.matricula && (
        <p className="m-0 text-xs text-[#c3cfea] flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          Matrícula {worker.matricula}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-sg-navy px-3 py-2">
          <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#a9b8db]">Por hora</span>
          <span className="block text-base font-black">${worker.hourlyRate.toLocaleString('es-AR')}</span>
        </div>
        <div className="rounded-xl bg-sg-navy px-3 py-2">
          <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#a9b8db]">Visita</span>
          <span className="block text-base font-black">${worker.visitFee.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {worker.ferreteroPartner && (
        <p className="m-0 text-xs text-[#d6def0] flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#ffb547] shrink-0" aria-hidden="true" />
          Socio <b className="text-white">Ferretería Bruzzone</b>: descuento en insumos
        </p>
      )}

      {worker.bio && <p className="m-0 text-sm text-[#c3cfea] line-clamp-2 leading-snug">{worker.bio}</p>}

      <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 rounded-xl bg-sg-blue hover:brightness-110 text-white font-extrabold text-sm inline-flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
        </a>
        <button
          type="button"
          onClick={() => onOpenBooking(worker)}
          className="h-11 rounded-xl border border-white/25 hover:bg-white/10 text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" /> Agendar
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <button type="button" onClick={() => onSelectWorker(worker)} className="font-extrabold text-[#6aa8ff] hover:text-white inline-flex items-center gap-1 cursor-pointer">
          Ver perfil y opiniones <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="flex gap-3">
          {onOpenReviewModal && (
            <button type="button" onClick={() => onOpenReviewModal(worker)} className="font-semibold text-[#a9b8db] hover:text-white inline-flex items-center gap-1 cursor-pointer">
              <MessageSquare className="w-4 h-4" aria-hidden="true" /> Calificar
            </button>
          )}
          {onOpenCouponModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCouponModal(worker);
              }}
              className="font-semibold text-[#a9b8db] hover:text-white inline-flex items-center gap-1 cursor-pointer"
              title="Entregar cupón de descuento al cliente"
            >
              <Ticket className="w-4 h-4" aria-hidden="true" /> Cupón
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
