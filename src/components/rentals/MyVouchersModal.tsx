import React, { useEffect, useState } from 'react';
import { X, Ticket, Copy } from 'lucide-react';
import { IssuedVoucher } from '../../types';
import { subscribeMyVouchers } from '../../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString('es-AR') : '—');

export const MyVouchersModal: React.FC<Props> = ({ isOpen, onClose, showToast }) => {
  const [vouchers, setVouchers] = useState<IssuedVoucher[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    return subscribeMyVouchers(setVouchers);
  }, [isOpen]);

  if (!isOpen) return null;

  const sorted = [...vouchers].sort((a, b) => String(b.issuedAt).localeCompare(String(a.issuedAt)));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-orange-600" /> Mis cupones
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Todavía no tenés cupones. Cada alquiler que termina bien te da un descuento en Ferretería Bruzzone.
            </p>
          ) : (
            sorted.map((v) => {
              const expired = v.expiresAt && new Date(v.expiresAt) < new Date();
              const usable = v.status === 'active' && !expired;
              return (
                <div
                  key={v.id}
                  className={`p-4 rounded-2xl border-2 border-dashed ${usable ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50 opacity-70'}`}
                >
                  <p className="text-xs font-black text-orange-700 uppercase">{v.targetShopName}</p>
                  <p className="text-xl font-black text-slate-900">{v.discountText}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-lg font-black tracking-wider text-slate-900">{v.voucherCode}</span>
                    {usable && (
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(v.voucherCode).then(
                            () => showToast('Código copiado'),
                            () => showToast(v.voucherCode)
                          );
                        }}
                        className="p-2 rounded-xl bg-white border border-orange-200 text-orange-700"
                        aria-label="Copiar código"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {v.status === 'redeemed' ? `Usado el ${fmtDate(v.redeemedAt)}` : expired ? `Venció el ${fmtDate(v.expiresAt)}` : `Vence el ${fmtDate(v.expiresAt)} · un solo uso`}
                  </p>
                </div>
              );
            })
          )}
          <p className="text-[11px] text-slate-400 text-center">Mostrá el código en el mostrador antes de pagar.</p>
        </div>
      </div>
    </div>
  );
};
