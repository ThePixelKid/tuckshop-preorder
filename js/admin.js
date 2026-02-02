// Admin dashboard with Firebase authentication and real-time sync
import { firebaseStorage } from "./firebase.js";

const ordersDiv = document.getElementById("orders");
const totalsDiv = document.getElementById("totals");
const filter = document.getElementById("filter");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Authentication state
let isAuthenticated = false;
let realtimeListener = null;

// Initialize admin authentication
async function initializeAdmin() {
  try {
    console.log('Initializing admin authentication...'); // Debug log

    // Test Firebase connection
    console.log('Testing Firebase connection...'); // Debug log
    await firebaseStorage.initialize();
    console.log('Firebase initialized successfully'); // Debug log

    // Check if user is already authenticated
    const user = firebaseStorage.getCurrentUser();
    if (user) {
      isAuthenticated = true;
      console.log('Admin already authenticated:', user.email);
      initializeAdminDashboard();
      return;
    }

    console.log('No authenticated user, showing login form'); // Debug log
    // Show login form
    showLoginForm();
  } catch (error) {
    console.error('Authentication initialization failed:', error);
    showLoginForm();
  }
}

// Show login form
function showLoginForm() {
  const loginHtml = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
      ">
        <h2 style="margin-top: 0; color: #1e40af;">Admin Login</h2>
        <form id="loginForm">
          <div style="margin-bottom: 15px;">
            <input
              type="email"
              id="adminEmail"
              placeholder="Admin Email"
              required
              style="
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
              "
            >
          </div>
          <div style="margin-bottom: 20px;">
            <input
              type="password"
              id="adminPassword"
              placeholder="Password"
              required
              style="
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
              "
            >
          </div>
          <button
            type="submit"
            style="
              width: 100%;
              padding: 12px;
              background: linear-gradient(45deg, #1e40af, #f59e0b);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              transition: background 0.3s;
            "
          >
            Login
          </button>
        </form>
        <div id="loginError" style="color: red; margin-top: 10px; display: none;"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', loginHtml);

  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    console.log('Login attempt:', email); // Debug log

    try {
      loginError.style.display = 'none';
      console.log('Calling firebaseStorage.signInAdmin...'); // Debug log
      await firebaseStorage.signInAdmin(email, password);
      console.log('Login successful!'); // Debug log
      document.body.removeChild(document.querySelector('div[style*="position: fixed"]'));
      initializeAdminDashboard();
    } catch (error) {
      console.error('Login failed:', error); // Debug log
      loginError.textContent = error.message;
      loginError.style.display = 'block';
    }
  };
}

// Initialize admin dashboard after authentication
function initializeAdminDashboard() {
  console.log('Initializing admin dashboard');

  // Update sync status
  updateSyncStatus('connecting');

  // Set up real-time listener for orders
  setupRealtimeUpdates();

  // Load initial orders
  loadOrders();

  // Set up event listeners
  filter.onchange = () => loadOrders();

  // Export functionality
  exportBtn.onclick = async () => {
    try {
      const orders = await firebaseStorage.getAllOrders();
      const dataStr = JSON.stringify(orders, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `tuckshop-orders-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Orders exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    }
  };

  // Import functionality
  importBtn.onclick = async () => {
    const file = importFile.files[0];
    if (!file) {
      alert('Please select a file to import');
      return;
    }

    try {
      const text = await file.text();
      const importedOrders = JSON.parse(text);

      if (!Array.isArray(importedOrders)) {
        throw new Error('Invalid file format');
      }

      // Validate order structure
      for (const order of importedOrders) {
        if (!order.studentName || !order.createdAt) {
          throw new Error('Invalid order data structure');
        }
      }

      // Save to Firebase
      for (const order of importedOrders) {
        await firebaseStorage.saveOrder(order);
      }

      alert('Orders imported successfully!');
      loadOrders(); // Refresh the display
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed: ' + error.message);
    }
  };
}

// Update sync status indicator
function updateSyncStatus(status, message = '') {
  const syncStatus = document.getElementById('syncStatus');
  const syncIndicator = document.getElementById('syncIndicator');
  const syncText = document.getElementById('syncText');

  syncStatus.className = 'sync-status';

  switch (status) {
    case 'connecting':
      syncStatus.classList.add('syncing');
      syncIndicator.textContent = '🔄';
      syncText.textContent = 'Connecting...';
      break;
    case 'online':
      syncStatus.classList.add('online');
      syncIndicator.textContent = '🟢';
      syncText.textContent = 'Online - Real-time sync active';
      break;
    case 'offline':
      syncStatus.classList.add('offline');
      syncIndicator.textContent = '🔴';
      syncText.textContent = 'Offline - Using local data';
      break;
    case 'syncing':
      syncStatus.classList.add('syncing');
      syncIndicator.textContent = '🔄';
      syncText.textContent = message || 'Syncing...';
      break;
    default:
      syncText.textContent = message || 'Unknown status';
  }
}

// Set up real-time updates
function setupRealtimeUpdates() {
  updateSyncStatus('connecting');

  realtimeListener = firebaseStorage.onOrdersUpdate((orders) => {
    console.log('Real-time orders update received');
    updateSyncStatus('online');
    loadOrdersFromData(orders);
  });

  // Check connection status
  setTimeout(() => {
    if (!realtimeListener) {
      updateSyncStatus('offline');
    }
  }, 5000);
}

// Load orders from provided data (used for real-time updates)
function loadOrdersFromData(allOrders) {
  const formFilter = filter.value;
  const filteredOrders = formFilter === 'All' ? allOrders : allOrders.filter(order => order.form === formFilter);

  // Group by date
  const grouped = {};
  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(order);
  });

  const totals = {};

  // Clear existing content
  ordersDiv.innerHTML = '';

  // Render by date
  Object.keys(grouped).sort().reverse().forEach(date => {
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

async function loadOrders() {
  try {
    const allOrders = await firebaseStorage.getAllOrders();
    loadOrdersFromData(allOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
    ordersDiv.innerHTML = '<div class="order-item">Error loading orders. Please try again.</div>';
  }
}

function renderTotals(totals) {
  totalsDiv.innerHTML = Object.entries(totals)
    .map(([k, v]) => `<div>${k}: ${v}</div>`)
    .join("");
}

// Listen for authentication state changes
firebaseStorage.onAuthStateChange((user) => {
  if (user) {
    isAuthenticated = true;
    console.log('User authenticated:', user.email);
  } else {
    isAuthenticated = false;
    console.log('User signed out');
    // Redirect to login if signed out
    if (window.location.pathname.includes('admin.html')) {
      initializeAdmin();
    }
  }
});

// Initialize on page load
initializeAdmin();
