// Using IndexedDB for robust local storage with localStorage fallback

const pass = prompt("Admin password");
if (pass !== "EdgeAdmin") {
  window.location.href = "index.html";
}

const ordersDiv = document.getElementById("orders");
const totalsDiv = document.getElementById("totals");
const filter = document.getElementById("filter");

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
  async getAllOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
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
}

// Choose storage method
const storage = indexedDBSupported ? new IndexedDBStorage() : new LocalStorageFallback();

console.log(`Admin using ${indexedDBSupported ? 'IndexedDB' : 'localStorage'} for data storage`);

async function loadOrders() {
  const formFilter = filter.value;

  try {
    const allOrders = await storage.getAllOrders();
    const filteredOrders = formFilter === 'All' ? allOrders : allOrders.filter(order => order.form === formFilter);

    // Group by date
    const grouped = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(order);
    });

    renderOrders(grouped);
  } catch (error) {
    console.error('Error loading orders:', error);
    ordersDiv.innerHTML = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">Error loading orders: ${error.message}<br><small>Check console for details</small></p>`;
  }
}

function renderOrders(grouped) {
  ordersDiv.innerHTML = "";
  const allOrders = Object.values(grouped).flat();
  const totals = {};

  // Render by date
  Object.keys(grouped).sort().forEach(date => {
    const dateDiv = document.createElement("div");
    dateDiv.innerHTML = `<h3>${date}</h3>`;
    ordersDiv.appendChild(dateDiv);

    grouped[date].forEach((order, i) => {
      const div = document.createElement("div");
      div.className = "order-item";
      div.innerHTML = `
        <strong>#${i + 1} ${order.studentName} (${order.form})</strong><br>
        ${order.itemsText || 'No items'}
      `;
      ordersDiv.appendChild(div);

      // Parse items for totals
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          totals[item.name] = (totals[item.name] || 0) + item.qty;
        });
      }
    });
  });

  renderTotals(totals);
}

function renderTotals(totals) {
  totalsDiv.innerHTML = Object.entries(totals)
    .map(([k, v]) => `<div>${k}: ${v}</div>`)
    .join("");
}

filter.onchange = () => loadOrders();
loadOrders();
