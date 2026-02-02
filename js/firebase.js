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
  where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration - Replace with your actual config
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
const auth = getAuth(app);

// Collections
const ORDERS_COLLECTION = 'orders';
const MENU_COLLECTION = 'menu';

// Storage adapter for Firebase
class FirebaseStorage {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.isInitialized = false;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOrders();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Test connection
      await getDocs(collection(db, ORDERS_COLLECTION));
      this.isInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      throw error;
    }
  }

  async saveOrder(order) {
    try {
      await this.initialize();

      if (this.isOnline) {
        // Save to Firebase
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
          ...order,
          synced: true,
          syncedAt: new Date().toISOString()
        });
        console.log('Order saved to Firebase:', docRef.id);
        return docRef.id;
      } else {
        // Queue for later sync
        this.syncQueue.push(order);
        // Also save locally as backup
        const localStorage = new LocalStorageAdapter();
        return await localStorage.saveOrder(order);
      }
    } catch (error) {
      console.error('Error saving order to Firebase:', error);
      // Fallback to local storage
      const localStorage = new LocalStorageAdapter();
      return await localStorage.saveOrder(order);
    }
  }

  async getAllOrders() {
    try {
      await this.initialize();

      if (this.isOnline) {
        const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
      } else {
        // Fallback to local storage
        const localStorage = new LocalStorageAdapter();
        return await localStorage.getAllOrders();
      }
    } catch (error) {
      console.error('Error getting orders from Firebase:', error);
      // Fallback to local storage
      const localStorage = new LocalStorageAdapter();
      return await localStorage.getAllOrders();
    }
  }

  async syncPendingOrders() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    try {
      await this.initialize();

      for (const order of this.syncQueue) {
        await this.saveOrder(order);
      }
      this.syncQueue = [];
      console.log('Pending orders synced successfully');
    } catch (error) {
      console.error('Error syncing pending orders:', error);
    }
  }

  // Real-time listener for orders (admin only)
  onOrdersUpdate(callback) {
    if (!this.isOnline) return null;

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
      console.error('Error setting up real-time listener:', error);
      return null;
    }
  }

  // Authentication methods
  async signInAdmin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Admin sign-in error:', error);
      throw error;
    }
  }

  async signOutAdmin() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Admin sign-out error:', error);
      throw error;
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  // Menu management
  async saveMenuItem(item) {
    try {
      await this.initialize();
      const docRef = await addDoc(collection(db, MENU_COLLECTION), item);
      return docRef.id;
    } catch (error) {
      console.error('Error saving menu item:', error);
      throw error;
    }
  }

  async getMenuItems() {
    try {
      await this.initialize();
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
}

// Fallback local storage adapter
class LocalStorageAdapter {
  async saveOrder(order) {
    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem('tuckshop_orders', JSON.stringify(orders));
    return Date.now().toString();
  }

  async getAllOrders() {
    const stored = localStorage.getItem('tuckshop_orders');
    return stored ? JSON.parse(stored) : [];
  }
}

// Export the Firebase storage instance
export const firebaseStorage = new FirebaseStorage();