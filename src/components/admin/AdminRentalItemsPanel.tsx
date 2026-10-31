import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Star, Trash2, Search, AlertTriangle, Package } from 'lucide-react';
import { RentalItem, RentalBooking } from '../../types';
import { saveRentalItemToFirestore, deleteRentalItemFromFirestore } from '../../lib/firebase';
import { INITIAL_RENTAL_ITEMS } from '../../data/mockRentals';

interface Props {
  rentalItems: RentalItem[];
  rentalBookings: RentalBooking[];
  showToast: (msg: string) => void;
}

const DEMO_IDS = new Set(INITIAL_RENTAL_ITEMS.map((i) => i.id));
const isDemo = (i: RentalItem) => DEMO_IDS.has(i.id) || !(i as any).ownerUid || (i as any).ownerUid === 'locador-demo';
const money = (n: number) => `$${(Number(n) || 0).toLocaleString('es-AR')}`;

export const AdminRentalItemsPanel: React.FC<Props> = ({ rentalItems, rentalBookings, showToast }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'demo'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const demoCount = rentalItems.filter(isDemo).length;

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rentalItems
      .filter((i) => {
        if (filter === 'active' && !i.isAvailable) return false;
        if (filter === 'paused' && i.isAvailable) return false;
        if (filter === 'demo' && !isDemo(i)) return false;
        if (!q) return true;
        return [i.title, i.ownerName, i.location, i.categoryLabel].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [rentalItems, search, filter]);

  const bookingsFor = (id: string) => rentalBookings.filter((b: any) => b.rentalItemId === id);

  const update = async (item: RentalItem, patch: Partial<RentalItem>, msg: string) => {
    try {
      setBusy(item.id);
      await saveRentalItemToFirestore({ ...item, ...patch, updatedAt: new Date().toISOString() } as RentalItem);
      showToast(msg);
    } catch {
      showToast('❌ No se pudo guardar. ¿Iniciaste sesión con la cuenta del creador?');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: RentalItem) => {
    try {
      setBusy(item.id);
      await deleteRentalItemFromFirestore(item.id);
      showToast(`🗑️ Publicación eliminada: ${item.title}`);
    } catch {
      showToast('❌ No se pudo eliminar.');
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  };

  const removeAllDemos = async () => {
    const demos = rentalItems.filter(isDemo);
    if (!demos.length) return;
    setBusy('demos');
    let ok = 0;
    for (const d of demos) {
      try {
        await deleteRentalItemFromFirestore(d.id);
        ok++;
      } catch {
        /* sigue con el resto */
      }
    }
    setBusy(null);
    setConfirmDelete(null);
    showToast(`🧹 Se borraron ${ok} publicaciones de demostración.`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-400" /> Publicaciones de Alquiler ({rentalItems.length})
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Como creador podés pausar, destacar o eliminar cualquier publicación. Pausar la oculta del catálogo sin borrarla.
        </p>
      </div>

      {demoCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <p className="text-xs text-amber-200 font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            Hay {demoCount} publicaciones de demostración (con dueños y fotos inventadas). Antes de abrir al público conviene borrarlas: un visitante podría intentar alquilarlas.
          </p>
          {confirmDelete === 'demos' ? (
            <div className="flex gap-2">
              <button
                onClick={removeAllDemos}
                disabled={busy === 'demos'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black"
              >
                {busy === 'demos' ? 'Borrando…' : `Sí, borrar las ${demoCount}`}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete('demos')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
            >
              Borrar publicaciones de demostración
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, dueño o localidad"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
        >
          <option value="all">Todas</option>
          <option value="active">Visibles</option>
          <option value="paused">Pausadas</option>
          <option value="demo">De demostración</option>
        </select>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-10">No hay publicaciones con ese filtro.</p>
      ) : (
        <div className="space-y-3">
          {list.map((item) => {
            const bks = bookingsFor(item.id);
            return (
              <div key={item.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3">
                <img
                  src={item.images?.[0]}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-black text-sm text-white truncate">{item.title}</p>
                    {isDemo(item) && <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black">DEMO</span>}
                    {!item.isAvailable && <span className="px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 text-[9px] font-black">PAUSADA</span>}
                    {item.featured && <span className="px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-[9px] font-black">DESTACADA</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.ownerName} · {item.location} · {item.ownerPhone || 'sin teléfono'}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {money(item.dailyPrice)}/día · garantía {money(item.depositAmount)} · {bks.length} reserva{bks.length === 1 ? '' : 's'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      disabled={busy === item.id}
                      onClick={() => update(item, { isAvailable: !item.isAvailable }, item.isAvailable ? '⏸️ Publicación pausada' : '▶️ Publicación visible')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1"
                    >
                      {item.isAvailable ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {item.isAvailable ? 'Pausar' : 'Mostrar'}
                    </button>
                    <button
                      disabled={busy === item.id}
                      onClick={() => update(item, { featured: !item.featured }, item.featured ? 'Se quitó de destacados' : '⭐ Publicación destacada')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" /> {item.featured ? 'Quitar destacado' : 'Destacar'}
                    </button>
                    {confirmDelete === item.id ? (
                      <>
                        <button onClick={() => remove(item)} className="px-2.5 py-1 rounded-lg bg-rose-600 text-[11px] font-black text-white">
                          Confirmar borrado
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300">
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-bold text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
