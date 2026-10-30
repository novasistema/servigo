import React, { useState } from 'react';
import {
  X,
  Ticket,
  Search,
  CheckCircle2,
  AlertTriangle,
  Store,
  User,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { IssuedVoucher, Shop } from '../types';

interface ValidateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: IssuedVoucher[];
  onRedeemVoucher: (voucherCode: string, shopName: string) => Promise<void>;
  shops: Shop[];
  showToast: (msg: string) => void;
}

export const ValidateCouponModal: React.FC<ValidateCouponModalProps> = ({
  isOpen,
  onClose,
  vouchers = [],
  onRedeemVoucher,
  shops = [],
  showToast,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [searchedVoucher, setSearchedVoucher] = useState<IssuedVoucher | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [selectedShop, setSelectedShop] = useState('Ferretería Bruzzone (Sponsor)');
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInput.trim().toUpperCase();
    if (!clean) return;

    setSearchAttempted(true);
    const found = vouchers.find(
      (v) => v.voucherCode.trim().toUpperCase() === clean
    );
    setSearchedVoucher(found || null);
  };

  const handleRedeem = async () => {
    if (!searchedVoucher) return;
    try {
      setIsRedeeming(true);
      await onRedeemVoucher(searchedVoucher.voucherCode, selectedShop);
      setSearchedVoucher({
        ...searchedVoucher,
        status: 'redeemed',
        redeemedAt: new Date().toISOString(),
        redeemedByShop: selectedShop,
      });
      showToast(`¡Cupón ${searchedVoucher.voucherCode} canjeado con éxito!`);
    } catch (err) {
      console.error(err);
      showToast('Error al canjear el cupón');
    } finally {
      setIsRedeeming(false);
    }
  };

  const isExpired = searchedVoucher && new Date(searchedVoucher.expiresAt).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-slate-800 shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center text-xl shrink-0">
              🎫
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Validar y Canjear Cupón de Descuento
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Para clientes, cajeros de Ferretería Bruzzone y comercios adheridos
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

        {/* Search input form */}
        <form onSubmit={handleSearch} className="space-y-3 mb-4">
          <label className="block text-xs font-bold text-slate-700">
            Ingresa o pega el Código del Cupón
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Ticket className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.toUpperCase());
                  setSearchAttempted(false);
                }}
                placeholder="Ej: BRUZZONE15-8492-JUAN"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={!codeInput.trim()}
              className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/20 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Verificar</span>
            </button>
          </div>
        </form>

        {/* Results */}
        {searchAttempted && !searchedVoucher && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2 animate-fadeIn">
            <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-black text-rose-900">
              Código no encontrado
            </p>
            <p className="text-[11px] text-rose-700">
              Verifica haber escrito correctamente el código del voucher que te entregó el profesional de ServiGo.
            </p>
          </div>
        )}

        {searchedVoucher && (
          <div className="space-y-4 animate-fadeIn">
            {/* Status card */}
            {searchedVoucher.status === 'redeemed' ? (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold text-amber-900">Cupón Ya Canjeado</p>
                  <p className="text-amber-800 text-[11px]">
                    Este voucher ya fue aplicado el {new Date(searchedVoucher.redeemedAt || '').toLocaleDateString('es-AR')} en {searchedVoucher.redeemedByShop || 'comercio adherido'}.
                  </p>
                </div>
              </div>
            ) : isExpired ? (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold text-rose-900">Cupón Vencido</p>
                  <p className="text-rose-800 text-[11px]">
                    La fecha límite para canjear este cupón expiró el {new Date(searchedVoucher.expiresAt).toLocaleDateString('es-AR')}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold text-emerald-900">¡Cupón Oficial Válido y Activo!</p>
                  <p className="text-emerald-800 text-[11px]">
                    Listo para ser aplicado en caja en los comercios adheridos de ServiGo.
                  </p>
                </div>
              </div>
            )}

            {/* Voucher Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {searchedVoucher.voucherCode}
                </span>
                <span className="bg-orange-500 text-white font-black text-xs px-2 py-0.5 rounded-lg">
                  {searchedVoucher.discountText}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Cliente:</span>
                  <span className="font-extrabold text-slate-800">{searchedVoucher.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Entregado por:</span>
                  <span className="font-extrabold text-slate-800">{searchedVoucher.workerName}</span>
                  <span className="text-[10px] text-orange-600 block">{searchedVoucher.workerTrade}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] font-bold">Comercio habilitado:</span>
                  <span className="font-bold text-slate-800">{searchedVoucher.targetShopName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Emitido:</span>
                  <span className="text-slate-700">{new Date(searchedVoucher.issuedAt).toLocaleDateString('es-AR')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Válido hasta:</span>
                  <span className="text-slate-700">{new Date(searchedVoucher.expiresAt).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Merchant Redemption Action */}
            {searchedVoucher.status === 'active' && !isExpired && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  ¿En qué comercio se canjea este cupón?
                </label>
                <select
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Ferretería Bruzzone (Sponsor Oficial)">🏬 Ferretería Bruzzone (Sponsor Oficial)</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.name}>
                      🏪 {s.name} ({s.categoryTitle || s.category})
                    </option>
                  ))}
                  <option value="Otro Comercio Adherido">🏢 Otro Comercio Adherido</option>
                </select>

                <button
                  type="button"
                  disabled={isRedeeming}
                  onClick={handleRedeem}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  {isRedeeming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Canjear Cupón y Aplicar Descuento</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
