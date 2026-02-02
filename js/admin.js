import { supabase } from "./firebase.js";

const pass = prompt("Admin password");
if (pass !== "tuckshop123") {
  window.location.href = "/";
}

const ordersDiv = document.getElementById("orders");
const totalsDiv = document.getElementById("totals");
const filter = document.getElementById("filter");

async function loadOrders() {
  const pickup = filter.value;
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('pickupTime', pickup)
    .order('createdAt', { ascending: true });
  if (error) {
    console.error("Error loading orders:", error);
    ordersDiv.innerHTML = "<p>Error loading orders</p>";
    return;
  }
  renderOrders(data);
}

function renderOrders(data) {
  ordersDiv.innerHTML = "";
  const totals = {};

  data.forEach((order, i) => {
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

  renderTotals(totals);
}

function renderTotals(totals) {
  totalsDiv.innerHTML = Object.entries(totals)
    .map(([k, v]) => `<div>${k}: ${v}</div>`)
    .join("");
}

filter.onchange = () => loadOrders();
loadOrders();
