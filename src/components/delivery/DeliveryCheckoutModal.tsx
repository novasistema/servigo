import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  CheckCircle2,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Merchant, OrderItem, PaymentMethod } from '../../types';
import { createOrder, saveUserProfile } from '../../lib/deliveryService';

interface DeliveryCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant;
  cartItems: OrderItem[];
  userProfile: UserProfile;
  onOrderCreated: (orderId: string) => void;
  showToast?: (msg: string) => void;
}

export const DeliveryCheckoutModal: React.FC<DeliveryCheckoutModalProps> = ({
  isOpen,
  onClose,
  merchant,
  cartItems,
  userProfile,
  onOrderCreated,
  showToast,
}) => {
  // Auto-populate from authenticated / stored user profile
  const [name, setName] = useState<string>(userProfile.name || '');
  const [phone, setPhone] = useState<string>(userProfile.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    userProfile.deliveryAddress || ''
  );
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(
    userProfile.coordinates
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveProfileChanges, setSaveProfileChanges] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = merchant.deliveryFee || 0;
  const extraDeliveryFee = merchant.extraDeliveryFee || 0;
  const grandTotal = itemsTotal + deliveryFee + extraDeliveryFee;

  const handleGetLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          if (showToast) showToast('📍 Coordenadas GPS obtenidas con éxito');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          if (showToast) showToast('No se pudo acceder al GPS. Ingresa la dirección manual.');
        }
      );
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, ingresa tu nombre');
      if (showToast) showToast('Por favor, ingresa tu nombre');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Por favor, ingresa tu teléfono');
      if (showToast) showToast('Por favor, ingresa tu teléfono');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMessage('Por favor, ingresa la dirección de entrega');
      if (showToast) showToast('Por favor, ingresa la dirección de entrega');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Opcional: Actualizar datos de usuario en la colección 'users' para futuros pedidos
      if (saveProfileChanges) {
        await saveUserProfile({
          ...userProfile,
          name,
          phone,
          deliveryAddress,
          coordinates,
        });
      }

      // 2. Generar número de pedido amigable
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `SG-${randomNum}`;

      // 3. Crear pedido en la colección 'orders' con estado 'PENDING'
      const newOrderId = await createOrder({
        orderNumber,
        merchantId: merchant.id,
        merchantName: merchant.name,
        merchantAddress: merchant.address,
        merchantPhone: merchant.phone,
        clientId: userProfile.id,
        clientName: name,
        clientPhone: phone,
        deliveryAddress,
        clientCoordinates: coordinates,
        items: cartItems,
        itemsTotal,
        deliveryFee,
        extraDeliveryFee,
        total: grandTotal,
        paymentMethod,
        notes: notes.trim() || undefined,
        status: 'PENDING',
      });

      if (showToast) {
        showToast('🎉 ¡Pedido enviado al comercio con éxito! Esperando confirmación...');
      }

      onOrderCreated(newOrderId);
      onClose();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setErrorMessage('Hubo un error al enviar el pedido. Por favor intenta de nuevo.');
      if (showToast) showToast('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              Confirmar Compra • ServiGo Delivery
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Finalizar Pedido en {merchant.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmOrder} className="p-4 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Data Auto-populated */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-500" />
              Tus Datos de Envío (Colección 'users')
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none"
                  placeholder="Tu nombre y apellido"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none"
                  placeholder="+54 9 358 123-4567"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Dirección de Entrega (Calle, Altura, Localidad) *
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Usar mi GPS</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 focus:outline-none"
                placeholder="Ej: Av. San Martín 820, Alejandro Roca"
              />
              {coordinates && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  GPS Guardado: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveProfile"
                checked={saveProfileChanges}
                onChange={(e) => setSaveProfileChanges(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="saveProfile" className="text-xs text-slate-600 font-medium cursor-pointer">
                Recordar estos datos para mis próximas compras en ServiGo
              </label>
            </div>
          </div>

          {/* Section 2: Order Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Notas para el local o cadete (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-orange-500 focus:outline-none"
              placeholder="Ej: Tocar timbre en reja negra, portón derecho..."
            />
          </div>

          {/* Section 3: Payment Method Selector */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Selecciona Método de Pago
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="EFECTIVO"
                  checked={paymentMethod === 'EFECTIVO'}
                  onChange={() => setPaymentMethod('EFECTIVO')}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === 'EFECTIVO'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Efectivo
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Abonas al recibir el pedido
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'MERCADO_PAGO'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="MERCADO_PAGO"
                  checked={paymentMethod === 'MERCADO_PAGO'}
                  onChange={() => setPaymentMethod('MERCADO_PAGO')}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === 'MERCADO_PAGO'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Mercado Pago / Transf.
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Alias / CVU al recibir
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Order Items & Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Resumen del Pedido ({cartItems.length} items)
            </h4>

            <div className="divide-y divide-slate-200/70 max-h-36 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">{item.quantity}x</span>
                    <span className="font-semibold text-slate-800">{item.productName}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal productos:</span>
                <span>${itemsTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Costo de envío base ({merchant.deliveryTimeEstimate}):</span>
                <span>${deliveryFee.toLocaleString('es-AR')}</span>
              </div>
              {extraDeliveryFee > 0 && (
                <div className="flex justify-between text-amber-800 font-bold bg-amber-50/90 px-2 py-0.5 rounded-lg border border-amber-200">
                  <span>Extra de delivery / despacho del local:</span>
                  <span>+${extraDeliveryFee.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-950 font-black text-base pt-1 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span className="text-orange-600">${grandTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm transition-all shadow-lg shadow-orange-600/30 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Enviando Pedido a Firestore...'
                  : `Confirmar y Enviar Pedido ($${grandTotal.toLocaleString('es-AR')})`}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Se creará un documento en Firestore en la colección <strong>orders</strong> con estado <strong>PENDING</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
