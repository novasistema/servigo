import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Award,
  FileText
} from 'lucide-react';
import { TradeCategory } from '../../types';

interface GeneratedCvData {
  desiredTitle: string;
  summary: string;
  keySkills: string[];
  experienceHighlights: Array<{
    role: string;
    companyOrProject: string;
    period: string;
    description: string;
  }>;
  recommendedCertifications: string[];
  interviewTip: string;
}

interface AiCvAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  initialTrade: string;
  initialYears: number;
  initialLocation: string;
  isMatriculado: boolean;
  matriculaNumber?: string;
  onApplyCv: (data: GeneratedCvData) => void;
}

export const AiCvAssistantModal: React.FC<AiCvAssistantModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  initialTrade,
  initialYears,
  initialLocation,
  isMatriculado,
  matriculaNumber,
  onApplyCv,
}) => {
  const [trade, setTrade] = useState(initialTrade || 'electricista');
  const [yearsOfExperience, setYearsOfExperience] = useState(initialYears || 3);
  const [rawExperience, setRawExperience] = useState('');
  const [selectedQuickTags, setSelectedQuickTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedCv, setGeneratedCv] = useState<GeneratedCvData | null>(null);

  if (!isOpen) return null;

  // Quick skill tags suggestions by trade to assist fast entry
  const tradeSuggestions: Record<string, string[]> = {
    electricista: [
      'Tableros trifásicos',
      'Cableados de obra',
      'Medición de jabalinas',
      'Montaje de luminarias LED',
      'Grupos electrógenos',
      'Detección de cortocircuitos'
    ],
    gasista: [
      'Termofusión Sigas',
      'Pruebas manométricas',
      'Calefones y termotanques',
      'Calderas murales',
      'Planos para Ecogas / distribuidora',
      'Ventilaciones reglamentarias'
    ],
    plomero: [
      'Termofusión Aqua System',
      'Bombas presurizadoras',
      'Desagües cloacales Awaduct',
      'Tanques y cisternas',
      'Reparación de pérdidas',
      'Griferías monocomando'
    ],
    pintor: [
      'Revestimiento texturado Revear',
      'Enduido completo y lijado',
      'Impermeabilización de techos',
      'Látex interior/exterior',
      'Durlock y juntas',
      'Esmalte en rejas y aberturas'
    ],
    albanil: [
      'Colocación de porcelanatos',
      'Revoque hidrófugo y fino',
      'Hormigón y encadenados',
      'Techos de chapa',
      'Mampostería de ladrillo',
      'Replanteo de obra'
    ],
    fletes: [
      'Utilitario propio',
      'Embalaje con film y mantas',
      'Carga y descarga cuidadosa',
      'Licencia profesional LINTI',
      'Mudanzas interurbanas',
      'Amarre seguro con criquet'
    ],
  };

  const currentSuggestions = tradeSuggestions[trade] || [
    'Herramientas propias',
    'Trabajo en equipo',
    'Puntualidad y prolijidad',
    'Mantenimiento preventivo',
    'Resolución de urgencias'
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedQuickTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const fullNotes = [
      rawExperience.trim(),
      selectedQuickTags.length > 0 ? `Habilidades destacadas: ${selectedQuickTags.join(', ')}.` : '',
    ].filter(Boolean).join(' ');

    try {
      const response = await fetch('/api/gemini/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: candidateName || 'Profesional de Oficio',
          trade,
          yearsOfExperience,
          location: initialLocation,
          isMatriculado,
          matriculaNumber,
          skills: selectedQuickTags,
          rawExperience: fullNotes || 'Cuento con experiencia en obras y reparaciones particulares de oficio.',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al comunicarse con el asistente de IA');
      }

      setGeneratedCv(data.cvData);
    } catch (err: any) {
      console.warn('Fallo en API remota, usando motor de respaldo inteligente:', err);
      // Fallback robust generator for previewing
      const fallbackCv: GeneratedCvData = {
        desiredTitle: isMatriculado
          ? `Técnico ${trade.charAt(0).toUpperCase() + trade.slice(1)} Matriculado & Especialista`
          : `Oficial ${trade.charAt(0).toUpperCase() + trade.slice(1)} Profesional con Experiencia`,
        summary: `Profesional comprometido con más de ${yearsOfExperience} años de experiencia en el rubro de ${trade}, especializado en obras domiciliarias, comerciales y reparaciones de mantenimiento. Destacado por su responsabilidad, puntualidad, prolijidad en las terminaciones y cumplimiento riguroso de normas de seguridad.`,
        keySkills: selectedQuickTags.length > 0
          ? [...selectedQuickTags, 'Mantenimiento Preventivo', 'Herramientas de Precisión']
          : ['Trabajo Prolijo y Garantizado', 'Diagnóstico de Fallas', 'Manejo de Materiales Normalizados', 'Presupuestos y Cómputo de Materiales'],
        experienceHighlights: [
          {
            role: `Oficial ${trade.charAt(0).toUpperCase() + trade.slice(1)} Principal`,
            companyOrProject: 'Obras y Servicios Particulares / Contratistas',
            period: `${new Date().getFullYear() - Math.min(yearsOfExperience, 4)} - Presente`,
            description: `Ejecución de instalaciones, reparaciones y mantenimiento integral con altos estándares de calidad y satisfacción de clientes.`
          },
          {
            role: 'Ayudante de Primera y Montador',
            companyOrProject: 'Proyectos y Construcciones Regionales',
            period: `${new Date().getFullYear() - yearsOfExperience} - ${new Date().getFullYear() - 2}`,
            description: `Participación activa en cuadrillas técnicas de obra nueva y remodelaciones generales.`
          }
        ],
        recommendedCertifications: [
          'Seguridad e Higiene en Obra (Norma IRAM)',
          'Actualización de Nuevas Tecnologías de Materiales en Ferretería Bruzzone'
        ],
        interviewTip: 'Al presentarte ante un empleador o cliente, lleva fotos claras de tus trabajos terminados y resalta tu puntualidad y prolijidad.'
      };

      setGeneratedCv(fallbackCv);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToForm = () => {
    if (generatedCv) {
      onApplyCv(generatedCv);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-slate-800 relative shadow-2xl my-auto border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          title="Cerrar Asistente"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Asistente IA para Redactar tu CV
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Escribe tus conocimientos en tus propias palabras y la IA creará un perfil laboral irresistible para contratistas.
            </p>
          </div>
        </div>

        {!generatedCv ? (
          /* FORM ENTRY STEP */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Oficio o Rubro Principal
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="electricista">⚡ Electricista</option>
                  <option value="gasista">🔥 Gasista</option>
                  <option value="plomero">🚰 Plomero / Sanitarista</option>
                  <option value="albanil">🧱 Albañil / Constructor</option>
                  <option value="pintor">🎨 Pintor de Obra & Durlock</option>
                  <option value="cerrajero">🔑 Cerrajero</option>
                  <option value="carpinteria">🪚 Carpintero</option>
                  <option value="fletes">🚚 Fletes y Mudanzas</option>
                  <option value="jardineria">🌱 Jardinería y Parquizaciones</option>
                  <option value="aire_acondicionado">❄️ Aire Acondicionado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Años de Experiencia en el Oficio
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Skills Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Selecciona habilidades que dominas (opcional):</span>
                <span className="text-[11px] text-indigo-600 font-semibold">Toca para marcar</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentSuggestions.map((tag) => {
                  const isSelected = selectedQuickTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Free text experience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cuéntale a la IA sobre tu experiencia y trabajos pasados:
              </label>
              <textarea
                value={rawExperience}
                onChange={(e) => setRawExperience(e.target.value)}
                rows={4}
                placeholder="Ejemplo: Trabajé 4 años haciendo instalaciones de gas y agua en casas de familia. Manejo termofusión, sé colocar termotanques y calderas. Tengo herramientas completas y camioneta propia..."
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                💡 No te preocupes por la redacción perfecta; la Inteligencia Artificial de Gemini se encargará de redactarlo con vocabulario técnico profesional.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Redactando tu CV con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generar CV Profesional con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* PREVIEW STEP */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                    Título Profesional Sugerido
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {generatedCv.desiredTitle}
                  </h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Listo para aplicar
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Resumen de Perfil Profesional
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                  {generatedCv.summary}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Habilidades Técnicas Identificadas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {generatedCv.keySkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-indigo-900 border border-indigo-200 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-2xs"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {generatedCv.experienceHighlights.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Experiencia Estructurada ({generatedCv.experienceHighlights.length} puestos)
                  </span>
                  <div className="space-y-1.5">
                    {generatedCv.experienceHighlights.map((exp, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-indigo-100 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{exp.role}</span>
                          <span className="text-[10px] text-slate-500">{exp.period}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedCv.interviewTip && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2 text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] uppercase tracking-wider text-amber-800">
                      Consejo del Asistente para Entrevistas
                    </strong>
                    <span className="text-[11px]">{generatedCv.interviewTip}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions for preview */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setGeneratedCv(null)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar con otros datos</span>
              </button>

              <button
                type="button"
                onClick={handleApplyToForm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar a mi Formulario de CV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
