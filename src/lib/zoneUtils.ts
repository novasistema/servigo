/**
 * Zone Normalization and Deduplication Utilities for ServiGo
 */

/**
 * Normalizes zone string for accent-insensitive, case-insensitive comparison & deduplication.
 */
export function normalizeZoneKey(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Formats zone string nicely into proper Title Case and standardizes common variations.
 */
export function formatZoneName(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  const key = normalizeZoneKey(trimmed);

  // Standardize common regional names & abbreviations
  if (key === 'rio iv' || key === 'rio 4' || key === 'rio cuarto' || key === 'río 4') {
    return 'Río Cuarto';
  }
  if (key === 'alejandro roca') return 'Alejandro Roca';
  if (key === 'la carlota') return 'La Carlota';
  if (key === 'los cisnes') return 'Los Cisnes';
  if (key === 'reduccion') return 'Reducción';
  if (key === 'zona rural') return 'Zona Rural';

  // Capitalize each word properly
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Given an array of raw zone strings, returns a deduplicated, beautifully formatted
 * array of zones sorted alphabetically.
 */
export function extractUniqueZones(rawZones: string[]): string[] {
  const map = new Map<string, string>(); // key -> formatted name

  rawZones.forEach((raw) => {
    if (!raw || !raw.trim()) return;
    const key = normalizeZoneKey(raw);
    if (!key) return;

    const formatted = formatZoneName(raw);

    if (!map.has(key)) {
      map.set(key, formatted);
    } else {
      const current = map.get(key)!;
      // Prefer version with proper accents or capital letters over plain lowercase
      if (current !== formatted && raw.match(/[ÁÉÍÓÚáéíóúÑñA-Z]/)) {
        map.set(key, formatted);
      }
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );
}
