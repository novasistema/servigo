import React, { useState } from 'react';
import { Store, LogIn, AlertCircle, ShieldCheck, Bell, ChefHat } from 'lucide-react';
import { Merchant, MerchantBusinessType } from '../../types';
import { registerMerchant } from '../../lib/deliveryService';
import { useAuth } from '../../context/AuthContext';

interface MerchantSignupViewProps {
  onRegistered: (merchant: Merchant) => void;
  onCancelToClientMode: () => void;
  showToast?: (msg: string) => void;
}

const FOOD_CATEGORIES = [
  'Pizzería',
  'Empanadas',
  'Lomitería / Sandwichería',
  'Hamburguesería',
  'Rotisería',
  'Parrilla',
  'Heladería',
  'Panadería / Confitería',
  'Comida al paso',
  'Otro',
];

const COVER_IMAGES = [
  { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800' },
  { label: 'Hamburguesa', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' },
  { label: 'Empanadas', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800' },
  { label: 'Parrilla', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
];

const inputCls =
  'w-full h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:outline-hidden focus:border-sg-orange';
const labelCls = 'block text-sm font-bold text-slate-800 mb-1.5';

/**
 * Alta de un local de comidas. El acceso es con la misma cuenta de ServiGo
 * (Google o email): no hay usuario ni contraseña aparte.
 */
export const MerchantSignupView: React.FC<MerchantSignupViewProps> = ({ onRegistered, onCancelToClientMode, showToast }) => {
  const { currentUser, openAuthModal } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('30 - 45 min');
  const [deliveryFee, setDeliveryFee] = useState('800');
  const [minOrder, setMinOrder] = useState('3000');
  const [hasOwnDelivery, setHasOwnDelivery] = useState(true);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(COVER_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white border border-slate-200 p-7 text-center space-y-4">
        <span className="w-14 h-14 rounded-2xl bg-sg-orange/15 text-[#b45309] inline-flex items-center justify-center">
          <ChefHat className="w-7 h-7" aria-hidden="true" />
        </span>
        <h2 className="m-0 text-2xl font-black text-slate-900">Recibí pedidos en tu celular</h2>
        <p className="m-0 text-[15px] text-slate-600">
          Ingresá con tu cuenta de ServiGo (Google o email). Con esa misma cuenta vas a entrar siempre al panel de tu local.
        </p>
        <ul className="m-0 p-0 list-none text-left space-y-2.5 max-w-sm mx-auto text-sm text-slate-700">
          <li className="flex gap-2.5"><Bell className="w-5 h-5 text-sg-orange shrink-0" aria-hidden="true" />Aviso con sonido cuando entra un pedido</li>
          <li className="flex gap-2.5"><Store className="w-5 h-5 text-sg-orange shrink-0" aria-hidden="true" />Cargás tu menú con fotos y precios</li>
          <li className="flex gap-2.5"><ShieldCheck className="w-5 h-5 text-sg-orange shrink-0" aria-hidden="true" />Solo vos ves los pedidos de tu local</li>
        </ul>
        <button
          type="button"
          onClick={() => openAuthModal('Ingresá para registrar tu local y recibir pedidos.')}
          className="h-[52px] px-6 rounded-2xl bg-sg-orange text-[#2a1300] font-black text-base inline-flex items-center gap-2 cursor-pointer"
        >
          <LogIn className="w-5 h-5" aria-hidden="true" /> Ingresar para empezar
        </button>
        <div>
          <button type="button" onClick={onCancelToClientMode} className="text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
            Volver a pedir comida
          </button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Poné el nombre de tu local.');
    if (!address.trim()) return setError('Poné la dirección del local.');
    const wa = whatsapp.replace(/\D/g, '');
    if (wa.length < 10) return setError('Poné un WhatsApp válido, con característica (ej: 3584 123456).');

    setIsSubmitting(true);
    const id = `merchant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const businessType: MerchantBusinessType = 'food';
    const merchant: Merchant = {
      id,
      name: name.trim(),
      category,
      businessType,
      description: description.trim() || `${category} en ${address.trim()}.`,
      address: address.trim(),
      location: 'Alejandro Roca',
      phone: wa,
      whatsapp: wa.startsWith('54') ? wa : `549${wa}`,
      imageUrl,
      isOpen: false,
      deliveryTimeEstimate: deliveryTime,
      deliveryFee: Number(deliveryFee) || 0,
      extraDeliveryFee: 0,
      minOrder: Number(minOrder) || 0,
      rating: 0,
      reviewCount: 0,
      hasOwnDelivery,
      products: [],
      ownerUid: currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await registerMerchant(merchant);
      showToast?.(`Listo: "${merchant.name}" quedó registrado. Cargá tu menú y abrí el local.`);
      onRegistered(merchant);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'No se pudo registrar el local. Probá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5">
      <div className="space-y-1">
        <h2 className="m-0 text-2xl font-black text-slate-900">Registrá tu local</h2>
        <p className="m-0 text-sm text-slate-600">
          Queda asociado a tu cuenta <b>{currentUser.email}</b>. Después cargás el menú y abrís cuando quieras.
        </p>
      </div>

      {error && (
        <p role="alert" className="m-0 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="m-name" className={labelCls}>Nombre del local</label>
          <input id="m-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Pizzería La Esquina" />
        </div>
        <div>
          <label htmlFor="m-cat" className={labelCls}>Tipo de comida</label>
          <select id="m-cat" className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="m-wa" className={labelCls}>WhatsApp del local</label>
          <input id="m-wa" className={inputCls} inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="3584 123456" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="m-addr" className={labelCls}>Dirección</label>
          <input id="m-addr" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle y número, Alejandro Roca" />
        </div>
        <div>
          <label htmlFor="m-time" className={labelCls}>Demora aproximada</label>
          <select id="m-time" className={inputCls} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)}>
            {['15 - 30 min', '30 - 45 min', '45 - 60 min', '60 - 90 min'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="m-fee" className={labelCls}>Costo de envío ($)</label>
          <input id="m-fee" className={inputCls} inputMode="numeric" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div>
          <label htmlFor="m-min" className={labelCls}>Pedido mínimo ($)</label>
          <input id="m-min" className={inputCls} inputMode="numeric" value={minOrder} onChange={(e) => setMinOrder(e.target.value.replace(/\D/g, ''))} />
        </div>
        <label className="flex items-center gap-3 h-12 px-3.5 rounded-xl border border-slate-300 self-end cursor-pointer">
          <input type="checkbox" checked={hasOwnDelivery} onChange={(e) => setHasOwnDelivery(e.target.checked)} className="w-5 h-5 accent-[#ff8a1f]" />
          <span className="text-sm font-bold text-slate-800">Tengo cadete propio</span>
        </label>
        <div className="sm:col-span-2">
          <label htmlFor="m-desc" className={labelCls}>Descripción (opcional)</label>
          <textarea id="m-desc" rows={2} className={`${inputCls} h-auto py-2.5`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Pizzas a la piedra y empanadas caseras" />
        </div>
        <fieldset className="sm:col-span-2 m-0 p-0 border-0">
          <legend className={labelCls}>Foto de portada</legend>
          <div className="grid grid-cols-4 gap-2">
            {COVER_IMAGES.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setImageUrl(img.url)}
                aria-pressed={imageUrl === img.url}
                className={`rounded-xl overflow-hidden border-2 cursor-pointer ${imageUrl === img.url ? 'border-sg-orange' : 'border-transparent'}`}
              >
                <img src={img.url} alt={img.label} className="w-full aspect-[4/3] object-cover" />
              </button>
            ))}
          </div>
          <p className="m-0 mt-1.5 text-xs text-slate-500">Después la podés cambiar por una foto de tu local desde el panel.</p>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <button type="button" onClick={onCancelToClientMode} className="h-12 px-5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-6 rounded-xl bg-sg-orange text-[#2a1300] font-black text-base disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? 'Registrando…' : 'Registrar mi local'}
        </button>
      </div>
    </form>
  );
};
