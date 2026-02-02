// Removed Supabase import - using localStorage for orders

const pass = prompt("Admin password");
if (pass !== "EdgeAdmin") {
  window.location.href = "index.html";
}

const ordersDiv = document.getElementById("orders");
const totalsDiv = document.getElementById("totals");
const filter = document.getElementById("filter");

async function loadOrders() {
  const formFilter = filter.value;
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const filteredOrders = formFilter === 'All' ? allOrders : allOrders.filter(order => order.form === formFilter);
  
  // Group by date
  const grouped = {};
  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(order);
  });
  
  renderOrders(grouped);
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
        ${order.items.map(it => `${it.name} ×${it.qty}`).join("<br>")}
      `;
      ordersDiv.appendChild(div);

      order.items.forEach(it => {
        totals[it.name] = (totals[it.name] || 0) + it.qty;
      });
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
