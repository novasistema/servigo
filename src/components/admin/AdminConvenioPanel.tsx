import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, Store, CheckCircle2, XCircle, Save, Search } from 'lucide-react';
import { IssuedVoucher } from '../../types';
import {
  ConvenioConfig,
  DEFAULT_CONVENIO,
  subscribeConvenioConfig,
  saveConvenioConfig,
  subscribeAllVouchers,
} from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

interface Props {
  showToast: (msg: string) => void;
}

const money = (n: number) => `$${(Number(n) || 0).toLocaleString('es-AR')}`;
const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString('es-AR') : '—');

export const AdminConvenioPanel: React.FC<Props> = ({ showToast }) => {
  const { getIdToken } = useAuth();
  const [cfg, setCfg] = useState<ConvenioConfig>(DEFAULT_CONVENIO);
  const [vouchers, setVouchers] = useState<IssuedVoucher[]>([]);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [purchase, setPurchase] = useState<number | ''>('');
  const [checked, setChecked] = useState<{ voucher: any; valid: boolean; expired: boolean } | null>(null);
  const [checkError, setCheckError] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => subscribeConvenioConfig(setCfg), []);
  useEffect(() => subscribeAllVouchers(setVouchers), []);

  const stats = useMemo(() => {
    const issued = vouchers.length;
    const redeemed = vouchers.filter((v) => v.status === 'redeemed');
    const sales = redeemed.reduce((acc, v: any) => acc + (Number(v.purchaseAmount) || 0), 0);
    const fromRentals = vouchers.filter((v: any) => v.source === 'rental').length;
    return { issued, redeemed: redeemed.length, sales, fromRentals };
  }, [vouchers]);

  const api = async (path: string, body: any) => {
    const token = await getIdToken();
    if (!token) throw new Error('Iniciá sesión con la cuenta del creador.');
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecked(null);
    setCheckError('');
    if (!code.trim()) return;
    try {
      setWorking(true);
      setChecked(await api('/api/vouchers/check', { code }));
    } catch (err: any) {
      setCheckError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleRedeem = async () => {
    try {
      setWorking(true);
      const data = await api('/api/vouchers/redeem', { code, purchaseAmount: purchase || 0 });
      setChecked({ voucher: data.voucher, valid: false, expired: false });
      showToast(`✅ Cupón ${data.voucher.voucherCode} canjeado`);
      setPurchase('');
    } catch (err: any) {
      setCheckError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveConvenioConfig({
        active: cfg.active,
        percent: Math.max(1, Math.min(50, Number(cfg.percent) || 10)),
        validDays: Math.max(1, Math.min(365, Number(cfg.validDays) || 30)),
        minSpend: Math.max(0, Number(cfg.minSpend) || 0),
      });
      showToast('✅ Convenio guardado');
    } catch {
      showToast('❌ No se pudo guardar el convenio');
    } finally {
      setSaving(false);
    }
  };

  const v = checked?.voucher;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Ticket className="w-4 h-4 text-amber-400" /> Convenio Ferretería Bruzzone
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Cada alquiler que termina bien genera automáticamente un cupón para el inquilino y otro para el dueño, canjeable solo en Ferretería Bruzzone.
          Los profesionales de ServiGo Servicios también pueden entregar cupones a sus clientes al terminar un trabajo.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          ['Cupones emitidos', String(stats.issued)],
          ['De alquileres', String(stats.fromRentals)],
          ['Canjeados', String(stats.redeemed)],
          ['Ventas con cupón', money(stats.sales)],
        ].map(([label, value]) => (
          <div key={label} className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
            <p className="text-lg font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Mostrador */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
        <p className="text-sm font-black text-amber-300 flex items-center gap-2">
          <Store className="w-4 h-4" /> Mostrador: validar y canjear un cupón
        </p>
        <form onSubmit={handleCheck} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setChecked(null);
              setCheckError('');
            }}
            placeholder="Código, ej. BRZ-7K2M9Q"
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono tracking-wider placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
          <button disabled={working} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black flex items-center gap-1">
            <Search className="w-4 h-4" /> Verificar
          </button>
        </form>

        {checkError && (
          <p className="text-xs text-rose-300 font-bold flex items-center gap-1">
            <XCircle className="w-4 h-4" /> {checkError}
          </p>
        )}

        {v && (
          <div className={`p-3 rounded-xl border ${checked?.valid ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-900'}`}>
            <p className="text-sm font-black text-white flex items-center gap-2">
              {checked?.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              {v.couponTitle} — {v.voucherCode}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              A nombre de <b>{v.clientName || 'cliente'}</b> · {v.workerTrade || v.workerName} · vence {fmtDate(v.expiresAt)}
              {Number(v.minSpend) > 0 && <> · compra mínima {money(v.minSpend)}</>}
            </p>
            {v.status === 'redeemed' && (
              <p className="text-xs text-slate-400 mt-1">
                Ya canjeado el {fmtDate(v.redeemedAt)}
                {Number(v.purchaseAmount) > 0 && <> por una compra de {money(v.purchaseAmount)}</>}.
              </p>
            )}
            {checked?.expired && <p className="text-xs text-rose-300 mt-1">El cupón está vencido.</p>}

            {checked?.valid && (
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <input
                  type="number"
                  min={0}
                  value={purchase}
                  onChange={(e) => setPurchase(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Monto de la compra (opcional)"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                />
                <button
                  onClick={handleRedeem}
                  disabled={working}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black"
                >
                  Canjear cupón
                </button>
              </div>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          Cargar el monto de la compra es opcional, pero te sirve para medir cuánto te vende el convenio.
        </p>
      </div>

      {/* Configuración */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <p className="text-sm font-black text-white">Condiciones del cupón por alquiler</p>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={cfg.active} onChange={(e) => setCfg({ ...cfg, active: e.target.checked })} />
          Emitir cupones automáticamente al terminar un alquiler
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-[11px] text-slate-400 font-bold">
            Descuento (%)
            <input
              type="number"
              value={cfg.percent}
              onChange={(e) => setCfg({ ...cfg, percent: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
            />
          </label>
          <label className="text-[11px] text-slate-400 font-bold">
            Válido (días)
            <input
              type="number"
              value={cfg.validDays}
              onChange={(e) => setCfg({ ...cfg, validDays: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
            />
          </label>
          <label className="text-[11px] text-slate-400 font-bold">
            Compra mínima ($)
            <input
              type="number"
              value={cfg.minSpend}
              onChange={(e) => setCfg({ ...cfg, minSpend: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
            />
          </label>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black flex items-center gap-1"
        >
          <Save className="w-4 h-4" /> {saving ? 'Guardando…' : 'Guardar condiciones'}
        </button>
      </div>

      {/* Últimos cupones */}
      <div className="space-y-2">
        <p className="text-sm font-black text-white">Últimos cupones</p>
        {vouchers.length === 0 ? (
          <p className="text-xs text-slate-500">Todavía no se emitió ninguno.</p>
        ) : (
          [...vouchers]
            .sort((a, b) => String(b.issuedAt).localeCompare(String(a.issuedAt)))
            .slice(0, 30)
            .map((x: any) => (
              <div key={x.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="min-w-0">
                  <p className="font-mono font-black text-white">{x.voucherCode}</p>
                  <p className="text-slate-400 truncate">
                    {x.clientName || 'cliente'} · {x.workerTrade || x.workerName} · {x.discountText}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                    x.status === 'redeemed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {x.status === 'redeemed' ? 'CANJEADO' : 'ACTIVO'}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
