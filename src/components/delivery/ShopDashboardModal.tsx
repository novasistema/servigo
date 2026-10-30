import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Bell,
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
  UtensilsCrossed,
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Lock,
  LogOut,
  Save,
  MessageSquare
} from 'lucide-react';
import { Merchant, Order, OrderStatus, MerchantProduct, DispatchMethod } from '../../types';
import {
  subscribeMerchants,
  subscribeMerchantOrders,
  updateOrderStatus,
  addMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
  toggleProductAvailability,
  updateMerchantDeliveryFees,
  getSavedMerchantSession,
  setSavedMerchantSession,
} from '../../lib/deliveryService';
import { INITIAL_MERCHANTS } from '../../data/mockMerchants';
import { MerchantMenuManager } from './MerchantMenuManager';
import { OrderInternalMessenger } from './OrderInternalMessenger';

interface ShopDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMerchantId?: string;
  showToast?: (msg: string) => void;
}

export const ShopDashboardModal: React.FC<ShopDashboardModalProps> = ({
  isOpen,
  onClose,
  initialMerchantId,
  showToast,
}) => {
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(() => {
    return initialMerchantId || getSavedMerchantSession() || INITIAL_MERCHANTS[0].id;
  });

  // Login simulation state
  const [isChangingShop, setIsChangingShop] = useState(false);
  const [searchShopQuery, setSearchShopQuery] = useState('');

  // Dashboard Tabs: 'orders' | 'messages' | 'products' | 'delivery'
  const [activeTab, setActiveTab] = useState<'orders' | 'messages' | 'products' | 'delivery'>('orders');

  // Internal chat state
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [selectedChatOrderId, setSelectedChatOrderId] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Cadete modal dispatch state
  const [cadeteModalOrder, setCadeteModalOrder] = useState<Order | null>(null);
  const [cadeteName, setCadeteName] = useState('Marcos (Cadete Propio)');
  const [cadetePhone, setCadetePhone] = useState('+54 9 358 499-1122');

  // Delivery fee settings state
  const [deliveryFee, setDeliveryFee] = useState<number>(800);
  const [extraDeliveryFee, setExtraDeliveryFee] = useState<number>(200);
  const [isSavingFees, setIsSavingFees] = useState(false);

  // Subscribe to all merchants in Firestore
  useEffect(() => {
    const unsub = subscribeMerchants((realtimeMerchants) => {
      if (realtimeMerchants && realtimeMerchants.length > 0) {
        setMerchants(realtimeMerchants);
      }
    });
    return () => unsub();
  }, []);

  // Update selected merchant if initialMerchantId changes
  useEffect(() => {
    if (initialMerchantId) {
      setSelectedMerchantId(initialMerchantId);
    }
  }, [initialMerchantId]);

  const currentMerchant =
    merchants.find((m) => m.id === selectedMerchantId) ||
    merchants[0] ||
    INITIAL_MERCHANTS[0];

  // Sync fee state when merchant changes
  useEffect(() => {
    if (currentMerchant) {
      setDeliveryFee(currentMerchant.deliveryFee ?? 800);
      setExtraDeliveryFee(currentMerchant.extraDeliveryFee ?? 200);
    }
  }, [currentMerchant?.id, currentMerchant?.deliveryFee, currentMerchant?.extraDeliveryFee]);

  // Subscribe to current merchant's orders in real time
  useEffect(() => {
    if (!isOpen || !currentMerchant?.id) return;

    const unsub = subscribeMerchantOrders(currentMerchant.id, (realtimeOrders) => {
      setOrders(realtimeOrders);
    });

    return () => unsub();
  }, [isOpen, currentMerchant?.id]);

  // Sync activeChatOrder with latest realtime snapshot from orders
  useEffect(() => {
    if (!isOpen || !activeChatOrder) return;
    const refreshed = orders.find((o) => o.id === activeChatOrder.id);
    if (refreshed) {
      setActiveChatOrder(refreshed);
    }
  }, [isOpen, orders, activeChatOrder?.id]);

  if (!isOpen) return null;

  // Counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const onTheWayCount = orders.filter(
    (o) => o.status === 'ON_THE_WAY' || o.status === 'SEARCHING_DRIVER'
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const ordersWithMessages = orders.filter((o) => o.messages && o.messages.length > 0);
  const totalMessagesCount = orders.reduce((sum, o) => sum + (o.messages?.length || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'ON_THE_WAY') {
      return o.status === 'ON_THE_WAY' || o.status === 'SEARCHING_DRIVER';
    }
    return o.status === statusFilter;
  });

  // Handle Order Status Changes
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    options?: { dispatchMethod?: DispatchMethod; driverName?: string; driverPhone?: string }
  ) => {
    setIsUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, options);
      if (showToast) {
        const labels: Record<OrderStatus, string> = {
          PENDING: '🟡 Pedido marcado como Pendiente',
          PREPARING: '🟠 Pedido en Preparación',
          ON_THE_WAY: '🟣 ¡Pedido despachado y enviado!',
          SEARCHING_DRIVER: '🚕 Buscando chofer ServiGo',
          DELIVERED: '🟢 Pedido marcado como Entregado',
          CANCELLED: '🔴 Pedido rechazado/cancelado',
        };
        showToast(labels[newStatus] || 'Estado actualizado');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al actualizar el estado del pedido');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Dispatch cadete modal submit
  const handleConfirmCadeteDispatch = async () => {
    if (!cadeteModalOrder) return;
    await handleUpdateStatus(cadeteModalOrder.id, 'ON_THE_WAY', {
      dispatchMethod: 'PROPIO',
      driverName: cadeteName.trim() || 'Cadete Propio',
      driverPhone: cadetePhone.trim() || undefined,
    });
    setCadeteModalOrder(null);
  };

  // Save Delivery & Extra Fee settings
  const handleSaveDeliveryFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant) return;
    setIsSavingFees(true);
    try {
      await updateMerchantDeliveryFees(currentMerchant.id, deliveryFee, extraDeliveryFee);
      if (showToast) {
        showToast('🚚 ¡Tarifas de delivery y monto extra guardadas en Firestore!');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al guardar tarifas');
    } finally {
      setIsSavingFees(false);
    }
  };

  // Handle Simulated Shop Switch
  const handleSelectShop = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    setSavedMerchantSession(merchantId);
    setIsChangingShop(false);
    if (showToast) {
      const found = merchants.find((m) => m.id === merchantId);
      showToast(`🏪 Sesión iniciada en: ${found?.name || 'Comercio'}`);
    }
  };

  // Filter merchants in simulated login
  const filteredMerchantsList = merchants.filter(
    (m) =>
      !searchShopQuery.trim() ||
      m.name.toLowerCase().includes(searchShopQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchShopQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-100 rounded-3xl max-w-5xl w-full my-4 shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ================================================================ */}
        {/* TOP MODAL HEADER */}
        {/* ================================================================ */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-md">
                  ShopDashboardModal
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  Panel de Dueños de Comercio
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{currentMerchant?.name || 'Comercio Seleccionado'}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangingShop(!isChangingShop)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cambiar comercio o iniciar sesión en otro local"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cambiar Comercio (Simulado)</span>
              <span className="sm:hidden">Comercio</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SIMULATED LOGIN / SHOP SELECTOR OVERLAY */}
        {/* ================================================================ */}
        {isChangingShop && (
          <div className="bg-slate-900/95 border-b border-slate-800 p-4 sm:p-5 text-white animate-fadeIn shrink-0">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Seleccionar Comercio para Loguearse (Simulado)</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Elige el local gastronómico, farmacia, tienda de ropa o kiosco que deseas administrar:
                  </p>
                </div>
                <button
                  onClick={() => setIsChangingShop(false)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  ✕ Cerrar selector
                </button>
              </div>

              {/* Search shop */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchShopQuery}
                  onChange={(e) => setSearchShopQuery(e.target.value)}
                  placeholder="Buscar comercio por nombre o rubro..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Grid of shops */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredMerchantsList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectShop(m.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedMerchantId === m.id
                        ? 'bg-orange-600/30 border-orange-500 text-white shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-600 shrink-0"
                    />
                    <div className="truncate flex-1">
                      <span className="text-xs font-black block truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {m.category} • @{m.accountUsername || m.name.slice(0, 10)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STATS STRIP & TAB SELECTOR */}
        {/* ================================================================ */}
        <div className="bg-white border-b border-slate-200 p-3 sm:p-4 space-y-3 shrink-0">
          {/* Quick stats pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 block">
                  Pendientes
                </span>
                <span className="text-lg font-black text-amber-900">{pendingCount}</span>
              </div>
              <Bell className="w-5 h-5 text-amber-600" />
            </div>

            <div className="p-2.5 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-800 block">
                  En Preparación
                </span>
                <span className="text-lg font-black text-orange-900">{preparingCount}</span>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>

            <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-800 block">
                  Enviados / En Camino
                </span>
                <span className="text-lg font-black text-purple-900">{onTheWayCount}</span>
              </div>
              <Bike className="w-5 h-5 text-purple-600" />
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 block">
                  Entregados
                </span>
                <span className="text-lg font-black text-emerald-900">{deliveredCount}</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>📋 Lista de Pedidos ({orders.length})</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 Mensajería ({totalMessagesCount})</span>
              {ordersWithMessages.length > 0 && (
                <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {ordersWithMessages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>🍽️ Gestión de Productos ({currentMerchant?.products?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>🚚 Extra & Envío</span>
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* MAIN BODY CONTENT (SCROLLABLE) */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: LISTA DE PEDIDOS RECIBIDOS & CAMBIO DE ESTADO */}
          {/* ============================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Todos ({orders.length})
                </button>

                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🟡 Pendientes ({pendingCount})
                </button>

                <button
                  onClick={() => setStatusFilter('PREPARING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'PREPARING'
                      ? 'bg-orange-500 text-white font-black shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🟠 En Preparación ({preparingCount})
                </button>

                <button
                  onClick={() => setStatusFilter('ON_THE_WAY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'ON_THE_WAY'
                      ? 'bg-purple-600 text-white font-black shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🟣 Enviados ({onTheWayCount})
                </button>

                <button
                  onClick={() => setStatusFilter('DELIVERED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'DELIVERED'
                      ? 'bg-emerald-600 text-white font-black shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🟢 Entregados ({deliveredCount})
                </button>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 space-y-2">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-800">
                    No hay pedidos en este estado
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Los pedidos realizados por clientes para {currentMerchant?.name} aparecerán aquí en tiempo real sincronizados con Cloud Firestore.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredOrders.map((order) => {
                    const isPending = order.status === 'PENDING';
                    const isPreparing = order.status === 'PREPARING';
                    const isOnTheWay = order.status === 'ON_THE_WAY' || order.status === 'SEARCHING_DRIVER';
                    const isDelivered = order.status === 'DELIVERED';
                    const isCancelled = order.status === 'CANCELLED';

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                          isPending
                            ? 'border-amber-400 ring-2 ring-amber-400/20'
                            : isPreparing
                            ? 'border-orange-300'
                            : isOnTheWay
                            ? 'border-purple-300'
                            : isDelivered
                            ? 'border-emerald-300 opacity-90'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                              Pedido
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              #{order.orderNumber || order.id.slice(-5)}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isPending && (
                              <span className="bg-amber-100 text-amber-900 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                🟡 PENDIENTE
                              </span>
                            )}
                            {isPreparing && (
                              <span className="bg-orange-100 text-orange-900 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                🟠 EN PREPARACIÓN
                              </span>
                            )}
                            {isOnTheWay && (
                              <span className="bg-purple-100 text-purple-900 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                🟣 ENVIADO / EN CAMINO
                              </span>
                            )}
                            {isDelivered && (
                              <span className="bg-emerald-100 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                🟢 ENTREGADO
                              </span>
                            )}
                            {isCancelled && (
                              <span className="bg-rose-100 text-rose-900 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                🔴 CANCELADO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Details Body */}
                        <div className="p-4 space-y-3 flex-1">
                          {/* Client info & Address */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900">
                                👤 {order.clientName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setActiveChatOrder(order)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-black transition-all cursor-pointer"
                                  title="Abrir mensajería interna con el cliente"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Mensajes {order.messages?.length ? `(${order.messages.length})` : ''}</span>
                                </button>

                                <a
                                  href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </div>
                            <p className="text-slate-600 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                              <span>{order.deliveryAddress}</span>
                            </p>
                          </div>

                          {/* Latest internal message preview */}
                          {order.messages && order.messages.length > 0 && (
                            <div
                              onClick={() => setActiveChatOrder(order)}
                              className="p-2.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-all shadow-2xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate text-[11px]">
                                  <strong>{order.messages[order.messages.length - 1].senderName}:</strong> "{order.messages[order.messages.length - 1].text}"
                                </span>
                              </div>
                              <span className="text-[10px] text-blue-700 font-black underline shrink-0 ml-2">
                                Responder
                              </span>
                            </div>
                          )}

                          {/* Items */}
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2.5 bg-white text-xs max-h-36 overflow-y-auto">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="py-1 flex items-center justify-between">
                                <span className="font-semibold text-slate-800">
                                  <strong className="text-orange-600">{item.quantity}x</strong> {item.productName}
                                </span>
                                <span className="font-black text-slate-900">
                                  ${(item.price * item.quantity).toLocaleString('es-AR')}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60 italic">
                              Nota cliente: "{order.notes}"
                            </p>
                          )}

                          {/* Total Financials */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">
                              Envío base: ${order.deliveryFee.toLocaleString('es-AR')}
                              {order.extraDeliveryFee && order.extraDeliveryFee > 0 ? (
                                <span className="text-amber-700 ml-1 font-bold">
                                  (+${order.extraDeliveryFee} extra)
                                </span>
                              ) : null}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-black text-orange-600">
                                Total: ${order.total.toLocaleString('es-AR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Status Buttons */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                            Cambiar Estado del Pedido:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {/* PENDING Button */}
                            <button
                              disabled={isPending || isUpdatingStatus === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'PENDING')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                                isPending
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                  : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                              } disabled:opacity-50`}
                            >
                              🟡 Pendiente
                            </button>

                            {/* PREPARING Button */}
                            <button
                              disabled={isPreparing || isUpdatingStatus === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                                isPreparing
                                  ? 'bg-orange-500 text-white font-black shadow-xs'
                                  : 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200'
                              } disabled:opacity-50`}
                            >
                              🟠 En Preparación
                            </button>

                            {/* ON_THE_WAY Button */}
                            <button
                              disabled={isOnTheWay || isUpdatingStatus === order.id}
                              onClick={() => setCadeteModalOrder(order)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                                isOnTheWay
                                  ? 'bg-purple-600 text-white font-black shadow-xs'
                                  : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
                              } disabled:opacity-50`}
                            >
                              🟣 Enviado
                            </button>

                            {/* DELIVERED Button */}
                            <button
                              disabled={isDelivered || isUpdatingStatus === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                                isDelivered
                                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                              } disabled:opacity-50`}
                            >
                              🟢 Entregado
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: MENSAJERÍA INTERNA & CONSULTAS DE CLIENTES */}
          {/* ============================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>Consultas y Mensajería Interna de Clientes</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Responde al instante preguntas sobre preparación, demoras o indicaciones de entrega.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                  {orders.length} pedidos registrados
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-700">Aún no hay pedidos en este comercio</h4>
                  <p className="text-xs text-slate-400">Cuando los clientes realicen pedidos, podrás chatear con ellos aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column: Order Selector List */}
                  <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {orders.map((ord) => {
                      const isSelected = (selectedChatOrderId || orders[0]?.id) === ord.id;
                      const msgCount = ord.messages?.length || 0;
                      const lastMsg = ord.messages && ord.messages[ord.messages.length - 1];

                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedChatOrderId(ord.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                              : 'bg-white hover:bg-slate-50 border-slate-200/90'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-slate-900">
                              #{ord.orderNumber || ord.id.slice(-5)} • {ord.clientName}
                            </span>
                            {msgCount > 0 ? (
                              <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                {msgCount} msg
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Sin mensajes</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mb-1">
                            {lastMsg ? (
                              <>
                                <strong>{lastMsg.senderName}:</strong> "{lastMsg.text}"
                              </>
                            ) : (
                              'Click para iniciar conversación...'
                            )}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Total: ${ord.total.toLocaleString('es-AR')}</span>
                            <span className="font-bold text-orange-600 uppercase tracking-wider">{ord.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Active Order Messenger */}
                  <div className="md:col-span-7">
                    {(() => {
                      const chatOrder = orders.find((o) => o.id === (selectedChatOrderId || orders[0]?.id)) || orders[0];
                      if (!chatOrder) return null;
                      return (
                        <OrderInternalMessenger
                          order={chatOrder}
                          senderRole="merchant"
                          senderName={currentMerchant?.name || 'Comercio'}
                          showToast={showToast}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: GESTIÓN DE PRODUCTOS */}
          {/* ============================================================== */}
          {activeTab === 'products' && currentMerchant && (
            <div className="animate-fadeIn">
              <MerchantMenuManager merchant={currentMerchant} showToast={showToast} />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: TARIFAS DE DELIVERY & EXTRA */}
          {/* ============================================================== */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Tarifas de Delivery & Extra de Despacho
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajusta el costo de entrega base y el extra que suma tu local a cada pedido.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDeliveryFees} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Costo Base de Envío ($ ARS)
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Costo de flete o viaje estándar para el reparto.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Extra del Comercio para Delivery ($ ARS)
                  </label>
                  <input
                    type="number"
                    value={extraDeliveryFee}
                    onChange={(e) => setExtraDeliveryFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Monto adicional que cobra el local por empaque, preparación o comisión de logística.
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold flex justify-between items-center">
                  <span>Total cobrado al cliente por envío:</span>
                  <span className="text-sm font-black text-orange-600">
                    ${(Number(deliveryFee) + Number(extraDeliveryFee)).toLocaleString('es-AR')}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingFees}
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{isSavingFees ? 'Guardando en Firestore...' : 'Guardar Tarifas de Envío'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* CADETE MODAL OVERLAY (FOR MARKING AS ENVIADO) */}
        {/* ================================================================ */}
        {cadeteModalOrder && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-purple-600" />
                  <span>Despachar Pedido #{cadeteModalOrder.orderNumber || cadeteModalOrder.id.slice(-5)}</span>
                </h4>
                <button
                  onClick={() => setCadeteModalOrder(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Nombre del Cadete / Repartidor
                  </label>
                  <input
                    type="text"
                    value={cadeteName}
                    onChange={(e) => setCadeteName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Teléfono del Cadete
                  </label>
                  <input
                    type="text"
                    value={cadetePhone}
                    onChange={(e) => setCadetePhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setCadeteModalOrder(null)}
                  className="py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmCadeteDispatch}
                  className="py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20"
                >
                  Confirmar Envío
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ACTIVE CHAT MODAL OVERLAY */}
        {/* ================================================================ */}
        {activeChatOrder && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="max-w-lg w-full">
              <OrderInternalMessenger
                order={activeChatOrder}
                senderRole="merchant"
                senderName={currentMerchant?.name || 'Comercio'}
                onClose={() => setActiveChatOrder(null)}
                showToast={showToast}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
