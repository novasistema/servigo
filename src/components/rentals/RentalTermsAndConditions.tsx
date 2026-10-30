import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  X,
  BookOpen,
  Info
} from 'lucide-react';

export interface RentalTermsAndConditionsProps {
  accepted: boolean;
  onToggle: (accepted: boolean) => void;
  itemTitle: string;
  depositAmount: number;
  clientDni?: string;
  onOpenFullContract?: () => void;
  showErrorNotice?: boolean;
}

export const RentalTermsAndConditions: React.FC<RentalTermsAndConditionsProps> = ({
  accepted,
  onToggle,
  itemTitle,
  depositAmount,
  clientDni,
  onOpenFullContract,
  showErrorNotice = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  return (
    <>
      <div
        className={`rounded-2xl transition-all duration-200 border-2 ${
          showErrorNotice && !accepted
            ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
            : accepted
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-950/30'
            : 'bg-slate-950/80 border-orange-500/40 hover:border-orange-500/70'
        } p-3.5 space-y-3`}
      >
        {/* Component Title Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                accepted
                  ? 'bg-emerald-500 text-slate-950'
                  : showErrorNotice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-orange-500 text-slate-950'
              }`}
            >
              {accepted ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-white flex items-center gap-1.5">
                <span>Términos y Condiciones de Alquiler</span>
                <span className="text-[10px] text-orange-400 font-bold bg-orange-950/80 border border-orange-500/40 px-1.5 py-0.5 rounded-md">
                  Obligatorio
                </span>
              </h4>
              <p className="text-[10px] text-slate-300">
                Marco legal de responsabilidad del locatario y penalizaciones por daños
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Button to open full legal terms modal */}
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="text-[10px] font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="Abrir términos y condiciones completos"
            >
              <BookOpen className="w-3 h-3" />
              <span>Ver términos completos</span>
            </button>

            {accepted ? (
              <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/60 border border-emerald-400/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aceptado
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" /> Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Summary Clauses Box */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-200 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
            <p className="leading-snug">
              <strong className="text-white font-semibold">Responsabilidad sobre la Devolución:</strong>{' '}
              El usuario declara recibir <span className="text-orange-300 font-medium">"{itemTitle}"</span> en óptimo estado de conservación y funcionamiento, comprometiéndose a restituirlo en las <strong>mismas condiciones estéticas, mecánicas e higiénicas</strong> en la fecha pactada.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <p className="leading-snug">
              <strong className="text-white font-semibold">Aceptación de Penalizaciones por Daños:</strong>{' '}
              El usuario acepta la <strong>retención inmediata del depósito de garantía (${depositAmount.toLocaleString('es-AR')})</strong> ante roturas, caídas, quemaduras, averías por mal uso o sobrecarga eléctrica, o faltante de accesorios.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="leading-snug">
              <strong className="text-white font-semibold">Compromiso de Reposición o Reparación Total:</strong>{' '}
              Si el daño o extravío supera el valor de la garantía, el locatario se compromete formalmente a <strong>abonar el 100% del valor de reposición a nuevo o arreglo del producto</strong>, asegurando la indemnidad económica del propietario (Código Civil y Comercial de la Nación).
            </p>
          </div>
        </div>

        {/* Quick inline bar with 'Ver términos completos' button and toggle */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 text-orange-400" />
                <span>Ocultar vista rápida</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-orange-400" />
                <span>Vista rápida de cláusulas</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver términos completos</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {isExpanded && (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-2 animate-fadeIn">
            <div>
              <span className="font-bold text-orange-300 block mb-0.5">1. Check-In y Constatación Fotográfica:</span>
              <p className="text-slate-400 leading-relaxed">
                Al momento de entrega en persona o recepción por cadete, se recomienda tomar fotografías del producto. Cualquier reclamo por defecto previo debe informarse dentro de las 2 horas de recibido.
              </p>
            </div>
            <div>
              <span className="font-bold text-orange-300 block mb-0.5">2. Demoras y Mora Automática:</span>
              <p className="text-slate-400 leading-relaxed">
                La falta de devolución en el día y horario pactado devengará una penalización automática del 150% del valor diario de alquiler por cada 24 horas de retardo no consensuado.
              </p>
            </div>
            <div>
              <span className="font-bold text-orange-300 block mb-0.5">3. Prohibición de Subalquiler:</span>
              <p className="text-slate-400 leading-relaxed">
                El bien es intransferible y bajo exclusiva custodia del locatario firmante (DNI: {clientDni || 'Constatado en la reserva'}). Queda terminantemente prohibida su cesión o sublocación a terceros.
              </p>
            </div>
          </div>
        )}

        {/* Mandatory Checkbox */}
        <div
          className={`p-3 rounded-xl transition-colors border ${
            accepted
              ? 'bg-emerald-950/40 border-emerald-500/50'
              : showErrorNotice
              ? 'bg-rose-950/60 border-rose-500/70'
              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => onToggle(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-orange-500 focus:ring-orange-400 bg-slate-800 border-slate-600 cursor-pointer shrink-0 accent-orange-500"
            />
            <div className="space-y-1">
              <span
                className={`text-xs font-black block leading-snug ${
                  accepted
                    ? 'text-emerald-300'
                    : showErrorNotice
                    ? 'text-rose-200'
                    : 'text-white'
                }`}
              >
                Declaro que soy responsable del estado de devolución del producto y acepto las penalizaciones por daños y retención de garantía *
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Marcar esta casilla constituye una declaración jurada vinculante bajo los términos de la plataforma ServiGo y la legislación vigente.
              </p>
            </div>
          </label>
        </div>

        {/* Validation Warning Alert (if user tried to submit without checking) */}
        {showErrorNotice && !accepted && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-[11px] animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Obligatorio:</strong> Debes marcar la casilla para confirmar que aceptas la responsabilidad y las penalizaciones por daños antes de continuar.
            </span>
          </div>
        )}

        {/* Full Agreement Modal Trigger Link */}
        {onOpenFullContract && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={onOpenFullContract}
              className="text-orange-400 hover:text-orange-300 font-bold underline inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Contrato de Locación Completo e Imprimible (Ley 26.994)</span>
            </button>
            <span className="text-slate-400 flex items-center gap-1">
              <Scale className="w-3 h-3 text-slate-400" /> Validez Art. 288 CCCN
            </span>
          </div>
        )}
      </div>

      {/* Modal 'Ver términos completos' con texto legal detallado para transparencia */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Términos y Condiciones Legales de Alquiler
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Transparencia y Régimen de Penalizaciones por Daños
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* Product Reference Card */}
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-orange-400 block">
                    Artículo objeto del alquiler
                  </span>
                  <span className="font-bold text-white text-sm">{itemTitle}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Garantía en custodia
                  </span>
                  <span className="font-black text-emerald-400 text-sm">
                    ${depositAmount.toLocaleString('es-AR')} ARS
                  </span>
                </div>
              </div>

              {/* Introductory Note */}
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 flex items-start gap-2.5 text-orange-200 text-[11px]">
                <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  El presente marco legal regula los derechos y obligaciones del locatario al momento de formalizar la reserva a través de la plataforma <strong>ServiGo</strong>, bajo las previsiones del Código Civil y Comercial de la Nación Argentina (Arts. 1187 a 1226).
                </span>
              </div>

              {/* Section 1 */}
              <div className="space-y-1">
                <h5 className="font-black text-white text-xs flex items-center gap-1.5 text-orange-300">
                  <span>1. Estado de Recepción y Obligación de Devolución</span>
                </h5>
                <p>
                  El locatario declara recibir el producto en perfecto estado funcional, técnico y estético, libre de fallas evidentes y con todos sus accesorios incluidos. El usuario asume el compromiso legal de restituirlo en la misma condición, salvo el desgaste natural derivado de un uso prudente y razonable.
                </p>
                <p className="text-[11px] text-slate-400">
                  <strong>Recomendación de constatación:</strong> Se exhorta a ambas partes a realizar un registro fotográfico o de video en el instante de entrega o recepción por cadete para asentar el estado inicial de la cosa.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-1">
                <h5 className="font-black text-white text-xs flex items-center gap-1.5 text-rose-300">
                  <span>2. Daños, Roturas y Retención de la Garantía</span>
                </h5>
                <p>
                  Constituye causal de <strong>retención inmediata total o parcial del depósito de garantía</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-400 text-[11px]">
                  <li>Golpes, caídas, deformaciones mecánicas o roturas de pantalla/carcasa.</li>
                  <li>Averías eléctricas o mecánicas provocadas por sobretensión, humedad o mal uso.</li>
                  <li>Faltante de piezas, cables de alimentación, cargadores, manuales o estuches.</li>
                  <li>Suciedad extrema, manchas de pinturas, pegamentos o desarmado no autorizado.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-1">
                <h5 className="font-black text-white text-xs flex items-center gap-1.5 text-amber-300">
                  <span>3. Responsabilidad por Daños Mayores y Reposición a Nuevo</span>
                </h5>
                <p>
                  En aquellos supuestos donde el costo de reparación de los daños causados, o el valor de reposición ante extravío, hurto o destrucción total, supere el importe de la garantía en custodia (${depositAmount.toLocaleString('es-AR')}), el locatario se compromete de forma irrevocable a abonar la diferencia dineraria restante hasta completar el <strong>100% del costo real de mercado</strong>, asegurando en todo momento la indemnidad económica del titular propietario.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-1">
                <h5 className="font-black text-white text-xs flex items-center gap-1.5 text-slate-200">
                  <span>4. Plazos de Restitución y Mora Automática</span>
                </h5>
                <p>
                  El plazo de alquiler fenece indefectiblemente en la fecha convenida. La retención indebida del bien devengará una penalización equivalente al <strong>150% del precio diario</strong> por cada período de 24 horas transcurrido sin restitución consensuada, sin perjuicio de las acciones civiles y penales pertinentes.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-1">
                <h5 className="font-black text-white text-xs flex items-center gap-1.5 text-slate-200">
                  <span>5. Custodia Personal y Prohibición de Cesión</span>
                </h5>
                <p>
                  El derecho de locación es estrictamente personal. El locatario {clientDni ? `(DNI: ${clientDni})` : ''} no podrá sublocar, ceder, transferir ni facilitar el bien a terceras personas no individualizadas en la reserva.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-1">
                <h5 className="font-black text-white text-xs flex items-center gap-1.5 text-slate-200">
                  <span>6. Validez de la Aceptación Electrónica</span>
                </h5>
                <p className="text-[11px] text-slate-400">
                  De conformidad con el Art. 288 del CCCN, la aceptación mediante la marcación de la casilla obligatoria y el ingreso del DNI posee pleno valor probatorio y vinculante entre las partes.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {accepted ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ya has marcado tu aceptación
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Al continuar debes marcar el checkbox
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>

                {!accepted && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggle(true);
                      setIsTermsModalOpen(false);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/30 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aceptar Términos y Cerrar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

