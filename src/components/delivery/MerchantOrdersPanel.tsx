import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Bike,
  Car,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  DollarSign,
  LogOut,
  Lock,
  UtensilsCrossed
} from 'lucide-react';
import { Order, OrderStatus, Merchant, DispatchMethod } from '../../types';
import {
  subscribeMerchantOrders,
  updateOrderStatus
} from '../../lib/deliveryService';
import { soundNotifier } from '../../utils/audioAlert';
import { MerchantMenuManager } from './MerchantMenuManager';

interface MerchantOrdersPanelProps {
  merchant: Merchant;
  onSwitchMerchant?: (merchantId: string) => void;
  allMerchants?: Merchant[];
  onLogout?: () => void;
  showToast?: (msg: string) => void;
}

export const MerchantOrdersPanel: React.FC<MerchantOrdersPanelProps> = ({
  merchant,
  onSwitchMerchant,
  allMerchants = [],
  onLogout,
  showToast,
}) => {
  const [mainTab, setMainTab] = useState<'orders' | 'menu'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [isMuted, setIsMuted] = useState<boolean>(soundNotifier.getIsMuted());
  const [cadeteModalOrder, setCadeteModalOrder] = useState<Order | null>(null);
  const [customCadeteName, setCustomCadeteName] = useState<string>('Marcos (Cadete Propio)');
  const [customCadetePhone, setCustomCadetePhone] = useState<string>('+54 9 358 499-1122');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Track previous pending orders count to trigger chime on newly received orders
  const prevPendingCountRef = useRef<number>(0);

  useEffect(() => {
    const unsubscribe = subscribeMerchantOrders(merchant.id, (realtimeOrders) => {
      setOrders(realtimeOrders);

      const pendingOrders = realtimeOrders.filter((o) => o.status === 'PENDING');
      // If there are more pending orders than before, trigger the audible alert!
      if (pendingOrders.length > prevPendingCountRef.current) {
        soundNotifier.playNewOrderChime();
        if (showToast) {
          showToast(`🔔 ¡Nuevo pedido #${pendingOrders[0].orderNumber || pendingOrders[0].id.slice(-4)} recibido!`);
        }
      }
      prevPendingCountRef.current = pendingOrders.length;
    });

    return () => {
      unsubscribe();
    };
  }, [merchant.id, showToast]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundNotifier.setMuted(nextMuted);
    if (!nextMuted) {
      soundNotifier.playNewOrderChime();
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, 'PREPARING');
      soundNotifier.playSuccessBeep();
      if (showToast) showToast('✅ Pedido aceptado. Pasó a estado "En Preparación"');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al aceptar pedido');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, 'CANCELLED');
      if (showToast) showToast('❌ Pedido rechazado y cancelado');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al rechazar el pedido');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Botón 1: Despachar con Cadete Propio -> pasa a ON_THE_WAY
  const handleDispatchOwnCadete = async (order: Order) => {
    setIsUpdatingStatus(order.id);
    try {
      await updateOrderStatus(order.id, 'ON_THE_WAY', {
        dispatchMethod: 'PROPIO',
        driverName: customCadeteName || 'Cadete del Local',
        driverPhone: customCadetePhone || merchant.phone,
      });
      soundNotifier.playSuccessBeep();
      setCadeteModalOrder(null);
      if (showToast) showToast(`🛵 ¡Pedido despachado con cadete propio (${customCadeteName})!`);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al despachar pedido');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Botón 2: Solicitar Cadete / Remis ServiGo -> pasa a SEARCHING_DRIVER
  const handleRequestServiGoDriver = async (order: Order) => {
    setIsUpdatingStatus(order.id);
    try {
      await updateOrderStatus(order.id, 'SEARCHING_DRIVER', {
        dispatchMethod: 'SERVIGO_REMIS',
        driverName: 'Buscando chofer en Red ServiGo...',
      });
      soundNotifier.playSuccessBeep();
      if (showToast) showToast('🚕 Solicitando conductor en la Red ServiGo...');

      // Simular toma automática por un chofer ServiGo disponible tras 4 segundos
      setTimeout(async () => {
        try {
          await updateOrderStatus(order.id, 'ON_THE_WAY', {
            dispatchMethod: 'SERVIGO_REMIS',
            driverName: 'Roberto Gómez (Remis Fiat Cronos - AF 482 QZ)',
            driverPhone: '+54 9 358 488-7711',
          });
          soundNotifier.playSuccessBeep();
          if (showToast) {
            showToast('✅ Chofer ServiGo asignado: Roberto Gómez está en camino al comercio');
          }
        } catch (e) {
          console.error(e);
        }
      }, 4000);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al solicitar remis ServiGo');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, 'DELIVERED');
      soundNotifier.playSuccessBeep();
      if (showToast) showToast('🎉 ¡Pedido marcado como entregado!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const onTheWayCount = orders.filter((o) => o.status === 'ON_THE_WAY' || o.status === 'SEARCHING_DRIVER').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner & Merchant Selector */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={merchant.imageUrl}
              alt={merchant.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                  Panel de Comercio
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Recepción en Tiempo Real (Firestore onSnapshot)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {merchant.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{merchant.address}, {merchant.location}</span>
                <span className="text-slate-500">•</span>
                <span>{merchant.category}</span>
              </p>
            </div>
          </div>

          {/* Controls: Audio Alert & Switch Merchant */}
          <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
            <button
              onClick={toggleSound}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              }`}
              title={isMuted ? 'Activar alertas sonoras' : 'Silenciar alertas'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
              <span>{isMuted ? 'Sonido: Silenciado' : 'Sonido: Activo'}</span>
            </button>

            <button
              onClick={() => soundNotifier.playNewOrderChime()}
              className="px-2.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              title="Probar sonido de pedido entrante"
            >
              🔔 Probar Timbre
            </button>

            {/* Authenticated user badge & Logout button for privacy */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Sesión Privada:</span>
                <span>@{merchant.accountUsername || merchant.name.slice(0, 14)}</span>
              </span>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-sm cursor-pointer"
                  title="Cerrar sesión de este comercio y bloquear panel con contraseña"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pending Orders Alert Bar */}
        {pendingCount > 0 && (
          <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-slate-950 font-black flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-slate-950 animate-bounce" />
              <div>
                <span className="text-sm uppercase tracking-wide">
                  ¡Tienes {pendingCount} {pendingCount === 1 ? 'pedido pendiente' : 'pedidos pendientes'} de confirmación!
                </span>
                <p className="text-[11px] font-medium text-slate-900">
                  Revisa los detalles abajo y pulsa "Aceptar Pedido" para comenzar la preparación.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className="px-3 py-1.5 bg-slate-950 text-amber-300 rounded-xl text-xs font-black hover:bg-slate-900 transition-all shrink-0"
            >
              Ver Pendientes
            </button>
          </div>
        )}
      </div>

      {/* Primary Section Switcher: Pedidos vs Mi Menú */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setMainTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'orders'
              ? 'bg-slate-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>📋 Gestión de Pedidos</span>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('menu')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'menu'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>🍽️ Mi Menú & Platos ({merchant.products?.length || 0})</span>
        </button>
      </div>

      {mainTab === 'menu' ? (
        <MerchantMenuManager merchant={merchant} showToast={showToast} />
      ) : (
        <>
          {/* Tabs Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>Todos los Pedidos</span>
          <span className="bg-black/20 text-white text-[10px] px-1.5 py-0.2 rounded-full">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>🟡 Nuevos / Pendientes</span>
          {pendingCount > 0 && (
            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('PREPARING')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'PREPARING'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>👨‍🍳 En Preparación</span>
          {preparingCount > 0 && (
            <span className="bg-blue-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {preparingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('ON_THE_WAY')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'ON_THE_WAY'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>🛵 En Camino / Despachados</span>
          {onTheWayCount > 0 && (
            <span className="bg-purple-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {onTheWayCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('DELIVERED')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'DELIVERED'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>✅ Entregados</span>
        </button>
      </div>

      {/* Orders Grid / List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No hay pedidos en este estado para {merchant.name}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando un cliente realice una compra en la vista "Modo Cliente", aparecerá aquí automáticamente en tiempo real con una alerta sonora.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'PENDING';
            const isPreparing = order.status === 'PREPARING';
            const isSearchingDriver = order.status === 'SEARCHING_DRIVER';
            const isOnTheWay = order.status === 'ON_THE_WAY';
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${
                  isPending
                    ? 'border-2 border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10'
                    : isPreparing
                    ? 'border-blue-300'
                    : isOnTheWay || isSearchingDriver
                    ? 'border-purple-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Order Header */}
                <div
                  className={`p-3.5 sm:p-4 flex items-center justify-between border-b ${
                    isPending
                      ? 'bg-amber-50 border-amber-200'
                      : isPreparing
                      ? 'bg-blue-50 border-blue-200'
                      : isOnTheWay || isSearchingDriver
                      ? 'bg-purple-50 border-purple-200'
                      : isDelivered
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                      #{order.orderNumber || order.id.slice(-5)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        PENDIENTE DE ACEPTAR
                      </span>
                    )}
                    {isPreparing && (
                      <span className="bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        👨‍🍳 EN PREPARACIÓN
                      </span>
                    )}
                    {isSearchingDriver && (
                      <span className="bg-amber-600 text-white font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                        🚕 BUSCANDO CADETE SERVIGO
                      </span>
                    )}
                    {isOnTheWay && (
                      <span className="bg-purple-600 text-white font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        🛵 EN CAMINO
                      </span>
                    )}
                    {isDelivered && (
                      <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ENTREGADO
                      </span>
                    )}
                    {isCancelled && (
                      <span className="bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        RECHAZADO
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Body: Customer & Address */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">
                            {order.clientName}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {order.clientPhone}
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp shortcut button for merchant */}
                      <a
                        href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(order.clientName)},%20te%20escribimos%20desde%20${encodeURIComponent(merchant.name)}%20respecto%20a%20tu%20pedido%20%23${order.orderNumber || order.id.slice(-5)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                        title="Contactar al cliente por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-700">
                      <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{order.deliveryAddress}</span>
                        {order.clientCoordinates && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            📍 GPS: {order.clientCoordinates.lat.toFixed(4)}, {order.clientCoordinates.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products Detail */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Detalle de Productos ({order.items.length})
                    </h5>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white p-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 px-1 flex items-start justify-between gap-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-orange-600 min-w-5">
                              {item.quantity}x
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{item.productName}</p>
                              {item.notes && (
                                <p className="text-[11px] text-amber-700 italic bg-amber-50 px-2 py-0.5 rounded-md mt-0.5">
                                  Nota: "{item.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-extrabold text-slate-900 shrink-0">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs">
                      <span className="font-extrabold uppercase tracking-wide text-[10px] block text-amber-800">
                        Instrucciones de entrega:
                      </span>
                      <p className="italic mt-0.5">"{order.notes}"</p>
                    </div>
                  )}

                  {/* Dispatch Info if on the way */}
                  {(isOnTheWay || isSearchingDriver) && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {order.dispatchMethod === 'PROPIO' ? (
                          <Bike className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Car className="w-4 h-4 text-amber-600" />
                        )}
                        <span>
                          {order.dispatchMethod === 'PROPIO' ? 'Cadete Propio del Local' : 'Red de Remises ServiGo'}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800 font-semibold">
                        {order.driverName || 'Asignando chofer...'} {order.driverPhone ? `• Tel: ${order.driverPhone}` : ''}
                      </p>
                    </div>
                  )}

                  {/* Financials & Payment Method */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
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
                        Total a Cobrar
                      </span>
                      <span className="text-lg font-black text-orange-600">
                        ${order.total.toLocaleString('es-AR')}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-semibold">
                        Envío: ${order.deliveryFee.toLocaleString('es-AR')}
                        {order.extraDeliveryFee && order.extraDeliveryFee > 0 ? (
                          <span className="text-amber-600 ml-1">(+${order.extraDeliveryFee} extra local)</span>
                        ) : null}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {/* State: PENDING -> Accept or Reject */}
                    {isPending && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={isUpdatingStatus === order.id}
                          onClick={() => handleRejectOrder(order.id)}
                          className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Rechazar Pedido
                        </button>

                        <button
                          disabled={isUpdatingStatus === order.id}
                          onClick={() => handleAcceptOrder(order.id)}
                          className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aceptar Pedido</span>
                        </button>
                      </div>
                    )}

                    {/* State: PREPARING -> Options for dispatch */}
                    {isPreparing && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block text-center">
                          Opciones de Despacho / Envío
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Botón 1: Despachar con Cadete Propio */}
                          <button
                            disabled={isUpdatingStatus === order.id}
                            onClick={() => setCadeteModalOrder(order)}
                            className="py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Bike className="w-4 h-4" />
                            <span>Despachar Cadete Propio</span>
                          </button>

                          {/* Botón 2: Solicitar Cadete / Remis ServiGo */}
                          <button
                            disabled={isUpdatingStatus === order.id}
                            onClick={() => handleRequestServiGoDriver(order)}
                            className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Car className="w-4 h-4" />
                            <span>Solicitar Remis ServiGo</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* State: ON_THE_WAY -> Mark as Delivered */}
                    {isOnTheWay && (
                      <button
                        disabled={isUpdatingStatus === order.id}
                        onClick={() => handleMarkDelivered(order.id)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Marcar como Entregado al Cliente</span>
                      </button>
                    )}

                    {isDelivered && (
                      <div className="text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 py-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pedido completado con éxito</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cadete Propio Modal */}
      {cadeteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2.5 text-purple-700">
              <Bike className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">
                Despachar con Cadete del Local
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Asigna el cadete de tu comercio que llevará el pedido #{cadeteModalOrder.orderNumber} a{' '}
              <strong>{cadeteModalOrder.deliveryAddress}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                  Nombre del Cadete
                </label>
                <input
                  type="text"
                  value={customCadeteName}
                  onChange={(e) => setCustomCadeteName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  placeholder="Ej: Marcos Pérez"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={customCadetePhone}
                  onChange={(e) => setCustomCadetePhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  placeholder="Ej: +54 9 358 499-1122"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCadeteModalOrder(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDispatchOwnCadete(cadeteModalOrder)}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20"
              >
                Confirmar Despacho
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
