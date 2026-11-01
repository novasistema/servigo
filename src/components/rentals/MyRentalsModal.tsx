import React, { useState } from 'react';
import { X, MessageSquare, ClipboardCheck } from 'lucide-react';
import { RentalBooking } from '../../types';
import { RentalActaModal, RENTAL_STATUS_LABEL } from './RentalActaModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookings: RentalBooking[];
  uid?: string;
  showToast: (msg: string) => void;
}

const money = (n: number) => `$${(Number(n) || 0).toLocaleString('es-AR')}`;

export const MyRentalsModal: React.FC<Props> = ({ isOpen, onClose, bookings, uid, showToast }) => {
  const [actaFor, setActaFor] = useState<{ id: string; stage: 'entrega' | 'devolucion' } | null>(null);
  if (!isOpen) return null;

  const mine = bookings
    .filter((b) => uid && b.clientUid === uid)
    .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));
  const actaBooking = actaFor ? mine.find((b) => b.id === actaFor.id) || null : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-orange-600" /> Mis alquileres
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {mine.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Todavía no alquilaste nada. Cuando reserves, vas a ver acá el estado y las actas.</p>
          ) : (
            mine.map((b) => {
              const needsSign = b.status === 'entrega_pendiente' && b.entrega && !b.entrega.clientSignedAt;
              return (
                <div key={b.id} className={`p-4 rounded-2xl border space-y-2 ${needsSign ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{b.rentalItemTitle}</p>
                      <p className="text-xs text-slate-500">
                        {b.startDate} al {b.endDate} · Dueño: {b.ownerName}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-black px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                      {RENTAL_STATUS_LABEL[b.status] || b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Alquiler {money(b.rentalSubtotal)} · Garantía {money(b.depositAmount)}
                    {b.status === 'devuelto' && typeof b.depositRefunded === 'number' && <> · Reintegrado {money(b.depositRefunded)}</>}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {needsSign && (
                      <button onClick={() => setActaFor({ id: b.id, stage: 'entrega' })} className="px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-black">
                        ✍️ Revisar y firmar la entrega
                      </button>
                    )}
                    {b.entrega && !needsSign && (
                      <button onClick={() => setActaFor({ id: b.id, stage: 'entrega' })} className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold">
                        Acta de entrega
                      </button>
                    )}
                    {b.status === 'en_curso' && (
                      <button onClick={() => setActaFor({ id: b.id, stage: 'devolucion' })} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">
                        📋 Registrar devolución
                      </button>
                    )}
                    {b.devolucion && (
                      <button onClick={() => setActaFor({ id: b.id, stage: 'devolucion' })} className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold">
                        Acta de devolución{b.devolucion.clientSignedAt ? '' : ' (firmar)'}
                      </button>
                    )}
                    {b.ownerWhatsapp && b.paymentStatus === 'pagado' && b.status !== 'devuelto' && (
                      <a
                        href={`https://wa.me/${String(b.ownerWhatsapp).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-700 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp del dueño
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <RentalActaModal
        booking={actaBooking}
        stage={actaFor?.stage || 'entrega'}
        role="client"
        isOpen={Boolean(actaFor && actaBooking)}
        onClose={() => setActaFor(null)}
        showToast={showToast}
      />
    </div>
  );
};
