// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkDlG4OPPko8vWFry_4GC_bU_SoIprnsc",
  authDomain: "tuckshop-preorder-a50e7.firebaseapp.com",
  projectId: "tuckshop-preorder-a50e7",
  storageBucket: "tuckshop-preorder-a50e7.firebasestorage.app",
  messagingSenderId: "548253433839",
  appId: "1:548253433839:web:e8a92a0e73d911522ac01a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names
export const ORDERS_COLLECTION = 'orders';
export const MENU_COLLECTION = 'menu';

// ============================================
// ORDER MANAGEMENT FUNCTIONS
// ============================================

/**
 * Add a new order to Firestore
 */
export async function addOrder(orderData) {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      synced: true
    };
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderWithTimestamp);
    console.log('Order added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

/**
 * Get all orders (one-time fetch)
 */
export async function getAllOrders() {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

/**
 * Set up real-time listener for orders
 */
export function onOrdersChange(callback) {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      callback(orders);
    });
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    throw error;
  }
}

/**
 * Update an order
 */
export async function updateOrder(orderId, updateData) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, updateData);
    console.log('Order updated:', orderId);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId) {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    console.log('Order deleted:', orderId);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// ============================================
// MENU MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get all menu items
 */
export async function getMenuItems() {
  try {
    const querySnapshot = await getDocs(collection(db, MENU_COLLECTION));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    console.error('Error getting menu items:', error);
    throw error;
  }
}

/**
 * Add a menu item
 */
export async function addMenuItem(itemData) {
  try {
    const docRef = await addDoc(collection(db, MENU_COLLECTION), itemData);
    console.log('Menu item added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
}

/**
 * Update a menu item
 */
export async function updateMenuItem(itemId, updateData) {
  try {
    const itemRef = doc(db, MENU_COLLECTION, itemId);
    await updateDoc(itemRef, updateData);
    console.log('Menu item updated:', itemId);
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(itemId) {
  try {
    await deleteDoc(doc(db, MENU_COLLECTION, itemId));
    console.log('Menu item deleted:', itemId);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}

// Export database reference for direct access if needed
export { db };