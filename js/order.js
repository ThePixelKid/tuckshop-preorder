// Using IndexedDB for robust local storage with localStorage fallback
import { cart } from "./menu.js";

const ORDER_OPEN = 5;
const ORDER_CLOSE = 9;

const DB_NAME = 'TuckShopDB';
const DB_VERSION = 1;
const ORDERS_STORE = 'orders';

// Check if IndexedDB is supported
const indexedDBSupported = (() => {
  try {
    return !!window.indexedDB;
  } catch (e) {
    return false;
  }
})();

// Fallback storage using localStorage
class LocalStorageFallback {
  async saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    return orders.length - 1; // Return index as ID
  }

  async getAllOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }

  async checkExistingOrderToday(studentName) {
    const orders = await this.getAllOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter(order =>
      new Date(order.createdAt) >= today && order.studentName === studentName
    );
  }
}

// IndexedDB implementation
class IndexedDBStorage {
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create orders store if it doesn't exist
        if (!db.objectStoreNames.contains(ORDERS_STORE)) {
          const store = db.createObjectStore(ORDERS_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('studentName', 'studentName', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('form', 'form', { unique: false });
        }
      };
    });
  }

  async saveOrder(order) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ORDERS_STORE], 'readwrite');
      const store = transaction.objectStore(ORDERS_STORE);
      const request = store.add(order);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  }

  async getAllOrders() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ORDERS_STORE], 'readonly');
      const store = transaction.objectStore(ORDERS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  }

  async checkExistingOrderToday(studentName) {
    const orders = await this.getAllOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter(order =>
      new Date(order.createdAt) >= today && order.studentName === studentName
    );
  }
}

// Choose storage method
const storage = indexedDBSupported ? new IndexedDBStorage() : new LocalStorageFallback();

console.log(`Using ${indexedDBSupported ? 'IndexedDB' : 'localStorage'} for data storage`);

function isOrderingOpen() {
  // Temporarily disabled for testing
  return true;
}

function updateUI() {
  // Temporarily always open for testing
  document.getElementById("orderBtn").disabled = false;
  document.getElementById("statusMsg").innerText = "";
}

updateUI();

document.getElementById("orderBtn").onclick = async (event) => {
  event.preventDefault(); // Prevent form submission
  console.log("Order button clicked");
  const name = document.getElementById("studentName").value.trim();
  if (!name || Object.keys(cart).length === 0) {
    alert("Please enter your name and add items to cart");
    return;
  }

  // Temporarily disabled for testing
  // if (!isOrderingOpen()) {
  //   alert("Ordering is closed (5–9 AM)");
  //   return;
  // }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check for existing order today
  try {
    const todayOrders = await storage.checkExistingOrderToday(name);
    if (todayOrders.length > 0) {
      alert("You already ordered today");
      return;
    }
  } catch (error) {
    console.error("Error checking existing orders:", error);
    alert("Error checking existing orders. Please try again.");
    return;
  }

  // Save order
  const itemsText = Object.values(cart).map(item => `${item.name} ×${item.qty}`).join('; ');
  const newOrder = {
    studentName: name,
    form: document.getElementById("studentForm").value,
    itemsText: itemsText,
    items: Object.values(cart),
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  try {
    await storage.saveOrder(newOrder);
    console.log(`Order saved to ${indexedDBSupported ? 'IndexedDB' : 'localStorage'}`);

    // Clear cart after successful order
    Object.keys(cart).forEach(key => delete cart[key]);
    localStorage.removeItem('tuckshopCart');
    window.location.href = "confirm.html";
  } catch (error) {
    console.error("Error saving order:", error);
    alert("Error saving order. Please try again.");
  }
};
