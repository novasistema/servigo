import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  User,
  Phone,
  MapPin,
  Tag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Building2,
  Camera,
  Upload,
  X,
  RefreshCw,
  CameraOff,
  Check,
  RotateCcw
} from 'lucide-react';
import { Worker, TradeCategory, CustomTradeOption } from '../types';

interface WorkerRegisterFormProps {
  onRegisterSuccess: (newWorker: Worker) => void;
  customTrades?: CustomTradeOption[];
  onAddNewTrade?: (newTrade: CustomTradeOption) => Promise<void>;
}

export const WorkerRegisterForm: React.FC<WorkerRegisterFormProps> = ({
  onRegisterSuccess,
  customTrades = [],
  onAddNewTrade,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [photoSourceType, setPhotoSourceType] = useState<'camera' | 'upload' | 'preset' | null>(null);
  const [trade, setTrade] = useState<TradeCategory>('gasista');
  const [isCreatingCustomTrade, setIsCreatingCustomTrade] = useState(false);
  const [newTradeLabel, setNewTradeLabel] = useState('');
  const [newTradeIcon, setNewTradeIcon] = useState('🛠️');
  const [isSavingNewTrade, setIsSavingNewTrade] = useState(false);
  const [tradeTitle, setTradeTitle] = useState('');

  const handleCreateCustomTrade = async () => {
    if (!newTradeLabel.trim()) return;
    try {
      setIsSavingNewTrade(true);
      const cleanName = newTradeLabel.trim();
      const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `rubro_${Date.now()}`;
      
      const newCustomOption: CustomTradeOption = {
        id: slugId,
        label: cleanName,
        icon: newTradeIcon || '🛠️',
        color: 'bg-orange-100 text-orange-800',
      };

      if (onAddNewTrade) {
        await onAddNewTrade(newCustomOption);
      }

      setTrade(slugId);
      if (!tradeTitle) {
        setTradeTitle(cleanName);
      }
      setIsCreatingCustomTrade(false);
      setNewTradeLabel('');
    } catch (err) {
      console.error('Error creating custom trade:', err);
    } finally {
      setIsSavingNewTrade(false);
    }
  };
  const [matricula, setMatricula] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('San Isidro');
  const [zonesInput, setZonesInput] = useState('San Isidro, Martínez, Tigre, Vicente López');
  const [hourlyRate, setHourlyRate] = useState<number>(18000);
  const [visitFee, setVisitFee] = useState<number>(12000);
  const [days, setDays] = useState<string[]>([
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ]);
  const [hours, setHours] = useState('08:00 - 18:00');
  const [urgencies24h, setUrgencies24h] = useState(false);
  const [bio, setBio] = useState('');
  const [servicesList, setServicesList] = useState<string[]>([
    'Atención inmediata y presupuestos sin compromiso',
    'Trabajos garantizados con materiales aprobados',
  ]);
  const [newService, setNewService] = useState('');
  const [ferreteroPartner, setFerreteroPartner] = useState(true);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Tu navegador o dispositivo no soporta el acceso directo a la cámara.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.error('Error playing video:', err));
        }
      }, 100);
    } catch (err: any) {
      console.error('Error opening camera:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Revisa que hayas otorgado permisos de cámara en tu navegador.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    // Square photo capture
    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw centered cropped frame
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;

      // Flip horizontally for natural selfie perspective
      ctx.translate(400, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setAvatar(dataUrl);
      setPhotoSourceType('camera');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          setPhotoSourceType('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Suggested Avatars for quick selection
  const avatarOptions = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
  ];

  const toggleDay = (dayName: string) => {
    if (days.includes(dayName)) {
      setDays(days.filter((d) => d !== dayName));
    } else {
      setDays([...days, dayName]);
    }
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServicesList([...servicesList, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServicesList(servicesList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('Por favor completa tu nombre y número de contacto.');
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '') || phone.replace(/\D/g, '');
    const zonesArray = zonesInput
      .split(',')
      .map((z) => z.trim())
      .filter((z) => z.length > 0);

    const generatedWorker: Worker = {
      id: `w-custom-${Date.now()}`,
      name,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
      trade,
      tradeTitle:
        tradeTitle ||
        `${trade.charAt(0).toUpperCase() + trade.slice(1)} Profesional Especializado`,
      matricula: matricula ? `Matrícula N° ${matricula}` : undefined,
      phone,
      whatsapp: cleanWhatsapp,
      location,
      zones: zonesArray.length > 0 ? zonesArray : [location],
      rating: 5.0,
      reviewCount: 1,
      completedJobs: 1,
      verified: true,
      ferreteroPartner,
      hourlyRate: Number(hourlyRate) || 15000,
      visitFee: Number(visitFee) || 10000,
      availability: {
        days: days.length > 0 ? days : ['Lunes a Viernes'],
        hours: hours || '08:00 - 18:00',
        urgencies24h,
      },
      bio: bio || 'Profesional comprometido con la calidad, rapidez y seguridad.',
      services: servicesList,
      gallery: [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=500',
      ],
      reviews: [
        {
          id: `rev-initial-${Date.now()}`,
          clientName: 'Cliente Verificado ServiGo',
          rating: 5,
          date: 'Reciente',
          serviceType: 'Alta en plataforma ServiGo',
          comment: 'Bienvenido a ServiGo auspiciado por Ferretería Bruzzone.',
          tags: ['Matriculado', 'Excelente Atención'],
        },
      ],
    };

    onRegisterSuccess(generatedWorker);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold">
          <Wrench className="w-3.5 h-3.5" />
          <span>Ingreso para Trabajadores y Profesionales</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">Únete a ServiGo</h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
          Publica tus datos, especialidad, disponibilidad y tarifas. Consigue clientes locales de forma rápida y segura con el auspicio de <strong>Ferretería Bruzzone</strong>.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <button
          onClick={() => setStep(1)}
          className={`p-2.5 rounded-2xl font-bold border-2 transition-all ${
            step === 1
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          1. Datos y Oficio
        </button>

        <button
          onClick={() => setStep(2)}
          className={`p-2.5 rounded-2xl font-bold border-2 transition-all ${
            step === 2
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          2. Tarifas y Horarios
        </button>

        <button
          onClick={() => setStep(3)}
          className={`p-2.5 rounded-2xl font-bold border-2 transition-all ${
            step === 3
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          3. Servicios y Alianza
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* STEP 1: PERSONAL DATA & TRADE */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre y Apellido Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Manuel Pérez"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Trade Category */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Rubro / Oficio Principal *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomTrade(true)}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Crear Rubro</span>
                    </button>
                  </div>
                  <select
                    value={isCreatingCustomTrade ? 'CREATE_NEW' : trade}
                    onChange={(e) => {
                      if (e.target.value === 'CREATE_NEW') {
                        setIsCreatingCustomTrade(true);
                      } else {
                        setIsCreatingCustomTrade(false);
                        setTrade(e.target.value as TradeCategory);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="gasista">🔥 Gasista Matriculado</option>
                    <option value="electricista">⚡ Electricista</option>
                    <option value="plomero">🚰 Plomero / Sanitarista</option>
                    <option value="pintor">🎨 Pintor</option>
                    <option value="cerrajero">🔑 Cerrajero 24hs</option>
                    <option value="aire_acondicionado">❄️ Aire Acondicionado / Refrigeración</option>
                    <option value="albanil">🧱 Albañil / Obras</option>
                    <option value="jardineria">🌿 Jardines y Poda</option>
                    <option value="carpinteria">🪚 Carpintería</option>
                    <option value="fletes">🚚 Fletes y Mudanzas</option>
                    {customTrades.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.icon || '🛠️'} {ct.label}
                      </option>
                    ))}
                    <option value="CREATE_NEW">➕ ¿No está tu rubro? Crear nuevo rubro...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título o Especialidad
                  </label>
                  <input
                    type="text"
                    value={tradeTitle}
                    onChange={(e) => setTradeTitle(e.target.value)}
                    placeholder="Ej. Gasista Matriculado Metrogas Cat. 1"
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Inline Custom Trade Creator Card */}
              {isCreatingCustomTrade && (
                <div className="p-4 bg-orange-50/90 border-2 border-orange-300 rounded-2xl space-y-3 animate-fadeIn shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-orange-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>Crear Nuevo Rubro / Oficio</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomTrade(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre del Nuevo Rubro *
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newTradeLabel}
                      onChange={(e) => setNewTradeLabel(e.target.value)}
                      placeholder="Ej. Herrería, Fumigación, Tapicero, Reparación de PC..."
                      className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Selecciona un Icono / Emoji
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['🛠️', '⚙️', '🔨', '🧰', '🛋️', '💻', '🧹', '🚗', '🛡️', '📦', '🏠', '🔒', '📱', '💡', '🚿', '🪟', '🛏️', '🔑', '⚡'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewTradeIcon(emoji)}
                          className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-transform ${
                            newTradeIcon === emoji ? 'bg-orange-500 text-white scale-110 shadow-sm' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomTrade(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!newTradeLabel.trim() || isSavingNewTrade}
                      onClick={handleCreateCustomTrade}
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      {isSavingNewTrade ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Guardar y Seleccionar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Matrícula (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Matrícula (Si posees)
              </label>
              <div className="relative">
                <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ej. Matrícula N° 58920 (Metrogas / APSE / CACAAV)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Phones & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono de Contacto *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +54 9 11 4589-2011"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de WhatsApp (con código de área)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej. 5491145892011"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Location & Coverage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Localidad Principal / Barrio *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. San Isidro"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Zonas de Cobertura (Separadas por coma)
                </label>
                <input
                  type="text"
                  value={zonesInput}
                  onChange={(e) => setZonesInput(e.target.value)}
                  placeholder="Ej. San Isidro, Martínez, Tigre, Vicente López"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Hidden Canvas for Camera Frame Capture */}
            <canvas ref={canvasRef} className="hidden" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Photo Identification Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-orange-600" />
                    <span>Fotografía de Identificación del Trabajador *</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Para mayor seguridad y confianza con el cliente
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 font-medium">
                  Tómate una foto o selfie en vivo para validar tu identidad como prestador de servicios en ServiGo.
                </p>
              </div>

              {/* LIVE CAMERA CAPTURE MODE */}
              {isCameraActive ? (
                <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center animate-fadeIn">
                  <div className="relative max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-orange-500 shadow-xl bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover transform -scale-x-100"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-amber-400 text-[10px] font-black px-2 py-1 rounded-full border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Cámara en Vivo
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={takePhoto}
                      className="py-2.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>¡Tomar Foto Ahora!</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CAMERA CLOSED - PREVIEW OR CAPTURE BUTTONS */
                <div className="space-y-4">
                  {cameraError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2">
                      <CameraOff className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {avatar ? (
                    /* PREVIEW OF CAPTURED/SELECTED PHOTO */
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl">
                      <div className="relative shrink-0">
                        <img
                          src={avatar}
                          alt="Foto de perfil cargada"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            {photoSourceType === 'camera'
                              ? '📸 Foto Capturada con Cámara'
                              : photoSourceType === 'upload'
                              ? '📁 Foto Subida desde Galería'
                              : '👤 Foto Seleccionada'}
                          </span>
                          <h4 className="text-xs font-black text-slate-800 mt-1">
                            Foto lista para tu perfil profesional
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Sacar Otra Foto con Cámara</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir de Galería</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ACTION BUTTONS TO TAKE OR UPLOAD PHOTO */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-4 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <span>Sacar Foto con Cámara (Selfie)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-4 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-slate-600" />
                        </div>
                        <span>Subir Foto de Galería / Archivo</span>
                      </button>
                    </div>
                  )}

                  {/* PRESET AVATARS & URL FALLBACK */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-500">
                      O elige una foto prediseñada:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {avatarOptions.map((optUrl, idx) => (
                        <img
                          key={idx}
                          src={optUrl}
                          alt={`Opción avatar ${idx + 1}`}
                          onClick={() => {
                            setAvatar(optUrl);
                            setPhotoSourceType('preset');
                          }}
                          className={`w-11 h-11 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                            avatar === optUrl
                              ? 'border-orange-600 scale-105 shadow-md'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>

                    <input
                      type="text"
                      value={avatar.startsWith('data:') ? '' : avatar}
                      onChange={(e) => {
                        setAvatar(e.target.value);
                        setPhotoSourceType('preset');
                      }}
                      placeholder="O pega el enlace URL directo de tu foto de perfil..."
                      className="w-full py-2 px-3 bg-white border border-slate-200 rounded-2xl text-[11px] text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Continuar a Tarifas y Horarios →
            </button>
          </div>
        )}

        {/* STEP 2: RATES & SCHEDULE */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarifa estimada por hora ($ ARS) *
                </label>
                <input
                  type="number"
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Costo de Visita / Diagnóstico ($ ARS)
                </label>
                <input
                  type="number"
                  value={visitFee}
                  onChange={(e) => setVisitFee(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Días de Atención Disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(
                  (dayName) => {
                    const isSelected = days.includes(dayName);
                    return (
                      <button
                        key={dayName}
                        type="button"
                        onClick={() => toggleDay(dayName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {dayName}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rango Horario Habitual
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Ej. 08:00 - 18:00"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 24h Toggle */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Atención de Urgencias 24 Horas</span>
                <span className="text-[11px] text-slate-500">
                  Aparecerás destacadamente en el filtro de Urgencias nocturnas y de fin de semana.
                </span>
              </div>
              <input
                type="checkbox"
                checked={urgencies24h}
                onChange={(e) => setUrgencies24h(e.target.checked)}
                className="w-5 h-5 accent-orange-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                ← Volver
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Siguiente: Servicios y Alianza →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SERVICES & BRUZZONE ALLIANCE */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Presentación / Biografía Corta
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuenta brevemente tu experiencia, garantía de trabajo, herramientas que utilizas..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Custom Services List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Servicios Específicos que Realizas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Ej. Instalación de termotanque solar, colocación de disyuntores..."
                  className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              <div className="space-y-1.5">
                {servicesList.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <span>• {srv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ferretería Bruzzone Alliance Checkbox */}
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-black text-orange-900">
                    Alianza Ferretería Bruzzone Partner
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={ferreteroPartner}
                  onChange={(e) => setFerreteroPartner(e.target.checked)}
                  className="w-5 h-5 accent-orange-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                Al activar esta opción, otorgarás un 10% de descuento en mano de obra a clientes que adquieran sus insumos en Ferretería Bruzzone. A cambio, obtendrás prioridad de posición en el buscador y el sello oficial de profesional aliado.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                ← Volver
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Publicar Perfil de Trabajador</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
