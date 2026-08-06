import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Wrench,
  ShieldCheck,
  Store,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RegistrationPdfGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationPdfGuideModal: React.FC<RegistrationPdfGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGeneratingPdf(true);

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Guia_Registro_Trabajadores_ServiGo.pdf');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      // Fallback: system print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                Manual de Uso y Registro de Trabajadores
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Guía oficial paso a paso con imágenes explicativas para sumarse a ServiGo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Descargar archivo PDF"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">
                {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Imprimir guía"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          <div
            ref={printRef}
            className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xl max-w-3xl mx-auto space-y-8 text-slate-800 text-sm font-sans"
            id="pdf-printable-content"
          >
            {/* Header Document Cover */}
            <div className="border-b-4 border-orange-500 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  ServiGo • Red de Servicios
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Guía de Registro para Trabajadores
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
                  Bruzzone Network • Cómo crear tu perfil en 5 sencillos pasos
                </p>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-2xl text-center border border-slate-800 shrink-0">
                <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  AUSPICIADO POR
                </span>
                <span className="text-xs font-black text-orange-400">
                  Ferretería Bruzzone
                </span>
              </div>
            </div>

            {/* Intro banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  ¿Por qué registrarte en ServiGo?
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  ServiGo conecta a profesionales y oficios locales (electricistas, plomeros, gasistas, albañiles, etc.) con clientes de Alejandro Roca, Río Cuarto, La Carlota y la región. Registrarse es 100% gratuito y tus clientes te contactarán directo por WhatsApp.
                </p>
              </div>
            </div>

            {/* STEP 1 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  1
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Ingresar a la pestaña "Registrarme"
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                En el menú principal superior de la aplicación, hacé clic en el botón con ícono de persona que dice <strong className="text-orange-600">"Registrarme"</strong> o <strong className="text-orange-600">"Sumarme a la Red"</strong>. Esto abrirá el formulario interactivo de registro de profesionales.
              </p>
              
              {/* Visual Mock Step 1 */}
              <div className="pl-11 pt-2">
                <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-around text-xs font-bold border border-slate-700">
                  <div className="opacity-60 flex items-center gap-1">🔍 Buscar</div>
                  <div className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 shadow-md">
                    <User className="w-4 h-4" />
                    <span>Registrarme (Paso 1)</span>
                  </div>
                  <div className="opacity-60 flex items-center gap-1">🤖 Asistente AI</div>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  2
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Completar tus Datos Personales y WhatsApp
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                Completá tu <strong>Nombre y Apellido</strong>, agregá tu número de <strong>Teléfono</strong> y tu <strong>WhatsApp</strong> (con código de área sin 0 ni 15, ej: 3584123456). Podés subir una foto de perfil desde tu celular/computadora o tomarte una foto en vivo con la cámara.
              </p>

              {/* Visual Mock Step 2 */}
              <div className="pl-11 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-2">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-500" />
                    Nombre Completo
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500 italic">Ej: Juan Pérez</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-2">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    WhatsApp Directo
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500 italic">Ej: 3584998877</div>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  3
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Elegir tu Rubro y Especialidades
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                Seleccioná tu rubro principal entre los disponibles: <strong>Electricista, Plomero, Gasista, Pintor, Aire Acondicionado, Cerrajero, Jardinería, Fletes, etc.</strong> Si tu oficio no está en la lista, ¡podés agregar un nuevo rubro personalizado al instante! También podés detallar tu título o especialidad (ej: "Electricista Matriculado e Industrial").
              </p>

              {/* Visual Mock Step 3 */}
              <div className="pl-11 pt-1 flex flex-wrap gap-2">
                <span className="bg-white border-2 border-orange-500 text-orange-700 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-500" /> Electricista
                </span>
                <span className="bg-white border border-slate-300 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl">
                  Plomero & Gasista
                </span>
                <span className="bg-white border border-slate-300 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl">
                  Pintura General
                </span>
                <span className="bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                  + Agregar nuevo rubro
                </span>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  4
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Indicar Localidad y Zonas de Cobertura
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                Ingresá tu <strong>Localidad Principal</strong> (ej: Alejandro Roca) y las <strong>Zonas de Cobertura</strong> donde podés prestar servicio (ej: Alejandro Roca, Río Cuarto, Los Cisnes, La Carlota, Reducción, Zona Rural). El sistema agrupará y limpiará las zonas automáticamente para que no se dupliquen.
              </p>

              {/* Visual Mock Step 4 */}
              <div className="pl-11 pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> Zonas donde atendés:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">Alejandro Roca</span>
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">Río Cuarto</span>
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">La Carlota</span>
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">Los Cisnes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 5 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  5
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Honorarios y Socio Ferretería Bruzzone (FB)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                Ingresá tu tarifa estimada por hora o costo de visita/presupuesto. Si trabajás con insumos de <strong>Ferretería Bruzzone</strong>, podés activar la opción de <strong>Socio Ferretería Bruzzone (10% OFF en mano de obra)</strong> para que tu perfil lleve la distinción oficial y atraiga a más clientes.
              </p>

              {/* Visual Mock Step 5 */}
              <div className="pl-11 pt-1">
                <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white font-black text-xs px-2 py-0.5 rounded">FB</span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs">Insignia Socio Ferretería Bruzzone</span>
                      <p className="text-[11px] text-orange-800">10% OFF en mano de obra con insumos Bruzzone</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                </div>
              </div>
            </div>

            {/* Footer Summary Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3 text-center border border-slate-800">
              <h3 className="text-lg font-black text-amber-400">
                ¡Listo! Publicación Inmediata
              </h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                Al finalizar y hacer clic en <strong>"Confirmar y Registrarme"</strong>, tu perfil aparecerá al instante en la lista de profesionales de ServiGo para que todos los clientes de la zona puedan encontrarte.
              </p>

              <div className="pt-2 flex justify-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Gratuito
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sin comisiones
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-emerald-400" /> Contacto Directo
                </span>
              </div>
            </div>

            {/* Footer Credits */}
            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>ServiGo • La solución que buscas, está aquí</span>
              <span className="font-bold text-slate-600">Bruzzone Network • 2026</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-400 hidden sm:block">
            Podés descargar este manual en PDF o imprimirlo en cualquier momento.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Manual PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
