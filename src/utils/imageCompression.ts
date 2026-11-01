/**
 * Compresión de fotos que sube la gente (desde el celular o la PC).
 *
 * Objetivo: que ocupen lo menos posible y se sigan reconociendo.
 * Cada tipo de foto tiene un tamaño máximo en píxeles y un peso máximo:
 * si la foto todavía pesa más, se baja la calidad y luego el tamaño
 * hasta que entre. Si el navegador sabe generar WebP (más liviano) se usa;
 * si no (algunos iPhone), JPEG.
 */

export type PhotoPreset = 'producto' | 'plato' | 'perfil' | 'acta' | 'banner';

const PRESETS: Record<PhotoPreset, { maxSide: number; maxBytes: number }> = {
  producto: { maxSide: 640, maxBytes: 70_000 }, // fotos de alquileres
  plato: { maxSide: 480, maxBytes: 45_000 }, // menú de los locales
  perfil: { maxSide: 320, maxBytes: 25_000 }, // foto de trabajador / cadete
  acta: { maxSide: 720, maxBytes: 90_000 }, // evidencia de entrega/devolución
  banner: { maxSide: 900, maxBytes: 110_000 }, // banners del creador
};

/** Peso aproximado en bytes de un data URL base64 */
export const dataUrlBytes = (dataUrl: string) => Math.round(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al procesar la imagen cargada.'));
    };
    img.src = url;
  });
}

function encode(img: CanvasImageSource, srcW: number, srcH: number, side: number, quality: number): string {
  const scale = Math.min(1, side / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen.');
  ctx.fillStyle = '#ffffff'; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/jpeg', quality);
}

/** Comprime una foto según su uso. Devuelve un data URL liviano. */
export async function compressPhoto(file: File, preset: PhotoPreset): Promise<string> {
  const { maxSide, maxBytes } = PRESETS[preset];
  const img = await loadImage(file);
  return compressSource(img, img.naturalWidth || img.width, img.naturalHeight || img.height, maxSide, maxBytes);
}

/** Igual que compressPhoto pero para algo ya dibujado (por ejemplo, la cámara). */
export function compressCanvasSource(
  src: CanvasImageSource,
  width: number,
  height: number,
  preset: PhotoPreset
): string {
  const { maxSide, maxBytes } = PRESETS[preset];
  return compressSource(src, width, height, maxSide, maxBytes);
}

function compressSource(src: CanvasImageSource, w: number, h: number, maxSide: number, maxBytes: number): string {
  let side = maxSide;
  let best = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    for (const q of [0.6, 0.5, 0.4, 0.32]) {
      best = encode(src, w, h, side, q);
      if (dataUrlBytes(best) <= maxBytes) return best;
    }
    side = Math.round(side * 0.8); // si no entra, más chica
  }
  return best;
}

/**
 * Compatibilidad con llamadas anteriores: el tamaño pedido se usa como límite,
 * pero el peso queda acotado como una foto de producto.
 */
export function compressImageFile(file: File, maxDimension = 640, _quality = 0.6): Promise<string> {
  return loadImage(file).then((img) =>
    compressSource(img, img.naturalWidth || img.width, img.naturalHeight || img.height, Math.min(maxDimension, 900), 110_000)
  );
}
