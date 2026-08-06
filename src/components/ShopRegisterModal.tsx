import React, { useState } from 'react';
import {
  X,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Building2,
  CheckCircle2,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { Shop } from '../types';
import { normalizeZoneKey } from '../lib/zoneUtils';

interface ShopRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitShop: (newShop: Shop) => void;
  availableZones?: string[];
}

export const ShopRegisterModal: React.FC<ShopRegisterModalProps> = ({
  isOpen,
  onClose,
  onSubmitShop,
  availableZones = ['Alejandro Roca', 'Río Cuarto', 'La Carlota', 'San Isidro', 'Vicente López', 'Tigre'],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'ferreteria',
    categoryTitle: 'Ferretería & Insumos',
    description: '',
    address: '',
    location: availableZones[0] || 'Alejandro Roca',
    zones: [availableZones[0] || 'Alejandro Roca'],
    phone: '',
    whatsapp: '',
    email: '',
    hours: 'Lun a Vie 08:00 - 12:30 / 16:00 - 20:00, Sáb 08:30 - 13:00',
    discountPartner: false,
    discountText: '10% OFF para usuarios de ServiGo',
    imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
    servicesInput: 'Herramientas, Insumos, Repuestos',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { value: 'ferreteria', label: 'Ferretería & Herramientas', title: 'Ferretería & Insumos' },
    { value: 'taller_mecanico', label: 'Taller Mecánico & Autos', title: 'Taller Mecánico & GNC' },
    { value: 'sanitarios_plomeria', label: 'Sanitarios, Plomería & Gas', title: 'Bulonera & Sanitarios' },
    { value: 'electricidad', label: 'Electricidad & Iluminación', title: 'Electricidad & LED' },
    { value: 'corralon_materiales', label: 'Corralón & Materiales', title: 'Corralón de Materiales' },
    { value: 'pintureria', label: 'Pinturería & Revestimientos', title: 'Pinturería' },
    { value: 'repuestos', label: 'Repuestos & Accesorios', title: 'Repuestos' },
    { value: 'servicios_tecnicos', label: 'Servicios Técnicos & Reparaciones', title: 'Servicio Técnico' },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = categories.find((c) => c.value === e.target.value);
    setFormData({
      ...formData,
      category: e.target.value,
      categoryTitle: selected?.title || 'Comercio Local',
    });
  };

  const handleZoneToggle = (zone: string) => {
    const norm = normalizeZoneKey(zone);
    const exists = formData.zones.some((z) => normalizeZoneKey(z) === norm);
    if (exists) {
      if (formData.zones.length > 1) {
        setFormData({
          ...formData,
          zones: formData.zones.filter((z) => normalizeZoneKey(z) !== norm),
        });
      }
    } else {
      setFormData({
        ...formData,
        zones: [...formData.zones, zone],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return;

    setIsSubmitting(true);

    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, '') || formData.phone.replace(/\D/g, '');

    const servicesList = formData.servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      categoryTitle: formData.categoryTitle,
      description: formData.description.trim() || 'Comercio local verificado en la red ServiGo.',
      address: formData.address.trim(),
      location: formData.location,
      zones: formData.zones.length > 0 ? formData.zones : [formData.location],
      phone: formData.phone.trim(),
      whatsapp: cleanWhatsapp.startsWith('549') ? cleanWhatsapp : `549${cleanWhatsapp}`,
      email: formData.email.trim(),
      hours: formData.hours.trim() || 'Lun a Vie 08:00 - 18:00',
      rating: 5.0,
      reviewCount: 1,
      verified: true,
      discountPartner: formData.discountPartner,
      discountText: formData.discountPartner ? formData.discountText : undefined,
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
      featured: false,
      servicesOrProducts: servicesList.length > 0 ? servicesList : ['Atención al cliente', 'Insumos y Repuestos'],
      mapUrl: `https://maps.google.com/?q=${encodeURIComponent(formData.address + ' ' + formData.location)}`,
      createdAt: new Date().toISOString(),
    };

    onSubmitShop(newShop);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Registrar mi Comercio / Taller
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Suma tu negocio a la guía local de ServiGo y conecta con clientes en tu zona.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre del Comercio */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-orange-500" />
                Nombre del Comercio / Negocio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Ferretería Central Bruzzone / Taller El Tuerca"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                Rubro / Categoría *
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold bg-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad Principal */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Localidad Principal *
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold bg-white"
              >
                {availableZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                Dirección Completa *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Av. San Martín 450, Centro"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Teléfono y WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                Teléfono de Contacto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: +54 9 358 412-3456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                Número de WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 5493584123456"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Horarios */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Horarios de Atención *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Lun a Vie 08:00 - 12:30 / 16:00 - 20:00, Sáb 08:30 - 13:00"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                Descripción del Comercio y Servicios
              </label>
              <textarea
                rows={3}
                placeholder="Cuéntanos brevemente qué productos o servicios ofrecen, marcas con las que trabajan, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Productos/Servicios destacados (separados por coma) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                Productos o Servicios Destacados (Separados por coma)
              </label>
              <input
                type="text"
                placeholder="Ej: Herramientas DeWalt, Caños Termofusión, Pintura Alba, Atención 24hs"
                value={formData.servicesInput}
                onChange={(e) => setFormData({ ...formData, servicesInput: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Foto URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                URL de Foto del Local / Fachada (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Cobertura de Zonas */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider block">
                Zonas Cercanas donde ofrecen Atencion / Reparto
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableZones.map((zone) => {
                  const norm = normalizeZoneKey(zone);
                  const isSelected = formData.zones.some((z) => normalizeZoneKey(z) === norm);
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => handleZoneToggle(zone)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all border ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${zone}` : `+ ${zone}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ofrecer Descuento a Usuarios de ServiGo */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.discountPartner}
                  onChange={(e) => setFormData({ ...formData, discountPartner: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                />
                <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-600" />
                  ¿Ofreces un descuento o beneficio a los clientes/técnicos de ServiGo?
                </span>
              </label>

              {formData.discountPartner && (
                <div className="space-y-1 pl-6">
                  <label className="text-[11px] font-bold text-amber-900 block">
                    Detalle de la Promoción / Descuento:
                  </label>
                  <input
                    type="text"
                    value={formData.discountText}
                    onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                    placeholder="Ej: 10% OFF en insumos abonando en efectivo"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-amber-950 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-600/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar mi Comercio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
