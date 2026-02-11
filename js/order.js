// Order submission and management
import { addOrder, getAllOrders } from './firebase.js';
import { cart } from "./menu.js";

// TIME LIMIT DISABLED FOR TESTING
const ORDER_OPEN = 0; // Always open for testing
const ORDER_CLOSE = 24; // Always open for testing

function isOrderingOpen() {
  // Temporarily disabled - always return true for testing
  return true;
  // const now = new Date();
  // const hour = now.getHours();
  // return hour >= ORDER_OPEN && hour < ORDER_CLOSE;
}

function updateUI() {
  const open = isOrderingOpen();
  const btn = document.getElementById("orderBtn");
  const msg = document.getElementById("statusMsg");

  if (open) {
    btn.disabled = false;
    msg.innerText = "Ordering System - TESTING MODE (No Time Limit)";
    msg.style.color = "#10b981";
  } else {
    btn.disabled = true;
    msg.innerText = "Ordering is closed (available 5-9 PM daily)";
    msg.style.color = "#ef4444";
  }
}

updateUI();

document.getElementById("orderBtn").onclick = async (event) => {
  event.preventDefault();
  console.log("Order button clicked");
  const name = document.getElementById("studentName").value.trim();
  if (!name || Object.keys(cart).length === 0) {
    alert("Please enter your name and add items to cart");
    return;
  }

  // Temporarily disabled for testing
  // if (!isOrderingOpen()) {
  //   alert("Ordering is closed (5–9 PM)");
  //   return;
  // }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check for existing order today (fetch from Firebase)
  try {
    const allOrders = await getAllOrders();
    const todayOrders = allOrders.filter(order => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && order.studentName === name;
    });
    if (todayOrders.length > 0) {
      alert("You already ordered today");
      return;
    }
  } catch (error) {
    console.error("Error checking existing orders:", error);
    alert("Error checking orders. Please try again.");
    return;
  }

  // Save order to Firebase
  const itemsText = Object.values(cart).map(item => `${item.name} ×${item.qty}`).join('; ');
  const newOrder = {
    studentName: name,
    form: document.getElementById("studentForm").value,
    itemsText: itemsText,
    status: "Pending"
  };

  try {
    await addOrder(newOrder);
    console.log("Order saved to Firebase successfully");
    // Clear cart after successful order
    Object.keys(cart).forEach(key => delete cart[key]);
    localStorage.removeItem('tuckshopCart');
    window.location.href = "confirm.html";
  } catch (error) {
    console.error("Error saving order:", error);
    alert("Error saving order. Please try again.");
  }
};
