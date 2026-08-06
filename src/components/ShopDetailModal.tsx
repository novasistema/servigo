import React from 'react';
import {
  X,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Star,
  ExternalLink,
  Tag,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Shop } from '../types';

interface ShopDetailModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  shop,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !shop) return null;

  const whatsappMessage = encodeURIComponent(
    `Hola ${shop.name}, los encontré en la app ServiGo. Quisiera consultar sobre sus productos y servicios.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in duration-200">
        {/* Cover Header */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900">
          <img
            src={shop.imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-all shadow-md z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {shop.verified && (
              <span className="bg-blue-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs border border-blue-400/40">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                Verificado ServiGo
              </span>
            )}
            {shop.discountPartner && (
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Tag className="w-3.5 h-3.5" />
                Socio con Descuento
              </span>
            )}
          </div>

          {/* Shop Header Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                {shop.categoryTitle || shop.category}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{shop.rating.toFixed(1)}</span>
                <span className="text-slate-300 font-normal">({shop.reviewCount} opiniones)</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white drop-shadow-md">
              {shop.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{shop.address}, <strong>{shop.location}</strong></span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Discount Banner Alert */}
          {shop.discountPartner && shop.discountText && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
              <Tag className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                  Beneficio Socio ServiGo
                </h4>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">
                  {shop.discountText}
                </p>
              </div>
            </div>
          )}

          {/* About & Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-500" />
              Sobre el Comercio / Negocio
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {shop.description}
            </p>
          </div>

          {/* Products & Services List */}
          {shop.servicesOrProducts && shop.servicesOrProducts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                Productos, Insumos y Servicios Destacados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shop.servicesOrProducts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Horario de Atención
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{shop.hours}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Zonas de Cobertura
              </span>
              <div className="flex flex-wrap gap-1">
                {shop.zones.map((zone, zIdx) => (
                  <span
                    key={zIdx}
                    className="bg-white border border-slate-300 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    {zone}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`https://wa.me/${shop.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-98"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar por WhatsApp</span>
              </a>

              <a
                href={`tel:${shop.phone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-md active:scale-98"
              >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Llamar al Comercio</span>
              </a>
            </div>

            {shop.mapUrl && (
              <a
                href={shop.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs transition-all text-center mt-2"
              >
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Ver Ubicación en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
