/**
 * Zone Normalization and Deduplication Utilities for ServiGo
 */

/**
 * Master list of Argentine Localities and Cities for clean non-editable selection dropdowns.
 */
export const ARGENTINA_LOCALITIES: string[] = [
  // Provincia de Córdoba / Región
  'Alejandro Roca',
  'Río Cuarto',
  'La Carlota',
  'General Deheza',
  'General Cabrera',
  'Ucacha',
  'Los Cisnes',
  'Reducción',
  'Pascanas',
  'Bell Ville',
  'Villa María',
  'Córdoba Capital',
  'Villa Carlos Paz',
  'Río Tercero',
  'Alta Gracia',
  'Jesús María',
  'Laboulaye',
  'Huinca Renancó',
  'Canals',
  'Adelia María',
  'Sampacho',
  'Zona Rural',

  // Buenos Aires Norte / AMBA / GBA / CABA
  'San Isidro',
  'Martínez',
  'Acassuso',
  'Olivos',
  'Florida',
  'Vicente López',
  'Tigre',
  'San Fernando',
  'Boulogne',
  'Don Torcuato',
  'Nordelta',
  'General Pacheco',
  'Pilar',
  'Escobar',
  'San Martín',
  'San Miguel',
  'Morón',
  'Castelar',
  'Ramos Mejía',
  'Lanús',
  'Quilmes',
  'Lomas de Zamora',
  'Avellaneda',
  'La Plata',
  'CABA - Belgrano',
  'CABA - Palermo',
  'CABA - Recoleta',
  'CABA - Caballito',
  'CABA - Núñez',
  'CABA - Saavedra',
  'CABA - Flores',
  'CABA - Centro / Microcentro',
  'CABA - Villa Urquiza',

  // Principales Ciudades de Argentina
  'Bahía Blanca',
  'Mar del Plata',
  'Tandil',
  'Pergamino',
  'Junín',
  'Olavarría',
  'Azul',
  'Necochea',
  'Campana',
  'Zárate',
  'Rosario',
  'Santa Fe Capital',
  'Rafaela',
  'Venado Tuerto',
  'Reconquista',
  'Mendoza Capital',
  'San Rafael',
  'Godoy Cruz',
  'Guaymallén',
  'Luján de Cuyo',
  'San Miguel de Tucumán',
  'Yerba Buena',
  'Tafí Viejo',
  'Salta Capital',
  'San Ramón de la Nueva Orán',
  'Paraná',
  'Concordia',
  'Gualeguaychú',
  'Posadas',
  'Puerto Iguazú',
  'Oberá',
  'Corrientes Capital',
  'Goya',
  'Resistencia',
  'Presidencia Roque Sáenz Peña',
  'San Juan Capital',
  'Rawson',
  'San Salvador de Jujuy',
  'San Carlos de Bariloche',
  'General Roca',
  'Cipolletti',
  'Viedma',
  'Neuquén Capital',
  'San Martín de los Andes',
  'Plottier',
  'Comodoro Rivadavia',
  'Trelew',
  'Puerto Madryn',
  'Esquel',
  'San Luis Capital',
  'Villa Mercedes',
  'Merlo',
  'Santiago del Estero Capital',
  'La Banda',
  'San Fernando del Valle de Catamarca',
  'La Rioja Capital',
  'Chilecito',
  'Santa Rosa',
  'General Pico',
  'Río Gallegos',
  'Caleta Olivia',
  'El Calafate',
  'Ushuaia',
  'Río Grande'
];

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

/**
 * Merges the master ARGENTINA_LOCALITIES with any dynamic zones provided
 * and returns a deduplicated, formatted array of options.
 */
export function getMergedLocalities(additionalZones: string[] = []): string[] {
  return extractUniqueZones([...ARGENTINA_LOCALITIES, ...additionalZones]);
}
