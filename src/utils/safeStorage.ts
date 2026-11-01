/**
 * Guarda en localStorage sin romper la app si el celular se queda sin espacio
 * (iPhone/Safari tiene ~5 MB). Si no entra, simplemente no se guarda la copia local:
 * los datos reales están en la nube.
 */
export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* nada */
    }
    console.warn(`No se pudo guardar "${key}" en el celular (espacio lleno).`, err);
  }
}
