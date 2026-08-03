import React from 'react';
import { Calendar, Clock, MapPin, MessageCircle, Star, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';
import { BookingRequest, Worker } from '../types';

interface BookingHistoryListProps {
  bookings: BookingRequest[];
  workers: Worker[];
  onOpenReviewModal: (worker: Worker) => void;
  onNavigateToSearch: () => void;
}

export const BookingHistoryList: React.FC<BookingHistoryListProps> = ({
  bookings,
  workers,
  onOpenReviewModal,
  onNavigateToSearch,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
            Gestión de Agenda
          </span>
          <h2 className="text-xl font-black text-slate-900">Mis Solicitudes de Servicio</h2>
          <p className="text-xs text-slate-500 font-medium">
            Historial de turnos y presupuestos coordinados con los trabajadores de ServiGo.
          </p>
        </div>

        <button
          onClick={onNavigateToSearch}
          className="py-2.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
        >
          + Solicitar Nuevo Turno
        </button>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[32px] p-10 text-center space-y-3 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Aún no tienes solicitudes registradas
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Explora el catálogo de trabajadores calificados para gas, plomería, electricidad o cerrajería y solicita tu primer presupuesto.
          </p>
          <button
            onClick={onNavigateToSearch}
            className="mt-2 py-2.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span>Buscar Trabajador</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((book) => {
            const workerObj = workers.find((w) => w.id === book.workerId);

            return (
              <div
                key={book.id}
                className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 hover:border-orange-500 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    {workerObj ? (
                      <img
                        src={workerObj.avatar}
                        alt={book.workerName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500">
                        W
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{book.workerName}</h4>
                      <p className="text-xs font-bold text-orange-600">{book.workerTrade}</p>
                    </div>
                  </div>

                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full w-fit flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enviado por WhatsApp</span>
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Fecha solicitada:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      {book.date}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Horario:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {book.timeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Dirección:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      {book.clientAddress}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                  <strong className="text-slate-900">Detalle del trabajo:</strong> {book.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {workerObj && (
                    <button
                      onClick={() => onOpenReviewModal(workerObj)}
                      className="py-2 px-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 flex items-center gap-1.5 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Calificar Servicio</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
