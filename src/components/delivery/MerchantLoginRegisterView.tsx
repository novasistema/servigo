import React, { useState } from 'react';
import {
  Store,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  ChefHat,
  Bike
} from 'lucide-react';
import { Merchant, MerchantBusinessType } from '../../types';
import { registerMerchant, authenticateMerchantLocally } from '../../lib/deliveryService';

interface MerchantLoginRegisterViewProps {
  allMerchants: Merchant[];
  onLoginSuccess: (merchant: Merchant) => void;
  onCancelToClientMode: () => void;
  showToast?: (msg: string) => void;
}

export const MerchantLoginRegisterView: React.FC<MerchantLoginRegisterViewProps> = ({
  allMerchants,
  onLoginSuccess,
  onCancelToClientMode,
  showToast,
}) => {
  // Tab: 'login' vs 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState<MerchantBusinessType>('food');
  const [regCategory, setRegCategory] = useState('Pizzería & Empanadas');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('Alejandro Roca');
  const [regPhone, setRegPhone] = useState('+54 9 358 ');
  const [regWhatsapp, setRegWhatsapp] = useState('549358');
  const [regDeliveryTime, setRegDeliveryTime] = useState('30 - 45 min');
  const [regDeliveryFee, setRegDeliveryFee] = useState<number>(800);
  const [regExtraDeliveryFee, setRegExtraDeliveryFee] = useState<number>(250);
  const [regMinOrder, setRegMinOrder] = useState<number>(3500);
  const [regHasOwnDelivery, setRegHasOwnDelivery] = useState<boolean>(true);
  const [regDescription, setRegDescription] = useState('');
  const [regImageUrl, setRegImageUrl] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Quick Preset Sample Cover Images for various business types
  const sampleImages = [
    { label: '🍕 Comidas', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800' },
    { label: '💊 Farmacia', url: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=800' },
    { label: '👗 Ropa', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800' },
    { label: '🏪 Kiosco', url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800' },
    { label: '🔧 Ferretería', url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=800' },
  ];

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifier.trim() || !password.trim()) {
      setLoginError('Por favor ingresa usuario/email y contraseña.');
      return;
    }

    const authenticated = authenticateMerchantLocally(identifier, password, allMerchants);
    if (!authenticated) {
      setLoginError('Usuario o contraseña incorrectos. Verifica tus credenciales o regístrate.');
      return;
    }

    if (showToast) {
      showToast(`¡Bienvenido ${authenticated.name}! Acceso al panel concedido.`);
    }
    onLoginSuccess(authenticated);
  };

  // Quick demo login fill
  const handleQuickDemoFill = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setLoginError(null);

    // Auto submit
    const auth = authenticateMerchantLocally(user, pass, allMerchants);
    if (auth) {
      if (showToast) showToast(`¡Accediendo como ${auth.name}!`);
      onLoginSuccess(auth);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!regName.trim()) {
      setRegisterError('Por favor ingresa el nombre de tu casa de comidas.');
      return;
    }
    if (!regUsername.trim() || !regPassword.trim()) {
      setRegisterError('Por favor define un usuario y una contraseña.');
      return;
    }
    if (regPassword.length < 4) {
      setRegisterError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Check username collision
    const existing = allMerchants.find(
      (m) =>
        (m.accountUsername && m.accountUsername.toLowerCase() === regUsername.trim().toLowerCase()) ||
        (m.accountEmail && m.accountEmail.toLowerCase() === regEmail.trim().toLowerCase())
    );
    if (existing) {
      setRegisterError('Ese nombre de usuario o email ya está registrado. Elige otro.');
      return;
    }

    setIsSubmitting(true);
    const newId = `merchant-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Create starter products so the merchant has items right away
    const starterProducts = [
      {
        id: `prod-${Date.now()}-1`,
        merchantId: newId,
        name: `Plato Especial de la Casa (${regName})`,
        description: 'Nuestra especialidad destacada elaborada con ingredientes frescos del día.',
        price: 7500,
        imageUrl: regImageUrl,
        category: 'Especialidades',
        isAvailable: true,
      },
      {
        id: `prod-${Date.now()}-2`,
        merchantId: newId,
        name: 'Gaseosa Línea 1.5L',
        description: 'Bebida fría a elección.',
        price: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
        category: 'Bebidas',
        isAvailable: true,
      }
    ];

    const newMerchant: Merchant = {
      id: newId,
      name: regName.trim(),
      category: regCategory,
      businessType: regBusinessType,
      description: regDescription.trim() || `Comercio de ${regCategory} en ${regAddress}.`,
      address: regAddress.trim(),
      location: 'Alejandro Roca',
      phone: regPhone.trim() || '+54 9 358 000-0000',
      whatsapp: regWhatsapp.trim().replace(/\D/g, '') || '5493580000000',
      imageUrl: regImageUrl,
      isOpen: true,
      deliveryTimeEstimate: regDeliveryTime,
      deliveryFee: Number(regDeliveryFee) || 800,
      extraDeliveryFee: Number(regExtraDeliveryFee) || 0,
      minOrder: Number(regMinOrder) || 3000,
      rating: 5.0,
      reviewCount: 1,
      hasOwnDelivery: regHasOwnDelivery,
      products: starterProducts,
      accountUsername: regUsername.trim().toLowerCase(),
      accountEmail: regEmail.trim().toLowerCase() || `${regUsername.trim().toLowerCase()}@servigo.com`,
      accountPassword: regPassword.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await registerMerchant(newMerchant);
      if (showToast) {
        showToast(`🎉 ¡Felicitaciones! "${newMerchant.name}" registrado con éxito. Bienvenido.`);
      }
      onLoginSuccess(newMerchant);
    } catch (err: any) {
      console.error(err);
      setRegisterError(err.message || 'Error al registrar el comercio en la nube.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-3 animate-fadeIn">
      {/* Top Card Security Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden mb-6">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Privacidad y Control de Pedidos</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-orange-400" />
            <span>Portal de Comercios & Locales</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Acceso seguro para Casas de Comida, Farmacias, Ropa, Kioscos, Ferreterías y Comercios Locales. Cada negocio gestiona sus pedidos, carta de productos y extras de delivery de forma privada con usuario y contraseña.
          </p>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
        {/* Toggle Mode: Iniciar Sesión vs Registrar Comercio */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'login'
                ? 'bg-slate-900 text-amber-300 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Iniciar Sesión en mi Local</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setRegisterError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'register'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Nuevo Comercio</span>
          </button>
        </div>

        {/* TAB 1: INICIAR SESIÓN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fadeIn">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Usuario o Email del Comercio
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Tu usuario o email"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:gap-3"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Ingresar a Mi Panel de Pedidos</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

          </form>
        )}

        {/* TAB 2: REGISTRAR NUEVO COMERCIO */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
            {registerError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{registerError}</span>
              </div>
            )}

            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Registra tu comercio (Comidas, Farmacia, Ropa, Kiosco, Ferretería, etc.) y empieza a vender con delivery inmediatamente.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Comercio o Local *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej. Farmacia San Roque, Boutique Urbana, Pizzería Don Antonio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Sector / Tipo de Negocio *
                </label>
                <select
                  value={regBusinessType}
                  onChange={(e) => {
                    const bt = e.target.value as MerchantBusinessType;
                    setRegBusinessType(bt);
                    if (bt === 'clothing') setRegCategory('Ropa & Indumentaria');
                    else if (bt === 'pharmacy') setRegCategory('Farmacia & Perfumería');
                    else if (bt === 'grocery') setRegCategory('Kiosco & Almacén');
                    else if (bt === 'hardware') setRegCategory('Ferretería & Bazar');
                    else if (bt === 'pets') setRegCategory('Veterinaria & Pet Shop');
                    else if (bt === 'tech') setRegCategory('Tecnología & Celulares');
                    else setRegCategory('Pizzas & Empanadas');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="food">🍽️ Gastronomía / Comidas</option>
                  <option value="clothing">👗 Ropa, Calzado & Indumentaria</option>
                  <option value="pharmacy">💊 Farmacia, Salud & Perfumería</option>
                  <option value="grocery">🏪 Kiosco, Almacén & Despensa</option>
                  <option value="hardware">🔧 Ferretería, Sanitarios & Hogar</option>
                  <option value="pets">🐾 Veterinaria & Pet Shop</option>
                  <option value="tech">📱 Tecnología & Accesorios</option>
                  <option value="other">✨ Otro Comercio Local</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Especialidad o Rubro
                </label>
                <input
                  type="text"
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  placeholder="Ej. Ropa Urbana, Medicamentos, Pizzas, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Usuario de Acceso Privado *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ej. elgaucho"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="contacto@elgaucho.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña de Seguridad *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Dirección del Local
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Ej. Av. San Martín 450"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp para Pedidos
                </label>
                <input
                  type="text"
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="5493584881234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Tiempo de Entrega Estimado
                </label>
                <input
                  type="text"
                  value={regDeliveryTime}
                  onChange={(e) => setRegDeliveryTime(e.target.value)}
                  placeholder="Ej. 30 - 45 min"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Costo de Envío Base (ARS)
                </label>
                <input
                  type="number"
                  value={regDeliveryFee}
                  onChange={(e) => setRegDeliveryFee(Number(e.target.value))}
                  placeholder="800"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Extra del Comercio para Delivery ($ ARS)
                </label>
                <input
                  type="number"
                  value={regExtraDeliveryFee}
                  onChange={(e) => setRegExtraDeliveryFee(Number(e.target.value))}
                  placeholder="250"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Monto extra que el comercio cobra y suma al pedido para el delivery.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={regHasOwnDelivery}
                    onChange={(e) => setRegHasOwnDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>🛵 Contamos con cadete propio de reparto (o usamos la red de cadetes ServiGo)</span>
                </label>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Foto de Portada del Comercio (Elige una o pega tu URL)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {sampleImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setRegImageUrl(img.url)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        regImageUrl === img.url
                          ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={regImageUrl}
                  onChange={(e) => setRegImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              <Store className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando en la nube...' : 'Crear Cuenta y Abrir Mi Panel de Cocina'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Link to return to Client / Delivery Catalog */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onCancelToClientMode}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
          >
            ← Volver al modo cliente para pedir comida
          </button>
        </div>
      </div>
    </div>
  );
};
