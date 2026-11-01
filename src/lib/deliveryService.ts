/**
 * ============================================================================
 * SERVIGO DELIVERY ENGINE - MODULO DE COMERCIOS DE COMIDA & ENVIOS
 * ============================================================================
 * Este archivo implementa el servicio en tiempo real para:
 * 1. Colección 'users': Perfil del cliente con datos de envío (nombre, teléfono,
 *    dirección de entrega y coordenadas GPS) o perfil de comercio vinculado.
 * 2. Colección 'merchants': Catálogo de locales de comida (Pizzerías, Hamburgueserías,
 *    Rotiserías, Heladerías, etc.) con sus productos, horarios y tarifas de delivery.
 * 3. Colección 'orders': Pedidos en tiempo real con ciclo completo:
 *    PENDING -> PREPARING -> SEARCHING_DRIVER / ON_THE_WAY -> DELIVERED / CANCELLED.
 *
 * Compatible con Firebase v9+ Modular y listo para desplegar en Vercel o Cloud Run.
 */

import {
  doc,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDoc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { db, auth, sanitizeForFirestore } from './firebase';
import { isPubliclyApproved, UserProfile, Merchant, MerchantProduct, Order, OrderStatus, DispatchMethod, OrderMessage } from '../types';
import { INITIAL_MERCHANTS } from '../data/mockMerchants';

// Nombres de colecciones oficiales de Firestore
export const USERS_COLLECTION = 'users';
export const MERCHANTS_COLLECTION = 'merchants';
export const ORDERS_COLLECTION = 'orders';

/**
 * Helper de manejo de errores Firestore según la convención de auditoría
 */
export function handleDeliveryFirestoreError(error: unknown, operation: string, path: string) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.error(`[ServiGo Delivery Error] ${operation} en '${path}':`, errMessage);
}

// ============================================================================
// 1. USUARIOS Y PERFILES (users)
// ============================================================================

const DEFAULT_LOCAL_USER: UserProfile = {
  id: 'usr_cliente_local',
  name: '',
  phone: '',
  email: '',
  role: 'client',
  deliveryAddress: '',
  coordinates: {
    lat: -33.3524,
    lng: -63.7214,
  },
  createdAt: new Date().toISOString(),
};

/**
 * Obtiene el perfil de un usuario desde Firestore o fallback a localStorage / default
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    handleDeliveryFirestoreError(error, 'getDoc', `${USERS_COLLECTION}/${userId}`);
  }

  // Fallback cache local
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`servigo_user_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return DEFAULT_LOCAL_USER;
}

/**
 * Guarda o actualiza los datos del usuario en la colección 'users'
 * (nombre, teléfono, dirección de entrega y coordenadas de geolocalización)
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  try {
    const userClean = sanitizeForFirestore({
      ...user,
      updatedAt: new Date().toISOString(),
    });
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userDocRef, userClean, { merge: true });

    if (typeof window !== 'undefined') {
      localStorage.setItem(`servigo_user_${user.id}`, JSON.stringify(userClean));
      localStorage.setItem('servigo_active_user_id', user.id);
    }
  } catch (error) {
    handleDeliveryFirestoreError(error, 'setDoc', `${USERS_COLLECTION}/${user.id}`);
    throw error;
  }
}

/**
 * Escucha cambios en tiempo real del perfil del usuario
 */
export function subscribeUserProfile(userId: string, onData: (user: UserProfile) => void): () => void {
  const userDocRef = doc(db, USERS_COLLECTION, userId);

  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const u = docSnap.data() as UserProfile;
        onData(u);
      } else {
        // Todavía no cargó sus datos de envío
        onData({ ...DEFAULT_LOCAL_USER, id: userId, name: '', phone: '', email: '', deliveryAddress: '' });
      }
    },
    (err) => {
      handleDeliveryFirestoreError(err, 'onSnapshot', `${USERS_COLLECTION}/${userId}`);
      onData({ ...DEFAULT_LOCAL_USER, id: userId, name: '', phone: '', email: '', deliveryAddress: '' });
    }
  );
}

// ============================================================================
// 2. COMERCIOS Y PRODUCTOS (merchants)
// ============================================================================

/**
 * Inicializa la colección de comercios en Firestore si está vacía
 */
export async function ensureMerchantsSeeded(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, MERCHANTS_COLLECTION));
    if (snapshot.empty) {
      console.log('Sembrando comercios iniciales de Delivery en Firestore...');
      for (const merchant of INITIAL_MERCHANTS) {
        await setDoc(
          doc(db, MERCHANTS_COLLECTION, merchant.id),
          sanitizeForFirestore(merchant),
          { merge: true }
        );
      }
    }
  } catch (err) {
    handleDeliveryFirestoreError(err, 'ensureMerchantsSeeded', MERCHANTS_COLLECTION);
  }
}

/**
 * Suscripción en tiempo real al listado de comercios
 */
// Comercios de demostración que pudieron quedar sembrados: nunca se muestran al público.
const DEMO_MERCHANT_IDS = new Set(INITIAL_MERCHANTS.map((m) => m.id));

export function subscribeMerchants(onData: (merchants: Merchant[]) => void): () => void {

  const merchantsRef = collection(db, MERCHANTS_COLLECTION);
  return onSnapshot(
    merchantsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Merchant[] = snapshot.docs
          .map((d) => d.data() as Merchant)
          .filter((m) => !DEMO_MERCHANT_IDS.has(m.id) && Boolean(m.ownerUid) && isPubliclyApproved(m));
        onData(list);
      } else {
        onData([]);
      }
    },
    (err) => {
      handleDeliveryFirestoreError(err, 'onSnapshot', MERCHANTS_COLLECTION);
      onData([]);
    }
  );
}

/**
 * Actualiza el estado de apertura de un comercio (Abierto/Cerrado)
 */
export async function updateMerchantOpenStatus(merchantId: string, isOpen: boolean): Promise<void> {
  try {
    const ref = doc(db, MERCHANTS_COLLECTION, merchantId);
    await updateDoc(ref, { isOpen });
  } catch (err) {
    handleDeliveryFirestoreError(err, 'updateDoc', `${MERCHANTS_COLLECTION}/${merchantId}`);
    throw err;
  }
}

/**
 * Actualiza el costo base de envío y el monto extra que el comercio suma al pedido por delivery / logística
 */
export async function updateMerchantDeliveryFees(
  merchantId: string,
  deliveryFee: number,
  extraDeliveryFee: number
): Promise<void> {
  try {
    const ref = doc(db, MERCHANTS_COLLECTION, merchantId);
    await updateDoc(ref, {
      deliveryFee: Number(deliveryFee) || 0,
      extraDeliveryFee: Number(extraDeliveryFee) || 0,
    });
  } catch (err) {
    handleDeliveryFirestoreError(err, 'updateDoc: updateMerchantDeliveryFees', `${MERCHANTS_COLLECTION}/${merchantId}`);
    throw err;
  }
}

/**
 * Registra o actualiza una casa de comidas en Firestore con sus credenciales privadas
 */
export async function registerMerchant(merchant: Merchant): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Ingresá con tu cuenta para registrar tu local.');
  try {
    const { accountPassword, accountUsername, accountEmail, ...rest } = merchant;
    const cleanMerchant = sanitizeForFirestore({
      ...rest,
      ownerUid: uid,
      createdAt: merchant.createdAt || new Date().toISOString(),
    });
    const ref = doc(db, MERCHANTS_COLLECTION, merchant.id);
    await setDoc(ref, cleanMerchant, { merge: true });
    setSavedMerchantSession(merchant.id);
  } catch (err) {
    handleDeliveryFirestoreError(err, 'setDoc', `${MERCHANTS_COLLECTION}/${merchant.id}`);
    throw err;
  }
}

/**
 * Local (o locales) cuyo dueño es la cuenta indicada
 */
export function subscribeMyMerchants(uid: string, onData: (merchants: Merchant[]) => void): () => void {
  const q = query(collection(db, MERCHANTS_COLLECTION), where('ownerUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as Merchant)),
    (err) => {
      handleDeliveryFirestoreError(err, 'onSnapshot: subscribeMyMerchants', MERCHANTS_COLLECTION);
      onData([]);
    }
  );
}

const MERCHANT_SESSION_KEY = 'servigo_logged_merchant_id_v1';

export function getSavedMerchantSession(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MERCHANT_SESSION_KEY);
}

export function setSavedMerchantSession(merchantId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MERCHANT_SESSION_KEY, merchantId);
}

export function clearSavedMerchantSession(): void {
  if (typeof window === 'undefined') return null as any;
  localStorage.removeItem(MERCHANT_SESSION_KEY);
}

/**
 * Agrega un nuevo producto/plato al menú del comercio y lo persiste en Firestore
 */
export async function addMerchantProduct(
  merchantId: string,
  currentProducts: MerchantProduct[] = [],
  productInput: Omit<MerchantProduct, 'id' | 'merchantId'>
): Promise<MerchantProduct> {
  const newProduct: MerchantProduct = {
    ...productInput,
    id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    merchantId,
  };

  const updatedProducts = [...currentProducts, newProduct];
  try {
    const ref = doc(db, MERCHANTS_COLLECTION, merchantId);
    await updateDoc(ref, {
      products: sanitizeForFirestore(updatedProducts),
    });
    return newProduct;
  } catch (err) {
    handleDeliveryFirestoreError(err, 'updateDoc: addMerchantProduct', `${MERCHANTS_COLLECTION}/${merchantId}`);
    throw err;
  }
}

/**
 * Actualiza un producto existente en el menú del comercio
 */
export async function updateMerchantProduct(
  merchantId: string,
  currentProducts: MerchantProduct[] = [],
  updatedProduct: MerchantProduct
): Promise<void> {
  const updatedProducts = currentProducts.map((p) =>
    p.id === updatedProduct.id ? updatedProduct : p
  );

  try {
    const ref = doc(db, MERCHANTS_COLLECTION, merchantId);
    await updateDoc(ref, {
      products: sanitizeForFirestore(updatedProducts),
    });
  } catch (err) {
    handleDeliveryFirestoreError(err, 'updateDoc: updateMerchantProduct', `${MERCHANTS_COLLECTION}/${merchantId}`);
    throw err;
  }
}

/**
 * Elimina un producto del menú del comercio
 */
export async function deleteMerchantProduct(
  merchantId: string,
  currentProducts: MerchantProduct[] = [],
  productId: string
): Promise<void> {
  const updatedProducts = currentProducts.filter((p) => p.id !== productId);

  try {
    const ref = doc(db, MERCHANTS_COLLECTION, merchantId);
    await updateDoc(ref, {
      products: sanitizeForFirestore(updatedProducts),
    });
  } catch (err) {
    handleDeliveryFirestoreError(err, 'updateDoc: deleteMerchantProduct', `${MERCHANTS_COLLECTION}/${merchantId}`);
    throw err;
  }
}

/**
 * Alterna la disponibilidad de un producto (Activo / Agotado)
 */
export async function toggleProductAvailability(
  merchantId: string,
  currentProducts: MerchantProduct[] = [],
  productId: string,
  isAvailable: boolean
): Promise<void> {
  const updatedProducts = currentProducts.map((p) =>
    p.id === productId ? { ...p, isAvailable } : p
  );

  try {
    const ref = doc(db, MERCHANTS_COLLECTION, merchantId);
    await updateDoc(ref, {
      products: sanitizeForFirestore(updatedProducts),
    });
  } catch (err) {
    handleDeliveryFirestoreError(err, 'updateDoc: toggleProductAvailability', `${MERCHANTS_COLLECTION}/${merchantId}`);
    throw err;
  }
}

// ============================================================================
// 3. FLUJO DE COMPRA DEL CLIENTE Y CHECKOUT (orders)
// ============================================================================

/**
 * Crea un nuevo pedido en Firestore en la colección 'orders' con estado 'PENDING'.
 * Utiliza serverTimestamp() para garantizar sincronía temporal en el servidor.
 */
export async function createOrder(
  orderInput: Omit<Order, 'id' | 'createdAt'>,
  merchantOwnerUid?: string
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Ingresá con tu cuenta para hacer el pedido.');
  if (!merchantOwnerUid) throw new Error('Este local todavía no puede recibir pedidos.');
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const cleanPayload = sanitizeForFirestore({
      ...orderInput,
      clientId: uid,
      clientUid: uid,
      merchantOwnerUid,
      status: 'PENDING' as OrderStatus,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });

    const docRef = await addDoc(ordersCol, cleanPayload);
    // Guarda el ID asignado dentro del mismo documento
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    handleDeliveryFirestoreError(error, 'addDoc', ORDERS_COLLECTION);
    throw error;
  }
}

/**
 * Suscripción en tiempo real a los pedidos de un cliente específico
 */
export function subscribeClientOrders(
  clientId: string,
  onData: (orders: Order[]) => void
): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  // Consulta filtrando por clientId
  const q = query(ordersRef, where('clientUid', '==', clientId));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Order[];

      // Ordenar por fecha descendente en cliente
      orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(orders);
    },
    (err) => {
      handleDeliveryFirestoreError(err, 'onSnapshot', ORDERS_COLLECTION);
      onData([]);
    }
  );
}

// ============================================================================
// 4. PANEL DEL COMERCIO EN TIEMPO REAL (RECEPCIÓN Y GESTIÓN DE PEDIDOS)
// ============================================================================

/**
 * Suscripción en tiempo real a pedidos para un comercio determinado (`merchantId`).
 * Permite recibir notificaciones al instante cuando entra un nuevo pedido.
 */
export function subscribeMerchantOrders(
  merchantId: string,
  onData: (orders: Order[]) => void
): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onData([]);
    return () => {};
  }
  const ordersRef = collection(db, ORDERS_COLLECTION);
  // Solo los pedidos de locales de esta cuenta (así lo exigen las reglas)
  const q = query(ordersRef, where('merchantOwnerUid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = (snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Order[]).filter((o) => o.merchantId === merchantId);

      // Ordenar: pedidos pendientes y en preparación primero, luego los más recientes
      orders.sort((a, b) => {
        const priority: Record<OrderStatus, number> = {
          PENDING: 1,
          PREPARING: 2,
          SEARCHING_DRIVER: 3,
          ON_THE_WAY: 4,
          DELIVERED: 5,
          CANCELLED: 6,
        };
        const prioDiff = (priority[a.status] || 99) - (priority[b.status] || 99);
        if (prioDiff !== 0) return prioDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      onData(orders);
    },
    (err) => {
      handleDeliveryFirestoreError(err, 'onSnapshot', ORDERS_COLLECTION);
      onData([]);
    }
  );
}

/**
 * Actualiza el estado de un pedido en Firestore
 * Estados válidos: PENDING -> PREPARING -> SEARCHING_DRIVER / ON_THE_WAY -> DELIVERED / CANCELLED
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  options?: {
    dispatchMethod?: DispatchMethod;
    driverName?: string;
    driverPhone?: string;
  }
): Promise<void> {
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (options?.dispatchMethod) {
      updatePayload.dispatchMethod = options.dispatchMethod;
    }
    if (options?.driverName) {
      updatePayload.driverName = options.driverName;
    }
    if (options?.driverPhone) {
      updatePayload.driverPhone = options.driverPhone;
    }

    await updateDoc(orderDocRef, sanitizeForFirestore(updatePayload));
  } catch (error) {
    handleDeliveryFirestoreError(error, 'updateDoc', `${ORDERS_COLLECTION}/${orderId}`);
    throw error;
  }
}

/**
 * Envía un mensaje interno para un pedido (mensajería entre comercio y cliente)
 */
export async function sendOrderMessage(
  orderId: string,
  message: {
    sender: 'merchant' | 'client';
    senderName: string;
    text: string;
  }
): Promise<void> {
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderDocRef);
    const existingMessages: OrderMessage[] = orderSnap.exists()
      ? (orderSnap.data().messages || [])
      : [];

    const newMessage: OrderMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: message.sender,
      senderName: message.senderName,
      text: message.text.trim(),
      timestamp: new Date().toISOString(),
    };

    await updateDoc(orderDocRef, {
      messages: sanitizeForFirestore([...existingMessages, newMessage]),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleDeliveryFirestoreError(error, 'updateDoc: sendOrderMessage', `${ORDERS_COLLECTION}/${orderId}`);
    throw error;
  }
}
