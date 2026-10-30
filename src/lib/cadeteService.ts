/**
 * ============================================================================
 * SERVIGO CADETES SERVICE - MÓDULO DE CADETERÍA & MENSAJERÍA URBANA
 * ============================================================================
 * Manejo en tiempo real de:
 * 1. Colección 'cadetes': Registro de cadetes con su vehículo y disponibilidad en vivo.
 * 2. Colección 'cadete_requests': Notificaciones y solicitudes de envíos enviadas por clientes y comercios.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, sanitizeForFirestore } from './firebase';
import { Cadete, CadeteRequest, CadeteRequestStatus } from '../types';
import { INITIAL_CADETES } from '../data/mockCadetes';

export const CADETES_COLLECTION = 'cadetes';
export const CADETE_REQUESTS_COLLECTION = 'cadete_requests';

const CADETES_LOCAL_STORAGE_KEY = 'servigo_cadetes_cache_v1';
const CADETE_SESSION_KEY = 'servigo_cadete_logged_session';

/**
 * Suscribe a todos los cadetes en tiempo real desde Firestore.
 * Si Firestore está vacío, inicializa con los cadetes por defecto.
 */
export function subscribeCadetes(callback: (cadetes: Cadete[]) => void): () => void {
  try {
    const cadetesColRef = collection(db, CADETES_COLLECTION);

    const unsubscribe = onSnapshot(
      cadetesColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedCadetes: Cadete[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
            } as Cadete;
          });

          // Cache in localStorage
          try {
            localStorage.setItem(CADETES_LOCAL_STORAGE_KEY, JSON.stringify(loadedCadetes));
          } catch (e) {
            console.warn('LocalStorage cache write error:', e);
          }

          callback(loadedCadetes);
        } else {
          // Si está vacío en Firestore, sembramos los iniciales
          seedInitialCadetes().then(() => {
            callback(INITIAL_CADETES);
          });
        }
      },
      (error) => {
        console.warn('Firestore cadetes subscription fallback to localStorage:', error);
        const cached = localStorage.getItem(CADETES_LOCAL_STORAGE_KEY);
        if (cached) {
          try {
            callback(JSON.parse(cached));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        callback(INITIAL_CADETES);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Error starting subscribeCadetes:', err);
    callback(INITIAL_CADETES);
    return () => {};
  }
}

/**
 * Siembra los cadetes iniciales en Firestore si la colección no existe
 */
async function seedInitialCadetes(): Promise<void> {
  try {
    for (const cadete of INITIAL_CADETES) {
      const docRef = doc(db, CADETES_COLLECTION, cadete.id);
      await setDoc(docRef, sanitizeForFirestore(cadete));
    }
  } catch (err) {
    console.warn('Could not seed initial cadetes to Firestore:', err);
  }
}

/**
 * Guarda o actualiza un cadete en Firestore
 */
export async function saveCadete(cadete: Cadete): Promise<void> {
  try {
    const docRef = doc(db, CADETES_COLLECTION, cadete.id);
    const payload = sanitizeForFirestore({
      ...cadete,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.error('Error saving cadete to Firestore:', error);
    throw error;
  }
}

/**
 * Actualiza la disponibilidad en tiempo real de un cadete (Disponible vs Fuera de Turno)
 */
export async function updateCadeteAvailability(cadeteId: string, isAvailable: boolean): Promise<void> {
  try {
    const docRef = doc(db, CADETES_COLLECTION, cadeteId);
    await updateDoc(docRef, {
      isAvailable,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating cadete availability:', error);
    throw error;
  }
}

/**
 * Elimina un cadete de Firestore
 */
export async function deleteCadete(cadeteId: string): Promise<void> {
  try {
    const docRef = doc(db, CADETES_COLLECTION, cadeteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting cadete:', error);
    throw error;
  }
}

/**
 * Suscribe a las solicitudes y notificaciones dirigidas a un cadete específico en tiempo real
 */
export function subscribeCadeteRequests(
  cadeteId: string,
  callback: (requests: CadeteRequest[]) => void
): () => void {
  try {
    const requestsColRef = collection(db, CADETE_REQUESTS_COLLECTION);
    const q = query(requestsColRef, where('cadeteId', '==', cadeteId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: CadeteRequest[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CadeteRequest[];

        // Ordenar por fecha descendente
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(loaded);
      },
      (error) => {
        console.warn('Error subscribing to cadete requests:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Error starting subscribeCadeteRequests:', err);
    callback([]);
    return () => {};
  }
}

/**
 * Crea una nueva solicitud para un cadete (envío con ubicación GPS)
 */
export async function createCadeteRequest(requestData: Omit<CadeteRequest, 'id' | 'createdAt'>): Promise<string> {
  try {
    const newId = `req-cadete-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, CADETE_REQUESTS_COLLECTION, newId);
    const fullRequest: CadeteRequest = {
      id: newId,
      ...requestData,
      createdAt: new Date().toISOString(),
    };

    await setDoc(docRef, sanitizeForFirestore(fullRequest));
    return newId;
  } catch (error) {
    console.error('Error creating cadete request:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una solicitud recibida por el cadete
 */
export async function updateCadeteRequestStatus(
  requestId: string,
  status: CadeteRequestStatus
): Promise<void> {
  try {
    const docRef = doc(db, CADETE_REQUESTS_COLLECTION, requestId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating cadete request status:', error);
    throw error;
  }
}

/**
 * Helpers de sesión para el panel de cadete
 */
export function getSavedCadeteSession(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CADETE_SESSION_KEY);
}

export function setSavedCadeteSession(cadeteId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CADETE_SESSION_KEY, cadeteId);
}

export function clearSavedCadeteSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CADETE_SESSION_KEY);
}
