import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import { Search, Trash2, EyeOff, Eye, Phone, MapPin } from 'lucide-react';
import { db } from '../../lib/firebase';
import { KINDS, Kind, PendingItem, summarize } from './AdminApprovalsPanel';
import { INITIAL_CADETES } from '../../data/mockCadetes';
import { INITIAL_WORKERS, INITIAL_SHOPS, INITIAL_REMISES } from '../../data/mockData';
import { INITIAL_JOB_PROFILES } from '../../data/mockJobProfiles';
import { INITIAL_MERCHANTS } from '../../data/mockMerchants';
import { INITIAL_RENTAL_ITEMS } from '../../data/mockRentals';

// Registros de demostración que vinieron con la plantilla original
const DEMO_IDS = new Set<string>([
  ...INITIAL_CADETES.map((x) => x.id),
  ...INITIAL_WORKERS.map((x) => x.id),
  ...INITIAL_SHOPS.map((x) => x.id),
  ...INITIAL_REMISES.map((x) => x.id),
  ...INITIAL_JOB_PROFILES.map((x) => x.id),
  ...INITIAL_MERCHANTS.map((x) => x.id),
  ...INITIAL_RENTAL_ITEMS.map((x) => x.id),
]);

type Status = 'publicado' | 'pendiente' | 'oculto' | 'prueba';

function statusOf(item: PendingItem): Status {
  if (DEMO_IDS.has(item.id)) return 'prueba';
  const st = item.data?.approvalStatus;
  if (st === 'pending') return 'pendiente';
  if (st === 'rejected') return 'oculto';
  return 'publicado';
}

const STATUS_STYLE: Record<Status, string> = {
  publicado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pendiente: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  oculto: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  prueba: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
};
const STATUS_LABEL: Record<Status, string> = {
  publicado: 'Publicado',
  pendiente: 'Para aprobar',
  oculto: 'Oculto',
  prueba: 'De prueba (no se muestra)',
};

/**
 * Todo lo publicado en ServiGo, de todos los tipos, para que el creador
 * pueda revisarlo, ocultarlo o borrarlo.
 */
export const AdminListingsPanel: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const [byKind, setByKind] = useState<Record<string, PendingItem[]>>({});
  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [q, setQ] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmDemos, setConfirmDemos] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const unsubs = KINDS.map(({ id }) =>
      onSnapshot(
        collection(db, id),
        (snap) =>
          setByKind((prev) => ({
            ...prev,
            [id]: snap.docs.map((d) => ({ kind: id, id: d.id, data: d.data() })),
          })),
        (err) => console.error('Publicaciones', id, err)
      )
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  const all = useMemo(() => Object.values(byKind).flat(), [byKind]);
  const demos = useMemo(() => all.filter((x) => DEMO_IDS.has(x.id)), [all]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((x) => kind === 'all' || x.kind === kind)
      .filter((x) => statusFilter === 'all' || statusOf(x) === statusFilter)
      .filter((x) => {
        if (!needle) return true;
        const s = summarize(x);
        return [s.title, s.subtitle, s.phone, s.place].join(' ').toLowerCase().includes(needle);
      })
      .sort((a, b) => String(b.data?.createdAt || '').localeCompare(String(a.data?.createdAt || '')));
  }, [all, kind, statusFilter, q]);

  const setVisible = async (item: PendingItem, visible: boolean) => {
    const key = `${item.kind}/${item.id}`;
    setBusy(key);
    try {
      await updateDoc(doc(db, item.kind, item.id), {
        approvalStatus: visible ? 'approved' : 'rejected',
        approvalDecidedAt: new Date().toISOString(),
      });
      showToast(visible ? 'Vuelve a verse en la web.' : 'Oculto: ya no se ve en la web.');
    } catch (e) {
      console.error(e);
      showToast('No se pudo cambiar. Revisá que hayas ingresado como creador.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: PendingItem) => {
    const key = `${item.kind}/${item.id}`;
    setBusy(key);
    try {
      await deleteDoc(doc(db, item.kind, item.id));
      showToast('Borrado definitivamente.');
      setConfirming(null);
    } catch (e) {
      console.error(e);
      showToast('No se pudo borrar. Revisá que hayas ingresado como creador.');
    } finally {
      setBusy(null);
    }
  };

  const removeDemos = async () => {
    setBusy('demos');
    try {
      // Lotes de hasta 400 operaciones
      for (let i = 0; i < demos.length; i += 400) {
        const batch = writeBatch(db);
        demos.slice(i, i + 400).forEach((d) => batch.delete(doc(db, d.kind, d.id)));
        await batch.commit();
      }
      showToast(`Se borraron ${demos.length} registros de prueba.`);
      setConfirmDemos(false);
    } catch (e) {
      console.error(e);
      showToast('No se pudieron borrar los de prueba. Revisá que hayas ingresado como creador.');
    } finally {
      setBusy(null);
    }
  };

  const chip = (on: boolean) =>
    `shrink-0 h-10 px-3.5 rounded-full text-sm font-bold cursor-pointer ${
      on ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
    }`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="m-0 text-lg font-black text-white">Publicaciones</h3>
        <p className="m-0 mt-1 text-sm text-slate-300">
          Todo lo cargado en ServiGo. Podés ocultar algo (deja de verse, se puede volver a mostrar) o borrarlo para siempre.
        </p>
      </div>

      {demos.length > 0 && (
        <div className="rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4 space-y-2">
          <p className="m-0 text-sm text-fuchsia-100">
            Hay <b>{demos.length}</b> registros de prueba que vinieron con la plantilla (no se muestran en la web).
          </p>
          {confirmDemos ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy === 'demos'}
                onClick={removeDemos}
                className="h-11 px-4 rounded-xl bg-red-600 text-white font-extrabold text-sm cursor-pointer disabled:opacity-60"
              >
                Sí, borrar los {demos.length} de prueba
              </button>
              <button type="button" onClick={() => setConfirmDemos(false)} className="h-11 px-4 rounded-xl text-slate-200 font-bold text-sm cursor-pointer">
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDemos(true)}
              className="h-11 px-4 rounded-xl border border-fuchsia-400/60 text-fuchsia-100 font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-fuchsia-500/20"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Borrar todos los de prueba
            </button>
          )}
        </div>
      )}

      <label htmlFor="pub-buscar" className="sr-only">Buscar publicación</label>
      <div className="flex items-center gap-2 h-11 px-3 rounded-xl bg-slate-950 border border-slate-700">
        <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <input
          id="pub-buscar"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, teléfono o zona"
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Tipo">
        {[{ id: 'all' as const, label: 'Todo' }, ...KINDS].map((k) => {
          const n = k.id === 'all' ? all.length : (byKind[k.id] || []).length;
          return (
            <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => setKind(k.id)} className={chip(kind === k.id)}>
              {k.label} <span className="opacity-75">({n})</span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Estado">
        {(['all', 'publicado', 'pendiente', 'oculto', 'prueba'] as const).map((st) => (
          <button key={st} type="button" aria-pressed={statusFilter === st} onClick={() => setStatusFilter(st)} className={chip(statusFilter === st)}>
            {st === 'all' ? 'Cualquier estado' : STATUS_LABEL[st]}
          </button>
        ))}
      </div>

      <p className="m-0 text-sm text-slate-400">{list.length} resultado(s)</p>

      <ul className="m-0 p-0 list-none space-y-3">
        {list.map((item) => {
          const key = `${item.kind}/${item.id}`;
          const s = summarize(item);
          const st = statusOf(item);
          const kindLabel = KINDS.find((k) => k.id === item.kind)?.label;
          return (
            <li key={key} className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="flex gap-3">
                {s.image ? (
                  <img src={s.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-slate-800 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-800 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-amber-300">{kindLabel}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[st]}`}>{STATUS_LABEL[st]}</span>
                  </div>
                  <p className="m-0 text-base font-black text-white truncate">{s.title || '(sin nombre)'}</p>
                  {s.subtitle && <p className="m-0 text-sm text-slate-300 truncate">{s.subtitle}</p>}
                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-400 mt-0.5">
                    {s.place && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden="true" />{s.place}</span>}
                    {s.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" aria-hidden="true" />{s.phone}</span>}
                  </div>
                </div>
              </div>

              {confirming === key ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-red-200 font-semibold">¿Borrar para siempre? No se puede deshacer.</span>
                  <button
                    type="button"
                    disabled={busy === key}
                    onClick={() => remove(item)}
                    className="h-10 px-4 rounded-xl bg-red-600 text-white font-extrabold text-sm cursor-pointer disabled:opacity-60"
                  >
                    Sí, borrar
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className="h-10 px-3 rounded-xl text-slate-300 font-bold text-sm cursor-pointer">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {st !== 'prueba' &&
                    (st === 'oculto' || st === 'pendiente' ? (
                      <button
                        type="button"
                        disabled={busy === key}
                        onClick={() => setVisible(item, true)}
                        className="h-10 px-4 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" /> {st === 'pendiente' ? 'Aprobar' : 'Mostrar'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === key}
                        onClick={() => setVisible(item, false)}
                        className="h-10 px-4 rounded-xl border border-slate-600 text-slate-200 font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 disabled:opacity-60"
                      >
                        <EyeOff className="w-4 h-4" aria-hidden="true" /> Ocultar
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setConfirming(key)}
                    className="h-10 px-4 rounded-xl border border-red-500/60 text-red-300 font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> Borrar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
