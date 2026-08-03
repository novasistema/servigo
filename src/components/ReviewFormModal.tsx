import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { Worker, Review } from '../types';

interface ReviewFormModalProps {
  worker: Worker | null;
  onClose: () => void;
  onSubmitReview: (workerId: string, review: Review) => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  worker,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clientName, setClientName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Puntual',
    'Excelente atención',
  ]);

  if (!worker) return null;

  const availableTags = [
    'Puntual',
    'Limpio',
    'Precio justo',
    'Matriculado',
    'Excelente atención',
    'Urgencia 24h',
    'Conocimiento técnico',
    'Garantía de trabajo',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) {
      alert('Por favor ingresa tu nombre y un comentario sobre el servicio.');
      return;
    }

    const newReview: Review = {
      id: `r-custom-${Date.now()}`,
      clientName: clientName.trim(),
      rating,
      date: 'Hoy',
      serviceType: serviceType.trim() || worker.tradeTitle,
      comment: comment.trim(),
      tags: selectedTags,
    };

    onSubmitReview(worker.id, newReview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-slate-800 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
              Calificar Servicio
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Opinión para {worker.name}
            </h3>
            <p className="text-xs font-bold text-slate-500">{worker.tradeTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div className="text-center space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">
              ¿Cómo calificarías la calidad del servicio recibido?
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isFilled = starNum <= (hoverRating || rating);
                return (
                  <button
                    key={starNum}
                    type="button"
                    onMouseEnter={() => setHoverRating(starNum)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starNum)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-orange-600 block">
              {rating === 5 && '🌟 Excelente servicio'}
              {rating === 4 && '👍 Muy buen servicio'}
              {rating === 3 && '😐 Servicio regular'}
              {rating === 2 && '👎 Deficiente'}
              {rating === 1 && '⚠️ Mala experiencia'}
            </span>
          </div>

          {/* Client Name & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tu Nombre *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. María Elena G."
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trabajo o Reparación Realizada
              </label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Ej. Instalación de canilla"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Attributes Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Etiquetas Destacadas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tu Opinión o Comentario *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe detalles sobre la puntualidad, prolijidad, trato y precio del profesional..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Publicar Calificación</span>
          </button>
        </form>
      </div>
    </div>
  );
};
