import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { CheckCircle2, XCircle, Phone, MapPin, ExternalLink, Inbox } from 'lucide-react';
import { db } from '../../lib/firebase';

type Kind = 'workers' | 'shops' | 'merchants' | 'remises' | 'cadetes' | 'job_profiles' | 'rental_items';

const KINDS: { id: Kind; label: string }[] = [
  { id: 'workers', label: 'Trabajador' },
  { id: 'merchants', label: 'Local de comida' },
  { id: 'rental_items', label: 'Producto en alquiler' },
  { id: 'shops', label: 'Comercio' },
  { id: 'cadetes', label: 'Cadete' },
  { id: 'remises', label: 'Remis' },
  { id: 'job_profiles', label: 'CV / Bolsa de trabajo' },
];

interface PendingItem {
  kind: Kind;
  id: string;
  data: any;
}

const pick = (d: any, ...keys: string[]) => keys.map((k) => d?.[k]).find((v) => typeof v === 'string' && v.trim()) || '';

function summarize(item: PendingItem) {
  const d = item.data;
  const title = pick(d, 'name', 'title', 'fullName');
  const subtitle = pick(d, 'tradeTitle', 'category', 'categoryLabel', 'desiredTitle', 'vehicleDescription', 'businessType');
  const phone = pick(d, 'whatsapp', 'phone', 'ownerWhatsapp', 'ownerPhone');
  const place = pick(d, 'location', 'address', 'baseLocation');
  const image = pick(d, 'avatar', 'imageUrl', 'photoUrl') || (Array.isArray(d?.images) ? d.images[0] : '');
  const detail = pick(d, 'bio', 'description', 'summary');
  const price = typeof d?.dailyPrice === 'number' ? `$${d.dailyPrice.toLocaleString('es-AR')} por día` : '';
  return { title, subtitle, phone, place, image, detail, price };
}

/**
 * Cola de revisión del creador: todo lo nuevo que se publica queda "pendiente"
 * y no se ve en la web hasta que se aprueba acá.
 */
export const AdminApprovalsPanel: React.FC<{ showToast: (m: string) => void; onCountChange?: (n: number) => void }> = ({
  showToast,
  onCountChange,
}) => {
  const [byKind, setByKind] = useState<Record<string, PendingItem[]>>({});
  const [filter, setFilter] = useState<Kind | 'all'>('all');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const unsubs = KINDS.map(({ id }) =>
      onSnapshot(
        query(collection(db, id), where('approvalStatus', '==', 'pending')),
        (snap) =>
          setByKind((prev) => ({
            ...prev,
            [id]: snap.docs.map((d) => ({ kind: id, id: d.id, data: d.data() })),
          })),
        (err) => console.error('Aprobaciones', id, err)
      )
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  const all = useMemo(
    () =>
      Object.values(byKind)
        .flat()
        .sort((a, b) => String(b.data?.createdAt || '').localeCompare(String(a.data?.createdAt || ''))),
    [byKind]
  );
  useEffect(() => onCountChange?.(all.length), [all.length, onCountChange]);

  const list = filter === 'all' ? all : all.filter((x) => x.kind === filter);

  const decide = async (item: PendingItem, status: 'approved' | 'rejected') => {
    const key = `${item.kind}/${item.id}`;
    setBusy(key);
    try {
      await updateDoc(doc(db, item.kind, item.id), {
        approvalStatus: status,
        approvalNote: status === 'rejected' ? reason.trim() : '',
        approvalDecidedAt: new Date().toISOString(),
        ...(status === 'approved' && (item.kind === 'workers' || item.kind === 'cadetes') ? { verified: true } : {}),
      });
      showToast(status === 'approved' ? 'Aprobado: ya se ve en la web.' : 'Rechazado: no se va a mostrar.');
      setRejecting(null);
      setReason('');
    } catch (e: any) {
      console.error(e);
      showToast('No se pudo guardar la decisión. Revisá que hayas ingresado como creador.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="m-0 text-lg font-black text-white">Para aprobar</h3>
        <p className="m-0 mt-1 text-sm text-slate-300">
          Todo lo que se registra nuevo espera acá. No aparece en la web hasta que lo aprobás.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Filtrar por tipo">
        {[{ id: 'all' as const, label: 'Todo' }, ...KINDS].map((k) => {
          const n = k.id === 'all' ? all.length : (byKind[k.id] || []).length;
          const on = filter === k.id;
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(k.id)}
              className={`shrink-0 h-10 px-3.5 rounded-full text-sm font-bold cursor-pointer ${
                on ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {k.label} {n > 0 && <span className="ml-1 opacity-80">({n})</span>}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 text-center text-slate-300">
          <Inbox className="w-8 h-8 mx-auto text-slate-500" aria-hidden="true" />
          <p className="m-0 mt-2 font-bold">No hay nada pendiente.</p>
        </div>
      ) : (
        <ul className="m-0 p-0 list-none space-y-3">
          {list.map((item) => {
            const key = `${item.kind}/${item.id}`;
            const s = summarize(item);
            const kindLabel = KINDS.find((k) => k.id === item.kind)?.label;
            const wa = s.phone.replace(/\D/g, '');
            return (
              <li key={key} className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                <div className="flex gap-3">
                  {s.image ? (
                    <img src={s.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 shrink-0" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-amber-300">{kindLabel}</span>
                    <p className="m-0 text-base font-black text-white truncate">{s.title || '(sin nombre)'}</p>
                    {s.subtitle && <p className="m-0 text-sm text-slate-300 truncate">{s.subtitle}</p>}
                    {s.price && <p className="m-0 text-sm font-bold text-emerald-300">{s.price}</p>}
                  </div>
                </div>
                {s.detail && <p className="m-0 text-sm text-slate-300 line-clamp-3">{s.detail}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                  {s.place && (
                    <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" aria-hidden="true" />{s.place}</span>
                  )}
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-bold"
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />{s.phone}<ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                  {item.data?.createdAt && <span>{new Date(item.data.createdAt).toLocaleString('es-AR')}</span>}
                </div>

                {rejecting === key ? (
                  <div className="space-y-2">
                    <label htmlFor={`motivo-${key}`} className="block text-sm font-bold text-slate-200">Motivo (opcional, lo ve quien se registró)</label>
                    <input
                      id={`motivo-${key}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                      placeholder="Ej: faltan fotos reales"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy === key}
                        onClick={() => decide(item, 'rejected')}
                        className="h-11 px-4 rounded-xl bg-red-600 text-white font-extrabold text-sm cursor-pointer disabled:opacity-60"
                      >
                        Confirmar rechazo
                      </button>
                      <button type="button" onClick={() => setRejecting(null)} className="h-11 px-4 rounded-xl text-slate-300 font-bold text-sm cursor-pointer">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy === key}
                      onClick={() => decide(item, 'approved')}
                      className="flex-1 h-11 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejecting(key);
                        setReason('');
                      }}
                      className="flex-1 h-11 rounded-xl border border-slate-600 text-slate-200 font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800"
                    >
                      <XCircle className="w-4 h-4" aria-hidden="true" /> Rechazar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
