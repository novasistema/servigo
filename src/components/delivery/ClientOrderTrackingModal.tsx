import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Bike,
  Car,
  CheckCircle2,
  AlertCircle,
  Store,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { ORDERS_COLLECTION } from '../../lib/deliveryService';
import { OrderInternalMessenger } from './OrderInternalMessenger';

interface ClientOrderTrackingModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientOrderTrackingModal: React.FC<ClientOrderTrackingModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Real-time Firestore onSnapshot on the specific order
  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);

    const unsubscribe = onSnapshot(
      orderDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({
            id: docSnap.id,
            ...docSnap.data(),
          } as Order);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error tracking order in real-time:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  if (!isOpen) return null;

  // Stepper calculations
  const steps: { key: OrderStatus; label: string; desc: string; icon: string }[] = [
    {
      key: 'PENDING',
      label: 'Recibido',
      desc: 'Esperando confirmación del comercio',
      icon: '⏳',
    },
    {
      key: 'PREPARING',
      label: 'En Preparación',
      desc: 'El local está elaborando tu pedido',
      icon: '👨‍🍳',
    },
    {
      key: 'ON_THE_WAY',
      label: 'En Camino',
      desc: 'El cadete va hacia tu domicilio',
      icon: '🛵',
    },
    {
      key: 'DELIVERED',
      label: 'Entregado',
      desc: '¡Pedido entregado con éxito!',
      icon: '🎉',
    },
  ];

  const getStepIndex = (status?: OrderStatus): number => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PREPARING':
        return 1;
      case 'SEARCHING_DRIVER':
        return 1.5;
      case 'ON_THE_WAY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-md">
                  Seguimiento en Vivo
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sincronizado vía onSnapshot
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {order?.merchantName || 'Tu Pedido'}
              </h3>
              <p className="text-xs text-slate-300">
                Pedido #{order?.orderNumber || orderId.slice(-5)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-orange-500" />
            <span>Cargando estado en tiempo real...</span>
          </div>
        ) : !order ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <span>No se encontró la información del pedido.</span>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Visual Stepper ServiGo Delivery */}
            <div className="space-y-4">
              <div className="text-center space-y-1">
                {order.status === 'PENDING' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs animate-pulse">
                    <span>🟡 Esperando confirmación del comercio...</span>
                  </div>
                )}
                {order.status === 'PREPARING' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs">
                    <span>👨‍🍳 El local está preparando tu pedido</span>
                  </div>
                )}
                {order.status === 'SEARCHING_DRIVER' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs animate-pulse">
                    <span>🚕 Asignando chofer en la red ServiGo...</span>
                  </div>
                )}
                {order.status === 'ON_THE_WAY' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-extrabold text-xs animate-bounce">
                    <span>🛵 ¡Tu pedido va en camino a tu domicilio!</span>
                  </div>
                )}
                {order.status === 'DELIVERED' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>¡Entregado! ¡Que lo disfrutes!</span>
                  </div>
                )}
                {order.status === 'CANCELLED' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 font-extrabold text-xs">
                    <span>❌ Pedido cancelado</span>
                  </div>
                )}
              </div>

              {/* Progress Stepper Bar */}
              <div className="relative pt-2 pb-2">
                <div className="grid grid-cols-4 gap-1 relative z-10">
                  {steps.map((step, idx) => {
                    const isCompleted = currentStepIdx > idx;
                    const isCurrent =
                      currentStepIdx === idx ||
                      (step.key === 'PREPARING' && currentStepIdx === 1.5);

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold transition-all shadow-sm ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-orange-600 text-white ring-4 ring-orange-500/20 scale-110 animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                        </div>
                        <span
                          className={`text-[10px] font-bold mt-2 leading-tight ${
                            isCurrent
                              ? 'text-orange-600 font-black'
                              : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cadete / Driver Card if assigned */}
            {(order.status === 'ON_THE_WAY' || order.status === 'SEARCHING_DRIVER') && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      {order.dispatchMethod === 'PROPIO' ? (
                        <Bike className="w-5 h-5" />
                      ) : (
                        <Car className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-600 block">
                        Repartidor Asignado
                      </span>
                      <h4 className="text-xs font-black text-slate-900">
                        {order.driverName || 'Cadete en Camino'}
                      </h4>
                    </div>
                  </div>

                  {order.driverPhone && (
                    <a
                      href={`tel:${order.driverPhone}`}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-purple-500"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Llamar</span>
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-purple-900 font-medium">
                  {order.dispatchMethod === 'PROPIO'
                    ? 'Despachado con cadetería propia del comercio.'
                    : 'Conductor oficial de la red ServiGo Remises.'}
                </p>
              </div>
            )}

            {/* Destination Address */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Dirección de Entrega
              </span>
              <p className="font-bold text-slate-900 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </p>
              {order.notes && (
                <p className="text-[11px] text-slate-500 italic pl-5">
                  "{order.notes}"
                </p>
              )}
            </div>

            {/* Order Items Breakdown */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Detalle del Pedido
              </h5>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2.5 text-xs">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">{item.quantity}x</span>
                      <span className="font-semibold text-slate-800">{item.productName}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Total */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                  Método de Pago
                </span>
                <span className="font-black text-slate-800">
                  {order.paymentMethod === 'EFECTIVO' ? '💵 Efectivo al recibir' : '📱 Mercado Pago / Transferencia'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                  Total Final
                </span>
                <span className="text-lg font-black text-orange-600">
                  ${order.total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Live Chat with Store */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-between border border-blue-200 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>💬 Mensajería Interna con {order.merchantName}</span>
                </div>
                <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  {order.messages?.length || 0} mensajes
                </span>
              </button>

              {isChatOpen && (
                <div className="animate-fadeIn">
                  <OrderInternalMessenger
                    order={order}
                    senderRole="client"
                    senderName={order.clientName || 'Cliente'}
                    onClose={() => setIsChatOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Merchant Contact Action */}
            {order.merchantPhone && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${order.merchantPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(order.merchantName)},%20tengo%20una%20consulta%20sobre%20mi%20pedido%20%23${order.orderNumber || order.id.slice(-5)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Contactar al Local por WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
