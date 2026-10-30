import React, { useState } from 'react';
import {
  X,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  FileText,
  Sparkles,
  Info,
  DollarSign,
  AlertCircle,
  Share2
} from 'lucide-react';
import { RentalItem, RentalBooking } from '../../types';
import { RentalAgreementModal } from './RentalAgreementModal';
import { RentalTermsAndConditions } from './RentalTermsAndConditions';

interface RentalDetailModalProps {
  item: RentalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookRental: (booking: RentalBooking) => Promise<void>;
  onOpenContract: (item: RentalItem) => void;
  showToast: (msg: string) => void;
}

export const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onBookRental,
  onOpenContract,
  showToast,
}) => {
  if (!isOpen || !item) return null;

  // Selected image index
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);

  // Form & Date calculation state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + (item.minRentalDays || 1));
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(tomorrowStr);
  const [deliveryMethod, setDeliveryMethod] = useState<'retiro_dueno' | 'envio_cadete'>('retiro_dueno');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [clientDni, setClientDni] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isContractAccepted, setIsContractAccepted] = useState<boolean>(false);
  const [showTermsError, setShowTermsError] = useState<boolean>(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate rental duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const calculatedDays = Math.max(item.minRentalDays || 1, Math.round(diffTime / (1000 * 60 * 60 * 24)) || 1);

  // Calculate prices
  const baseSubtotal = calculatedDays * item.dailyPrice;
  // If >= 7 days and weeklyPrice is set, calculate weekly discount
  let rentalSubtotal = baseSubtotal;
  let hasDiscount = false;
  if (calculatedDays >= 7 && item.weeklyPrice) {
    const fullWeeks = Math.floor(calculatedDays / 7);
    const extraDays = calculatedDays % 7;
    rentalSubtotal = (fullWeeks * item.weeklyPrice) + (extraDays * item.dailyPrice);
    hasDiscount = rentalSubtotal < baseSubtotal;
  }

  const deposit = item.depositAmount || 0;
  const estimatedTotal = rentalSubtotal + deposit;

  // Condition labels
  const conditionLabels: Record<string, { label: string; color: string }> = {
    nuevo: { label: 'Nuevo (Sin Uso)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    excelente: { label: 'Excelente Estado', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    muy_bueno: { label: 'Muy Bueno', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    bueno: { label: 'Buen Estado Operativo', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const conditionMeta = conditionLabels[item.condition] || { label: item.condition, color: 'bg-slate-100 text-slate-800 border-slate-300' };

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    const deliveryText = deliveryMethod === 'envio_cadete'
      ? `🛵 Envío a domicilio con cadete ServiGo (${clientAddress || 'A coordinar'})`
      : '🏠 Retiro por tu domicilio';

    const msg = `¡Hola ${item.ownerName}! Vi tu publicación en *ServiGo Alquiler de Productos* y solicito alquilar tu:
📦 *${item.title}*

📅 *Período de Alquiler:*
• Desde: ${startDate}
• Hasta: ${endDate} (${calculatedDays} día${calculatedDays > 1 ? 's' : ''})
• Método de Entrega: ${deliveryText}

💰 *Cotización Estimada:*
• Alquiler: $${rentalSubtotal.toLocaleString('es-AR')}
• Depósito de Garantía en Custodia: $${deposit.toLocaleString('es-AR')}
• Total Estimado: $${estimatedTotal.toLocaleString('es-AR')}

👤 *Datos del Locatario:*
• Nombre: ${clientName || 'Cliente'}
• Teléfono: ${clientPhone || 'No especificado'}
• DNI: ${clientDni || 'No especificado'}
${notes ? `• Nota: ${notes}` : ''}

✍️ *Contrato Vinculante Aceptado:*
He leído y aceptado el *Contrato de Locación de ServiGo*. Asumo la responsabilidad civil por el cuidado del producto y me comprometo al pago de la reparación o reposición a nuevo ante cualquier daño o extravío, autorizando la retención de la garantía.

¿Coordinamos la entrega? ¡Muchas gracias!`;

    return encodeURIComponent(msg);
  };

  const handleWhatsAppBooking = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      showToast('Por favor ingresa tu nombre y teléfono de contacto');
      return;
    }

    if (!clientDni.trim()) {
      showToast('Por favor ingresa tu DNI para la validez legal del contrato');
      return;
    }

    if (!isContractAccepted) {
      setShowTermsError(true);
      showToast('Debes marcar el checkbox obligatorio de Términos y Condiciones de Alquiler');
      return;
    }

    const cleanNumber = item.ownerWhatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${generateWhatsAppMessage()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('¡Redirigiendo a WhatsApp del dueño con los términos aceptados!');
  };

  const handleConfirmAppBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      showToast('Por favor completa tu nombre y teléfono');
      return;
    }

    if (!clientDni.trim()) {
      showToast('Por favor ingresa tu DNI para la validez legal del contrato');
      return;
    }

    if (!isContractAccepted) {
      setShowTermsError(true);
      showToast('Debes marcar el checkbox obligatorio de Términos y Condiciones de Alquiler');
      return;
    }

    if (deliveryMethod === 'envio_cadete' && !clientAddress.trim()) {
      showToast('Por favor ingresa tu dirección para el envío');
      return;
    }

    setIsSubmitting(true);
    try {
      const platformFeeAmount = Math.round(rentalSubtotal * 0.10);
      const ownerNetAmount = rentalSubtotal - platformFeeAmount;
      const totalToPay = rentalSubtotal + deposit;

      const newBooking: RentalBooking = {
        id: `rent-book-${Date.now()}`,
        rentalItemId: item.id,
        rentalItemTitle: item.title,
        rentalItemImage: item.images[0] || '',
        dailyPrice: item.dailyPrice,
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerPhone: item.ownerPhone,
        ownerWhatsapp: item.ownerWhatsapp,
        ownerCbuOrAlias: item.ownerCbuOrAlias,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientWhatsapp: clientPhone.trim(),
        clientDni: clientDni.trim(),
        startDate,
        endDate,
        totalDays: calculatedDays,
        rentalSubtotal,
        platformFeeRate: 0.10,
        platformFeeAmount,
        ownerNetAmount,
        depositAmount: deposit,
        totalPrice: totalToPay,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'envio_cadete' ? clientAddress.trim() : undefined,
        notes: notes.trim() || undefined,
        status: 'pendiente',
        paymentStatus: 'pagado_en_custodia',
        depositStatus: 'en_custodia',
        contractAccepted: true,
        contractAcceptedAt: new Date().toISOString(),
        contractSignerDni: clientDni.trim(),
        contractSignerName: clientName.trim(),
        createdAt: new Date().toISOString(),
      };

      await onBookRental(newBooking);
      showToast('¡Solicitud registrada con contrato firmado en ServiGo! El dueño y la garantía quedan asegurados.');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al registrar la reserva. Intenta por WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white font-black text-[10px] uppercase tracking-wider">
              ALQUILER DE PRODUCTOS
            </span>
            <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
              {item.categoryLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Grid: Gallery & Item Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Photos */}
            <div className="space-y-3">
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative">
                <img
                  src={item.images[selectedImageIdx] || item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shadow-xs ${conditionMeta.color}`}>
                    {conditionMeta.label}
                  </span>
                  {item.deliveryAvailable && (
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-orange-500 text-white shadow-xs flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Envío con Cadete
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Selector */}
              {item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIdx === idx ? 'border-orange-600 ring-2 ring-orange-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Owner Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-sm shadow-xs">
                      {item.ownerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">{item.ownerName}</span>
                        {item.ownerVerified && (
                          <span title="Dueño e identidad verificada" className="text-blue-600">
                            <ShieldCheck className="w-4 h-4 fill-blue-600 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-amber-500 font-bold">★ {item.ownerRating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{item.ownerReviewsCount} alquileres</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verificado ServiGo
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.location} ({item.zones.join(', ')})</span>
                </div>
              </div>

              {/* Security & Guarantees Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Depósito de Garantía: ${deposit.toLocaleString('es-AR')}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  El depósito se abona al recibir el artículo y se <strong>reintegra al 100%</strong> en la devolución tras constatar su correcto funcionamiento.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenContract(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 underline hover:text-amber-700 cursor-pointer pt-0.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Contrato de Locación Estándar</span>
                </button>
              </div>
            </div>

            {/* Right: Details & Reservation Engine */}
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {item.title}
                </h1>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-orange-600">
                    ${item.dailyPrice.toLocaleString('es-AR')}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    / día de uso
                  </span>
                  {item.weeklyPrice && (
                    <span className="ml-auto text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      ${item.weeklyPrice.toLocaleString('es-AR')} / sem ({Math.round((1 - (item.weeklyPrice / (item.dailyPrice * 7))) * 100)}% OFF)
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Descripción del Producto
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Included Accessories */}
              {item.includedAccessories && item.includedAccessories.length > 0 && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-black uppercase text-slate-600 block">
                    📦 Accesorios & Elementos Incluidos:
                  </span>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-slate-700">
                    {item.includedAccessories.map((acc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{acc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Booking Calculator Form */}
              <form onSubmit={handleConfirmAppBooking} className="p-4 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                      Calculá tu Período de Alquiler
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Mínimo: {item.minRentalDays} día{item.minRentalDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                      Fecha Inicio:
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                      Fecha Devolución:
                    </label>
                    <input
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Delivery Method Choice */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-slate-300">
                    Forma de Entrega:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('retiro_dueno')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        deliveryMethod === 'retiro_dueno'
                          ? 'bg-orange-600 text-white border-orange-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span>🏠 Retiro en Persona</span>
                    </button>

                    <button
                      type="button"
                      disabled={!item.deliveryAvailable}
                      onClick={() => setDeliveryMethod('envio_cadete')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        deliveryMethod === 'envio_cadete'
                          ? 'bg-orange-600 text-white border-orange-500'
                          : !item.deliveryAvailable
                          ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title={!item.deliveryAvailable ? 'Este artículo solo se entrega en mano' : 'Envío con cadete'}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>🛵 Enviar con Cadete</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Alquiler ({calculatedDays} día{calculatedDays > 1 ? 's' : ''}):</span>
                    <span className="font-bold text-white">${rentalSubtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-emerald-400 text-[11px]">
                      <span>Descuento aplicado por semana:</span>
                      <span>- ${(baseSubtotal - rentalSubtotal).toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>• Tasa de Servicio & Protección ServiGo (10%):</span>
                    <span className="text-orange-400 font-semibold">${Math.round(rentalSubtotal * 0.10).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>• Neto al Propietario (90%):</span>
                    <span className="text-emerald-400 font-semibold">${Math.round(rentalSubtotal * 0.90).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                    <span>Garantía en Custodia Reembolsable:</span>
                    <span className="font-bold text-amber-400">+ ${deposit.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between text-sm font-black text-white">
                    <span>Total a abonar:</span>
                    <span className="text-orange-400">${(rentalSubtotal + deposit).toLocaleString('es-AR')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block italic">
                    * El pago entra a la Billetera Central ServiGo. La garantía se reintegra al devolver el producto sano y salvo.
                  </span>
                </div>


                {/* Client Quick Contact Fields */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tu Nombre completo *"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
                    />
                    <input
                      type="tel"
                      placeholder="Tu Teléfono / WhatsApp *"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  {deliveryMethod === 'envio_cadete' && (
                    <input
                      type="text"
                      placeholder="Tu Dirección completa para envío con cadete *"
                      required
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="DNI del Titular (obligatorio) *"
                        required
                        value={clientDni}
                        onChange={(e) => setClientDni(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500 font-mono"
                      />
                      <span className="text-[9px] text-slate-400 block mt-0.5 ml-1">
                        Requerido para la validez legal del contrato
                      </span>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Notas / Consultas (opcional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Rental Terms and Conditions Component */}
                  <RentalTermsAndConditions
                    accepted={isContractAccepted}
                    onToggle={(val) => {
                      setIsContractAccepted(val);
                      if (val) setShowTermsError(false);
                    }}
                    itemTitle={item.title}
                    depositAmount={deposit}
                    clientDni={clientDni}
                    onOpenFullContract={() => setIsContractModalOpen(true)}
                    showErrorNotice={showTermsError}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleWhatsAppBooking}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Alquilar por WhatsApp</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/30 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Registrando...' : 'Reservar en la App'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Modal with prefilled client details */}
      <RentalAgreementModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        itemTitle={item.title}
        dailyPrice={item.dailyPrice}
        depositAmount={deposit}
        ownerName={item.ownerName}
        clientName={clientName.trim() || 'Cliente'}
        clientDni={clientDni.trim()}
        startDate={startDate}
        endDate={endDate}
        calculatedDays={calculatedDays}
        onAcceptContract={() => {
          setIsContractAccepted(true);
          showToast('✅ ¡Contrato y cláusulas de responsabilidad aceptadas!');
        }}
        isAccepted={isContractAccepted}
      />
    </div>
  );
};
