import { CustomTradeOption } from '../types';

export interface BaseTradeInfo {
  id: string;
  label: string;
  icon: string;
  defaultTitle: string;
  color?: string;
}

export const BASE_TRADES: BaseTradeInfo[] = [
  { id: 'gasista', label: 'Gasista Matriculado', icon: '🔥', defaultTitle: 'Gasista Matriculado', color: 'bg-orange-100 text-orange-700' },
  { id: 'electricista', label: 'Electricista', icon: '⚡', defaultTitle: 'Electricista Matriculado e Industrial', color: 'bg-blue-100 text-blue-700' },
  { id: 'plomero', label: 'Plomero / Sanitarista', icon: '🚰', defaultTitle: 'Plomero y Sanitarista', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'pintor', label: 'Pintor', icon: '🎨', defaultTitle: 'Pintor de Obra y Decorativo', color: 'bg-green-100 text-green-700' },
  { id: 'cerrajero', label: 'Cerrajero 24hs', icon: '🔑', defaultTitle: 'Cerrajería de Urgencia 24hs', color: 'bg-amber-100 text-amber-700' },
  { id: 'aire_acondicionado', label: 'Aire Acondicionado / Refrigeración', icon: '❄️', defaultTitle: 'Técnico en Climatización y Refrigeración', color: 'bg-sky-100 text-sky-700' },
  { id: 'albanil', label: 'Albañil / Obras', icon: '🧱', defaultTitle: 'Albañilería y Construcción General', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'jardineria', label: 'Jardines y Poda', icon: '🌿', defaultTitle: 'Jardinería, Poda y Paisajismo', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'carpinteria', label: 'Carpintería', icon: '🪚', defaultTitle: 'Carpintería a Medida', color: 'bg-stone-100 text-stone-700' },
  { id: 'fletes', label: 'Fletes y Mudanzas', icon: '🚚', defaultTitle: 'Fletes, Mudanzas y Encomiendas', color: 'bg-rose-100 text-rose-700' },
];

/**
 * Returns all trade options deduplicated, combining base trades,
 * custom trades from configuration, and any trades present in existing workers.
 */
export function getAllTradeOptions(
  customTrades: CustomTradeOption[] = [],
  extraWorkers: { trade: string; tradeTitle?: string }[] = []
): { id: string; label: string; icon: string; defaultTitle: string; color?: string }[] {
  const map = new Map<string, { id: string; label: string; icon: string; defaultTitle: string; color?: string }>();

  // 1. Add base trades
  for (const bt of BASE_TRADES) {
    map.set(bt.id.toLowerCase().trim(), {
      id: bt.id,
      label: bt.label,
      icon: bt.icon,
      defaultTitle: bt.defaultTitle,
      color: bt.color,
    });
  }

  // 2. Add custom trades from config
  for (const ct of customTrades) {
    if (!ct || !ct.id) continue;
    const key = ct.id.toLowerCase().trim();
    if (map.has(key)) {
      const existing = map.get(key)!;
      map.set(key, {
        ...existing,
        label: ct.label || existing.label,
        icon: ct.icon || existing.icon,
        color: ct.color || existing.color,
      });
    } else {
      map.set(key, {
        id: ct.id,
        label: ct.label || ct.id,
        icon: ct.icon || '🛠️',
        defaultTitle: ct.label || ct.id,
        color: ct.color || 'bg-purple-100 text-purple-700',
      });
    }
  }

  // 3. Add any existing trade from worker profiles (to never lose legacy/dynamic ones)
  for (const w of extraWorkers) {
    if (!w || !w.trade) continue;
    const raw = String(w.trade).trim();
    const key = raw.toLowerCase();
    if (!map.has(key)) {
      const formatted = raw
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      map.set(key, {
        id: raw,
        label: formatted,
        icon: '🛠️',
        defaultTitle: w.tradeTitle || formatted,
        color: 'bg-slate-100 text-slate-800',
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Returns formatted label with icon for a trade id.
 */
export function getTradeDisplayInfo(
  tradeId: string,
  customTrades: CustomTradeOption[] = []
): { label: string; icon: string; full: string } {
  if (!tradeId) {
    return { label: 'Sin rubro', icon: '🛠️', full: '🛠️ Sin rubro' };
  }
  const all = getAllTradeOptions(customTrades);
  const found = all.find((t) => t.id.toLowerCase() === tradeId.toLowerCase().trim());
  if (found) {
    return {
      label: found.label,
      icon: found.icon,
      full: `${found.icon} ${found.label}`,
    };
  }
  const fallbackLabel = tradeId
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    label: fallbackLabel,
    icon: '🛠️',
    full: `🛠️ ${fallbackLabel}`,
  };
}

/**
 * Normalizes a new trade name into a valid, safe ID slug
 */
export function slugifyTradeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
