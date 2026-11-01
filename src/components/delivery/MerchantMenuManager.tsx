import React, { useState, useRef } from 'react';
import { compressPhoto } from '../../utils/imageCompression';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Camera,
  Upload,
  CheckCircle2,
  X,
  Search,
  DollarSign,
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Bike,
  Save,
  Package
} from 'lucide-react';
import { Merchant, MerchantProduct } from '../../types';
import {
  addMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
  toggleProductAvailability,
  updateMerchantDeliveryFees,
} from '../../lib/deliveryService';

interface MerchantMenuManagerProps {
  merchant: Merchant;
  showToast?: (msg: string) => void;
}

export const MerchantMenuManager: React.FC<MerchantMenuManagerProps> = ({
  merchant,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Especialidades');
  const [price, setPrice] = useState<number | ''>(4500);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Delivery Fee & Extra Delivery state
  const [deliveryFee, setDeliveryFee] = useState<number>(merchant.deliveryFee ?? 800);
  const [extraDeliveryFee, setExtraDeliveryFee] = useState<number>(merchant.extraDeliveryFee ?? 200);
  const [isUpdatingFees, setIsUpdatingFees] = useState(false);

  // Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const products = merchant.products || [];

  const handleSaveDeliveryFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFees(true);
    try {
      await updateMerchantDeliveryFees(merchant.id, deliveryFee, extraDeliveryFee);
      if (showToast) {
        showToast('🚚 ¡Tarifas de delivery y monto extra guardados con éxito!');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al actualizar tarifas de delivery');
    } finally {
      setIsUpdatingFees(false);
    }
  };

  // Categories extracted from existing products or default list
  const existingCategories = Array.from(
    new Set([
      'Pizzas',
      'Hamburguesas',
      'Lomitos',
      'Empanadas',
      'Rotisería',
      'Pastas',
      'Bebidas',
      'Postres',
      ...products.map((p) => p.category),
    ])
  );

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'todos' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open modal to add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory(existingCategories[0] || 'Especialidades');
    setPrice(4500);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600');
    setIsAvailable(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEdit = (p: MerchantProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setIsAvailable(p.isAvailable !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Photo File Upload from Mobile Camera / Gallery or PC
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setFormError(null);
    try {
      // Compress and resize automatically (optimal for Firestore)
      const compressedDataUrl = await compressPhoto(file, 'plato');
      setImageUrl(compressedDataUrl);
      if (showToast) {
        showToast('📷 ¡Foto cargada y optimizada exitosamente!');
      }
    } catch (err: any) {
      console.error('Error al procesar foto:', err);
      setFormError(err.message || 'Error al procesar la foto.');
    } finally {
      setIsUploadingImage(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre del plato.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setFormError('Por favor ingresa un precio válido mayor a 0.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        // Update existing
        await updateMerchantProduct(merchant.id, products, {
          ...editingProduct,
          name: name.trim(),
          category: category.trim(),
          price: Number(price),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          isAvailable,
        });
        if (showToast) showToast(`✅ Plato "${name}" actualizado con éxito.`);
      } else {
        // Add new
        await addMerchantProduct(merchant.id, products, {
          name: name.trim(),
          category: category.trim(),
          price: Number(price),
          description: description.trim(),
          imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
          isAvailable,
        });
        if (showToast) showToast(`🎉 ¡"${name}" agregado al menú de tu local!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setFormError('Error al guardar el plato en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteMerchantProduct(merchant.id, products, productId);
      if (showToast) showToast(`🗑️ "${productName}" eliminado del menú.`);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al eliminar el producto.');
    }
  };

  // Toggle availability (Disponible vs Agotado)
  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await toggleProductAvailability(merchant.id, products, productId, !currentStatus);
      if (showToast) {
        showToast(
          !currentStatus
            ? '🟢 Producto marcado como DISPONIBLE'
            : '🔴 Producto marcado como AGOTADO'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Preset suggested photos
  const suggestedPhotos = [
    { label: '🍕 Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600' },
    { label: '🍔 Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
    { label: '🥩 Lomo', url: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&q=80&w=600' },
    { label: '🍗 Pollo / Fritas', url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=600' },
    { label: '🥟 Empanadas', url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=600' },
    { label: '🥤 Bebida', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600' },
    { label: '🍨 Postre', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              ADMINISTRACIÓN DE CARTA Y MENÚ
            </span>
            <span className="text-xs font-bold text-slate-500">
              ({products.length} platos cargados)
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Platos y Bebidas de {merchant.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Los productos que crees aquí se mostrarán inmediatamente a los clientes con foto, precio y descripción.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agregar Nuevo Plato</span>
        </button>
      </div>

      {/* SECCIÓN: CONFIGURACIÓN DE DELIVERY Y EXTRA DEL COMERCIO */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-3xl p-4 sm:p-5 border border-amber-300/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">
                Tarifas de Delivery & Extra de Despacho del Local
              </h4>
              <p className="text-[11px] text-slate-600">
                Define el costo base de entrega y el monto extra que tu negocio suma al pedido.
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs self-start sm:self-auto">
            Total Envío al Cliente: <strong className="text-orange-600">${(Number(deliveryFee) + Number(extraDeliveryFee)).toLocaleString('es-AR')}</strong>
          </span>
        </div>

        <form onSubmit={handleSaveDeliveryFees} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
              Costo de Envío Base ($ ARS)
            </label>
            <input
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              placeholder="800"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
              Extra del Comercio para Delivery ($ ARS)
            </label>
            <input
              type="number"
              value={extraDeliveryFee}
              onChange={(e) => setExtraDeliveryFee(Number(e.target.value))}
              placeholder="250"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500"
              required
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Monto extra para logística/despacho sumado a cada pedido
            </span>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isUpdatingFees}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUpdatingFees ? 'Guardando...' : 'Guardar Tarifas'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el menú por nombre de plato o ingredientes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="todos">🍽️ Todas las categorías</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-black text-slate-800">
            No hay platos que coincidan con la búsqueda
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Agrega nuevos productos a tu carta para que los clientes puedan hacer sus pedidos.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 py-2 px-4 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear primer plato</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                p.isAvailable === false
                  ? 'border-slate-300 opacity-75 bg-slate-50/50'
                  : 'border-slate-200/90 hover:border-orange-300'
              }`}
            >
              <div>
                {/* Product Image with status badge */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                      {p.category}
                    </span>
                    {p.isAvailable === false && (
                      <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                        🔴 Agotado
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-2.5 right-2.5 bg-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                    ${p.price.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5">
                  <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description || 'Sin descripción ingresada.'}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Toggle Availability Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(p.id, p.isAvailable !== false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    p.isAvailable !== false
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                  }`}
                  title={p.isAvailable !== false ? 'Pausar plato (Agotado)' : 'Habilitar plato'}
                >
                  {p.isAvailable !== false ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-600" />
                      <span>Disponible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-rose-600" />
                      <span>Agotado</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                    title="Editar plato"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors cursor-pointer"
                    title="Eliminar del menú"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: AGREGAR O EDITAR PLATO / PRODUCTO */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingProduct ? 'Editar Plato del Menú' : 'Crear Nuevo Plato para el Menú'}
                </h3>
                <p className="text-xs text-slate-500">
                  {merchant.name} • Los cambios se guardan en la nube al instante
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Plato / Producto *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Pizza Especial Muzzarella y Jamón"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Pizzas, Lomitos, Bebidas..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Precio ($ ARS) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="8500"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Descripción / Ingredientes (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla los ingredientes, porción, cocción o guarnición..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* ============================================================ */}
              {/* SUBIDA DE FOTO DESDE CELULAR O COMPUTADORA */}
              {/* ============================================================ */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Foto del Plato (Celular o PC)
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ Se guarda en base de datos
                  </span>
                </div>

                {/* Hidden File Input supporting Camera and Gallery */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload Action Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>
                      {isUploadingImage
                        ? 'Optimizando foto...'
                        : '📷 Tomar Foto o Subir desde Celular / PC'}
                    </span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Acepta JPG, PNG, fotos de cámara y capturas
                  </span>
                </div>

                {/* Photo Preview */}
                {imageUrl && (
                  <div className="mt-2 relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-white">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full cursor-pointer"
                      title="Quitar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Vista previa de foto
                    </span>
                  </div>
                )}

                {/* Preset Suggestions */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    O selecciona una foto de muestra sugerida:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {suggestPhotos(suggestedPhotos, setImageUrl, imageUrl)}
                  </div>
                </div>
              </div>

              {/* Availability Switch */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-800 block">
                    Estado en el menú
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {isAvailable
                      ? 'Los clientes pueden ordenar este producto.'
                      : 'El producto figura como pausado / agotado.'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? 'Guardando en la base de datos...'
                      : editingProduct
                      ? 'Actualizar Plato'
                      : 'Guardar Plato en la Carta'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for suggested photos list
function suggestPhotos(
  photos: { label: string; url: string }[],
  setImageUrl: (url: string) => void,
  currentUrl: string
) {
  return photos.map((p) => (
    <button
      key={p.label}
      type="button"
      onClick={() => setImageUrl(p.url)}
      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
        currentUrl === p.url
          ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
      }`}
    >
      {p.label}
    </button>
  ));
}
