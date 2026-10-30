import React, { useState } from 'react';
import {
  X,
  Ticket,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Calendar,
  Store,
  Sparkles,
  QrCode,
  ShieldCheck,
  Send,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Worker, SystemCoupon, IssuedVoucher, Shop } from '../types';

interface WorkerCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  coupons: SystemCoupon[];
  onIssueVoucher: (voucher: IssuedVoucher) => Promise<void>;
  showToast: (msg: string) => void;
  defaultClientName?: string;
  defaultClientPhone?: string;
}

export const WorkerCouponModal: React.FC<WorkerCouponModalProps> = ({
  isOpen,
  onClose,
  worker,
  coupons = [],
  onIssueVoucher,
  showToast,
  defaultClientName = '',
  defaultClientPhone = '',
}) => {
  const activeCoupons = coupons.filter((c) => c.active);

  const [selectedCouponId, setSelectedCouponId] = useState<string>(
    activeCoupons[0]?.id || ''
  );
  const [clientName, setClientName] = useState(defaultClientName);
  const [clientPhone, setClientPhone] = useState(defaultClientPhone);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<IssuedVoucher | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedCoupon = activeCoupons.find((c) => c.id === selectedCouponId) || activeCoupons[0];

  const handleGenerateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showToast('Por favor escribe el nombre del cliente');
      return;
    }
    if (!selectedCoupon) {
      showToast('No hay un cupón activo seleccionado');
      return;
    }

    try {
      setIsGenerating(true);
      const cleanClient = clientName.trim();
      const clientSlug = cleanClient
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 8)
        .toUpperCase();

      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prefix = selectedCoupon.codePrefix?.toUpperCase() || 'SERVIGO';
      const voucherCode = `${prefix}-${randomDigits}-${clientSlug}`;

      const issueDate = new Date();
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + (selectedCoupon.validDays || 30));

      const discountText =
        selectedCoupon.discountType === 'percentage'
          ? `${selectedCoupon.discountValue}% OFF`
          : `$${Number(selectedCoupon.discountValue).toLocaleString('es-AR')} Descuento`;

      const newVoucher: IssuedVoucher = {
        id: `voucher-${Date.now()}`,
        voucherCode,
        couponId: selectedCoupon.id,
        couponTitle: selectedCoupon.title,
        discountText,
        targetShopName: selectedCoupon.targetShopName || 'Ferretería Bruzzone / Comercios Adheridos',
        workerId: worker.id,
        workerName: worker.name,
        workerTrade: worker.tradeTitle || worker.trade,
        clientName: cleanClient,
        clientPhone: clientPhone.trim() || undefined,
        issuedAt: issueDate.toISOString(),
        expiresAt: expireDate.toISOString(),
        status: 'active',
      };

      await onIssueVoucher(newVoucher);
      setGeneratedVoucher(newVoucher);
      showToast(`¡Cupón oficial emitido para ${cleanClient}!`);
    } catch (err) {
      console.error(err);
      showToast('Error al generar el cupón');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVoucherText = () => {
    if (!generatedVoucher) return;
    const text = `🎟️ *CUPÓN OFICIAL DE BENEFICIO - SERVIGO*
    
Hola ${generatedVoucher.clientName}, gracias por haber elegido mis servicios de ${generatedVoucher.workerTrade} (${generatedVoucher.workerName}).
    
🎁 *Beneficio:* ${generatedVoucher.discountText}
🏬 *Válido en:* ${generatedVoucher.targetShopName}
🔑 *Código de Cupón:* ${generatedVoucher.voucherCode}
📅 *Válido hasta:* ${new Date(generatedVoucher.expiresAt).toLocaleDateString('es-AR')}

Presenta este código en caja al momento de pagar. ¡Que lo disfrutes!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('¡Texto y código del cupón copiados al portapapeles!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!generatedVoucher) return;
    const text = `🎟️ *CUPÓN OFICIAL DE BENEFICIO - SERVIGO*

¡Hola ${generatedVoucher.clientName}! Muchas gracias por haber confiado en mi trabajo de ${generatedVoucher.workerTrade}.

Te entrego este Cupón Oficial con beneficio exclusivo para vos:
🎁 *Descuento:* ${generatedVoucher.discountText}
🏬 *Comercio:* ${generatedVoucher.targetShopName}
🔑 *Código Único:* ${generatedVoucher.voucherCode}
📅 *Vence el:* ${new Date(generatedVoucher.expiresAt).toLocaleDateString('es-AR')}

Solo debes mostrar este código en caja al momento de abonar. ¡Muchas gracias por elegirme!
_${generatedVoucher.workerName} - Red ServiGo_`;

    let url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (generatedVoucher.clientPhone) {
      const cleanPhone = generatedVoucher.clientPhone.replace(/\D/g, '');
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-slate-800 shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center text-xl shrink-0">
              🎟️
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Entregar Cupón al Cliente
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Profesional: <span className="font-bold text-slate-700">{worker.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeCoupons.length === 0 ? (
          <div className="p-6 text-center space-y-3 bg-amber-50 rounded-2xl border border-amber-200">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-amber-900">No hay cupones activos disponibles</h4>
            <p className="text-xs text-amber-700">
              El administrador del sistema aún no ha habilitado cupones de descuento. Pide al administrador que cree uno en el Panel de Control.
            </p>
          </div>
        ) : !generatedVoucher ? (
          /* FORM TO GENERATE VOUCHER */
          <form onSubmit={handleGenerateCoupon} className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5">
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Premio por contratar a {worker.name}</span>
              </p>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Entrega un cupón oficial de descuento para que tu cliente lo disfrute en la <b>Ferretería Bruzzone</b> o en los <b>comercios y talleres adheridos</b> de la zona.
              </p>
            </div>

            {/* Select Coupon Template */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Seleccionar Beneficio / Cupón *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {activeCoupons.map((c) => {
                  const isSelected = selectedCouponId === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setSelectedCouponId(c.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-400/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{c.title}</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-amber-300">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span>{c.targetShopName}</span>
                        </p>
                        {c.minSpend ? (
                          <p className="text-[10px] text-slate-400 font-medium">
                            Compra mínima: ${c.minSpend.toLocaleString('es-AR')}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Nombre del Cliente Beneficiario *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Marcelo Rossi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* Client Phone (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                WhatsApp del Cliente (opcional para enviárselo directo)
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej: 5493584123456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isGenerating || !clientName.trim()}
                className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-orange-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{isGenerating ? 'Generando Cupón...' : 'Generar y Entregar Cupón'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* VOUCHER GENERATED CARD */
          <div className="space-y-4 animate-fadeIn">
            {/* Visual Voucher Ticket */}
            <div className="border-2 border-dashed border-amber-400 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-inner">
              {/* Top Notch Badge */}
              <div className="flex items-center justify-between">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  Voucher Oficial ServiGo
                </span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Vence: {new Date(generatedVoucher.expiresAt).toLocaleDateString('es-AR')}
                </span>
              </div>

              {/* Discount Amount */}
              <div className="text-center py-2 space-y-1">
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-amber-700">
                  Beneficio Otorgado
                </p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {generatedVoucher.discountText}
                </h2>
                <p className="text-xs font-bold text-slate-700">
                  {generatedVoucher.targetShopName}
                </p>
              </div>

              {/* Divider line with circles */}
              <div className="relative border-t-2 border-dashed border-amber-300 my-1">
                <div className="absolute -left-7 -top-2.5 w-5 h-5 bg-white rounded-full"></div>
                <div className="absolute -right-7 -top-2.5 w-5 h-5 bg-white rounded-full"></div>
              </div>

              {/* Code & Details */}
              <div className="bg-white/80 backdrop-blur-xs border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Código Único de Canje
                </p>
                <div className="text-lg font-mono font-black text-slate-900 tracking-widest bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200 inline-block">
                  {generatedVoucher.voucherCode}
                </div>
                <div className="grid grid-cols-2 gap-2 text-left pt-1 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cliente:</span>
                    <span className="font-bold text-slate-800 truncate block">{generatedVoucher.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Entregado por:</span>
                    <span className="font-bold text-slate-800 truncate block">{generatedVoucher.workerName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Cupón al Cliente por WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyVoucherText}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Texto y Código'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGeneratedVoucher(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Emitir Otro Cupón</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
