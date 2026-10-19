import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  where,
  setDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  getDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Product,
  Ingredient,
  Order,
  PromoBanner,
  BusinessProfile,
  Provider,
  DaySchedule,
  ScheduleException,
  Appointment,
  Service,
  UserProfile,
  AppNotification,
  BusySlot,
} from './types';

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore using the designated databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  appName: 'MultiRestaurant',
  consoleUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`,
};

// 3. Error handling specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'business_profiles', 'default'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
      return false;
    }
    // Expected to receive either document-not-found or permission-denied without breaking offline usage
    return true;
  }
}

// Auto-run connection test
testConnection();

/**
 * Recursively removes any undefined properties and undefined array elements
 * so Firestore setDoc/updateDoc/batch calls never throw:
 * "Unsupported field value: undefined"
 */
export function cleanObject<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanObject(item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanObject(value);
    }
  }
  return cleaned as T;
}

// ============================================================================
// FIRESTORE SYNC & PERSISTENCE SERVICES
// ============================================================================

// --- Products ---
export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Product);
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Products listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export function sanitizeProductForFirestore(product: Product): Record<string, any> {
  const cleanOgList = (product.optionGroups || []).map((og) => {
    const cleanOg: Record<string, any> = {
      id: og.id || `group-${Date.now()}`,
      title: og.title || '',
      type: og.type || 'single',
      required: Boolean(og.required),
      options: (og.options || []).map((opt) => {
        const cleanOpt: Record<string, any> = {
          id: opt.id || `opt-${Date.now()}`,
          name: opt.name || '',
          priceDelta: Number(opt.priceDelta) || 0,
        };
        if (opt.extraIngredientId) {
          cleanOpt.extraIngredientId = opt.extraIngredientId;
        }
        if (typeof opt.extraIngredientQuantity === 'number' && !isNaN(opt.extraIngredientQuantity)) {
          cleanOpt.extraIngredientQuantity = opt.extraIngredientQuantity;
        }
        return cleanOpt;
      }),
    };
    if (typeof og.maxSelections === 'number' && !isNaN(og.maxSelections)) {
      cleanOg.maxSelections = og.maxSelections;
    }
    if (typeof og.minSelections === 'number' && !isNaN(og.minSelections)) {
      cleanOg.minSelections = og.minSelections;
    }
    return cleanOg;
  });

  const cleanRecipe = (product.recipe || []).map((r) => ({
    ingredientId: r.ingredientId || '',
    quantity: Number(r.quantity) || 0,
  }));

  const docData: Record<string, any> = {
    id: product.id,
    name: product.name || '',
    description: product.description || '',
    category: product.category || 'General',
    type: product.type || 'comida',
    price: Number(product.price) || 0,
    costPrice: Number(product.costPrice) || 0,
    stock: Number(product.stock) || 0,
    minStockAlert: Number(product.minStockAlert) || 0,
    imageUrl: product.imageUrl || '',
    imageFit: product.imageFit || 'cover',
    imageZoom: typeof product.imageZoom === 'number' ? product.imageZoom : 100,
    imagePosition: product.imagePosition || 'center',
    isDriveUrl: Boolean(product.isDriveUrl),
    driveRawUrl: product.driveRawUrl || '',
    available: Boolean(product.available),
    badge: product.badge || '',
    optionGroups: cleanOgList,
    recipe: cleanRecipe,
  };

  return cleanObject(docData);
}

export async function upsertProductFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const payload = sanitizeProductForFirestore(product);
    await setDoc(doc(db, 'products', product.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Ingredients ---
export function subscribeIngredients(
  onSuccess: (ingredients: Ingredient[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'ingredients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Ingredient[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Ingredient);
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Ingredients listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function upsertIngredientFirestore(ingredient: Ingredient): Promise<void> {
  const path = `ingredients/${ingredient.id}`;
  try {
    const payload = cleanObject({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      stock: Number(ingredient.stock) || 0,
      minStockAlert: Number(ingredient.minStockAlert) || 0,
      costPerUnit: Number(ingredient.costPerUnit) || 0,
      category: ingredient.category || 'General',
      supplier: ingredient.supplier || '',
      imageUrl: ingredient.imageUrl || '',
    });
    await setDoc(doc(db, 'ingredients', ingredient.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIngredientFirestore(ingredientId: string): Promise<void> {
  const path = `ingredients/${ingredientId}`;
  try {
    await deleteDoc(doc(db, 'ingredients', ingredientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Orders ---
export function subscribeOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: Error) => void,
  userId?: string,
  isAll?: boolean
) {
  const path = 'orders';
  if (!isAll && !userId) {
    return () => {};
  }
  const q = isAll ? collection(db, path) : query(collection(db, path), where('customerUid', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Order);
      });
      const uniqueItems = Array.from(new Map(items.map((o) => [o.id, o])).values());
      // Sort newest first
      uniqueItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onSuccess(uniqueItems);
    },
    (err) => {
      console.warn('Orders listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function saveOrderFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const effectiveUid = order.customerUid || auth.currentUser?.uid || null;
    const payload = cleanObject({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType || 'recoger',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress || '',
      customerNotes: order.customerNotes || '',
      customerUid: effectiveUid,
      privacyAcceptedAt: order.privacyAcceptedAt || new Date().toISOString(),
      healthConsent: Boolean(order.healthConsent),
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      shippingFee: Number(order.shippingFee) || 0,
      total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod || 'efectivo',
      cashPayment: order.cashPayment || { amountPaid: 0, changeNeeded: 0 },
      paymentReceived: Boolean(order.paymentReceived),
      status: order.status || 'pendiente',
      shippingDetails: order.shippingDetails || undefined,
      createdAt: order.createdAt || new Date().toISOString(),
    });
    await setDoc(doc(db, 'orders', order.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderCustomerUidFirestore(orderId: string, customerUid: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await setDoc(doc(db, 'orders', orderId), { customerUid }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderStatusFirestore(orderId: string, status: Order['status'], paymentReceived?: boolean): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const patch: Record<string, unknown> = { status };
    if (paymentReceived !== undefined) {
      patch.paymentReceived = paymentReceived;
    }
    await setDoc(doc(db, 'orders', orderId), patch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFirestore(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}


// --- Banners ---
export function subscribeBanners(
  onSuccess: (banners: PromoBanner[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'banners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: PromoBanner[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as PromoBanner);
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Banners listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function upsertBannerFirestore(banner: PromoBanner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const payload = cleanObject({
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tagline: banner.tagline || '',
      badge: banner.badge || 'PROMOCIÓN',
      imageUrl: banner.imageUrl || '',
      targetType: banner.targetType || (banner.targetServiceId ? 'service' : 'product'),
      targetProductId: banner.targetProductId || '',
      targetServiceId: banner.targetServiceId || '',
      active: Boolean(banner.active),
      discountHighlight: banner.discountHighlight || '',
    });
    await setDoc(doc(db, 'banners', banner.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBannerFirestore(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Business Profile ---
export function subscribeBusinessProfile(
  onSuccess: (profile: BusinessProfile) => void,
  onError?: (err: Error) => void
) {
  const path = 'business_profiles/main';
  return onSnapshot(
    doc(db, 'business_profiles', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess(snapshot.data() as BusinessProfile);
      }
    },
    (err) => {
      console.warn('BusinessProfile listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function saveBusinessProfileFirestore(profile: BusinessProfile): Promise<void> {
  const path = 'business_profiles/main';
  try {
    await setDoc(doc(db, 'business_profiles', 'main'), cleanObject(profile), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Batch Push to Cloud (Explicit Only, Never Offline) ---
export async function pushAllToFirestore(data: {
  products: Product[];
  ingredients: Ingredient[];
  banners: PromoBanner[];
  orders: Order[];
  profile: BusinessProfile;
  services?: Service[];
}): Promise<void> {
  // Guard against seeding/syncing offline to avoid database discrepancies
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('Sincronización cancelada: No se puede sembrar o sincronizar datos sin conexión a internet.');
    return;
  }
  const batch = writeBatch(db);

  // Profile
  batch.set(doc(db, 'business_profiles', 'main'), cleanObject(data.profile), { merge: true });

  // Products
  data.products.forEach((p) => {
    batch.set(doc(db, 'products', p.id), sanitizeProductForFirestore(p));
  });

  // Services
  if (data.services) {
    data.services.forEach((s) => {
      batch.set(doc(db, 'services', s.id), cleanObject(s));
    });
  }

  // Ingredients
  data.ingredients.forEach((i) => {
    batch.set(doc(db, 'ingredients', i.id), cleanObject(i));
  });

  // Banners
  data.banners.forEach((b) => {
    batch.set(doc(db, 'banners', b.id), cleanObject(b));
  });

  // Orders
  data.orders.forEach((o) => {
    batch.set(doc(db, 'orders', o.id), cleanObject(o));
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}

// ============================================================================
// APPOINTMENT SCHEDULING SERVICES
// ============================================================================

// --- Providers ---
export function subscribeProviders(onSuccess: (providers: Provider[]) => void, onError?: (err: Error) => void) {
  const path = 'providers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Provider[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as Provider));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertProviderFirestore(provider: Provider): Promise<void> {
  const path = `providers/${provider.id}`;
  try {
    await setDoc(doc(db, 'providers', provider.id), cleanObject(provider));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProviderFirestore(providerId: string): Promise<void> {
  const path = `providers/${providerId}`;
  try {
    await deleteDoc(doc(db, 'providers', providerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Weekly Schedule ---
export function subscribeWeeklySchedule(onSuccess: (schedule: DaySchedule[]) => void, onError?: (err: Error) => void) {
  const path = 'weekly_schedule';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: DaySchedule[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as DaySchedule));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function saveDayScheduleFirestore(daySchedule: DaySchedule): Promise<void> {
  const path = `weekly_schedule/day_${daySchedule.dayOfWeek}`;
  try {
    await setDoc(doc(db, 'weekly_schedule', `day_${daySchedule.dayOfWeek}`), cleanObject(daySchedule));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Schedule Exceptions ---
export function subscribeExceptions(onSuccess: (exceptions: ScheduleException[]) => void, onError?: (err: Error) => void) {
  const path = 'exceptions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ScheduleException[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as ScheduleException));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertExceptionFirestore(exc: ScheduleException): Promise<void> {
  const path = `exceptions/${exc.id}`;
  try {
    await setDoc(doc(db, 'exceptions', exc.id), cleanObject(exc));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExceptionFirestore(excId: string): Promise<void> {
  const path = `exceptions/${excId}`;
  try {
    await deleteDoc(doc(db, 'exceptions', excId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Appointments ---
export function subscribeAppointments(
  onSuccess: (appointments: Appointment[]) => void, 
  onError?: (err: Error) => void,
  userId?: string,
  isAll?: boolean
) {
  const path = 'appointments';
  if (!isAll && !userId) {
    return () => {};
  }
  const q = isAll ? collection(db, path) : query(collection(db, path), where('customerUid', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Appointment[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as Appointment));
      const uniqueItems = Array.from(new Map(items.map((a) => [a.id, a])).values());
      uniqueItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onSuccess(uniqueItems);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function saveAppointmentFirestore(app: Appointment): Promise<void> {
  const path = `appointments/${app.id}`;
  try {
    const effectiveUid = app.customerUid || auth.currentUser?.uid || null;
    const cleaned = cleanObject({
      ...app,
      customerUid: effectiveUid,
    });
    await setDoc(doc(db, 'appointments', app.id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAppointmentStatusFirestore(appId: string, status: Appointment['status']): Promise<void> {
  const path = `appointments/${appId}`;
  try {
    await setDoc(doc(db, 'appointments', appId), { status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateAppointmentReceiptFirestore(appId: string, received: boolean): Promise<void> {
  const path = `appointments/${appId}`;
  try {
    await setDoc(doc(db, 'appointments', appId), { transferReceiptReceived: received, status: received ? 'confirmada' : 'pendiente' }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateAppointmentPaymentFirestore(appId: string, paymentReceived: boolean): Promise<void> {
  const path = `appointments/${appId}`;
  try {
    await setDoc(doc(db, 'appointments', appId), { paymentReceived }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointmentFirestore(appId: string): Promise<void> {
  const path = `appointments/${appId}`;
  try {
    await deleteDoc(doc(db, 'appointments', appId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Busy Slots ---
export function subscribeBusySlots(
  onSuccess: (busySlots: BusySlot[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'busy_slots';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: BusySlot[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as BusySlot));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertBusySlotFirestore(slot: BusySlot): Promise<void> {
  const path = `busy_slots/${slot.id}`;
  try {
    const cleaned = cleanObject({
      providerId: slot.providerId,
      startTimeUtc: slot.startTimeUtc,
      endTimeUtc: slot.endTimeUtc,
    });
    await setDoc(doc(db, 'busy_slots', slot.id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBusySlotFirestore(slotId: string): Promise<void> {
  const path = `busy_slots/${slotId}`;
  try {
    await deleteDoc(doc(db, 'busy_slots', slotId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Services ---
export function subscribeServices(onSuccess: (services: Service[]) => void, onError?: (err: Error) => void) {
  const path = 'services';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Service[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as Service));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertServiceFirestore(service: Service): Promise<void> {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), cleanObject(service));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteServiceFirestore(serviceId: string): Promise<void> {
  const path = `services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Notifications ---
export interface NotificationSubscriptionScope {
  isAdmin: boolean;
  uid: string | null;
}

export function subscribeNotifications(
  onSuccess: (notifications: AppNotification[]) => void,
  onError?: (err: Error) => void,
  scope?: NotificationSubscriptionScope
) {
  const path = 'notifications';
  // Invitada: no se suscribe
  if (!scope || (!scope.isAdmin && !scope.uid)) {
    return () => {};
  }
  // Gerente: colección completa. Clienta: where('recipientUid', '==', uid)
  const q = scope.isAdmin
    ? collection(db, path)
    : query(collection(db, path), where('recipientUid', '==', scope.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || 'all',
          title: data.title || 'Notificación',
          message: data.message || '',
          type: data.type || 'system_alert',
          read: Boolean(data.read),
          linkTab: data.linkTab,
          createdAt: data.createdAt || new Date().toISOString(),
          audience: data.audience || 'admin',
          recipientUid: data.recipientUid || null,
        } as AppNotification);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertNotificationFirestore(notif: AppNotification): Promise<void> {
  const path = `notifications/${notif.id}`;
  try {
    const cleaned = cleanObject(notif);
    await setDoc(doc(db, 'notifications', notif.id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationReadFirestore(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    await setDoc(doc(db, 'notifications', notifId), { read: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNotificationFirestore(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllNotificationsFirestore(notificationIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    notificationIds.forEach((id) => {
      batch.delete(doc(db, 'notifications', id));
    });
    await batch.commit();
  } catch (error) {
    console.warn('Error clearing notifications batch:', error);
  }
}

// ============================================================================
// USER PROFILES & FIREBASE AUTH SERVICES
// ============================================================================

export async function getUserProfileFirestore(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('getUserProfileFirestore error:', error);
    return null;
  }
}

export async function upsertUserProfileFirestore(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const cleaned = cleanObject({
      ...profile,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'users', profile.uid), cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Dynamic administrator verification (supports customAdminEmails and business profile)
export function isUserAdminEmail(email?: string | null, customAdminEmails?: string[]): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  
  if (Array.isArray(customAdminEmails) && customAdminEmails.length > 0) {
    if (customAdminEmails.some((adminEmail) => adminEmail.toLowerCase().trim() === cleanEmail)) {
      return true;
    }
  }

  // Check stored business profile in localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedProfile = localStorage.getItem('bl_business_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (Array.isArray(parsed?.adminEmails) && parsed.adminEmails.some((e: string) => e.toLowerCase().trim() === cleanEmail)) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}

// Provider instance
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const user = result.user;
    const existing = await getUserProfileFirestore(user.uid);
    const isDbAdmin = existing?.role === 'admin' || (user.emailVerified && isUserAdminEmail(user.email));
    const roleToAssign = existing?.role || (isDbAdmin ? 'admin' : 'client');
    const localConsent = typeof window !== 'undefined' ? localStorage.getItem('bl_privacy_consent_accepted') : null;
    const privacyAcceptedAt = existing?.privacyAcceptedAt || localConsent || undefined;
    
    try {
      await upsertUserProfileFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || existing?.displayName || (roleToAssign === 'admin' ? 'Administrador' : 'Cliente'),
        photoURL: user.photoURL || existing?.photoURL || '',
        phone: existing?.phone || user.phoneNumber || '',
        address: existing?.address || '',
        role: roleToAssign,
        privacyAcceptedAt,
        healthConsent: existing?.healthConsent ?? false,
        createdAt: existing?.createdAt || new Date().toISOString(),
      });
    } catch (upsertErr) {
      console.warn('Aviso: no se pudo guardar el perfil en Firestore inmediatamente:', upsertErr);
    }

    if (privacyAcceptedAt && typeof window !== 'undefined') {
      try {
        localStorage.setItem('bl_privacy_consent_accepted', privacyAcceptedAt);
      } catch (_) {}
    }
    return user;
  } catch (error: any) {
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error('Error al iniciar sesión con Google:', error);
    }
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Error al iniciar sesión con correo:', error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, displayName: string): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    const existing = await getUserProfileFirestore(result.user.uid);
    const isAdmin = Boolean(result.user.emailVerified && isUserAdminEmail(result.user.email));
    const roleToAssign = existing?.role || (isAdmin ? 'admin' : 'client');
    const now = new Date().toISOString();
    try {
      await upsertUserProfileFirestore({
        uid: result.user.uid,
        email: result.user.email || email,
        displayName: displayName.trim() || (roleToAssign === 'admin' ? 'Administrador' : 'Cliente'),
        phone: '',
        address: '',
        role: roleToAssign,
        privacyAcceptedAt: now,
        healthConsent: true,
        createdAt: now,
      });
    } catch (saveErr) {
      console.warn('Aviso: no se pudo guardar perfil inicial en Firestore:', saveErr);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bl_privacy_consent_accepted', now);
      } catch (_) {}
    }
    return result.user;
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error al enviar correo de recuperación:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
}

export { onAuthStateChanged, reauthenticateWithPopup, reauthenticateWithCredential, EmailAuthProvider, deleteUser };
export type { FirebaseUser };


