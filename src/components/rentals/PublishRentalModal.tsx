import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  ShieldCheck,
  DollarSign,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Sparkles,
  Upload,
  Trash2,
  CreditCard,
  User,
  ArrowRight,
  Info
} from 'lucide-react';
import { RentalItem, RentalCategory, RentalItemCondition, RentalOwner } from '../../types';
import { RENTAL_CATEGORIES } from '../../data/mockRentals';
import { subscribeRentalPlatformFee } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

interface PublishRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRentalItem: (item: RentalItem, owner?: RentalOwner) => Promise<void>;
  showToast: (msg: string) => void;
}

export const PublishRentalModal: React.FC<PublishRentalModalProps> = ({
  isOpen,
  onClose,
  onSaveRentalItem,
  showToast,
}) => {
  const [feeRate, setFeeRate] = useState(0.05);
  React.useEffect(() => subscribeRentalPlatformFee(setFeeRate), []);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper: 1: Datos del Dueño (Registro), 2: Datos del Producto & Fotos
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // STEP 1: Owner Registration Data
  const [ownerName, setOwnerName] = useState('');
  const [ownerDni, setOwnerDni] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerLocation, setOwnerLocation] = useState('Alejandro Roca');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [cbuOrAlias, setCbuOrAlias] = useState('');
  const [bankOrMp, setBankOrMp] = useState('Mercado Pago');

  // STEP 2: Product Data
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RentalCategory>('herramientas');
  const [description, setDescription] = useState('');
  const [dailyPrice, setDailyPrice] = useState<number | ''>(15000);
  const [weeklyPrice, setWeeklyPrice] = useState<number | ''>(70000);
  const [depositAmount, setDepositAmount] = useState<number | ''>(30000);
  const [minRentalDays, setMinRentalDays] = useState<number>(1);
  const [condition, setCondition] = useState<RentalItemCondition>('excelente');
  const [zonesStr, setZonesStr] = useState('Alejandro Roca, Los Cisnes, La Carlota');
  const [accessoriesStr, setAccessoriesStr] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(true);

  // Up to 3 images (Base64 or URL)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle file uploads (up to 3 images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - uploadedImages.length;
    if (remainingSlots <= 0) {
      showToast('Ya has alcanzado el límite de 3 imágenes');
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        showToast('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUploadedImages((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, result];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    if (uploadedImages.length >= 3) {
      showToast('Máximo 3 imágenes permitidas');
      return;
    }
    setUploadedImages((prev) => [...prev, manualUrl.trim()]);
    setManualUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Comisión según la tasa configurada por el creador (app_config/rentals)
  const numericDaily = typeof dailyPrice === 'number' ? dailyPrice : 0;
  const platformFee = Math.round(numericDaily * feeRate);
  const ownerNet = numericDaily - platformFee;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !ownerPhone.trim() || !ownerDni.trim()) {
      showToast('Por favor completa Nombre, DNI y Teléfono del propietario');
      return;
    }
    setActiveStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !dailyPrice) {
      showToast('Por favor completa el título y el precio por día');
      return;
    }

    // Default image if none provided
    const finalImages = uploadedImages.length > 0
      ? uploadedImages
      : ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=900'];

    const categoryObj = RENTAL_CATEGORIES.find((c) => c.id === category);
    const categoryLabel = categoryObj ? categoryObj.name : 'Varios';

    const cleanZones = zonesStr
      .split(',')
      .map((z) => z.trim())
      .filter(Boolean);

    const cleanAccessories = accessoriesStr
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const ownerId = user?.uid || `owner-${Date.now()}`;

    const newOwner: any = {
      id: ownerId,
      ownerUid: user?.uid || ownerId,
      createdBy: user?.uid || ownerId,
      name: ownerName.trim(),
      dni: ownerDni.trim(),
      phone: ownerPhone.trim(),
      whatsapp: ownerWhatsapp.trim() || ownerPhone.trim().replace(/\D/g, ''),
      email: ownerEmail.trim() || user?.email || undefined,
      location: ownerLocation.trim() || 'Alejandro Roca',
      address: ownerAddress.trim() || undefined,
      payoutInfo: {
        cbuOrAlias: cbuOrAlias.trim() || 'No informado aún',
        bankOrMp: bankOrMp.trim() || 'Mercado Pago',
        accountHolderName: ownerName.trim(),
      },
      registeredAt: new Date().toISOString(),
    };

    const newItem: RentalItem = {
      id: `rent-${Date.now()}`,
      ownerId,
      ownerUid: user?.uid || ownerId,
      createdBy: user?.uid || ownerId,
      title: title.trim(),
      category,
      categoryLabel,
      description: description.trim() || 'Artículo en perfecto estado de funcionamiento disponible para alquiler temporal.',
      dailyPrice: Number(dailyPrice),
      weeklyPrice: weeklyPrice ? Number(weeklyPrice) : undefined,
      depositAmount: depositAmount ? Number(depositAmount) : 0,
      minRentalDays: minRentalDays || 1,
      location: ownerLocation.trim() || 'Alejandro Roca',
      zones: cleanZones.length > 0 ? cleanZones : ['Alejandro Roca'],
      images: finalImages,
      condition,
      includedAccessories: cleanAccessories,
      ownerName: ownerName.trim(),
      ownerDni: ownerDni.trim(),
      ownerPhone: ownerPhone.trim(),
      ownerWhatsapp: ownerWhatsapp.trim() || ownerPhone.trim().replace(/\D/g, ''),
      ownerCbuOrAlias: cbuOrAlias.trim() || undefined,
      ownerRating: 5.0,
      ownerReviewsCount: 1,
      ownerVerified: true,
      isAvailable: true,
      deliveryAvailable,
      requirements: ['DNI vigente', 'Garantía en depósito reembolsable', 'Firma de contrato de locación'],
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onSaveRentalItem(newItem, newOwner);
      showToast('¡Registro y producto publicado con éxito en ServiGo Alquiler!');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al guardar tu publicación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-6 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-200 block">
                PUBLICÁ GRATIS TU PRODUCTO
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                {activeStep === 1 ? 'Paso 1: Tus Datos de Propietario y Cobro' : 'Paso 2: Datos del Producto y Fotos'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 cursor-pointer ${
              activeStep === 1 ? 'text-orange-600 font-black' : 'text-slate-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${
              activeStep === 1 ? 'bg-orange-600' : 'bg-slate-400'
            }`}>
              1
            </span>
            <span>Tus Datos de Cobro (CBU/Alias)</span>
          </button>

          <ArrowRight className="w-4 h-4 text-slate-400" />

          <button
            type="button"
            onClick={() => {
              if (ownerName.trim() && ownerPhone.trim()) setActiveStep(2);
              else showToast('Completa primero el Paso 1');
            }}
            className={`flex items-center gap-2 cursor-pointer ${
              activeStep === 2 ? 'text-orange-600 font-black' : 'text-slate-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${
              activeStep === 2 ? 'bg-orange-600' : 'bg-slate-400'
            }`}>
              2
            </span>
            <span>Producto & hasta 3 Fotos</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm text-slate-800">
          {/* STEP 1: OWNER REGISTRATION & PAYOUT WALLET */}
          {activeStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs text-orange-950 space-y-1">
                  <span className="font-black block">Cobrás seguro con Mercado Pago</span>
                  <p className="leading-relaxed">
                    Quien alquila paga por Mercado Pago. Vos te quedás con el <strong>{100 - Math.round(feeRate * 100)}% del alquiler</strong>: si vinculás tu Mercado Pago lo cobrás directo; si no, se acumula en tu billetera de ServiGo y pedís la transferencia a tu CBU o alias.
                  </p>
                </div>
              </div>

              {/* Name & DNI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tu Nombre y Apellido completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Carlos Rossi"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    DNI / CUIL (Para contrato legal y cobros) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 34.567.890"
                    value={ownerDni}
                    onChange={(e) => setOwnerDni(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono celular *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: +5493584123456"
                    value={ownerPhone}
                    onChange={(e) => {
                      setOwnerPhone(e.target.value);
                      if (!ownerWhatsapp) setOwnerWhatsapp(e.target.value.replace(/\D/g, ''));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp para coordinar alquileres
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 5493584123456"
                    value={ownerWhatsapp}
                    onChange={(e) => setOwnerWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Location & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Localidad Base *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerLocation}
                    onChange={(e) => setOwnerLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección o barrio (para retiro de cosas)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Av. San Martín 450"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Payout Data: CBU/CVU/Alias */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>¿Dónde deseas recibir tus ganancias por alquileres?</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      CBU / CVU o Alias de Mercado Pago / Banco
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: roberto.herramientas.mp o 00000031..."
                      value={cbuOrAlias}
                      onChange={(e) => setCbuOrAlias(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Entidad / Billetera
                    </label>
                    <select
                      value={bankOrMp}
                      onChange={(e) => setBankOrMp(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Banco Santander">Banco Santander</option>
                      <option value="Banco Nación">Banco Nación</option>
                      <option value="Banco de Córdoba (Bancor)">Banco de Córdoba (Bancor)</option>
                      <option value="Banco Galicia">Banco Galicia</option>
                      <option value="Ualá / Prex / Otra">Ualá / Brubank / Otra CVU</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-3 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
                >
                  <span>Continuar al Paso 2 (Producto & Fotos)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PRODUCT DETAILS & UP TO 3 IMAGES */}
          {activeStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Producto en Alquiler *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Hormigonera 130L con motor reforzado / Parlante 15 pulgadas Bluetooth"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RentalCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  >
                    {RENTAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado del Producto *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as RentalItemCondition)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                  >
                    <option value="nuevo">Nuevo (Sin Uso)</option>
                    <option value="excelente">Excelente Estado</option>
                    <option value="muy_bueno">Muy Bueno</option>
                    <option value="bueno">Bueno / Operativo</option>
                  </select>
                </div>
              </div>

              {/* FOTOS: SUBIR HASTA 3 IMÁGENES */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span className="font-black text-slate-900 text-xs uppercase tracking-wider">
                      Fotos del Producto ({uploadedImages.length}/3 imágenes)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Puedes subir desde tu celular, cámara o archivos
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {/* Upload Action Button */}
                {uploadedImages.length < 3 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-orange-400 bg-orange-50/50 hover:bg-orange-100/50 text-orange-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-orange-600" />
                      <span>Subir foto desde este dispositivo (+ Cámara o Galería)</span>
                    </button>
                  </div>
                )}

                {/* Image Previews Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    {uploadedImages.map((imgSrc, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video sm:aspect-square bg-slate-200 group">
                        <img src={imgSrc} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black">
                          {idx === 0 ? '★ Principal' : `Foto ${idx + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md shadow-xs cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual URL fallback */}
                {uploadedImages.length < 3 && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="O pega aquí una URL de imagen..."
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:border-orange-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Agregar URL
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing & Commission Breakdown */}
              <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-orange-950 mb-1">
                      Precio Alquiler x Día (ARS) *
                    </label>
                    <input
                      type="number"
                      required
                      min={500}
                      placeholder="Ej: 15000"
                      value={dailyPrice}
                      onChange={(e) => setDailyPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white border border-orange-300 rounded-xl p-2 text-xs sm:text-sm font-black text-orange-950 focus:border-orange-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-orange-950 mb-1">
                      Precio x Semana (desc.)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      placeholder="Ej: 70000"
                      value={weeklyPrice}
                      onChange={(e) => setWeeklyPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white border border-orange-300 rounded-xl p-2 text-xs sm:text-sm font-bold text-orange-950 focus:border-orange-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-orange-950 mb-1">
                      Garantía Reembolsable *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Ej: 30000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white border border-orange-300 rounded-xl p-2 text-xs sm:text-sm font-bold text-orange-950 focus:border-orange-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-orange-800 block mt-0.5">Retenida en custodia en ServiGo</span>
                  </div>
                </div>

                {/* Transparent Commission Simulator (Modelo MercadoLibre) */}
                <div className="bg-white p-3 rounded-xl border border-orange-200/80 space-y-1.5 text-xs">
                  <span className="font-black text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Liquidación por cada día alquilado (Comisión ServiGo 10%):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Comisión ServiGo (10%):</span>
                      <span className="font-bold text-orange-600 text-sm">
                        ${platformFee.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[9px] text-slate-400 block">Soporte, custodia y contrato</span>
                    </div>

                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold block">Tu Ganancia Neta ({100 - Math.round(feeRate * 100)}%):</span>
                      <span className="font-black text-emerald-600 text-sm">
                        ${ownerNet.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[9px] text-emerald-700 block">Directo a tu billetera</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Accessories */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción del Producto
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalla qué incluye, cómo funciona, si requiere nafta/cable, recomendaciones..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accesorios incluidos (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cable alargue 15m, 2 micrófonos inalámbricos, funda protectora"
                  value={accessoriesStr}
                  onChange={(e) => setAccessoriesStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Delivery and Min days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="deliveryAvailableCheck"
                    checked={deliveryAvailable}
                    onChange={(e) => setDeliveryAvailable(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded-sm cursor-pointer accent-orange-600"
                  />
                  <label htmlFor="deliveryAvailableCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    🛵 Habilitar Envío con Cadete ServiGo
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alquiler Mínimo (días)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={minRentalDays}
                    onChange={(e) => setMinRentalDays(Number(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  ← Volver a Mis Datos
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Publicar Producto & Registrarme'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
