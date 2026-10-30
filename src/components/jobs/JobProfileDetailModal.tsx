import React from 'react';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Car,
  Wrench,
  Award,
  GraduationCap,
  Share2,
  Printer,
  Mail,
  Building2,
  Tag,
  DollarSign
} from 'lucide-react';
import { JobProfile } from '../../types';
import { TRADE_NAMES } from '../../data/mockData';

interface JobProfileDetailModalProps {
  profile: JobProfile | null;
  onClose: () => void;
}

export const JobProfileDetailModal: React.FC<JobProfileDetailModalProps> = ({
  profile,
  onClose,
}) => {
  if (!profile) return null;

  const tradeName = TRADE_NAMES[profile.trade as keyof typeof TRADE_NAMES] || profile.trade;

  const availabilityLabels = {
    inmediata: 'Inmediata',
    jornada_completa: 'Jornada Completa',
    medio_tiempo: 'Medio Tiempo',
    por_proyecto: 'Por Proyecto / Obra'
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CV de ${profile.fullName} - ${profile.desiredTitle}`,
          text: `Te comparto el currículum de ${profile.fullName} (${tradeName}) en la Bolsa de Trabajo de ServiGo.`,
          url: window.location.href,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace al CV copiado al portapapeles!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `Hola ${profile.fullName}, vi tu Currículum Vitae en la Bolsa de Trabajo de ServiGo (${tradeName}). Me gustaría consultarte por una oportunidad de trabajo.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 text-slate-800 relative shadow-2xl my-auto border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          title="Cerrar Currículum"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header & Identity Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 border-b border-slate-200 pb-6 mb-6">
          <div className="relative shrink-0">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-200 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl border-2 border-indigo-200 shadow-md">
                {profile.fullName.charAt(0)}
              </div>
            )}
            {profile.isMatriculado && (
              <span
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-md"
                title="Profesional Matriculado Verificado"
              >
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                {tradeName}
              </span>
              {profile.isMatriculado && (
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Matrícula: {profile.matriculaNumber || 'Verificada'}
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                Disp. {availabilityLabels[profile.availability] || profile.availability}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {profile.fullName}
            </h2>

            <p className="text-sm font-bold text-indigo-700">
              {profile.desiredTitle || `${tradeName} Profesional`}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                {profile.location} {profile.zones && profile.zones.length > 0 && `(Cubre: ${profile.zones.slice(0, 2).join(', ')})`}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {profile.yearsOfExperience} años de experiencia
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
          <a
            href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contactar WhatsApp</span>
          </a>

          <a
            href={`tel:${profile.phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Llamar por Teléfono</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              title="Compartir enlace al CV"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Compartir</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              title="Imprimir CV"
            >
              <Printer className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* CV Body Content */}
        <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
          {/* Resumen Profesional */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Perfil Laboral & Resumen Profesional</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {profile.summary}
            </p>
          </div>

          {/* Quick Technical Conditions (Vehículo, Herramientas, Remuneración) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Movilidad</span>
              <span className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                {profile.hasOwnVehicle ? 'Vehículo Propio' : 'Transporte Público'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Herramientas</span>
              <span className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                {profile.hasOwnTools ? 'Herramientas Completas' : 'Básicas'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Disponibilidad</span>
              <span className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {availabilityLabels[profile.availability] || profile.availability}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Pretensión</span>
              <span className="font-black text-slate-800 flex items-center gap-1 mt-0.5 truncate" title={profile.salaryExpectation || 'A convenir'}>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {profile.salaryExpectation || 'A convenir'}
              </span>
            </div>
          </div>

          {/* Habilidades Técnicas */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>Habilidades & Manejo de Herramientas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 font-bold text-xs border border-indigo-200/80"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trayectoria Laboral */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Experiencia Laboral & Obras</span>
              </div>
              <div className="space-y-2.5">
                {profile.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-extrabold text-sm text-slate-900">
                        {exp.role}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 self-start sm:self-auto">
                        {exp.period}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      {exp.companyOrProject}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formación y Certificaciones */}
          {(profile.education?.length > 0 || profile.certifications?.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Formación, Cursos & Certificaciones</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.education?.map((edu) => (
                  <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <strong className="block font-bold text-slate-900">{edu.title}</strong>
                    <span className="text-[11px] text-slate-500">{edu.institution} {edu.year && `• ${edu.year}`}</span>
                  </div>
                ))}

                {profile.certifications?.map((cert, index) => (
                  <div key={index} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">{cert}</span>
                      <span className="text-[10px] text-amber-800 font-semibold">Certificado oficial</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ferretería Bruzzone Sponsor Badge */}
          <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black">
                FB
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Auspiciado por Ferretería Bruzzone
                </span>
                <span className="text-[11px] text-slate-500">
                  Profesionales capacitados con insumos y herramientas normalizadas.
                </span>
              </div>
            </div>
            <a
              href="https://ferreteriabruzzone.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] shrink-0"
            >
              Ferretería Web
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cerrar Currículum
          </button>
        </div>
      </div>
    </div>
  );
};
