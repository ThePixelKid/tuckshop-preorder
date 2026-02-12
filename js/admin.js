// Admin Dashboard - Real-time Order Management
import { getAllOrders, onOrdersChange, deleteOrder, ORDERS_COLLECTION } from './firebase.js';
import { ADMIN_PW_HASH, ADMIN_PW_SALT } from './config.js';
import { MENU_DATA } from './menu.js';

// ============================================
// AUTHENTICATION
// ============================================

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function authenticateAdmin() {
  // Allow single-session auth per browser tab
  if (sessionStorage.getItem('tuckshopAdminAuth') === 'true') return;

  const pass = prompt('Enter Admin Password:');
  if (!pass) {
    alert('Invalid password. Redirecting...');
    window.location.href = 'index.html';
    return;
  }

  const candidateHash = await sha256Hex(pass + ADMIN_PW_SALT);
  if (candidateHash !== ADMIN_PW_HASH) {
    alert('Invalid password. Redirecting...');
    window.location.href = 'index.html';
    return;
  }

  // mark session as authenticated for this tab
  sessionStorage.setItem('tuckshopAdminAuth', 'true');
}

// Authenticate on page load
authenticateAdmin();

// ============================================
// DOM ELEMENTS
// ============================================

const filterSelect = document.getElementById('filter');
const ordersDiv = document.getElementById('orders');
const totalsDiv = document.getElementById('totals');
const priceSummaryDiv = document.getElementById('priceSummary');
const syncIndicator = document.getElementById('syncIndicator');
const syncText = document.getElementById('syncText');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

// ============================================
// STATE MANAGEMENT
// ============================================

let allOrders = [];
let unsubscribe = null;

// ============================================
// SYNC STATUS INDICATOR
// ============================================

function setSyncStatus(online, message) {
  if (online) {
    syncIndicator.textContent = '✅';
    syncIndicator.style.color = '#22c55e';
  } else {
    syncIndicator.textContent = '⚠️';
    syncIndicator.style.color = '#ef4444';
  }
  syncText.textContent = message;
}

// Monitor online/offline status
window.addEventListener('online', () => {
  setSyncStatus(true, 'Connected');
});

window.addEventListener('offline', () => {
  setSyncStatus(false, 'Offline');
});

// ============================================
// DATA LOADING AND RENDERING
// ============================================

/**
 * Group orders by date
 */
function groupOrdersByDate(orders) {
  const grouped = {};
  orders.forEach((order) => {
    const timestamp = order.createdAt?.toDate?.() || new Date(order.createdAt);
    const date = timestamp.toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(order);
  });
  return grouped;
}

/**
 * Apply filter to orders
 */
function applyFilter(orders) {
  const filterValue = filterSelect.value;
  if (filterValue === 'All') return orders;
  return orders.filter((order) => order.form === filterValue);
}

/**
 * Render orders to the DOM
 */
function renderOrders(orders) {
  ordersDiv.innerHTML = '';
  const filteredOrders = applyFilter(orders);
  
  if (filteredOrders.length === 0) {
    ordersDiv.innerHTML = '<p style="color: #666; text-align: center;">No orders found</p>';
    totalsDiv.innerHTML = '';
    return;
  }

  const grouped = groupOrdersByDate(filteredOrders);
  const totals = {};

  // Sort dates in reverse (newest first)
  Object.keys(grouped)
    .sort((a, b) => new Date(b) - new Date(a))
    .forEach((date) => {
      // Create date header
      const dateDiv = document.createElement('div');
      dateDiv.className = 'date-header';
      dateDiv.textContent = date;
      ordersDiv.appendChild(dateDiv);

      // Create date group container
      const dateGroup = document.createElement('div');
      dateGroup.className = 'date-group';

      grouped[date].forEach((order, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        const itemsText = order.itemsText || 'No items';
        const studentName = order.studentName || 'Unknown';
        const form = order.form || 'N/A';

        orderItem.innerHTML = `
          <div class="order-header">
            <div class="order-info">
              <strong>#${index + 1} ${studentName}</strong>
              <span class="order-form">${form}</span>
            </div>
            <button class="delete-btn" onclick="deleteOrderById('${order.id}')">🗑️</button>
          </div>
          <div class="order-items">${itemsText}</div>
        `;

        dateGroup.appendChild(orderItem);

        // Parse items for totals
        if (itemsText && itemsText !== 'No items') {
          const items = itemsText.split(';').map((item) => item.trim());
          items.forEach((itemText) => {
            const match = itemText.match(/(.+?)\s*×\s*(\d+)/);
            if (match) {
              const [, name, qty] = match;
              totals[name.trim()] = (totals[name.trim()] || 0) + parseInt(qty);
            }
          });
        }
      });

      ordersDiv.appendChild(dateGroup);
    });

  renderTotals(totals);
  renderPriceSummary(filteredOrders);
}

/**
 * Render totals summary
 */
function renderTotals(totals) {
  if (Object.keys(totals).length === 0) {
    totalsDiv.innerHTML = '<p style="color: #666;">No items to summarize</p>';
    return;
  }

  const totalsHtml = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, qty]) => `<div class="total-item"><span>${name}:</span> <strong>${qty}</strong></div>`)
    .join('');

  totalsDiv.innerHTML = totalsHtml;
}

/**
 * Render price summary for all orders
 */
function renderPriceSummary(orders) {
  const filteredOrders = applyFilter(orders);
  
  if (filteredOrders.length === 0) {
    priceSummaryDiv.innerHTML = '<p style="color: #666;">No orders to calculate</p>';
    return;
  }

  // Create price map
  const priceMap = {};
  MENU_DATA.forEach(item => {
    priceMap[item.name] = item.price;
  });

  // Calculate per-order totals and overall revenue
  const orderSummaries = [];
  let totalRevenue = 0;

  filteredOrders.forEach((order, idx) => {
    let orderTotal = 0;
    const itemsText = order.itemsText || 'No items';
    
    if (itemsText && itemsText !== 'No items') {
      const items = itemsText.split(';').map(item => item.trim());
      items.forEach(itemText => {
        const match = itemText.match(/(.+?)\s*×\s*(\d+)/);
        if (match) {
          const [, name, qty] = match;
          const itemName = name.trim();
          const itemPrice = priceMap[itemName] || 0;
          orderTotal += itemPrice * parseInt(qty);
        }
      });
    }

    totalRevenue += orderTotal;
    const studentName = order.studentName || 'Unknown';
    orderSummaries.push({
      student: studentName,
      form: order.form || 'N/A',
      total: orderTotal,
      idx: idx + 1
    });
  });

  // Sort by price descending
  orderSummaries.sort((a, b) => b.total - a.total);

  // Render summary
  const summaryHtml = `
    <div class="price-header">
      <strong>Total Revenue: ₦${totalRevenue.toLocaleString()}</strong>
      <span style="color: #999;">${filteredOrders.length} orders</span>
    </div>
    <div class="price-list">
      ${orderSummaries.map(s => `
        <div class="price-item">
          <div class="price-info">
            <span><strong>#${s.idx} ${s.student}</strong></span>
            <span style="color: #999; font-size: 13px;">${s.form}</span>
          </div>
          <span class="price-amount">₦${s.total.toLocaleString()}</span>
        </div>
      `).join('')}
    </div>
  `;

  priceSummaryDiv.innerHTML = summaryHtml;
}

/**
 * Delete order by ID
 */
async function deleteOrderById(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) return;

  try {
    await deleteOrder(orderId);
    console.log('Order deleted:', orderId);
  } catch (error) {
    console.error('Error deleting order:', error);
    alert('Failed to delete order');
  }
}

// Make function globally available
window.deleteOrderById = deleteOrderById;

// ============================================
// EVENT LISTENERS
// ============================================

filterSelect.addEventListener('change', () => {
  renderOrders(allOrders);
});

exportBtn.addEventListener('click', () => {
  if (allOrders.length === 0) {
    alert('No orders to export');
    return;
  }

  const dataStr = JSON.stringify(allOrders, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const orders = JSON.parse(text);

    if (!Array.isArray(orders)) {
      alert('Invalid JSON format. Expected an array of orders.');
      return;
    }

    alert(`Ready to import ${orders.length} orders. This feature requires backend implementation.`);
    // TODO: Implement import functionality with backend
  } catch (error) {
    alert('Error reading file: ' + error.message);
  } finally {
    importFile.value = '';
  }
});

// ============================================
// INITIALIZATION
// ============================================

async function initializeDashboard() {
  try {
    setSyncStatus(true, 'Connecting...');

    // Set up real-time listener
    unsubscribe = onOrdersChange((orders) => {
      allOrders = orders;
      renderOrders(orders);
      setSyncStatus(true, 'Connected - Real-time sync active');
      console.log('Orders updated:', orders.length);
    });

    // Load initial data
    const initialOrders = await getAllOrders();
    allOrders = initialOrders;
    renderOrders(initialOrders);
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    setSyncStatus(false, 'Connection failed');
    alert('Failed to load orders. Check console for details.');
  }
}

// Initialize on page load
initializeDashboard();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (unsubscribe) unsubscribe();
});
