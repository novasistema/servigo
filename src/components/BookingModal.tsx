import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, MessageCircle, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Worker, BookingRequest } from '../types';

interface BookingModalProps {
  worker: Worker | null;
  onClose: () => void;
  onSubmitBooking: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ worker, onClose, onSubmitBooking }) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 - 12:00 (Mañana)');
  const [urgency, setUrgency] = useState<'normal' | 'alta' | 'urgencia_24h'>('normal');
  const [description, setDescription] = useState('');

  if (!worker) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !clientAddress.trim() || !description.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const newBooking: BookingRequest = {
      id: `book-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerPhone: worker.phone,
      workerTrade: worker.tradeTitle,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      date,
      timeSlot,
      description: description.trim(),
      urgency,
      status: 'pendiente',
      createdAt: new Date().toLocaleDateString('es-AR'),
    };

    onSubmitBooking(newBooking);

    // Formatted WhatsApp message payload
    const textMsg = `Hola ${worker.name}, te envío una solicitud de turno desde ServiGo (auspiciada por Ferretería Bruzzone):

👤 *Cliente:* ${clientName}
📱 *Teléfono:* ${clientPhone}
📍 *Dirección:* ${clientAddress}
📅 *Fecha solicitada:* ${date}
⏰ *Franja horaria:* ${timeSlot}
🚨 *Urgencia:* ${urgency === 'urgencia_24h' ? 'Urgencia 24hs' : urgency === 'alta' ? 'Alta' : 'Normal'}
🛠️ *Detalle del trabajo:* ${description}

¿Tendrías disponibilidad para confirmarme? ¡Muchas gracias!`;

    const waUrl = `https://wa.me/${worker.whatsapp}?text=${encodeURIComponent(textMsg)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-slate-800 relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                Solicitar Turno / Presupuesto
              </span>
              <h3 className="text-base font-black text-slate-900">{worker.name}</h3>
              <p className="text-xs font-bold text-slate-500">{worker.tradeTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tu Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Gustavo Fernández"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono de Contacto *
              </label>
              <input
                type="text"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej. 11 3456-7890"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dirección y Barrio/Localidad *
            </label>
            <input
              type="text"
              required
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Ej. Belgrano 1450, San Isidro"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha Deseada *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Franja Horaria
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500"
              >
                <option value="08:00 - 11:00 (Primera mañana)">08:00 - 11:00 (Primera mañana)</option>
                <option value="11:00 - 14:00 (Mediodía)">11:00 - 14:00 (Mediodía)</option>
                <option value="14:00 - 18:00 (Tarde)">14:00 - 18:00 (Tarde)</option>
                <option value="Servicio de Urgencia Inmediata">🚨 Urgencia Inmediata</option>
              </select>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nivel de Urgencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  urgency === 'normal'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setUrgency('alta')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  urgency === 'alta'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Alta (24h)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgencia_24h')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  urgency === 'urgencia_24h'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🚨 Guardia 24hs
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción de la Falla o Trabajo *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. El calefón no enciende el piloto y gotea agua por la base. Necesito revisión urgente..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Ferretería Bruzzone Material Note */}
          <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl text-xs text-orange-900 flex items-center gap-2 font-medium">
            <span className="text-orange-600 font-bold text-sm">💡</span>
            <span>
              Recuerda comprar tus materiales en <strong>Ferretería Bruzzone</strong> para acceder al 10% de descuento en la mano de obra.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Enviar Solicitud por WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
