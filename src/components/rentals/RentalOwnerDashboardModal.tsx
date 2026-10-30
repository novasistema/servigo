import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  AlertCircle,
  CreditCard,
  Building2,
  Calendar,
  UserCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
  Scale,
  ShieldAlert,
  Link as LinkIcon
} from 'lucide-react';
import { RentalItem, RentalBooking, RentalOwner, RentalPayoutRequest, DamageReport } from '../../types';
import { RentalAgreementModal } from './RentalAgreementModal';
import { useAuth } from '../../context/AuthContext';
import { subscribeRentalPlatformFee } from '../../lib/firebase';

interface RentalOwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RentalItem[];
  bookings: RentalBooking[];
  owners: RentalOwner[];
  currentOwnerName?: string;
  onRequestPayout: (payout: RentalPayoutRequest) => Promise<void>;
  onConfirmItemReturned: (bookingId: string) => Promise<void>;
  onReportDamage?: (bookingId: string, damageReport: DamageReport) => Promise<void>;
  showToast: (msg: string) => void;
}

export const RentalOwnerDashboardModal: React.FC<RentalOwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  items,
  bookings,
  owners,
  currentOwnerName,
  onRequestPayout,
  onConfirmItemReturned,
  onReportDamage,
  showToast,
}) => {
  if (!isOpen) return null;

  const { user } = useAuth();
  const [platformFeeRate, setPlatformFeeRate] = useState<number>(0.05);
  const [isConnectingMp, setIsConnectingMp] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeRentalPlatformFee((rate) => {
      setPlatformFeeRate(rate);
    });
    return () => unsub();
  }, []);

  // Selected owner filter (if multiple, or current owner)
  const [selectedOwnerDniOrName, setSelectedOwnerDniOrName] = useState<string>(() => {
    if (owners.length > 0) return owners[0].name;
    return items[0]?.ownerName || '';
  });

  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [cbuOrAlias, setCbuOrAlias] = useState<string>('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Modals for contract viewing and damage claims
  const [bookingForContract, setBookingForContract] = useState<RentalBooking | null>(null);
  const [bookingForDamage, setBookingForDamage] = useState<RentalBooking | null>(null);

  // Damage report form states
  const [damageType, setDamageType] = useState<'rotura_parcial' | 'mal_uso' | 'falta_accesorios' | 'no_devuelto_perdida'>('mal_uso');
  const [damageEstimatedCost, setDamageEstimatedCost] = useState<string>('');
  const [damageDescription, setDamageDescription] = useState<string>('');
  const [isSubmittingDamage, setIsSubmittingDamage] = useState<boolean>(false);

  // Find owner object or simulate wallet from their active rentals
  const matchedOwner = owners.find(
    (o) => o.name.toLowerCase() === selectedOwnerDniOrName.toLowerCase()
  );

  const ownerItems = items.filter(
    (item) => item.ownerName.toLowerCase() === selectedOwnerDniOrName.toLowerCase()
  );

  const ownerBookings = bookings.filter(
    (b) => b.ownerName.toLowerCase() === selectedOwnerDniOrName.toLowerCase()
  );

  // Compute live wallet finances from bookings
  // 1. Available: completed bookings (devuelto) + any retained deposit from damages!
  // 2. Pending in escrow: confirmed or in-progress bookings
  const computedAvailable = ownerBookings
    .filter((b) => b.status === 'devuelto' || b.paymentStatus === 'liquidado_a_dueno')
    .reduce((sum, b) => {
      const rate = b.platformFeeRate || platformFeeRate || 0.05;
      const net = b.ownerNetAmount || b.rentalSubtotal * (1 - rate) || b.totalPrice * (1 - rate);
      const retainedDeposit = b.depositStatus === 'retenido_por_dano' ? (b.damageReport?.depositRetained || b.depositAmount || 0) : 0;
      return sum + net + retainedDeposit;
    }, 0);

  const computedPending = ownerBookings
    .filter((b) => b.status === 'confirmado' || b.status === 'en_curso' || b.status === 'pendiente')
    .reduce((sum, b) => {
      const rate = b.platformFeeRate || platformFeeRate || 0.05;
      return sum + (b.ownerNetAmount || b.rentalSubtotal * (1 - rate) || b.totalPrice * (1 - rate));
    }, 0);

  const totalEarned = computedAvailable + computedPending;

  const handleConnectMercadoPago = async () => {
    if (!user) {
      showToast('Inicia sesión para vincular tu cuenta de Mercado Pago');
      return;
    }
    setIsConnectingMp(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/mp/connect', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Error al obtener URL de Mercado Pago');
      }
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error al conectar con Mercado Pago');
    } finally {
      setIsConnectingMp(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      showToast('Ingresa un monto válido para retirar');
      return;
    }

    if (amount > computedAvailable && computedAvailable > 0) {
      showToast(`El monto máximo disponible para retirar es $${computedAvailable.toLocaleString('es-AR')}`);
      return;
    }

    const targetCbu = cbuOrAlias.trim() || matchedOwner?.payoutInfo.cbuOrAlias || 'Alias registrado';
    if (!targetCbu) {
      showToast('Por favor indica tu CBU o Alias de Mercado Pago');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const payout: RentalPayoutRequest = {
        id: `payout-${Date.now()}`,
        ownerId: matchedOwner?.id || `owner-${Date.now()}`,
        ownerName: selectedOwnerDniOrName,
        ownerPhone: matchedOwner?.phone || '',
        cbuOrAlias: targetCbu,
        bankOrMp: matchedOwner?.payoutInfo.bankOrMp || 'Mercado Pago',
        amount,
        status: 'pendiente',
        requestedAt: new Date().toISOString(),
      };

      await onRequestPayout(payout);
      showToast('¡Solicitud de retiro enviada! La administración transferirá a tu Alias/CBU en un plazo de 24hs.');
      setPayoutAmount('');
    } catch (err) {
      console.error(err);
      showToast('Error al solicitar retiro');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                PANEL DEL LOCADOR • BILLETERA DIGITAL
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Billetera & Ganancias de Alquileres
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 font-sans">
          {/* Owner Selector (if multiple owners in app) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orange-600" />
              <label className="text-xs font-bold text-slate-700">
                Seleccionar Propietario / Cuenta:
              </label>
            </div>
            <select
              value={selectedOwnerDniOrName}
              onChange={(e) => setSelectedOwnerDniOrName(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-orange-500 focus:outline-hidden"
            >
              {Array.from(new Set([...owners.map((o) => o.name), ...items.map((i) => i.ownerName)])).map((name) => (
                <option key={name} value={name}>
                  👤 {name}
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Financial Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Saldo Disponible */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">
                Saldo Disponible
              </span>
              <span className="text-2xl sm:text-3xl font-black block">
                ${computedAvailable.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-emerald-200 block">
                Listo para retirar a tu CBU/Alias
              </span>
            </div>

            {/* 2. En Custodia */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider block">
                En Custodia (Activos)
              </span>
              <span className="text-2xl sm:text-3xl font-black block">
                ${computedPending.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-amber-100 block">
                Se libera al devolver el bien
              </span>
            </div>

            {/* 3. Total Histórico */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Acumulado
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block">
                ${totalEarned.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Comisión ServiGo ({Math.round(platformFeeRate * 100)}%) ya deducida
              </span>
            </div>
          </div>

          {/* Mercado Pago Account Linking Banner */}
          <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-xs sm:text-sm flex items-center gap-1.5">
                  💳 Mercado Pago Marketplace
                </span>
                {matchedOwner?.mpConnected ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ✓ Vinculado (ID: {matchedOwner.mpUserId})
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    No vinculado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {matchedOwner?.mpConnected
                  ? 'Tu cuenta está conectada para recibir cobros directos de inquilinos con retención automática de comisiones.'
                  : 'Vincula tu cuenta de Mercado Pago para que las reservas de tus artículos se cobren con acreditación a tu nombre.'}
              </p>
            </div>

            <button
              type="button"
              disabled={isConnectingMp}
              onClick={handleConnectMercadoPago}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{isConnectingMp ? 'Conectando...' : matchedOwner?.mpConnected ? 'Re-vincular Mercado Pago' : 'Vincular con Mercado Pago'}</span>
            </button>
          </div>

          {/* MercadoLibre-style Split Explanation */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2 text-xs text-orange-950">
            <div className="flex items-center gap-2 font-bold text-orange-900">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>¿Cómo funciona el cobro y la comisión al estilo MercadoLibre?</span>
            </div>
            <p className="leading-relaxed text-orange-900/90 text-[11px]">
              1. El cliente paga el alquiler y la garantía mediante <strong>Mercado Pago</strong>.
              <br />
              2. ServiGo retiene automáticamente su <strong>comisión de plataforma ({Math.round(platformFeeRate * 100)}%)</strong> configurada.
              <br />
              3. El <strong>{Math.round((1 - platformFeeRate) * 100)}% restante</strong> queda acreditado a tu favor. Una vez devuelto el artículo conforme, los fondos quedan liberados en tu billetera.
            </p>
          </div>

          {/* Withdrawal Request Form */}
          <form onSubmit={handleRequestWithdrawal} className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" />
              Solicitar Transferencia de Fondos a mi Cuenta
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                  Monto a retirar (ARS):
                </label>
                <input
                  type="number"
                  placeholder={`Ej: ${computedAvailable > 0 ? computedAvailable : 15000}`}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs font-bold text-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                  CBU / CVU o Alias de Mercado Pago:
                </label>
                <input
                  type="text"
                  placeholder={matchedOwner?.payoutInfo?.cbuOrAlias || 'tu.alias.mp o 00000031...'}
                  value={cbuOrAlias}
                  onChange={(e) => setCbuOrAlias(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmittingPayout}
                className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmittingPayout ? 'Procesando...' : 'Pedir Transferencia'}</span>
              </button>
            </div>
          </form>

          {/* Owner's Published Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-orange-600" />
                <span>Mis Artículos Publicados ({ownerItems.length})</span>
              </h3>
            </div>

            {ownerItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tienes artículos publicados aún.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ownerItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-center">
                    <img src={item.images[0]} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-bold text-orange-600">${item.dailyPrice.toLocaleString('es-AR')}/día</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">Neto: ${Math.round(item.dailyPrice * 0.90).toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Bookings for this Owner */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Alquileres & Solicitudes de Clientes ({ownerBookings.length})</span>
            </h3>

            {ownerBookings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tienes alquileres registrados todavía.</p>
            ) : (
              <div className="space-y-3">
                {ownerBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{b.rentalItemTitle}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            b.status === 'devuelto'
                              ? b.depositStatus === 'retenido_por_dano'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {b.depositStatus === 'retenido_por_dano' ? 'Devuelto c/ Daños' : b.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          <span>Inquilino: <strong>{b.clientName}</strong> ({b.clientPhone})</span>
                          <span className="mx-1">•</span>
                          <span>{b.startDate} al {b.endDate} ({b.totalDays} días)</span>
                        </div>
                      </div>

                      {/* Contract check badge */}
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Contrato Vinculante {b.clientDni ? `(DNI ${b.clientDni})` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingForContract(b)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-orange-600" />
                          <span>Ver Contrato</span>
                        </button>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Pagado:</span>
                        <span className="font-bold text-slate-900">${b.totalPrice.toLocaleString('es-AR')}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[10px] font-bold">
                          Tu Neto ({Math.round((1 - (b.platformFeeRate || platformFeeRate || 0.05)) * 100)}%):
                        </span>
                        <span className="font-black text-emerald-700">
                          ${(b.ownerNetAmount || b.rentalSubtotal * (1 - (b.platformFeeRate || platformFeeRate || 0.05)) || b.totalPrice * (1 - (b.platformFeeRate || platformFeeRate || 0.05))).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-700 block text-[10px] font-bold">Caución en Custodia:</span>
                        <span className="font-black text-amber-700">${b.depositAmount.toLocaleString('es-AR')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Comisión ServiGo ({Math.round((b.platformFeeRate || platformFeeRate || 0.05) * 100)}%):
                        </span>
                        <span className="font-bold text-orange-600">
                          ${(b.platformFeeAmount || b.rentalSubtotal * (b.platformFeeRate || platformFeeRate || 0.05) || b.totalPrice * (b.platformFeeRate || platformFeeRate || 0.05)).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    {/* Coordinar entrega por WhatsApp solo si ya está confirmada / pagada */}
                    {(b.status === 'confirmado' || b.paymentStatus === 'pagado') && b.clientPhone && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Pago recibido. Puedes coordinar la entrega con el cliente.</span>
                        </div>
                        <a
                          href={`https://wa.me/549${b.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `¡Hola ${b.clientName}! Tu reserva para "${b.rentalItemTitle}" ya está confirmada y pagada en ServiGo. Te contacto para coordinar la entrega del producto.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1 transition-colors shrink-0"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Coordinar por WhatsApp</span>
                        </a>
                      </div>
                    )}

                    {/* Damage Retained Box if applied */}
                    {b.depositStatus === 'retenido_por_dano' && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-950">
                        <div className="flex items-center gap-2 font-black text-rose-900">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Caución Retenida a Tu Favor: +${b.depositAmount.toLocaleString('es-AR')} acreditada en tu billetera</span>
                        </div>
                        {b.damageReport && (
                          <div className="text-[11px] text-rose-800 space-y-1">
                            <p><strong>Motivo:</strong> {b.damageReport.description}</p>
                            <p><strong>Costo estimado:</strong> ${b.damageReport.estimatedCost.toLocaleString('es-AR')}</p>
                            {b.damageReport.extraAmountClaimed && b.damageReport.extraAmountClaimed > 0 && (
                              <p className="font-bold text-rose-950 bg-rose-100 p-1.5 rounded-lg border border-rose-300">
                                ⚖️ Reclamo activo por diferencia bajo Cláusula 4ta del contrato: <strong>${b.damageReport.extraAmountClaimed.toLocaleString('es-AR')}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons if not yet completed */}
                    {b.status !== 'devuelto' && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            setBookingForDamage(b);
                            setDamageEstimatedCost(String(b.depositAmount));
                            setDamageDescription('');
                          }}
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>⚠️ Reportar Daño / Retener Garantía</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await onConfirmItemReturned(b.id);
                            showToast('¡Artículo marcado como devuelto conforme! Se liberó la garantía al cliente y se acreditó tu pago.');
                          }}
                          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmar Devuelto Conforme (100% OK)</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>
      </div>

      {/* Modal for Damage Report and Deposit Retention */}
      {bookingForDamage && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-rose-300 animate-fadeIn my-6">
            <div className="bg-gradient-to-r from-rose-900 to-rose-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-600 rounded-xl text-white">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Reportar Daño & Retener Garantía</h3>
                  <p className="text-[11px] text-rose-200">Protección del Propietario bajo Contrato Legal</p>
                </div>
              </div>
              <button
                onClick={() => setBookingForDamage(null)}
                className="w-8 h-8 rounded-full bg-rose-800 text-rose-200 flex items-center justify-center hover:bg-rose-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!damageDescription.trim()) {
                  showToast('Describe el daño o rotura ocurrida');
                  return;
                }
                const cost = Number(damageEstimatedCost) || bookingForDamage.depositAmount;
                const depositRetained = bookingForDamage.depositAmount;
                const extraAmountClaimed = Math.max(0, cost - depositRetained);

                const report: DamageReport = {
                  reportedAt: new Date().toISOString(),
                  damageType,
                  description: damageDescription.trim(),
                  estimatedCost: cost,
                  depositRetained,
                  extraAmountClaimed,
                };

                setIsSubmittingDamage(true);
                try {
                  if (onReportDamage) {
                    await onReportDamage(bookingForDamage.id, report);
                  } else {
                    await onConfirmItemReturned(bookingForDamage.id);
                  }
                  showToast(`⚠️ Garantía de $${depositRetained.toLocaleString('es-AR')} retenida a tu favor por daños.`);
                  setBookingForDamage(null);
                } catch (err) {
                  console.error(err);
                  showToast('Error al registrar informe de daño');
                } finally {
                  setIsSubmittingDamage(false);
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Scale className="w-4 h-4 text-amber-700" />
                  Cláusula 3ra y 4ta del Contrato Aceptado:
                </span>
                <p className="text-[11px] leading-relaxed">
                  El cliente <strong>{bookingForDamage.clientName}</strong> (DNI: {bookingForDamage.clientDni || 'Constatado'}) aceptó digitalmente asumir el costo de reparación o reposición a nuevo ante averías o roturas por mal uso.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tipo de Afectación o Daño Constatado:
                </label>
                <select
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500 font-medium"
                >
                  <option value="rotura_parcial">Rotura física / Caída / Golpe</option>
                  <option value="mal_uso">Avería mecánica o eléctrica por sobrecarga o mal uso</option>
                  <option value="falta_accesorios">Faltante de piezas, cables o accesorios</option>
                  <option value="no_devuelto_perdida">No devuelto / Extravío o Hurto (Reposición a nuevo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Costo Estimado de Reparación o Reposición ($ ARS):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={damageEstimatedCost}
                  onChange={(e) => setDamageEstimatedCost(e.target.value)}
                  placeholder="Ej: 45000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Depósito en garantía disponible para retener: <strong>${bookingForDamage.depositAmount.toLocaleString('es-AR')}</strong>
                  {Number(damageEstimatedCost) > bookingForDamage.depositAmount && (
                    <span className="text-rose-600 font-bold ml-1">
                      (Diferencia reclamable al cliente: ${(Number(damageEstimatedCost) - bookingForDamage.depositAmount).toLocaleString('es-AR')})
                    </span>
                  )}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Detalle de lo ocurrido (Informe de Estado):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe la falla, rotura o faltante con el que fue entregado el producto..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBookingForDamage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDamage}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  {isSubmittingDamage ? 'Guardando...' : 'Confirmar Retención de Garantía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for viewing signed contract for any booking */}
      {bookingForContract && (
        <RentalAgreementModal
          isOpen={Boolean(bookingForContract)}
          onClose={() => setBookingForContract(null)}
          itemTitle={bookingForContract.rentalItemTitle}
          dailyPrice={bookingForContract.dailyPrice}
          depositAmount={bookingForContract.depositAmount}
          ownerName={bookingForContract.ownerName}
          clientName={bookingForContract.clientName}
          clientDni={bookingForContract.clientDni}
          startDate={bookingForContract.startDate}
          endDate={bookingForContract.endDate}
          calculatedDays={bookingForContract.totalDays}
          isAccepted={Boolean(bookingForContract.contractAccepted || bookingForContract.clientDni)}
        />
      )}
    </div>
  );
};

