// Ensure Firebase is initialized and connected
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
const db = getFirestore();

import { API_URL } from './config.js';

const pass = prompt("Admin password");
if (pass !== "EdgeAdmin") {
  window.location.href = "index.html";
}

const ordersDiv = document.getElementById("orders");
const totalsDiv = document.getElementById("totals");
const filter = document.getElementById("filter");

async function loadOrders() {
  const formFilter = filter.value;
  try {
    const response = await fetch(API_URL);
    const allOrders = await response.json();
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
    ordersDiv.innerHTML = "<p>Error loading orders</p>";
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
      if (order.itemsText) {
        const items = order.itemsText.split('; ');
        items.forEach(itemText => {
          const match = itemText.match(/(.+) ×(\d+)/);
          if (match) {
            const [, name, qty] = match;
            totals[name] = (totals[name] || 0) + parseInt(qty);
          }
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
