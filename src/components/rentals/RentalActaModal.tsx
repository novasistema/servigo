import React, { useEffect, useMemo, useState } from 'react';
import { X, Camera, CheckCircle2, AlertTriangle, Trash2, ClipboardCheck, Clock } from 'lucide-react';
import { RentalBooking, RentalActa } from '../../types';
import { getActaPhotos } from '../../lib/firebase';
import { compressImageFile } from '../../utils/imageCompression';
import { useAuth } from '../../context/AuthContext';

type Stage = 'entrega' | 'devolucion';
type Role = 'owner' | 'client';

interface Props {
  booking: RentalBooking | null;
  stage: Stage;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  /** Solo dueño, en devolución: abrir el reporte de daño existente */
  onReportDamage?: (booking: RentalBooking) => void;
}

const CHECKS: { key: keyof RentalActa['checklist']; label: string }[] = [
  { key: 'funciona', label: 'Funciona correctamente (se probó en el momento)' },
  { key: 'accesorios', label: 'Tiene todos los accesorios incluidos' },
  { key: 'estetica', label: 'Sin golpes, roturas ni faltantes visibles' },
  { key: 'limpio', label: 'Está limpio' },
];

const fmt = (s?: string) =>
  s ? new Date(s).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export const RentalActaModal: React.FC<Props> = ({ booking, stage, role, isOpen, onClose, showToast, onReportDamage }) => {
  const { getIdToken } = useAuth();
  const acta = booking ? (booking as any)[stage] as RentalActa | undefined : undefined;
  const [photos, setPhotos] = useState<string[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<{ id: string; dataUrl: string }[]>([]);
  const [checklist, setChecklist] = useState<RentalActa['checklist']>({ funciona: false, accesorios: false, estetica: false, limpio: false });
  const [notes, setNotes] = useState('');
  const [observations, setObservations] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !booking) return;
    setPhotos([]);
    setNotes('');
    setObservations('');
    setAgree(false);
    setChecklist({ funciona: false, accesorios: false, estetica: false, limpio: false });
    setSavedPhotos([]);
    if (acta?.photoIds?.length) {
      getActaPhotos(booking.id, stage).then(setSavedPhotos).catch(() => setSavedPhotos([]));
    }
  }, [isOpen, booking?.id, stage, acta?.submittedAt]);

  // Qué puede hacer esta persona ahora
  const mode = useMemo<'form' | 'sign' | 'view' | 'wait'>(() => {
    if (!booking) return 'view';
    if (!acta) {
      if (stage === 'entrega') return role === 'owner' ? 'form' : 'wait';
      return 'form'; // la devolución la puede cargar cualquiera de las partes
    }
    if (stage === 'entrega') return role === 'client' && !acta.clientSignedAt ? 'sign' : 'view';
    if (role === 'owner' && !acta.ownerSignedAt) return 'sign';
    if (role === 'client' && !acta.clientSignedAt) return 'sign';
    return 'view';
  }, [booking, acta, stage, role]);

  if (!isOpen || !booking) return null;

  const title = stage === 'entrega' ? 'Acta de entrega' : 'Acta de devolución';

  const api = async (path: string, body: any) => {
    const token = await getIdToken();
    if (!token) throw new Error('Iniciá sesión para continuar.');
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const room = 4 - photos.length;
    const list = Array.from(files).slice(0, room);
    try {
      const out: string[] = [];
      for (const f of list) out.push(await compressImageFile(f, 1024, 0.72));
      setPhotos((p) => [...p, ...out].slice(0, 4));
    } catch (e: any) {
      showToast(e.message || 'No se pudo cargar la foto');
    }
  };

  const submit = async () => {
    if (photos.length < 2) return showToast('Sacá al menos 2 fotos del producto.');
    if (!agree) return showToast('Confirmá que los datos del acta son correctos.');
    try {
      setBusy(true);
      await api('/api/rentals/acta', { bookingId: booking.id, stage, checklist, notes, photos });
      showToast(
        stage === 'entrega'
          ? '📋 Acta de entrega guardada. Falta que el inquilino la firme.'
          : role === 'client'
          ? '📋 Devolución registrada. Ahora el dueño la revisa y la confirma.'
          : '📋 Devolución registrada. Revisala y confirmala para cerrar el alquiler.'
      );
      onClose();
    } catch (e: any) {
      showToast('❌ ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const sign = async () => {
    if (!agree) return showToast('Marcá la casilla de conformidad para firmar.');
    try {
      setBusy(true);
      const data = await api('/api/rentals/acta/firmar', { bookingId: booking.id, stage, observations });
      if (stage === 'entrega') showToast('✅ Entrega firmada. ¡Empieza el alquiler!');
      else if (role === 'owner') {
        const late = Number(data.lateFeeRetained) || 0;
        showToast(
          late > 0
            ? `✅ Devolución cerrada. Se descontaron $${late.toLocaleString('es-AR')} de mora de la garantía.`
            : '✅ Devolución cerrada. Se reintegra la garantía y se acredita tu cobro.'
        );
      } else showToast('✅ Firmaste el acta de devolución.');
      onClose();
    } catch (e: any) {
      showToast('❌ ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const signLabel =
    stage === 'entrega'
      ? 'Recibí el producto en este estado'
      : role === 'owner'
      ? 'Recibí el producto de vuelta en este estado'
      : 'Estoy de acuerdo con este acta de devolución';

  const PhotoGrid: React.FC<{ list: string[]; removable?: boolean }> = ({ list, removable }) => (
    <div className="grid grid-cols-2 gap-2">
      {list.map((src, i) => (
        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setZoom(src)} />
          {removable && (
            <button
              onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 text-rose-600"
              aria-label="Quitar foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg max-h-[94vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-orange-600 uppercase tracking-wider flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5" /> {title}
            </p>
            <h2 className="text-lg font-black text-slate-900 leading-tight">{booking.rentalItemTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.startDate} al {booking.endDate} · Dueño: {booking.ownerName} · Inquilino: {booking.clientName}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {mode === 'wait' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-2">
              <Clock className="w-5 h-5 shrink-0" />
              <p>Cuando retires el producto, el dueño completa el acta de entrega con fotos y vos la firmás desde acá.</p>
            </div>
          )}

          {mode === 'form' && (
            <>
              <p className="text-sm text-slate-600">
                {stage === 'entrega'
                  ? 'Completá el acta en el momento de entregar, con el inquilino presente. Después él la firma desde su celular.'
                  : 'Registrá cómo vuelve el producto. Sacá fotos de los mismos ángulos que en la entrega.'}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase">Estado del producto</p>
                {CHECKS.map((c) => (
                  <label key={c.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-orange-600"
                      checked={checklist[c.key]}
                      onChange={(e) => setChecklist({ ...checklist, [c.key]: e.target.checked })}
                    />
                    {c.label}
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase">Fotos ({photos.length}/4, mínimo 2)</p>
                {photos.length > 0 && <PhotoGrid list={photos} removable />}
                {photos.length < 4 && (
                  <label className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 text-orange-700 font-black text-sm cursor-pointer">
                    <Camera className="w-5 h-5" /> Sacar foto
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        addPhotos(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>

              <label className="block text-xs font-black text-slate-500 uppercase">
                Observaciones
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ej: rayón chico en el costado izquierdo, se entrega con alargue de 10 m"
                  className="mt-1 w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 normal-case font-normal"
                />
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-800">
                <input type="checkbox" className="w-5 h-5 mt-0.5 accent-emerald-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                Declaro que las fotos y los datos reflejan el estado real del producto en este momento.
              </label>

              <button
                onClick={submit}
                disabled={busy}
                className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-black text-sm"
              >
                {busy ? 'Guardando…' : stage === 'entrega' ? 'Guardar acta de entrega' : 'Guardar acta de devolución'}
              </button>
            </>
          )}

          {(mode === 'sign' || mode === 'view') && acta && (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-black text-slate-500 uppercase">
                  Cargada por el {acta.submittedBy} · {fmt(acta.submittedAt)}
                </p>
                {CHECKS.map((c) => (
                  <p key={c.key} className="text-sm flex items-center gap-2">
                    {acta.checklist?.[c.key] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className={acta.checklist?.[c.key] ? 'text-slate-800' : 'text-amber-800 font-bold'}>
                      {acta.checklist?.[c.key] ? c.label : `No: ${c.label.toLowerCase()}`}
                    </span>
                  </p>
                ))}
                {acta.notes && <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-200">“{acta.notes}”</p>}
              </div>

              <PhotoGrid list={savedPhotos.map((p) => p.dataUrl)} />
              {acta.photoIds?.length > 0 && savedPhotos.length === 0 && <p className="text-xs text-slate-400">Cargando fotos…</p>}

              <div className="space-y-1 text-xs">
                <p className={acta.ownerSignedAt ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {acta.ownerSignedAt ? `✔ Firmó el dueño · ${fmt(acta.ownerSignedAt)}` : '… Falta la firma del dueño'}
                </p>
                <p className={acta.clientSignedAt ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {acta.clientSignedAt ? `✔ Firmó el inquilino · ${fmt(acta.clientSignedAt)}` : '… Falta la firma del inquilino'}
                </p>
                {acta.clientObservations && <p className="text-slate-600">Observación del inquilino: “{acta.clientObservations}”</p>}
                {acta.ownerObservations && <p className="text-slate-600">Observación del dueño: “{acta.ownerObservations}”</p>}
              </div>

              {mode === 'sign' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-black text-slate-500 uppercase">
                    Observaciones (opcional)
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={2}
                      placeholder="Si algo no coincide con las fotos, anotalo acá"
                      className="mt-1 w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 normal-case font-normal"
                    />
                  </label>
                  <label className="flex items-start gap-3 text-sm text-slate-800">
                    <input type="checkbox" className="w-5 h-5 mt-0.5 accent-emerald-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    {signLabel}. Firmo esta conformidad.
                  </label>
                  <button
                    onClick={sign}
                    disabled={busy}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-sm"
                  >
                    {busy ? 'Firmando…' : stage === 'devolucion' && role === 'owner' ? 'Firmar y cerrar el alquiler' : 'Firmar conformidad'}
                  </button>
                  {stage === 'devolucion' && role === 'owner' && onReportDamage && (
                    <button
                      onClick={() => {
                        onClose();
                        onReportDamage(booking);
                      }}
                      className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black text-sm"
                    >
                      ⚠️ Volvió con daños: reportar y retener garantía
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setZoom(null); }}>
          <img src={zoom} alt="" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  );
};

export const RENTAL_STATUS_LABEL: Record<string, string> = {
  pendiente: 'Esperando pago',
  pendiente_pago: 'Esperando pago',
  confirmado: 'Pagado · falta entregar',
  entrega_pendiente: 'Entrega: falta firma del inquilino',
  en_curso: 'En curso',
  devolucion_pendiente: 'Devuelto · falta confirmación del dueño',
  devuelto: 'Finalizado',
  cancelado: 'Cancelado',
};
