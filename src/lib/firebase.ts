import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Worker, BookingRequest, Review, PromotedBanner, TabVisibilityConfig, AppConfig } from '../types';
import { INITIAL_WORKERS } from '../data/mockData';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App lazily/safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore specifying custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const WORKERS_COLLECTION = 'workers';
const BOOKINGS_COLLECTION = 'bookings';
const BANNERS_COLLECTION = 'banners';
const APP_CONFIG_COLLECTION = 'app_config';

export const DEFAULT_TAB_CONFIG: TabVisibilityConfig = {
  search: true,
  register: true,
  sponsor: true,
  ai: true,
  bookings: true,
};

export const INITIAL_BANNERS: PromotedBanner[] = [
  {
    id: 'banner-1',
    title: '🔥 Roberto Gómez - Gasista Matriculado Metrogas (24hs)',
    subtitle: 'Suscripción VIP • Reparación de fugas, instalaciones y termotanques. 15% OFF en mano de obra con Ferretería Bruzzone.',
    badgeText: 'DESTACADO VIP',
    badgeColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200',
    linkUrl: 'https://wa.me/5491133334444?text=Hola%20Roberto,%20vi%20tu%20anuncio%20destacado%20en%20ServiGo',
    buttonText: 'Contactar por WhatsApp',
    active: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    advertiserName: 'Roberto Gómez (Gasista)',
    advertiserPhone: '5491133334444',
    paymentStatus: 'paid',
    subscriptionPlan: 'vip',
    pricePaid: 15000,
    expirationDate: '2026-09-30',
  },
  {
    id: 'banner-2',
    title: '⚡ Mantenimiento Eléctrico Residencial e Industrial',
    subtitle: 'Suscripción PRO • Instalaciones, planos T1/T2, tableros y detección de cortocircuitos en Zona Norte y CABA.',
    badgeText: 'SUSCRIPCIÓN PRO',
    badgeColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    linkUrl: 'https://wa.me/5491144445555?text=Hola,%20quisiera%20pedir%20presupuesto%20para%20instalacion%20electrica',
    buttonText: 'Pedir Presupuesto',
    active: true,
    priority: 2,
    createdAt: new Date().toISOString(),
    advertiserName: 'Esteban Martínez (Electricista)',
    advertiserPhone: '5491144445555',
    paymentStatus: 'paid',
    subscriptionPlan: 'mensual',
    pricePaid: 8500,
    expirationDate: '2026-08-31',
  },
  {
    id: 'banner-3',
    title: '🛒 10% de Descuento en Ferretería Bruzzone para Socios',
    subtitle: 'Publicidad Patrocinada • Compra cañerías, repuestos y cables aprobados directamente en la tienda oficial.',
    badgeText: 'PROMO EXCLUSIVA',
    badgeColor: 'orange',
    imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=1200',
    linkUrl: 'https://ferreteriabruzzone.com.ar/tienda',
    buttonText: 'Ver Tienda Online',
    active: true,
    priority: 3,
    createdAt: new Date().toISOString(),
    advertiserName: 'Ferretería Bruzzone (Sponsor Oficial)',
    advertiserPhone: '5491122223333',
    paymentStatus: 'paid',
    subscriptionPlan: 'anual',
    pricePaid: 50000,
    expirationDate: '2027-01-01',
  },
];


/**
 * Seed initial workers if collection is empty (only if first time initialization)
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  try {
    const configDocRef = doc(db, APP_CONFIG_COLLECTION, 'settings');
    const docSnap = await getDoc(configDocRef);
    if (!docSnap.exists()) {
      console.log('First time setup: Initializing Firestore with default demo data...');
      await resetFirestoreToDefaults();
    }
  } catch (error) {
    console.error('Error checking database initialization:', error);
  }
}

/**
 * Subscribe to real-time updates for workers
 */
export function subscribeWorkers(onData: (workers: Worker[]) => void): () => void {
  const workersRef = collection(db, WORKERS_COLLECTION);

  // Check and seed if database has never been initialized
  ensureDatabaseInitialized();

  const unsubscribe = onSnapshot(
    workersRef,
    (snapshot) => {
      const workersList: Worker[] = snapshot.docs.map((docSnap) => docSnap.data() as Worker);
      onData(workersList);
    },
    (error) => {
      console.error('Firestore workers snapshot listener error:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Recursively removes `undefined` values from an object or array so Firestore SDK doesn't throw invalid data errors.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as unknown as T;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as unknown as T;
  }
  return obj;
}

/**
 * Save or update a worker in Firestore
 */
export async function saveWorkerToFirestore(worker: Worker): Promise<void> {
  try {
    const cleanWorker = sanitizeForFirestore(worker);
    const workerRef = doc(db, WORKERS_COLLECTION, cleanWorker.id);
    await setDoc(workerRef, cleanWorker, { merge: true });
  } catch (error) {
    console.error('Error saving worker to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a worker from Firestore
 */
export async function deleteWorkerFromFirestore(workerId: string): Promise<void> {
  try {
    const workerRef = doc(db, WORKERS_COLLECTION, workerId);
    await deleteDoc(workerRef);
  } catch (error) {
    console.error('Error deleting worker from Firestore:', error);
    throw error;
  }
}

/**
 * Save a review for a worker and update worker's average rating in Firestore
 */
export async function saveReviewToFirestore(
  workerId: string,
  newReview: Review,
  currentWorker: Worker
): Promise<void> {
  try {
    const updatedReviews = [newReview, ...currentWorker.reviews];
    const totalRatingSum = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const newAvg = Number((totalRatingSum / updatedReviews.length).toFixed(1));

    const updatedWorker: Worker = {
      ...currentWorker,
      reviews: updatedReviews,
      reviewCount: updatedReviews.length,
      rating: newAvg,
    };

    await saveWorkerToFirestore(updatedWorker);
  } catch (error) {
    console.error('Error saving review to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for booking requests
 */
export function subscribeBookings(onData: (bookings: BookingRequest[]) => void): () => void {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const q = query(bookingsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const bookingsList: BookingRequest[] = snapshot.docs.map((docSnap) => docSnap.data() as BookingRequest);
      onData(bookingsList);
    },
    (error) => {
      // Fallback query without orderBy if index is building or error
      onSnapshot(bookingsRef, (fallbackSnapshot) => {
        const bookingsList: BookingRequest[] = fallbackSnapshot.docs.map(
          (docSnap) => docSnap.data() as BookingRequest
        );
        onData(bookingsList);
      });
    }
  );

  return unsubscribe;
}

/**
 * Save a booking request to Firestore
 */
export async function saveBookingToFirestore(booking: BookingRequest): Promise<void> {
  try {
    const cleanBooking = sanitizeForFirestore(booking);
    const bookingRef = doc(db, BOOKINGS_COLLECTION, cleanBooking.id);
    await setDoc(bookingRef, cleanBooking, { merge: true });
  } catch (error) {
    console.error('Error saving booking to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for Banners
 */
export function subscribeBanners(onData: (banners: PromotedBanner[]) => void): () => void {
  const bannersRef = collection(db, BANNERS_COLLECTION);

  const unsubscribe = onSnapshot(
    bannersRef,
    (snapshot) => {
      const bannersList = snapshot.docs.map((docSnap) => docSnap.data() as PromotedBanner);
      // sort by priority
      bannersList.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      onData(bannersList);
    },
    (error) => {
      console.error('Error in banners listener:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Save or update banner in Firestore
 */
export async function saveBannerToFirestore(banner: PromotedBanner): Promise<void> {
  try {
    const cleanBanner = sanitizeForFirestore(banner);
    const bannerRef = doc(db, BANNERS_COLLECTION, cleanBanner.id);
    await setDoc(bannerRef, cleanBanner, { merge: true });
  } catch (error) {
    console.error('Error saving banner to Firestore:', error);
    throw error;
  }
}

/**
 * Delete banner from Firestore
 */
export async function deleteBannerFromFirestore(bannerId: string): Promise<void> {
  try {
    const bannerRef = doc(db, BANNERS_COLLECTION, bannerId);
    await deleteDoc(bannerRef);
  } catch (error) {
    console.error('Error deleting banner from Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to App Configuration (Tab visibility)
 */
export function subscribeAppConfig(onData: (config: AppConfig) => void): () => void {
  const configDocRef = doc(db, APP_CONFIG_COLLECTION, 'settings');

  const unsubscribe = onSnapshot(
    configDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as AppConfig);
      } else {
        const defaultConfig: AppConfig = {
          id: 'settings',
          tabs: DEFAULT_TAB_CONFIG,
          updatedAt: new Date().toISOString(),
        };
        setDoc(configDocRef, sanitizeForFirestore(defaultConfig));
        onData(defaultConfig);
      }
    },
    (error) => {
      console.error('Error fetching app config from Firestore:', error);
      onData({
        id: 'settings',
        tabs: DEFAULT_TAB_CONFIG,
        updatedAt: new Date().toISOString(),
      });
    }
  );

  return unsubscribe;
}

/**
 * Save App Config to Firestore
 */
export async function saveAppConfigToFirestore(config: AppConfig): Promise<void> {
  try {
    const cleanConfig = sanitizeForFirestore(config);
    const configDocRef = doc(db, APP_CONFIG_COLLECTION, 'settings');
    await setDoc(configDocRef, cleanConfig, { merge: true });
  } catch (error) {
    console.error('Error saving app config to Firestore:', error);
    throw error;
  }
}

/**
 * Delete ALL documents in a given collection
 */
async function clearCollection(collectionName: string): Promise<void> {
  const snapshot = await getDocs(collection(db, collectionName));
  const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, collectionName, docSnap.id)));
  await Promise.all(deletePromises);
}

/**
 * Completely wipe ALL data from Firestore (Workers, Bookings, Banners, and Reset App Config)
 */
export async function clearAllFirestoreData(): Promise<void> {
  try {
    await clearCollection(WORKERS_COLLECTION);
    await clearCollection(BOOKINGS_COLLECTION);
    await clearCollection(BANNERS_COLLECTION);

    // Reset app config
    const configDocRef = doc(db, APP_CONFIG_COLLECTION, 'settings');
    await setDoc(configDocRef, sanitizeForFirestore({
      id: 'settings',
      tabs: DEFAULT_TAB_CONFIG,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error clearing all Firestore data:', error);
    throw error;
  }
}

/**
 * Reset data to factory defaults (Reload initial mock workers, initial banners, clear bookings)
 */
export async function resetFirestoreToDefaults(): Promise<void> {
  try {
    await clearCollection(WORKERS_COLLECTION);
    await clearCollection(BOOKINGS_COLLECTION);
    await clearCollection(BANNERS_COLLECTION);

    // Seed workers
    const workerPromises = INITIAL_WORKERS.map((w) => setDoc(doc(db, WORKERS_COLLECTION, w.id), sanitizeForFirestore(w)));
    await Promise.all(workerPromises);

    // Seed banners
    const bannerPromises = INITIAL_BANNERS.map((b) => setDoc(doc(db, BANNERS_COLLECTION, b.id), sanitizeForFirestore(b)));
    await Promise.all(bannerPromises);

    // Reset config
    const configDocRef = doc(db, APP_CONFIG_COLLECTION, 'settings');
    await setDoc(configDocRef, sanitizeForFirestore({
      id: 'settings',
      tabs: DEFAULT_TAB_CONFIG,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error resetting Firestore to defaults:', error);
    throw error;
  }
}

