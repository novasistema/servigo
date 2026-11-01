import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  UserPlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Wrench,
  MapPin,
  Phone,
  MessageCircle,
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  Award,
  DollarSign,
  GraduationCap,
  Building2,
  AlertCircle
} from 'lucide-react';
import { JobProfile, TradeCategory, WorkExperienceItem, EducationItem } from '../../types';
import { TRADE_NAMES } from '../../data/mockData';
import { JobProfileDetailModal } from './JobProfileDetailModal';
import { AiCvAssistantModal } from './AiCvAssistantModal';

interface JobBoardSectionProps {
  jobProfiles: JobProfile[];
  onSaveJobProfile: (profile: JobProfile) => Promise<void>;
  showToast?: (msg: string) => void;
  availableZones?: string[];
}

export const JobBoardSection: React.FC<JobBoardSectionProps> = ({
  jobProfiles,
  onSaveJobProfile,
  showToast,
  availableZones = ['Alejandro Roca', 'Río Cuarto', 'La Carlota', 'General Cabrera'],
}) => {
  // Navigation tabs within Bolsa de Trabajo: 'candidates' (view CVs) vs 'post_cv' (submit CV)
  const [viewMode, setViewMode] = useState<'candidates' | 'post_cv'>('candidates');

  // Search & Filter state for candidates view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [minExperience, setMinExperience] = useState<number | 'all'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'jornada_completa' | 'medio_tiempo' | 'inmediata' | 'por_proyecto'>('all');
  const [onlyMatriculados, setOnlyMatriculados] = useState(false);
  const [onlyWithVehicle, setOnlyWithVehicle] = useState(false);
  const [onlyImmediate, setOnlyImmediate] = useState(false);

  // Selected profile for modal
  const [selectedProfileForModal, setSelectedProfileForModal] = useState<JobProfile | null>(null);

  // AI Assistant modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Form state for creating a new CV
  const [fullName, setFullName] = useState('');
  const [trade, setTrade] = useState<string>('electricista');
  const [desiredTitle, setDesiredTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Alejandro Roca');
  const [zones, setZones] = useState<string[]>(['Alejandro Roca', 'Río Cuarto']);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
  const [availability, setAvailability] = useState<'inmediata' | 'jornada_completa' | 'medio_tiempo' | 'por_proyecto'>('inmediata');
  const [hasOwnVehicle, setHasOwnVehicle] = useState(true);
  const [hasOwnTools, setHasOwnTools] = useState(true);
  const [isMatriculado, setIsMatriculado] = useState(false);
  const [matriculaNumber, setMatriculaNumber] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([
    'Herramientas propias',
    'Puntualidad y prolijidad',
    'Resolución de urgencias'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([
    {
      id: 'exp-init-1',
      role: 'Oficial de Mantenimiento e Instalaciones',
      companyOrProject: 'Trabajos Particulares y Obras',
      period: '2022 - Presente',
      description: 'Realización de instalaciones y reparaciones con garantía de calidad y atención personalizada.'
    }
  ]);
  const [certifications, setCertifications] = useState<string[]>([
    'Normas de Seguridad e Higiene'
  ]);
  const [newCertInput, setNewCertInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered profiles logic
  const filteredProfiles = useMemo(() => {
    return jobProfiles.filter((p) => {
      // Trade filter
      if (selectedTrade !== 'all' && p.trade !== selectedTrade) {
        return false;
      }

      // Zone filter
      if (selectedZone !== 'all') {
        const matchesLoc = p.location.toLowerCase().includes(selectedZone.toLowerCase());
        const matchesZones = p.zones && p.zones.some((z) => z.toLowerCase().includes(selectedZone.toLowerCase()));
        if (!matchesLoc && !matchesZones) return false;
      }

      // Years of experience filter (p.yearsOfExperience >= minExperience)
      if (minExperience !== 'all') {
        const candidateExp = Number(p.yearsOfExperience || 0);
        if (candidateExp < Number(minExperience)) {
          return false;
        }
      }

      // Availability filter (full-time, part-time, inmediata, por_proyecto)
      if (selectedAvailability !== 'all') {
        if (p.availability !== selectedAvailability) {
          return false;
        }
      }

      // Matriculado toggle
      if (onlyMatriculados && !p.isMatriculado) {
        return false;
      }

      // Vehicle toggle
      if (onlyWithVehicle && !p.hasOwnVehicle) {
        return false;
      }

      // Immediate toggle (if clicked separately)
      if (onlyImmediate && p.availability !== 'inmediata') {
        return false;
      }

      // Search query (name, skills, summary, title, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = p.fullName.toLowerCase().includes(q);
        const inTitle = p.desiredTitle?.toLowerCase().includes(q);
        const inSummary = p.summary?.toLowerCase().includes(q);
        const inTrade = (TRADE_NAMES[p.trade as keyof typeof TRADE_NAMES] || p.trade).toLowerCase().includes(q);
        const inSkills = p.skills?.some((s) => s.toLowerCase().includes(q));
        const inLocation = p.location.toLowerCase().includes(q);
        if (!inName && !inTitle && !inSummary && !inTrade && !inSkills && !inLocation) {
          return false;
        }
      }

      return true;
    });
  }, [
    jobProfiles,
    selectedTrade,
    selectedZone,
    minExperience,
    selectedAvailability,
    onlyMatriculados,
    onlyWithVehicle,
    onlyImmediate,
    searchQuery,
  ]);

  // Handle adding skill tag
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Handle adding certification tag
  const handleAddCert = () => {
    if (newCertInput.trim() && !certifications.includes(newCertInput.trim())) {
      setCertifications([...certifications, newCertInput.trim()]);
      setNewCertInput('');
    }
  };

  const handleRemoveCert = (certToRemove: string) => {
    setCertifications(certifications.filter((c) => c !== certToRemove));
  };

  // Handle experience item actions
  const handleAddExperience = () => {
    const newItem: WorkExperienceItem = {
      id: `exp-${Date.now()}`,
      role: '',
      companyOrProject: '',
      period: '',
      description: ''
    };
    setExperiences([...experiences, newItem]);
  };

  const handleUpdateExperience = (id: string, field: keyof WorkExperienceItem, value: string) => {
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  // Apply AI Generated CV
  const handleApplyAiCv = (aiData: any) => {
    if (aiData.desiredTitle) setDesiredTitle(aiData.desiredTitle);
    if (aiData.summary) setSummary(aiData.summary);
    if (aiData.keySkills && Array.isArray(aiData.keySkills)) {
      setSkills(Array.from(new Set([...skills, ...aiData.keySkills])));
    }
    if (aiData.experienceHighlights && Array.isArray(aiData.experienceHighlights)) {
      const formatted: WorkExperienceItem[] = aiData.experienceHighlights.map((eh: any, idx: number) => ({
        id: `exp-ai-${idx}-${Date.now()}`,
        role: eh.role || 'Oficial de Obra',
        companyOrProject: eh.companyOrProject || 'Contratistas de la Zona',
        period: eh.period || '2021 - Presente',
        description: eh.description || ''
      }));
      setExperiences(formatted);
    }
    if (aiData.recommendedCertifications && Array.isArray(aiData.recommendedCertifications)) {
      setCertifications(Array.from(new Set([...certifications, ...aiData.recommendedCertifications])));
    }
    if (showToast) {
      showToast('✨ ¡Currículum optimizado con IA aplicado al formulario!');
    }
  };

  // Submit CV Form
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !summary.trim()) {
      alert('Por favor completa al menos Nombre, Teléfono y Resumen Profesional.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProfile: JobProfile = {
        id: `job-cv-${Date.now()}`,
        fullName: fullName.trim(),
        trade,
        desiredTitle: desiredTitle.trim() || `${TRADE_NAMES[trade as keyof typeof TRADE_NAMES] || trade} Profesional`,
        phone: phone.trim(),
        whatsapp: (whatsapp.trim() || phone.trim()).replace(/\D/g, ''),
        email: email.trim() || undefined,
        location: location.trim(),
        zones: zones.length > 0 ? zones : [location.trim()],
        yearsOfExperience: Number(yearsOfExperience) || 1,
        availability,
        hasOwnVehicle,
        hasOwnTools,
        isMatriculado,
        matriculaNumber: isMatriculado ? matriculaNumber.trim() : undefined,
        salaryExpectation: salaryExpectation.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        summary: summary.trim(),
        skills: skills.length > 0 ? skills : ['Herramientas propias', 'Prolijidad'],
        experience: experiences.filter((exp) => exp.role.trim() || exp.companyOrProject.trim()),
        education: [],
        certifications,
        createdAt: new Date().toISOString(),
      };

      await onSaveJobProfile(newProfile);
      if (showToast) {
        showToast('🎉 ¡Tu Currículum Vitae fue publicado exitosamente en la Bolsa de Trabajo!');
      }

      // Switch to candidates view and select this profile
      setViewMode('candidates');
      setSelectedProfileForModal(newProfile);
    } catch (err) {
      console.error('Error saving job profile:', err);
      alert('Error al publicar el currículum. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Top Banner & Module Header */}
      <div role="tablist" aria-label="Bolsa de trabajo" className="inline-flex w-full sm:w-auto gap-1 p-1 rounded-2xl bg-slate-200/70">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'candidates'}
          onClick={() => setViewMode('candidates')}
          className={`flex-1 sm:flex-none h-11 px-4 rounded-xl text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'candidates' ? 'bg-white text-slate-900 font-extrabold shadow-xs' : 'text-slate-600 font-semibold'
          }`}
        >
          <Briefcase className="w-4 h-4" aria-hidden="true" /> Buscar personal
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'post_cv'}
          onClick={() => setViewMode('post_cv')}
          className={`flex-1 sm:flex-none h-11 px-4 rounded-xl text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'post_cv' ? 'bg-white text-slate-900 font-extrabold shadow-xs' : 'text-slate-600 font-semibold'
          }`}
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" /> Cargar mi CV
        </button>
      </div>

      {/* ==================================================================== */}
      {/* VISTA 1: CANDIDATOS DISPONIBLES (PARA EMPLEADORES Y CLIENTES)       */}
      {/* ==================================================================== */}
      {viewMode === 'candidates' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Search and Filters Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
            {/* Search Input & Zone Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, especialidad (ej. termofusión, tableros, durlock)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-5 relative">
                <MapPin className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="all">📍 Todas las localidades</option>
                  {availableZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trade Categories Pills Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedTrade('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTrade === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Todos los Oficios
              </button>

              {Object.entries(TRADE_NAMES).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTrade(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedTrade === key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* BARRA DE FILTROS: AÑOS DE EXPERIENCIA & DISPONIBILIDAD HORARIA (RRHH) */}
            <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wide">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Filtros Especiales de Selección de Personal</span>
                </div>

                {(minExperience !== 'all' || selectedAvailability !== 'all') && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {minExperience !== 'all' && `Exp: ≥${minExperience}a `}
                    {selectedAvailability !== 'all' && (
                      selectedAvailability === 'jornada_completa' ? 'Full-Time' :
                      selectedAvailability === 'medio_tiempo' ? 'Part-Time' :
                      selectedAvailability === 'inmediata' ? 'Inmediata' : 'Por Proyecto'
                    )}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-0.5">
                {/* FILTRO 1: AÑOS DE EXPERIENCIA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Años de Experiencia Mínima:</span>
                    </span>
                    {minExperience !== 'all' && (
                      <span className="text-indigo-600 font-black text-[11px]">
                        ≥ {minExperience} {minExperience === 1 ? 'año' : 'años'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                    {[
                      { val: 'all', label: 'Todos' },
                      { val: 1, label: '1+ año' },
                      { val: 3, label: '3+ años' },
                      { val: 5, label: '5+ años' },
                      { val: 10, label: '10+ años' },
                    ].map((item) => (
                      <button
                        key={String(item.val)}
                        type="button"
                        onClick={() => setMinExperience(item.val as any)}
                        className={`py-1.5 px-1 sm:px-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                          minExperience === item.val
                            ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FILTRO 2: DISPONIBILIDAD HORARIA (FULL-TIME / PART-TIME) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Disponibilidad Horaria:</span>
                    </span>
                    {selectedAvailability !== 'all' && (
                      <span className="text-indigo-600 font-black text-[11px]">
                        {selectedAvailability === 'jornada_completa' ? '💼 Full-time' : selectedAvailability === 'medio_tiempo' ? '⏱️ Part-time' : selectedAvailability === 'inmediata' ? '⚡ Inmediata' : '📋 Por Proyecto'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5">
                    {[
                      { val: 'all', label: 'Todas' },
                      { val: 'jornada_completa', label: '💼 Full-Time' },
                      { val: 'medio_tiempo', label: '⏱️ Part-Time' },
                      { val: 'inmediata', label: '⚡ Inmediata' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSelectedAvailability(item.val as any)}
                        className={`py-1.5 px-2 rounded-xl text-center text-xs font-extrabold transition-all truncate cursor-pointer ${
                          selectedAvailability === item.val
                            ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title={item.label}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Filtros Rápidos:
              </span>

              <button
                onClick={() => setOnlyMatriculados(!onlyMatriculados)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  onlyMatriculados
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Solo Matriculados</span>
              </button>

              <button
                onClick={() => setOnlyWithVehicle(!onlyWithVehicle)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  onlyWithVehicle
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Con Vehículo Propio</span>
              </button>

              <button
                onClick={() => setOnlyImmediate(!onlyImmediate)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  onlyImmediate
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Disponibilidad Inmediata</span>
              </button>

              {(selectedTrade !== 'all' || selectedZone !== 'all' || minExperience !== 'all' || selectedAvailability !== 'all' || onlyMatriculados || onlyWithVehicle || onlyImmediate || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTrade('all');
                    setSelectedZone('all');
                    setMinExperience('all');
                    setSelectedAvailability('all');
                    setOnlyMatriculados(false);
                    setOnlyWithVehicle(false);
                    setOnlyImmediate(false);
                    setSearchQuery('');
                  }}
                  className="text-xs text-orange-600 font-bold hover:underline ml-auto cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>
              Mostrando <strong className="text-slate-900">{filteredProfiles.length}</strong> currículums ordenados por oficio
            </span>
            <span className="text-[11px] text-indigo-600">
              💡 Pulsa en "Ver Currículum" para revisar la experiencia completa
            </span>
          </div>

          {/* Grid of Candidate Cards */}
          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-slate-200 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800">
                No encontramos postulantes con estos filtros
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Prueba cambiando el rubro, la localidad o limpiando los filtros seleccionados.
              </p>
              <button
                onClick={() => {
                  setSelectedTrade('all');
                  setSelectedZone('all');
                  setMinExperience('all');
                  setSelectedAvailability('all');
                  setOnlyMatriculados(false);
                  setOnlyWithVehicle(false);
                  setOnlyImmediate(false);
                  setSearchQuery('');
                }}
                className="mt-2 py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProfiles.map((p) => {
                const tradeLabel = TRADE_NAMES[p.trade as keyof typeof TRADE_NAMES] || p.trade;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group hover:border-indigo-300"
                  >
                    <div className="space-y-3">
                      {/* Top Header of Card */}
                      <div className="flex items-start gap-3">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt={p.fullName}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shrink-0">
                            {p.fullName.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2 py-0.2 rounded-full uppercase">
                              {tradeLabel}
                            </span>
                            {p.isMatriculado && (
                              <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                Matriculado
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-slate-900 truncate mt-1 group-hover:text-indigo-600 transition-colors">
                            {p.fullName}
                          </h3>

                          <p className="text-xs font-bold text-slate-500 truncate">
                            {p.desiredTitle || `${tradeLabel} Profesional`}
                          </p>
                        </div>
                      </div>

                      {/* Info Badges (Experience, Location, Availability) */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
                        <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </span>

                        <span className="flex items-center gap-1 text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-lg">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{p.yearsOfExperience} {p.yearsOfExperience === 1 ? 'año' : 'años'} exp.</span>
                        </span>

                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            p.availability === 'jornada_completa'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : p.availability === 'medio_tiempo'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : p.availability === 'inmediata'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>
                            {p.availability === 'jornada_completa'
                              ? 'Full-Time'
                              : p.availability === 'medio_tiempo'
                              ? 'Part-Time'
                              : p.availability === 'inmediata'
                              ? 'Inmediata'
                              : 'Por Proyecto'}
                          </span>
                        </span>
                      </div>

                      {/* Summary Snippet */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {p.summary}
                      </p>

                      {/* Top Skills Tags */}
                      {p.skills && p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold"
                            >
                              ✓ {skill}
                            </span>
                          ))}
                          {p.skills.length > 3 && (
                            <span className="text-[10px] text-indigo-600 font-bold self-center">
                              +{p.skills.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProfileForModal(p)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver CV</span>
                      </button>

                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${p.fullName}, vi tu CV en la Bolsa de Trabajo de ServiGo (${tradeLabel}) y me interesa contactarte.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: FORMULARIO PARA CARGAR MI CV (CON ASISTENTE IA GEMINI)       */}
      {/* ==================================================================== */}
      {viewMode === 'post_cv' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-md space-y-6 animate-fadeIn">
          {/* AI Callout Assistant Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-indigo-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  ASISTENTE INTELIGENTE
                </span>
                <span className="text-xs font-bold text-indigo-200">Powered by Gemini AI</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¿No sabes cómo redactar tu Currículum?
              </h3>
              <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
                Cuéntale a la Inteligencia Artificial lo que sabes hacer en tus palabras y redactará automáticamente un perfil laboral profesional con logros, habilidades técnicas y experiencia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Redactar CV con IA</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>1. Datos Personales y Contacto</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Juan Carlos Pérez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 358 123-4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp (para mensajes directos)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5493581234567 (sin guiones)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan.perez@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Localidad / Ciudad Base *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Alejandro Roca"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Foto de Perfil (URL opcional)
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>2. Perfil Laboral y Oficio</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría de Oficio Principal *
                  </label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.entries(TRADE_NAMES).map(([k, n]) => (
                      <option key={k} value={k}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título o Especialidad Deseada
                  </label>
                  <input
                    type="text"
                    value={desiredTitle}
                    onChange={(e) => setDesiredTitle(e.target.value)}
                    placeholder="Ej. Electricista Matriculado de Obra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Años de Experiencia Comprobables
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disponibilidad Horaria
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="inmediata">Disponibilidad Inmediata</option>
                    <option value="jornada_completa">Jornada Completa</option>
                    <option value="medio_tiempo">Medio Tiempo</option>
                    <option value="por_proyecto">Por Proyecto / Obra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pretensión Salarial / Jornal (opcional)
                  </label>
                  <input
                    type="text"
                    value={salaryExpectation}
                    onChange={(e) => setSalaryExpectation(e.target.value)}
                    placeholder="Ej. A convenir / $30.000 jornal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Checkboxes: Vehículo, Herramientas, Matrícula */}
                <div className="flex flex-col gap-2 justify-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={hasOwnVehicle}
                      onChange={(e) => setHasOwnVehicle(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                    />
                    <span>Cuenta con movilidad / vehículo propio</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={hasOwnTools}
                      onChange={(e) => setHasOwnTools(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                    />
                    <span>Cuenta con herramientas propias de oficio</span>
                  </label>
                </div>
              </div>

              {/* Matrícula row */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-blue-900">
                  <input
                    type="checkbox"
                    checked={isMatriculado}
                    onChange={(e) => setIsMatriculado(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-md"
                  />
                  <span>¿Eres profesional matriculado (Gas, Electricidad, Obras)?</span>
                </label>

                {isMatriculado && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-blue-900 whitespace-nowrap">N° Matrícula:</span>
                    <input
                      type="text"
                      value={matriculaNumber}
                      onChange={(e) => setMatriculaNumber(e.target.value)}
                      placeholder="Ej. MAT-1234"
                      className="px-3 py-1.5 rounded-xl border border-blue-300 text-xs font-bold bg-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Resumen Profesional */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Resumen Profesional / Carta de Presentación *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mejorar redacción con IA</span>
                </button>
              </div>

              <textarea
                required
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Escribe un resumen de tu trayectoria, especialidad, compromiso laboral y cómo trabajas..."
                className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Habilidades Técnicas (Tags) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Habilidades y Conocimientos Técnicos (Tags)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Escribe una habilidad (ej. Termofusión, Tableros, Durlock) y pulsa Agregar"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-900 font-bold text-xs border border-indigo-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experiencia Laboral Repeater */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Experiencia Laboral & Obras Anteriores
                </label>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Puesto / Obra</span>
                </button>
              </div>

              <div className="space-y-3">
                {experiences.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-500">
                        Experiencia #{index + 1}
                      </span>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Cargo / Puesto
                        </label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                          placeholder="Oficial Electricista"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Empresa, Contratista u Obra
                        </label>
                        <input
                          type="text"
                          value={exp.companyOrProject}
                          onChange={(e) => handleUpdateExperience(exp.id, 'companyOrProject', e.target.value)}
                          placeholder="Constructora Norte / Particular"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Periodo
                        </label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)}
                          placeholder="2021 - 2024"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Descripción de Tareas Realizadas y Logros
                      </label>
                      <input
                        type="text"
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Instalación de tableros, cableados de obra y supervisión técnica..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificaciones y Cursos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cursos, Certificaciones o Capacitaciones
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCertInput}
                  onChange={(e) => setNewCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCert();
                    }
                  }}
                  placeholder="Ej. Curso de Instalador de Termofusión Sigas, Carnet LINTI, etc."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert)}
                      className="text-amber-500 hover:text-amber-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewMode('candidates')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Volver a la Lista de Postulantes
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Guardando tu Currículum...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Publicar mi Currículum en ServiGo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Job Profile Detail */}
      <JobProfileDetailModal
        profile={selectedProfileForModal}
        onClose={() => setSelectedProfileForModal(null)}
      />

      {/* Modal: AI CV Assistant */}
      <AiCvAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        candidateName={fullName}
        initialTrade={trade}
        initialYears={yearsOfExperience}
        initialLocation={location}
        isMatriculado={isMatriculado}
        matriculaNumber={matriculaNumber}
        onApplyCv={handleApplyAiCv}
      />
    </div>
  );
};
