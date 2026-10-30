import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Printer, Lock, Scale, UserCheck } from 'lucide-react';

interface RentalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  dailyPrice?: number;
  depositAmount?: number;
  ownerName?: string;
  clientName?: string;
  clientDni?: string;
  startDate?: string;
  endDate?: string;
  calculatedDays?: number;
  onAcceptContract?: () => void;
  isAccepted?: boolean;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  isOpen,
  onClose,
  itemTitle = 'Artículo en Alquiler',
  dailyPrice = 15000,
  depositAmount = 30000,
  ownerName = 'Propietario Registrado',
  clientName = 'Cliente / Locatario',
  clientDni = '',
  startDate,
  endDate,
  calculatedDays = 1,
  onAcceptContract,
  isAccepted = false,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                CONTRATO VINCULANTE • CÓDIGO CIVIL Y COMERCIAL DE LA NACIÓN (ARTS. 1187 A 1226)
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Contrato de Locación de Cosa Mueble y Cláusula de Indemnidad
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed font-sans flex-1">
          {/* Top Notice: Protection for Owner & Tenant */}
          <div className="p-4 bg-amber-50 border-2 border-amber-200/90 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-amber-950 font-black uppercase tracking-wider">
                Garantía y Seguridad Financiera para el Dueño (Locador):
              </p>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                Este contrato establece que el cliente que alquila asume la <strong>responsabilidad civil y económica absoluta</strong> por el cuidado, correcto uso y restitución en idénticas condiciones del producto. <strong>Si sufre roturas, averías o no es devuelto, el locatario debe pagar la reparación o reposición a nuevo del bien</strong>.
              </p>
            </div>
          </div>

          {/* Parties & Goods Identification Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Locador (Propietario del Bien):</span>
              <span className="font-bold text-slate-900 text-sm">{ownerName}</span>
              <span className="text-slate-500 block text-[11px]">Plataforma ServiGo Alquiler</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Locatario (Inquilino Responsable):</span>
              <span className="font-bold text-slate-900 text-sm">{clientName || 'Cliente solicitante'}</span>
              <span className="text-slate-600 block text-[11px]">
                {clientDni ? `DNI: ${clientDni}` : 'DNI registrado al confirmar'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Artículo Objeto del Contrato:</span>
              <span className="font-bold text-slate-900">{itemTitle}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Período de Alquiler:</span>
              <span className="font-bold text-slate-900">
                {calculatedDays} día{calculatedDays > 1 ? 's' : ''} {startDate ? `(${startDate} al ${endDate})` : ''}
              </span>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="space-y-4 border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-xs">
            <h3 className="font-black text-slate-900 text-xs sm:text-sm border-b pb-2 flex items-center justify-between">
              <span>CLÁUSULAS CONTRACTUALES DE LOCACIÓN Y RESPONSABILIDAD</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md">
                Ley Nac. 26.994
              </span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <strong className="text-slate-950 font-bold block">
                  CLÁUSULA PRIMERA — OBJETO Y ESTADO DE CONSTATACIÓN:
                </strong>
                <span>
                  El LOCADOR cede temporalmente en locación al LOCATARIO, quien acepta de entera conformidad, el uso y goce del bien mueble individualizado como <strong>"{itemTitle}"</strong>. Al momento de la entrega (en persona o vía cadete), ambas partes constatan el encendido, operatividad, limpieza y entrega de los accesorios. Se deja constancia de que ambas partes tienen derecho a tomar un registro fotográfico del estado inicial del bien como prueba fehaciente (Check-in).
                </span>
              </div>

              <div>
                <strong className="text-slate-950 font-bold block">
                  CLÁUSULA SEGUNDA — PRECIO, PLAZO Y MORA AUTOMÁTICA EN LA DEVOLUCIÓN:
                </strong>
                <span>
                  El precio de la locación es de <strong>${dailyPrice.toLocaleString('es-AR')} por cada día</strong> de alquiler. El plazo es improrrogable salvo acuerdo previo por escrito. En caso de que el LOCATARIO no restituya el bien en la fecha y hora pactadas, incurrirá en <strong>mora automática sin necesidad de interpelación alguna</strong>, devengando un recargo compensatorio del <strong>150% de la tarifa diaria</strong> por cada día de mora, sin perjuicio del derecho del LOCADOR de radicar de inmediato la correspondiente denuncia por retención indebida o defraudación (Código Penal Argentino).
                </span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <strong className="text-rose-950 font-black block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  CLÁUSULA TERCERA — RETENCIÓN DE GARANTÍA POR DAÑOS O ROTURAS:
                </strong>
                <span className="text-rose-950 font-medium">
                  El LOCATARIO entrega en concepto de depósito de seguridad en custodia la suma de <strong>${depositAmount.toLocaleString('es-AR')}</strong>. Si al finalizar el alquiler el bien presentara <strong>roturas, golpes, quemadura de motor, piezas quebradas, suciedad extrema o faltante de accesorios</strong>, dicha caución será <strong>retenida de inmediato y no reembolsada</strong>, destinándose al pago de la reparación técnica o reposición.
                </span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                <strong className="text-amber-950 font-black block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  CLÁUSULA CUARTA — RESPONSABILIDAD TOTAL DE REPOSICIÓN A NUEVO O PAGO DEL DAÑO (INDEMNIDAD DEL DUEÑO):
                </strong>
                <span className="text-amber-950 font-medium">
                  El LOCATARIO asume expresamente el carácter de guardián de la cosa arrendada. En caso de que el costo de reparación de los daños causados por mal uso supere el monto de la garantía, o en caso de <strong>destrucción total, avería irreparable, extravío, robo o hurto durante el período de tenencia</strong>, el LOCATARIO <strong>SE OBLIGA INCONDICIONALMENTE A PAGAR AL LOCADOR LA DIFERENCIA HASTA CUBRIR EL 100% DEL VALOR DE REPOSICIÓN A NUEVO DEL PRODUCTO</strong> en plaza (conforme a los valores de Ferretería Bruzzone o distribuidor oficial de plaza), <strong>garantizando así que el dueño no sufra pérdida económica alguna</strong>.
                </span>
              </div>

              <div>
                <strong className="text-slate-950 font-bold block">
                  CLÁUSULA QUINTA — DESTINO, CUIDADOS Y PROHIBICIÓN DE SUBLOCACIÓN:
                </strong>
                <span>
                  El LOCATARIO se obliga a destinar el bien exclusivamente a su uso natural según especificaciones del fabricante, utilizando elementos de protección personal reglamentarios (EPP). Queda terminantemente prohibido ceder, prestar, transferir o subalquilar el bien a terceras personas.
                </span>
              </div>

              <div>
                <strong className="text-slate-950 font-bold block">
                  CLÁUSULA SEXTA — DECLARACIÓN JURADA Y VALIDEZ ELECTRÓNICA:
                </strong>
                <span>
                  La aceptación digital de este instrumento en la plataforma ServiGo mediante el ingreso del Documento Nacional de Identidad (DNI) y la tilde de conformidad equivale a la firma electrónica en los términos del art. 288 del Código Civil y Comercial de la Nación, reconociendo el LOCATARIO plena eficacia jurídica y valor probatorio al presente contrato.
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Certification Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-orange-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Certificado de Aceptación y Firma Electrónica
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-sm">
                ID: SG-RENT-{calculatedDays}D-{Date.now().toString(36).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Titular Firmante:</span>
                <span className="font-bold text-white">{clientName || 'Cliente Registrado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">DNI Declarado:</span>
                <span className="font-bold text-white font-mono">{clientDni || 'Constatado en la solicitud'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Estado del Contrato:</span>
                <span className={`font-bold inline-flex items-center gap-1 ${isAccepted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <UserCheck className="w-3.5 h-3.5" />
                  {isAccepted ? 'Aceptado & Vinculante' : 'Pendiente de aceptación'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir / Descargar en PDF</span>
          </button>

          <div className="flex items-center gap-2">
            {onAcceptContract ? (
              <button
                onClick={() => {
                  onAcceptContract();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>He Leído y Acepto las Cláusulas</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-colors shadow-md shadow-orange-600/30 cursor-pointer"
              >
                Entendido y Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

