// Removed Supabase import - using localStorage for orders
import { cart } from "./menu.js";

const ORDER_OPEN = 5;
const ORDER_CLOSE = 9;

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

  // Check for existing order today (local check)
  const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const todayOrders = existingOrders.filter(order => 
    new Date(order.createdAt) >= today && order.studentName === name
  );
  if (todayOrders.length > 0) {
    alert("You already ordered today");
    return;
  }

  // Save order to localStorage
  const newOrder = {
    studentName: name,
    form: document.getElementById("studentForm").value,
    items: Object.values(cart),
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  existingOrders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(existingOrders));

  console.log("Order saved locally");
  // Clear cart after successful order
  Object.keys(cart).forEach(key => delete cart[key]);
  localStorage.removeItem('tuckshopCart');
  window.location.href = "confirm.html";
};
