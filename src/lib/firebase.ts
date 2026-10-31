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
  where,
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { Worker, BookingRequest, Review, PromotedBanner, TabVisibilityConfig, AppConfig, Shop, RemisDriver, RideRequest, SystemCoupon, IssuedVoucher, JobProfile, RentalItem, RentalBooking, RentalOwner, RentalPayoutRequest } from '../types';
import { INITIAL_WORKERS, INITIAL_SHOPS, INITIAL_REMISES } from '../data/mockData';
import { INITIAL_JOB_PROFILES } from '../data/mockJobProfiles';
import { INITIAL_RENTAL_ITEMS } from '../data/mockRentals';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App lazily/safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore specifying custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
};

const WORKERS_COLLECTION = 'workers';
const BOOKINGS_COLLECTION = 'bookings';
const BANNERS_COLLECTION = 'banners';
const APP_CONFIG_COLLECTION = 'app_config';
const SHOPS_COLLECTION = 'shops';
const REMISES_COLLECTION = 'remises';
const RIDE_REQUESTS_COLLECTION = 'ride_requests';
const COUPONS_COLLECTION = 'coupons';
const VOUCHERS_COLLECTION = 'issued_vouchers';
const JOB_PROFILES_COLLECTION = 'job_profiles';
const RENTALS_COLLECTION = 'rental_items';
const RENTAL_BOOKINGS_COLLECTION = 'rental_bookings';
const RENTAL_OWNERS_COLLECTION = 'rental_owners';
const RENTAL_PAYOUTS_COLLECTION = 'rental_payouts';

export const DEFAULT_TAB_CONFIG: TabVisibilityConfig = {
  search: true,
  shops: true,
  jobs: true,
  delivery: true,
  cadetes: true,
  remises: true,
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
  let unsubFirestore: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (unsubFirestore) {
      unsubFirestore();
      unsubFirestore = null;
    }

    if (!user) {
      onData([]);
      return;
    }

    const isAdmin = user.email?.toLowerCase() === 'ajnovasistemas@gmail.com';
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = isAdmin
      ? query(bookingsRef, orderBy('createdAt', 'desc'))
      : query(bookingsRef, where('clientUid', '==', user.uid));

    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const bookingsList: BookingRequest[] = snapshot.docs.map((docSnap) => docSnap.data() as BookingRequest);
        onData(bookingsList);
      },
      (error) => {
        // Quietly fallback or reset without noisy console errors
        onData([]);
      }
    );
  });

  return () => {
    unsubAuth();
    if (unsubFirestore) unsubFirestore();
  };
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
 * Subscribe to real-time updates for Shops & Businesses
 */
export function subscribeShops(onData: (shops: Shop[]) => void): () => void {
  const shopsRef = collection(db, SHOPS_COLLECTION);

  // Check and seed if database has never been initialized
  ensureDatabaseInitialized();

  const unsubscribe = onSnapshot(
    shopsRef,
    (snapshot) => {
      const shopsList = snapshot.docs.map((docSnap) => docSnap.data() as Shop);
      shopsList.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      onData(shopsList);
    },
    (error) => {
      console.error('Error in shops listener:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Save or update shop in Firestore
 */
export async function saveShopToFirestore(shop: Shop): Promise<void> {
  try {
    const cleanShop = sanitizeForFirestore(shop);
    const shopRef = doc(db, SHOPS_COLLECTION, cleanShop.id);
    await setDoc(shopRef, cleanShop, { merge: true });
  } catch (error) {
    console.error('Error saving shop to Firestore:', error);
    throw error;
  }
}

/**
 * Delete shop from Firestore
 */
export async function deleteShopFromFirestore(shopId: string): Promise<void> {
  try {
    const shopRef = doc(db, SHOPS_COLLECTION, shopId);
    await deleteDoc(shopRef);
  } catch (error) {
    console.error('Error deleting shop from Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to Remises drivers
 */
export function subscribeRemises(onData: (remises: RemisDriver[]) => void): () => void {
  const remisesRef = collection(db, REMISES_COLLECTION);
  ensureDatabaseInitialized();

  const unsubscribe = onSnapshot(
    remisesRef,
    (snapshot) => {
      const remisesList: RemisDriver[] = snapshot.docs.map((doc) => doc.data() as RemisDriver);
      onData(remisesList);
    },
    (error) => {
      console.error('Error in remises listener:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Save or update Remis driver in Firestore
 */
export async function saveRemisToFirestore(remis: RemisDriver): Promise<void> {
  try {
    const cleanRemis = sanitizeForFirestore(remis);
    const remisRef = doc(db, REMISES_COLLECTION, cleanRemis.id);
    await setDoc(remisRef, cleanRemis, { merge: true });
  } catch (error) {
    console.error('Error saving remis driver to Firestore:', error);
    throw error;
  }
}

/**
 * Update Remis status (disponible, en_viaje, fuera_de_servicio)
 */
export async function updateRemisStatus(remisId: string, status: 'disponible' | 'en_viaje' | 'fuera_de_servicio'): Promise<void> {
  try {
    const remisRef = doc(db, REMISES_COLLECTION, remisId);
    await updateDoc(remisRef, { status });
  } catch (error) {
    console.error('Error updating remis status:', error);
    throw error;
  }
}

/**
 * Delete Remis driver from Firestore
 */
export async function deleteRemisFromFirestore(remisId: string): Promise<void> {
  try {
    const remisRef = doc(db, REMISES_COLLECTION, remisId);
    await deleteDoc(remisRef);
  } catch (error) {
    console.error('Error deleting remis driver:', error);
    throw error;
  }
}

/**
 * Subscribe to Ride Requests
 */
export function subscribeRideRequests(onData: (requests: RideRequest[]) => void): () => void {
  const requestsRef = collection(db, RIDE_REQUESTS_COLLECTION);

  const unsubscribe = onSnapshot(
    requestsRef,
    (snapshot) => {
      const list: RideRequest[] = snapshot.docs.map((doc) => doc.data() as RideRequest);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      console.error('Error in ride requests listener:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Save or update Ride Request
 */
export async function saveRideRequestToFirestore(request: RideRequest): Promise<void> {
  try {
    const cleanRequest = sanitizeForFirestore(request);
    const ref = doc(db, RIDE_REQUESTS_COLLECTION, cleanRequest.id);
    await setDoc(ref, cleanRequest, { merge: true });
  } catch (error) {
    console.error('Error saving ride request:', error);
    throw error;
  }
}

/**
 * Update Ride Request Status
 */
export async function updateRideRequestStatus(requestId: string, status: RideRequest['status']): Promise<void> {
  try {
    const ref = doc(db, RIDE_REQUESTS_COLLECTION, requestId);
    await updateDoc(ref, { status });
  } catch (error) {
    console.error('Error updating ride request status:', error);
    throw error;
  }
}

/**
 * Delete Ride Request from Firestore
 */
export async function deleteRideRequestFromFirestore(requestId: string): Promise<void> {
  try {
    const ref = doc(db, RIDE_REQUESTS_COLLECTION, requestId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting ride request:', error);
    throw error;
  }
}

/**
 * Initial Administrator-Created Discount Coupons
 */
export const INITIAL_COUPONS: SystemCoupon[] = [
  {
    id: 'coupon-bruzzone-15',
    codePrefix: 'BRUZZONE15',
    title: '15% OFF en Ferretería Bruzzone',
    discountType: 'percentage',
    discountValue: 15,
    targetType: 'ferreteria_bruzzone',
    targetShopName: 'Ferretería Bruzzone (Sponsor Oficial)',
    minSpend: 0,
    description: 'Beneficio exclusivo por contratar profesionales verificados en ServiGo. Válido en cañerías, herramientas, electricidad y pinturas.',
    termsAndConditions: 'Presentar el voucher emitido por tu profesional ServiGo en caja al abonar tu compra en Ferretería Bruzzone.',
    active: true,
    validDays: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coupon-comercios-10',
    codePrefix: 'RED10',
    title: '10% OFF en Comercios Adheridos',
    discountType: 'percentage',
    discountValue: 10,
    targetType: 'all_shops',
    targetShopName: 'Comercios y Talleres Adheridos',
    minSpend: 15000,
    description: 'Descuento especial en corralones, talleres, buloneras y comercios adheridos a la red comercial local.',
    termsAndConditions: 'Válido para compras superiores a $15.000 en comercios participantes de la red ServiGo.',
    active: true,
    validDays: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coupon-materiales-5000',
    codePrefix: 'OBRA5000',
    title: '$5.000 de Descuento en Corralón & Obras',
    discountType: 'fixed',
    discountValue: 5000,
    targetType: 'all_shops',
    targetShopName: 'Corralones y Materiales de Construcción',
    minSpend: 35000,
    description: 'Ahorro directo de $5.000 en compras de materiales gruesos, cemento, áridos o sanitarios.',
    termsAndConditions: 'Válido en compras mínimas de $35.000 presentando el cupón oficial entregado por tu albañil, plomero o gasista.',
    active: true,
    validDays: 45,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Subscribe to Coupons created by administrator
 */
export function subscribeCoupons(onData: (coupons: SystemCoupon[]) => void): () => void {
  const couponsQuery = query(collection(db, COUPONS_COLLECTION));

  const unsubscribe = onSnapshot(
    couponsQuery,
    (snapshot) => {
      if (!snapshot.empty) {
        const coupons: SystemCoupon[] = [];
        snapshot.forEach((docSnap) => {
          coupons.push(docSnap.data() as SystemCoupon);
        });
        onData(coupons);
      } else {
        // Seed initial default coupons if collection is empty
        INITIAL_COUPONS.forEach((c) => {
          setDoc(doc(db, COUPONS_COLLECTION, c.id), sanitizeForFirestore(c));
        });
        onData(INITIAL_COUPONS);
      }
    },
    (error) => {
      console.error('Error fetching coupons from Firestore:', error);
      onData(INITIAL_COUPONS);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a Coupon in Firestore
 */
export async function saveCouponToFirestore(coupon: SystemCoupon): Promise<void> {
  try {
    const clean = sanitizeForFirestore(coupon);
    const ref = doc(db, COUPONS_COLLECTION, clean.id);
    await setDoc(ref, clean, { merge: true });
  } catch (error) {
    console.error('Error saving coupon to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a Coupon from Firestore
 */
export async function deleteCouponFromFirestore(couponId: string): Promise<void> {
  try {
    const ref = doc(db, COUPONS_COLLECTION, couponId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting coupon from Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to Issued Vouchers delivered by workers to clients
 */
export function subscribeIssuedVouchers(onData: (vouchers: IssuedVoucher[]) => void): () => void {
  const vouchersQuery = query(collection(db, VOUCHERS_COLLECTION));

  const unsubscribe = onSnapshot(
    vouchersQuery,
    (snapshot) => {
      const vouchers: IssuedVoucher[] = [];
      snapshot.forEach((docSnap) => {
        vouchers.push(docSnap.data() as IssuedVoucher);
      });
      // Sort newest first
      vouchers.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
      onData(vouchers);
    },
    (error) => {
      console.error('Error fetching issued vouchers:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Save an Issued Voucher delivered to a client
 */
export async function saveIssuedVoucherToFirestore(voucher: IssuedVoucher): Promise<void> {
  try {
    const clean = sanitizeForFirestore(voucher);
    const ref = doc(db, VOUCHERS_COLLECTION, clean.id);
    await setDoc(ref, clean, { merge: true });
  } catch (error) {
    console.error('Error saving issued voucher to Firestore:', error);
    throw error;
  }
}

/**
 * Redeem an issued voucher in a shop
 */
export async function redeemVoucherInFirestore(voucherCode: string, redeemedByShop: string): Promise<IssuedVoucher | null> {
  try {
    const snapshot = await getDocs(collection(db, VOUCHERS_COLLECTION));
    const targetDoc = snapshot.docs.find((d) => {
      const data = d.data() as IssuedVoucher;
      return data.voucherCode?.trim().toUpperCase() === voucherCode.trim().toUpperCase();
    });

    if (!targetDoc) return null;

    const voucher = targetDoc.data() as IssuedVoucher;
    if (voucher.status === 'redeemed') {
      return voucher; // already redeemed
    }

    const updatedVoucher: IssuedVoucher = {
      ...voucher,
      status: 'redeemed',
      redeemedAt: new Date().toISOString(),
      redeemedByShop,
    };

    await setDoc(doc(db, VOUCHERS_COLLECTION, updatedVoucher.id), sanitizeForFirestore(updatedVoucher), { merge: true });
    return updatedVoucher;
  } catch (error) {
    console.error('Error redeeming voucher in Firestore:', error);
    throw error;
  }
}

/**
 * ============================================================================
 * BOLSA DE TRABAJO & CURRICULUM VITAE (RRHH)
 * ============================================================================
 */

/**
 * Subscribe to real-time updates for job profiles / CVs
 */
export function subscribeJobProfiles(onData: (profiles: JobProfile[]) => void): () => void {
  const profilesRef = collection(db, JOB_PROFILES_COLLECTION);
  const q = query(profilesRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: JobProfile[] = snapshot.docs.map((docSnap) => docSnap.data() as JobProfile);
      onData(list);
    },
    (error) => {
      console.warn('Fallback query for job_profiles without orderBy:', error);
      onSnapshot(profilesRef, (fallbackSnapshot) => {
        const list: JobProfile[] = fallbackSnapshot.docs.map(
          (docSnap) => docSnap.data() as JobProfile
        );
        onData(list);
      });
    }
  );

  return unsubscribe;
}

/**
 * Save or update a Job Profile / CV in Firestore
 */
export async function saveJobProfileToFirestore(profile: JobProfile): Promise<void> {
  try {
    const cleanProfile = sanitizeForFirestore(profile);
    const profileRef = doc(db, JOB_PROFILES_COLLECTION, profile.id);
    await setDoc(profileRef, cleanProfile, { merge: true });
  } catch (error) {
    console.error('Error saving job profile to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a Job Profile / CV from Firestore
 */
export async function deleteJobProfileFromFirestore(profileId: string): Promise<void> {
  try {
    const profileRef = doc(db, JOB_PROFILES_COLLECTION, profileId);
    await deleteDoc(profileRef);
  } catch (error) {
    console.error('Error deleting job profile from Firestore:', error);
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
 * Subscribe to Rental Platform Fee Rate (app_config/rentals.platformFeeRate)
 */
export function subscribeRentalPlatformFee(onData: (feeRate: number) => void): () => void {
  const docRef = doc(db, APP_CONFIG_COLLECTION, 'rentals');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists() && typeof docSnap.data()?.platformFeeRate === 'number') {
        onData(docSnap.data().platformFeeRate);
      } else {
        onData(0.05); // Default initial rate 5%
      }
    },
    (err) => {
      console.warn('Error reading app_config/rentals, using default 0.05:', err);
      onData(0.05);
    }
  );
}

/**
 * Save Rental Platform Fee Rate to app_config/rentals
 */
export async function saveRentalPlatformFeeToFirestore(feeRate: number): Promise<void> {
  try {
    const docRef = doc(db, APP_CONFIG_COLLECTION, 'rentals');
    await setDoc(docRef, {
      platformFeeRate: feeRate,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving rental platformFeeRate:', error);
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
 * Subscribe to Rental Items in Realtime (ServiGo Alquiler de Productos - Givy style)
 */
export function subscribeRentalItems(onData: (items: RentalItem[]) => void): () => void {
  const itemsQuery = query(collection(db, RENTALS_COLLECTION));

  const unsubscribe = onSnapshot(
    itemsQuery,
    (snapshot) => {
      const items: RentalItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as RentalItem);
      });
      onData(items);
    },
    (error) => {
      console.error('Error fetching rental items from Firestore:', error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a Rental Item in Firestore
 */
export async function saveRentalItemToFirestore(item: RentalItem): Promise<void> {
  try {
    const clean = sanitizeForFirestore(item);
    const ref = doc(db, RENTALS_COLLECTION, clean.id);
    await setDoc(ref, clean, { merge: true });
  } catch (error) {
    console.error('Error saving rental item to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a Rental Item from Firestore
 */
export async function deleteRentalItemFromFirestore(itemId: string): Promise<void> {
  try {
    const ref = doc(db, RENTALS_COLLECTION, itemId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting rental item from Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to Rental Bookings in Realtime (Zero-Trust: Client or Owner or Admin)
 */
export function subscribeRentalBookings(onData: (bookings: RentalBooking[]) => void): () => void {
  let unsubFirestore1: (() => void) | null = null;
  let unsubFirestore2: (() => void) | null = null;
  let clientBookings: RentalBooking[] = [];
  let ownerBookings: RentalBooking[] = [];

  const mergeAndEmit = () => {
    const map = new Map<string, RentalBooking>();
    clientBookings.forEach((b) => map.set(b.id, b));
    ownerBookings.forEach((b) => map.set(b.id, b));
    onData(Array.from(map.values()));
  };

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (unsubFirestore1) { unsubFirestore1(); unsubFirestore1 = null; }
    if (unsubFirestore2) { unsubFirestore2(); unsubFirestore2 = null; }
    clientBookings = [];
    ownerBookings = [];

    if (!user) {
      onData([]);
      return;
    }

    const isAdmin = user.email?.toLowerCase() === 'ajnovasistemas@gmail.com';
    if (isAdmin) {
      unsubFirestore1 = onSnapshot(
        collection(db, RENTAL_BOOKINGS_COLLECTION),
        (snapshot) => {
          const bookings = snapshot.docs.map((docSnap) => docSnap.data() as RentalBooking);
          onData(bookings);
        },
        (error) => {
          onData([]);
        }
      );
    } else {
      // Query bookings where user is client
      const qClient = query(collection(db, RENTAL_BOOKINGS_COLLECTION), where('clientUid', '==', user.uid));
      unsubFirestore1 = onSnapshot(
        qClient,
        (snap) => {
          clientBookings = snap.docs.map((d) => d.data() as RentalBooking);
          mergeAndEmit();
        },
        () => {}
      );

      // Query bookings where user is owner
      const qOwner = query(collection(db, RENTAL_BOOKINGS_COLLECTION), where('ownerUid', '==', user.uid));
      unsubFirestore2 = onSnapshot(
        qOwner,
        (snap) => {
          ownerBookings = snap.docs.map((d) => d.data() as RentalBooking);
          mergeAndEmit();
        },
        () => {}
      );
    }
  });

  return () => {
    unsubAuth();
    if (unsubFirestore1) unsubFirestore1();
    if (unsubFirestore2) unsubFirestore2();
  };
}

/**
 * Save a Rental Booking to Firestore
 */
export async function saveRentalBookingToFirestore(booking: RentalBooking): Promise<void> {
  try {
    const clean = sanitizeForFirestore(booking);
    const ref = doc(db, RENTAL_BOOKINGS_COLLECTION, clean.id);
    await setDoc(ref, clean, { merge: true });
  } catch (error) {
    console.error('Error saving rental booking to Firestore:', error);
    throw error;
  }
}

/**
 * Update Rental Booking Statuses (Booking, Payment & Deposit Escrow)
 */
export async function updateRentalBookingStatus(
  bookingId: string,
  updates: Partial<RentalBooking>
): Promise<void> {
  try {
    const ref = doc(db, RENTAL_BOOKINGS_COLLECTION, bookingId);
    await updateDoc(ref, sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error updating rental booking in Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to Registered Rental Owners (Locadores) - Private to owner or admin
 */
export function subscribeRentalOwners(onData: (owners: RentalOwner[]) => void): () => void {
  let unsubFirestore: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (unsubFirestore) {
      unsubFirestore();
      unsubFirestore = null;
    }

    if (!user) {
      onData([]);
      return;
    }

    const isAdmin = user.email?.toLowerCase() === 'ajnovasistemas@gmail.com';
    if (isAdmin) {
      unsubFirestore = onSnapshot(
        collection(db, RENTAL_OWNERS_COLLECTION),
        (snapshot) => {
          const owners = snapshot.docs.map((docSnap) => docSnap.data() as RentalOwner);
          onData(owners);
        },
        () => {
          onData([]);
        }
      );
    } else {
      // Listen to current user's owner document
      unsubFirestore = onSnapshot(
        doc(db, RENTAL_OWNERS_COLLECTION, user.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            onData([docSnap.data() as RentalOwner]);
          } else {
            onData([]);
          }
        },
        () => {
          onData([]);
        }
      );
    }
  });

  return () => {
    unsubAuth();
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Save or update a Rental Owner in Firestore
 */
export async function saveRentalOwnerToFirestore(owner: RentalOwner): Promise<void> {
  try {
    const clean = sanitizeForFirestore(owner) as any;
    // El cliente no puede setear saldos de billetera (gestionados exclusivamente por el servidor)
    delete clean.walletBalance;
    delete clean.pendingBalance;
    delete clean.totalEarned;
    const ref = doc(db, RENTAL_OWNERS_COLLECTION, clean.id);
    await setDoc(ref, clean, { merge: true });
  } catch (error) {
    console.error('Error saving rental owner to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to Rental Payout Requests (Retiros de Billetera a CBU/Alias) - Private to owner or admin
 */
export function subscribeRentalPayouts(onData: (payouts: RentalPayoutRequest[]) => void): () => void {
  let unsubFirestore: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (unsubFirestore) {
      unsubFirestore();
      unsubFirestore = null;
    }

    if (!user) {
      onData([]);
      return;
    }

    const isAdmin = user.email?.toLowerCase() === 'ajnovasistemas@gmail.com';
    const q = isAdmin
      ? collection(db, RENTAL_PAYOUTS_COLLECTION)
      : query(collection(db, RENTAL_PAYOUTS_COLLECTION), where('ownerUid', '==', user.uid));

    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const payouts: RentalPayoutRequest[] = [];
        snapshot.forEach((docSnap) => {
          payouts.push(docSnap.data() as RentalPayoutRequest);
        });
        onData(payouts);
      },
      () => {
        onData([]);
      }
    );
  });

  return () => {
    unsubAuth();
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Save a Rental Payout Request to Firestore
 */
export async function saveRentalPayoutToFirestore(payout: RentalPayoutRequest): Promise<void> {
  try {
    const clean = sanitizeForFirestore(payout);
    const ref = doc(db, RENTAL_PAYOUTS_COLLECTION, clean.id);
    await setDoc(ref, clean, { merge: true });
  } catch (error) {
    console.error('Error saving rental payout to Firestore:', error);
    throw error;
  }
}

/**
 * Update Rental Payout Request Status (e.g. transferido, rechazado)
 */
export async function updateRentalPayoutStatus(
  payoutId: string,
  status: 'procesando' | 'transferido' | 'rechazado',
  processedAt?: string
): Promise<void> {
  try {
    const ref = doc(db, RENTAL_PAYOUTS_COLLECTION, payoutId);
    await updateDoc(ref, sanitizeForFirestore({
      status,
      processedAt: processedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error updating rental payout status in Firestore:', error);
    throw error;
  }
}

/**
 * Completely wipe ALL data from Firestore (Workers, Bookings, Banners, Rentals, and Reset App Config)
 */
export async function clearAllFirestoreData(): Promise<void> {
  try {
    await clearCollection(WORKERS_COLLECTION);
    await clearCollection(BOOKINGS_COLLECTION);
    await clearCollection(BANNERS_COLLECTION);
    await clearCollection(SHOPS_COLLECTION);
    await clearCollection(REMISES_COLLECTION);
    await clearCollection(RIDE_REQUESTS_COLLECTION);
    await clearCollection(COUPONS_COLLECTION);
    await clearCollection(VOUCHERS_COLLECTION);
    await clearCollection(JOB_PROFILES_COLLECTION);
    await clearCollection(RENTALS_COLLECTION);
    await clearCollection(RENTAL_BOOKINGS_COLLECTION);
    await clearCollection(RENTAL_OWNERS_COLLECTION);
    await clearCollection(RENTAL_PAYOUTS_COLLECTION);

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
 * Reset data to factory defaults (Reload initial mock workers, banners, shops, remises, coupons, job profiles, and rentals)
 */
export async function resetFirestoreToDefaults(): Promise<void> {
  try {
    await clearCollection(WORKERS_COLLECTION);
    await clearCollection(BOOKINGS_COLLECTION);
    await clearCollection(BANNERS_COLLECTION);
    await clearCollection(SHOPS_COLLECTION);
    await clearCollection(REMISES_COLLECTION);
    await clearCollection(RIDE_REQUESTS_COLLECTION);
    await clearCollection(COUPONS_COLLECTION);
    await clearCollection(VOUCHERS_COLLECTION);
    await clearCollection(JOB_PROFILES_COLLECTION);
    await clearCollection(RENTALS_COLLECTION);
    await clearCollection(RENTAL_BOOKINGS_COLLECTION);
    await clearCollection(RENTAL_OWNERS_COLLECTION);
    await clearCollection(RENTAL_PAYOUTS_COLLECTION);

    // Seed workers
    const workerPromises = INITIAL_WORKERS.map((w) => setDoc(doc(db, WORKERS_COLLECTION, w.id), sanitizeForFirestore(w)));
    await Promise.all(workerPromises);

    // Seed banners
    const bannerPromises = INITIAL_BANNERS.map((b) => setDoc(doc(db, BANNERS_COLLECTION, b.id), sanitizeForFirestore(b)));
    await Promise.all(bannerPromises);

    // Seed shops
    const shopPromises = INITIAL_SHOPS.map((s) => setDoc(doc(db, SHOPS_COLLECTION, s.id), sanitizeForFirestore(s)));
    await Promise.all(shopPromises);

    // Seed remises
    const remisPromises = INITIAL_REMISES.map((r) => setDoc(doc(db, REMISES_COLLECTION, r.id), sanitizeForFirestore(r)));
    await Promise.all(remisPromises);

    // Seed coupons
    const couponPromises = INITIAL_COUPONS.map((c) => setDoc(doc(db, COUPONS_COLLECTION, c.id), sanitizeForFirestore(c)));
    await Promise.all(couponPromises);

    // Seed job profiles
    const jobProfilePromises = INITIAL_JOB_PROFILES.map((p) => setDoc(doc(db, JOB_PROFILES_COLLECTION, p.id), sanitizeForFirestore(p)));
    await Promise.all(jobProfilePromises);

    // Seed rental items
    const rentalPromises = INITIAL_RENTAL_ITEMS.map((item) => setDoc(doc(db, RENTALS_COLLECTION, item.id), sanitizeForFirestore(item)));
    await Promise.all(rentalPromises);

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




/**
 * ============================================================================
 * CONVENIO FERRETERÍA BRUZZONE
 * ============================================================================
 */
export interface ConvenioConfig {
  active: boolean;
  percent: number;
  validDays: number;
  minSpend: number;
}

export const DEFAULT_CONVENIO: ConvenioConfig = { active: true, percent: 10, validDays: 30, minSpend: 0 };

export function subscribeConvenioConfig(onData: (cfg: ConvenioConfig) => void): () => void {
  return onSnapshot(
    doc(db, APP_CONFIG_COLLECTION, 'bruzzone_convenio'),
    (snap) => onData({ ...DEFAULT_CONVENIO, ...(snap.exists() ? (snap.data() as Partial<ConvenioConfig>) : {}) }),
    () => onData(DEFAULT_CONVENIO)
  );
}

export async function saveConvenioConfig(cfg: ConvenioConfig): Promise<void> {
  await setDoc(doc(db, APP_CONFIG_COLLECTION, 'bruzzone_convenio'), cfg, { merge: true });
}

/** Cupones del usuario logueado (los emitidos a su nombre) */
export function subscribeMyVouchers(onData: (vouchers: IssuedVoucher[]) => void): () => void {
  let unsubFs: (() => void) | null = null;
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (unsubFs) { unsubFs(); unsubFs = null; }
    if (!user) { onData([]); return; }
    unsubFs = onSnapshot(
      query(collection(db, VOUCHERS_COLLECTION), where('clientId', '==', user.uid)),
      (snap) => onData(snap.docs.map((d) => d.data() as IssuedVoucher)),
      () => onData([])
    );
  });
  return () => { unsubAuth(); if (unsubFs) unsubFs(); };
}

/** Todos los cupones del convenio (solo creador) */
export function subscribeAllVouchers(onData: (vouchers: IssuedVoucher[]) => void): () => void {
  return onSnapshot(
    collection(db, VOUCHERS_COLLECTION),
    (snap) => onData(snap.docs.map((d) => d.data() as IssuedVoucher)),
    () => onData([])
  );
}
