import React, { useState, useMemo } from 'react';
import {
  Store,
  Search,
  Clock,
  Bike,
  Star,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Filter,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { Merchant, MerchantProduct, OrderItem, UserProfile, Order } from '../../types';
import { DeliveryCheckoutModal } from './DeliveryCheckoutModal';
import { ClientOrderTrackingModal } from './ClientOrderTrackingModal';
import { ServiGoDeliveryLogo } from '../logos/ServiGoDeliveryLogo';
import { ErrorBoundary } from '../ErrorBoundary';

interface CartItem {
  product: MerchantProduct;
  quantity: number;
  notes?: string;
}

interface ClientDeliveryViewProps {
  merchants: Merchant[];
  userProfile: UserProfile;
  activeOrders: Order[];
  showToast?: (msg: string) => void;
  onOpenProfileModal?: () => void;
}

export const ClientDeliveryView: React.FC<ClientDeliveryViewProps> = ({
  merchants,
  userProfile,
  activeOrders,
  showToast,
  onOpenProfileModal,
}) => {
  // Mode: 'dishes' (Elegir por comida en particular / platos) | 'merchants' (Elegir por casa de comidas / comercios)
  const [browseMode, setBrowseMode] = useState<'dishes' | 'merchants'>('dishes');

  // Specific food type filter when in dishes mode
  const [selectedFoodType, setSelectedFoodType] = useState<string>('todos');

  // Merchant category filter when in merchants mode
  const [selectedMerchantCategory, setSelectedMerchantCategory] = useState<string>('todos');

  // Search input
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected merchant (when user chooses a specific store to see ONLY that store)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Internal search and category filter inside a selected merchant
  const [merchantInternalSearch, setMerchantInternalSearch] = useState<string>('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('todos');

  // Shopping Cart State
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Quick food type filters for "Elegir por Comida en Particular"
  const foodQuickFilters = [
    { id: 'todos', label: '🍽️ Todas las Comidas' },
    { id: 'pizza', label: '🍕 Pizzas' },
    { id: 'burger', label: '🍔 Hamburguesas' },
    { id: 'empanada', label: '🥟 Empanadas' },
    { id: 'lomo', label: '🥪 Lomitos & Sandwiches' },
    { id: 'milanesa', label: '🥩 Milanesas' },
    { id: 'papas', label: '🍟 Papas & Picadas' },
    { id: 'pasta', label: '🍝 Pastas' },
    { id: 'saludable', label: '🥗 Tartas & Ensaladas' },
    { id: 'bebida', label: '🥤 Bebidas' },
    { id: 'postre', label: '🍦 Postres & Dulces' },
  ];

  // Business Sectors & Categories for "Elegir por Casa de Comidas"
  const merchantCategories = [
    { id: 'todos', label: '🏪 Todos los Comercios' },
    { id: 'food', label: '🍽️ Casas de Comidas & Gastronomía' },
    { id: 'pharmacy', label: '💊 Farmacias & Salud' },
    { id: 'clothing', label: '👗 Ropa & Calzado' },
    { id: 'grocery', label: '🏪 Kioscos & Almacén' },
    { id: 'hardware', label: '🔧 Ferretería & Hogar' },
    { id: 'pets', label: '🐾 Mascotas & Pet Shop' },
    { id: 'tech', label: '📱 Tecnología & Celulares' },
  ];

  // Flat list of all products across all merchants with their host store info
  const allDishesWithMerchant = useMemo(() => {
    const list: { product: MerchantProduct; merchant: Merchant }[] = [];
    merchants.forEach((m) => {
      if (m.products && Array.isArray(m.products)) {
        m.products.forEach((p) => {
          list.push({ product: p, merchant: m });
        });
      }
    });
    return list;
  }, [merchants]);

  // Filtered dishes when in 'dishes' mode
  const filteredDishes = useMemo(() => {
    return allDishesWithMerchant.filter(({ product, merchant }) => {
      // If food type is selected
      const matchesFoodType = (() => {
        if (selectedFoodType === 'todos') return true;
        const target = selectedFoodType.toLowerCase();
        const pName = product.name.toLowerCase();
        const pCat = product.category.toLowerCase();
        const pDesc = (product.description || '').toLowerCase();

        if (target === 'pizza') return pName.includes('pizza') || pCat.includes('pizza') || pName.includes('fugazzeta');
        if (target === 'burger') return pName.includes('burger') || pName.includes('hamburguesa') || pCat.includes('burger') || pCat.includes('hamburguesa');
        if (target === 'empanada') return pName.includes('empanada') || pCat.includes('empanada');
        if (target === 'lomo') return pName.includes('lomo') || pName.includes('sandwich') || pName.includes('sánguche') || pCat.includes('lomo');
        if (target === 'milanesa') return pName.includes('milanesa') || pName.includes('suprema') || pCat.includes('milanesa');
        if (target === 'papas') return pName.includes('papa') || pName.includes('cono') || pCat.includes('papas');
        if (target === 'pasta') return pName.includes('pasta') || pName.includes('tallarines') || pName.includes('ravioles') || pName.includes('ñoquis') || pCat.includes('pasta');
        if (target === 'saludable') return pName.includes('ensalada') || pName.includes('tarta') || pCat.includes('ensalada');
        if (target === 'bebida') return pName.includes('gaseosa') || pName.includes('coca') || pName.includes('agua') || pName.includes('cerveza') || pCat.includes('bebida');
        if (target === 'postre') return pName.includes('helado') || pName.includes('postre') || pName.includes('alfajor') || pName.includes('flan') || pCat.includes('postre');

        return pName.includes(target) || pCat.includes(target) || pDesc.includes(target);
      })();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        merchant.name.toLowerCase().includes(q);

      return matchesFoodType && matchesSearch;
    });
  }, [allDishesWithMerchant, selectedFoodType, searchQuery]);

  // Filtered merchants when in 'merchants' mode
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchesCategory =
        selectedMerchantCategory === 'todos' ||
        m.businessType === selectedMerchantCategory ||
        m.category.toLowerCase().includes(selectedMerchantCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.products.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );

      return matchesCategory && matchesSearch;
    });
  }, [merchants, selectedMerchantCategory, searchQuery]);

  // Categories inside the currently selected merchant
  const currentMerchantCategories = useMemo(() => {
    if (!selectedMerchant) return ['todos'];
    const cats = Array.from(new Set(selectedMerchant.products.map((p) => p.category)));
    return ['todos', ...cats];
  }, [selectedMerchant]);

  // Products inside the currently selected merchant (with internal filter)
  const currentMerchantProducts = useMemo(() => {
    if (!selectedMerchant) return [];
    return selectedMerchant.products.filter((p) => {
      const matchesCat =
        selectedProductCategory === 'todos' || p.category === selectedProductCategory;
      const q = merchantInternalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [selectedMerchant, selectedProductCategory, merchantInternalSearch]);

  // Active merchant derived from cart or selectedMerchant
  const activeCartMerchant = useMemo(() => {
    if (selectedMerchant) return selectedMerchant;
    const firstCartItem: CartItem | undefined = (Object.values(cart) as CartItem[])[0];
    if (firstCartItem) {
      return merchants.find((m) => m.id === firstCartItem.product.merchantId) || null;
    }
    return null;
  }, [selectedMerchant, cart, merchants]);

  // Cart operations
  const addToCart = (product: MerchantProduct, productMerchant?: Merchant) => {
    const targetMerchant =
      productMerchant ||
      merchants.find((m) => m.id === product.merchantId) ||
      selectedMerchant;

    const cartItemsList: CartItem[] = Object.values(cart);
    const existingProduct = cartItemsList[0]?.product;

    if (existingProduct && existingProduct.merchantId !== product.merchantId) {
      const existingMerchant = merchants.find((m) => m.id === existingProduct.merchantId);
      setCart({});
      if (showToast) {
        showToast(`🛒 Carrito actualizado para comprar en ${targetMerchant?.name || 'este comercio'}`);
      }
    }

    if (targetMerchant && (!selectedMerchant || selectedMerchant.id !== targetMerchant.id)) {
      setSelectedMerchant(targetMerchant);
    }

    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: newQty,
        },
      };
    });

    if (showToast) showToast(`🛒 "${product.name}" agregado al carrito`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...item,
          quantity: newQty,
        },
      };
    });
  };

  const cartList: OrderItem[] = useMemo(() => {
    const items: CartItem[] = Object.values(cart);
    return items.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      price: c.product.price,
      quantity: c.quantity,
      notes: c.notes,
    }));
  }, [cart]);

  const cartTotal = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cartList.reduce((sum, item) => sum + item.quantity, 0);

  // Active client orders that are not delivered/cancelled yet
  const pendingOrActiveOrders = activeOrders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Active Orders Sticky Alert Banner for Client */}
      {pendingOrActiveOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 text-slate-950 shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black">
              <Bike className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md">
                PEDIDO ACTIVO EN CURSO
              </span>
              <h4 className="text-sm font-black text-slate-950 mt-0.5">
                {pendingOrActiveOrders[0].merchantName} • #{pendingOrActiveOrders[0].orderNumber}
              </h4>
              <p className="text-xs font-semibold text-slate-900">
                Estado: <strong>{pendingOrActiveOrders[0].status}</strong> • Toca para ver el seguimiento en vivo
              </p>
            </div>
          </div>

          <button
            onClick={() => setTrackingOrderId(pendingOrActiveOrders[0].id)}
            className="px-3.5 py-2 bg-slate-950 text-amber-300 rounded-xl text-xs font-black hover:bg-slate-900 transition-all shrink-0 cursor-pointer shadow-md"
          >
            Seguir en Vivo
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 1: VISTA EXCLUSIVA DE UN COMERCIO ESPECÍFICO (selectedMerchant) */}
      {/* ================================================================ */}
      {selectedMerchant ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top navigation to return to the catalog */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedMerchant(null);
                setMerchantInternalSearch('');
                setSelectedProductCategory('todos');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-black transition-all border border-slate-200 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-600" />
              <span>Volver a Explorar Comidas y Comercios</span>
            </button>

            <span className="text-[11px] font-black bg-orange-100 text-orange-900 px-3 py-1 rounded-full border border-orange-200">
              Estás viendo solo: <strong>{selectedMerchant.name}</strong>
            </span>
          </div>

          {/* Store Banner & Info */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
            <div className="h-44 sm:h-56 relative">
              <img
                src={selectedMerchant.imageUrl}
                alt={selectedMerchant.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold uppercase bg-orange-600 px-2.5 py-0.5 rounded-md">
                    {selectedMerchant.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{selectedMerchant.rating.toFixed(1)}</span>
                    <span className="text-slate-300">({selectedMerchant.reviewCount})</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black drop-shadow-md">
                  {selectedMerchant.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{selectedMerchant.address}, {selectedMerchant.location}</span>
                </p>
              </div>
            </div>

            {/* Badges footer */}
            <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>{selectedMerchant.deliveryTimeEstimate}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Bike className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    Envío: ${((selectedMerchant.deliveryFee || 0) + (selectedMerchant.extraDeliveryFee || 0)).toLocaleString('es-AR')}
                    {selectedMerchant.extraDeliveryFee && selectedMerchant.extraDeliveryFee > 0 ? (
                      <span className="text-[10px] text-amber-300 ml-1 font-bold">
                        (incl. +${selectedMerchant.extraDeliveryFee} extra del local)
                      </span>
                    ) : null}
                  </span>
                </span>
              </div>

              {selectedMerchant.hasOwnDelivery ? (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cadete propio del comercio
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Despacho con Red ServiGo
                </span>
              )}
            </div>
          </div>

          {/* Internal Search and Category Filters within this Merchant */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <span>Menú Completo de {selectedMerchant.name} ({currentMerchantProducts.length})</span>
              </h3>

              {/* Internal Search inside this merchant */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={merchantInternalSearch}
                  onChange={(e) => setMerchantInternalSearch(e.target.value)}
                  placeholder={`Buscar en ${selectedMerchant.name}...`}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Category pills inside this store */}
            {currentMerchantCategories.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {currentMerchantCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedProductCategory === cat
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'todos' ? '🍽️ Todos los Platos' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid for this Single Merchant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentMerchantProducts.map((product) => {
              const cartQty = cart[product.id]?.quantity || 0;

              return (
                <div
                  key={product.id}
                  className="p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex gap-3.5 justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="pt-1.5 flex items-center gap-2">
                      <span className="text-base font-black text-orange-600">
                        ${product.price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border border-slate-100 shadow-2xs"
                      />
                    )}

                    {/* Add to Cart Quantity control */}
                    {cartQty > 0 ? (
                      <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-xl p-0.5 mt-2">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-orange-600 flex items-center justify-center font-black shadow-xs hover:bg-orange-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-black text-orange-700">
                          {cartQty}
                        </span>
                        <button
                          onClick={() => addToCart(product, selectedMerchant)}
                          className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black shadow-xs hover:bg-orange-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product, selectedMerchant)}
                        className="mt-2 py-1.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================================================================ */
        /* VIEW 2: DIRECTORY WITH SEARCH & DUAL SELECTION MODE */
        /* ================================================================ */
        <div className="space-y-6">
          {/* Header & User Shipping Info Quick Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="space-y-1">
              <ServiGoDeliveryLogo size="md" />
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Pide por comida en particular o elige tu casa de comidas preferida con entrega en minutos.
              </p>
            </div>

            {/* Current Shipping Address button */}
            <button
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold hover:bg-orange-100 transition-all cursor-pointer self-start sm:self-auto"
            >
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-orange-600 font-extrabold uppercase block">
                  Enviar a:
                </span>
                <span className="truncate max-w-[180px] block">
                  {userProfile.deliveryAddress || 'Configurar dirección'}
                </span>
              </div>
            </button>
          </div>

          {/* DUAL MODE SELECTOR: POR COMIDA EN PARTICULAR vs POR CASA DE COMIDAS */}
          <div className="bg-slate-900 p-2 sm:p-2.5 rounded-3xl shadow-lg border border-slate-800">
            <div className="flex items-center gap-2">
              {/* Option 1: Por Comida en Particular */}
              <button
                onClick={() => setBrowseMode('dishes')}
                className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  browseMode === 'dishes'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-300" />
                  <span>🍕 Elegir por Comida en Particular</span>
                </div>
                <span className="text-[10px] font-normal opacity-90 hidden md:inline">
                  (Pizzas, Hamburguesas, Empanadas, Lomitos)
                </span>
              </button>

              {/* Option 2: Por Casa de Comidas */}
              <button
                onClick={() => setBrowseMode('merchants')}
                className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  browseMode === 'merchants'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span>🏪 Elegir por Casa de Comidas</span>
                </div>
                <span className="text-[10px] font-normal opacity-90 hidden md:inline">
                  (Ver solo el menú de ese comercio)
                </span>
              </button>
            </div>
          </div>

          {/* Unified Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                browseMode === 'dishes'
                  ? 'Buscar por comida en particular (ej: Pizza Especial, Empanadas, Lomito, Burger doble)...'
                  : 'Buscar casa de comidas o comercio (ej: Don Antonio, ServiBurger, Farmacia, Kiosco)...'
              }
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* ============================================================== */}
          {/* MODE 1: ELEGIR POR COMIDA EN PARTICULAR (PLATOS Y COMIDAS) */}
          {/* ============================================================== */}
          {browseMode === 'dishes' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick food filters */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Filtrar por tipo de comida:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {foodQuickFilters.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFoodType(food.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedFoodType === food.id
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {food.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count and indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Mostrando <strong className="text-slate-900">{filteredDishes.length}</strong> comidas disponibles en los locales
                </span>
                <span className="text-[11px] text-orange-600 font-bold">
                  Compara precios y opciones de cada local
                </span>
              </div>

              {/* Dishes Grid */}
              {filteredDishes.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 space-y-2">
                  <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-800">
                    No se encontraron comidas que coincidan con tu búsqueda
                  </h4>
                  <p className="text-xs text-slate-500">
                    Prueba buscando "Pizza", "Burger", "Empanada", o explora por Casa de Comidas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDishes.map(({ product, merchant }) => {
                    const cartQty = cart[product.id]?.quantity || 0;

                    return (
                      <div
                        key={`${merchant.id}-${product.id}`}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                      >
                        {/* Food Image & Price Header */}
                        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                          <img
                            src={product.imageUrl || merchant.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                          {/* Price Tag in Image */}
                          <div className="absolute bottom-3 left-3 bg-white/95 text-orange-700 text-sm font-black px-3 py-1 rounded-xl shadow-md">
                            ${product.price.toLocaleString('es-AR')}
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg backdrop-blur-xs">
                            {product.category}
                          </div>
                        </div>

                        {/* Food Body Info */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          </div>

                          {/* Host Food House / Merchant Info */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <button
                                onClick={() => setSelectedMerchant(merchant)}
                                className="flex items-center gap-1.5 text-left font-black text-slate-800 hover:text-orange-600 transition-colors cursor-pointer truncate"
                                title={`Ver solo lo que tiene ${merchant.name}`}
                              >
                                <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span className="truncate">{merchant.name}</span>
                              </button>

                              <span className="text-[10px] text-slate-500 font-bold shrink-0">
                                {merchant.deliveryTimeEstimate}
                              </span>
                            </div>

                            {/* Action Buttons: Add to cart vs View only this store */}
                            <div className="flex items-center gap-2 pt-1">
                              {/* Shortcut to view ONLY this merchant */}
                              <button
                                onClick={() => setSelectedMerchant(merchant)}
                                className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                                title={`Ver solo el menú de ${merchant.name}`}
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                <span>Ver solo este local</span>
                              </button>

                              {/* Add / Quantity */}
                              {cartQty > 0 ? (
                                <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-xl p-0.5">
                                  <button
                                    onClick={() => updateQuantity(product.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-white text-orange-600 flex items-center justify-center font-black shadow-xs hover:bg-orange-100 cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-1.5 text-xs font-black text-orange-700">
                                    {cartQty}
                                  </span>
                                  <button
                                    onClick={() => addToCart(product, merchant)}
                                    className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black shadow-xs hover:bg-orange-500 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(product, merchant)}
                                  className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Pedir</span>
                                </button>
                              )}
                            </div>
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
          {/* MODE 2: ELEGIR POR CASA DE COMIDAS / COMERCIOS */}
          {/* ============================================================== */}
          {browseMode === 'merchants' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Categories Horizontal Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Filtrar comercios por rubro:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {merchantCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedMerchantCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedMerchantCategory === cat.id
                          ? 'bg-slate-950 text-amber-300 shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info text */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Mostrando <strong className="text-slate-900">{filteredMerchants.length}</strong> casas de comida y comercios
                </span>
                <span className="text-[11px] text-slate-500">
                  Toca cualquier local para ver <strong>exclusivamente su menú completo</strong>
                </span>
              </div>

              {/* Merchants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    onClick={() => setSelectedMerchant(merchant)}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Cover Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={merchant.imageUrl}
                        alt={merchant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Delivery time pill */}
                      <div className="absolute bottom-3 left-3 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        <span>{merchant.deliveryTimeEstimate}</span>
                      </div>

                      {/* Rating pill */}
                      <div className="absolute bottom-3 right-3 bg-slate-950/80 text-amber-400 text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 backdrop-blur-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{merchant.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Info Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          {merchant.category}
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">
                            Envío: ${((merchant.deliveryFee || 0) + (merchant.extraDeliveryFee || 0)).toLocaleString('es-AR')}
                          </span>
                          {merchant.extraDeliveryFee && merchant.extraDeliveryFee > 0 ? (
                            <span className="text-[10px] text-amber-700 font-bold block">
                              incl. +${merchant.extraDeliveryFee} extra
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                          {merchant.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium mt-0.5">
                          {merchant.description}
                        </p>
                      </div>

                      {/* Products Preview Chips */}
                      {merchant.products && merchant.products.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {merchant.products.slice(0, 3).map((prod) => (
                            <span
                              key={prod.id}
                              className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              • {prod.name}
                            </span>
                          ))}
                          {merchant.products.length > 3 && (
                            <span className="text-[10px] font-bold text-orange-600">
                              +{merchant.products.length - 3} más
                            </span>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
                        <span>Ver lo que tiene solo este comercio ({merchant.products.length} productos)</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && activeCartMerchant && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40">
          <div className="bg-slate-950 text-white rounded-3xl p-3.5 shadow-2xl border border-orange-500 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                {cartItemCount}
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block truncate">
                  {activeCartMerchant.name}
                </span>
                <span className="text-base font-black text-white">
                  ${(cartTotal + (activeCartMerchant.deliveryFee || 0) + (activeCartMerchant.extraDeliveryFee || 0)).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedMerchant(activeCartMerchant);
                setIsCheckoutOpen(true);
              }}
              className="py-2.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-all shadow-md shadow-orange-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Ir a Pagar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && activeCartMerchant && (
        <ErrorBoundary fallbackTitle="Error al abrir el checkout de entrega">
          <DeliveryCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            merchant={activeCartMerchant}
            cartItems={cartList}
            userProfile={userProfile}
            onOrderCreated={(newOrderId) => {
              setCart({});
              setTrackingOrderId(newOrderId);
            }}
            showToast={showToast}
          />
        </ErrorBoundary>
      )}

      {/* Real-time Order Tracking Modal */}
      {trackingOrderId && (
        <ErrorBoundary fallbackTitle="Error al abrir el seguimiento del pedido">
          <ClientOrderTrackingModal
            orderId={trackingOrderId}
            isOpen={!!trackingOrderId}
            onClose={() => setTrackingOrderId(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
