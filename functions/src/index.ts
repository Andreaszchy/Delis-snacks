import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

interface OrderItem {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedOptionDetails?: Array<{
    optionName: string;
    extraIngredientId?: string;
    extraIngredientQuantity?: number;
  }>;
}

interface OrderData {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: string;
  stockDeductedAt?: admin.firestore.Timestamp;
  stockRestoredAt?: admin.firestore.Timestamp;
}

interface ProductData {
  id: string;
  name: string;
  stock: number;
  recipe?: Array<{
    ingredientId: string;
    quantity: number;
  }>;
  optionGroups?: Array<{
    id: string;
    options: Array<{
      id: string;
      name: string;
      extraIngredientId?: string;
      extraIngredientQuantity?: number;
    }>;
  }>;
}

interface IngredientData {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

/**
 * Cloud Function Trigger: onDocumentCreated("orders/{orderId}")
 * Securely discounts stock on the server side when an order is placed.
 * Clients have NO direct write permission to products or ingredients.
 */
export const onOrderCreatedDeductStock = onDocumentCreated(
  'orders/{orderId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const order = snap.data() as OrderData;
    const orderId = event.params.orderId;

    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.log(`Order ${orderId} has no items. Skipping stock deduction.`);
      return;
    }

    // Execute atomic transaction for inventory consistency
    try {
      await db.runTransaction(async (transaction) => {
        const orderRef = snap.ref;
        const currentOrderDoc = await transaction.get(orderRef);
        if (!currentOrderDoc.exists) return;

        const currentOrder = currentOrderDoc.data() as OrderData;
        if (currentOrder.stockDeductedAt) {
          console.log(`Order ${orderId} already processed for stock. Idempotent skip.`);
          return;
        }

        // 1. Gather all product and ingredient references to read in transaction
        const productRefs: Record<string, admin.firestore.DocumentReference> = {};
        for (const item of order.items) {
          if (item.productId && !productRefs[item.productId]) {
            productRefs[item.productId] = db.doc(`products/${item.productId}`);
          }
        }

        const productDocs: Record<string, ProductData | null> = {};
        for (const [prodId, ref] of Object.entries(productRefs)) {
          const docSnap = await transaction.get(ref);
          productDocs[prodId] = docSnap.exists ? (docSnap.data() as ProductData) : null;
        }

        // 2. Compute ingredient deductions from recipes and option groups
        const ingredientDeductions: Record<string, number> = {};

        for (const item of order.items) {
          const product = productDocs[item.productId];
          if (!product) continue;

          // Deduct from base recipe
          if (Array.isArray(product.recipe)) {
            for (const r of product.recipe) {
              if (r.ingredientId && r.quantity > 0) {
                const totalReq = r.quantity * item.quantity;
                ingredientDeductions[r.ingredientId] = (ingredientDeductions[r.ingredientId] || 0) + totalReq;
              }
            }
          }

          // Deduct from selected options extra ingredients
          if (Array.isArray(item.selectedOptionDetails)) {
            for (const opt of item.selectedOptionDetails) {
              if (opt.extraIngredientId) {
                const qty = (opt.extraIngredientQuantity || 1) * item.quantity;
                ingredientDeductions[opt.extraIngredientId] =
                  (ingredientDeductions[opt.extraIngredientId] || 0) + qty;
              }
            }
          }
        }

        // 3. Read ingredient documents in transaction
        const ingredientRefs: Record<string, admin.firestore.DocumentReference> = {};
        const ingredientDocs: Record<string, IngredientData | null> = {};

        for (const ingId of Object.keys(ingredientDeductions)) {
          ingredientRefs[ingId] = db.doc(`ingredients/${ingId}`);
          const ingSnap = await transaction.get(ingredientRefs[ingId]);
          ingredientDocs[ingId] = ingSnap.exists ? (ingSnap.data() as IngredientData) : null;
        }

        // 4. Apply product stock updates
        for (const item of order.items) {
          const prodRef = productRefs[item.productId];
          const prodData = productDocs[item.productId];
          if (prodRef && prodData && typeof prodData.stock === 'number') {
            const newStock = Math.max(0, prodData.stock - item.quantity);
            transaction.update(prodRef, {
              stock: newStock,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        // 5. Apply ingredient stock updates
        for (const [ingId, qtyToDeduct] of Object.entries(ingredientDeductions)) {
          const ingRef = ingredientRefs[ingId];
          const ingData = ingredientDocs[ingId];
          if (ingRef && ingData && typeof ingData.stock === 'number') {
            const newStock = Math.max(0, ingData.stock - qtyToDeduct);
            transaction.update(ingRef, {
              stock: newStock,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        // 6. Mark order as processed
        transaction.update(orderRef, {
          stockDeductedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log(`Successfully deducted stock for order ${orderId} (${order.orderNumber})`);
    } catch (error) {
      console.error(`Error deducting stock for order ${orderId}:`, error);
    }
  }
);

/**
 * Cloud Function Trigger: onDocumentUpdated("orders/{orderId}")
 * Restores product and ingredient stock when an order is cancelled.
 */
export const onOrderCancelledRestoreStock = onDocumentUpdated(
  'orders/{orderId}',
  async (event) => {
    const beforeSnap = event.data?.before;
    const afterSnap = event.data?.after;
    if (!beforeSnap || !afterSnap) return;

    const beforeOrder = beforeSnap.data() as OrderData;
    const afterOrder = afterSnap.data() as OrderData;
    const orderId = event.params.orderId;

    // Check if status changed to 'cancelado' and stock was previously deducted
    if (beforeOrder.status !== 'cancelado' && afterOrder.status === 'cancelado') {
      if (!afterOrder.stockDeductedAt || afterOrder.stockRestoredAt) {
        return;
      }

      try {
        await db.runTransaction(async (transaction) => {
          const orderRef = afterSnap.ref;
          const currentSnap = await transaction.get(orderRef);
          if (!currentSnap.exists) return;
          const currentOrder = currentSnap.data() as OrderData;
          if (currentOrder.stockRestoredAt) return;

          // Restore product stock
          for (const item of afterOrder.items || []) {
            if (!item.productId) continue;
            const prodRef = db.doc(`products/${item.productId}`);
            const prodSnap = await transaction.get(prodRef);
            if (prodSnap.exists) {
              const prod = prodSnap.data() as ProductData;
              transaction.update(prodRef, {
                stock: (prod.stock || 0) + item.quantity,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              // Restore recipe ingredients
              if (Array.isArray(prod.recipe)) {
                for (const r of prod.recipe) {
                  if (r.ingredientId) {
                    const ingRef = db.doc(`ingredients/${r.ingredientId}`);
                    const ingSnap = await transaction.get(ingRef);
                    if (ingSnap.exists) {
                      const ing = ingSnap.data() as IngredientData;
                      transaction.update(ingRef, {
                        stock: (ing.stock || 0) + (r.quantity * item.quantity),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                      });
                    }
                  }
                }
              }
            }
          }

          transaction.update(orderRef, {
            stockRestoredAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        console.log(`Successfully restored inventory stock for cancelled order ${orderId}`);
      } catch (error) {
        console.error(`Error restoring inventory for order ${orderId}:`, error);
      }
    }
  }
);
