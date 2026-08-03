import React, { useState } from 'react';
import { Sparkles, Send, Wrench, ShoppingBag, ShieldAlert, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { TradeCategory } from '../types';

interface AiAssistantProps {
  onSelectTrade: (trade: TradeCategory) => void;
}

interface DiagnosisResult {
  tradeCategory: TradeCategory;
  diagnosisTitle: string;
  explanation: string;
  urgency: 'normal' | 'alta' | 'urgencia_24h';
  recommendedMaterials: string[];
  bruzzoneAdvise: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onSelectTrade }) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const presets = [
    '🔥 El calefón gotea agua por abajo y no prende el piloto',
    '⚡ Chispas en la caja de luz y salta la llave térmica a cada rato',
    '🚰 No sale agua caliente en la ducha pero sí en la cocina',
    '🎨 Tengo manchas de humedad negra y pintura descascarada en el techo',
    '🔑 Se trancó la cerradura con la llave adentro',
  ];

  const handleDiagnose = async (textToUse?: string) => {
    const queryText = textToUse || problemDescription;
    if (!queryText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemDescription: queryText }),
      });

      const data = await response.json();
      if (!data.success || !data.diagnosis) {
        throw new Error(data.error || 'No se pudo obtener el diagnóstico.');
      }

      setResult(data.diagnosis);
    } catch (err: any) {
      console.error(err);
      // Fallback local diagnosis if API fails or offline
      setResult({
        tradeCategory: queryText.toLowerCase().includes('luz') || queryText.toLowerCase().includes('térmica') ? 'electricista' : queryText.toLowerCase().includes('calefón') || queryText.toLowerCase().includes('gas') ? 'gasista' : 'plomero',
        diagnosisTitle: 'Diagnóstico Técnico Inicial ServiGo',
        explanation: 'Basado en tu descripción, se requiere la asistencia urgente de un especialista matriculado para inspeccionar la falla de forma segura.',
        urgency: 'alta',
        recommendedMaterials: [
          'Insumos y repuestos originales de Ferretería Bruzzone',
          'Materiales con aprobación IRAM / NORMAS TÉCNICAS',
        ],
        bruzzoneAdvise: 'Desconecta los suministros principales (agua/gas/luz) mientras llega el profesional.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-xs font-black uppercase tracking-wider w-fit">
          <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
          <span>INTELIGENCIA ARTIFICIAL SERVIGO</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Diagnóstico Técnico Inteligente
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
          Describe con tus palabras la falla o problema de tu hogar. La IA de ServiGo identificará qué profesional necesitas, el nivel de urgencia y los materiales a comprar en <strong>Ferretería Bruzzone</strong>.
        </p>

        {/* Input Box */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <textarea
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Ej. Tengo humedad en la pared del baño, el agua sale fría y salta la térmica de noche..."
              className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none resize-none"
            />
            <button
              onClick={() => handleDiagnose()}
              disabled={loading || !problemDescription.trim()}
              className="absolute right-3 bottom-4 p-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-2xl font-bold transition-all shadow-sm active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Prueba un ejemplo rápido:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((pr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setProblemDescription(pr);
                    handleDiagnose(pr);
                  }}
                  className="text-left text-[11px] bg-slate-50 border border-slate-200 hover:border-orange-500 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl transition-all font-medium"
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-white border border-orange-200 rounded-[32px] p-8 text-center space-y-3 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Analizando tu consulta con la IA de ServiGo...
          </h3>
          <p className="text-xs text-slate-500">
            Evaluando requerimientos de seguridad, especialidad profesional e insumos de Ferretería Bruzzone.
          </p>
        </div>
      )}

      {/* Diagnosis Results Card */}
      {result && !loading && (
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  DIAGNÓSTICO GENERADO
                </span>
                {result.urgency === 'urgencia_24h' && (
                  <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                    🚨 URGENCIA 24HS
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {result.diagnosisTitle}
              </h2>
            </div>

            <button
              onClick={() => onSelectTrade(result.tradeCategory)}
              className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
            >
              <span>Ver Profesionales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              Explicación del Problema y Seguridad
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {result.explanation}
            </p>
          </div>

          {/* Recommended Materials from Ferretería Bruzzone */}
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                Materiales a Comprar en Ferretería Bruzzone
              </h4>
            </div>

            <div className="space-y-1.5">
              {result.recommendedMaterials.map((mat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-orange-950 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{mat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-orange-200 flex items-center justify-between text-xs font-medium">
              <span className="text-orange-900">
                💡 {result.bruzzoneAdvise}
              </span>
              <a
                href="https://ferreteriabruzzone.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-orange-600 hover:underline shrink-0 ml-2"
              >
                Tienda Bruzzone →
              </a>
            </div>
          </div>

          {/* Direct CTA */}
          <div className="pt-2">
            <button
              onClick={() => onSelectTrade(result.tradeCategory)}
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Wrench className="w-5 h-5" />
              <span>Buscar Trabajadores de {result.tradeCategory.toUpperCase()} Ahora</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
